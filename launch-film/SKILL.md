---
name: launch-film
description: Make a short, cinematic launch film for an AI model (speech, vision, any modality) out of the model's own real outputs - a title among images that flies into a real example, the example playing as light, a small symbolic network turning it into outputs, quick cuts across more examples, and an end card with the link. Every frame is HTML rendered deterministically to video, so it is precise, editable and re-renderable. Use when someone wants a launch video, release film, model teaser or "a video like the Hima one".
---

# Launch film

A 40-50 second film that makes a model feel like a discovery, built from the model's **real** outputs.
The reference is the Hima ASR launch film (a speech model): intro among images → one real noisy call
plays as light → the camera turns it into frames → a small network → transcript and decisions →
more languages → end card. Read `references/story.md` for that film beat by beat.

Everything is HTML/canvas rendered frame by frame in headless Chromium, then joined with ffmpeg.
No video editor. A frame is a pure function `render(t)`, so any shot can be re-rendered, retimed or
restyled in seconds and the result is identical every time.

## The five rules that made it work

1. **Real or nothing.** Every word, number, transcript and decision on screen is the model's actual
   output on the actual clip shown. Run the model on the exact mix you play (with the noise, the trim,
   the lead), not on a cleaner version. If a number would embarrass you, pick a different clip; never
   draw a bar by hand. `references/truth.md`.
2. **Stills before motion.** For any new look, render 2-6 still frames side by side and get a pick
   before rendering video. A still takes seconds; a render takes minutes; a wrong render costs trust.
3. **Judge type at phone size.** Most people watch on a phone where a 1920 px frame is ~390 px wide.
   Important text must be >= 40 px tall in the 1080p frame; long questions become short labels so they
   can be big. Check every text frame by shrinking it to 390 px wide. `references/look.md`.
4. **One world per beat, hard switches between worlds.** Each beat owns a palette (e.g. black + prism
   arc → saturated orange → cream with blue blooms). Inside a beat, motion is continuous; between beats,
   either a hard cut or a camera move *into* an object of the next world (the intro flies into a tile
   that *is* the first frame of the next shot).
5. **Compress time, not content.** A repeated beat (more languages, more examples) reuses the approved
   layout and steps, only faster. Never invent a simpler layout to save time.

## Workflow

1. **Gather truth first** (`references/truth.md`): pick 1 hero example + 3-4 quick ones, short
   (3-5 s each), trimmed tight. Run the model on the exact audio/video you will show; save the outputs as
   JSON next to the media. Check robustness (e.g. 10 noise placements) and only show what holds.
2. **Write the beats** (`references/story.md`) as one line each with durations. Show them to the person.
3. **Build each beat as its own HTML page** from `templates/`: `intro.html`, `network.html`,
   `endcard.html`. Each exposes `window.render(t)`, `window.DUR` and `window.ready`.
4. **Stills**: `node render.js stills 1.2,3.5,5.0` per page; put them on one page for a pick.
5. **Render**: `node render.js film part.mp4` per page, all pages in parallel (background jobs).
6. **Join + sound** (`templates/join.sh`): concat the parts, lay the real audio at the right offsets, duck
   the music under speech, encode a web copy (<15 MB) and, on request, a lossless master.
7. **Check** every cut and every text frame at phone width before calling it done.

## Templates

| File | What it is |
|---|---|
| `templates/render.js` | Playwright driver: `stills t1,t2,...` or `film out.mp4`; PNG frames piped to ffmpeg |
| `templates/intro.html` | title + lines appearing one beat apart, image tiles drifting around a prism arc, camera flies into one tile |
| `templates/network.html` | input strip lights up as the sound plays, frames pour into a small symbolic network over a softly blended pre-neural diagram, two output streams, transcript + decision bars |
| `templates/endcard.html` | black + prism arc, every supported language in its own script, name, two lines, link |
| `templates/make_grounds.py` | the prism-arc ground and the cream/blue bloom ground (pure numpy) |
| `templates/gen_diagrams.py` | pre-neural speech diagrams (vowel space, HMM, DTW, Viterbi, source-filter, vocoder) as SVG that draw themselves on |
| `templates/join.sh` | concat parts + audio mix + web and master encodes |

Install once: `npm i -g playwright && npx playwright install chromium`, plus `ffmpeg` and Python with
`numpy pillow`. Fonts: Instrument Serif, IBM Plex Mono and the Noto Serif family for each
script you show (download the woff2 files locally so renders never depend on the network).

## Read next

- `references/story.md` - the beat structure and why each beat exists
- `references/look.md` - palettes, type sizes, backgrounds, motion, what to avoid
- `references/truth.md` - real clips, verifying outputs, robustness checks
- `references/pipeline.md` - deterministic rendering, parallel renders, joins, audio, sizes
- `references/lessons.md` - traps that cost real time
