# Method: how to decide what goes on the pages

## The chain
Write the whole explainer as a chain of questions before any code, one line per page:

```
A1  What is actually moving in a wire?        → leaves open: why does it ever stop?
A2  What makes it stop?                       → leaves open: can we control where it goes?
A3  A switch you control with a voltage       → leaves open: can a switch decide anything?
B1  Two switches that answer "both?"          …
```

Rules for the chain:
- **Each page breaks the one before it.** If a page does not answer a question the previous page
  left open, it belongs somewhere else or nowhere.
- **One continuous build.** The thing on page 12 is made of the things on pages 3 and 7, and you
  say so on the page. A reader who can point at what they already built stays.
- **Name the wall at the end of each part.** "Everything so far switches instantly and never gets
  hot. Real parts don't." That sentence is the reason the next part exists.
- **Start below zero.** Define the first term. Assume the reader knows nothing and is not stupid —
  those are different things.

## Writing the steps
A step is one sentence in the narration bar and one new thing appearing in the drawing.

- 4–7 steps per page. More means the page is two pages.
- Lead with the surprise, name it after: *"Both lamps go out — and that is what AND means."*
- Bold exactly the word being taught (`<b>carry</b>`), because that word turns yellow in the bar.
- Present tense, second person, no hedging. "The carry ripples left" — not "the carry will
  generally tend to propagate".
- The last step states the consequence, not a summary.

## Prediction beats quizzing
Before the reveal, ask for a guess the drawing is about to settle: *"127 + 1 — what does the carry
out do?"* One tap, then the drawing runs and they see whether they were right. This is the only
form of "testing" that belongs in this style. Flashcards and multiple-choice quizzes are not.

## What to cut
- Any paragraph that restates the drawing. The caption is one line.
- Any drawing that needs a legend to be read — simplify the marks instead.
- Any number without a unit the reader feels, and any table that a big number or a bar could replace.
- History, naming trivia and "there are many approaches" — unless the page's question is about them.
- Your own admiration for the subject. Show the mechanism; they will decide it is clever.

## Sourcing
Every page carries a `.src` line: the file and line, the paper, the dashboard, the measurement run.
When something is inferred rather than measured, write **"not measured"** next to it. A single
invented number destroys trust in every real one on the page.
