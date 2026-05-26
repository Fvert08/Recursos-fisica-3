'use strict';
(function(){const cv=document.getElementById('cv2'); if(!cv) return; const ctx=cv.getContext('2d');
let f=1,d0=2,h0=1,conv=true; function di(){return 1/(1/f-1/d0);} function mag(){return -di()/d0;}
function draw(){const W=cv.width,H=cv.height; bgd(ctx,W,H); const ax=W*0.25,y0=H/2,ppm=85; ctx.strokeStyle='#90caf9';ctx.beginPath();ctx.moveTo(20,y0);ctx.lineTo(W-20,y0);ctx.stroke(); const mx=W*0.55;
ctx.strokeStyle=conv?'#64b5f6':'#ba68c8';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(mx,35);ctx.lineTo(mx,H-35);ctx.stroke();
const ox=ax+d0*ppm,oh=h0*ppm; ctx.strokeStyle='#ffcc80';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(ox,y0);ctx.lineTo(ox,y0-oh);ctx.stroke();
const div=di(), ix=mx+div*ppm, ih=h0*mag()*ppm; ctx.strokeStyle=div>0?'#69f0ae':'rgba(105,240,174,.6)';ctx.setLineDash(div>0?[]:[4,4]);ctx.beginPath();ctx.moveTo(ix,y0);ctx.lineTo(ix,y0-ih);ctx.stroke();ctx.setLineDash([]);
 document.getElementById('r2a').textContent=f.toFixed(2)+' m'; document.getElementById('r2b').textContent=div.toFixed(2)+' m'; document.getElementById('r2c').textContent=mag().toFixed(2);
}
function upd(){const dv=di(); document.getElementById('cl2').innerHTML=chHTML([{f:'1/f = 1/d₀ + 1/dᵢ',v:(1/f).toFixed(3),u:'1/m'},{f:'dᵢ',v:dv.toFixed(3),u:'m'},{f:'m = -dᵢ/d₀',v:mag().toFixed(3),u:'—'},{f:'R = 2f',v:(2*f).toFixed(3),u:'m'}]);}
function init(){cv.width=cv.parentElement.clientWidth||460;draw();upd();}
document.getElementById('bb2').onclick=()=>{conv=!conv; f=Math.abs(f)*(conv?1:-1); document.getElementById('bb2').textContent=conv?'↔ Cambiar a Convexo':'↔ Cambiar a Cóncavo'; draw();upd();};
document.getElementById('br2').onclick=()=>{f=1;d0=2;h0=1;conv=true;document.getElementById('s2f').value=1;document.getElementById('s2d').value=2;document.getElementById('s2h').value=1;document.getElementById('d2f').textContent='1.0 m';document.getElementById('d2d').textContent='2.0 m';document.getElementById('d2h').textContent='1.0 m';draw();upd();};
['f','d','h'].forEach(k=>document.getElementById('s2'+k).oninput=e=>{if(k==='f'){f=(conv?1:-1)*+e.target.value;document.getElementById('d2f').textContent=(+e.target.value).toFixed(1)+' m';} if(k==='d'){d0=+e.target.value;document.getElementById('d2d').textContent=d0.toFixed(1)+' m';} if(k==='h'){h0=+e.target.value;document.getElementById('d2h').textContent=h0.toFixed(1)+' m';} draw();upd();});
window.simInits[1]=init; init();})();
