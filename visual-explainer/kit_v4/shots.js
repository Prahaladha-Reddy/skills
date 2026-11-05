// usage: PW=$(npm root -g)/playwright node shots.js <outdir> [ids,comma,separated] [--dark] [--w 1440] [--step last|N]
const { chromium } = require(process.env.PW || 'playwright');
const path = require('path'); const fs = require('fs');
(async () => {
  const out = process.argv[2] || 'shots'; fs.mkdirSync(out, { recursive: true });
  const ids = (process.argv[3] && !process.argv[3].startsWith('--')) ? process.argv[3].split(',') : null;
  const dark = process.argv.includes('--dark');
  const wi = process.argv.indexOf('--w'); const W = wi > 0 ? +process.argv[wi + 1] : 1440;
  const si = process.argv.indexOf('--step'); const stepArg = si > 0 ? process.argv[si + 1] : 'last';
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: W, height: (process.argv.indexOf('--h')>0 ? +process.argv[process.argv.indexOf('--h')+1] : (W < 600 ? 1600 : 1000)) }, colorScheme: dark ? 'dark' : 'light' });
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + path.resolve('dist/index.html'));
  const pages = await p.evaluate(() => window.LPU.pages());
  for (const pg of pages) {
    if (ids && !ids.includes(pg.id)) continue;
    const k = stepArg === 'last' ? Math.max(1, pg.steps) : +stepArg;
    await p.evaluate(([id, k]) => window.LPU.go(id, k), [pg.id, k]);
    await p.waitForTimeout(350);
    await p.screenshot({ path: `${out}/${String(pg.index).padStart(2, '0')}_${pg.id || 'cover'}${dark ? '_d' : ''}.png`, fullPage: true });
  }
  console.log('SHOTS', out, 'errors', JSON.stringify(errs.slice(0, 8)));
  await b.close();
})();
