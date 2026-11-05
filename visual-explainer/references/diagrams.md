# Diagrams: patterns that carry an argument

Every figure answers its page's question. Before drawing, say in one sentence what the reader should
be able to point at afterwards. If you cannot, the drawing is decoration.

## Helper API (`kit/helpers.js`, all inside one shared IIFE)
```js
var s  = svgRoot(host, W, H, "one-line description for screen readers"); // clears host, resets steps
var ar = arrowDef(s, aid(), "var(--ink)");        // marker; pass {arrow: ar} to L()
st(k);                                            // everything created after this belongs to step k
R(s, x, y, w, h, fill, {rx, stroke, sw, dash, op});
L(s, x1, y1, x2, y2, stroke, {sw, dash, arrow});
T(s, x, y, "text", {size, anchor:"middle"|"end", fill, weight, family});
S("circle", {cx, cy, r, fill}, s);                // any SVG element
hover(el, "tooltip html");                        // or hover(el, function(){ return live text; })
seg("segId", function(d){ /* d = dataset of the pressed button */ });
fmt(12345) // "12,345"      rng(7) // seeded random      gauss(r) // normal sample
```

## Patterns that work
**Frame-by-frame timeline** — the strongest visual in this whole style. One coloured block per time
slice, a BEFORE row above an AFTER row, blue = working, red = the bug, green = correct. It has
repeatedly made a one-line fix obvious in seconds where two paragraphs failed.

**Flow with labelled arrows** — boxes for the parts that matter, arrows labelled with what actually
moves (`writes`, `invalidates`, `polls 30 s`). An unlabelled arrow says "related somehow".

**Ladder / chain** — bit 0 → bit 7, layer 1 → layer N, stage → stage, with the late one marked red.
Use when the point is that something accumulates or waits.

**Before / after pair** — the same drawing twice with exactly one thing different, side by side, and
the difference circled. Use whenever you are proposing a change.

**Scale strip** — a row of rectangles whose widths are the real ratio (1 ns vs 100 ns vs 10 ms).
Numbers lie flat; widths land.

**Live model + control** — a slider that re-runs a small model and redraws (see `kit/fA_demo.js`).
Keep the model in its own function so the drawing never invents numbers.

## Rules
- **viewBox, not pixels**: `svgRoot(host, 980, 380, …)` and let CSS scale it. Wide drawings go inside
  `.scroll`; the phone rule adds the swipe hint.
- **Label the marks, not a legend.** A legend means the reader must hold a mapping in their head.
- **Text on a fill**: `--move` and the pastels want `--ink`; `--slab` and dark fills want
  `--slab-ink`. The shell's contrast guard flips genuinely wrong ones at runtime, but do not rely on
  it — `contrast.js` must print 0 in *both* schemes.
- **Grid discipline**: shared baselines, equal gaps, aligned columns. Eyeballed offsets read as noise.
- **One claim per figure.** Two claims = two figures stacked in two `.figbox`es.
- **Step budget**: if a drawing needs more than ~7 reveals it is two drawings.
- Small multiples beat one dense chart: six tiny panels on one scale, not one panel with six series.
