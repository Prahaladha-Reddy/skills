"""Second opinion on lines the transcriber flagged: an audio model hears the clip WITH its script and says whether a listener
would hear the script correctly. Transcriber spelling noise (DIT vs D i T, color/colour, 'four forty eight') is not an error.
usage: python3 -u judge_check.py <jobs.jsonl> <tts dir> [ids,comma,separated]   -> <tts dir>/_judge.json (merged)"""
import json, os, sys, base64, re, urllib.request, concurrent.futures as cf
key = ""
key = os.environ.get("OPENROUTER_API_KEY", "")
assert key, "set OPENROUTER_API_KEY"
jobs = {json.loads(l)["id"]: json.loads(l)["text"] for l in open(sys.argv[1], encoding="utf-8") if l.strip()}
d = sys.argv[2]
ids = sys.argv[3].split(",") if len(sys.argv) > 3 and sys.argv[3] else []
PROMPT = ("You are checking a text-to-speech clip for a narrated video. The intended script is:\n\"{t}\"\n"
          "Listen to the audio. Is every word of the script spoken so a normal listener would hear it correctly, with nothing "
          "dropped, swapped for a different word, garbled, or added? Letters spoken one by one (like 'D i T') and numbers said "
          "in words are expected. Ignore accent, pacing, pauses and sentences run together: only wrong, missing, garbled or extra WORDS count. Reply with ONLY JSON: {{\"ok\": true or false, \"issue\": \"<short description or empty>\"}}")
def one(i):
    p = os.path.join(d, i + ".wav")
    b64 = base64.b64encode(open(p, "rb").read()).decode()
    body = {"model": "google/gemini-2.5-pro", "max_tokens": 4000, "temperature": 0,
            "messages": [{"role": "user", "content": [{"type": "text", "text": PROMPT.format(t=jobs[i])},
                                                      {"type": "input_audio", "input_audio": {"data": b64, "format": "wav"}}]}]}
    for a in range(3):
        try:
            r = json.loads(urllib.request.urlopen(urllib.request.Request("https://openrouter.ai/api/v1/chat/completions", data=json.dumps(body).encode(),
                headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"}), timeout=180).read())
            c = (r["choices"][0]["message"].get("content") or "").strip()
            m = re.search(r"\{.*\}", c, re.S)
            if m:
                v = json.loads(m.group(0)); return dict(id=i, ok=bool(v.get("ok")), issue=v.get("issue", ""))
        except Exception as e:
            err = str(e)[:120]
    return dict(id=i, ok=None, issue="judge failed")  # never a pass by default
jp = os.path.join(d, "_judge.json"); old = {}
if os.path.exists(jp): old = {r["id"]: r for r in json.load(open(jp, encoding="utf-8"))}
with cf.ThreadPoolExecutor(max_workers=8) as ex:
    for r in ex.map(one, ids):
        r["text"] = jobs[r["id"]]; old[r["id"]] = r
        print(("OK  " if r["ok"] else "BAD ") + r["id"], "|", r["issue"], flush=True)
json.dump(list(old.values()), open(jp, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
bad = [i for i in ids if not old[i]["ok"]]
print("JUDGE_DONE", len(ids), "judged,", len(bad), "bad:", ",".join(bad), flush=True)
