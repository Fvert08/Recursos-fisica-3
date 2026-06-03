'use strict';

// C Registro global de funciones init de cada simulación
// C Cada archivo de simulación empuja su función init aquí
window.simInits = [];

/** C
 * C Ajusta el ancho interno de resolución del lienzo al tamaño real de su contenedor
 * C y ejecuta la función de inicialización/redibujo correspondiente.
 */
function fitCanvas(n) {
  const cv = document.getElementById('cv' + n);
  if (cv && window.simInits[n - 1]) {
    // C Sincroniza los píxeles internos con el ancho real del contenedor en la página
    cv.width = cv.parentElement.clientWidth || 460;
    // C Ejecuta la inicialización o redibujo con las dimensiones correctas
    window.simInits[n - 1]();
  }
}

/** C Despliega / pliega una sección por número (1-4). */
function tog(n) {
  const body = document.getElementById('b' + n);
  const ico  = document.getElementById('i' + n);
  const open = body.style.display !== 'none';
  body.style.display = open ? 'none' : '';
  ico.textContent = open ? '▶' : '▲';
  if (!open) {
    // C Espera un breve instante a que el CSS aplique el cambio de display para medir correctamente
    setTimeout(() => {
      fitCanvas(n);
    }, 30);
  }
}

// C Inicializar automáticamente las simulaciones que estén visibles al cargar la página
window.addEventListener('load', () => {
  for (let n = 1; n <= 4; n++) {
    const body = document.getElementById('b' + n);
    // C Si la tarjeta está expandida (como la del Experimento 1), ajústala e iníciala de inmediato
    if (body && body.style.display !== 'none') {
      fitCanvas(n);
    }
  }
});

// C Corregir resolución y redibujar en tiempo real cuando se redimensione la ventana
window.addEventListener('resize', () => {
  for (let n = 1; n <= 4; n++) {
    const body = document.getElementById('b' + n);
    // C Solo actualiza las pestañas que el usuario tenga abiertas en ese momento
    if (body && body.style.display !== 'none') {
      fitCanvas(n);
    }
  }
});
