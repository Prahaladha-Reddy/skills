# The story: beats of the reference film (Hima ASR, 43 s)

Hima ASR is a small open speech model: speech → text and speech → decisions (questions answered
directly from the voice). The film had to say four things fast: what it is, that it really works on
messy real audio, that it decides as well as transcribes, and that it covers many languages.

| Time | Beat | World | What happens |
|---|---|---|---|
| 0:00-0:06 | **Intro** | pitch black + soft prism arc | image tiles drift in; title "Introducing *Hima ASR*" then 4 short lines one beat apart; one tile is the first frame of the next shot, and the camera flies into it |
| 0:06-0:10 | **The call** | saturated Rothko orange | a real 3 s phone line under street noise plays; its waveform draws itself as light as you hear it; one pill line: "Hear one voice through a busy street" |
| 0:10-0:21 | **Inside** | cream with blue blooms | the orange screen turns 90° left, slides to the edge, cuts into frames; frames pour into a small symbolic network on a lavender panel; two streams leave it: text and decisions; camera flies into the transcript, then into six decision bars |
| 0:21-0:36 | **More languages** | same layout as "Inside" | four more real calls, each processed *while it plays* in the same layout: waveform lights up, network works, transcript appears word by word in its own script, three decisions fill |
| 0:36-0:43 | **End card** | black + prism arc again | every supported language appears in its own script around the arc; name, "speech → text · speech → decisions", "11 Indian languages and English · open weights", the link |

## Why each beat exists

- **Intro first, not the demo.** People need to know what they are looking at before the demo means
  anything. The intro tiles are the mood board (images, not data); the title carries the claim.
- **One hero example, played in full.** The audience must *hear* the hard case (a real voice in real
  traffic) before seeing the answer. Short: 3-5 s. Trim lead and tail silence to ~0.4 s / 0.2 s.
- **The mechanism, symbolically.** A tiny network (4-6-6-2 nodes) is enough: everyone knows real
  networks are huge; the picture says "sound in, two kinds of answer out". Put real history behind it:
  pre-neural diagrams (vowel charts, HMMs, DTW) blended softly into the panel.
- **Decisions are the differentiator.** Show things a transcript cannot: who is speaking, the emotion,
  the language, each marked "♪ voice". Pair them with text-level ones (complaining, bargaining).
- **More examples = same layout, faster.** Repetition proves it is not one lucky clip. Do not invent a
  new layout here; reuse "Inside" and let it run while the audio plays.
- **End where you began.** The black prism world bookends the film; the link is the last thing on screen.

## Things that were tried and cut

- a voiceover (generic TTS voices all felt off; the film is stronger silent with music + real audio)
- a "how to use decisions" teaching beat (too much for 45 s)
- a white "all scripts" screen after the languages (felt plain; moved the scripts to the end card)
- a "louder noise" beat (the model held 10/10 at 8 dB but only 6/10 at 5 dB; it would have oversold)
- spectrogram tiles in the intro (read as random noise); stock photos (generic); a dark halo behind
  titles (obvious); a blue haze oval behind text (read as a "ring")
