# Writing: how deep, how plain, and what never to print

Lessons from a 46-page explainer whose reader said: "the visuals are top-notch, the explanations are
one-liners ... you split it down to the bottom, but it's not really the bottom."

## Depth: go to the bottom
- **The bottom is the operation, not its name.** "A weighted sum" is not the bottom; "multiply each
  input by its own fixed number and add the results" is. If a step uses a word the reader has not
  seen built on an earlier page, either build it there or add a tool page for it.
- **Add a toolbox chapter** right after the first "what it does" chapter. It teaches, once, the few
  operations every later page leans on (weighted sum, attention, similarity, squash to 0-1, noise and
  small steps), each with a toy example the reader can poke. Later pages then say "a weighted sum
  (Toolbox T2)" instead of re-explaining.
- **Each step: 2-4 sentences.** One says what appears on the drawing, one says what it does, one says
  why it matters or what it leads to. A one-line step is a caption, not an explanation.
- **Show the real data from one real run** (the actual clip, the actual intermediate values), and
  label honestly: "one clip, one run, no listening test". Caveats are facts; keep every one.
- **Write a deep script per part first** (briefs/deep/<part>.md), then convert it to pages. The script
  is where depth is decided; the page conversion is where it is cut to one screen per step.

## Plain words: ASD-STE100 (Simplified Technical English) on the page
- Short sentences (aim <= 20 words), one idea each, active voice, present tense.
- One word for one meaning across the whole site. If it is a "patch" on page B5, it is never a
  "chunk" on page F2.
- Define a term the first time, in the step where it first appears.
- `ste_check.py` gates the build (long sentences, banned vague words). Run it on every page file.
- The page text stays STE. The **spoken narration of a video** is NOT STE: it must sound like a person
  (see the explainer-video skill). The two are written separately.

## What never goes on a public page (owner's standing rules)
- **No internal or base-model names**: not the upstream model, its codec, its LLM, or any code file
  name (`foo.py`). Name parts by what they do: "codec encoder", "backbone", "DiT".
- **No company product or version names** ("<Product> 2.5"). Say "the model".
- **No internal design numbers**: list widths, vocabulary size, layer/head counts, frame or patch
  durations, sample rates, compression ratios, codec and sampler settings, step counts, timings. Say
  what the number means instead ("a long list of numbers", "a short slice of sound", "a few layers").
  Allowed: the input clip length, the output length, judge scores and experiment results.
- Enforce, never trust: put the private names in `kit_v4/gate_names.txt` and the private numbers in
  `kit_v4/gate_numbers.txt` (both gitignored). `build.sh` fails on a name; `num_gate.js` renders every
  page with all steps and fails on a number. The number gate reads `textContent` minus `[hidden]`
  nodes, because `innerText` silently skips every step that is not the current one.
- When you remove a figure from text, also remove it from SVG labels, `.big` cards and any span a
  figure fills from data (`ZD.x.y`), and from code comments that ship in the page.

## Facts: build from code, check with a second reader
- The fact sheet is written from the CODE with a file:function citation per line, and the SHAPE after
  each tensor (`[B,3,2048] -> [B,12,1024]`). Prose like "repeated per frame" hides `repeat` vs
  `repeat_interleave`; a shape cannot.
- Before the first publish, run read-only fact-check agents (one per part) against the code and the
  data, then fix agents (one per part, editing only their own files). Two rounds found 27 and then
  more real errors on pages that had passed every render check.
