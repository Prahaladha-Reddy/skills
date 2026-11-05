# Pipeline: HTML → frames → video

## Page contract

Each beat is one HTML page at 1920×1080 that defines:

```js
window.render = t => { /* set every style/canvas from t alone */ };
window.DUR = 6.5;          // seconds
window.ready = true;       // after fonts and images are loaded
```

`render(t)` must be a pure function of `t`: no timers, no `Date.now()`, no unseeded random. Use a seeded
generator for grain (`s = (s * 16807) % 2147483647`, seeded by the frame number). This makes renders
repeatable and lets you jump to any time for stills.

## Rendering

`templates/render.js` loads the page in headless Chromium (Playwright), waits for `window.ready`, then:
- `node render.js stills 1.2,3.5` - PNG stills for review
- `node render.js film out.mp4` - every frame at 30 fps, screenshotted as PNG and piped to ffmpeg

Pass page options in the query string via `Q="?t=B"` (themes, palettes) so one page renders variants.

Render beats **in parallel** as background jobs (`&` + `wait $P1 $P2 ...`, never a bare `wait` in a script
that tees its output). A 6 s beat renders in ~30-60 s on a laptop.

## Joining

`templates/join.sh` concatenates the parts with ffmpeg's `concat` filter (re-encoding, so parts with
different encoders join cleanly) and maps one prepared audio track:

- real clip audio placed at its exact start time in the film
- a music bed under everything, faded in, **ducked to ~15%** while a clip speaks, raised between beats
- normalise peak to 0.95

Encodes:
- web copy: `-crf 28 -maxrate 2.7M -bufsize 5.4M` (≈13 MB for 45 s) - fits chat apps and 15 MB upload limits
- master: lossless PNG frames, `-crf 14 -tune film`, AAC 320k (≈340 MB for 45 s) - for X/YouTube uploads

## Continuity tricks

- **Fly into a tile**: render the next beat's first frame to an image, use it as a tile in the current
  beat, and zoom the camera into it (log-space zoom, 1% overshoot). The cut is invisible.
- **Rotate and slice**: a full-screen image as N vertical strips inside one container; rotate the
  container -90°, then spread the strips with a small gap; each strip is one "frame".
- **Light as it plays**: keep two copies of the strip image (unlit, lit) and set each strip's lit opacity
  from `t / clipDuration` so the light front moves with the audio.
- **End in the next beat's layout**: the repeated beat starts exactly where the previous beat's camera
  pulled back to, so a cut between them reads as continuous.

## Checks before handing over

- Grab frames around every cut (`ffmpeg -ss T -frames:v 1`) and look at them.
- Shrink every text frame to 390 px wide and read it.
- Confirm duration, file size, and that audio and picture end together.
