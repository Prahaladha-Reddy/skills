# Narration v2: make it sound like a person, not an AI

The video drives the explainer site page by page. A voice reads every `say` beat. The viewer says the
pictures and the clicking are great, but two things are wrong:

1. **The words sound like AI.** Rhetorical question then answer, slogans, "here's the thing", recap lines.
2. **The delivery sounds robotic.** One cause is ours: lines were capped at 28 words, so thoughts were cut into
   fragments ("Her clip is already 256 frames," / "and the patch encoder joins...") and each fragment was
   rendered as a separate TTS call, with sentence-final intonation and a gap after it.

Your job: rewrite ONE plan file so it sounds like an engineer talking a colleague through their screen.

## Hard rules (the checker enforces these)

- **Do not touch any non-say beat.** Every `go`, `next`, `click`, `play`, `pause` beat stays exactly as it is, in the same order.
  The sequence of non-say beats in your output must be identical to the original.
- **Between two non-say beats there is a "run" of say beats.** Rewrite each run as 1 or 2 say beats (3 only if the run is long).
  Each say beat is 1 to 3 full sentences, **12 to 48 words**. A beat never ends mid-sentence. One beat = one TTS call, so a
  whole thought gets one natural intonation.
- **ids:** a beat keeps the id of the first original line it replaces. If a run becomes two beats, the second one takes the id of
  the original line where that part starts. Never invent ids. Never reuse an id.
- **point:** if any say in the original run had a `point` key, put that same `point` on the FIRST say beat of the run.
- **Facts:** every number and every claim must stay exactly as in the original line. Do not add any fact, number, comparison or
  claim that is not in the original narration or in that page's text in `site/p*.html`. Keep every caveat ("one run", "one clip",
  "no listening test", "probably", "we did not test it"). Caveats are facts, not filler.
- **TTS spelling:** numbers stay in words ("nine hundred and sixty"). No digits, no `%`, `×`, `→`, `≈`. Keep the spoken spellings
  the original uses: "CAM plus plus", "Wave L M", "D i T", etc. Copy them exactly.
- Never write any name or figure on your private gate lists (`gate_names.txt`, `gate_numbers_spoken.txt`), or any `.py` file name.
- Total words: 80% to 105% of the original file.

## What makes it sound like AI (remove these)

- A question you answer yourself straight away ("So what does zero-shot mean? It means..."). At most one per page.
- Signposts: "Here's the question/thing/idea", "Let's dive in", "Let's walk through it", "Let's take a look", "Let's see what",
  "Hold on to that", "Next question:", "Treat it as a hint", "Keep that in mind", "Remember this".
- Slogans built on contrast: "X, not Y", "It's not X, it's Y", "not in the weights but in the input". Say the point plainly once.
- Rule of three for rhythm ("every page, every number, and every clip").
- Recap lines that repeat what the step just said. At most one takeaway per page, said plainly, near the end.
- Hype or feelings words: crucially, essentially, simply, magic, seamless, powerful, fascinating, elegant, beautiful, journey,
  delve, under the hood, boils down to, the heart of, in other words, in short, think of it as, imagine.
- Telling the viewer how to feel ("this is the cool part", "pretty neat").
- Dramatic fragments for emphasis ("Ten seconds, nothing more.", "None.", "Not a single step."). Rare, at most one per page.
- Starting many lines with "So", "Now", "Okay", "Alright", "Next". At most one beat in five may start with one of these.
- Over-tidy symmetry: every line the same length, every step opening the same way.

## What makes it sound like a person

- You are looking at the screen with the viewer. Name what is on screen by colour or position ("the yellow block on the right",
  "this top row") because the drawing changes at each step. Read the page's step text in `site/p*.html` to know what is visible.
- Mix long and short sentences. Join related short sentences with "and", "but", "because", "which", "so".
- Contractions (it's, that's, we've, doesn't). Plain everyday words.
- Concrete over abstract. A small honest aside is fine ("this one's easy to miss"). Do NOT invent personal stories or experiences.
- Transitions come from the content ("That's the width. Every position...") rather than from signposts.
- Say each thing once. If the original says it twice, keep the clearer one.

## Example of the change (style only, do not copy these phrases)

Before (six separate calls):
> So what does zero-shot mean? Zero training steps on her. The model is made of fixed numbers, called weights. / A weight is just a
> fixed number used in a weighted sum. Training chose them long ago. While cloning her, not one weight changes. / So what does
> change? Only two inputs: her clip and her transcript. / ... / So her voice lives in the input, not in the weights.

After (two calls, one per step):
> So, zero-shot. It means the model got no training on her at all. Everything it knows sits in its weights, which are just fixed
> numbers, and those were set long before anyone recorded this clip. Nothing in there changes while it clones her.

> What we do change is the input: her clip and her transcript. Give it a different person's ten seconds, and the exact same model
> sounds like them instead. So her voice isn't stored inside the model at all. It comes in with the clip.

## Process

1. Read this brief, your original plan file, and the matching page files in `site/`.
2. Write `video/plans_v2/<same file name>` as JSON `{"beats": [...]}` (2-space indent, UTF-8).
3. Run in the FOREGROUND: `python3 video/validate_v2.py video/plans/<file> video/plans_v2/<file>` from the `zs_explainer` folder.
   Fix every error and re-run until it passes. Read the warnings and fix the slop ones too.
4. Do this yourself. Do NOT launch or delegate to another agent. Do not run anything in the background.
   Do not edit any other file.
5. Report: lines before → after, words before → after, and 3 before/after pairs you think improved most.
