---
name: explainer-video
description: Turn a visual-explainer site (kit_v4 side-panel pages) into a long narrated walkthrough video for YouTube/LinkedIn - a TTS voice explains while a scripted cursor clicks through the real pages, points at what is new, circles chapters, plays the clips; then voice-checks every line, records in parallel, assembles, joins, and writes YouTube chapters. Use when someone wants "a video of the explainer", "narrate the site", "walkthrough video", or to re-record/fix part of such a video.
---

# Explainer video: a person walking through the site

The site already has the drawings; the video adds a voice and a hand. What the first viewer liked: "it feels
like a human is explaining step by step... clicking next... not just reading what's on the screen".
What they hated, in order: AI-sounding wording, robotic one-fragment-per-call delivery, dead screens.

## Pipeline (scripts/ in this folder; copy them next to the site)

```
plans/*.json ──► build_video.py ──► TTS (tts.py, any HTTP TTS, resumable, re-renders only changed text)
                                   ├► voice check: asr_check.py (Deepgram nova-3 via OpenRouter)
                                   │   → judge_check.py (Gemini 2.5 Pro hears clip + script) on flagged only
                                   │   → re-render judge-confirmed bad lines, up to 2 rounds
                                   ├► record.js per part, 3 in parallel (Playwright CDP screencast, 30 fps,
                                   │   1440x810 @ DSF 4/3 = 1920x1080, drawn cursor, presenter marks)
                                   ├► assemble.py (frames + every clip placed at its recorded time, H.264 crf18)
                                   └► concat → <name>_full.mp4 + chapters.txt (one line per page, part letter)
```

`python3 -u build_video.py [--segments A,T] [--skip-voice] [--concat-only] [--par 3]`.
Set `PW=<path to a global playwright install>` (bare `npm root -g` can hang for minutes), plus
`TTS_ENDPOINT`, `TTS_API_KEY`, `TTS_MODEL`, `TTS_VOICE` and `OPENROUTER_API_KEY` (voice check).

## Plan format (one file per part; see references/example_*.json)

| beat | what it does |
|---|---|
| `{"go":"pageId","step":1,"wait":0.9}` | jump to a page/step |
| `{"say":"ID","text":"...","point":"halo"}` | speak; cursor glides to the current step's halo, drifts while talking |
| `{"next":1}` | click the panel's Next button like a person |
| `{"play":{"sel":...,"file":"a/x.mp3","dur":7.4}}` | click a play button; the clip is mixed into the audio |
| `{"click":"sel"}` / `{"pause":0.6}` | click anything / wait |
| `{"say":...,"nowait":true}` + `{"sync":1}` | keep moving while a line plays; wait for it before the next |
| `{"hover":"sel","hold":1.4,"circle":true,"big":true,"noring":true}` | glide to an element and loop the cursor around it (`big` = around a whole group) |
| `{"sweep":"sel","hold":3}` | underline-sweep a title or a line of text |

Red hand-drawn presenter rings appear on `point`, only around SMALL targets (< 45 % of the screen).
Never ring a whole title or a big block. For a tour of cards, use the cursor `circle`, not rings.

## Writing the narration (the part that matters most)
Read `references/narration_rewrite_brief.md`. The short version:
- **Whole thoughts per call, 12-48 words, 1-3 sentences.** Splitting a sentence across calls gives
  every fragment a falling end-of-sentence tone: that, not the voice, made it sound robotic. The old
  28-word cap in the validator caused it.
- **Sound like an engineer at your shoulder:** contractions, name things by colour/position on screen,
  mixed sentence lengths. Cut: self-answered questions ("So what is X? X is..."), "Here's the thing",
  "Let's dive in", "X, not Y" slogans, tricolons, recap lines, hype words, dramatic fragments, many
  lines starting with So/Now/Okay. `validate_v2.py <old> <new>` enforces structure, numbers and slop.
- **Every line must match what is on screen at that moment.** In the intro especially: the voice and
  the cursor tell the same story (title sweep -> chapter cards circled -> Start).
- **Intro:** no "Hi". Get moving in the first second. A shape that worked: "we're going to learn how X
  works from scratch -> we split it into N chapters (scroll the chapter cards, one big circle around
  all of them) -> the explainer is a public website, link in the description -> let's start".
- Same secrecy rules as the site: no internal model names, no product/version names, no internal
  numbers. Put them in `gate_names.txt` / `gate_numbers_spoken.txt` (never commit them);
  `num_gate_narr.py plans/*.json` must print 0.
- A subagent rewrite brief must ban ONLY what the owner named (banning the word "billion" made agents
  write "seventeen hundred and twenty million").

## Voice
Let the owner pick the voice by ear: render the same two short passages (one idea, one with numbers) with
every voice the provider offers, on one listening page, plus a before/after of old vs new wording in one
voice. Spoken numbers are written in words; spell letter names ("D i T"). Deepgram writes "nine sixty"
for "nine hundred and sixty": the checker drops "hundred"/"and" before matching, and only the audio judge
can fail a line. A whole provider voice family returning `502 model_unavailable` instantly is a server
that is down, not a cold start: report it and move on.

## Running it on a laptop without freezing the chat
- Run long renders in `screen -dmS name bash script.sh`, never as a Claude background task (a session
  restart killed every recorder and left a half-written MP4). `screen -X quit` can orphan the script:
  check `ps` and kill the old tree by PID before starting a replacement.
- Recorders write ~30 JPEG/s. Keep the build dir out of VS Code's watcher and git
  (`.git/info/exclude` + `files.watcherExclude`) or VS Code pins 97 % CPU and the Claude panel freezes.
- One silent trigger (`until grep -q DONE log; do sleep 60; done` in the background), not a streaming
  monitor. `renice` heavy workers.
- After any interruption, validate outputs with `ffprobe` (a killed writer leaves a file with no moov).

## Delivery
- Size: mostly-static 1080p30 at crf 18 is ~3.5 MB/min (1 h 47 min = 378 MB). YouTube needs a
  verified account for > 15 min; LinkedIn caps a video at 15 min (split longer parts at a page change).
- `chapters.txt` goes straight into the YouTube description (first line must be 0:00).
- Thumbnail: build it from the site's REAL figures + bold type, rendered as HTML (1280x720, < 2 MB).
  Generic AI glow-wave art was rejected as "complete AI slop".
- To fix one part: edit its plan, re-render changed lines, `--segments X --skip-voice`, then
  `--concat-only`. Re-check chapter labels (a page with no data-nav shows its id).
