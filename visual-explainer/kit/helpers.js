(function(){
"use strict";
var NS="http://www.w3.org/2000/svg";
var $=function(id){return document.getElementById(id);};
var RM=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var ST=0;function st(k){ST=k;}
function S(tag,a,parent){var e=document.createElementNS(NS,tag);if(ST>0&&tag!=="defs"&&tag!=="marker"&&tag!=="pattern"&&tag!=="svg")e.setAttribute("data-s",ST);for(var k in a){if(k==="text"){e.textContent=a[k];continue;}
  var v=a[k];if((k==="fill"||k==="stroke")&&String(v).indexOf("url(")!==0){e.style[k]=v;}else if(k==="font-family"){e.style.fontFamily=v;}else e.setAttribute(k,v);}
  if(parent)parent.appendChild(e);return e;}
function svgRoot(host,w,h,label){ST=0;host.innerHTML="";var s=S("svg",{viewBox:"0 0 "+w+" "+h,class:"dg",role:"img","aria-label":label||""});host.appendChild(s);return s;}
function T(p,x,y,str,o){o=o||{};var a={x:x,y:y,"font-size":o.size||12,text:str};if(o.anchor)a["text-anchor"]=o.anchor;if(o.fill)a.fill=o.fill;if(o.weight)a["font-weight"]=o.weight;if(o.family)a["font-family"]=o.family;return S("text",a,p);}
function R(p,x,y,w,h,fill,o){o=o||{};var a={x:x,y:y,width:Math.max(0,w),height:Math.max(0,h),rx:o.rx||0,fill:fill};if(o.stroke){a.stroke=o.stroke;a["stroke-width"]=o.sw||1;}if(o.dash)a["stroke-dasharray"]=o.dash;if(o.op!=null)a.opacity=o.op;return S("rect",a,p);}
function L(p,x1,y1,x2,y2,stroke,o){o=o||{};var a={x1:x1,y1:y1,x2:x2,y2:y2,stroke:stroke,"stroke-width":o.sw||1};if(o.dash)a["stroke-dasharray"]=o.dash;if(o.arrow)a["marker-end"]="url(#"+o.arrow+")";return S("line",a,p);}
function arrowDef(s,id,color){var d=S("defs",{},s);var m=S("marker",{id:id,viewBox:"0 0 10 10",refX:9,refY:5,markerWidth:7,markerHeight:7,orient:"auto"},d);S("path",{d:"M0,0L10,5L0,10z",fill:color||"var(--ink)"},m);return id;}
var uid=0;function aid(){return "a"+(++uid);}
function fmt(n){return n.toLocaleString("en-US");}
// seeded rng
function rng(seed){var s=seed>>>0;return function(){s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
function gauss(r){var u=r()||1e-9,v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}

// fix var() in static svg presentation attributes
document.querySelectorAll("svg [fill^='var('], svg [stroke^='var(']").forEach(function(e){
  ["fill","stroke"].forEach(function(k){var v=e.getAttribute(k);if(v&&v.indexOf("var(")===0){e.style[k]=v;e.removeAttribute(k);}});
});

// ---------- tooltip ----------
var tip=$("tip");
function showTip(ev,html){tip.innerHTML=html;tip.style.opacity=1;var x=ev.clientX+14,y=ev.clientY+14;var w=tip.offsetWidth,h=tip.offsetHeight;
  if(x+w>innerWidth-8)x=ev.clientX-w-14;if(y+h>innerHeight-8)y=ev.clientY-h-14;tip.style.left=x+"px";tip.style.top=y+"px";}
function hideTip(){tip.style.opacity=0;}
function hover(el,html){el.style.cursor="help";el.addEventListener("mousemove",function(e){showTip(e,typeof html==="function"?html():html);});el.addEventListener("mouseleave",hideTip);}

// seg helper
function seg(id,cb){var g=$(id);var bs=[].slice.call(g.querySelectorAll("button"));bs.forEach(function(b){b.onclick=function(){bs.forEach(function(x){x.setAttribute("aria-pressed",x===b);});cb(b.dataset);};});
  var cur=bs.filter(function(b){return b.getAttribute("aria-pressed")==="true";})[0]||bs[0];cb(cur.dataset);}

