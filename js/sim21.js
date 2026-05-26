'use strict';
(function(){
const cv=document.getElementById('cv1'); if(!cv) return; const ctx=cv.getContext('2d');
let d0=2,h0=1,ti=35,t=0,running=false,raf=null;
const ppm=80;
function calc(){const tr=ti,di=d0,hi=h0,m=1; return {tr,di,hi,m};}
function draw(){const W=cv.width,H=cv.height; bgd(ctx,W,H); const mx=W*0.56; ctx.strokeStyle='#90caf9';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(mx,20);ctx.lineTo(mx,H-20);ctx.stroke();
ctx.strokeStyle='rgba(255,255,255,.25)';ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(mx-120,H/2);ctx.lineTo(mx+120,H/2);ctx.stroke();ctx.setLineDash([]);
const y0=H/2, ox=mx-d0*ppm, oh=h0*ppm; ctx.strokeStyle='#ffcc80';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(ox,y0);ctx.lineTo(ox,y0-oh);ctx.stroke();
const ang=(ti+10*Math.sin(t))*Math.PI/180; const hitY=y0-60; const x1=ox,y1=y0-oh,xh=mx,yh=hitY; ctx.strokeStyle='#ff5252';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(xh,yh);ctx.stroke();
const xr=mx-140*Math.cos(ang), yr=hitY-140*Math.sin(ang); ctx.strokeStyle='#4fc3f7';ctx.beginPath();ctx.moveTo(xh,yh);ctx.lineTo(xr,yr);ctx.stroke();
const xref=mx+140*Math.cos(ang), yref=hitY-140*Math.sin(ang); ctx.strokeStyle='#69f0ae';ctx.beginPath();ctx.moveTo(xh,yh);ctx.lineTo(xref,yref);ctx.stroke();
const imgx=mx+d0*ppm, imgh=h0*ppm; ctx.strokeStyle='rgba(255,193,7,.7)';ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(imgx,y0);ctx.lineTo(imgx,y0-imgh);ctx.stroke();ctx.setLineDash([]);
const c=calc(); document.getElementById('r1a').textContent=(ti+10*Math.sin(t)).toFixed(2)+'°';document.getElementById('r1b').textContent=c.tr.toFixed(2)+'°';document.getElementById('r1c').textContent=c.di.toFixed(2)+' m';
}
function updCalc(){const c=calc(); document.getElementById('cl1').innerHTML=chHTML([{f:'θᵢ = θᵣ',v:c.tr.toFixed(3),u:'°'},{f:'dᵢ = d₀',v:c.di.toFixed(3),u:'m'},{f:'m = hᵢ/h₀',v:c.m.toFixed(3),u:'—'},{f:'hᵢ',v:c.hi.toFixed(3),u:'m'}]);}
function loop(){if(!running) return; t+=0.03; draw(); raf=requestAnimationFrame(loop);} function init(){cv.width=cv.parentElement.clientWidth||460; draw(); updCalc();}
document.getElementById('bb1').onclick=()=>{running=!running;document.getElementById('bb1').textContent=running?'⏸ Pausar':'▶ Continuar'; if(running) loop(); else cancelAnimationFrame(raf);};
document.getElementById('br1').onclick=()=>{running=false;t=0;cancelAnimationFrame(raf);document.getElementById('bb1').textContent='▶ Iniciar';draw();updCalc();};
document.getElementById('s1d').oninput=e=>{d0=+e.target.value;document.getElementById('d1d').textContent=d0.toFixed(1)+' m';draw();updCalc();};
document.getElementById('s1h').oninput=e=>{h0=+e.target.value;document.getElementById('d1h').textContent=h0.toFixed(1)+' m';draw();updCalc();};
document.getElementById('s1t').oninput=e=>{ti=+e.target.value;document.getElementById('d1t').textContent=ti+'°';draw();updCalc();};
window.simInits[0]=init; init();
})();
