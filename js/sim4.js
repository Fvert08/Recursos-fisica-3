//Péndulo Físico
'use strict';
(function () {
  const cv  = document.getElementById('cv4');
  const ctx = cv.getContext('2d');

  let L = 1, m = 1, th0d = 15;
  let th, om, running = false, raf = null, drag = false, last = null;

  const Ifn    = () => m * L * L / 3;
  const d      = () => L / 2;
  const alphafn = t => -(m * GV * d() / Ifn()) * Math.sin(t);
  const om0    = () => Math.sqrt(m * GV * d() / Ifn());
  const Tfn    = () => P2 / om0();
  const scale  = () => Math.min((cv.height - 58) / Math.max(L, .1), 148);

  function rst() { th = th0d * Math.PI / 180; om = 0; }

  function draw() {
    const W = cv.width, H = cv.height;
    bgd(ctx, W, H);
    const pX = W / 2, pY = 38, S = scale();
    const cmX = pX + S * (L / 2) * Math.sin(th), cmY = pY + S * (L / 2) * Math.cos(th);
    const rW = 10;

    // Arco
    ctx.strokeStyle = 'rgba(255,160,0,.15)'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(pX, pY, S * L, Math.PI/2 - Math.abs(th0d*Math.PI/180), Math.PI/2 + Math.abs(th0d*Math.PI/180));
    ctx.stroke();

    // Techo
    ctx.fillStyle = '#162d47'; ctx.fillRect(pX - 18, 0, 36, pY);
    ctx.strokeStyle = '#2196f3'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, pY); ctx.lineTo(W, pY); ctx.stroke();
    ctx.strokeStyle = '#1a3a5f'; ctx.lineWidth = 1;
    for (let i = -8; i < 38; i += 14) { ctx.beginPath(); ctx.moveTo(pX - 18 + i, pY); ctx.lineTo(pX - 18 + i + 12, pY - 12); ctx.stroke(); }

    // Vertical ref
    ctx.strokeStyle = 'rgba(255,160,0,.22)'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(pX, pY); ctx.lineTo(pX, pY + S * L + 12); ctx.stroke(); ctx.setLineDash([]);

    // Varilla
    ctx.save(); ctx.translate(pX, pY); ctx.rotate(th);
    const rg = ctx.createLinearGradient(-rW / 2, 0, rW / 2, S * L);
    rg.addColorStop(0, '#42a5f5'); rg.addColorStop(1, '#0d47a1');
    ctx.fillStyle = rg; ctx.strokeStyle = '#90caf9'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.roundRect(-rW / 2, 0, rW, S * L, 3); ctx.fill(); ctx.stroke();
    // Marca CM
    ctx.strokeStyle = '#ff9800'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, S * L / 2, 5, 0, P2); ctx.stroke();
    ctx.fillStyle = '#ff9800'; ctx.beginPath(); ctx.arc(0, S * L / 2, 2.5, 0, P2); ctx.fill();
    ctx.restore();

    // Pivote
    ctx.fillStyle = '#455a64'; ctx.strokeStyle = '#90caf9'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(pX, pY, 6, 0, P2); ctx.fill(); ctx.stroke();

    // Label CM
    ctx.fillStyle = 'rgba(255,152,0,.8)'; ctx.font = '10px sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('CM', cmX + 10, cmY);

    // Info
    ctx.fillStyle = '#ffe082'; ctx.font = '11px monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('θ=' + (th * 180 / Math.PI).toFixed(2) + '°', 6, 4);
    ctx.fillText('I=' + Ifn().toFixed(3) + ' kg·m²', 6, 18);
    ctx.fillText('L=' + L.toFixed(2) + 'm', 6, 32);

    document.getElementById('r4t').textContent = (th * 180 / Math.PI).toFixed(2) + '°';
    document.getElementById('r4I').textContent = Ifn().toFixed(4) + ' kg·m²';
    document.getElementById('r4T').textContent = Tfn().toFixed(4) + ' s';
  }

  function updCalc() {
    const I = Ifn(), dv = d(), w = om0(), Tv = Tfn();
    document.getElementById('cl4').innerHTML = chHTML([
      { f: 'I = mL²/3',         v: I.toFixed(4),      u: 'kg·m²' },
      { f: 'd = L/2',            v: dv.toFixed(4),     u: 'm'     },
      { f: 'ω₀ = √(mgd/I)',     v: w.toFixed(4),      u: 'rad/s' },
      { f: 'T = 2π√(I/mgd)',    v: Tv.toFixed(4),     u: 's'     },
      { f: 'L_eq = 2L/3',       v: (2*L/3).toFixed(4), u: 'm'   },
      { f: 'f = 1/T',            v: (1/Tv).toFixed(4), u: 'Hz'   },
    ]);
  }

  function step(ts) {
    if (!running) return;
    if (last) {
      const dt = Math.min((ts - last) / 1000, .04), n = 8, dts = dt / n;
      for (let i = 0; i < n; i++) { const s = rk4(th, om, dts, alphafn); th = s.th; om = s.om; }
    }
    last = ts; draw(); raf = requestAnimationFrame(step);
  }

  function init() { cv.width = cv.parentElement.clientWidth || 460; rst(); draw(); updCalc(); }

  document.getElementById('bb4').onclick = () => {
    running = !running; last = null;
    document.getElementById('bb4').textContent = running ? '⏸ Pausar' : '▶ Continuar';
    if (running) raf = requestAnimationFrame(step); else cancelAnimationFrame(raf);
  };
  document.getElementById('br4').onclick = () => {
    running = false; last = null; cancelAnimationFrame(raf);
    document.getElementById('bb4').textContent = '▶ Iniciar'; rst(); draw(); updCalc();
  };
  document.getElementById('s4L').oninput = e => { L = +e.target.value; document.getElementById('d4L').textContent = L.toFixed(2)+' m'; rst(); draw(); updCalc(); };
  document.getElementById('s4m').oninput = e => { m = +e.target.value; document.getElementById('d4m').textContent = m.toFixed(1)+' kg'; rst(); draw(); updCalc(); };
  document.getElementById('s4t').oninput = e => { th0d = +e.target.value; document.getElementById('d4t').textContent = th0d+'°'; rst(); draw(); updCalc(); };

  function sd(e) {
    const p = gpos(e, cv), S = scale();
    const tX = cv.width / 2 + S * L * Math.sin(th), tY = 38 + S * L * Math.cos(th);
    if (Math.hypot(p.x - tX, p.y - tY) < 22) {
      drag = true; running = false; last = null; cancelAnimationFrame(raf);
      document.getElementById('bb4').textContent = '▶ Continuar';
    }
  }
  function sm(e) {
    if (!drag) return; e.preventDefault();
    const p = gpos(e, cv);
    th = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, Math.atan2(p.x - cv.width / 2, p.y - 38)));
    om = 0; th0d = Math.abs(th) * 180 / Math.PI;
    document.getElementById('s4t').value = Math.round(th0d);
    document.getElementById('d4t').textContent = Math.round(th0d) + '°';
    draw(); updCalc();
  }
  function se() { drag = false; }

  cv.addEventListener('mousedown', sd); cv.addEventListener('mousemove', sm);
  cv.addEventListener('mouseup', se);   cv.addEventListener('mouseleave', se);
  cv.addEventListener('touchstart', e => { e.preventDefault(); sd(e); }, { passive: false });
  cv.addEventListener('touchmove',  e => { e.preventDefault(); sm(e); }, { passive: false });
  cv.addEventListener('touchend', se);

  window.simInits[3] = init;
  init();
})();