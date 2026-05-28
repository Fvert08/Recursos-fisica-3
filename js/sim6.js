// Espejos Esféricos (Cóncavo y Convexo)
'use strict';
(function () {
  const cv  = document.getElementById('cv6');
  const ctx = cv.getContext('2d');

  let f = 1.2, d0 = 2.5, h0 = 0.5, tipo = 1; // tipo: 1=cóncavo, -1=convexo

  function drawLegacy() {
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

  function draw() {
    const W = cv.width, H = cv.height;
    bgd(ctx, W, H);

    const fs = tipo * Math.abs(f);
    const di_inv = 1 / fs - 1 / d0;
    const di = (Math.abs(di_inv) < 1e-9) ? Infinity : 1 / di_inv;
    const m_lat = isFinite(di) ? -di / d0 : 0;
    const hi = h0 * m_lat;

    const obj = { x: -d0, y: h0 };
    const img = isFinite(di) ? { x: -di, y: hi } : null;
    const focus = { x: -fs, y: 0 };
    const center = { x: -2 * fs, y: 0 };
    const hit1 = { x: 0, y: h0 };
    const hit2 = { x: 0, y: 0 };
    const focusDen = focus.x - obj.x;
    const hit3 = Math.abs(focusDen) > 1e-9
      ? { x: 0, y: obj.y + (0 - obj.x) * (focus.y - obj.y) / focusDen }
      : null;

    const xs = [obj.x, 0, focus.x, center.x];
    const ys = [0, obj.y, hit1.y, hit2.y];
    if (img) { xs.push(img.x); ys.push(img.y); }
    if (hit3 && isFinite(hit3.y)) ys.push(hit3.y);
    const map = makeWorldMapper(W, H, xs, ys, 26);
    const axisY = map.y(0);
    const mirrorX = map.x(0);

    ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.lineWidth = 1; ctx.setLineDash([6,4]);
    drawClippedSegment(ctx, 0, axisY, W, axisY, W, H, 1);
    ctx.setLineDash([]);

    const apertureWorld = Math.max(0.55, Math.max(Math.abs(h0), Math.abs(hit3 ? hit3.y : 0), Math.abs(img ? img.y : 0)) * 1.15);
    const topY = map.y(apertureWorld);
    const botY = map.y(-apertureWorld);
    ctx.strokeStyle = '#90caf9'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(mirrorX, topY); ctx.lineTo(mirrorX, botY); ctx.stroke();
    ctx.strokeStyle = '#1a3a5f'; ctx.lineWidth = 1;
    const hatchDir = tipo === 1 ? 1 : -1;
    for (let y = topY + 6; y < botY; y += 12) {
      ctx.beginPath(); ctx.moveTo(mirrorX + hatchDir * 3, y); ctx.lineTo(mirrorX + hatchDir * 12, y + 8); ctx.stroke();
    }

    const fP = map.p(focus.x, 0);
    const cP = map.p(center.x, 0);
    ctx.strokeStyle = 'rgba(255,160,0,.5)'; ctx.lineWidth = 1; ctx.setLineDash([3,4]);
    drawClippedSegment(ctx, fP.x, axisY - 12, fP.x, axisY + 12, W, H, 1);
    drawClippedSegment(ctx, cP.x, axisY - 12, cP.x, axisY + 12, W, H, 1);
    ctx.setLineDash([]);
    ctx.fillStyle = '#ffb300'; ctx.font = '10px monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('F', fP.x, axisY + 4);
    ctx.fillText('C', cP.x, axisY + 4);

    const objBase = map.p(obj.x, 0);
    const objTop = map.p(obj.x, obj.y);
    ctx.strokeStyle = '#ffb300'; ctx.fillStyle = '#ffb300'; ctx.lineWidth = 2;
    drawClippedSegment(ctx, objBase.x, objBase.y, objTop.x, objTop.y, W, H, 1);
    ctx.beginPath(); ctx.moveTo(objTop.x, objTop.y); ctx.lineTo(objTop.x - 5, objTop.y + 10); ctx.lineTo(objTop.x + 5, objTop.y + 10); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffe082'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('O', objTop.x + 6, objTop.y);

    function drawImpact(pt) {
      const p = map.p(pt.x, pt.y);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(p.x, p.y, 2.6, 0, P2); ctx.fill();
    }
    function raySegment(a, b, color, at = 0.55) {
      const pa = map.p(a.x, a.y), pb = map.p(b.x, b.y);
      ctx.strokeStyle = color; ctx.lineWidth = 1.6;
      const seg = drawClippedSegment(ctx, pa.x, pa.y, pb.x, pb.y, W, H, 1);
      arrowAlongSegment(ctx, seg, color, at, 7);
    }
    function rayFrom(a, guide, color, at = 0.42) {
      const pa = map.p(a.x, a.y), pg = map.p(guide.x, guide.y);
      ctx.strokeStyle = color; ctx.lineWidth = 1.6;
      const seg = drawClippedRay(ctx, pa.x, pa.y, pg.x - pa.x, pg.y - pa.y, W, H, 1);
      arrowAlongSegment(ctx, seg, color, at, 7);
    }

    raySegment(obj, hit1, '#69f0ae', 0.62);
    if (fs > 0) {
      rayFrom(hit1, focus, '#69f0ae');
    } else {
      rayFrom(hit1, { x: hit1.x - (focus.x - hit1.x), y: hit1.y - (focus.y - hit1.y) }, '#69f0ae');
      const h1 = map.p(hit1.x, hit1.y);
      ctx.strokeStyle = 'rgba(128,203,196,.58)'; ctx.lineWidth = 1.3; ctx.setLineDash([5,5]);
      drawClippedSegment(ctx, h1.x, h1.y, fP.x, fP.y, W, H, 1);
      ctx.setLineDash([]);
    }
    drawImpact(hit1);

    raySegment(obj, hit2, '#ff80ab', 0.62);
    rayFrom(hit2, { x: -d0, y: -h0 }, '#ff80ab');
    drawImpact(hit2);

    if (hit3 && isFinite(hit3.y)) {
      raySegment(obj, hit3, '#80d8ff', 0.62);
      rayFrom(hit3, { x: -1, y: hit3.y }, '#80d8ff');
      drawImpact(hit3);
    }

    if (img) {
      const isVirtual = di < 0;
      if (isVirtual) {
        ctx.strokeStyle = 'rgba(128,203,196,.58)'; ctx.lineWidth = 1.3; ctx.setLineDash([5,5]);
        const ip = map.p(img.x, img.y);
        for (const h of [hit1, hit2, hit3].filter(Boolean)) {
          const hp = map.p(h.x, h.y);
          drawClippedSegment(ctx, hp.x, hp.y, ip.x, ip.y, W, H, 1);
        }
        ctx.setLineDash([]);
      }

      const imgBase = map.p(img.x, 0);
      const imgTop = map.p(img.x, img.y);
      ctx.globalAlpha = isVirtual ? 0.5 : 1.0;
      ctx.strokeStyle = isVirtual ? '#80cbc4' : '#40c4ff';
      ctx.fillStyle = isVirtual ? '#80cbc4' : '#40c4ff';
      ctx.lineWidth = 2;
      drawClippedSegment(ctx, imgBase.x, imgBase.y, imgTop.x, imgTop.y, W, H, 1);
      ctx.beginPath(); ctx.moveTo(imgTop.x, imgTop.y); ctx.lineTo(imgTop.x - 5, imgTop.y + (hi >= 0 ? 10 : -10)); ctx.lineTo(imgTop.x + 5, imgTop.y + (hi >= 0 ? 10 : -10)); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = '#b2ebf2'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText('I', imgTop.x - 6, imgTop.y);

      ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = 1; ctx.setLineDash([2,4]);
      drawClippedSegment(ctx, mirrorX, axisY + 20, imgTop.x, axisY + 20, W, H, 1);
      ctx.setLineDash([]);
      ctx.fillStyle = '#80deea'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText('dᵢ=' + di.toFixed(2) + 'm', (mirrorX + imgTop.x) / 2, axisY + 18);
    }

    ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 1; ctx.setLineDash([2,4]);
    drawClippedSegment(ctx, objBase.x, axisY + 32, mirrorX, axisY + 32, W, H, 1);
    ctx.setLineDash([]);
    ctx.fillStyle = '#ffcc80'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText('d₀=' + d0.toFixed(2) + 'm', (objBase.x + mirrorX) / 2, axisY + 30);

    ctx.fillStyle = '#90caf9'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(tipo === 1 ? '⟵ Cóncavo  f=' + fs.toFixed(2) + 'm' : '⟵ Convexo  f='+fs.toFixed(2)+'m', 6, 4);

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
