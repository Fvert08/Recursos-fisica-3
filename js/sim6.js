// Espejos Esféricos (Cóncavo y Convexo)
'use strict';
(function () {
  const cv  = document.getElementById('cv6');
  const ctx = cv.getContext('2d');

  let f = 1.2, d0 = 2.5, h0 = 0.5, tipo = 1; // tipo: 1=cóncavo, -1=convexo

  function draw() {
    const W = cv.width, H = cv.height;
    bgd(ctx, W, H);

    // signo focal según tipo
    const fs = tipo * Math.abs(f);
    const di_inv = 1/fs - 1/d0;
    const di = (Math.abs(di_inv) < 1e-9) ? Infinity : 1 / di_inv;
    const m_lat = (isFinite(di)) ? -di / d0 : 0;
    const hi = h0 * m_lat;

    const midX = W * 0.55;
    const axisY = H * 0.50;
    const sc = Math.min((W * 0.44) / 4.0, 55); // px por metro

    // Eje óptico
    ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.lineWidth = 1; ctx.setLineDash([6,4]);
    ctx.beginPath(); ctx.moveTo(10, axisY); ctx.lineTo(W - 10, axisY); ctx.stroke();
    ctx.setLineDash([]);

    // Espejo esférico (arco)
    const R = 2 * Math.abs(fs);
    const arcH = Math.min(H * 0.7, 120);
    ctx.strokeStyle = '#90caf9'; ctx.lineWidth = 3;
    ctx.beginPath();
    if (tipo === 1) {
      // Cóncavo: concavidad hacia izquierda (objeto)
      ctx.arc(midX + R * sc, axisY, R * sc, Math.PI * 0.72, Math.PI * 1.28);
    } else {
      // Convexo: concavidad hacia derecha
      ctx.arc(midX - R * sc, axisY, R * sc, -Math.PI * 0.28, Math.PI * 0.28);
    }
    ctx.stroke();

    // Centro C y Foco F
    const fX = midX - fs * sc;
    const cX = midX - 2 * fs * sc;

    ctx.strokeStyle = 'rgba(255,160,0,.5)'; ctx.lineWidth = 1; ctx.setLineDash([3,4]);
    ctx.beginPath(); ctx.moveTo(fX, axisY - 12); ctx.lineTo(fX, axisY + 12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cX, axisY - 12); ctx.lineTo(cX, axisY + 12); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ffb300'; ctx.font = '10px monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('F', fX, axisY + 4);
    ctx.fillText('C', cX, axisY + 4);

    // Objeto
    const objX = midX - d0 * sc;
    const objTopY = axisY - h0 * sc * 3.5;
    ctx.strokeStyle = '#ffb300'; ctx.fillStyle = '#ffb300'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(objX, axisY); ctx.lineTo(objX, objTopY); ctx.stroke();
    // Flecha
    ctx.beginPath(); ctx.moveTo(objX, objTopY); ctx.lineTo(objX - 5, objTopY + 10); ctx.lineTo(objX + 5, objTopY + 10); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffe082'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('O', objX + 6, objTopY);

    // Rayos (3 rayos canónicos)
    if (isFinite(di) && Math.abs(di) < 20) {
      const imgX = midX - di * sc;
      const imgTopY = axisY - hi * sc * 3.5;

      // Rayo 1: paralelo al eje → pasa por F (o parece venir de F para convexo)
      ctx.strokeStyle = '#69f0ae'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(objX, objTopY); ctx.lineTo(midX, objTopY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(midX, objTopY); ctx.lineTo(imgX, imgTopY); ctx.stroke();
      // Extensión punteada si imagen virtual
      if (di < 0 || tipo === -1) {
        ctx.setLineDash([4,3]); ctx.globalAlpha = 0.45;
        ctx.beginPath(); ctx.moveTo(midX, objTopY); ctx.lineTo(imgX - (imgX < midX ? -40 : 40), imgTopY + (imgTopY - axisY) * 0.5); ctx.stroke();
        ctx.setLineDash([]); ctx.globalAlpha = 1;
      }

      // Rayo 2: pasa por el centro del espejo
      ctx.strokeStyle = '#ff80ab'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(objX, objTopY); ctx.lineTo(midX, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(midX, 0); ctx.lineTo(imgX, imgTopY); ctx.stroke();

      // Imagen
      const isVirtual = di < 0;
      ctx.globalAlpha = isVirtual ? 0.45 : 1.0;
      ctx.strokeStyle = isVirtual ? '#80cbc4' : '#40c4ff';
      ctx.fillStyle = isVirtual ? '#80cbc4' : '#40c4ff';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(imgX, axisY); ctx.lineTo(imgX, imgTopY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(imgX, imgTopY); ctx.lineTo(imgX - 5, imgTopY + (hi >= 0 ? 10 : -10)); ctx.lineTo(imgX + 5, imgTopY + (hi >= 0 ? 10 : -10)); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = '#b2ebf2'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText('I', imgX - 6, imgTopY);

      // Distancia imagen
      ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = 1; ctx.setLineDash([2,4]);
      ctx.beginPath(); ctx.moveTo(midX, axisY + 20); ctx.lineTo(imgX, axisY + 20); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#80deea'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText('dᵢ=' + di.toFixed(2) + 'm', (midX + imgX) / 2, axisY + 18);
    }

    // Distancia objeto
    ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 1; ctx.setLineDash([2,4]);
    ctx.beginPath(); ctx.moveTo(objX, axisY + 32); ctx.lineTo(midX, axisY + 32); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ffcc80'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText('d₀=' + d0.toFixed(2) + 'm', (objX + midX) / 2, axisY + 30);

    // Label tipo espejo
    ctx.fillStyle = '#90caf9'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(tipo === 1 ? '⟵ Cóncavo  f=' + fs.toFixed(2) + 'm' : '⟵ Convexo  f='+fs.toFixed(2)+'m', 6, 4);

    // Readouts
    const diStr = isFinite(di) ? di.toFixed(3) + ' m' : '∞';
    const mStr  = isFinite(di) ? m_lat.toFixed(3) : '—';
    document.getElementById('r6di').textContent = diStr;
    document.getElementById('r6m').textContent  = mStr;
    document.getElementById('r6tp').textContent = isFinite(di) ? (di < 0 ? 'Virtual' : 'Real') : '—';
  }

  function updCalc() {
    const fs = tipo * Math.abs(f);
    const di_inv = 1/fs - 1/d0;
    const di = (Math.abs(di_inv) < 1e-9) ? Infinity : 1 / di_inv;
    const m_lat = isFinite(di) ? -di / d0 : 0;
    const hi = h0 * m_lat;
    document.getElementById('cl6').innerHTML = chHTML([
      { f: 'f = R/2',      v: fs.toFixed(4),         u: 'm'   },
      { f: '1/dᵢ = 1/f−1/d₀', v: isFinite(di) ? di.toFixed(4) : '∞', u: 'm' },
      { f: 'm = −dᵢ/d₀',  v: isFinite(di) ? m_lat.toFixed(4) : '—', u: '—' },
      { f: 'hᵢ = m·h₀',   v: isFinite(di) ? hi.toFixed(4) : '—',    u: 'm' },
      { f: 'Imagen',       v: isFinite(di) ? (di < 0 ? 'Virtual' : 'Real') : '—', u: '—' },
      { f: 'Orientación',  v: isFinite(di) ? (m_lat < 0 ? 'Invertida' : 'Derecha') : '—', u: '—' },
    ]);
  }

  function init() {
    cv.width = cv.parentElement.clientWidth || 460;
    draw(); updCalc();
  }

  document.getElementById('s6f').oninput = e => { f = +e.target.value; document.getElementById('d6f').textContent = f.toFixed(2)+' m'; draw(); updCalc(); };
  document.getElementById('s6d').oninput = e => { d0 = +e.target.value; document.getElementById('d6d').textContent = d0.toFixed(2)+' m'; draw(); updCalc(); };
  document.getElementById('s6h').oninput = e => { h0 = +e.target.value; document.getElementById('d6h').textContent = h0.toFixed(2)+' m'; draw(); updCalc(); };
  document.getElementById('s6t').oninput = e => {
    tipo = +e.target.value;
    document.getElementById('d6t').textContent = tipo === 1 ? 'Cóncavo' : 'Convexo';
    draw(); updCalc();
  };

  window.simInits[5] = init;
  init();
})();
