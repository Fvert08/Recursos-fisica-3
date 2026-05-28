//Péndulo Simple
'use strict';
(function () {
  const cv  = document.getElementById('cv3');
  const ctx = cv.getContext('2d');

  let L = 1, m = 1, th0d = 15;
  let th, om, running = false, raf = null, drag = false, last = null;

  const om0   = () => Math.sqrt(GV / L);
  const scale = () => Math.min((cv.height - 58) / Math.max(L, .1), 155);

  function rst() { th = th0d * Math.PI / 180; om = 0; }

  function draw() {
    const W = cv.width, H = cv.height;
    bgd(ctx, W, H);
    const pX = W / 2, pY = 38, S = scale();
    const bX = pX + S * L * Math.sin(th), bY = pY + S * L * Math.cos(th);
    const bobR = Math.max(7, Math.min(14, 5 + m * 1.5));

    // Arco de amplitud
    ctx.strokeStyle = 'rgba(255,160,0,.18)'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(pX, pY, S * L, Math.PI/2 - Math.abs(th0d*Math.PI/180), Math.PI/2 + Math.abs(th0d*Math.PI/180));
    ctx.stroke();

    // Techo
    ctx.fillStyle = '#162d47'; ctx.fillRect(pX - 16, 0, 32, pY);
    ctx.strokeStyle = '#2196f3'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, pY); ctx.lineTo(W, pY); ctx.stroke();
    ctx.strokeStyle = '#1a3a5f'; ctx.lineWidth = 1;
    for (let i = -8; i < 34; i += 14) { ctx.beginPath(); ctx.moveTo(pX - 16 + i, pY); ctx.lineTo(pX - 16 + i + 12, pY - 12); ctx.stroke(); }

    // Vertical de referencia
    ctx.strokeStyle = 'rgba(255,160,0,.25)'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(pX, pY); ctx.lineTo(pX, pY + S * L + 12); ctx.stroke(); ctx.setLineDash([]);

    // Hilo
    ctx.strokeStyle = '#90caf9'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(pX, pY); ctx.lineTo(bX, bY); ctx.stroke();

    // Pivote
    ctx.fillStyle = '#455a64'; ctx.strokeStyle = '#90caf9'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(pX, pY, 5, 0, P2); ctx.fill(); ctx.stroke();

    // Bob
    const bg = ctx.createRadialGradient(bX - 3, bY - 3, 1, bX, bY, bobR);
    bg.addColorStop(0, '#ffb74d'); bg.addColorStop(1, '#e65100');
    ctx.fillStyle = bg; ctx.strokeStyle = '#ffcc02'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(bX, bY, bobR, 0, P2); ctx.fill(); ctx.stroke();

    // Info
    ctx.fillStyle = '#ffe082'; ctx.font = '11px monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('θ=' + (th * 180 / Math.PI).toFixed(2) + '°', 6, 4);
    ctx.fillText('L=' + L.toFixed(2) + 'm  m=' + m.toFixed(1) + 'kg', 6, 18);

    document.getElementById('r3t').textContent = (th * 180 / Math.PI).toFixed(2) + '°';
    document.getElementById('r3w').textContent = om.toFixed(4) + ' r/s';
    document.getElementById('r3v').textContent = (Math.abs(om) * L).toFixed(4) + ' m/s';
  }

  function updCalc() {
    const w = om0(), T = P2 / w, th0r = th0d * Math.PI / 180, vm = th0r * Math.sqrt(GV * L);
    document.getElementById('cl3').innerHTML = chHTML([
      { f: 'ω₀ = √(g/L)',       v: w.toFixed(4),  u: 'rad/s' },
      { f: 'T = 2π/ω₀',         v: T.toFixed(4),  u: 's'     },
      { f: 'f = 1/T',            v: (1/T).toFixed(4), u: 'Hz' },
      { f: 'v_max = θ₀√(gL)',   v: vm.toFixed(4), u: 'm/s'   },
      { f: 'θ₀ (rad)',           v: th0r.toFixed(4), u: 'rad' },
    ]);
  }

  function step(ts) {
    if (!running) return;
    if (last) {
      const dt = Math.min((ts - last) / 1000, .04), n = 8, dts = dt / n;
      for (let i = 0; i < n; i++) { const s = rk4(th, om, dts, t => -GV / L * Math.sin(t)); th = s.th; om = s.om; }
    }
    last = ts; draw(); raf = requestAnimationFrame(step);
  }

  function init() { cv.width = cv.parentElement.clientWidth || 460; rst(); draw(); updCalc(); }

  document.getElementById('bb3').onclick = () => {
    running = !running; last = null;
    document.getElementById('bb3').textContent = running ? '⏸ Pausar' : '▶ Continuar';
    if (running) raf = requestAnimationFrame(step); else cancelAnimationFrame(raf);
  };
  document.getElementById('br3').onclick = () => {
    running = false; last = null; cancelAnimationFrame(raf);
    document.getElementById('bb3').textContent = '▶ Iniciar'; rst(); draw(); updCalc();
  };
  document.getElementById('s3L').oninput = e => { L = +e.target.value; document.getElementById('d3L').textContent = L.toFixed(2)+' m'; rst(); draw(); updCalc(); };
  document.getElementById('s3m').oninput = e => { m = +e.target.value; document.getElementById('d3m').textContent = m.toFixed(1)+' kg'; draw(); };
  document.getElementById('s3t').oninput = e => { th0d = +e.target.value; document.getElementById('d3t').textContent = th0d+'°'; rst(); draw(); updCalc(); };

  function sd(e) {
    const p = gpos(e, cv), S = scale();
    const bX = cv.width / 2 + S * L * Math.sin(th), bY = 38 + S * L * Math.cos(th);
    if (Math.hypot(p.x - bX, p.y - bY) < 22) {
      drag = true; running = false; last = null; cancelAnimationFrame(raf);
      document.getElementById('bb3').textContent = '▶ Continuar';
    }
  }
  function sm(e) {
    if (!drag) return; e.preventDefault();
    const p = gpos(e, cv);
    th = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, Math.atan2(p.x - cv.width / 2, p.y - 38)));
    om = 0; th0d = Math.abs(th) * 180 / Math.PI;
    document.getElementById('s3t').value = Math.round(th0d);
    document.getElementById('d3t').textContent = Math.round(th0d) + '°';
    draw(); updCalc();
  }
  function se() { drag = false; }

  cv.addEventListener('mousedown', sd); cv.addEventListener('mousemove', sm);
  cv.addEventListener('mouseup', se);   cv.addEventListener('mouseleave', se);
  cv.addEventListener('touchstart', e => { e.preventDefault(); sd(e); }, { passive: false });
  cv.addEventListener('touchmove',  e => { e.preventDefault(); sm(e); }, { passive: false });
  cv.addEventListener('touchend', se);

  window.simInits[2] = init;
  init();
})();