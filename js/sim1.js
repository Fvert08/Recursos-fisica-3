// Masa-Resorte Horizontal
'use strict';
(function () {
  const cv  = document.getElementById('cv1');
  const ctx = cv.getContext('2d');
  const PPM = 210;

  let m = 1, k = 20, A = .15, t = 0;
  let running = false, raf = null, drag = false, negX = false;

  const om   = () => Math.sqrt(k / m);
  const xpos = () => A * Math.cos(om() * t) * (negX ? -1 : 1);
  const xvel = () => -A * om() * Math.sin(om() * t) * (negX ? -1 : 1);
  const xacc = () => -A * om() * om() * Math.cos(om() * t) * (negX ? -1 : 1);

  function draw() {
    const W = cv.width, H = cv.height;
    bgd(ctx, W, H);

    const wX = 26, flY = H - 26, eqX = W * .52, bW = 38, bH = 38;
    const cx = xpos(), bCX = eqX + cx * PPM, bCY = flY - bH / 2;

    // Pared
    ctx.fillStyle = '#162d47'; ctx.fillRect(0, 0, wX, flY);
    ctx.strokeStyle = '#2196f3'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(wX, 0); ctx.lineTo(wX, flY); ctx.stroke();
    ctx.strokeStyle = '#1a3a5f'; ctx.lineWidth = 1;
    for (let i = 0; i < flY; i += 16) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(wX, i + 16); ctx.stroke(); }

    // Piso
    ctx.fillStyle = '#162d47'; ctx.fillRect(0, flY, W, H);
    ctx.strokeStyle = '#2196f3'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(wX, flY); ctx.lineTo(W, flY); ctx.stroke();
    ctx.strokeStyle = '#1a3a5f'; ctx.lineWidth = 1;
    for (let i = 0; i < W; i += 14) { ctx.beginPath(); ctx.moveTo(i, flY); ctx.lineTo(i + 12, flY + 12); ctx.stroke(); }

    // Línea de equilibrio
    ctx.strokeStyle = 'rgba(255,160,0,.4)'; ctx.lineWidth = 1; ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(eqX, 0); ctx.lineTo(eqX, flY); ctx.stroke(); ctx.setLineDash([]);

    // Resorte
    ctx.strokeStyle = '#90caf9'; ctx.lineWidth = 1.8;
    drawSpr(ctx, wX, bCY, bCX - bW / 2, bCY);

    // Bloque
    const g1 = ctx.createLinearGradient(bCX - bW / 2, bCY - bH / 2, bCX + bW / 2, bCY + bH / 2);
    g1.addColorStop(0, '#42a5f5'); g1.addColorStop(1, '#0d47a1');
    ctx.fillStyle = g1; ctx.strokeStyle = '#90caf9'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(bCX - bW / 2, bCY - bH / 2, bW, bH, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('m', bCX, bCY);

    // Flecha de desplazamiento
    if (Math.abs(cx) > .004) {
      const ay = bCY - bH / 2 - 10, dir = cx > 0 ? 1 : -1;
      ctx.strokeStyle = '#ffb300'; ctx.fillStyle = '#ffb300'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(eqX, ay); ctx.lineTo(bCX, ay); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bCX, ay); ctx.lineTo(bCX - dir * 7, ay - 4); ctx.lineTo(bCX - dir * 7, ay + 4); ctx.fill();
      ctx.fillStyle = '#ffe082'; ctx.font = '10px monospace';
      ctx.textAlign = cx > 0 ? 'right' : 'left'; ctx.textBaseline = 'bottom';
      ctx.fillText('x=' + cx.toFixed(3) + 'm', eqX - (cx > 0 ? 2 : -2), ay);
    }

    // Info
    ctx.fillStyle = '#4fc3f7'; ctx.font = '10px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('k=' + k + ' N/m, m=' + m + ' kg', wX + 4, 4);

    // Readouts
    document.getElementById('r1x').textContent = cx.toFixed(4) + ' m';
    document.getElementById('r1v').textContent = xvel().toFixed(4) + ' m/s';
    document.getElementById('r1a').textContent = xacc().toFixed(4) + ' m/s²';
  }

  function updCalc() {
    const w = om(), T = P2 / w, f = w / P2, E = .5 * k * A * A;
    document.getElementById('cl1').innerHTML = chHTML([
      { f: 'ω = √(k/m)',  v: w.toFixed(4),         u: 'rad/s' },
      { f: 'T = 2π/ω',   v: T.toFixed(4),         u: 's'     },
      { f: 'f = ω/2π',   v: f.toFixed(4),         u: 'Hz'    },
      { f: 'E = ½kA²',   v: E.toFixed(4),         u: 'J'     },
      { f: 'v_max = ωA', v: (w * A).toFixed(4),   u: 'm/s'   },
      { f: 'a_max = ω²A',v: (w*w*A).toFixed(4),   u: 'm/s²'  },
    ]);
  }

  function loop() { if (!running) return; t += .016; draw(); raf = requestAnimationFrame(loop); }

  function init() {
    cv.width = cv.parentElement.clientWidth || 460;
    draw(); updCalc();
  }

  document.getElementById('bb1').onclick = () => {
    running = !running;
    document.getElementById('bb1').textContent = running ? '⏸ Pausar' : '▶ Continuar';
    if (running) loop(); else cancelAnimationFrame(raf);
  };
  document.getElementById('br1').onclick = () => {
    running = false; t = 0; negX = false; cancelAnimationFrame(raf);
    document.getElementById('bb1').textContent = '▶ Iniciar';
    draw(); updCalc();
  };
  document.getElementById('s1m').oninput = e => { m = +e.target.value; document.getElementById('d1m').textContent = m.toFixed(1) + ' kg'; t = 0; draw(); updCalc(); };
  document.getElementById('s1k').oninput = e => { k = +e.target.value; document.getElementById('d1k').textContent = k + ' N/m'; t = 0; draw(); updCalc(); };
  document.getElementById('s1A').oninput = e => { A = +e.target.value; document.getElementById('d1A').textContent = A.toFixed(2) + ' m'; t = 0; draw(); updCalc(); };

  // Drag
  function sd(e) {
    const p = gpos(e, cv), bCX = cv.width * .52 + xpos() * PPM, bCY = cv.height - 26 - 19;
    if (Math.abs(p.x - bCX) < 26 && Math.abs(p.y - bCY) < 26) {
      drag = true; running = false; cancelAnimationFrame(raf);
      document.getElementById('bb1').textContent = '▶ Continuar';
    }
  }
  function sm(e) {
    if (!drag) return; e.preventDefault();
    const p = gpos(e, cv), raw = (p.x - cv.width * .52) / PPM;
    A = Math.min(.35, Math.max(.02, Math.abs(raw))); negX = raw < 0; t = 0;
    document.getElementById('s1A').value = A; document.getElementById('d1A').textContent = A.toFixed(2) + ' m';
    draw(); updCalc();
  }
  function se() { drag = false; }

  cv.addEventListener('mousedown', sd); cv.addEventListener('mousemove', sm);
  cv.addEventListener('mouseup', se);   cv.addEventListener('mouseleave', se);
  cv.addEventListener('touchstart', e => { e.preventDefault(); sd(e); }, { passive: false });
  cv.addEventListener('touchmove',  e => { e.preventDefault(); sm(e); }, { passive: false });
  cv.addEventListener('touchend', se);

  window.simInits[0] = init;
  init();
})();