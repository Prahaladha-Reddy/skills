"""Transcribe each narration wav (Gemini via OpenRouter) and compare with the script. Flags lines that need a re-render.
usage: python3 -u asr_check.py <jobs.jsonl> <tts dir>   -> <tts dir>/_asr.json"""
import json, os, sys, base64, re, urllib.request, urllib.error, difflib, concurrent.futures as cf
key = ""
key = os.environ.get("OPENROUTER_API_KEY", "")
assert key, "set OPENROUTER_API_KEY"
print("key len", len(key), flush=True)
jobs = [json.loads(l) for l in open(sys.argv[1], encoding="utf-8") if l.strip()]; d = sys.argv[2]
SP = {"colour": "color", "colours": "colors", "grey": "gray", "backbone's": "backbones", "ms": "milliseconds", "percent": "percent", "lookback": "look back"}
def norm(s):
    s = s.lower().replace("-", " ").replace("'", "")
    s = re.sub(r"\b([a-z])\s(?=[a-z]\b)", r"\1", s)            # "d i t" -> "dit", "c l s" -> "cls"
    s = re.sub(r"[^a-z0-9 ]", " ", s)
    out = []
    for w in s.split():
        w = SP.get(w, w)
        if w in ("hundred", "and"): continue                   # Deepgram writes "nine sixty" for "nine hundred and sixty"
        out += w.split()
    return out
def one(j):
    p = os.path.join(d, j["id"] + ".wav")
    if not os.path.exists(p): return dict(id=j["id"], err="missing")
    bnd = "----zsx" + j["id"]
    data = open(p, "rb").read()
    parts = []
    for k, v in (("model", "deepgram/nova-3"), ("language", "en")):
        parts.append(f"--{bnd}\r\nContent-Disposition: form-data; name=\"{k}\"\r\n\r\n{v}\r\n".encode())
    parts.append(f"--{bnd}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"a.wav\"\r\nContent-Type: audio/wav\r\n\r\n".encode() + data + b"\r\n")
    body = b"".join(parts) + f"--{bnd}--\r\n".encode()
    txt, err = None, ""
    for a in range(3):
        try:
            r = urllib.request.urlopen(urllib.request.Request("https://openrouter.ai/api/v1/audio/transcriptions", data=body,
                headers={"Authorization": "Bearer " + key, "Content-Type": "multipart/form-data; boundary=" + bnd}), timeout=120)
            txt = json.loads(r.read()).get("text", ""); break
        except urllib.error.HTTPError as e:
            err = f"HTTP {e.code} {e.read()[:150]!r}"
        except Exception as e:
            err = str(e)[:150]
    if txt is None: return dict(id=j["id"], err=err)
    num = {"0":"zero","1":"one","2":"two","3":"three","4":"four","5":"five","6":"six","7":"seven","8":"eight","9":"nine"}
    a, h = norm(j["text"]), norm(txt)
    sm = difflib.SequenceMatcher(None, a, h); match = sum(x.size for x in sm.get_matching_blocks())
    return dict(id=j["id"], words=len(a), heard=len(h), match=round(match / max(1, len(a)), 3), extra=len(h) - match, asr=txt.strip())
rows = []
with cf.ThreadPoolExecutor(max_workers=int(os.environ.get("ASR_WORKERS", "16"))) as ex:
    for r in ex.map(one, jobs): rows.append(r)
json.dump(rows, open(os.path.join(d, "_asr.json"), "w", encoding="utf-8"), indent=1, ensure_ascii=False)
bad = [r for r in rows if r.get("err") or r["match"] < 0.9 or r["extra"] > 2]
for r in bad: print("FLAG", json.dumps(r, ensure_ascii=False)[:300], flush=True)
print("ASR_DONE", len(rows), "lines,", len(bad), "flagged", flush=True)
