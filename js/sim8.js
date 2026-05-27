// Lentes Delgadas (Convergente y Divergente)
'use strict';
(function () {
  const cv  = document.getElementById('cv8');
  const ctx = cv.getContext('2d');

  let f = 1.5, d0 = 2.8, h0 = 0.5, tipo = 1; // tipo: 1=convergente, -1=divergente

  function draw() {
    const W = cv.width, H = cv.height;
    bgd(ctx, W, H);

    const fs = tipo * Math.abs(f);
    const di_inv = 1/fs - 1/d0;
    const di = (Math.abs(di_inv) < 1e-9) ? Infinity : 1 / di_inv;
    const m_lat = isFinite(di) ? -di / d0 : 0;
    const hi = h0 * m_lat;

    const lensX = W * 0.52;
    const axisY = H * 0.50;
    const sc = Math.min((W * 0.44) / 4.5, 52);
    const lensH = Math.min(H * 0.72, 130);

    // Eje óptico
    ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 1; ctx.setLineDash([6,4]);
    ctx.beginPath(); ctx.moveTo(10, axisY); ctx.lineTo(W - 10, axisY); ctx.stroke();
    ctx.setLineDash([]);

    // Lente (forma)
    ctx.strokeStyle = '#90caf9'; ctx.lineWidth = 2.5; ctx.fillStyle = 'rgba(33,150,243,.12)';
    const lhalf = lensH / 2;
    const curve = tipo === 1 ? 18 : -18; // convergente abultada, divergente hueca
    ctx.beginPath();
    ctx.moveTo(lensX, axisY - lhalf);
    ctx.bezierCurveTo(lensX + curve, axisY - lhalf * 0.5, lensX + curve, axisY + lhalf * 0.5, lensX, axisY + lhalf);
    ctx.bezierCurveTo(lensX - curve, axisY + lhalf * 0.5, lensX - curve, axisY - lhalf * 0.5, lensX, axisY - lhalf);
    ctx.fill(); ctx.stroke();

    // Focos F y F'
    const fX  = lensX - fs * sc;
    const fpX = lensX + fs * sc;

    ctx.strokeStyle = 'rgba(255,160,0,.6)'; ctx.lineWidth = 1; ctx.setLineDash([3,4]);
    ctx.beginPath(); ctx.moveTo(fX, axisY - 12); ctx.lineTo(fX, axisY + 12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(fpX, axisY - 12); ctx.lineTo(fpX, axisY + 12); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ffb300'; ctx.font = '10px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('F', fX, axisY + 4);
    ctx.fillText("F'", fpX, axisY + 4);

    // Objeto
    const objX = lensX - d0 * sc;
    const objTopY = axisY - h0 * sc * 3.2;
    ctx.strokeStyle = '#ffb300'; ctx.fillStyle = '#ffb300'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(objX, axisY); ctx.lineTo(objX, objTopY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(objX, objTopY); ctx.lineTo(objX - 5, objTopY + 10); ctx.lineTo(objX + 5, objTopY + 10); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffe082'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('O', objX + 6, objTopY);

    // Rayos principales
    if (isFinite(di) && Math.abs(di) < 22) {
      const imgX = lensX + di * sc;
      const imgTopY = axisY - hi * sc * 3.2;

      // Rayo 1: paralelo al eje → pasa por F' (convergente) o parece venir de F (divergente)
      ctx.strokeStyle = '#69f0ae'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(objX, objTopY); ctx.lineTo(lensX, objTopY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(lensX, objTopY); ctx.lineTo(imgX, imgTopY); ctx.stroke();
      if (di < 0) {
        ctx.setLineDash([4,3]); ctx.globalAlpha = 0.4;
        ctx.beginPath(); ctx.moveTo(lensX, objTopY); ctx.lineTo(lensX + (lensX-objX)*0.6, objTopY + (objTopY-axisY)*0.3); ctx.stroke();
        ctx.setLineDash([]); ctx.globalAlpha = 1;
      }

      // Rayo 2: pasa por el centro de la lente sin desviarse
      ctx.strokeStyle = '#ff80ab'; ctx.lineWidth = 1.5;
      const angCenter = Math.atan2(axisY - objTopY, lensX - objX);
      const cendX = imgX, cendY = imgTopY;
      ctx.beginPath(); ctx.moveTo(objX, objTopY); ctx.lineTo(cendX, cendY); ctx.stroke();

      // Rayo 3: pasa por F hacia la lente → sale paralelo
      ctx.strokeStyle = '#80d8ff'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(objX, objTopY); ctx.lineTo(lensX, axisY - hi * sc * 3.2 / (1 + 0.01)); ctx.stroke();

      // Imagen
      const isVirtual = di < 0;
      ctx.globalAlpha = isVirtual ? 0.5 : 1.0;
      ctx.strokeStyle = isVirtual ? '#80cbc4' : '#40c4ff';
      ctx.fillStyle   = isVirtual ? '#80cbc4' : '#40c4ff';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(imgX, axisY); ctx.lineTo(imgX, imgTopY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(imgX, imgTopY); ctx.lineTo(imgX - 5, imgTopY + (hi >= 0 ? 10 : -10)); ctx.lineTo(imgX + 5, imgTopY + (hi >= 0 ? 10 : -10)); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = '#b2ebf2'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText('I', imgX - 6, imgTopY);

      // Distancia imagen
      ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 1; ctx.setLineDash([2,4]);
      ctx.beginPath(); ctx.moveTo(lensX, axisY + 22); ctx.lineTo(imgX, axisY + 22); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#80deea'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText('dᵢ=' + di.toFixed(2) + 'm', (lensX + imgX) / 2, axisY + 20);
    }

    // Distancia objeto
    ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.lineWidth = 1; ctx.setLineDash([2,4]);
    ctx.beginPath(); ctx.moveTo(objX, axisY + 34); ctx.lineTo(lensX, axisY + 34); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ffcc80'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText('d₀=' + d0.toFixed(2) + 'm', (objX + lensX) / 2, axisY + 32);

    // Label
    const pot = (1 / Math.abs(fs)).toFixed(2);
    ctx.fillStyle = '#90caf9'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText((tipo === 1 ? 'Convergente' : 'Divergente') + '  f=' + fs.toFixed(2) + 'm  P=' + (tipo === 1 ? '' : '-') + pot + ' D', 4, 4);

    // Readouts
    const diStr = isFinite(di) ? di.toFixed(3) + ' m' : '∞';
    const mStr  = isFinite(di) ? m_lat.toFixed(3) : '—';
    document.getElementById('r8di').textContent = diStr;
    document.getElementById('r8m').textContent  = mStr;
    document.getElementById('r8P').textContent  = (tipo / Math.abs(f)).toFixed(3) + ' D';
  }

  function updCalc() {
    const fs = tipo * Math.abs(f);
    const di_inv = 1/fs - 1/d0;
    const di = (Math.abs(di_inv) < 1e-9) ? Infinity : 1 / di_inv;
    const m_lat = isFinite(di) ? -di / d0 : 0;
    const hi = h0 * m_lat;
    const P = tipo / Math.abs(f);
    document.getElementById('cl8').innerHTML = chHTML([
      { f: 'P = 1/f',       v: P.toFixed(4),                            u: 'D'   },
      { f: 'dᵢ',            v: isFinite(di) ? di.toFixed(4) : '∞',     u: 'm'   },
      { f: 'm = −dᵢ/d₀',   v: isFinite(di) ? m_lat.toFixed(4) : '—',  u: '—'   },
      { f: 'hᵢ = m·h₀',    v: isFinite(di) ? hi.toFixed(4) : '—',     u: 'm'   },
      { f: 'Imagen',        v: isFinite(di) ? (di < 0 ? 'Virtual' : 'Real') : '—', u: '—' },
      { f: 'Orientación',   v: isFinite(di) ? (m_lat < 0 ? 'Invertida' : 'Derecha') : '—', u: '—' },
    ]);
  }

  function init() {
    cv.width = cv.parentElement.clientWidth || 460;
    draw(); updCalc();
  }

  document.getElementById('s8f').oninput = e => { f = +e.target.value; document.getElementById('d8f').textContent = f.toFixed(2)+' m'; draw(); updCalc(); };
  document.getElementById('s8d').oninput = e => { d0 = +e.target.value; document.getElementById('d8d').textContent = d0.toFixed(2)+' m'; draw(); updCalc(); };
  document.getElementById('s8h').oninput = e => { h0 = +e.target.value; document.getElementById('d8h').textContent = h0.toFixed(2)+' m'; draw(); updCalc(); };
  document.getElementById('s8t').oninput = e => {
    tipo = +e.target.value;
    document.getElementById('d8t').textContent = tipo === 1 ? 'Convergente' : 'Divergente';
    draw(); updCalc();
  };

  window.simInits[7] = init;
  init();
})();
