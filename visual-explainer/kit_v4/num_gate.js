// Render every page with all steps shown; flag model-internal numbers in visible text (page, panel, SVG labels).
// usage: PW=... node num_gate.js [pageId,...]     exit 1 if any hit
const { chromium } = require(process.env.PW || 'playwright');
const only = new Set((process.argv[2] || '').split(',').filter(Boolean));
const BAD = new Set((require('fs').existsSync(__dirname + '/gate_numbers.txt') ? require('fs').readFileSync(__dirname + '/gate_numbers.txt', 'utf8') : '').split(/\s+/).filter(Boolean));  // the subject's private numbers, one per line
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('file://' + process.cwd() + '/dist/index.html'); await p.waitForTimeout(1500);
  const ids = await p.evaluate(() => [...document.querySelectorAll('.page')].map(x => x.dataset.id));
  let n = 0;
  for (const id of ids) {
    if (only.size && !only.has(id)) continue;
    await p.evaluate(h => { location.hash = h }, '#/' + id + '/99'); await p.waitForTimeout(500);
    const txt = await p.evaluate(() => { const pg = document.querySelector('.page.on');
      const cl = pg.cloneNode(true); cl.querySelectorAll('[hidden]').forEach(e => e.remove());
      return [...cl.textContent.replace(/\s+/g, ' ').split(/(?<=[.!?])\s/), ...[...pg.querySelectorAll('svg text')].map(t => t.textContent)].join('\n'); });
    for (const line of txt.split('\n').filter(l => !/\b(STEP|PAGE)\s+\d+\s*\/\s*\d+/i.test(l))) for (const m of line.matchAll(/\d[\d,]*(?:\.\d+)?/g)) {
      const v = m[0].replace(/,/g, '');
      if (BAD.has(v)) { n++; console.log(id.padEnd(12), v.padEnd(7), line.trim().slice(0, 110)); } }
  }
  console.log('NUM_GATE hits', n); await b.close(); process.exit(n ? 1 : 0);
})();
