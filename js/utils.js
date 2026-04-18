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