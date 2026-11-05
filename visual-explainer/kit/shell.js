(function(){
"use strict";
var pages=[].slice.call(document.querySelectorAll(".page"));
var byId={};pages.forEach(function(p,i){byId[p.dataset.id]=i;});
var cur=-1,step={},seen={};
try{seen=JSON.parse(localStorage.getItem("lpuSeen")||"{}");}catch(e){}
function stepsOf(p){return [].slice.call(p.querySelectorAll("ol.steps li")).map(function(li){return li.innerHTML;});}

/* ---- rail ---- */
var nav=document.getElementById("navlist"),parts=[],partOf={};
pages.forEach(function(p,i){var pt=p.dataset.part;if(!partOf[pt]){partOf[pt]={name:pt,idx:[]};parts.push(partOf[pt]);}partOf[pt].idx.push(i);});
var links=[];
parts.forEach(function(pt,k){var h=document.createElement("div");h.className="part";h.innerHTML=(k?"<span>"+String.fromCharCode(64+k)+" · "+pt.name+"</span>":"<span>"+pt.name+"</span>")+"<i>"+pt.idx.length+"</i>";nav.appendChild(h);
  pt.idx.forEach(function(i,j){var p=pages[i],a=document.createElement("a");a.className="nav";a.href="#/"+p.dataset.id;a.dataset.i=i;
    a.innerHTML="<em>"+(k?String.fromCharCode(64+k)+(j+1):"—")+"</em><span>"+p.dataset.nav+"</span>";nav.appendChild(a);links[i]=a;});});
var pc=document.getElementById("partCards");
parts.slice(1).forEach(function(pt,k){var a=document.createElement("a");a.className="pcard";a.href="#/"+pages[pt.idx[0]].dataset.id;
  a.innerHTML="<span class='n'>"+String.fromCharCode(65+k)+"</span><span class='t'>"+pt.name+"</span><ul>"+pt.idx.slice(0,6).map(function(i){return "<li>· "+pages[i].dataset.nav+"</li>";}).join("")+(pt.idx.length>6?"<li>+ "+(pt.idx.length-6)+" more</li>":"")+"</ul>";pc.appendChild(a);});

/* ---- narration card per page ---- */
pages.forEach(function(p){var h=p.querySelector(":scope > h2"),stg=p.querySelector(":scope > .stage");if(h&&stg){var col=document.createElement("div");col.className="col";stg.insertBefore(col,stg.firstChild);col.appendChild(h);col.appendChild(col.nextElementSibling);}});
pages.forEach(function(p,i){var side=p.querySelector(".side");if(!side)return;var st=stepsOf(p);
  var n=document.createElement("div");n.className="narr";
  n.innerHTML="<div class='k'><span>"+(st.length?"step <b class='sn'>1</b> / "+st.length:"look")+"</span><span>page "+i+" / "+(pages.length-1)+"</span></div><p class='say'></p><div class='ctlz'><div class='dots'></div><div class='nav2'><button class='pv'>← back</button><button class='pri nx'>next →</button></div></div>";
  side.insertBefore(n,side.firstChild);var pb=document.createElement("i");pb.className="pbar";pb.style.width=(100*i/(pages.length-1))+"%";n.appendChild(pb);
  var dots=n.querySelector(".dots");st.forEach(function(_,k){var b=document.createElement("button");b.textContent=k+1;b.onclick=function(){setStep(k+1);};dots.appendChild(b);});
  if(!st.length){n.querySelector(".say").innerHTML=p.dataset.say||"Hover, drag and press the buttons on the drawing.";}
  n.querySelector(".pv").onclick=back;n.querySelector(".nx").onclick=fwd;});

/* ---- step reveal ---- */
function apply(){if(cur<0)return;var p=pages[cur],st=stepsOf(p),k=step[cur]||1;if(!st.length)return;
  p.querySelectorAll("[data-s]").forEach(function(e){var s=+e.getAttribute("data-s");e.classList.toggle("fig-later",s>k);});
  var li=p.querySelectorAll("ol.steps li")[k-1];if(li&&apply._last!==cur+":"+k){apply._last=cur+":"+k;["data-click","data-click2"].forEach(function(att){var sel=li.getAttribute(att);if(!sel)return;var el=p.querySelector(sel);if(el&&el.getAttribute("aria-pressed")!=="true")el.click();});}
  var n=p.querySelector(".narr");if(n){n.querySelector(".say").innerHTML=st[k-1];var sn=n.querySelector(".sn");if(sn)sn.textContent=k;
    [].forEach.call(n.querySelectorAll(".dots button"),function(b,j){b.classList.toggle("on",j===k-1);b.classList.toggle("done",j<k-1);});}}
var mo=new MutationObserver(function(){scheduleFix();if(apply._t)return;apply._t=requestAnimationFrame(function(){apply._t=0;apply();});});
mo.observe(document.getElementById("main"),{childList:true,subtree:true});
function setStep(k){step[cur]=k;apply();emitPage();var hash="#/"+pages[cur].dataset.id+(k>1?"/"+k:"");if(location.hash!==hash)history.replaceState(null,"",hash);}


/* ---- text contrast guard: text drawn on a fill it can't be read on flips to the readable ink ---- */
function lum(c){var m=String(c).match(/[\d.]+/g);if(!m||m.length<3)return null;if(m.length>3&&+m[3]===0)return null;var v=m.slice(0,3).map(function(x){x=x/255;return x<=0.03928?x/12.92:Math.pow((x+0.055)/1.055,2.4);});return 0.2126*v[0]+0.7152*v[1]+0.0722*v[2];}
function ratio(a,b){return (Math.max(a,b)+0.05)/(Math.min(a,b)+0.05);}
function fixContrast(page){if(!page)return;var cs=getComputedStyle(document.body);var bg0=lum(cs.backgroundColor);
  var dark=lum(getComputedStyle(document.documentElement).getPropertyValue("--move-ink")?"rgb(18,17,15)":"rgb(18,17,15)"),light=lum("rgb(241,236,230)");
  page.querySelectorAll("svg.dg").forEach(function(svg){var shapes=[].slice.call(svg.querySelectorAll("rect,circle,ellipse,path,polygon"));
    var boxes=shapes.map(function(e){var f=getComputedStyle(e).fill;var L=(f&&f!=="none")?lum(f):null;if(L==null)return null;try{var b=e.getBBox();if(b.width<8||b.height<8)return null;return {e:e,b:b,L:L};}catch(x){return null;}});
    var svgBg=lum(getComputedStyle(svg.closest(".figbox")||svg).backgroundColor);if(svgBg==null)svgBg=bg0;
    svg.querySelectorAll("text").forEach(function(t){if(t.dataset.f0===undefined)t.dataset.f0=t.style.fill||"";t.style.fill=t.dataset.f0;
      var tl=lum(getComputedStyle(t).fill);if(tl==null)return;var tb;try{tb=t.getBBox();}catch(x){return;}if(!tb.width)return;
      var cx=tb.x+tb.width/2,cy=tb.y+tb.height/2,under=svgBg;
      for(var i=0;i<boxes.length;i++){var o=boxes[i];if(!o)continue;if(!(o.e.compareDocumentPosition(t)&Node.DOCUMENT_POSITION_FOLLOWING))continue;
        if(cx>=o.b.x&&cx<=o.b.x+o.b.width&&cy>=o.b.y&&cy<=o.b.y+o.b.height)under=o.L;}
      if(under==null||ratio(tl,under)>=3)return;
      t.style.fill=ratio(dark,under)>=ratio(light,under)?"#12110f":"#f1ece6";});});}
var fcT=0;function scheduleFix(){if(fcT)return;fcT=setTimeout(function(){fcT=0;if(cur>=0)fixContrast(pages[cur]);},60);}
/* ---- routing ---- */
function show(i,k){if(i<0||i>=pages.length)return;var changed=i!==cur;
  if(changed){if(cur>=0)pages[cur].classList.remove("on");pages[i].classList.add("on");cur=i;window.scrollTo(0,0);
    links.forEach(function(a,j){a.classList.toggle("on",j===i);});links[i].scrollIntoView({block:"nearest"});
    seen[pages[i].dataset.id]=1;try{localStorage.setItem("lpuSeen",JSON.stringify(seen));}catch(e){}
    links.forEach(function(a,j){a.classList.toggle("seen",!!seen[pages[j].dataset.id]);});
    document.getElementById("railbar").style.width=(100*Object.keys(seen).length/pages.length)+"%";
    document.getElementById("mobTitle").textContent=pages[i].dataset.nav;document.title=(i?pages[i].dataset.nav+" · ":"")+"Inside LPULite";
    document.body.classList.remove("drawer");}
  var st=stepsOf(pages[i]);step[i]=Math.max(1,Math.min(st.length||1,k||step[i]||1));apply();scheduleFix();emitPage();}
/* ---- public hooks for the study kit ---- */
var lastEmit="";function emitPage(){if(cur<0)return;var p=pages[cur],k=step[cur]||1,key=cur+":"+k;if(key===lastEmit)return;lastEmit=key;
  window.dispatchEvent(new CustomEvent("lpu:page",{detail:window.LPU.current()}));}
window.LPU={pages:function(){return pages.map(function(p,i){return {index:i,id:p.dataset.id,nav:p.dataset.nav,part:p.dataset.part,steps:stepsOf(p).length};});},
  current:function(){if(cur<0)return null;var p=pages[cur];var st=stepsOf(p);var k=step[cur]||1;var h=p.querySelector("h2,h1");
    return {index:cur,id:p.dataset.id,nav:p.dataset.nav,part:p.dataset.part,title:h?h.textContent.trim():p.dataset.nav,step:k,steps:st.length,
      stepHtml:st[k-1]||p.dataset.say||"",el:p};},
  go:function(id,k){var i=typeof id==="number"?id:byId[id];if(i!=null)go(i,k||1);},next:function(){fwd();},prev:function(){back();},
  nextPage:function(){go(cur+1);},prevPage:function(){go(cur-1);},setStep:function(k){setStep(k);},fixContrast:function(){scheduleFix();}};
function route(){var h=location.hash.replace(/^#\/?/,"").split("/");var i=byId[h[0]||""];if(i==null)i=0;show(i,+h[1]||1);}
function go(i,k){if(i<0||i>=pages.length)return;location.hash="#/"+pages[i].dataset.id+(k>1?"/"+k:"");}
function fwd(){var n=stepsOf(pages[cur]).length;if((step[cur]||1)<n)setStep((step[cur]||1)+1);else go(cur+1);}
function back(){if((step[cur]||1)>1)setStep(step[cur]-1);else if(cur>0){var n=stepsOf(pages[cur-1]).length;go(cur-1,n||1);}}
addEventListener("hashchange",route);

/* ---- keys, search, toggles ---- */
addEventListener("keydown",function(e){if(e.target.matches("input,textarea"))return;if(e.metaKey||e.ctrlKey||e.altKey)return;
  if(e.key==="ArrowRight"){fwd();e.preventDefault();}else if(e.key==="ArrowLeft"){back();e.preventDefault();}
  else if(e.key==="ArrowDown"||e.key==="PageDown"){go(cur+1);e.preventDefault();}else if(e.key==="ArrowUp"||e.key==="PageUp"){go(cur-1);e.preventDefault();}
  else if(e.key==="/"){document.getElementById("railq").focus();document.body.classList.add("drawer");e.preventDefault();}
  else if(e.key==="w"){document.getElementById("wordsTog").click();}else if(e.key==="t"){document.getElementById("themeTog").click();}
  else if(e.key==="Escape"){document.body.classList.remove("drawer");}});
var q=document.getElementById("railq");
q.addEventListener("input",function(){var v=q.value.trim().toLowerCase();links.forEach(function(a,i){var p=pages[i];var hit=!v||(p.dataset.nav+" "+p.textContent).toLowerCase().indexOf(v)>=0;a.style.display=hit?"":"none";});});
q.addEventListener("keydown",function(e){if(e.key==="Enter"){var v=q.value.trim().toLowerCase();var vis=links.filter(function(a){return a.style.display!=="none";});var wre=new RegExp("(^|[^a-z0-9])"+v.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"));var first=vis.filter(function(a){return wre.test(pages[+a.dataset.i].dataset.nav.toLowerCase());})[0]||vis.filter(function(a){return pages[+a.dataset.i].dataset.nav.toLowerCase().indexOf(v)>=0;})[0]||vis.filter(function(a){return +a.dataset.i>0;})[0]||vis[0];if(first){location.hash=first.getAttribute("href");q.blur();}}if(e.key==="Escape"){q.value="";q.dispatchEvent(new Event("input"));q.blur();}});
var wt=document.getElementById("wordsTog");
try{if(localStorage.getItem("lpuWords")==="1"){document.body.classList.add("words-on");wt.setAttribute("aria-pressed","true");}}catch(e){}
wt.onclick=function(){var on=document.body.classList.toggle("words-on");wt.setAttribute("aria-pressed",on);try{localStorage.setItem("lpuWords",on?"1":"0");}catch(e){}};
document.getElementById("themeTog").onclick=function(){var r=document.documentElement,c=r.getAttribute("data-theme");var dark=c?c==="dark":matchMedia("(prefers-color-scheme: dark)").matches;r.setAttribute("data-theme",dark?"light":"dark");setTimeout(function(){if(cur>=0)fixContrast(pages[cur]);},30);};
if(window.matchMedia)matchMedia("(prefers-color-scheme: dark)").addEventListener("change",function(){setTimeout(function(){if(cur>=0)fixContrast(pages[cur]);},30);});
document.getElementById("menuBtn").onclick=function(){document.body.classList.toggle("drawer");};
route();
})();
