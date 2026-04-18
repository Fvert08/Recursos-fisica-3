'use strict';

// Registro global de funciones init de cada simulación
// Cada sim*.js empuja su función init aquí
window.simInits = [];

/** Despliega / pliega una sección por número (1-4). */
function tog(n) {
  const body = document.getElementById('b' + n);
  const ico  = document.getElementById('i' + n);
  const open = body.style.display !== 'none';
  body.style.display = open ? 'none' : '';
  ico.textContent = open ? '▶' : '▲';
  if (!open) {
    // Re-inicializar canvas al reabrir para ajustar ancho
    setTimeout(() => {
      const cv = document.getElementById('cv' + n);
      if (cv && window.simInits[n - 1]) {
        cv.width = cv.parentElement.clientWidth || 460;
        window.simInits[n - 1]();
      }
    }, 30);
  }
}

// Redibujar al redimensionar ventana
window.addEventListener('resize', () => {
  for (let n = 1; n <= 4; n++) {
    const body = document.getElementById('b' + n);
    if (body && body.style.display !== 'none' && window.simInits[n - 1]) {
      window.simInits[n - 1]();
    }
  }
});