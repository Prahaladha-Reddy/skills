"""Full explainer video: narration plans -> TTS -> voice check -> parallel recording per part -> MP4s -> one film + chapters.
usage: python3 -u build_video.py [--only-tts] [--segments A,T,...] [--par 3]
Reads plans/*.json (intro 00_intro.json, outro ZZ_outro.json, part plans), orders pages exactly as the built site does,
and writes build/<seg>.mp4, build/zs_full.mp4, build/chapters.txt."""
import json, os, re, subprocess, sys, glob, shutil, time
HERE = os.path.dirname(os.path.abspath(__file__)); os.chdir(HERE)
SITE = os.path.abspath("../site/dist/index.html"); TTS = os.path.abspath("tts_all"); B = os.path.abspath("build")
args = sys.argv[1:]
PAR = int(args[args.index("--par") + 1]) if "--par" in args else 3
ONLY = set(args[args.index("--segments") + 1].split(",")) if "--segments" in args else None
PW = os.environ.get("PW") or ("" if "--concat-only" in args else subprocess.run(["npm", "root", "-g"], capture_output=True, text=True, timeout=60).stdout.strip() + "/playwright")
os.makedirs(B, exist_ok=True)
def log(*a): print(time.strftime("%H:%M:%S"), *a, flush=True)

# ---- page order from the built site ----
html = open(SITE, encoding="utf-8").read()
order, part_of = [], {}
for m in re.finditer(r'<article class="page[^"]*" data-id="([^"]*)" data-part="([^"]*)"', html):
    order.append(m.group(1)); part_of[m.group(1)] = m.group(2)
log("site pages", len(order))

# ---- split every plan into page groups ----
groups, intro, outro = {}, [], []
for p in sorted(glob.glob("plans/*.json")):
    name = os.path.basename(p)
    if name.startswith("_"): continue
    beats = json.load(open(p))["beats"]
    if name.startswith("00_"): intro = beats; continue
    if name.startswith("ZZ_"): outro = beats; continue
    cur = None
    for b in beats:
        if "go" in b: cur = b["go"]; assert cur in part_of, f"{name}: unknown page {cur}"; assert cur not in groups, f"page {cur} narrated twice"; groups[cur] = []
        assert cur is not None, f"{name}: beat before first go"
        groups[cur].append(b)
missing = [pid for pid in order[1:] if pid not in groups]
log("narrated pages", len(groups), "missing", missing)

# ---- segments by part, in site order ----
segs, letters = [], {}
seq_letter = iter("ABCDEFGHIJKLMNOPQRS")
for pid in order[1:]:
    pt = part_of[pid]
    if pt not in letters: letters[pt] = "T" if pt == "The tools" else next(seq_letter)
    if pid not in groups: continue
    L = letters[pt]
    if not segs or segs[-1]["L"] != L: segs.append({"L": L, "part": pt, "beats": []})
    segs[-1]["beats"] += groups[pid]
segs.insert(0, {"L": "0", "part": "Intro", "beats": intro})
if outro: segs[-1]["beats"] += outro
for s in segs: log("segment", s["L"], s["part"], sum(1 for b in s["beats"] if "say" in b), "lines")

# ---- TTS + voice check (resumable), re-render flagged lines up to 2 rounds ----
jobs = [{"id": b["say"], "text": b["text"], "lang": "en"} for s in segs for b in s["beats"] if "say" in b]
assert len({j["id"] for j in jobs}) == len(jobs), "duplicate say ids across plans"
jp = os.path.join(B, "tts_jobs.jsonl")
with open(jp, "w") as f:
    for j in jobs: f.write(json.dumps(j, ensure_ascii=False) + "\n")
env = dict(os.environ, TTS_WORKERS=os.environ.get("TTS_WORKERS", "6"))
flagged = []
for rnd in range(0 if "--skip-voice" in args else 3):
    r = subprocess.run([sys.executable, "-u", "tts.py", jp, TTS], env=env, capture_output=True, text=True)
    log("tts round", rnd, r.stdout.strip().splitlines()[-1] if r.stdout.strip() else r.stderr[-300:])
    r = subprocess.run([sys.executable, "-u", "asr_check.py", jp, TTS], capture_output=True, text=True)
    log("asr round", rnd, r.stdout.strip().splitlines()[-1] if r.stdout.strip() else r.stderr[-300:])
    asr = {x["id"]: x for x in json.load(open(os.path.join(TTS, "_asr.json")))}
    sus = [i for i, x in asr.items() if x.get("err") or x["match"] < 0.9 or x["extra"] > 2]
    flagged = []
    if sus:
        r = subprocess.run([sys.executable, "-u", "judge_check.py", jp, TTS, ",".join(sus)], capture_output=True, text=True)
        log("judge round", rnd, r.stdout.strip().splitlines()[-1][:300] if r.stdout.strip() else r.stderr[-300:])
        jd = {x["id"]: x for x in json.load(open(os.path.join(TTS, "_judge.json")))}
        flagged = [i for i in sus if not jd.get(i, {}).get("ok")]
    if not flagged or rnd == 2: break
    log("re-rendering", len(flagged), "judge-confirmed lines:", ",".join(flagged[:20]))
    env["TTS_FORCE"] = ",".join(flagged)
