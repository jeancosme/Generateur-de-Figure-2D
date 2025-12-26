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
  
  // Configurer les listeners pour le mode gomme
  setupEraserListeners();
  
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
  reset.id = 'resetBtn';
  reset.className = 'reset-btn';
  reset.textContent = 'Réinitialiser';
  reset.title = 'Réinitialiser';
  reset.setAttribute('aria-label','Réinitialiser');
  reset.addEventListener('click', (e) => { e.stopPropagation(); resetBoard(); });

  row3.appendChild(reset);

  // Rangée 4 : Taille de police
  const row4 = document.createElement('div');
  row4.className = 'small-row';

  const fontMinus = document.createElement('button');
  fontMinus.className = 'zoom-btn';
  fontMinus.innerHTML = 'A-';
  fontMinus.title = 'Réduire la taille du texte';
  fontMinus.setAttribute('aria-label','Réduire la taille du texte');
  fontMinus.addEventListener('click', (e) => { e.stopPropagation(); decreaseFontSize(); });

  const fontPlus = document.createElement('button');
  fontPlus.className = 'zoom-btn';
  fontPlus.innerHTML = 'A+';
  fontPlus.title = 'Augmenter la taille du texte';
  fontPlus.setAttribute('aria-label','Augmenter la taille du texte');
  fontPlus.addEventListener('click', (e) => { e.stopPropagation(); increaseFontSize(); });

  row4.appendChild(fontMinus);
  row4.appendChild(fontPlus);

  // Rangée 5 : Gomme
  const row5 = document.createElement('div');
  row5.className = 'small-row';

  const eraser = document.createElement('button');
  eraser.id = 'eraserBtn';
  eraser.className = 'eraser-btn';
  eraser.innerHTML = '🧹';
  eraser.title = 'Gomme : cliquer pour effacer segments ou labels';
  eraser.setAttribute('aria-label', 'Mode gomme');
  eraser.addEventListener('click', (e) => { e.stopPropagation(); toggleEraserMode(); });

  row5.appendChild(eraser);

  panel.appendChild(row1);
  panel.appendChild(row2);
  panel.appendChild(row3);
  panel.appendChild(row4);
  panel.appendChild(row5);

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
// TAILLE DE POLICE
// ==========================================

function increaseFontSize() {
  const currentSize = getGlobalFontSize();
  setGlobalFontSize(currentSize + 2);
  updateAllFontSizes();
  console.log(`📝 Taille de police augmentée: ${getGlobalFontSize()}px`);
}

function decreaseFontSize() {
  const currentSize = getGlobalFontSize();
  setGlobalFontSize(currentSize - 2);
  updateAllFontSizes();
  console.log(`📝 Taille de police réduite: ${getGlobalFontSize()}px`);
}

function updateAllFontSizes() {
  const fontSize = getGlobalFontSize();
  
  // Mettre à jour TOUS les textes du board (y compris les labels magnétiques)
  const allTexts = board.objectsList.filter(obj => obj.elType === 'text');
  allTexts.forEach(text => {
    if (text && typeof text.setAttribute === 'function') {
      text.setAttribute({ fontSize: fontSize });
    }
  });
  
  console.log(`📝 ${allTexts.length} labels mis à jour avec fontSize: ${fontSize}px`);
  
  board.update();
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

// ==========================================
// MODE GOMME (ERASER)
// ==========================================

let eraserMode = false;

/**
 * Active/désactive le mode gomme
 */
function toggleEraserMode() {
  eraserMode = !eraserMode;
  const eraserBtn = document.getElementById('eraserBtn');
  
  if (eraserMode) {
    eraserBtn.style.backgroundColor = '#e74c3c';
    eraserBtn.style.color = 'white';
    document.getElementById('jxgbox').style.cursor = 'crosshair';
    console.log('🧹 Mode gomme ACTIVÉ - Cliquez sur un segment ou label pour l\'effacer');
  } else {
    eraserBtn.style.backgroundColor = '';
    eraserBtn.style.color = '';
    document.getElementById('jxgbox').style.cursor = 'default';
    console.log('🧹 Mode gomme DÉSACTIVÉ');
  }
}

/**
 * Gère le clic sur un objet en mode gomme
 */
function handleEraserClick(obj) {
  if (!eraserMode) return;
  
  const objType = obj.elType;
  
  // Effacer les segments (borders des polygones)
  if (objType === 'line') {
    console.log(`🧹 Suppression du segment ${obj.id || obj.name || 'sans nom'}`);
    try {
      board.removeObject(obj);
      board.update();
    } catch (e) {
      console.warn('Erreur lors de la suppression:', e);
    }
  }
  
  // Effacer les labels text
  else if (objType === 'text') {
    console.log(`🧹 Suppression du label "${obj.plaintext}"`);
    try {
      board.removeObject(obj);
      board.update();
    } catch (e) {
      console.warn('Erreur lors de la suppression:', e);
    }
  }
  
  // Autres types d'objets (pour l'instant juste un message)
  else {
    console.log(`⚠️ Type d'objet non supporté par la gomme: ${objType}`);
  }
}

/**
 * Configure les écouteurs d'événements pour le mode gomme
 */
function setupEraserListeners() {
  // Écouter les clics sur tous les objets du board
  board.on('down', function(e) {
    if (!eraserMode) return;
    
    // Trouver l'objet sous le curseur
    const coords = board.getUsrCoordsOfMouse(e);
    const x = coords[0];
    const y = coords[1];
    
    console.log(`🧹 Clic en (${x.toFixed(2)}, ${y.toFixed(2)})`);
    
    // Chercher les objets proches du clic
    let minDist = Infinity;
    let closestObj = null;
    let closestType = '';
    
    // PARCOURIR TOUTES LES LIGNES DU BOARD (segments et bordures)
    const allLines = board.objectsList.filter(obj => obj.elType === 'line');
    console.log(`🔍 ${allLines.length} lignes détectées sur le board`);
    
    allLines.forEach(line => {
      if (line.point1 && line.point2) {
        const dist = distancePointToSegment(x, y, line.point1, line.point2);
        if (dist < 0.3 && dist < minDist) {
          minDist = dist;
          closestObj = line;
          closestType = 'line';
          console.log(`  📏 Ligne proche trouvée: distance=${dist.toFixed(3)}`);
        }
      }
    });
    
    // Chercher les textes
    const allTexts = board.objectsList.filter(obj => obj.elType === 'text');
    allTexts.forEach(text => {
      if (text.X && text.Y) {
        const dist = Math.sqrt(Math.pow(x - text.X(), 2) + Math.pow(y - text.Y(), 2));
        if (dist < 0.5 && dist < minDist) {
          minDist = dist;
          closestObj = text;
          closestType = 'text';
          console.log(`  📝 Texte proche trouvé: "${text.plaintext}", distance=${dist.toFixed(3)}`);
        }
      }
    });
    
    if (closestObj) {
      console.log(`✅ Objet le plus proche: ${closestType}, distance=${minDist.toFixed(3)}`);
      handleEraserClick(closestObj);
    } else {
      console.log(`❌ Aucun objet trouvé à portée`);
    }
  });
}

/**
 * Calcule la distance d'un point à un segment
 */
function distancePointToSegment(x, y, p1, p2) {
  const x1 = p1.X(), y1 = p1.Y();
  const x2 = p2.X(), y2 = p2.Y();
  
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  
  if (lenSq !== 0) param = dot / lenSq;
  
  let xx, yy;
  
  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }
  
  const dx = x - xx;
  const dy = y - yy;
  
  return Math.sqrt(dx * dx + dy * dy);
}
