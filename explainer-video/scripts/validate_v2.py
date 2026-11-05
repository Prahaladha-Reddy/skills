"""Check a rewritten narration plan against its original.
usage: python3 validate_v2.py <original plan.json> <new plan.json>
Errors (exit 1): non-say beat sequence changed, bad/dup/invented ids, beat length outside 12..48 words, digits/symbols,
banned names, numbers changed, total words outside 80..105%, point lost. Warnings: AI-slop phrases and repeated openers."""
import json, os, re, sys, collections
orig = json.load(open(sys.argv[1], encoding="utf-8"))["beats"]
new = json.load(open(sys.argv[2], encoding="utf-8"))["beats"]
err, warn = [], []
BANNED = r"\.py\b" + "".join("|" + l.strip() for l in (open("gate_names.txt") if os.path.exists("gate_names.txt") else []) if l.strip() and not l.startswith("#"))
def is_say(b): return "say" in b
def nonsay(bs): return [json.dumps(b, sort_keys=True) for b in bs if not is_say(b)]
def runs(bs):
    out, cur = [], []
    for b in bs:
        if is_say(b): cur.append(b)
        else: out.append(cur); cur = []
    out.append(cur); return out
if nonsay(orig) != nonsay(new): err.append("non-say beats changed (go/next/click/play/pause must be identical and in order)")
ro, rn = runs(orig), runs(new)
NUMW = r"\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|point|half|quarter)\b"
oid_all = [b["say"] for b in orig if is_say(b)]
ids = set()
for i, (a, b) in enumerate(zip(ro, rn)):
    if not a and not b: continue
    if a and not b: err.append(f"run {i} (starts {a[0]['say']}) has no say beat"); continue
    if b and not a: err.append(f"run {i}: say beats where the original had none"); continue
    aid = [x["say"] for x in a]
    if b[0]["say"] != aid[0]: err.append(f"run {i}: first id must be {aid[0]}, got {b[0]['say']}")
    for x in b:
        if x["say"] not in aid: err.append(f"run {i}: id {x['say']} is not from this run {aid}")
    if len(b) > max(2, (len(a) + 1) // 2 + 1) and len(b) > 3: warn.append(f"run {i} ({aid[0]}): {len(b)} beats, merge more")
    pts = [x.get("point") for x in a if x.get("point")]
    if pts and b[0].get("point") != pts[0]: err.append(f"run {i} ({aid[0]}): point {pts[0]!r} must be on the first say")
    na = collections.Counter(re.findall(NUMW, " ".join(x["text"] for x in a).lower()))
    nb = collections.Counter(re.findall(NUMW, " ".join(x["text"] for x in b).lower()))
    lost = {k: v - nb[k] for k, v in na.items() if nb[k] < v and k not in ("one", "point")}
    added = {k: v - na[k] for k, v in nb.items() if na[k] < v and k not in ("one", "point")}
    if lost: warn.append(f"run {i} ({aid[0]}): number words dropped {lost}  (check no figure was lost)")
    if added: warn.append(f"run {i} ({aid[0]}): number words added {added}  (check no figure was invented)")
for x in new:
    if not is_say(x): continue
    t = x["text"]; w = len(t.split())
    if x["say"] in ids: err.append(f"dup id {x['say']}")
    ids.add(x["say"])
    if not 12 <= w <= 48 and not (w < 12 and len(t) > 0 and len([y for y in new if is_say(y)]) < 6): err.append(f"{x['say']}: {w} words (need 12..48)")
    if not re.search(r"[.?!]\"?$", t.strip()): err.append(f"{x['say']}: does not end with a full sentence")
    if re.search(r"[%×→≈]|\d", t): err.append(f"{x['say']}: digit/symbol: {t[:70]}")
    if re.search(BANNED, t, re.I): err.append(f"{x['say']}: banned word")
wo = sum(len(b["text"].split()) for b in orig if is_say(b)); wn = sum(len(b["text"].split()) for b in new if is_say(b))
if not 0.80 * wo <= wn <= 1.05 * wo: err.append(f"total words {wn} vs original {wo} ({wn/wo:.0%}), need 80..105%")
SLOP = [r"\bhere'?s the (question|thing|idea|one idea|trick|key)", r"\blet'?s (dive|walk through|take a look|see what|break)", r"\bhold on to that",
        r"\bnext question\b", r"\btreat it as\b", r"\bkeep (that|this) in mind", r"\bremember this\b", r"\bcrucial(ly)?\b", r"\bessentially\b",
        r"\bsimply\b", r"\bmagic", r"\bseamless", r"\bpowerful\b", r"\bfascinating", r"\belegant", r"\bbeautiful", r"\bjourney\b", r"\bdelve",
        r"\bunder the hood", r"\bboils down", r"\bheart of\b", r"\bin other words\b", r"\bin short\b", r"\bthink of it as\b", r"\bimagine\b",
        r"\bcool part\b", r"\bpretty neat\b", r"\bnot just\b", r"\bit'?s not \w+(?: \w+)?, it'?s\b", r", not (in )?the\b"]
texts = [b["text"] for b in new if is_say(b)]
for pat in SLOP:
    hits = [t for t in texts if re.search(pat, t, re.I)]
    if hits: warn.append(f"slop {pat!r} x{len(hits)}: {hits[0][:80]}")
qa = sum(1 for t in texts if re.search(r"\?\s+\S", t) and re.match(r"^(so |now |and )?(what|why|how|where|which)\b", t, re.I))
if qa > max(1, len(texts) // 12): warn.append(f"self-answered questions: {qa} beats open with a question")
op = collections.Counter(re.match(r"\W*(\w+)", t).group(1).lower() for t in texts if re.match(r"\W*(\w+)", t))
filler = sum(op[k] for k in ("so", "now", "okay", "alright", "next"))
if filler > len(texts) / 5: warn.append(f"{filler} of {len(texts)} beats start with So/Now/Okay/Alright/Next (max {len(texts)//5})")
for k, v in op.most_common(3):
    if v > len(texts) / 6: warn.append(f"opener '{k}' starts {v} of {len(texts)} beats")
print(f"{sys.argv[2]}: says {len(oid_all)} -> {len(texts)}, words {wo} -> {wn} ({wn/max(wo,1):.0%}), errors {len(err)}, warnings {len(warn)}")
for e in err[:40]: print("  ERROR", e)
for w in warn[:40]: print("  warn ", w)
sys.exit(1 if err else 0)
