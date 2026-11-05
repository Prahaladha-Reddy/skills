# Truth: every number is real

A launch film is a claim. Viewers will pause and read the bars. Everything on screen must be the model's
actual output on exactly the media shown.

## Picking examples

- Use **real** recordings (real conversations, real photos), from a source whose licence lets you show
  them. Avoid synthetic or acted examples: they feel staged and are easy to call out.
- Hero example 3-5 s; quick examples ~2-3 s of content each. Cut at a natural pause found from the
  energy envelope (first quiet run >= 110 ms after the target length), never mid-word.
- Prefer lines where the model is exactly right *and* whose meaning a viewer can feel (a price
  complaint, a question, a refusal).

## Running the model on what you show

1. Build the final mix exactly as it will play (noise level, noise segment, lead silence, tail).
2. Run the model on that file and save text + every decision to JSON beside it.
3. Display only what is in that JSON. If a re-mix changes anything (a different lead, a different noise
   window), rerun. A 0.4 s change of lead once flipped the last word of a transcript.

## Robustness before you claim robustness

For the noise claim, mix the same clip with **many noise placements** (10 windows of the noise file) at
each level, and count exact-match transcripts. In the reference: 10/10 at 8 dB, 6/10 at 5 dB, so the film
used 8 dB and made no "louder noise" claim.

## Decisions

- Free-form questions can be answered unreliably. Phrase them the way the model was taught (short,
  "Is the speaker …?", "Which emotion best describes the speaker?") and **test** several phrasings on
  the clean and the noisy mix; keep only questions whose answers are right and stable across both.
- Check "from the voice" answers against the signal itself (e.g. speaker pitch for a gender question)
  before marking them "♪ voice". Leave out answers near a coin flip (0.45-0.55) even if "right".
- Show the full distribution (top 2-3 options with bars), not just the winner.

## Claims in text

Every line in the intro and end card must be checkable: parameter count from the released weights,
language list from the model card, benchmark wording that matches published numbers. When unsure, the
weaker true claim beats the stronger untested one.
