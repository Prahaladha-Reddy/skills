const { chromium } = require(process.env.PW || 'playwright');
const shots = new Set((process.argv[2]||'').split(',').filter(Boolean));
(async()=>{
  const b = await chromium.launch();
  const p = await b.newPage({viewport:{width:1440,height:900}});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e))); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.goto('file://'+process.cwd()+'/dist/index.html'); await p.waitForTimeout(1500);
  const ids = await p.evaluate(()=>[...document.querySelectorAll('.page')].map(x=>x.dataset.id));
  const bad=[];
  for (const id of ids){
    await p.evaluate(h=>{location.hash=h}, '#/'+id+'/99'); await p.waitForTimeout(350);
    const r = await p.evaluate(()=>{const pg=document.querySelector('.page.on');const h=pg.querySelector('h2,h1');
      const svgs=[...pg.querySelectorAll('svg.dg')];const empty=svgs.filter(s=>s.childElementCount<2).length;
      const later=pg.querySelectorAll('.fig-later').length;
      return {h:h?h.textContent.trim().slice(0,40):'',ov:document.documentElement.scrollWidth-innerWidth,svgs:svgs.length,empty,later}});
    if(!r.h||r.ov>0||r.empty||r.later) bad.push(id+' '+JSON.stringify(r));
    if(shots.has(id)){ await p.waitForTimeout(900); await p.screenshot({path:`${process.env.SHOTDIR||'../shots'}/app_${id}.png`}); }
  }
  console.log('pages',ids.length,'bad',JSON.stringify(bad,null,0),'errors',JSON.stringify(errs.slice(0,5)));
  await b.close();
})();
