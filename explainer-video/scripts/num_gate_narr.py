"""Flag model-internal numbers in narration plans (spoken as words). usage: python3 num_gate_narr.py plan.json ..."""
import json, os, re, sys
BAD = [l.strip() for l in (open("gate_numbers_spoken.txt") if os.path.exists("gate_numbers_spoken.txt") else []) if l.strip() and not l.startswith("#")]  # one regex per line, e.g. two thousand and forty eight
n = 0
for p in sys.argv[1:]:
    for b in json.load(open(p, encoding="utf-8"))["beats"]:
        if "say" not in b: continue
        for pat in BAD:
            if re.search(pat, b["text"], re.I): n += 1; print(p.split("/")[-1], b["say"], f"[{pat}]", b["text"][:110]); break
print("NARR_GATE hits", n); sys.exit(1 if n else 0)
