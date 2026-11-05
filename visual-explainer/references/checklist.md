# Ship checklist

## Build
```bash
bash build.sh        # BUILD_OK <bytes>, pages <n>   — fails on JS syntax errors and missing ids
```

## Gates (all three, every time)
```bash
npm i -g playwright && npx playwright install chromium   # once
PW=$(npm root -g)/playwright node qa.js        # pages <n> bad [] errors []
PW=$(npm root -g)/playwright node contrast.js  # dark … low-contrast pages 0 · light … 0
```
`qa.js` walks every page at its last step and fails on: an empty headline, a drawing that never
rendered, an element still hidden after the final step, a console error, or the document scrolling
sideways. `contrast.js` measures every SVG label against the shape painted under it, in both colour
schemes.

## Look at it
- Screenshot at **1440** and at **390** px, light and dark, and read the screenshots. A phone crop
  hides inside a `.scroll` container where no overflow number can see it.
- Walk one chapter end to end with the keyboard: `→` steps, `↓` next page, `/` search, `w` words,
  theme toggle. The narration must make sense read alone, without the drawing.

## Content check
- Every page's headline is a question, and its steps answer it.
- Every number has a unit and a source; anything inferred says "not measured".
- Every part ends with the wall that makes the next part necessary.
- Nothing in the drawings is hex-coloured; nothing is unreadable with the other theme.

## Deploy (single static file)
```bash
mkdir -p ~/deploy/<name> && cp dist/index.html ~/deploy/<name>/index.html
cd ~/deploy/<name> && npx vercel deploy --prod --yes      # or any static host
curl -s -H 'Cache-Control: no-cache' "https://<name>.vercel.app/?cb=$RANDOM" | wc -c   # match local
```
Deploy from a folder **outside** a git repo if the CLI stalls on permissions, verify with a
cache-busted anonymous fetch, and compare the fetched byte count against the local file — a CDN will
happily serve you the previous build and it looks exactly like a failed deploy.
