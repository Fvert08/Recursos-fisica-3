'use strict';
(function () {
  const cv  = document.getElementById('cv1');
  const ctx = cv.getContext('2d');
  // C Escala visual que convierte metros simulados en píxeles del lienzo.
  const PPM = 20;

  // C Estado editable: amplitud, longitud de onda, frecuencia y tiempo.
  let A = 0.5, L = 4, f = 1, t = 0;
  let running = false, raf = null, drag = false;

  // F k=2π/λ, ω=2πf y v=λf describen la onda armónica viajera.
  const k = () => (2 * Math.PI) / L;
  const w = () => 2 * Math.PI * f;
  const v = () => L * f;

  // C Dibuja la cuerda, partícula de referencia y lecturas instantáneas.
  function draw() {
    const W = cv.width, H = cv.height, eqY = H / 2;
    // C Asumimos bgd provisto por utils.js, si no existe usa: ctx.fillStyle='#0b1e33'; ctx.fillRect(0,0,W,H);
    bgd(ctx, W, H); 

    // C Eje X
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(0, eqY); ctx.lineTo(W, eqY); ctx.stroke(); ctx.setLineDash([]);

    // F Dibujo de la onda
    ctx.strokeStyle = '#42a5f5'; ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let px = 0; px <= W; px++) {
      const x = px / PPM;
      const y = A * Math.sin(k() * x - w() * t);
      const py = eqY - (y * PPM * 2); // C Amplificado visualmente
      if (px === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // C Partícula de referencia en x=0
    const py0 = eqY - (A * Math.sin(-w() * t) * PPM * 2);
    ctx.fillStyle = '#ff6f00'; ctx.beginPath(); ctx.arc(0, py0, 6, 0, Math.PI * 2); ctx.fill();

    // C Salidas numéricas mostradas en el panel de resultados
    document.getElementById('r1v').textContent = v().toFixed(2) + ' m/s';
    document.getElementById('r1k').textContent = k().toFixed(2) + ' rad/m';
    document.getElementById('r1w').textContent = w().toFixed(2) + ' rad/s';
  }

  // F Muestra parámetros derivados de y(x,t)=A sen(kx-ωt).
  function updCalc() {
    document.getElementById('cl1').innerHTML = chHTML([
      { f: 'v = λ·f', v: v().toFixed(3), u: 'm/s' },
      { f: 'k = 2π/λ', v: k().toFixed(3), u: 'rad/m' },
      { f: 'ω = 2πf', v: w().toFixed(3), u: 'rad/s' },
      { f: 'T = 1/f', v: (1/f).toFixed(3), u: 's' }
    ]);
  }

  // C Avanza el tiempo de la onda y solicita el siguiente fotograma.
  function loop() { if (!running) return; t += 0.016; draw(); raf = requestAnimationFrame(loop); }

  // C Ajusta el lienzo y calcula el primer dibujo.
  function init() { cv.width = cv.parentElement.clientWidth || 460; draw(); updCalc(); }

  document.getElementById('bb1').onclick = () => {
    running = !running;
    document.getElementById('bb1').textContent = running ? '⏸ Pausar' : '▶ Iniciar';
    if (running) loop(); else cancelAnimationFrame(raf);
  };
  document.getElementById('br1').onclick = () => {
    running = false; t = 0; cancelAnimationFrame(raf);
    document.getElementById('bb1').textContent = '▶ Iniciar'; draw(); updCalc();
  };

  document.getElementById('s1A').oninput = e => { A = +e.target.value; document.getElementById('d1A').textContent = A.toFixed(1) + ' m'; draw(); updCalc(); };
  document.getElementById('s1L').oninput = e => { L = +e.target.value; document.getElementById('d1L').textContent = L.toFixed(1) + ' m'; draw(); updCalc(); };
  document.getElementById('s1f').oninput = e => { f = +e.target.value; document.getElementById('d1f').textContent = f.toFixed(1) + ' Hz'; draw(); updCalc(); };

  // C Arrastre para modificar la amplitud
  cv.addEventListener('mousedown', () => { drag = true; running = false; cancelAnimationFrame(raf); document.getElementById('bb1').textContent = '▶ Continuar'; });
  cv.addEventListener('mousemove', e => {
    if (!drag) return;
    const p = gpos(e, cv);
    A = Math.min(1, Math.max(0.1, Math.abs((p.y - cv.height / 2) / (PPM * 2))));
    document.getElementById('s1A').value = A; document.getElementById('d1A').textContent = A.toFixed(1) + ' m';
    draw(); updCalc();
  });
  cv.addEventListener('mouseup', () => { drag = false; });
  cv.addEventListener('mouseleave', () => { drag = false; });

  window.simInits[0] = init;
  init();
})();
