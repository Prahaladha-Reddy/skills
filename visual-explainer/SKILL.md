---
name: visual-explainer
description: Build a clickable, visual explainer that teaches a hard topic from zero — a single self-contained HTML page with chapters, stepped narration and hand-drawn interactive SVG diagrams instead of walls of text. Use when someone asks to learn or teach a subject properly, wants an explainer / course / deep-dive / visual notes / interactive diagrams / a teaching site, says they don't read text or want it visual, or wants to understand a codebase, paper, system or product by seeing how it works. Also use to add a page or a figure to an explainer already built this way.
---

# Visual explainer

Turn a subject into a site the reader **clicks through**: one question per page, one drawing that
answers it, one idea per step. No essay. The drawing is the argument; words are the caption.

Built output = **one `dist/index.html`**, no build tooling, no server, no npm. Fonts from Google
Fonts, everything else inline. It works from a file:// double-click and deploys as a static file.

## What you produce

```
 chapter rail  │  THE QUESTION AS THE HEADLINE            ← h2, the operative word coloured
   A1 ▸        │  ┌────────────────────────────────┐   ┌──────────┐
   A2          │  │  live drawing, steps reveal    │   │ big num  │  ← stats
   A3          │  │  as the reader presses →       │   │ verdict  │  ← the conclusion, stated
   B1          │  └────────────────────────────────┘   └──────────┘
               │  ▸ step 3/5  "the carry ripples left, so bit 7 waits"   ← narration bar
```

Start from `kit/` in this skill folder. It is a working explainer (build it and look before you
write anything): `head.html` (design tokens + every component's CSS), `shell.js` (router, chapter
rail, step reveal, narration bar, theme toggle, contrast guard), `helpers.js` (SVG drawing API),
`build.sh`, `qa.js`, `contrast.js`, plus one demo chapter — `pA_demo.html` + `fA_demo.js` — that
shows the exact shape to copy.

## Default format since Oct 2026: `kit_v4/` (side panel)

Readers found the original layout hard to use: the black narration bar was hard to follow, pages needed
scrolling, the opt-in prose and the source box "did not make sense", and one-line steps were too thin.
`kit_v4/` fixes all of that and is now the default. `kit/` stays as the older reference.

```
 ┌ topbar: ☰ Chapters · TITLE · part · page ───────────── PAGE 3/12 · Theme ┐
 │ CHAPTER B2  crumb                         │ 1  Step title                 │
 │ The question, operative word coloured?    │ 2  Step title                 │
 │ ┌────────────────────────────────────┐    │┌ 3  CURRENT STEP ───────────┐│
 │ │ drawing, builds one step at a time │    ││ 2-4 sentences of real      ││
 │ │ a yellow halo marks what is new    │    ││ explanation + optional big ││
 │ └────────────────────────────────────┘    │└────────────────────────────┘│
 │                                           │ takeaway callout (verdict)    │
 │                                           │ ← Back   STEP 3/6   Next →    │
 └───────────────────────────────────────────┴───────────────────────────────┘
```

- **One screen per step, no page scroll.** Drawing left, steps right (440 px panel). Only the current
  step is expanded; done steps collapse to their title.
- **White theme by default.** Dark mode exists but is never the first view.
- **No narration bar, no `.words` prose panel, no `.src` box on the page.** Sources live in the fact
  sheet and the fact-check reports, not in the reader's way.
- **A halo on the current step's new marks only**; earlier marks dim to ~78 %, later marks are hidden.
- Big numbers (`.big`) sit inside the step that earns them; the verdict is `.takeaway` at the bottom.
- Page contract and every v4 nuance: `references/layout_v4.md`. Writing and depth: `references/writing.md`.

## The ten rules of this style

1. **Every page is a question**, and the headline *is* that question. Never a noun-phrase title.
2. **Each chapter breaks the one before it.** Page N ends at a wall page N+1 exists to climb. Write
   the chain of questions before any code; if a page answers nothing the last page left open, cut it.
3. **Draw the mechanism, don't describe it.** A labelled box saying "cache" is worth nothing; the
   path a request takes, the hop that disappears, the bit that arrives late — that is the page.
4. **One idea per step.** Steps reveal parts of the same drawing (`data-s="k"`); the reader presses →
   and exactly one new thing appears with one line of narration.
5. **Colour carries meaning, always the same meaning.** Green better/done, red worse/broken,
   yellow = the thing moving right now, blue = the idea being taught, grey = frozen/inactive.
6. **A few very large numbers**, in units the reader feels (`14×`, `0.4 s`, `₹2,500`), each with a
   small caption. Never a table where a number would do.
7. **State the verdict outright** in a coloured callout. Never leave the conclusion to be inferred.
8. **Let them poke it.** A slider, a toggle, a switch — one control that changes the drawing and one
   readout that changes with it. Prediction before reveal beats any quiz.
9. **Explain to the bottom, in the panel.** Each step gets 2-4 short sentences that a newcomer can follow
   without a teacher (see `references/writing.md`). No hidden prose panel, no source box on the page.
10. **Every claim is checkable.** Cite the code path, the measurement or the paper. If it was not
    measured, say "not measured" — never dress an assumption as a number.

## Workflow

1. **Ask what the reader can already do**, and what they must be able to do at the end. Pitch the
   floor low: assume nothing, define the first term.
2. **Write the chain of questions** — one line per page, grouped into parts (A, B, C…). Check each
   page breaks the previous one. Show this list before building; it is cheap to change now.
3. **Copy `kit/` to the project**, rename the title in `head.html` + `p0_top.html`, delete the demo
   pair once you have written your own first chapter.
4. **One file pair per chapter**: `pA_topic.html` (page markup + steps) and `fA_topic.js` (its
   drawings). Page order is the alphabetical order of the `p[A-Z]*` filenames.
