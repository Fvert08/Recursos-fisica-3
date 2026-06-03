'use strict';
(function () {
  const cv  = document.getElementById('cv4');
  const ctx = cv.getContext('2d');
  
  // C Parámetros iniciales coordinados con los controles HTML.
  // F vs y vo representan velocidades de fuente y observador respecto al medio.
  let vs = 150, vo = 0, f_s = 100, v_sonido = 343, t = 0;
  let running = false, raf = null;
  let pulses = [];
  let lastEmit = 0;
  let lastTimeWrapped = 0;
  
  // C Duración visible antes de reiniciar la escena para evitar recorridos infinitos.
  const CYCLE_DURATION = 8;

  // F Calcula la frecuencia percibida mediante la ecuación clásica Doppler.
  const f_obs = () => {
    // F Ecuación general con convención clásica de signos vectoriales:
    // F +vs: Fuente hacia la derecha (se acerca a O si O está a su derecha) -> (v_sonido - vs)
    // F +vo: Observador hacia la derecha (se aleja de F si O está a su derecha) -> (v_sonido - vo)
    return f_s * ((v_sonido - vo) / (v_sonido - vs)); 
  };

  // C Redibuja fuente, observador, frentes de onda y panel de resultados.
  function draw() {
    const W = cv.width, H = cv.height, cy = H / 2;
    bgd(ctx, W, H);

    if (running) { t += 0.016; }

    const timeWrapped = t % CYCLE_DURATION;
    
    // C Evitar saltos visuales limpiando pulsos viejos al reiniciar el ciclo
    if (timeWrapped < lastTimeWrapped) {
      pulses = [];
      lastEmit = 0;
    }
    lastTimeWrapped = timeWrapped;

    // C Escala del espacio ampliado: todo el ancho del lienzo representa 3000 metros.
    const DOMAIN_M = 3000;
    const SCALE = W / DOMAIN_M;

    // C Coordenadas de origen en metros
    const x_s0 = 300;
    const x_o0 = 2100;

    // F Posición física instantánea en metros
    const xs_m = x_s0 + vs * timeWrapped;
    const xo_m = x_o0 + vo * timeWrapped;

    // C Posición en píxeles sobre el lienzo.
    const px_fuente = xs_m * SCALE;
    const px_obs = xo_m * SCALE;

    // F Tasa de emisión ajustable ligada al deslizador de frecuencia f_s
    // C Dividimos por 12 para conseguir una densidad armónica cómoda visualmente
    const T_emit = 1 / (f_s / 12); 
    if (running && timeWrapped - lastEmit > T_emit) {
      pulses.push({ x_emit_m: xs_m, t_emit: timeWrapped });
      lastEmit = timeWrapped;
    }

    // F Frentes de onda: círculos que se expanden en el medio estático.
    ctx.strokeStyle = 'rgba(144, 202, 249, 0.45)'; ctx.lineWidth = 1.5;
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      const age = timeWrapped - p.t_emit;
      if (age < 0) continue;
      
      const radius_m = v_sonido * age;
      const radius_px = radius_m * SCALE;
      
      if (radius_px > W * 2) { 
        pulses.splice(i, 1); 
        continue; 
      }
      
      const px_onda_centro = p.x_emit_m * SCALE;
      ctx.beginPath();
      ctx.arc(px_onda_centro, cy, radius_px, 0, Math.PI * 2);
      ctx.stroke();
    }

    // C Dibujo de la fuente sonora en rojo.
    ctx.fillStyle = '#f44336'; ctx.beginPath(); ctx.arc(px_fuente, cy, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'; ctx.fillText('F', px_fuente - 4, cy + 4);
    
    if (Math.abs(vs) > 0) {
      ctx.strokeStyle = '#f44336'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(px_fuente, cy - 14); ctx.lineTo(px_fuente + (vs * 0.25 * SCALE), cy - 14); ctx.stroke();
    }

    // C Dibujo del observador en azul.
    ctx.fillStyle = '#2196f3'; ctx.beginPath(); ctx.arc(px_obs, cy, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'; ctx.fillText('O', px_obs - 4, cy + 4);
    
    if (Math.abs(vo) > 0) {
      ctx.strokeStyle = '#2196f3'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(px_obs, cy - 14); ctx.lineTo(px_obs + (vo * 0.25 * SCALE), cy - 14); ctx.stroke();
    }

    // C Textos informativos flotantes sobre los círculos
    ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.font = '10px monospace';
    ctx.fillText(`${vs} m/s`, px_fuente - 18, cy - 24);
    ctx.fillText(`${vo} m/s`, px_obs - 18, cy - 24);

    // C Salidas numéricas del panel de resultados
    document.getElementById('r4fs').textContent = f_s.toFixed(1) + ' Hz';
    const fo = f_obs();
    document.getElementById('r4fo').textContent = (fo > 0 && isFinite(fo)) ? fo.toFixed(1) + ' Hz' : '— Hz';
    document.getElementById('r4m').textContent = (vs / v_sonido).toFixed(2);
  }

  // F Actualiza frecuencia observada, velocidad relativa y número de Mach.
  function updCalc() {
    const fo = f_obs();
    document.getElementById('cl4').innerHTML = chHTML([
      { f: "f' = f_s(v - v_o)/(v - v_s)", v: (fo > 0 && isFinite(fo)) ? fo.toFixed(2) : 'N/A', u: 'Hz' },
      { f: 'Velocidad Relativa', v: (vs - vo).toFixed(1), u: 'm/s' },
      { f: 'Factor de Mach (F)', v: (vs/v_sonido).toFixed(2), u: '' },
      { f: 'v_sonido (Aire)', v: v_sonido, u: 'm/s' }
    ]);
  }

  // C Ejecuta la animación mientras el botón de inicio esté activo.
  function loop() { if (!running) return; draw(); raf = requestAnimationFrame(loop); }
  // C Ajusta el lienzo y sincroniza la calculadora con los controles.
  function init() { cv.width = cv.parentElement.clientWidth || 460; draw(); updCalc(); }

  document.getElementById('bb4').onclick = () => {
    running = !running;
    document.getElementById('bb4').textContent = running ? '⏸ Pausar' : '▶ Iniciar';
    if (running) loop(); else cancelAnimationFrame(raf);
  };
  
  document.getElementById('br4').onclick = () => { 
    running = false; t = 0; pulses = []; lastEmit = 0; lastTimeWrapped = 0;
    cancelAnimationFrame(raf); 
    document.getElementById('bb4').textContent = '▶ Iniciar'; 
    draw(); updCalc(); 
  };

  // C Eventos de los deslizadores para actualizar parámetros y redibujar
  document.getElementById('s4vs').oninput = e => { vs = +e.target.value; document.getElementById('d4vs').textContent = vs + ' m/s'; draw(); updCalc(); };
  document.getElementById('s4vo').oninput = e => { vo = +e.target.value; document.getElementById('d4vo').textContent = vo + ' m/s'; draw(); updCalc(); };
  document.getElementById('s4fs').oninput = e => { f_s = +e.target.value; document.getElementById('d4fs').textContent = f_s.toFixed(1) + ' Hz'; draw(); updCalc(); };

  window.simInits[3] = init;
})();
