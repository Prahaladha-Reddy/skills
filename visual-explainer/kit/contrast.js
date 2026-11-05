const { chromium } = require(process.env.PW || 'playwright');
(async()=>{const b=await chromium.launch();
for (const scheme of ['dark','light']){
const p=await b.newPage({viewport:{width:1440,height:900},colorScheme:scheme});const errs=[];p.on('pageerror',e=>errs.push(String(e)));
await p.goto('file://'+process.cwd()+'/dist/index.html');await p.waitForTimeout(1200);
const ids=await p.evaluate(()=>[...document.querySelectorAll('.page')].map(x=>x.dataset.id));const bad=[];let worstT=0;
for(const id of ids){await p.evaluate(h=>{location.hash=h},'#/'+id+'/99');await p.waitForTimeout(260);
 const r=await p.evaluate(()=>{function lum(c){var m=String(c).match(/[\d.]+/g);if(!m||m.length<3)return null;if(m.length>3&&+m[3]===0)return null;var v=m.slice(0,3).map(x=>{x=x/255;return x<=0.03928?x/12.92:Math.pow((x+0.055)/1.055,2.4)});return 0.2126*v[0]+0.7152*v[1]+0.0722*v[2];}
  const pg=document.querySelector('.page.on');let n=0,ex=[];const t0=performance.now();
  pg.querySelectorAll('svg.dg').forEach(svg=>{const shapes=[...svg.querySelectorAll('rect,circle,ellipse,path,polygon')].map(e=>{const f=getComputedStyle(e).fill;const L=f&&f!=='none'?lum(f):null;if(L==null)return null;const bb=e.getBBox();if(bb.width<8||bb.height<8)return null;return{e,b:bb,L}}).filter(Boolean);
   const bgc=getComputedStyle(svg.closest('.figbox')||document.body).backgroundColor;let base=lum(bgc);if(base==null)base=lum(getComputedStyle(document.body).backgroundColor);
   svg.querySelectorAll('text').forEach(t=>{if(getComputedStyle(t).opacity==='0')return;if(t.closest('.fig-later'))return;const tl=lum(getComputedStyle(t).fill);const tb=t.getBBox();if(!tb.width||tl==null)return;const cx=tb.x+tb.width/2,cy=tb.y+tb.height/2;let u=base;for(const o of shapes){if(!(o.e.compareDocumentPosition(t)&4))continue;if(cx>=o.b.x&&cx<=o.b.x+o.b.width&&cy>=o.b.y&&cy<=o.b.y+o.b.height)u=o.L;}
    const ra=(Math.max(tl,u)+.05)/(Math.min(tl,u)+.05);if(ra<2.5){n++;if(ex.length<2)ex.push(t.textContent.slice(0,30)+':'+ra.toFixed(1));}});});
  return {n,ex,ms:performance.now()-t0};});
 if(r.n)bad.push(id+' '+r.n+' '+JSON.stringify(r.ex));worstT=Math.max(worstT,r.ms);}
console.log(scheme,'pages',ids.length,'low-contrast pages',bad.length,JSON.stringify(bad.slice(0,25)),'errors',JSON.stringify(errs.slice(0,3)),'check ms max',worstT.toFixed(0));
await p.close();}
await b.close();})();
