"""Render narration lines with any HTTP TTS that returns raw 16-bit mono PCM at 24 kHz. Resumable.
usage: python3 -u tts.py <jobs.jsonl> <outdir>      jobs rows: {"id":..., "text":..., "lang":"en"}
env:   TTS_ENDPOINT (POST url), TTS_API_KEY (Bearer), TTS_MODEL, TTS_VOICE, TTS_WORKERS (4), TTS_FORCE (ids to re-render)
Body sent: {"model","voice","language","text"}. Adapt one() if your provider differs. The key is never printed."""
import json, os, sys, time, urllib.request, urllib.error, wave, concurrent.futures as cf
EP = os.environ.get("TTS_ENDPOINT", ""); KEY = os.environ.get("TTS_API_KEY", "")
MODEL = os.environ.get("TTS_MODEL", ""); VOICE = os.environ.get("TTS_VOICE", "")
assert EP and KEY and VOICE, "set TTS_ENDPOINT, TTS_API_KEY and TTS_VOICE"
HDR = {"Authorization": f"Bearer {KEY}", "Content-Type": "application/json"}
def one(job, out):
    p = os.path.join(out, job["id"] + ".wav")
    b = json.dumps({"model": MODEL, "voice": VOICE, "language": job.get("lang", "en"), "text": job["text"]}).encode()
    for a in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(EP, data=b, method="POST", headers=HDR), timeout=240) as r: buf = r.read(); break
        except urllib.error.HTTPError as e:
            msg = e.read()[:200].decode("utf-8", "replace")
            if e.code in (429, 500, 502, 503, 504) and a < 3: time.sleep(3 * (a + 1)); continue
            return dict(id=job["id"], ok=False, err=f"HTTP {e.code} {msg}")
        except Exception as e:
            if a < 3: time.sleep(3); continue
            return dict(id=job["id"], ok=False, err=str(e)[:200])
    sec = len(buf) / 48000
    pk = max((abs(int.from_bytes(buf[i:i+2], "little", signed=True)) for i in range(0, len(buf) - 1, 2)), default=0)
    with wave.open(p + ".part", "wb") as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000); w.writeframes(buf)
    os.replace(p + ".part", p)
    return dict(id=job["id"], ok=sec > 0.5 and pk > 500, sec=round(sec, 2), peak=pk, words=len(job["text"].split()))
if __name__ == "__main__":
    jobs = [json.loads(l) for l in open(sys.argv[1], encoding="utf-8") if l.strip()]; out = sys.argv[2]; os.makedirs(out, exist_ok=True)
    rp = os.path.join(out, "_results.json"); old = {r["id"]: r for r in json.load(open(rp, encoding="utf-8"))} if os.path.exists(rp) else {}
    force = set(os.environ.get("TTS_FORCE", "").split(",")) - {""}
    todo = [j for j in jobs if j["id"] in force or not (old.get(j["id"], {}).get("ok") and old[j["id"]].get("text") == j["text"] and os.path.exists(os.path.join(out, j["id"] + ".wav")))]
    print("voice", VOICE, "todo", len(todo), "of", len(jobs), flush=True); rows = []
    with cf.ThreadPoolExecutor(max_workers=int(os.environ.get("TTS_WORKERS", "4"))) as ex:
        for j, r in zip(todo, ex.map(lambda j: one(j, out), todo)):
            r["text"] = j["text"]; rows.append(r); old[r["id"]] = r; print(json.dumps(r), flush=True)
    json.dump(list(old.values()), open(rp + ".tmp", "w", encoding="utf-8"), indent=1, ensure_ascii=False); os.replace(rp + ".tmp", rp)
    print("TTS_DONE ok", sum(r.get("ok", False) for r in rows), "of", len(rows), "this run;", len(old), "in results", flush=True)
