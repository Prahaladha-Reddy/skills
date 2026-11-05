# Lessons (each one cost real time)

- **Laptop is not the audience.** Everyone loved the film and nobody could read it on a phone. Judge at
  390 px wide from the first still.
- **The renderer saw a stale frame.** A Playwright screenshot can run before an image finishes decoding:
  wait for `img.complete` / `onload` on every image and `document.fonts.ready` before `window.ready`.
- **Font shorthand order matters**: `document.fonts.load('italic 40px "X"')`, style before size; the
  other order throws and silently hangs the boot. Always `.catch(console.error)` the boot promise.
- **Canvas `toDataURL` fails on `file://` images** ("tainted canvas"). Pre-render composite images in
  Python instead of compositing in the page.
- **A missing script font falls back silently** (Odia rendered as boxes until a Noto Serif Oriya woff2 was
  added). Load one glyph per script with `document.fonts.load` and eyeball every script in a still.
- **CSS `scale(S)` on a 3D-transformed child only scales x/y.** Use `scale3d(S,S,S)` for a 3D camera.
- **Editing a running bash script** can make it resume at a wrong byte; write a new file instead.
- **A long ssh/launch line** that backgrounds a `cd && …` list holds the terminal; launch one plain command.
- **Upload limits**: chat apps and artifact hosts cap at ~15-16 MB; keep a separate web encode.
- **Background layers can hijack the eye**: a bright bloom behind data, a dark halo behind a title, a
  pale oval inside a colour field. When text looks weak, move the background before enlarging the text.
- **Repeated beats drift.** When rebuilding a beat in a hurry, the second version silently loses the
  scale and steps of the approved one. Parametrise the approved page; do not rewrite it.
