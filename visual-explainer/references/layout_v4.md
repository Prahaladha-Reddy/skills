# kit_v4: the side-panel page contract and its nuances

## Page markup (copy `kit_v4/pA_demo.html`)

```html
<article class="page" data-id="demo" data-part="The idea" data-nav="A queue absorbs a burst">
  <div class="crumb"><b>Chapter A1</b> what this page assumes</div>
  <h2>Why does a steady worker still need a <em>queue</em>?</h2>
  <div class="figbox">
    <div class="ctl">optional: one row of controls + a .readout</div>
    <div class="fig" id="qFig"></div>
  </div>
  <ol class="steps">                         <!-- visible; shell.js moves it into the right panel -->
    <li><b>Step title, 2-5 words</b><p>2-4 short sentences.</p>
        <div class="big"><div><b class="blue" id="qPeak">—</b><span>caption</span></div></div></li>
  </ol>
  <div class="takeaway good"><b>The verdict.</b> One more sentence.</div>
</article>
```

- `shell.js` builds the panel: it moves `ol.steps` and `.takeaway` into `aside.panel`, adds Back/Next,
  the "STEP k / n · PAGE" counter, and the chapter letter from `data-part` (or `data-letter`).
- In the figure, everything after `st(k)` belongs to step k. The shell sets `fig-later` (hidden),
  `fig-past` (dimmed) and `fig-cur` on each mark, and shows a `.halo` only for the current step.
- `data-click="#btn"` on a `<li>` presses a control when the reader reaches that step (used for
  "play" and "run" buttons, and by the video recorder).
- `svgRoot` uses `preserveAspectRatio="xMidYMin meet"` so a drawing never needs the page to scroll.
- Arrow keys and clicking a step title both move between steps; `#/<id>/<k>` deep-links a step.

## Cover page
Title as a question, a 2-3 sentence lede, three "how it works" cards, the Start button, then one card
per chapter (`#partCards`, built by the shell from the pages), then a few big numbers.

## QA that must pass before deploy
`bash build.sh` (syntax, missing ids, STE, name gate) · `node qa.js` (render, overflow, empty svg,
stuck steps) · `node contrast.js` (both themes) · `node num_gate.js` (private numbers) ·
`node shots.js` and LOOK at the screenshots: label collisions only show up in pictures.

## Traps specific to v4
- Labels drawn into a figure collide when someone edits their text later (two centred labels 95 px
  apart overlapped after a rename). Re-shoot the page after any label edit.
- `innerText` hides non-current steps from any text check; use `textContent` without `[hidden]`.
- A hidden span that a figure fills from data still ships its number in the HTML; delete the stat or
  replace the sentence, then keep the element (hidden) only if the figure code writes to it.
