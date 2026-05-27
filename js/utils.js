'use strict';

// Constantes globales
const GV  = 9.8;
const P2  = 2 * Math.PI;

// polyfill roundRect
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    this.moveTo(x + r, y);
    this.lineTo(x + w - r, y); this.arcTo(x + w, y, x + w, y + r, r);
    this.lineTo(x + w, y + h - r); this.arcTo(x + w, y + h, x + w - r, y + h, r);
    this.lineTo(x + r, y + h); this.arcTo(x, y + h, x, y + h - r, r);
    this.lineTo(x, y + r); this.arcTo(x, y, x + r, y, r);
    this.closePath();
  };
}

/** Obtiene posición del evento (mouse o touch) relativa al canvas. */
function gpos(e, cv) {
  const r = cv.getBoundingClientRect();
  const s = e.touches ? e.touches[0] : e;
  return {
    x: (s.clientX - r.left) * cv.width  / r.width,
    y: (s.clientY - r.top)  * cv.height / r.height
  };
}

/** Dibuja fondo oscuro con cuadrícula. */
function bgd(ctx, W, H) {
  ctx.fillStyle = '#0b1e33';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(255,255,255,.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
}

function clipSegmentToRect(x1, y1, x2, y2, W, H, pad = 1) {
  const xmin = pad, ymin = pad, xmax = W - pad, ymax = H - pad;
  const dx = x2 - x1, dy = y2 - y1;
  let t0 = 0, t1 = 1;

  function clip(p, q) {
    if (Math.abs(p) < 1e-9) return q >= 0;
    const r = q / p;
    if (p < 0) {
      if (r > t1) return false;
      if (r > t0) t0 = r;
    } else {
      if (r < t0) return false;
      if (r < t1) t1 = r;
    }
    return true;
  }

  if (
    clip(-dx, x1 - xmin) && clip(dx, xmax - x1) &&
    clip(-dy, y1 - ymin) && clip(dy, ymax - y1)
  ) {
    return {
      x1: x1 + t0 * dx,
      y1: y1 + t0 * dy,
      x2: x1 + t1 * dx,
      y2: y1 + t1 * dy
    };
  }
  return null;
}

function rayEndInRect(x, y, dx, dy, W, H, pad = 1) {
  const xmin = pad, ymin = pad, xmax = W - pad, ymax = H - pad;
  const ts = [];
  if (dx > 1e-9) ts.push((xmax - x) / dx);
  if (dx < -1e-9) ts.push((xmin - x) / dx);
  if (dy > 1e-9) ts.push((ymax - y) / dy);
  if (dy < -1e-9) ts.push((ymin - y) / dy);

  ts.sort((a, b) => a - b);
  for (const t of ts) {
    const px = x + dx * t, py = y + dy * t;
    if (t > 1e-9 && px >= xmin - 1e-6 && px <= xmax + 1e-6 && py >= ymin - 1e-6 && py <= ymax + 1e-6) {
      return { x: px, y: py };
    }
  }
  return { x, y };
}

function drawClippedSegment(ctx, x1, y1, x2, y2, W, H, pad = 1) {
  const seg = clipSegmentToRect(x1, y1, x2, y2, W, H, pad);
  if (!seg) return null;
  ctx.beginPath();
  ctx.moveTo(seg.x1, seg.y1);
  ctx.lineTo(seg.x2, seg.y2);
  ctx.stroke();
  return seg;
}

function drawClippedRay(ctx, x, y, dx, dy, W, H, pad = 1) {
  const end = rayEndInRect(x, y, dx, dy, W, H, pad);
  return drawClippedSegment(ctx, x, y, end.x, end.y, W, H, pad);
}

function drawArrowhead(ctx, x, y, ang, color, size = 8) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size, -size * 0.5);
  ctx.lineTo(-size, size * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function arrowAlongSegment(ctx, seg, color, at = 0.55, size = 8) {
  if (!seg) return;
  const x = seg.x1 + (seg.x2 - seg.x1) * at;
  const y = seg.y1 + (seg.y2 - seg.y1) * at;
  drawArrowhead(ctx, x, y, Math.atan2(seg.y2 - seg.y1, seg.x2 - seg.x1), color, size);
}

function makeWorldMapper(W, H, xs, ys, pad = 24) {
  let minX = Math.min(...xs), maxX = Math.max(...xs);
  let minY = Math.min(...ys), maxY = Math.max(...ys);
  if (!isFinite(minX) || !isFinite(maxX) || minX === maxX) { minX = -1; maxX = 1; }
  if (!isFinite(minY) || !isFinite(maxY) || minY === maxY) { minY = -1; maxY = 1; }

  const growX = Math.max(0.15, (maxX - minX) * 0.08);
  const growY = Math.max(0.15, (maxY - minY) * 0.12);
  minX -= growX; maxX += growX;
  minY -= growY; maxY += growY;

  const spanX = maxX - minX;
  const spanY = maxY - minY;
  const sc = Math.min((W - 2 * pad) / spanX, (H - 2 * pad) / spanY);
  const left = pad + ((W - 2 * pad) - spanX * sc) / 2;
  const top = pad + ((H - 2 * pad) - spanY * sc) / 2;

  return {
    sc,
    x: v => left + (v - minX) * sc,
    y: v => top + (maxY - v) * sc,
    p: (x, y) => ({ x: left + (x - minX) * sc, y: top + (maxY - y) * sc })
  };
}

/** Dibuja un resorte entre dos puntos. */
function drawSpr(ctx, x1, y1, x2, y2, coils = 8) {
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
  if (len < 4) return;
  const ang = Math.atan2(dy, dx), lead = 8, amp = 7, n = coils * 2;
  const seg = Math.max(1, (len - 2 * lead) / n);
  ctx.save(); ctx.translate(x1, y1); ctx.rotate(ang);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(lead, 0);
  for (let i = 0; i < n; i++) ctx.lineTo(lead + (i + .5) * seg, i % 2 ? amp : -amp);
  ctx.lineTo(len, 0); ctx.stroke(); ctx.restore();
}

/** Genera HTML para las tarjetas de la calculadora. */
function chHTML(items) {
  return items.map(({ f, v, u }) =>
    `<div class="ci"><div class="cf">${f}</div><div class="cv">${v}</div><div class="cu">${u}</div></div>`
  ).join('');
}

/**
 * Un paso de integración Runge-Kutta 4 para osciladores.
 * @param {number} th - ángulo/posición actual
 * @param {number} om - velocidad angular/lineal actual
 * @param {number} dt - paso de tiempo
 * @param {function} alpha - función alpha(th) que retorna la aceleración
 */
function rk4(th, om, dt, alpha) {
  const k1t = om,          k1w = alpha(th);
  const k2t = om + .5*dt*k1w, k2w = alpha(th + .5*dt*k1t);
  const k3t = om + .5*dt*k2w, k3w = alpha(th + .5*dt*k2t);
  const k4t = om + dt*k3w,    k4w = alpha(th + dt*k3t);
  return {
    th: th + (dt / 6) * (k1t + 2*k2t + 2*k3t + k4t),
    om: om + (dt / 6) * (k1w + 2*k2w + 2*k3w + k4w)
  };
}
