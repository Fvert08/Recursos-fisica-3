'use strict';
(function () {
  const cv  = document.getElementById('cv2');
  const ctx = cv.getContext('2d');
  
  let n = 3, v = 50, L_cuerda = 10, t = 0;
  let running = false, raf = null;

  const fn = () => n * (v / (2 * L_cuerda));
  const w = () => 2 * Math.PI * fn();
  const k = () => (n * Math.PI) / L_cuerda;
  const lambda = () => 2 * L_cuerda / n;

  function draw() {
    const W = cv.width, H = cv.height, eqY = H / 2, padding = 30;
    const drawW = W - padding * 2;
    bgd(ctx, W, H);

    // Eje X y bordes fijos (Nodos externos)
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(padding, eqY); ctx.lineTo(W - padding, eqY); ctx.stroke();
    ctx.fillStyle = '#ffb300';
    ctx.beginPath(); ctx.arc(padding, eqY, 5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(W - padding, eqY, 5, 0, Math.PI*2); ctx.fill();

    // Envolvente (Onda máxima)
    ctx.strokeStyle = 'rgba(144, 202, 249, 0.3)'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 5]);
    ctx.beginPath();
    for (let px = 0; px <= drawW; px++) {
      const x = (px / drawW) * L_cuerda;
      const y = Math.sin(k() * x) * 60; // Amplitud visual 60px
      if (px === 0) { ctx.moveTo(padding + px, eqY - y); ctx.moveTo(padding + px, eqY + y); }
      else { ctx.lineTo(padding + px, eqY - y); }
    }
    ctx.stroke(); ctx.setLineDash([]);

    // Onda Estacionaria Actual
    ctx.strokeStyle = '#2196f3'; ctx.lineWidth = 3;
    ctx.beginPath();
    for (let px = 0; px <= drawW; px++) {
      const x = (px / drawW) * L_cuerda;
      const y = Math.sin(k() * x) * Math.cos(w() * t) * 60;
      if (px === 0) ctx.moveTo(padding + px, eqY - y);
      else ctx.lineTo(padding + px, eqY - y);
    }
    ctx.stroke();

    document.getElementById('r2l').textContent = lambda().toFixed(2) + ' m';
    document.getElementById('r2f').textContent = fn().toFixed(2) + ' Hz';
    document.getElementById('r2no').textContent = (n + 1);
  }

  function updCalc() {
    document.getElementById('cl2').innerHTML = chHTML([
      { f: 'λ_n = 2L/n', v: lambda().toFixed(2), u: 'm' },
      { f: 'f_n = n(v/2L)', v: fn().toFixed(2), u: 'Hz' },
      { f: 'ω_n = 2πf', v: w().toFixed(2), u: 'rad/s' },
      { f: 'k = nπ/L', v: k().toFixed(2), u: 'rad/m' }
    ]);
  }

  function loop() { if (!running) return; t += 0.016; draw(); raf = requestAnimationFrame(loop); }
  function init() { cv.width = cv.parentElement.clientWidth || 460; draw(); updCalc(); }

  document.getElementById('bb2').onclick = () => {
    running = !running;
    document.getElementById('bb2').textContent = running ? '⏸ Pausar' : '▶ Iniciar';
    if (running) loop(); else cancelAnimationFrame(raf);
  };
  document.getElementById('br2').onclick = () => { running = false; t = 0; cancelAnimationFrame(raf); document.getElementById('bb2').textContent = '▶ Iniciar'; draw(); updCalc(); };

  document.getElementById('s2n').oninput = e => { n = +e.target.value; document.getElementById('d2n').textContent = n; draw(); updCalc(); };
  document.getElementById('s2v').oninput = e => { v = +e.target.value; document.getElementById('d2v').textContent = v + ' m/s'; draw(); updCalc(); };

  window.simInits[1] = init;
})();