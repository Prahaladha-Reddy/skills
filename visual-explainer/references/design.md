# Design system (already implemented in `kit/head.html`)

## Tokens — use these, never a hex value
| Token | Light | Dark | Means |
|---|---|---|---|
| `--canvas` / `--paper` / `--wash` | `#f6f3f1` / `#fff` / `#efebe7` | `#12110f` / `#1c1b19` / `#23211e` | page ground / card / inset |
| `--ink` / `--ink2` / `--ink3` | `#1d1c1a` / `#4e4d4d` / `#797776` | `#f1ece6` / `#c4bfb8` / `#8e8983` | text, secondary, labels |
| `--hair` | `#cecac8` | `#393632` | every border |
| `--slab` / `--slab-ink` | `#141312` / `#f6f3f1` | `#262420` / `#f1ece6` | the dark narration bar |
| `--learn` / `--learn-soft` | `#2b59d1` / `#cfdaf5` | `#7d9cf0` / `#24304f` | the idea being taught |
| `--good` / `--good-soft` | `#1f9d63` / `#d1ffca` | `#4fd08f` / `#1b3a2a` | better, correct, done |
| `--bad` / `--bad-soft` | `#e0543a` / `#ffd9cf` | `#ff7a5e` / `#44241d` | worse, broken, the defect |
| `--move` / `--move-ink` | `#fff100` / `#1d1c1a` | same | what is moving **right now** |
| `--frozen` / `--frozen-soft` | `#b9b5b1` / `#e6e2de` | `#5d5955` / `#2c2a27` | inactive, held, not yet |
| `--gold --sky --mint --coral` | pastels | deep tints | category fills (dark values matter) |

Rule: **a token used as a fill must have a dark value**, or every label drawn on it is unreadable at
night. That single omission is the most common way this style breaks.

## Type
- `--serif` Instrument Serif — page headline `h2`, figure titles `h3`, narration sentence. Italic
  `em` inside a headline is the coloured operative word.
- `--cond` Anton — big numbers only (`.stat b`, `.bignums b`, `.pcard .n`). Never body text.
- `--mono` JetBrains Mono — everything else, including all SVG labels. It is the page's body font;
  that is deliberate, it makes the site read like an instrument.
- Headline `max-width: 26ch`, prose `max-width: 62–80ch`, uppercase micro-labels at 10.5–11.5 px
  with `letter-spacing: .05em`.

## Components (class → when)
| Class | Use |
|---|---|
| `.figbox` | white card around a drawing. `.figbox + .figbox` stacks with a gap. |
| `.scroll` | wrap any drawing wider than a phone; adds the "swipe →" hint instead of cropping. |
| `.ctl` | one row of controls above the drawing: `input[type=range]`, `.btn`, `.seg`, `.readout`. |
| `.seg` | 2–4 mutually exclusive options; drive it with `seg(id, cb)`. |
| `.stat` / `.stats` | one big number + caption. `.stat b.blue/.grn/.red` colours the number. |
| `.bignums` | the dark slab of 3–5 headline numbers, for the cover or a part opener. |
| `.verdict good|bad` | the conclusion, stated. `<b>` inside is the verdict sentence. |
| `.diff` | two-column red/green before-after, `<mark>` the changed token. Code changes go here. |
| `.chip` | small inline tag: `.learn .frozen .good .bad .move`. |
| `.words` | opt-in prose, hidden until `w`. |
| `.src` | the citation line, `<code>` for paths. |
| `.crumb` | the small "what this page assumes" line above the headline. |
| `.pcard` / `#partCards` | the cover's part cards; the shell fills them from your pages. |

## Layout
- `.stage` = drawing column + `.side` column; it collapses to one column under 1180 px.
- The narration bar is injected into `.side` and pins to the bottom of the viewport on the active
  page — leave `padding-bottom` alone, the CSS already reserves the space.
- Phone: everything reflows to one column at 960 px; drawings keep their width inside `.scroll`.

## Motion
Only to show a mechanism (a value moving, a wave advancing), never as decoration. Respect
`prefers-reduced-motion` (already handled globally). Step reveal is the default animation and is
usually enough.
