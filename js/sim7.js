// Refracción en Frontera Plana (Ley de Snell)
'use strict';
(function () {
  const cv  = document.getElementById('cv7');
  const ctx = cv.getContext('2d');

  let n1 = 1.0, n2 = 1.5, th1d = 35;
  let drag = false;

  const C = 3e8;

  function deg2rad(d) { return d * Math.PI / 180; }
  function rad2deg(r) { return r * 180 / Math.PI; }

  function draw() {
    const W = cv.width, H = cv.height;
    bgd(ctx, W, H);

    const intY = H * 0.50;
    const hitX = W * 0.50;

    // Medio 1 (arriba)
    const g1 = ctx.createLinearGradient(0, 0, 0, intY);
    g1.addColorStop(0, 'rgba(13,71,161,.35)');
    g1.addColorStop(1, 'rgba(21,101,192,.15)');
    ctx.fillStyle = g1; ctx.fillRect(0, 0, W, intY);

    // Medio 2 (abajo)
    const g2 = ctx.createLinearGradient(0, intY, 0, H);
    g2.addColorStop(0, 'rgba(0,77,64,.2)');
    g2.addColorStop(1, 'rgba(0,105,92,.45)');
    ctx.fillStyle = g2; ctx.fillRect(0, intY, W, H);

    // Frontera
    ctx.strokeStyle = '#90caf9'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, intY); ctx.lineTo(W, intY); ctx.stroke();

    // Normal
    ctx.strokeStyle = 'rgba(255,160,0,.5)'; ctx.lineWidth = 1; ctx.setLineDash([5,4]);
    ctx.beginPath(); ctx.moveTo(hitX, intY - H * 0.42); ctx.lineTo(hitX, intY + H * 0.42); ctx.stroke();
    ctx.setLineDash([]);

    // Etiquetas medios
    ctx.fillStyle = '#90caf9'; ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('n₁ = ' + n1.toFixed(3) + '  (v₁ = ' + (C/n1/1e8).toFixed(3) + '×10⁸ m/s)', 8, 6);
    ctx.fillStyle = '#80cbc4'; ctx.textBaseline = 'bottom';
    ctx.fillText('n₂ = ' + n2.toFixed(3) + '  (v₂ = ' + (C/n2/1e8).toFixed(3) + '×10⁸ m/s)', 8, H - 6);

    const th1r = deg2rad(th1d);
    const sinTh2 = n1 * Math.sin(th1r) / n2;
    const totalInternalRefl = sinTh2 > 1;
    const th2r = totalInternalRefl ? null : Math.asin(sinTh2);
    const th2d = totalInternalRefl ? null : rad2deg(th2r);

    // Rayo incidente (viene desde arriba-izquierda)
    const rayLen = Math.min(H * 0.45, W * 0.45);
    const incX1 = hitX - rayLen * Math.sin(th1r);
    const incY1 = intY - rayLen * Math.cos(th1r);
    ctx.strokeStyle = '#ffcc02'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(incX1, incY1); ctx.lineTo(hitX, intY); ctx.stroke();
    // flecha
    const ang1 = Math.atan2(intY - incY1, hitX - incX1);
    const mx1 = (incX1 + hitX) / 2, my1 = (incY1 + intY) / 2;
    arrowHead(ctx, mx1, my1, ang1, '#ffcc02');

    // Rayo reflejado
    const refX = hitX + rayLen * Math.sin(th1r);
    const refY = intY - rayLen * Math.cos(th1r);
    ctx.strokeStyle = '#ff8a65'; ctx.lineWidth = totalInternalRefl ? 2.5 : 1.5;
    ctx.beginPath(); ctx.moveTo(hitX, intY); ctx.lineTo(refX, refY); ctx.stroke();
    const angRef = Math.atan2(refY - intY, refX - hitX);
    arrowHead(ctx, (hitX + refX)/2, (intY + refY)/2, angRef, '#ff8a65');

    // Rayo refractado
    if (!totalInternalRefl) {
      const refracX = hitX + rayLen * Math.sin(th2r);
      const refracY = intY + rayLen * Math.cos(th2r);
      ctx.strokeStyle = '#69f0ae'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(hitX, intY); ctx.lineTo(refracX, refracY); ctx.stroke();
      const angRefrac = Math.atan2(refracY - intY, refracX - hitX);
      arrowHead(ctx, (hitX + refracX)/2, (intY + refracY)/2, angRefrac, '#69f0ae');

      // Ángulo θ₂
      ctx.strokeStyle = 'rgba(105,240,174,.4)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(hitX, intY, 40, Math.PI/2, Math.PI/2 + th2r); ctx.stroke();
      ctx.fillStyle = '#a5d6a7'; ctx.font = '10px monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('θ₂=' + th2d.toFixed(1) + '°', hitX + 44, intY + 10);
    } else {
      // Reflexión total interna
      ctx.fillStyle = '#ff5252'; ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('⚠ Reflexión Total Interna', W / 2, intY + 28);
    }

    // Ángulo θ₁
    ctx.strokeStyle = 'rgba(255,204,2,.4)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(hitX, intY, 40, -Math.PI/2, -Math.PI/2 + th1r); ctx.stroke();
    ctx.fillStyle = '#ffe082'; ctx.font = '10px monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
    ctx.fillText('θ₁=' + th1d.toFixed(1) + '°', hitX + 44, intY - 10);

    // Ángulo crítico si aplica (n1 > n2 — pero para ver el ángulo crítico el rayo vendría de medio desnso)
    let thc = null;
    if (n1 > n2) { thc = rad2deg(Math.asin(n2 / n1)); }
    if (n2 > n1) { thc = rad2deg(Math.asin(n1 / n2)); }

    // Readouts
    document.getElementById('r7t2').textContent = totalInternalRefl ? 'R.T.I.' : th2d.toFixed(2) + '°';
    document.getElementById('r7tc').textContent = thc !== null ? thc.toFixed(2) + '°' : '—';
    document.getElementById('r7v2').textContent = (C / n2 / 1e6).toFixed(2) + '×10⁶ m/s';
  }

  function arrowHead(ctx, x, y, ang, color) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-8,-4); ctx.lineTo(-8,4); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function updCalc() {
    const th1r = deg2rad(th1d);
    const sinTh2 = n1 * Math.sin(th1r) / n2;
    const tir = sinTh2 > 1;
    const th2d = tir ? null : rad2deg(Math.asin(sinTh2));
    const thcVal = n2 > n1 ? rad2deg(Math.asin(n1/n2)) : rad2deg(Math.asin(n2/n1));
    document.getElementById('cl7').innerHTML = chHTML([
      { f: 'n₁·sin(θ₁)', v: (n1 * Math.sin(th1r)).toFixed(4), u: '—'   },
      { f: 'n₂·sin(θ₂)', v: tir ? 'N/A' : (n2 * Math.sin(deg2rad(th2d))).toFixed(4), u: '—' },
      { f: 'θ₂',          v: tir ? 'N/A (R.T.I.)' : th2d.toFixed(4), u: '°'   },
      { f: 'v₂ = c/n₂',  v: (C/n2/1e8).toFixed(4), u: '×10⁸ m/s' },
      { f: 'θ_crítico',   v: thcVal.toFixed(4), u: '°' },
      { f: 'Estado',      v: tir ? 'Reflexión Total' : 'Refracción', u: '—' },
    ]);
  }

  // Drag sobre el rayo incidente (mover ángulo)
  function sd(e) {
    const p = gpos(e, cv);
    const intY = cv.height * 0.50;
    if (p.y < intY) { drag = true; }
  }
  function sm(e) {
    if (!drag) return; e.preventDefault();
    const p = gpos(e, cv);
    const hitX = cv.width * 0.50, intY = cv.height * 0.50;
    const dx = p.x - hitX, dy = intY - p.y;
    if (dy > 5) {
      th1d = Math.max(1, Math.min(89, rad2deg(Math.atan2(Math.abs(dx), dy))));
      document.getElementById('s7t').value = th1d;
      document.getElementById('d7t').textContent = th1d.toFixed(0) + '°';
      draw(); updCalc();
    }
  }
  function se() { drag = false; }

  function init() {
    cv.width = cv.parentElement.clientWidth || 460;
    draw(); updCalc();
  }

  document.getElementById('s7n1').oninput = e => { n1 = +e.target.value; document.getElementById('d7n1').textContent = n1.toFixed(2); draw(); updCalc(); };
  document.getElementById('s7n2').oninput = e => { n2 = +e.target.value; document.getElementById('d7n2').textContent = n2.toFixed(2); draw(); updCalc(); };
  document.getElementById('s7t').oninput  = e => { th1d = +e.target.value; document.getElementById('d7t').textContent = th1d + '°'; draw(); updCalc(); };

  cv.addEventListener('mousedown', sd); cv.addEventListener('mousemove', sm);
  cv.addEventListener('mouseup', se);   cv.addEventListener('mouseleave', se);
  cv.addEventListener('touchstart', e => { e.preventDefault(); sd(e); }, { passive: false });
  cv.addEventListener('touchmove',  e => { e.preventDefault(); sm(e); }, { passive: false });
  cv.addEventListener('touchend', se);

  window.simInits[6] = init;
  init();
})();
