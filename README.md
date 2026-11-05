# Skills

Three Claude Code skills for turning hard technical work into things people actually look at.

| Skill | What it makes | Start here |
|---|---|---|
| [`launch-film`](launch-film/) | A ~45 s launch film for an AI model: intro over image tiles, the model working on a real clip (network, transcript, decisions), a fast tour of more examples, an end card. Every number on screen is the model's real output. | [`launch-film/SKILL.md`](launch-film/SKILL.md) |
| [`visual-explainer`](visual-explainer/) | A clickable explainer site: one question per page, one drawing that answers it, steps that reveal one idea at a time. A single self-contained `index.html`. | [`visual-explainer/SKILL.md`](visual-explainer/SKILL.md) |
| [`explainer-video`](explainer-video/) | A narrated walkthrough video of a visual-explainer site: a TTS voice explains while a scripted cursor clicks through the real pages; every line is voice-checked, recorded in parallel, assembled, and chaptered for YouTube. | [`explainer-video/SKILL.md`](explainer-video/SKILL.md) |

## Install

Copy a skill folder into your Claude Code skills directory:

```bash
git clone https://github.com/Prahaladha-Reddy/skills.git
cp -R skills/launch-film skills/visual-explainer skills/explainer-video ~/.claude/skills/
```

Claude Code picks them up on the next session. Ask in plain words ("make a launch film for my model",
"explain this paper visually", "turn the explainer into a video") and the matching skill loads.

Tools the skills use: Node with Playwright (`npm i -g playwright && npx playwright install chromium`),
`ffmpeg`, and Python 3 with `numpy pillow`. The explainer video also needs a TTS provider key
and an ASR provider key in environment variables (see its SKILL.md).

## The idea behind all three

- **Show, don't tell.** One picture per question; the words are captions.
- **Real or nothing.** Real clips, real outputs, real measurements. If it was not measured, it is not on screen.
- **Stills first.** Look at a few frames and pick a direction before rendering anything long.
- **Judge at phone size.** Most people will watch on a phone; read every frame shrunk to 390 px wide.

Each skill folder carries its own references with the traps that cost real time when these were first built.

## License

MIT
