/**
 * ============================================
 * BOARD.JS - Gestion du board JSXGraph
 * ============================================
 * 
 * Initialisation, zoom, rotation, reset, centrage
 */


// ==========================================
// INITIALISATION DU BOARD
// ==========================================

/**
 * Initialise le board JSXGraph
 */
function initBoard() {
  const newBoard = JXG.JSXGraph.initBoard('jxgbox', {
    boundingbox: [-5, 5, 5, -5],
    axis: false,
    showCopyright: false,
    showNavigation: false,
    keepaspectratio: true,
    zoom: {
      enabled: false
    },
    grid: false
  });
  
  setBoard(newBoard);
  
  // Créer les contrôles après l'init
  createBoardControls();
  
  // Ajouter le zoom à la molette
  setupWheelZoom();
  
  return newBoard;
}

// ==========================================
// CONTRÔLES DU BOARD (BOUTONS)
// ==========================================

/**
 * Crée le panneau de contrôles (zoom, rotation, reset)
 */
function createBoardControls() {
  const container = document.getElementById('jxgbox');
  if (!container) return;

  const existing = container.querySelector('.jxg-controls');
  if (existing) existing.remove();

  const panel = document.createElement('div');
  panel.className = 'jxg-controls';
  panel.style.zIndex = 10000;
  panel.style.pointerEvents = 'auto';
  panel.addEventListener('mousedown', e => { e.stopPropagation(); });
  panel.addEventListener('wheel', e => { e.stopPropagation(); });

  // Rangée 1 : Zoom
  const row1 = document.createElement('div');
  row1.className = 'small-row';

  const plus = document.createElement('button');
  plus.className = 'zoom-btn';
  plus.innerHTML = '<svg width="18" height="18" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M8 2v12M2 8h12" stroke="black" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';
  plus.title = 'Zoom +';
  plus.setAttribute('aria-label','Zoom +');
  plus.addEventListener('click', (e) => { e.stopPropagation(); zoomIn(); board.update(); });

  const minus = document.createElement('button');
  minus.className = 'zoom-btn';
  minus.innerHTML = '<svg width="18" height="18" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M2 8h12" stroke="black" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';
  minus.title = 'Zoom -';
  minus.setAttribute('aria-label','Zoom -');
  minus.addEventListener('click', (e) => { e.stopPropagation(); zoomOut(); board.update(); });

  row1.appendChild(minus);
  row1.appendChild(plus);

  // Rangée 2 : Rotation
  const row2 = document.createElement('div');
  row2.className = 'small-row';

  const rotateLeft = document.createElement('button');
  rotateLeft.className = 'rotate-btn';
  rotateLeft.textContent = '↶';
  rotateLeft.title = 'Rotation -10°';
  rotateLeft.addEventListener('click', (e) => { e.stopPropagation(); rotateFigureLeft(); board.update(); });

  const rotate = document.createElement('button');
  rotate.className = 'rotate-btn';
  rotate.textContent = '↷';
  rotate.title = 'Rotation +10°';
  rotate.addEventListener('click', (e) => { e.stopPropagation(); rotateFigure(); board.update(); });

  row2.appendChild(rotateLeft);
  row2.appendChild(rotate);

  // Rangée 3 : Reset
  const row3 = document.createElement('div');
  row3.className = 'small-row reset-row';

  const reset = document.createElement('button');
  reset.className = 'reset-btn';
  reset.textContent = 'Réinitialiser';
  reset.title = 'Réinitialiser';
  reset.setAttribute('aria-label','Réinitialiser');
  reset.addEventListener('click', (e) => { e.stopPropagation(); resetBoard(); });

  row3.appendChild(reset);

  panel.appendChild(row1);
  panel.appendChild(row2);
  panel.appendChild(row3);

  container.appendChild(panel);
}

/**
 * Active le zoom à la molette
 */
function setupWheelZoom() {
  const jxgbox = document.getElementById('jxgbox');
  if (!jxgbox) return;
  
  jxgbox.addEventListener('wheel', function (event) {
    event.preventDefault();
    
    const zoomFactor = 1.1;
    if (event.deltaY < 0) {
      board.zoom(1 / zoomFactor, 1 / zoomFactor); // Zoom avant
    } else {
      board.zoom(zoomFactor, zoomFactor); // Zoom arrière
    }
    
    board.update();
  });
}

// ==========================================
// FONCTIONS DE ZOOM
// ==========================================

function zoomIn() {
  board.zoomIn();
}

function zoomOut() {
  board.zoomOut();
}

// ==========================================
// FONCTIONS DE ROTATION
// ==========================================

/**
 * Rotation d'une coordonnée autour d'un centre
 */
function rotateCoord(x, y, cx, cy, angle) {
  const cos = Math.cos(angle), sin = Math.sin(angle);
  const dx = x - cx, dy = y - cy;
  return [cx + dx * cos - dy * sin, cy + dx * sin + dy * cos];
}

/**
 * Fait pivoter la figure de +10°
 */
