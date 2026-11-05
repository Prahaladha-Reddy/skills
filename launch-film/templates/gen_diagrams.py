"""Pre-neural speech recognition diagrams, drawn as ink on graph paper (226 x 420 portrait), for the backdrop behind the
network. Every stroke carries pathLength=1 so the page can draw it on. Vowel values: Peterson & Barney (1952) male means."""
import json, math

W, H = 226, 420
INK = '#2a2430'


def paper():
    g = ''.join(f'<line x1="{x}" y1="0" x2="{x}" y2="{H}"/>' for x in range(0, W + 1, 14))
    g += ''.join(f'<line x1="0" y1="{y}" x2="{W}" y2="{y}"/>' for y in range(0, H + 1, 14))
    return f'<rect width="{W}" height="{H}" fill="#ece4d6"/><g stroke="#b9c3cf" stroke-width=".4" opacity=".55">{g}</g>'


def P(d, w=1.1):
    return f'<path class="ink" pathLength="1" d="{d}" fill="none" stroke="{INK}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/>'


def T(x, y, s, size=7, anchor='middle', font="IBM Plex Mono", italic=False):
    st = 'font-style:italic;' if italic else ''
    return f'<text class="tx" x="{x}" y="{y}" font-family="{font}" font-size="{size}" text-anchor="{anchor}" fill="{INK}" style="{st}">{s}</text>'


def circle(cx, cy, r, w=1.1):
    return P(f'M{cx + r},{cy} A{r},{r} 0 1 1 {cx - r},{cy} A{r},{r} 0 1 1 {cx + r},{cy}', w)


def arrow(x0, y0, x1, y1, w=1.0):
    a = math.atan2(y1 - y0, x1 - x0); h = 5
    return P(f'M{x0},{y0} L{x1},{y1} M{x1},{y1} L{x1 - h * math.cos(a - .4)},{y1 - h * math.sin(a - .4)} M{x1},{y1} L{x1 - h * math.cos(a + .4)},{y1 - h * math.sin(a + .4)}', w)


def title(a, b):
    return T(W / 2, 22, a, 7.5) + T(W / 2, 34, b, 6)


def formants():
    V = [('i', 270, 2290), ('ɪ', 390, 1990), ('ɛ', 530, 1840), ('æ', 660, 1720), ('ʌ', 640, 1190), ('ɑ', 730, 1090),
         ('ɔ', 570, 840), ('ʊ', 440, 1020), ('u', 300, 870), ('ɝ', 490, 1350)]
    X = lambda f2: 30 + (2500 - f2) / (2500 - 700) * 170
    Y = lambda f1: 80 + (f1 - 200) / (800 - 200) * 280
    s = title('VOWEL SPACE', 'F1 × F2 · PETERSON & BARNEY 1952')
    s += P(f'M30,70 L30,370 L205,370') + T(118, 388, 'F2 (Hz) ← 2500 … 700', 6) + T(14, 220, 'F1', 6)
    for f in (2500, 1600, 700): s += P(f'M{X(f)},370 L{X(f)},374', .8)
    q = [V[0], V[3], V[5], V[8], V[0]]
    s += P('M' + ' L'.join(f'{X(f2):.1f},{Y(f1):.1f}' for _, f1, f2 in q), 1.3)
    for v, f1, f2 in V:
        s += circle(X(f2), Y(f1), 2.2, 1) + T(X(f2) + 7, Y(f1) + 3, v, 12, 'start', 'Instrument Serif', True)
    return s, 'vowel space · F1 × F2'


def hmm():
    s = title('HIDDEN MARKOV MODEL', 'LEFT-TO-RIGHT · ONE PHONEME')
    ys = [100, 210, 320]
    for i, y in enumerate(ys):
        s += circle(118, y, 22, 1.3) + T(118, y + 4, f's{i + 1}', 11, font='Instrument Serif', italic=True)
        s += P(f'M136,{y - 14} C178,{y - 40} 178,{y + 40} 136,{y + 14}') + arrow(150, y + 22, 137, y + 14)
        s += T(186, y + 3, f'a{i + 1}{i + 1}', 9, 'start', 'Instrument Serif', True)
        s += P(f'M96,{y} L40,{y}') + T(34, y - 6, f'b{i + 1}(o)', 8, 'end' if False else 'start', 'Instrument Serif', True)
        s += P(f'M28,{y + 24} Q38,{y + 4} 48,{y + 24}', .9)
    for i in range(2):
        s += arrow(118, ys[i] + 22, 118, ys[i + 1] - 23) + T(126, (ys[i] + ys[i + 1]) / 2 + 3, f'a{i + 1}{i + 2}', 9, 'start', 'Instrument Serif', True)
    s += arrow(118, 52, 118, 77) + arrow(118, 343, 118, 380)
    return s, 'hidden markov model · one phoneme'