5. **Build and look**: `bash build.sh` then open `dist/index.html`. Screenshot it, read the
   screenshot, fix what is cramped or unreadable. Never ship a page you have not looked at.
6. **Pass the three gates** (below). They are cheap and they catch exactly the defects that survive
   a casual look.
7. **Deploy** the single file: `npx vercel deploy --prod` from a folder holding `index.html`, or any
   static host. Verify with a cache-busted fetch and compare byte counts.

## Page contract

```html
<article class="page" data-id="adders" data-part="Zero 3: logic that decides"
         data-nav="Adding two numbers" data-say="fallback narration when the page has no steps">
  <div class="crumb"><b>Chapter C4</b> what this page assumes you already saw</div>
  <h2>Why can't a half adder add <em>three</em> bits?</h2>     <!-- em = the operative word -->
  <div class="stage">
    <div class="figbox">
      <div class="ctl">…one row of controls, uppercase labels, a .readout…</div>
      <div class="scroll"><div id="addFig"></div></div>         <!-- .scroll = swipeable on phone -->
      <p class="cap">one line: how to read the drawing</p>
    </div>
    <aside class="side">                                        <!-- narration card injected here -->
      <div class="stats">…big numbers…</div>
      <div class="verdict good"><b>The verdict.</b> Why it matters.</div>
      <div class="words">opt-in prose</div>
      <div class="src">Source: <code>alu.v:88</code></div>
    </aside>
  </div>
  <ol class="steps" hidden>                                     <!-- one <li> per step, in order -->
    <li>The two bits go in and a <b>sum</b> comes out.</li>
    <li>But the <b>carry</b> has nowhere to go.</li>
  </ol>
</article>
```

`data-id` is the URL (`#/adders/3` = step 3). `data-part` groups pages into the rail's parts.
`data-nav` is the rail label (2–5 words). A step `<li>` may carry `data-click="#someButton"` to
press a control automatically when the reader arrives at that step.

## Figure contract

Figure files are plain statements inside one shared IIFE that `helpers.js` opens, so **always guard
on the host element** and never declare a top-level `const` (`top`, `name`, `status` are globals —
redeclaring one kills the whole script silently).

```js
(function(){
  var host = $("addFig"); if(!host) return;
  function draw(){
    var s  = svgRoot(host, 980, 380, "accessible one-line description");  // resets steps, clears host
    var ar = arrowDef(s, aid(), "var(--ink)");
    st(1);  R(s, x, y, w, h, "var(--paper)", {rx:14, stroke:"var(--hair)"});   // everything after
    st(2);  L(s, x1, y1, x2, y2, "var(--move)", {sw:2, arrow:ar});             // st(k) is step k
            T(s, x, y, "label", {size:12, anchor:"middle", weight:700});
  }
  draw();
})();
```

Helpers: `svgRoot(host,w,h,label)` · `S(tag,attrs,parent)` · `R` rect · `L` line · `T` text ·
`arrowDef(svg,id,colour)` · `aid()` unique id · `st(k)` step · `hover(el,html)` tooltip ·
`seg(id,cb)` segmented control (fires once on load) · `fmt(n)` thousands · `rng(seed)`/`gauss(r)`
deterministic randomness. `$("id")` is `getElementById`.

**Colours are always tokens** (`var(--ink)`, `var(--move)`, `var(--good)`…), never hex — that is
what makes dark mode work. `R`/`L`/`T` write fill and stroke into `el.style`, so if you later update
a colour use `el.style.fill`, not `setAttribute("fill", …)` (inline style wins and the update is
silently ignored).

## The three gates

```bash
bash build.sh                      # BUILD_OK + page count; fails on JS syntax and missing ids
PW=$(npm root -g)/playwright node qa.js        # every page: renders, no console error, nothing
                                               # overflows, no empty svg, no step stuck hidden
PW=$(npm root -g)/playwright node contrast.js  # dark AND light: 0 unreadable labels
```

All three must be clean before you show anyone. `npm i -g playwright && npx playwright install
chromium` once, or point `PW` at any playwright install. Then screenshot at **390 px** too: a phone
crop hides inside a `.scroll` container and no overflow number will catch it.

## Traps that have cost real time

- A colour token defined only for light mode makes every label on it white-on-pastel in dark mode.
  Give every token a dark value; the shell's contrast guard is a net, not a licence.
- A media-query rule loses to a later rule of equal specificity — put `@media` blocks after base CSS.
- `el.nextSibling` returns the whitespace text node; use `nextElementSibling`.
- `requestAnimationFrame`'s timestamp can precede the `performance.now()` you captured, so clamp
  progress: `p = Math.max(0, Math.min(1, (now - t0) / D))`.
- A drawing that needs a legend usually needs fewer marks instead.
- `data-s` is the shell's STEP attribute: a toggle button carrying `data-s="…"` is treated as a later step and renders
  hidden/faded. Name control attributes anything else (`data-sec`, `data-val`). (9 Oct 2026)
- JS comments ship inside the page, so the name gate fails on a code file name that appears only in a comment.

## Deeper references (read when you need them)

- `references/layout_v4.md` — the v4 side-panel page contract, cover page, QA and v4 traps.
- `references/writing.md` — how deep to go, plain-English rules, what never to print, fact-checking.
- To turn a finished site into a narrated walkthrough video, use the `explainer-video` skill.
- `references/method.md` — choosing and ordering chapters, writing narration, what to cut.
- `references/design.md` — the token palette, type roles, every component and when to use it.
- `references/diagrams.md` — diagram patterns that work, with the helper calls to build them.
- `references/checklist.md` — the ship checklist and how to deploy.
