# The look

## Start from a mood board

Collect 8-12 images the person loves (paintings, macro photos, posters, gradients). Extract palettes
(`k-means` on each image, 6 colours). Every colour in the film should trace back to one of them. In the
reference: a Rothko orange field, a prism/rainbow arc on black, frosted-glass flowers, butterfly wings
(teal/rust, eyespot violet/gold), a cream-pink grain gradient.

## Worlds and palettes

| World | Ground | Ink | Accent |
|---|---|---|---|
| black prism | `#000` + soft rainbow arc (make_grounds.py) | warm white `#fffaf2` | deep red-orange `#e8370a` |
| Rothko | glowing orange rectangle on red (a generated painting) | cream `#fff4e2` | light bars `#ffd27a` |
| cream blooms | `#fdf1e8` + one blue bloom top-right, one in the far corner, warm orange centre | navy `#1c1a3e` | orange `#ee5a12`, cobalt `#2236b8` |

Rules that came from the person's eye, each after a failed attempt:
- **Pitch black means `#000`**, not a warm near-black; noise/grain only where there is light.
- **No dark halo behind titles.** Pick an accent colour that differs in *brightness* from what is behind
  it (on a beige arc band a bright orange vanishes; a deep red-orange reads).
- **No pale oval haze behind text inside a coloured bloom** - it reads as a ring. Move the bloom instead.
- **Keep data off saturated blooms.** Orange numbers on blue are weak; lay out the ground so every number
  sits on cream.
- **Backdrops blend, never sit on top.** A diagram behind the network is multiplied into the panel at
  ~0.6 opacity, grayscale, slightly blurred: "it's there, we know, but it doesn't catch the eye".
- **A panel with a subtle tint** (lavender `rgba(226,216,242,.86)`) under the network; never a plain box.

## Type

| Role | Font | Size in the 1080p frame |
|---|---|---|
| titles | Instrument Serif (italic for the name) | 118-152 px |
| key line | IBM Plex Mono, caps, letter-spacing .2em | 42-44 px |
| secondary lines | IBM Plex Mono caps | 32-34 px |
| transcripts | Noto Serif (per script) | 50 px (82+ px when zoomed) |
| decision labels | IBM Plex Mono caps, short ("♪ VOICE · EMOTION") | 24 px (≈36-50 px when zoomed) |
| decision answers / numbers | Instrument Serif | 40 / 50 px |

**The phone test is the only test**: shrink every frame with text to 390 px wide and read it. If you
cannot, it is too small. Write questions as labels ("WOMAN?", "EMOTION", "LANGUAGE") so they fit big.

## Motion

- Ease everything (cubic in-out); zoom in log space so a fly-in feels like flying, not sliding.
- One idea per second at most. Text appears one line per beat (~0.7 s apart).
- A fly-in overshoots the target by ~1% so no edge of the tile shows on the last frame.
- Things that are heard should *light up as they are heard* (waveform bars lit left→right in sync with
  the audio), and processing should start while the sound plays, not after.
- Grain: per-frame seeded noise canvas, `mix-blend-mode: overlay`, opacity ~0.18-0.22.

## Images for tiles

Use images you generated or own. Mixed sources look like a stock collage; one consistent set (same light,
same grain, same palette family) reads as a world. Spectrograms and data plots as tiles read as noise.
Anything from a mood board that is someone else's work needs rights before a public release.
