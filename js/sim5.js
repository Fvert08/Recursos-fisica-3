// Reflexión en Espejo Plano
'use strict';
(function () {
  const cv  = document.getElementById('cv5');
  const ctx = cv.getContext('2d');

  let d0 = 1.5, h0 = 0.6, angInc = 35;
  let running = false, raf = null, t = 0;

  function deg2rad(d) { return d * Math.PI / 180; }

  function drawLegacy() {
    const W = cv.width, H = cv.height;
    bgd(ctx, W, H);

    const mirX = W * 0.5;
    const baseY = H - 30;
    const scaleH = (H - 60) / 2.5;
    const scaleD = (W * 0.42) / 3.0;

    // Piso
    ctx.fillStyle = '#162d47';
    ctx.fillRect(0, baseY, W, H);
    ctx.strokeStyle = '#2196f3'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, baseY); ctx.lineTo(W, baseY); ctx.stroke();

    // Espejo
    const mirH = H - 60;
    ctx.fillStyle = '#162d47';
    ctx.fillRect(mirX - 4, 16, 8, mirH);
    const mg = ctx.createLinearGradient(mirX - 4, 0, mirX + 6, 0);
    mg.addColorStop(0, '#42a5f5');
    mg.addColorStop(0.4, '#e3f2fd');
    mg.addColorStop(1, '#1565c0');
    ctx.fillStyle = mg;
    ctx.strokeStyle = '#90caf9'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(mirX - 3, 18, 6, mirH - 2, 2); ctx.fill(); ctx.stroke();

    // Marcas del espejo
    ctx.strokeStyle = '#0d47a1'; ctx.lineWidth = 1;
    for (let y = 20; y < mirH; y += 12) {
      ctx.beginPath(); ctx.moveTo(mirX + 3, y); ctx.lineTo(mirX + 9, y + 8); ctx.stroke();
    }

    // Normal punteada
    ctx.strokeStyle = 'rgba(255,160,0,.4)'; ctx.lineWidth = 1; ctx.setLineDash([5,4]);
    ctx.beginPath(); ctx.moveTo(mirX, 10); ctx.lineTo(mirX, baseY - 4); ctx.stroke();
    ctx.setLineDash([]);

    // Objeto
    const objX = mirX - d0 * scaleD;
    const objY = baseY - h0 * scaleH;

    // Punto objeto
    ctx.fillStyle = '#ffb300'; ctx.strokeStyle = '#ffe082'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(objX, objY, 6, 0, P2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffe082'; ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText('O', objX, objY - 8);

    // Línea del objeto al suelo
    ctx.strokeStyle = 'rgba(255,179,0,.35)'; ctx.lineWidth = 1; ctx.setLineDash([3,3]);
    ctx.beginPath(); ctx.moveTo(objX, objY); ctx.lineTo(objX, baseY); ctx.stroke();
    ctx.setLineDash([]);

    // Imagen (detrás del espejo, misma distancia)
    const imgX = mirX + d0 * scaleD;
    const imgY = objY;

    // Imagen virtual (más tenue)
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = '#80cbc4'; ctx.strokeStyle = '#b2dfdb'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(imgX, imgY, 6, 0, P2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#b2dfdb'; ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText('I', imgX, imgY - 8);
    ctx.globalAlpha = 1.0;

    // Línea imagen al suelo (punteada)
    ctx.strokeStyle = 'rgba(128,203,196,.3)'; ctx.lineWidth = 1; ctx.setLineDash([3,3]);
    ctx.beginPath(); ctx.moveTo(imgX, imgY); ctx.lineTo(imgX, baseY); ctx.stroke();
    ctx.setLineDash([]);

    // Rayo incidente desde objeto hasta espejo en eje de normal
    const hitY = baseY - (baseY - 26) * 0.38;
    const inAngleRad = deg2rad(angInc);
    // punto en el espejo donde incide el rayo
    const hitYActual = objY + (mirX - objX) * Math.tan(inAngleRad - Math.PI/2 + Math.PI/2);
    // Usamos la normal horizontal: ángulo respecto a la normal (eje X)
    const mirHitY = baseY * 0.45 + 20;

    // Punto de incidencia en espejo
    const hitYp = baseY * 0.42;

    // Rayo incidente
    ctx.strokeStyle = '#ffcc02'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(objX, objY); ctx.lineTo(mirX, hitYp); ctx.stroke();
    // Flecha
    const ang1 = Math.atan2(hitYp - objY, mirX - objX);
    const mx1 = objX + (mirX - objX) * 0.55, my1 = objY + (hitYp - objY) * 0.55;
    arrowHead(ctx, mx1, my1, ang1, '#ffcc02');

    // Rayo reflejado (ángulo igual respecto a la normal vertical del espejo)
    const dxIn = mirX - objX, dyIn = hitYp - objY;
    // reflexión respecto a la normal vertical (x-axis flip)
    const dxRef = -dxIn, dyRef = dyIn;
    const refLen = Math.hypot(dxRef, dyRef) * 1.0;
    const refEndX = mirX + (dxRef / Math.hypot(dxRef, dyRef)) * refLen;
    const refEndY = hitYp + (dyRef / Math.hypot(dxRef, dyRef)) * refLen;

    ctx.strokeStyle = '#69f0ae'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(mirX, hitYp); ctx.lineTo(refEndX, refEndY); ctx.stroke();
    const ang2 = Math.atan2(dyRef, dxRef);
    const mx2 = mirX + dxRef * 0.45, my2 = hitYp + dyRef * 0.45;
    arrowHead(ctx, mx2, my2, ang2, '#69f0ae');

    // Rayo virtual (hacia imagen, punteado)
    ctx.strokeStyle = 'rgba(128,203,196,.55)'; ctx.lineWidth = 1.5; ctx.setLineDash([5,4]);
    ctx.beginPath(); ctx.moveTo(mirX, hitYp); ctx.lineTo(imgX, objY); ctx.stroke();
    ctx.setLineDash([]);

    // Ángulo de incidencia visual
    const thInDeg = (Math.atan2(Math.abs(dxIn), Math.abs(dyIn)) * 180 / Math.PI).toFixed(1);
    ctx.fillStyle = '#ffcc80'; ctx.font = '10px monospace';
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText('θᵢ=' + thInDeg + '°', mirX - 8, hitYp - 16);
    ctx.fillStyle = '#a5d6a7'; ctx.textAlign = 'left';
    ctx.fillText('θᵣ=' + thInDeg + '°', mirX + 8, hitYp - 16);

    // Etiquetas distancias
    ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = 1; ctx.setLineDash([2,4]);
    ctx.beginPath(); ctx.moveTo(objX, baseY - 8); ctx.lineTo(mirX, baseY - 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(mirX, baseY - 8); ctx.lineTo(imgX, baseY - 8); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#90caf9'; ctx.font = '10px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText('d₀=' + d0.toFixed(2) + 'm', (objX + mirX) / 2, baseY - 10);
    ctx.fillStyle = '#80cbc4';
    ctx.fillText('dᵢ=' + d0.toFixed(2) + 'm', (imgX + mirX) / 2, baseY - 10);

    // Readouts
    document.getElementById('r5ti').textContent = thInDeg + '°';
    document.getElementById('r5tr').textContent = thInDeg + '°';
    document.getElementById('r5di').textContent = d0.toFixed(3) + ' m';
  }

  function draw() {
    const W = cv.width, H = cv.height;
    bgd(ctx, W, H);

    const th = deg2rad(angInc);
    const hitY = h0 + d0 * Math.tan(th);
    const yMax = Math.max(h0, hitY);
    const map = makeWorldMapper(W, H, [-d0, 0, d0], [0, h0, hitY], 24);

    const baseY = map.y(0);
    ctx.fillStyle = '#162d47';
    ctx.fillRect(0, baseY, W, H);
    ctx.strokeStyle = '#2196f3'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, baseY); ctx.lineTo(W, baseY); ctx.stroke();

    const mirX = map.x(0);
    const mirTop = Math.max(12, map.y(yMax) - 6);
    const mirH = Math.max(20, baseY - mirTop);
    ctx.fillStyle = '#162d47';
    ctx.fillRect(mirX - 4, mirTop, 8, mirH);
    const mg = ctx.createLinearGradient(mirX - 4, 0, mirX + 6, 0);
    mg.addColorStop(0, '#42a5f5');
    mg.addColorStop(0.4, '#e3f2fd');
    mg.addColorStop(1, '#1565c0');
    ctx.fillStyle = mg;
    ctx.strokeStyle = '#90caf9'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(mirX - 3, mirTop + 2, 6, mirH - 2, 2); ctx.fill(); ctx.stroke();

    ctx.strokeStyle = '#0d47a1'; ctx.lineWidth = 1;
    for (let y = mirTop + 4; y < baseY - 8; y += 12) {
      ctx.beginPath(); ctx.moveTo(mirX + 3, y); ctx.lineTo(mirX + 9, y + 8); ctx.stroke();
    }

    const obj = map.p(-d0, h0);
    const hit = map.p(0, hitY);
    const img = map.p(d0, h0);

    ctx.strokeStyle = 'rgba(255,160,0,.4)'; ctx.lineWidth = 1; ctx.setLineDash([5,4]);
    drawClippedSegment(ctx, 0, hit.y, W, hit.y, W, H, 1);
    ctx.setLineDash([]);

    ctx.fillStyle = '#ffb300'; ctx.strokeStyle = '#ffe082'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(obj.x, obj.y, 6, 0, P2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffe082'; ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText('O', obj.x, obj.y - 8);

    ctx.strokeStyle = 'rgba(255,179,0,.35)'; ctx.lineWidth = 1; ctx.setLineDash([3,3]);
    drawClippedSegment(ctx, obj.x, obj.y, obj.x, baseY, W, H, 1);
    ctx.setLineDash([]);

    ctx.globalAlpha = 0.45;
    ctx.fillStyle = '#80cbc4'; ctx.strokeStyle = '#b2dfdb'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(img.x, img.y, 6, 0, P2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#b2dfdb'; ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText('I', img.x, img.y - 8);
    ctx.globalAlpha = 1.0;

    ctx.strokeStyle = 'rgba(128,203,196,.3)'; ctx.lineWidth = 1; ctx.setLineDash([3,3]);
    drawClippedSegment(ctx, img.x, img.y, img.x, baseY, W, H, 1);
    ctx.setLineDash([]);

    ctx.strokeStyle = '#ffcc02'; ctx.lineWidth = 2;
    const incSeg = drawClippedSegment(ctx, obj.x, obj.y, hit.x, hit.y, W, H, 1);
    arrowAlongSegment(ctx, incSeg, '#ffcc02', 0.62);

    const refGuide = map.p(-d0, hitY + (hitY - h0));
    ctx.strokeStyle = '#69f0ae'; ctx.lineWidth = 2;
    const refSeg = drawClippedRay(ctx, hit.x, hit.y, refGuide.x - hit.x, refGuide.y - hit.y, W, H, 1);
    arrowAlongSegment(ctx, refSeg, '#69f0ae', 0.38);

    ctx.strokeStyle = 'rgba(128,203,196,.55)'; ctx.lineWidth = 1.5; ctx.setLineDash([5,4]);
    drawClippedSegment(ctx, hit.x, hit.y, img.x, img.y, W, H, 1);
    ctx.setLineDash([]);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(hit.x, hit.y, 3, 0, P2); ctx.fill();

    const thInDeg = angInc.toFixed(1);
    ctx.fillStyle = '#ffcc80'; ctx.font = '10px monospace';
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText('θᵢ=' + thInDeg + '°', mirX - 8, hit.y - 16);
    ctx.fillStyle = '#a5d6a7'; ctx.textAlign = 'left';
    ctx.fillText('θᵣ=' + thInDeg + '°', mirX + 8, hit.y - 16);

    ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = 1; ctx.setLineDash([2,4]);
    drawClippedSegment(ctx, obj.x, baseY - 8, mirX, baseY - 8, W, H, 1);
    drawClippedSegment(ctx, mirX, baseY - 8, img.x, baseY - 8, W, H, 1);
    ctx.setLineDash([]);
    ctx.fillStyle = '#90caf9'; ctx.font = '10px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText('d₀=' + d0.toFixed(2) + 'm', (obj.x + mirX) / 2, baseY - 10);
    ctx.fillStyle = '#80cbc4';
    ctx.fillText('dᵢ=' + d0.toFixed(2) + 'm', (img.x + mirX) / 2, baseY - 10);

    document.getElementById('r5ti').textContent = thInDeg + '°';
    document.getElementById('r5tr').textContent = thInDeg + '°';
    document.getElementById('r5di').textContent = d0.toFixed(3) + ' m';
  }

  function arrowHead(ctx, x, y, ang, color) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-8, -4); ctx.lineTo(-8, 4); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function updCalc() {
    const m_lat = 1;
    document.getElementById('cl5').innerHTML = chHTML([
      { f: 'θᵢ = θᵣ',    v: '✓ igual',      u: '°'   },
      { f: 'dᵢ = d₀',    v: d0.toFixed(4),  u: 'm'   },
      { f: 'm = +1',      v: '1.0000',       u: '—'   },
      { f: 'hᵢ = h₀',    v: h0.toFixed(4),  u: 'm'   },
      { f: 'Imagen',      v: 'Virtual',      u: '—'   },
      { f: 'Orientación', v: 'Derecha',      u: '—'   },
    ]);
  }

  function init() {
    cv.width = cv.parentElement.clientWidth || 460;
    draw(); updCalc();
  }

  document.getElementById('s5d').oninput = e => {
    d0 = +e.target.value; document.getElementById('d5d').textContent = d0.toFixed(2) + ' m'; draw(); updCalc();
  };
  document.getElementById('s5h').oninput = e => {
    h0 = +e.target.value; document.getElementById('d5h').textContent = h0.toFixed(2) + ' m'; draw(); updCalc();
  };
  document.getElementById('s5a').oninput = e => {
    angInc = +e.target.value; document.getElementById('d5a').textContent = angInc + '°'; draw(); updCalc();
  };

  window.simInits[4] = init;
  init();
})();