env.pop("TTS_FORCE", None)
json.dump(flagged, open(os.path.join(B, "flagged_final.json"), "w"))
log("voice check done, still flagged:", len(flagged))
if "--only-tts" in args: sys.exit(0)

# ---- record segments in parallel ----
def seg_dir(s): return os.path.join(B, "seg_" + s["L"])
todo = [] if "--concat-only" in args else [s for s in segs if not ONLY or s["L"] in ONLY]
procs = []
for s in todo:
    d = seg_dir(s); shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
    json.dump({"beats": s["beats"]}, open(os.path.join(d, "plan.json"), "w"), indent=1)
pending = list(todo); running = []
while pending or running:
    while pending and len(running) < PAR:
        s = pending.pop(0); d = seg_dir(s)
        lf = open(os.path.join(d, "rec.log"), "w")
        p = subprocess.Popen(["node", "record.js", SITE, os.path.join(d, "plan.json"), TTS, os.path.join(d, "rec")], stdout=lf, stderr=subprocess.STDOUT, env=dict(os.environ, PW=PW))
        running.append((s, p, lf)); log("recording", s["L"])
    time.sleep(5)
    for s, p, lf in list(running):
        if p.poll() is not None:
            lf.close(); running.remove((s, p, lf)); tail = open(os.path.join(seg_dir(s), "rec.log")).read().strip().splitlines()[-1:]
            log("recorded", s["L"], "rc", p.returncode, tail)
            if p.returncode == 0:
                out = os.path.join(B, f"seg_{s['L']}.mp4")
                r = subprocess.run([sys.executable, "-u", "assemble.py", os.path.join(seg_dir(s), "rec"), TTS, os.path.abspath("../site"), out], capture_output=True, text=True)
                ok = r.returncode == 0 and os.path.exists(out)
                log("assembled", s["L"], "ok" if ok else "FAILED", (r.stdout + r.stderr).strip().splitlines()[-1:])
                if ok: shutil.rmtree(os.path.join(seg_dir(s), "rec", "frames"), ignore_errors=True)

# ---- concat + chapters ----
parts = [s for s in segs if os.path.exists(os.path.join(B, f"seg_{s['L']}.mp4"))]
if (ONLY is None or "--concat-only" in args) and len(parts) == len(segs):
    lst = os.path.join(B, "concat.txt")
    with open(lst, "w") as f:
        for s in parts: f.write(f"file 'seg_{s['L']}.mp4'\n")
    r = subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", "-movflags", "+faststart", os.path.join(B, "zs_full.mp4")], cwd=B)
    log("full film", "ok" if r.returncode == 0 else "FAILED")
    t, ch = 0.0, []
    nav = {m.group(1): m.group(2) for m in re.finditer(r'data-id="([^"]*)" data-part="[^"]*" data-nav="([^"]*)"', html)}
    for s in parts:
        dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", os.path.join(B, f"seg_{s['L']}.mp4")], capture_output=True, text=True).stdout)
        tl = json.load(open(os.path.join(seg_dir(s), "rec", "timeline.json")))
        first = True
        for g in tl.get("gos", []):
            if g["id"] == "": continue
            label = (f"{s['L']} · {s['part']}: " if first else "    ") + nav.get(g["id"], g["id"]); first = False
            ch.append((t + max(0, g["t"]), label))
        if s["L"] == "0": ch.insert(0, (0.0, "Intro"))
        t += dur
    def ts(x): x = int(x); return f"{x//3600}:{x%3600//60:02d}:{x%60:02d}" if x >= 3600 else f"{x//60}:{x%60:02d}"
    with open(os.path.join(B, "chapters.txt"), "w") as f:
        for x, lab in ch: f.write(f"{ts(x)} {lab.strip()}\n")
    log("chapters", len(ch), "total", ts(t))
log("BUILD_VIDEO_DONE")
