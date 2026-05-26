'use strict';
(function(){const cv=document.getElementById('cv4'); if(!cv) return; const ctx=cv.getContext('2d'); let f=1,d0=2,h0=1,conv=true;
const di=()=>1/(1/f-1/d0), m=()=>-di()/d0;
function draw(){const W=cv.width,H=cv.height; bgd(ctx,W,H); const y0=H/2,mx=W*0.55,ppm=85; ctx.strokeStyle='#90caf9';ctx.beginPath();ctx.moveTo(20,y0);ctx.lineTo(W-20,y0);ctx.stroke();
ctx.strokeStyle=conv?'#64b5f6':'#ba68c8';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(mx,30);ctx.lineTo(mx,H-30);ctx.stroke();
const ox=mx-d0*ppm,oh=h0*ppm; ctx.strokeStyle='#ffcc80';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(ox,y0);ctx.lineTo(ox,y0-oh);ctx.stroke();
const iv=di(), ix=mx+iv*ppm, ih=h0*m()*ppm; ctx.strokeStyle=iv>0?'#69f0ae':'rgba(105,240,174,.7)';ctx.setLineDash(iv>0?[]:[4,4]);ctx.beginPath();ctx.moveTo(ix,y0);ctx.lineTo(ix,y0-ih);ctx.stroke();ctx.setLineDash([]);
 document.getElementById('r4a').textContent=iv.toFixed(2)+' m';document.getElementById('r4b').textContent=m().toFixed(2);document.getElementById('r4c').textContent=(1/f).toFixed(2)+' D';}
function upd(){document.getElementById('cl4').innerHTML=chHTML([{f:'1/f = 1/d₀ + 1/dᵢ',v:(1/f).toFixed(4),u:'1/m'},{f:'dᵢ',v:di().toFixed(4),u:'m'},{f:'m',v:m().toFixed(4),u:'—'},{f:'P=1/f',v:(1/f).toFixed(4),u:'D'}]);}
function init(){cv.width=cv.parentElement.clientWidth||460;draw();upd();}
document.getElementById('bb4').onclick=()=>{conv=!conv; f=Math.abs(f)*(conv?1:-1); document.getElementById('bb4').textContent=conv?'↔ Cambiar a Divergente':'↔ Cambiar a Convergente'; draw();upd();};
document.getElementById('br4').onclick=()=>{f=1;d0=2;h0=1;conv=true;['s4f','s4d','s4h'].forEach((id,i)=>document.getElementById(id).value=[1,2,1][i]);document.getElementById('d4f').textContent='1.0 m';document.getElementById('d4d').textContent='2.0 m';document.getElementById('d4h').textContent='1.0 m';draw();upd();};
['f','d','h'].forEach(k=>document.getElementById('s4'+k).oninput=e=>{if(k==='f'){f=(conv?1:-1)*+e.target.value;document.getElementById('d4f').textContent=(+e.target.value).toFixed(1)+' m';} if(k==='d'){d0=+e.target.value;document.getElementById('d4d').textContent=d0.toFixed(1)+' m';} if(k==='h'){h0=+e.target.value;document.getElementById('d4h').textContent=h0.toFixed(1)+' m';} draw();upd();});
window.simInits[3]=init; init();})();