function rotateFigure(step = Math.PI / 18) {
  // Cas 1 : cercle (centerPoint + circlePoint)
  if (centerPoint && circlePoint) {
    const cx = centerPoint.X(), cy = centerPoint.Y();
    const [nx, ny] = rotateCoord(circlePoint.X(), circlePoint.Y(), cx, cy, step);
    circlePoint.moveTo([nx, ny], 0);

    updateCircleExtras();
    board.update();
    return;
  }

  // Cas 2 : polygone
  if (!points || points.length === 0) return;

  // Centroïde
  let cx = 0, cy = 0;
  for (const p of points) { cx += p.X(); cy += p.Y(); }
  cx /= points.length; cy /= points.length;

  // Rotation de tous les points
  for (const p of points) {
    const [nx, ny] = rotateCoord(p.X(), p.Y(), cx, cy, step);
    p.moveTo([nx, ny], 0);
  }

  // Replacer les étiquettes
  if (texts && texts.length && points.length === texts.length) {
    for (let i = 0; i < points.length; i++) {
      const pt = points[i], txt = texts[i];
      if (txt && typeof txt.setPosition === 'function') {
        txt.setPosition(JXG.COORDS_BY_USER, [pt.X(), pt.Y() + (i === 1 || i === 0 ? -0.3 : 0.3)]);
      }
    }
  }

  // MAJ des éléments dérivés
  updateLengthLabels();
  updateCodings();
  updateDiagonals();
  updateEqualAngleMarkers(document.getElementById("toggleEqualAngles")?.checked);
  updateRightAngleMarkers(document.getElementById("toggleRightAngles")?.checked);
  board.update();
}

/**
 * Fait pivoter la figure de -10°
 */
function rotateFigureLeft(step = Math.PI / 18) {
  rotateFigure(-Math.abs(step));
}

// ==========================================
// RESET DU BOARD
// ==========================================

/**
 * Réinitialise complètement le board
 */
function resetBoard() {
  // Supprime l'ancien board
  JXG.JSXGraph.freeBoard(board);

  // Recrée un board neuf
  const newBoard = JXG.JSXGraph.initBoard('jxgbox', {
    boundingbox: [-5, 5, 5, -5],
    axis: false,
    showCopyright: false,
    showNavigation: false,
    keepaspectratio: true,
    zoom: { enabled: false }
  });
  
  setBoard(newBoard);
  createBoardControls();

  // Reset de l'effet main levée
  setIsHandDrawnMode(false);
  setOriginalPolygon(null);
  removeHandDrawnElements();
  
  // Décocher la checkbox main levée
  const handDrawnCheckbox = document.getElementById('toggleHandDrawn');
  if (handDrawnCheckbox) {
    handDrawnCheckbox.checked = false;
  }

  // Décocher toutes les options d'affichage
  const checkboxes = [
    'toggleRightAngles',
    'toggleEqualAngles', 
    'toggleLengths',
    'showUnitsCheckbox',
    'toggleCodings',
    'toggleDiagonals',
    'toggleRadius',
    'toggleDiameter'
  ];
  
  checkboxes.forEach(id => {
    const checkbox = document.getElementById(id);
    if (checkbox) {
      checkbox.checked = false;
    }
  });

  board.update();
}

// ==========================================
// CENTRAGE DE LA FIGURE
// ==========================================

/**
 * Retourne le centre du board
 */
function getBoardCenter() {
  const bb = board.getBoundingBox();
  const xmin = bb[0], ymax = bb[1], xmax = bb[2], ymin = bb[3];
  return [(xmin + xmax) / 2, (ymax + ymin) / 2];
}

/**
 * Retourne le centre de la figure
 */
function getFigureCenter() {
  // Cercle : préférer centre explicite
  if (typeof centerPoint !== 'undefined' && centerPoint) {
    return [centerPoint.X(), centerPoint.Y()];
  }
  // Sinon moyenne simple des sommets/points
  if (points && points.length > 0) {
    let sx = 0, sy = 0, n = 0;
    points.forEach(p => { sx += p.X(); sy += p.Y(); n++; });
    return n ? [sx / n, sy / n] : [0, 0];
  }
  return [0, 0];
}

/**
 * Centre la figure sur le board
 */
function centerFigure() {
  const [figCx, figCy] = getFigureCenter();
  const [boardCx, boardCy] = getBoardCenter();
  const dx = boardCx - figCx;
  const dy = boardCy - figCy;
  if (Math.abs(dx) < 1e-9 && Math.abs(dy) < 1e-9) return;

  // Helper pour déplacer un objet
  const moveObj = (o) => {
    if (!o) return;
    try { o.moveTo([o.X() + dx, o.Y() + dy], 0); } catch (e) {
      try { o.setPosition(JXG.COORDS_BY_USER, [o.X() + dx, o.Y() + dy]); } catch (ee) {}
    }
  };

  // 1. Déplacer les points principaux
  (points || []).forEach(moveObj);

  if (typeof centerPoint !== 'undefined' && centerPoint && !points.includes(centerPoint)) {
    moveObj(centerPoint);
  }
  if (typeof circlePoint !== 'undefined' && circlePoint && !points.includes(circlePoint)) {
    moveObj(circlePoint);
  }

  // 2. Déplacer les handles des labels de mesures
  (lengthHandles || []).forEach(moveObj);

  // 3. Déplacer les handles des labels de points
  (labelHandles || []).forEach(moveObj);

  // 4. Déplacer les textes
  const moveText = (t) => {
    if (!t) return;
    try {
      if (typeof t.setPosition === 'function') {
        t.setPosition(JXG.COORDS_BY_USER, [t.X() + dx, t.Y() + dy]);
      }
    } catch (e) {}
  };
  (labelTexts || []).forEach(moveText);
  (texts || []).forEach(moveText);
  (lengthLabels || []).forEach(moveText);

  // 5. Mise à jour finale
  updateCodings();
  updateDiagonals();
  updateLengthLabels();
  updateEqualAngleMarkers(document.getElementById("toggleEqualAngles")?.checked);
  
  board.update();
}
