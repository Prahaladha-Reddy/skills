// Drive the explainer like a human presenter and capture timestamped frames.
// usage: PW=... node record.js <site index.html> <plan.json> <tts dir with _results.json> <outdir>
// Writes <outdir>/frames/NNNNNN.jpg, <outdir>/frames.json [{f,t}], <outdir>/timeline.json {t0,tEnd,says:[{id,t}],plays:[{file,t}]}
const { chromium } = require(process.env.PW || 'playwright');
const fs = require('fs'), path = require('path');
const [site, planP, ttsDir, out] = process.argv.slice(2);
const plan = JSON.parse(fs.readFileSync(planP, 'utf8'));
const durs = {}; for (const r of JSON.parse(fs.readFileSync(path.join(ttsDir, '_results.json'), 'utf8'))) if (r.ok) durs[r.id] = r.sec;
const GAP = +(process.env.SAY_GAP || 0.38);          // breath between sentences
const VW = 1440, VH = 810, DSF = 4 / 3;               // 1920x1080 pixels, text 33% larger
fs.mkdirSync(path.join(out, 'frames'), { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const now = () => Date.now() / 1000;

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: DSF, colorScheme: 'light' });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  const first = plan.beats.find(x => x.go);
  await page.goto('file://' + path.resolve(site) + '#/' + (first ? first.go + '/' + (first.step || 1) : ''));
  await page.waitForTimeout(1500);
  await page.addStyleTag({ content: `
    #vcur{position:fixed;left:0;top:0;width:30px;height:30px;z-index:2147483647;pointer-events:none;filter:drop-shadow(0 2px 4px rgba(0,0,0,.35))}
    .vrip{position:fixed;z-index:2147483646;pointer-events:none;width:16px;height:16px;margin:-8px 0 0 -8px;border-radius:50%;border:3px solid #f2d600;animation:vrip .55s ease-out forwards}
    @keyframes vrip{from{transform:scale(.6);opacity:1}to{transform:scale(3.4);opacity:0}}
    ::-webkit-scrollbar{display:none}` });
  await page.evaluate(([w, h]) => {
    const c = document.createElement('div'); c.id = 'vcur';
    c.innerHTML = '<svg viewBox="0 0 24 24" width="30" height="30"><path d="M3 2 L3 19 L7.6 14.8 L10.6 21.6 L13.6 20.3 L10.7 13.6 L17 13.6 Z" fill="#141312" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    document.body.appendChild(c); window.__cur = { x: w * 0.62, y: h * 0.55 }; c.style.transform = `translate(${window.__cur.x - 3}px,${window.__cur.y - 2}px)`;
    window.__move = (x, y, ms) => new Promise(res => { const s = { ...window.__cur }, t0 = performance.now();
      const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      // slight arc like a real hand
      const mx = (s.x + x) / 2 + (y - s.y) * 0.08, my = (s.y + y) / 2 - (x - s.x) * 0.08;
      function f(now) { const t = Math.min(1, (now - t0) / ms), e = ease(t), u = 1 - e;
        const px = u * u * s.x + 2 * u * e * mx + e * e * x, py = u * u * s.y + 2 * u * e * my + e * e * y;
        window.__cur = { x: px, y: py }; c.style.transform = `translate(${px - 3}px,${py - 2}px)`;
        if (t < 1) requestAnimationFrame(f); else res(); }
      requestAnimationFrame(f); });
    // cursor loops around a point like a hand circling something (one smooth lap, slightly wobbly)
    window.__circle = (cx, cy, rx, ry, ms) => new Promise(res => { const t0 = performance.now(), a0 = -Math.PI * 0.15;
      function f(now) { const t = Math.max(0, Math.min(1, (now - t0) / ms)), e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2, a = a0 + e * Math.PI * 2.05, j = 1 + 0.06 * Math.sin(a * 3);
        const x = cx + Math.cos(a) * rx * j, y = cy + Math.sin(a) * ry * j; window.__cur = { x, y }; c.style.transform = `translate(${x - 3}px,${y - 2}px)`;
        if (t < 1) requestAnimationFrame(f); else res(); } requestAnimationFrame(f); });
    window.__ripple = (x, y) => { const r = document.createElement('div'); r.className = 'vrip'; r.style.left = x + 'px'; r.style.top = y + 'px'; document.body.appendChild(r); setTimeout(() => r.remove(), 700); };
    // presenter marks: a hand-drawn ring around the target, or an arrow into it from free space; draws on, holds, fades
    const NS = 'http://www.w3.org/2000/svg';
    const ov = document.createElementNS(NS, 'svg'); ov.setAttribute('width', w); ov.setAttribute('height', h);
    ov.style.cssText = 'position:fixed;left:0;top:0;z-index:2147483645;pointer-events:none;overflow:visible';
    document.body.appendChild(ov);
    window.__mark = (b, kind) => {
      const g = document.createElementNS(NS, 'g'); g.style.transition = 'opacity .45s ease'; ov.appendChild(g);
      const stroke = (d, wd) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d);
        p.style.cssText = `fill:none;stroke:#ff4d2e;stroke-width:${wd};stroke-linecap:round;stroke-linejoin:round`; g.appendChild(p); return p; };
      const draw = (p, ms, delay) => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
        p.getBoundingClientRect(); p.style.transition = `stroke-dashoffset ${ms}ms cubic-bezier(.4,.1,.3,1) ${delay}ms`; requestAnimationFrame(() => { p.style.strokeDashoffset = 0; }); };
      const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
      if (kind === 'ring') {
        const rx = b.w / 2 + 16, ry = b.h / 2 + 12, a0 = -2.2 + Math.random() * 0.5, pts = [];
        for (let i = 0; i <= 64; i++) { const t = i / 64, a = a0 + t * Math.PI * 2.12, j = 1 + 0.035 * Math.sin(t * 9 + a0) + 0.04 * t;
          pts.push([cx + Math.cos(a) * rx * j, cy + Math.sin(a) * ry * j]); }
        draw(stroke('M' + pts.map(q => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' L'), 4), 520, 0);
      } else {
        const sx = cx < w / 2 ? 1 : -1, ex = cx - sx * (b.w / 2 + 10), ey = cy, bx = Math.max(24, Math.min(w - 24, ex - sx * 150)), by = Math.max(70, Math.min(h - 24, ey - 90));
        const mx = (bx + ex) / 2 + 18 * sx, my = (by + ey) / 2 - 26;
        draw(stroke(`M${bx} ${by} Q${mx} ${my} ${ex} ${ey}`, 4), 380, 0);
        const ang = Math.atan2(ey - my, ex - mx), hl = 16;
        draw(stroke(`M${ex - hl * Math.cos(ang - .5)} ${ey - hl * Math.sin(ang - .5)} L${ex} ${ey} L${ex - hl * Math.cos(ang + .5)} ${ey - hl * Math.sin(ang + .5)}`, 4), 160, 360);
      }
      setTimeout(() => { g.style.opacity = 0; }, 1650); setTimeout(() => g.remove(), 2200);
    };
  }, [VW, VH]);

  // screencast
  const cdp = await ctx.newCDPSession(page);
  const frames = []; let n = 0;
  const FPS = +(process.env.REC_FPS || 30); let lastT = -1, pending = null, pTimer = null;
  function keep(fr) { const name = String(n++).padStart(6, '0') + '.jpg'; fs.writeFileSync(path.join(out, 'frames', name), Buffer.from(fr.data, 'base64')); frames.push({ f: name, t: fr.t }); lastT = fr.t; }
  cdp.on('Page.screencastFrame', async f => {
    const fr = { data: f.data, t: f.metadata.timestamp };
    if (fr.t - lastT >= 1 / FPS) { pending = null; keep(fr); }
    else { pending = fr; clearTimeout(pTimer); pTimer = setTimeout(() => { if (pending) { const p = pending; pending = null; keep(p); } }, 80); }
    try { await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }); } catch (e) {}
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: +(process.env.REC_Q || 88), maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 });
  await sleep(600);
  const t0 = now(); const says = [], plays = [], gos = [];
  const pageMeta = await page.evaluate(() => window.LPU.pages());

  async function box(sel) {
    const get = () => page.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); if (!r.width && !r.height) return null; return { x: r.left, y: r.top, w: r.width, h: r.height }; }, sel);
    let r = await get(); if (!r) return null;
    if (r.y < 50 || r.y + Math.min(r.h, 120) > VH - 10) {   // off screen: scroll it into view like a person would
      await page.evaluate(s => document.querySelector(s).scrollIntoView({ behavior: 'smooth', block: 'center' }), sel); await sleep(1100); r = await get(); }
    return r; }
  async function moveTo(x, y, ms) { await page.evaluate(([x, y, ms]) => window.__move(x, y, ms), [x, y, ms]); }
  async function clickSel(sel, ms) {
    const r = await box(sel); if (!r) { console.log('MISSING', sel); return false; }
    const x = r.x + r.w * 0.5, y = r.y + r.h * 0.5; await moveTo(x, y, ms || 700); await sleep(140);
    await page.evaluate(([x, y]) => window.__ripple(x, y), [x, y]); await page.mouse.click(x, y); return true;
  }
  let markN = 0, sayEnd = 0;
  async function pointAt(target) {
    let r = null;
    if (target === 'halo') r = await box('.page.on .halo.fig-cur') || await box('.page.on .lcol svg.dg');
    else r = await box(target);
    if (!r) return;
    if (process.env.MARKS !== '0' && r.w < VW * 0.45 && r.h < VH * 0.45) {   // presenter mark, mostly rings, every third an arrow
      markN++; await page.evaluate(([b, k]) => window.__mark(b, k), [r, markN % 3 === 0 ? 'arrow' : 'ring']); }
    const x = r.x + r.w * (0.86 + Math.random() * 0.08), y = r.y + r.h * (0.80 + Math.random() * 0.12);
    await moveTo(Math.max(10, Math.min(VW - 10, x)), Math.max(60, Math.min(VH - 10, y)), 900);
  }
  async function drift(sec) { // small idle hand movement while talking
    const steps = Math.max(1, Math.floor(sec / 2.2)); for (let i = 0; i < steps; i++) {
      const c = await page.evaluate(() => window.__cur); await moveTo(c.x + (Math.random() - .5) * 26, c.y + (Math.random() - .5) * 18, 1600); await sleep(Math.max(0, (sec / steps) * 1000 - 1600)); } }

  for (const bt of plan.beats) {
    if (bt.go != null) { gos.push({ id: bt.go, t: now() - t0 }); await page.evaluate(([id, k]) => window.LPU.go(id, k), [bt.go, bt.step || 1]); await sleep(bt.wait ? bt.wait * 1000 : 900); continue; }
    if (bt.next) { await clickSel('.page.on .panel .nx', 650); await sleep(700); continue; }
    if (bt.click) { await clickSel(bt.click, 700); await sleep(500); continue; }
    if (bt.pause) { await sleep(bt.pause * 1000); continue; }
    if (bt.sync) { const left = sayEnd - Date.now(); if (left > 0) await sleep(left); continue; }   // wait for a nowait line to finish
    if (bt.hover) {   // tour: glide to an element, ring it, hold (no click)
      const r = await box(bt.hover); if (!r) { console.log('MISSING', bt.hover); continue; }
      if (!bt.noring && process.env.MARKS !== '0' && r.w < VW * 0.45 && r.h < VH * 0.45) await page.evaluate(([b]) => window.__mark(b, 'ring'), [r]);
      if (bt.sweep) { const y = r.y + r.h * 0.94; await moveTo(r.x + Math.min(30, r.w * 0.05), y, bt.ms || 420);
        await moveTo(r.x + r.w * 0.92, y, (bt.hold || 2) * 1000); continue; }
      if (bt.circle) { const cx = r.x + r.w * 0.5, cy = r.y + r.h * 0.5, rx = r.w * (bt.big ? 0.56 : 0.36), ry = r.h * (bt.big ? 0.64 : 0.30);
        await moveTo(cx + rx * Math.cos(-Math.PI * 0.15), cy + ry * Math.sin(-Math.PI * 0.15), bt.ms || 420);
        await page.evaluate(([x, y, a, b, m]) => window.__circle(x, y, a, b, m), [cx, cy, rx, ry, (bt.hold || 1.1) * 1000]); continue; }
      await moveTo(r.x + r.w * 0.5, r.y + r.h * 0.42, bt.ms || 450); await sleep((bt.hold || 1.1) * 1000); continue; }
    if (bt.play) { await clickSel(bt.play.sel, 700); plays.push({ file: bt.play.file, t: now() - t0 }); await sleep((bt.play.dur + 0.4) * 1000); continue; }
    if (bt.say) {
      const d = durs[bt.say]; if (d == null) { console.log('NO AUDIO', bt.say); continue; }
      const ts = now() - t0; says.push({ id: bt.say, t: ts });
      const tEnd = Date.now() + (d + GAP) * 1000;
      if (bt.nowait) { sayEnd = tEnd; if (bt.point) await pointAt(bt.point); continue; }   // keep moving while it speaks
      if (bt.point) await pointAt(bt.point);
      const left = (tEnd - Date.now()) / 1000; if (left > 2.5 && !bt.still) await drift(left - 0.4);
      const rest = tEnd - Date.now(); if (rest > 0) await sleep(rest);
      continue;
    }
  }
  await sleep(800);
  const tEnd = now() - t0;
  await cdp.send('Page.stopScreencast');
  await sleep(300);
  fs.writeFileSync(path.join(out, 'frames.json'), JSON.stringify(frames.map(x => ({ f: x.f, t: x.t - t0 }))));
  fs.writeFileSync(path.join(out, 'timeline.json'), JSON.stringify({ tEnd, says, plays, gos, pages: pageMeta }, null, 1));
  console.log('RECORD_DONE frames', frames.length, 'secs', tEnd.toFixed(1), 'errors', JSON.stringify(errs));
  await b.close();
})();
