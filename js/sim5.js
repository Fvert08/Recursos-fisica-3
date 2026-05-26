'use strict';
(function(){
const cv=document.getElementById('cv1'); if(!cv) return; const ctx=cv.getContext('2d');
let theta=35,d0=1.2,h0=1,running=false,raf=null;
function calc(){return{thetaR:theta,di:d0,hi:h0,m:1};}
function draw(){const W=cv.width,H=cv.height;bgd(ctx,W,H);const mx=W*0.62;ctx.strokeStyle='#b0bec5';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(mx,20);ctx.lineTo(mx,H-20);ctx.stroke();ctx.setLineDash([6,5]);ctx.strokeStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.moveTo(mx,18);ctx.lineTo(mx,H-18);ctx.stroke();ctx.setLineDash([]);
const baseY=H*0.72,ppm=120,ox=mx-d0*ppm,oy=baseY-h0*70;ctx.strokeStyle='#ffd54f';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(ox,baseY);ctx.lineTo(ox,oy);ctx.stroke();
const hitY=H*0.42;const dx=(hitY-oy)*Math.tan(theta*Math.PI/180);const hx=mx-dx;ctx.strokeStyle='#ff7043';ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(mx,hitY);ctx.stroke();ctx.strokeStyle='#4fc3f7';ctx.beginPath();ctx.moveTo(mx,hitY);ctx.lineTo(mx+dx,oy);ctx.stroke();
ctx.setLineDash([4,4]);ctx.strokeStyle='rgba(79,195,247,.45)';ctx.beginPath();ctx.moveTo(mx,hitY);ctx.lineTo(mx-dx,oy);ctx.stroke();ctx.setLineDash([]);
document.getElementById('r1ti').textContent=theta.toFixed(1)+'°';document.getElementById('r1tr').textContent=theta.toFixed(1)+'°';document.getElementById('r1di').textContent=d0.toFixed(2)+' m';}
function updCalc(){const c=calc();document.getElementById('cl1').innerHTML=chHTML([{f:'θᵢ',v:c.thetaR.toFixed(2),u:'°'},{f:'θᵣ',v:c.thetaR.toFixed(2),u:'°'},{f:'dᵢ',v:c.di.toFixed(3),u:'m'},{f:'m',v:c.m.toFixed(2),u:'—'},{f:'hᵢ',v:c.hi.toFixed(2),u:'m'}]);}
function loop(){if(!running)return;theta+=0.2;if(theta>75)theta=15;document.getElementById('s1t').value=theta;document.getElementById('d1t').textContent=theta.toFixed(0)+'°';draw();updCalc();raf=requestAnimationFrame(loop);} 
function init(){cv.width=cv.parentElement.clientWidth||460;draw();updCalc();}
document.getElementById('bb1').onclick=()=>{running=!running;document.getElementById('bb1').textContent=running?'⏸ Pausar':'▶ Continuar';if(running)loop();else cancelAnimationFrame(raf);};
document.getElementById('br1').onclick=()=>{running=false;cancelAnimationFrame(raf);theta=35;d0=1.2;h0=1;document.getElementById('bb1').textContent='▶ Iniciar';['s1t','s1d','s1h'].forEach((id,i)=>document.getElementById(id).value=[35,1.2,1][i]);document.getElementById('d1t').textContent='35°';document.getElementById('d1d').textContent='1.20 m';document.getElementById('d1h').textContent='1.00 m';draw();updCalc();};
document.getElementById('s1t').oninput=e=>{theta=+e.target.value;document.getElementById('d1t').textContent=theta+'°';draw();updCalc();};
document.getElementById('s1d').oninput=e=>{d0=+e.target.value;document.getElementById('d1d').textContent=d0.toFixed(2)+' m';draw();updCalc();};
document.getElementById('s1h').oninput=e=>{h0=+e.target.value;document.getElementById('d1h').textContent=h0.toFixed(2)+' m';draw();updCalc();};
window.simInits[0]=init;init();})();