def dtw():
    s = title('DYNAMIC TIME WARPING', 'TEMPLATE × INPUT · MIN COST PATH')
    x0, y0, cw, ch, nx, ny = 34, 60, 12, 20, 14, 15
    g = ''.join(f'M{x0 + i * cw},{y0} L{x0 + i * cw},{y0 + ny * ch} ' for i in range(nx + 1)) + ''.join(f'M{x0},{y0 + j * ch} L{x0 + nx * cw},{y0 + j * ch} ' for j in range(ny + 1))
    s += P(g, .45)
    path, i, j = [(0, 0)], 0, 0
    steps = [(1, 1), (1, 0), (1, 1), (0, 1), (0, 1), (1, 1), (1, 1), (1, 0), (1, 1), (0, 1), (1, 1), (1, 1), (0, 1), (1, 1), (1, 0), (1, 1), (0, 1), (1, 1)]
    for a, b in steps:
        if i + a < nx and j + b < ny: i, j = i + a, j + b; path.append((i, j))
    s += P('M' + ' L'.join(f'{x0 + (a + .5) * cw},{y0 + (b + .5) * ch}' for a, b in path), 2.2)
    for a, b in path: s += P(f'M{x0 + a * cw + 2},{y0 + b * ch + 2} h{cw - 4}', .6)
    s += T(x0 + nx * cw / 2, y0 + ny * ch + 18, 'input frames →', 7) + T(18, y0 + ny * ch / 2, 'template', 7)
    return s, 'dynamic time warping'


def viterbi():
    s = title('VITERBI TRELLIS', 'STATES × TIME · BEST PATH')
    xs = [50, 92, 134, 176]; ys = [100, 175, 250, 325]
    for t in range(3):
        for i in range(4):
            for j in range(4):
                s += P(f'M{xs[t] + 6},{ys[i]} L{xs[t + 1] - 6},{ys[j]}', .4)
    best = [0, 1, 1, 3]
    s += P('M' + ' L'.join(f'{xs[t]},{ys[best[t]]}' for t in range(4)), 2.4)
    for t in range(4):
        s += T(xs[t], 370, f't{t + 1}', 9, font='Instrument Serif', italic=True)
        for i in range(4): s += circle(xs[t], ys[i], 5.5, 1.1)
    for i in range(4): s += T(24, ys[i] + 3, f'q{i + 1}', 9, font='Instrument Serif', italic=True)
    s += T(W / 2, 395, 'δt(j) = max δt−1(i) · aij · bj(ot)', 7.5, font='Instrument Serif', italic=True)
    return s, 'viterbi trellis · best path'


def source_filter():
    s = title('SOURCE–FILTER MODEL', 'FANT 1960')
    imp = ''.join(f'M{40 + k * 16},128 L{40 + k * 16},96 ' for k in range(10))
    s += P('M32,128 L200,128', .8) + P(imp, 1.2) + T(W / 2, 145, 'glottal pulses  (voiced)', 7)
    s += arrow(113, 152, 113, 182)
    s += P('M48,186 h130 v62 h-130 Z', 1.3) + T(113, 212, 'vocal tract', 9, font='Instrument Serif', italic=True) + T(113, 228, 'H(z) = 1 / A(z)', 9, font='Instrument Serif', italic=True)
    s += arrow(113, 252, 113, 282)
    env = 'M30,360 ' + ' '.join(f'L{30 + k * 1.7:.1f},{360 - (28 * math.exp(-((k - 18) / 9) ** 2) + 20 * math.exp(-((k - 52) / 10) ** 2) + 12 * math.exp(-((k - 86) / 9) ** 2) + 4):.1f}' for k in range(101))
    s += P('M30,362 L206,362', .8) + P(env, 1.6) + T(W / 2, 380, 'speech spectrum · formants F1 F2 F3', 7)
    for k, f in ((18, 'F1'), (52, 'F2'), (86, 'F3')): s += T(30 + k * 1.7, 300, f, 8, font='Instrument Serif', italic=True)
    return s, 'source–filter model'


def vocoder():
    s = title('CHANNEL VOCODER', 'DUDLEY 1939 · FILTER BANK')
    s += T(24, 210, 'in', 9, font='Instrument Serif', italic=True) + P('M34,206 L52,206', 1)
    ys = [62 + k * 40 for k in range(8)]
    s += P('M52,' + str(ys[0] + 10) + ' L52,' + str(ys[-1] + 10), 1)
    for k, y in enumerate(ys):
        s += P(f'M52,{y + 10} L64,{y + 10}', 1) + P(f'M64,{y} h44 v20 h-44 Z', 1.1) + T(86, y + 13, f'BP{k + 1}', 6.5)
        s += P(f'M108,{y + 10} L124,{y + 10}', 1) + P(f'M124,{y} h28 v20 h-28 Z', 1.1) + T(138, y + 13, '|·|', 6.5)
        s += arrow(152, y + 10, 172, y + 10, .9) + P(f'M178,{y + 16} ' + ' '.join(f'L{178 + i * 4},{y + 16 - (6 + 5 * math.sin(k + i * 1.3))}' for i in range(8)), .9)
    s += T(W / 2, 395, 'band energies, 10 ms at a time', 7)
    return s, 'channel vocoder · filter bank'


out = []
for f in (formants, hmm, dtw, viterbi, source_filter, vocoder):
    body, cap = f()
    out.append(dict(svg=f'<svg viewBox="0 0 {W} {H}" width="100%" height="100%" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">{paper()}{body}</svg>', cap=cap))
open('diagrams.js', 'w').write('window.DIAG=' + json.dumps(out, ensure_ascii=False) + ';')
print(len(out), [o['cap'] for o in out])
