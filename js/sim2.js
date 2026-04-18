//Masa-Resorte Vertical
'use strict';
(function () {
  const cv  = document.getElementById('cv2');
  const ctx = cv.getContext('2d');
  const PPM = 300;

  let m = 1, k = 20, A = .08, t = 0;
  let running = false, raf = null, drag = false, negY = false;

  const om  = () => Math.sqrt(k / m);
  const del = () => m * GV / k;
  const yp  = () => A * Math.cos(om() * t) * (negY ? -1 : 1);
  const yv  = () => -A * om() * Math.sin(om() * t) * (negY ? -1 : 1);

  function draw() {
    const W = cv.width, H = cv.height;
    bgd(ctx, W, H);

    const cx = W / 2, visEqY = H * .55, bW = 40, bH = 40;
    const cur = yp(), bCX = cx, bCY = visEqY + cur * PPM;

    // Techo
    ctx.fillStyle = '#162d47'; ctx.fillRect(cx - 22, 0, 44, 22);
    ctx.strokeStyle = '#2196f3'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 22); ctx.lineTo(W, 22); ctx.stroke();
    ctx.strokeStyle = '#1a3a5f'; ctx.lineWidth = 1;
    for (let i = -8; i < 44 + 8; i += 14) { ctx.beginPath(); ctx.moveTo(cx - 22 + i, 22); ctx.lineTo(cx - 22 + i + 12, 10); ctx.stroke(); }

    // Equilibrio
    ctx.strokeStyle = 'rgba(255,160,0,.4)'; ctx.lineWidth = 1; ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(cx - 36, visEqY); ctx.lineTo(cx + 36, visEqY); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,179,0,.7)'; ctx.font = '10px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('Equilibrio', cx + 38, visEqY);

    // Resorte
    ctx.strokeStyle = '#90caf9'; ctx.lineWidth = 1.8;
    drawSpr(ctx, cx, 22, cx, bCY - bH / 2, 8);

    // Bloque
    const g1 = ctx.createLinearGradient(bCX - bW / 2, bCY - bH / 2, bCX + bW / 2, bCY + bH / 2);
    g1.addColorStop(0, '#42a5f5'); g1.addColorStop(1, '#0d47a1');
    ctx.fillStyle = g1; ctx.strokeStyle = '#90caf9'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(bCX - bW / 2, bCY - bH / 2, bW, bH, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('m', bCX, bCY);

    // Flecha
    if (Math.abs(cur) > .004) {
      const ax = bCX + bW / 2 + 14, dir = cur > 0 ? 1 : -1;
      ctx.strokeStyle = '#ffb300'; ctx.fillStyle = '#ffb300'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(ax, visEqY); ctx.lineTo(ax, bCY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ax, bCY); ctx.lineTo(ax - 4, bCY - dir * 7); ctx.lineTo(ax + 4, bCY - dir * 7); ctx.fill();
      ctx.fillStyle = '#ffe082'; ctx.font = '10px monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText('y=' + cur.toFixed(3) + 'm', ax + 6, (visEqY + bCY) / 2);
    }

    ctx.fillStyle = '#4fc3f7'; ctx.font = '10px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('k=' + k + ' N/m   δ=' + del().toFixed(3) + 'm', 6, 4);

    document.getElementById('r2y').textContent = cur.toFixed(4) + ' m';
    document.getElementById('r2v').textContent = yv().toFixed(4) + ' m/s';
    document.getElementById('r2d').textContent = del().toFixed(4) + ' m';
  }

  function updCalc() {
    const w = om(), T = P2 / w, d = del(), E = .5 * k * A * A;
    document.getElementById('cl2').innerHTML = chHTML([
      { f: 'ω = √(k/m)',  v: w.toFixed(4),       u: 'rad/s' },
      { f: 'T = 2π/ω',   v: T.toFixed(4),       u: 's'     },
      { f: 'δ = mg/k',   v: d.toFixed(4),       u: 'm'     },
      { f: 'E = ½kA²',   v: E.toFixed(4),       u: 'J'     },
      { f: 'v_max = ωA', v: (w * A).toFixed(4), u: 'm/s'   },
      { f: 'f = ω/2π',   v: (w/P2).toFixed(4),  u: 'Hz'    },
    ]);
  }

  function loop() { if (!running) return; t += .016; draw(); raf = requestAnimationFrame(loop); }

  function init() {
    cv.width = cv.parentElement.clientWidth || 460;
    draw(); updCalc();
  }

  document.getElementById('bb2').onclick = () => {
    running = !running;
    document.getElementById('bb2').textContent = running ? '⏸ Pausar' : '▶ Continuar';
    if (running) loop(); else cancelAnimationFrame(raf);
  };
  document.getElementById('br2').onclick = () => {
    running = false; t = 0; negY = false; cancelAnimationFrame(raf);
    document.getElementById('bb2').textContent = '▶ Iniciar'; draw(); updCalc();
  };
  document.getElementById('s2m').oninput = e => { m = +e.target.value; document.getElementById('d2m').textContent = m.toFixed(1)+' kg'; t=0; draw(); updCalc(); };
  document.getElementById('s2k').oninput = e => { k = +e.target.value; document.getElementById('d2k').textContent = k+' N/m'; t=0; draw(); updCalc(); };
  document.getElementById('s2A').oninput = e => { A = +e.target.value; document.getElementById('d2A').textContent = A.toFixed(2)+' m'; t=0; draw(); updCalc(); };

  function sd(e) {
    const p = gpos(e, cv), bCX = cv.width / 2, bCY = cv.height * .55 + yp() * PPM;
    if (Math.abs(p.x - bCX) < 26 && Math.abs(p.y - bCY) < 26) {
      drag = true; running = false; cancelAnimationFrame(raf);
      document.getElementById('bb2').textContent = '▶ Continuar';
    }
  }
  function sm(e) {
    if (!drag) return; e.preventDefault();
    const p = gpos(e, cv), raw = (p.y - cv.height * .55) / PPM;
    A = Math.min(.12, Math.max(.01, Math.abs(raw))); negY = raw < 0; t = 0;
    document.getElementById('s2A').value = A; document.getElementById('d2A').textContent = A.toFixed(2) + ' m';
    draw(); updCalc();
  }
  function se() { drag = false; }

  cv.addEventListener('mousedown', sd); cv.addEventListener('mousemove', sm);
  cv.addEventListener('mouseup', se);   cv.addEventListener('mouseleave', se);
  cv.addEventListener('touchstart', e => { e.preventDefault(); sd(e); }, { passive: false });
  cv.addEventListener('touchmove',  e => { e.preventDefault(); sm(e); }, { passive: false });
  cv.addEventListener('touchend', se);

  window.simInits[1] = init;
  init();
})();