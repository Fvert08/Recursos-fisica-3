'use strict';
(function () {
  const cv  = document.getElementById('cv3');
  const ctx = cv.getContext('2d');
  
  let A = 0.5, L = 6, f = 2, t = 0;
  let running = false, raf = null;
  const k = () => (2 * Math.PI) / L;
  const w = () => 2 * Math.PI * f;
  const v = () => L * f;

  function draw() {
    const W = cv.width, H = cv.height;
    bgd(ctx, W, H);
    
    ctx.fillStyle = '#90caf9';
    const rows = 8, cols = 35;
    const spacingX = W / cols, spacingY = H / (rows + 1);
    const ampPx = A * 18; // Escala visual

    for (let r = 1; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        const x0 = c * spacingX;
        // x real métrico para el desfase
        const xReal = (x0 / W) * 20; 
        const deltaX = ampPx * Math.cos(k() * xReal - w() * t);
        
        ctx.beginPath();
        ctx.arc(x0 + deltaX, r * spacingY, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    document.getElementById('r3v').textContent = v().toFixed(2) + ' m/s';
    document.getElementById('r3t').textContent = (1/f).toFixed(2) + ' s';
  }

  function updCalc() {
    document.getElementById('cl3').innerHTML = chHTML([
      { f: 'v = λ·f', v: v().toFixed(2), u: 'm/s' },
      { f: 'T = 1/f', v: (1/f).toFixed(2), u: 's' },
      { f: 'ω = 2πf', v: w().toFixed(2), u: 'rad/s' },
      { f: 'k = 2π/λ', v: k().toFixed(2), u: 'rad/m' }
    ]);
  }

  function loop() { if (!running) return; t += 0.016; draw(); raf = requestAnimationFrame(loop); }
  function init() { cv.width = cv.parentElement.clientWidth || 460; draw(); updCalc(); }

  document.getElementById('bb3').onclick = () => {
    running = !running;
    document.getElementById('bb3').textContent = running ? '⏸ Pausar' : '▶ Iniciar';
    if (running) loop(); else cancelAnimationFrame(raf);
  };
  document.getElementById('br3').onclick = () => { running = false; t = 0; cancelAnimationFrame(raf); document.getElementById('bb3').textContent = '▶ Iniciar'; draw(); updCalc(); };

  document.getElementById('s3A').oninput = e => { A = +e.target.value; document.getElementById('d3A').textContent = A.toFixed(1) + ' m'; draw(); };
  document.getElementById('s3L').oninput = e => { L = +e.target.value; document.getElementById('d3L').textContent = L.toFixed(1) + ' m'; draw(); updCalc(); };
  document.getElementById('s3f').oninput = e => { f = +e.target.value; document.getElementById('d3f').textContent = f.toFixed(1) + ' Hz'; draw(); updCalc(); };

  window.simInits[2] = init;
})();