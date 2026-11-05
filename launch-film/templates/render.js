// Deterministic HTML -> video renderer.
//   node render.js <page.html> stills 1.2,3.5,5     -> still_<t>.png
//   node render.js <page.html> film out.mp4 [hq]     -> 30 fps mp4 (hq = PNG frames + CRF 14; default JPEG frames + CRF 20)
// The page must define window.render(t), window.DUR and set window.ready = true when fonts and images are loaded.
// Page options go in the Q env var as a query string, e.g. Q="?theme=B".
// Needs: npm i -g playwright && npx playwright install chromium; ffmpeg on PATH. Set PW to the playwright module path if needed.
const path = require('path');
const pw = require(process.env.PW || 'playwright');
const {spawn} = require('child_process');
(async () => {
  const [page, mode = 'stills', arg, hq] = process.argv.slice(2);
  if (!page) { console.log('usage: node render.js page.html stills|film ...'); process.exit(1); }
  const b = await pw.chromium.launch(); const p = await b.newPage({viewport: {width: 1920, height: 1080}});
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + path.resolve(page) + (process.env.Q || ''));
  await p.waitForFunction(() => window.ready === true, null, {timeout: 60000});
  if (errs.length) console.log('PAGE ERRORS', errs);
  if (mode === 'stills') {
    const ts = (arg || '1').split(',').map(Number);
    for (const t of ts) { await p.evaluate(t => window.render(t), t); await p.screenshot({path: `still_${t.toFixed(2)}.png`}); }
    console.log('stills', ts.length, 'errors', errs.length);
  } else {
    const FPS = 30, DUR = await p.evaluate(() => window.DUR), out = arg || 'part.mp4', HQ = hq === 'hq';
    const enc = HQ ? ['-crf', '14', '-tune', 'film'] : ['-crf', '20'];
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', HQ ? 'png' : 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', ...enc, '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out]);
    ff.stderr.on('data', d => process.stderr.write(d));
    const N = Math.round(DUR * FPS), t0 = Date.now();
    for (let f = 0; f < N; f++) {
      await p.evaluate(t => window.render(t), f / FPS);
      const buf = await p.screenshot(HQ ? {type: 'png'} : {type: 'jpeg', quality: 93});
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (f % 150 === 0) console.log(`frame ${f}/${N}  ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
    console.log('FILM_DONE', out, 'errors', errs.length);
  }
  await b.close();
})();
