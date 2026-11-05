"""ASD-STE100 (80%) gate for the explainer text. Checks the source pages p*.html (not SVG labels drawn by JS).
Errors (exit 1): a step sentence over 20 words; any other sentence over 25 words; a .words panel over 6 sentences.
Warnings: words the glossary in briefs/STE.md says not to use.   usage: python3 ste_check.py [files...]"""
import re, sys, glob, html
from html.parser import HTMLParser

LIMIT_STEP, LIMIT_DESC, MAX_SENT = 20, 25, 6
BANNED = {r'\butili[sz]e': 'use', r'\bapproximately\b': 'about', r'\bcommence': 'start', r'\bfacilitate': 'help',
          r'\bdemonstrate': 'show', r'\blatents?\b': 'frame(s)', r'\bchunks?\b': 'patch', r'\bLLM\b': 'backbone',
          r'\bvocoder\b': 'codec decoder', r'\bcfg scale\b': 'guidance strength w', r'\bspeaker embedding\b': 'fingerprint',
          r'\bhidden state\b': 'plan', r'\bWER\b': 'characters right', r'\baccuracy\b': 'characters right'}
CLASSES = {'cap': LIMIT_DESC, 'verdict': LIMIT_DESC, 'words': LIMIT_DESC, 'crumb': LIMIT_DESC, 'stat': LIMIT_DESC, 'lede': LIMIT_DESC, 'takeaway': LIMIT_DESC}


class P(HTMLParser):
    def __init__(self):
        super().__init__(); self.stack = []; self.items = []; self.buf = None
    def handle_starttag(self, tag, a):
        a = dict(a); cls = (a.get('class') or '').split()
        kind = None
        if tag == 'li' and any(s[1] == 'steps' for s in self.stack if s[0] == 'ol'): kind = ('step', LIMIT_STEP)
        for c in cls:
            if c in CLASSES and tag in ('p', 'div', 'span', 'aside'): kind = (c, CLASSES[c])
        if tag in ('code', 'script', 'style'): kind = ('skip', 0)
        self.stack.append((tag, 'steps' if 'steps' in cls else (kind[0] if kind else ''), kind))
        if kind and kind[0] != 'skip' and self.buf is None: self.buf = [kind, [], self.getpos()[0]]
    def handle_endtag(self, tag):
        if self.buf is not None and tag in ('b', 'p', 'div'): self.buf[1].append('. ')
        while self.stack:
            t, _, kind = self.stack.pop()
            if self.buf and kind is self.buf[0] and t == tag:
                self.items.append((self.buf[0][0], self.buf[0][1], ''.join(self.buf[1]), self.buf[2])); self.buf = None
            if t == tag: break
    def handle_data(self, d):
        if self.buf is not None and not any(s[2] and s[2][0] == 'skip' for s in self.stack): self.buf[1].append(d)


def sentences(t):
    t = re.sub(r'\s+', ' ', html.unescape(t)).strip()
    t = re.sub(r'([.!?])(\s*\.)+', r'\1', t); t = re.sub(r'^\.\s*|\s\.(?=\s)', ' ', t).strip()
    parts = re.split(r'(?<=[.!?।])\s+(?=[A-Z0-9"“(ऀ-ॿ])', t)
    return [p for p in parts if p.strip()]


def words(s): return [w for w in s.split() if re.search(r'\w', w)]


files = sys.argv[1:] or sorted(glob.glob('p[A-Z]*.html'))
err = warn = 0
for f in files:
    p = P(); p.feed(open(f, encoding='utf-8').read())
    for kind, lim, text, line in p.items:
        ss = sentences(text)
        if kind == 'words' and len(ss) > MAX_SENT:
            print(f'ERR  {f}:{line} [{kind}] {len(ss)} sentences (max {MAX_SENT})'); err += 1
        for s in ss:
            n = len(words(s))
            if n > lim: print(f'ERR  {f}:{line} [{kind}] {n} words > {lim}: {s[:110]}'); err += 1
            for pat, use in BANNED.items():
                if re.search(pat, s, re.I): print(f'WARN {f}:{line} [{kind}] "{re.search(pat, s, re.I).group(0)}" -> use "{use}": {s[:80]}'); warn += 1
print(f'STE {"OK" if err == 0 else "FAIL"}: {err} errors, {warn} warnings, {len(files)} files')
sys.exit(1 if err else 0)
