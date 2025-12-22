// ==========================================
// GÃ‰NÃ‰RATEUR DE FIGURES 2D - Bundle Version
// ==========================================
// Ce fichier est gÃ©nÃ©rÃ© automatiquement par build-bundle.ps1
// Ne pas modifier directement - Modifier les modules dans js/
// Date de build: 22/12/2025 18:06:52
// ==========================================


// ==========================================
// MODULE: js/config.js
// ==========================================
/**
 * ============================================
 * CONFIG.JS - Configuration et état global
 * ============================================
 * 
 * Ce module contient TOUTES les variables globales partagées
 * entre les différents modules de l'application.
 * 
 * ⚠️ IMPORTANT : Ce fichier doit être importé EN PREMIER
 * par tous les autres modules qui en ont besoin.
 */

// ==========================================
// BOARD JSXGRAPH
// ==========================================

/**
 * Instance principale du board JSXGraph
 * Initialisée dans board.js via initBoard()
 */
let board = null;

/**
 * Setter pour le board (appelé uniquement depuis board.js)
 */
function setBoard(newBoard) {
  board = newBoard;
}

// ==========================================
// ÉLÉMENTS GÉOMÉTRIQUES
// ==========================================

let points = [];
let polygon = null;
let texts = [];
let customLabels = [];

// ==========================================
// MARQUEURS VISUELS
// ==========================================

let rightAngleMarkers = [];
let lengthLabels = [];
let lengthHandles = [];
let lengthHandleMeta = [];
let codingMarks = [];
let codingSegments = [];
let angleMarkers = [];
let diagonals = [];

// ==========================================
// ÉLÉMENTS SPÉCIFIQUES AU CERCLE
// ==========================================

let centerPoint = null;
let circlePoint = null;
let circleObject = null;
let radiusSegment = null;
let radiusLabel = null;
let radiusLabelAnchor = null;
let diameterSegment = null;
let diameterPoints = [];

// ==========================================
// ÉLÉMENTS DES LABELS
// ==========================================

let labelHandles = [];
let labelTexts = [];

// ==========================================
// INTERSECTION DES DIAGONALES
// ==========================================

let intersectionLabel = null;
let intersectionPoint = null;

// ==========================================
// EFFET MAIN LEVÉE
// ==========================================

let originalPolygon = null;
let handDrawnElements = [];
let isHandDrawnMode = false;

// ==========================================
// DIVERS
// ==========================================

let extraElements = [];
let r = null;
let _lengthSyncAttached = false;

// ==========================================
// SETTERS POUR MODIFICATION D'ÉTAT
// ==========================================

function setPoints(newPoints) { points = newPoints; }
function setPolygon(newPolygon) { polygon = newPolygon; }
function setTexts(newTexts) { texts = newTexts; }
function setCustomLabels(newLabels) { customLabels = newLabels; }
function setRightAngleMarkers(newMarkers) { rightAngleMarkers = newMarkers; }
function setLengthLabels(newLabels) { lengthLabels = newLabels; }
function setLengthHandles(newHandles) { lengthHandles = newHandles; }
function setLengthHandleMeta(newMeta) { lengthHandleMeta = newMeta; }
function setCodingMarks(newMarks) { codingMarks = newMarks; }
function setCodingSegments(newSegments) { codingSegments = newSegments; }
function setAngleMarkers(newMarkers) { angleMarkers = newMarkers; }
function setDiagonals(newDiagonals) { diagonals = newDiagonals; }
function setCenterPoint(newPoint) { centerPoint = newPoint; }
function setCirclePoint(newPoint) { circlePoint = newPoint; }
function setCircleObject(newCircle) { circleObject = newCircle; }
function setRadiusSegment(newSegment) { radiusSegment = newSegment; }
function setRadiusLabel(newLabel) { radiusLabel = newLabel; }
function setRadiusLabelAnchor(newAnchor) { radiusLabelAnchor = newAnchor; }
function setDiameterSegment(newSegment) { diameterSegment = newSegment; }
function setDiameterPoints(newPoints) { diameterPoints = newPoints; }
function setLabelHandles(newHandles) { labelHandles = newHandles; }
function setLabelTexts(newTexts) { labelTexts = newTexts; }
function setIntersectionLabel(newLabel) { intersectionLabel = newLabel; }
function setIntersectionPoint(newPoint) { intersectionPoint = newPoint; }
function setOriginalPolygon(newPolygon) { originalPolygon = newPolygon; }
function setHandDrawnElements(newElements) { handDrawnElements = newElements; }
function setIsHandDrawnMode(newMode) { isHandDrawnMode = newMode; }
function setExtraElements(newElements) { extraElements = newElements; }
function setR(newR) { r = newR; }
function setLengthSyncAttached(newValue) { _lengthSyncAttached = newValue; }

// ==========================================
// HELPERS POUR RESET COMPLET
// ==========================================

/**
 * Réinitialise toutes les variables globales à leur état initial
 * Utilisé lors d'un reset complet de la figure
 */
function resetAllGlobalVariables() {
  points = [];
  polygon = null;
  texts = [];
  customLabels = [];
  rightAngleMarkers = [];
  lengthLabels = [];
  lengthHandles = [];
  lengthHandleMeta = [];
  codingMarks = [];
  codingSegments = [];
  angleMarkers = [];
  diagonals = [];
  centerPoint = null;
  circlePoint = null;
  circleObject = null;
  radiusSegment = null;
  radiusLabel = null;
  radiusLabelAnchor = null;
  diameterSegment = null;
  diameterPoints = [];
  labelHandles = [];
  labelTexts = [];
  intersectionLabel = null;
  intersectionPoint = null;
  originalPolygon = null;
  handDrawnElements = [];
  isHandDrawnMode = false;
  extraElements = [];
  r = null;
  _lengthSyncAttached = false;
}

// ==========================================
// MODULE: js/utils.js
// ==========================================
/**
 * ============================================
 * UTILS.JS - Fonctions utilitaires
 * ============================================
 * 
 * Fonctions de parsing, calculs et utilitaires
 * sans dépendances complexes.
 */

// ==========================================
// EXTRACTION DE NOMBRES
// ==========================================

/**
 * Extrait un nombre d'une chaîne de texte
 * @param {string} text - Texte contenant le nombre
 * @param {number} defaultValue - Valeur par défaut si aucun nombre trouvé
 * @returns {number} Le nombre extrait ou la valeur par défaut
 */
function extractNumber(text, defaultValue = 1) {
  const match = text.match(/(\d+(?:[.,]\d+)?)/);
  if (!match) return defaultValue;
  return parseFloat(match[1].replace(',', '.'));
}

/**
 * Extrait deux nombres d'une chaîne de texte
 * @param {string} text - Texte contenant les nombres
 * @param {Array} defaultValues - Valeurs par défaut [a, b]
 * @returns {Array} Tableau de 2 nombres
 */
function extractTwoNumbers(text, defaultValues = [3, 5]) {
  const matches = text.match(/(\d+(?:[.,]\d+)?)/g);
  if (!matches || matches.length < 2) return defaultValues;
  return matches.slice(0, 2).map(n => parseFloat(n.replace(',', '.')));
}

/**
 * Extrait trois nombres d'une chaîne de texte
 * @param {string} text - Texte contenant les nombres
 * @param {Array} defaultValues - Valeurs par défaut [a, b, c]
 * @returns {Array} Tableau de 3 nombres
 */
function extractThreeNumbers(text, defaultValues = [3, 4, 5]) {
  const matches = text.match(/(\d+(?:[.,]\d+)?)/g);
  
  if (!matches || matches.length < 3) {
    console.warn(`⚠️ Moins de 3 nombres trouvés dans "${text}", utilisation des valeurs par défaut`);
    return defaultValues;
  }
  
  return matches.slice(0, 3).map(n => parseFloat(n.replace(',', '.')));
}

// ==========================================
// GESTION DES LABELS
// ==========================================

/**
 * Retourne le label pour un point à l'index donné
 * @param {number} index - Index du point
 * @returns {string} Label du point (A, B, C, etc.)
 */
function getLabel(index) {
  const defaultLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
  
  // ✅ CORRECTION : Parser les labels personnalisés caractère par caractère
  if (customLabels && customLabels.length > 0) {
    // Si l'utilisateur a tapé une seule chaîne comme "BDFG"
    if (customLabels.length === 1 && customLabels[0].length > 1) {
      const singleString = customLabels[0];
      
      // ✅ NOUVEAU : Séparer automatiquement les lettres
      const individualLetters = singleString.split('');
      
      if (index < individualLetters.length) {
        return individualLetters[index];
      }
    }
    // Si l'utilisateur a tapé "B,D,F,G" ou "B D F G" (séparés)
    else if (index < customLabels.length) {
      return customLabels[index];
    }
  }
  
  // Fallback sur les labels par défaut
  return defaultLabels[index] || `P${index}`;
}

// ==========================================
// PERFORMANCE MONITORING
// ==========================================

/**
 * Mesure le temps d'exécution d'une fonction
 * @param {string} functionName - Nom de la fonction
 * @param {Function} fn - Fonction à exécuter
 * @returns {*} Résultat de la fonction
 */
function measurePerformance(functionName, fn) {
  const startTime = performance.now();
  const result = fn();
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  if (duration > 10) { // Seulement si > 10ms
    console.log(`⏱️ ${functionName}: ${duration.toFixed(2)}ms`);
  }
  
  return result;
}

// ==========================================
// MODULE: js/board.js
// ==========================================
/**
 * ============================================
 * BOARD.JS - Gestion du board JSXGraph
 * ============================================
 * 
 * Initialisation, zoom, rotation, reset, centrage
 */

// ⚠️ Ces imports seront ajoutés quand les modules seront créés
// // // // // Placeholders temporaires pour éviter les erreurs
const updateCircleExtras = () => {};
const updateLengthLabels = () => {};
const updateCodings = () => {};
const updateDiagonals = () => {};
const updateEqualAngleMarkers = () => {};
const updateRightAngleMarkers = () => {};
const removeHandDrawnElements = () => {};

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

// ==========================================
// MODULE: js/handlers.js
// ==========================================
/**
 * ============================================
 * HANDLERS.JS - Système de détection et handlers de figures
 * ============================================
 * 
 * Classes pour détecter et gérer les différents types de figures
 * géométriques (triangles, quadrilatères, cercles, polygones)
 */

// ==========================================
// CACHE DE DÉTECTION
// ==========================================

let _figureCache = {
  lastPoints: null,
  lastExtraData: null,
  result: null,
  isValid: false
};

let _lengthLabelsCache = null;
let _codingsCache = null; 
let _rightAnglesCache = null;

// ==========================================
// CLASSE DE DÉTECTION CENTRALISÉE
// ==========================================

/**
 * Détecteur centralisé pour identifier le type exact d'une figure géométrique
 */
export class FigureDetector {
  
  /**
   * Détecte le type de figure basé sur les points
   * @param {Array} figurePoints - Array des points JSXGraph
   * @param {Object} extraData - Données supplémentaires (centerPoint, circlePoint, etc.)
   * @returns {Object} Information détaillée sur la figure
   */
  static detect(figurePoints, extraData = {}) {
    console.log('🔍 Détection de figure pour', figurePoints?.length, 'points');
    
    if (!figurePoints || figurePoints.length === 0) {
      return { type: 'unknown', subtype: null, properties: {} };
    }
    
    const n = figurePoints.length;
    
    // CERCLE
    if (extraData.centerPoint && extraData.circlePoint && extraData.circleObject) {
      return this._detectCircle(extraData.centerPoint, extraData.circlePoint);
    }
    
    // TRIANGLE (3 points)
    if (n === 3) {
      return this._detectTriangle(figurePoints);
    }
    
    // QUADRILATÈRE (4 points)
    if (n === 4) {
      return this._detectQuadrilateral(figurePoints);
    }
    
    // POLYGONE RÉGULIER (5+ points)
    if (n >= 5) {
      return this._detectPolygon(figurePoints);
    }
    
    return { type: 'unknown', subtype: null, properties: {} };
  }
  
  // DÉTECTION DE CERCLE
  static _detectCircle(centerPoint, circlePoint) {
    const radius = Math.hypot(
      circlePoint.X() - centerPoint.X(),
      circlePoint.Y() - centerPoint.Y()
    );
    
    return {
      type: 'circle',
      subtype: 'standard',
      properties: {
        radius: radius,
        center: { x: centerPoint.X(), y: centerPoint.Y() },
        pointOnCircle: { x: circlePoint.X(), y: circlePoint.Y() }
      }
    };
  }
  
  // DÉTECTION DE TRIANGLE
  static _detectTriangle(figurePoints) {
    const tolerance = 0.1;
    const sideLengths = this._calculateSideLengths(figurePoints);
    const sortedLengths = [...sideLengths].sort((a, b) => a - b);
    
    // Triangle rectangle ?
    const [a, b, c] = sortedLengths;
    const isRightTriangle = Math.abs(a*a + b*b - c*c) < tolerance;
    
    // Côtés égaux
    const uniqueLengths = this._getUniqueLengths(sideLengths, tolerance);
    
    let subtype;
    let properties = {
      sideLengths: sideLengths,
      isRight: isRightTriangle,
      rightAngleIndex: -1
    };
    
    if (uniqueLengths.length === 1) {
      subtype = 'equilateral';
    } else if (uniqueLengths.length === 2) {
      subtype = 'isosceles';
    } else {
      subtype = isRightTriangle ? 'right' : 'scalene';
    }
    
    if (isRightTriangle) {
      properties.rightAngleIndex = this._findRightAngleVertex(figurePoints);
    }
    
    console.log(`✅ Triangle détecté: ${subtype}, côtés: [${sideLengths.map(l => l.toFixed(1)).join(', ')}]`);
    
    return {
      type: 'triangle',
      subtype: subtype,
      properties: properties
    };
  }
  
  // DÉTECTION DE QUADRILATÈRE
  static _detectQuadrilateral(figurePoints) {
    const tolerance = 0.15;
    const sideLengths = this._calculateSideLengths(figurePoints);
    const uniqueLengths = this._getUniqueLengths(sideLengths, tolerance);
    const rightAngles = this._countRightAngles(figurePoints, tolerance);
    const hasParallelSides = this._hasParallelOppositeSides(sideLengths, tolerance);
    
    let subtype;
    let properties = {
      sideLengths: sideLengths,
      rightAnglesCount: rightAngles,
      hasParallelSides: hasParallelSides
    };
    
    if (rightAngles === 4) {
      subtype = uniqueLengths.length === 1 ? 'square' : 'rectangle';
    } else if (uniqueLengths.length === 1) {
      subtype = 'rhombus';
    } else if (hasParallelSides && uniqueLengths.length === 2) {
      subtype = 'parallelogram';
    } else {
      subtype = 'irregular';
    }
    
    console.log(`✅ Quadrilatère détecté: ${subtype}, côtés: [${sideLengths.map(l => l.toFixed(1)).join(', ')}], angles droits: ${rightAngles}`);
    
    return {
      type: 'quadrilateral',
      subtype: subtype,
      properties: properties
    };
  }
  
  // DÉTECTION DE POLYGONE
  static _detectPolygon(figurePoints) {
    const n = figurePoints.length;
    const sideLengths = this._calculateSideLengths(figurePoints);
    const uniqueLengths = this._getUniqueLengths(sideLengths, 0.1);
    const isRegular = (uniqueLengths.length === 1);
    
    const polygonNames = {
      5: 'pentagon',
      6: 'hexagon',
      7: 'heptagon',
      8: 'octagon'
    };
    
    const baseName = polygonNames[n] || `${n}-gon`;
    const subtype = isRegular ? 'regular' : 'irregular';
    
    console.log(`✅ Polygone détecté: ${baseName} ${subtype}`);
    
    return {
      type: 'polygon',
      subtype: `${subtype}_${baseName}`,
      properties: {
        sides: n,
        sideLengths: sideLengths,
        isRegular: isRegular
      }
    };
  }
  
  // MÉTHODES UTILITAIRES
  
  static _calculateSideLengths(figurePoints) {
    const lengths = [];
    const n = figurePoints.length;
    
    for (let i = 0; i < n; i++) {
      const pt1 = figurePoints[i];
      const pt2 = figurePoints[(i + 1) % n];
      const length = Math.hypot(pt2.X() - pt1.X(), pt2.Y() - pt1.Y());
      lengths.push(length);
    }
    
    return lengths;
  }
  
  static _getUniqueLengths(lengths, tolerance) {
    const rounded = lengths.map(l => Math.round(l / tolerance) * tolerance);
    return [...new Set(rounded.map(l => l.toFixed(2)))];
  }
  
  static _countRightAngles(figurePoints, tolerance) {
    const n = figurePoints.length;
    let count = 0;
    
    for (let i = 0; i < n; i++) {
      const A = figurePoints[(i - 1 + n) % n];
      const B = figurePoints[i];
      const C = figurePoints[(i + 1) % n];
      
      if (this._isRightAngle(A, B, C, tolerance)) {
        count++;
      }
    }
    
    return count;
  }
  
  static _isRightAngle(A, B, C, tolerance = 0.15) {
    const v1x = A.X() - B.X();
    const v1y = A.Y() - B.Y();
    const v2x = C.X() - B.X();
    const v2y = C.Y() - B.Y();
    
    const len1 = Math.hypot(v1x, v1y);
    const len2 = Math.hypot(v2x, v2y);
    
    if (len1 === 0 || len2 === 0) return false;
    
    const dotProduct = v1x * v2x + v1y * v2y;
    const toleranceAbs = Math.max(1e-6, tolerance * len1 * len2);
    
    return Math.abs(dotProduct) < toleranceAbs;
  }
  
  static _findRightAngleVertex(figurePoints) {
    const n = figurePoints.length;
    
    for (let i = 0; i < n; i++) {
      const A = figurePoints[(i - 1 + n) % n];
      const B = figurePoints[i];
      const C = figurePoints[(i + 1) % n];
      
      if (this._isRightAngle(A, B, C)) {
        return i;
      }
    }
    
    return -1;
  }
  
  static _hasParallelOppositeSides(sideLengths, tolerance) {
    if (sideLengths.length !== 4) return false;
    
    const [s1, s2, s3, s4] = sideLengths;
    const opposite1Equal = Math.abs(s1 - s3) < tolerance;
    const opposite2Equal = Math.abs(s2 - s4) < tolerance;
    
    return opposite1Equal && opposite2Equal;
  }
}

// ==========================================
// FONCTIONS DE CACHE
// ==========================================

function getCurrentFigureType() {
  const currentPoints = points ? [...points] : [];
  const currentExtraData = {
    centerPoint: centerPoint,
    circlePoint: circlePoint,
    circleObject: circleObject
  };
  
  const cacheValid = (
    _figureCache.isValid &&
    _figureCache.lastPoints &&
    _figureCache.lastPoints.length === currentPoints.length &&
    _figureCache.lastExtraData?.centerPoint === currentExtraData.centerPoint
  );
  
  if (!cacheValid) {
    _figureCache.result = FigureDetector.detect(currentPoints, currentExtraData);
    _figureCache.lastPoints = currentPoints;
    _figureCache.lastExtraData = currentExtraData;
    _figureCache.isValid = true;
    
    console.log('🔄 Cache de figure mis à jour:', _figureCache.result.type, _figureCache.result.subtype);
  }
  
  return _figureCache.result;
}

function invalidateFigureCache(reason = 'manual') {
  const wasValid = _figureCache.isValid;
  _figureCache.isValid = false;
  
  if (wasValid) {
    console.log(`🗑️ Cache invalidé: ${reason}`);
  }
  
  _lengthLabelsCache = null;
  _codingsCache = null;
  _rightAnglesCache = null;
}

function getActiveDisplayOptions() {
  return {
    lengths: document.getElementById('toggleLengths')?.checked || false,
    codings: document.getElementById('toggleCodings')?.checked || false,
    rightAngles: document.getElementById('toggleRightAngles')?.checked || false,
    equalAngles: document.getElementById('toggleEqualAngles')?.checked || false,
    diagonals: document.getElementById('toggleDiagonals')?.checked || false,
    radius: document.getElementById('toggleRadius')?.checked || false,
    diameter: document.getElementById('toggleDiameter')?.checked || false,
    circleExtras: (document.getElementById('toggleRadius')?.checked || document.getElementById('toggleDiameter')?.checked) || false
  };
}

// ==========================================
// CLASSES DE HANDLERS
// ==========================================

export class BaseFigureHandler {
  constructor(figurePoints, figureInfo) {
    this.points = figurePoints;
    this.figureInfo = figureInfo;
  }
  
  getSidesToShow() { return []; }
  getRightAngles() { return []; }
  getCodings() { return { groups: [], type: 'none' }; }
  shouldShowSingleRightAngle() { return false; }
  shouldHideHypotenuse() { return false; }
  getHypotenuseIndex() { return -1; }
  
  getSideLength(sideIndex) {
    if (!this.points || sideIndex >= this.points.length) return 0;
    const pt1 = this.points[sideIndex];
    const pt2 = this.points[(sideIndex + 1) % this.points.length];
    return Math.hypot(pt2.X() - pt1.X(), pt2.Y() - pt1.Y());
  }
}

export class SquareHandler extends BaseFigureHandler {
  getSidesToShow() { return [2]; }
  getRightAngles() { return [1, 0, 2, 3]; }
  getCodings() {
    return {
      groups: [{ sides: [0, 1, 2, 3], markCount: 1 }],
      type: 'all-equal'
    };
  }
  shouldShowSingleRightAngle() { return true; }
}

export class RectangleHandler extends BaseFigureHandler {
  getSidesToShow() { return [1, 2]; }
  getRightAngles() { return [1, 0, 2, 3]; }
  getCodings() {
    const sideLengths = this.figureInfo.properties?.sideLengths || [];
    if (sideLengths.length !== 4) return { groups: [], type: 'none' };
    
    return {
      groups: [
        { sides: [0, 2], markCount: 1 },
        { sides: [1, 3], markCount: 2 }
      ],
      type: 'opposite-pairs'
    };
  }
  shouldShowSingleRightAngle() { return true; }
}

export class RhombusHandler extends BaseFigureHandler {
  getSidesToShow() { return [2]; }
  getRightAngles() { return []; }
  getCodings() {
    return {
      groups: [{ sides: [0, 1, 2, 3], markCount: 1 }],
      type: 'all-equal'
    };
  }
}

export class ParallelogramHandler extends BaseFigureHandler {
  getSidesToShow() { return [1, 2]; }
  getRightAngles() { return []; }
  getCodings() {
    return {
      groups: [
        { sides: [0, 2], markCount: 1 },
        { sides: [1, 3], markCount: 2 }
      ],
      type: 'opposite-pairs'
    };
  }
}

export class EquilateralTriangleHandler extends BaseFigureHandler {
  getSidesToShow() { return [0]; }
  getRightAngles() { return []; }
  getCodings() {
    return {
      groups: [{ sides: [0, 1, 2], markCount: 1 }],
      type: 'all-equal'
    };
  }
}

export class RightTriangleHandler extends BaseFigureHandler {
  getSidesToShow() { return [0, 1, 2]; }
  getRightAngles() {
    const rightAngleIndex = this.figureInfo.properties?.rightAngleIndex ?? -1;
    return rightAngleIndex !== -1 ? [rightAngleIndex] : [];
  }
  getCodings() { return { groups: [], type: 'none' }; }
  shouldHideHypotenuse() { return true; }
  
  getHypotenuseIndex() {
    if (!this.points || this.points.length !== 3) return -1;
    
    const sideLengths = [];
    for (let i = 0; i < 3; i++) {
      sideLengths.push({
        index: i,
        length: this.getSideLength(i)
      });
    }
    
    const longestSide = sideLengths.reduce((max, side) => 
      side.length > max.length ? side : max
    );
    
    return longestSide.index;
  }
}

export class IsoscelesTriangleHandler extends BaseFigureHandler {
  getSidesToShow() { return [0, 1, 2]; }
  getRightAngles() {
    const rightAngleIndex = this.figureInfo.properties?.rightAngleIndex ?? -1;
    return rightAngleIndex !== -1 ? [rightAngleIndex] : [];
  }
  
  getCodings() {
    const sideLengths = this.figureInfo.properties?.sideLengths || [];
    if (sideLengths.length !== 3) return { groups: [], type: 'none' };
    
    const tolerance = 0.1;
    const groups = [];
    
    for (let i = 0; i < 3; i++) {
      for (let j = i + 1; j < 3; j++) {
        if (Math.abs(sideLengths[i] - sideLengths[j]) < tolerance) {
          groups.push({ sides: [i, j], markCount: 1 });
          break;
        }
      }
    }
    
    return {
      groups: groups,
      type: 'partial-equal'
    };
  }
}

export class ScaleneTriangleHandler extends BaseFigureHandler {
  getSidesToShow() { return [0, 1, 2]; }
  getRightAngles() { return []; }
  getCodings() { return { groups: [], type: 'none' }; }
}

export class CircleHandler extends BaseFigureHandler {
  constructor(centerPoint, circlePoint, figureInfo) {
    super([circlePoint], figureInfo);
    this.centerPoint = centerPoint;
    this.circlePoint = circlePoint;
  }
  
  getSidesToShow() { return []; }
  getRightAngles() { return []; }
  getCodings() { return { groups: [], type: 'radii' }; }
  getRadius() { return this.figureInfo.properties?.radius || 0; }
}

export class RegularPolygonHandler extends BaseFigureHandler {
  getSidesToShow() { return [0]; }
  getRightAngles() { return []; }
  getCodings() {
    const allSides = [...Array(this.points.length).keys()];
    return {
      groups: [{ sides: allSides, markCount: 1 }],
      type: 'all-equal'
    };
  }
}

export class DefaultFigureHandler extends BaseFigureHandler {
  getSidesToShow() { return [...Array(this.points.length).keys()]; }
  getRightAngles() { return []; }
  getCodings() { return { groups: [], type: 'none' }; }
}

// ==========================================
// FACTORY
// ==========================================

export class FigureHandlerFactory {
  static create(figureInfo, figurePoints, extraData = {}) {
    if (!figureInfo || !figureInfo.type) {
      console.warn('⚠️ Type de figure non défini, utilisation du handler par défaut');
      return new DefaultFigureHandler(figurePoints, figureInfo);
    }
    
    const { type, subtype } = figureInfo;
    
    console.log(`🏭 Création handler pour: ${type} - ${subtype}`);
    
    if (type === 'circle') {
      return new CircleHandler(extraData.centerPoint, extraData.circlePoint, figureInfo);
    }
    
    if (type === 'triangle') {
      switch (subtype) {
        case 'equilateral': return new EquilateralTriangleHandler(figurePoints, figureInfo);
        case 'right': return new RightTriangleHandler(figurePoints, figureInfo);
        case 'isosceles': return new IsoscelesTriangleHandler(figurePoints, figureInfo);
        case 'scalene':
        default: return new ScaleneTriangleHandler(figurePoints, figureInfo);
      }
    }
    
    if (type === 'quadrilateral') {
      switch (subtype) {
        case 'square': return new SquareHandler(figurePoints, figureInfo);
        case 'rectangle': return new RectangleHandler(figurePoints, figureInfo);
        case 'rhombus': return new RhombusHandler(figurePoints, figureInfo);
        case 'parallelogram': return new ParallelogramHandler(figurePoints, figureInfo);
        default: return new DefaultFigureHandler(figurePoints, figureInfo);
      }
    }
    
    if (type === 'polygon') {
      if (subtype.startsWith('regular_')) {
        return new RegularPolygonHandler(figurePoints, figureInfo);
      }
      return new DefaultFigureHandler(figurePoints, figureInfo);
    }
    
    console.warn(`⚠️ Pas de handler spécialisé pour ${type}-${subtype}`);
    return new DefaultFigureHandler(figurePoints, figureInfo);
  }
}

function getCurrentFigureHandler() {
  const figureInfo = getCurrentFigureType();
  
  if (!figureInfo || figureInfo.type === 'unknown') {
    console.warn('⚠️ Aucune figure détectée ou figure inconnue');
    return null;
  }
  
  const extraData = {
    centerPoint: centerPoint,
    circlePoint: circlePoint,
    circleObject: circleObject
  };
  
  const handler = FigureHandlerFactory.create(figureInfo, points, extraData);
  
  console.log(`✅ Handler créé: ${handler.constructor.name}`);
  
  return handler;
}

// ==========================================
// MODULE: js/drawing.js
// ==========================================
/**
 * ============================================
 * DRAWING.JS - Fonctions de dessin de figures
 * ============================================
 * 
 * Toutes les fonctions pour dessiner les différentes figures géométriques
 */

// ⚠️ Imports temporaires - seront activés quand les modules seront créés
// // Placeholders temporaires
const updateRightAngleMarkers = () => {};
const updateLengthLabels = () => {};
const updateCodings = () => {};
const updateDiagonals = () => {};
const updateEqualAngleMarkers = () => {};
const updateCircleExtras = () => {};

// ==========================================
// FONCTION DE DRAGGING
// ==========================================

/**
 * Ajoute la fonctionnalité de déplacement à un polygone
 */
function addDraggingToPolygon(polygon, figurePoints, figureTexts, handles = []) {
  let startCoords = null;

  polygon.rendNode.addEventListener('mousedown', function (e) {
    startCoords = board.getUsrCoordsOfMouse(e);

    function onMouseMove(ev) {
      const newCoords = board.getUsrCoordsOfMouse(ev);
      const dx = newCoords[0] - startCoords[0];
      const dy = newCoords[1] - startCoords[1];
      startCoords = newCoords;

      // 1. Déplacer les points principaux
      figurePoints.forEach(pt => {
        try { pt.moveTo([pt.X() + dx, pt.Y() + dy], 0); }
        catch (err) { try { pt.setPosition(JXG.COORDS_BY_USER, [pt.X() + dx, pt.Y() + dy]); } catch(e){} }
      });

      // 2. Déplacer les handles des labels de mesures
      if (lengthHandles && lengthHandles.length > 0) {
        lengthHandles.forEach(handle => {
          try { handle.moveTo([handle.X() + dx, handle.Y() + dy], 0); }
          catch (err) { try { handle.setPosition(JXG.COORDS_BY_USER, [handle.X() + dx, handle.Y() + dy]); } catch(e){} }
        });
      }

      // 3. Déplacer les handles des labels de points
      if (labelHandles && labelHandles.length > 0) {
        labelHandles.forEach(h => {
          try { h.moveTo([h.X() + dx, h.Y() + dy], 0); }
          catch (err) { try { h.setPosition(JXG.COORDS_BY_USER, [h.X() + dx, h.Y() + dy]); } catch(e){} }
        });
      }

      // 4. Déplacer les handles fournis en paramètre (legacy)
      handles.forEach(h => {
        try { h.moveTo([h.X() + dx, h.Y() + dy], 0); }
        catch (err) { try { h.setPosition(JXG.COORDS_BY_USER, [h.X() + dx, h.Y() + dy]); } catch(e){} }
      });

      // 5. Déplacer les textes
      figureTexts.forEach(txt => {
        try {
          if (typeof txt.setPosition === 'function') {
            txt.setPosition(JXG.COORDS_BY_USER, [txt.X() + dx, txt.Y() + dy]);
          }
        } catch (err) { /* ignore */ }
      });

      // 6. Mettre à jour les codages
      updateCodings();
      board.update();
    }

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      
      // Mise à jour complète après le déplacement
      setTimeout(() => {
        updateCodings();
        updateDiagonals();
        updateRightAngleMarkers(document.getElementById("toggleRightAngles")?.checked);
        updateEqualAngleMarkers(document.getElementById("toggleEqualAngles")?.checked);
        board.update();
      }, 50);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
}

// ==========================================
// CARRÉS
// ==========================================

function drawSquare(size) {
  const A = board.create('point', [0, size], {name: '', fixed: true, visible: false});
  const B = board.create('point', [size, size], {name: '', fixed: true, visible: false});
  const C = board.create('point', [size, 0], {name: '', fixed: true, visible: false});
  const D = board.create('point', [0, 0], {name: '', fixed: true, visible: false});

  const newPoints = [A, B, C, D];
  const newPolygon = board.create('polygon', newPoints, {
    withLabel: false,
    borders: {strokeColor: "black", fixed: true },
    fillColor: "white",
    fillOpacity: 1
  });

  const labelA = board.create('text', [A.X() - 0.3, A.Y() + 0.2, getLabel(0)]);
  const labelB = board.create('text', [B.X() + 0.15, B.Y() + 0.2, getLabel(1)]);
  const labelC = board.create('text', [C.X() + 0.15, C.Y() - 0.2, getLabel(2)]);
  const labelD = board.create('text', [D.X() - 0.3, D.Y() - 0.2, getLabel(3)]);
  const newTexts = [labelA, labelB, labelC, labelD];

  setPoints(newPoints);
  setPolygon(newPolygon);
  setTexts(newTexts);

  addDraggingToPolygon(newPolygon, newPoints, newTexts);
  updateRightAngleMarkers(document.getElementById("toggleRightAngles").checked);
  updateLengthLabels();
  updateCodings();
  updateDiagonals();
}

// ==========================================
// RECTANGLES
// ==========================================

function drawRectangle(width, height) {
  const A = board.create('point', [0, height], { name: '', fixed: true, visible: false });
  const B = board.create('point', [width, height], { name: '', fixed: true, visible: false });
  const C = board.create('point', [width, 0], { name: '', fixed: true, visible: false });
  const D = board.create('point', [0, 0], { name: '', fixed: true, visible: false });

  const newPoints = [A, B, C, D];
  const newPolygon = board.create('polygon', newPoints, {
    borders: {strokeColor: "black", fixed: true},
    fillColor: "white",
    fillOpacity: 1
  });

  const labelA = board.create('text', [A.X() - 0.3, A.Y() + 0.2, getLabel(0)]);
  const labelB = board.create('text', [B.X() + 0.15, B.Y() + 0.2, getLabel(1)]);
  const labelC = board.create('text', [C.X() + 0.15, C.Y() - 0.2, getLabel(2)]);
  const labelD = board.create('text', [D.X() - 0.3, D.Y() - 0.2, getLabel(3)]);
  const newTexts = [labelA, labelB, labelC, labelD];

  setPoints(newPoints);
  setPolygon(newPolygon);
  setTexts(newTexts);

  addDraggingToPolygon(newPolygon, newPoints, newTexts);
  updateCodings();
  updateDiagonals();
  updateLengthLabels();
  updateRightAngleMarkers(document.getElementById("toggleRightAngles").checked);
}

// ==========================================
// LOSANGES
// ==========================================

function drawLosange(side) {
  const theta = Math.PI / 3;
  const ox = side * Math.cos(theta);
  const oy = side * Math.sin(theta);
  const rotationAngle = Math.PI / 6;
  
  function rotate(x, y) {
    const cos = Math.cos(rotationAngle);
    const sin = Math.sin(rotationAngle);
    return [x * cos - y * sin, x * sin + y * cos];
  }

  const baseA = [-ox, oy];
  const baseB = [side - ox, oy];
  const baseC = [side, 0];
  const baseD = [0, 0];

  const [rotA_x, rotA_y] = rotate(baseA[0], baseA[1]);
  const [rotB_x, rotB_y] = rotate(baseB[0], baseB[1]);
  const [rotC_x, rotC_y] = rotate(baseC[0], baseC[1]);
  const [rotD_x, rotD_y] = rotate(baseD[0], baseD[1]);

  const A = board.create('point', [rotA_x, rotA_y], { visible: false, fixed: true });
  const B = board.create('point', [rotB_x, rotB_y], { visible: false, fixed: true });
  const C = board.create('point', [rotC_x, rotC_y], { visible: false, fixed: true });
  const D = board.create('point', [rotD_x, rotD_y], { visible: false, fixed: true });

  const newPoints = [A, B, C, D];
  const newPolygon = board.create('polygon', newPoints, {
    borders: { strokeColor: 'black', fixed: true },
    fillColor: 'white',
    fillOpacity: 1
  });

  const LA = board.create('text', [A.X() - 0.4, A.Y(), getLabel(0)]);
  const LB = board.create('text', [B.X() - 0.1, B.Y() + 0.3, getLabel(1)]);
  const LC = board.create('text', [C.X() + 0.25, C.Y(), getLabel(2)]);
  const LD = board.create('text', [D.X() - 0.1, D.Y() - 0.3, getLabel(3)]);
  const newTexts = [LA, LB, LC, LD];

  setPoints(newPoints);
  setPolygon(newPolygon);
  setTexts(newTexts);

  addDraggingToPolygon(newPolygon, newPoints, newTexts);
}

// ==========================================
// PARALLÉLOGRAMMES
// ==========================================

function drawParallelogram(base, sideLength) {
  const theta = Math.PI / 3;
  const offset = sideLength * Math.cos(theta);
  const height = sideLength * Math.sin(theta);

  const A = board.create('point', [-offset, height], { visible: false, fixed: true });
  const B = board.create('point', [base - offset, height], { visible: false, fixed: true });
  const C = board.create('point', [base, 0], { visible: false, fixed: true });
  const D = board.create('point', [0, 0], { visible: false, fixed: true });

  const newPoints = [A, B, C, D];
  const newPolygon = board.create('polygon', newPoints, {
    borders: { strokeColor: "black" },
    fillColor: "white",
    fillOpacity: 1
  });

  const labelA = board.create('text', [A.X() - 0.3, A.Y() + 0.3, getLabel(0)], {fontSize: 14});
  const labelB = board.create('text', [B.X() + 0.3, B.Y() + 0.3, getLabel(1)], {fontSize: 14});
  const labelC = board.create('text', [C.X() + 0.3, C.Y() - 0.3, getLabel(2)], {fontSize: 14});
  const labelD = board.create('text', [D.X() - 0.3, D.Y() - 0.3, getLabel(3)], {fontSize: 14});
  const newTexts = [labelA, labelB, labelC, labelD];

  setPoints(newPoints);
  setPolygon(newPolygon);
  setTexts(newTexts);

  addDraggingToPolygon(newPolygon, newPoints, newTexts);
  updateDiagonals();
  updateCodings();
  updateLengthLabels();
  updateRightAngleMarkers(document.getElementById("toggleRightAngles").checked);

  console.log(`Parallélogramme créé: Base=${base}, Côté=${sideLength}, Hauteur=${height.toFixed(2)}`);
}

// ==========================================
// TRIANGLES
// ==========================================

function drawEquilateralTriangle(side) {
  const A = board.create('point', [0, 0], {visible: false});
  const B = board.create('point', [side, 0], {visible: false});
  const height = (Math.sqrt(3) / 2) * side;
  const C = board.create('point', [side / 2, height], {visible: false});

  const newPoints = [A, B, C];
  const newPolygon = board.create('polygon', newPoints, {
    borders: {strokeColor: "black"},
    fillColor: "white",
    fillOpacity: 1
  });

  const labelA = board.create('text', [A.X(), A.Y() - 0.3, getLabel(0)]);
  const labelB = board.create('text', [B.X(), B.Y() - 0.3, getLabel(1)]);
  const labelC = board.create('text', [C.X(), C.Y() + 0.3, getLabel(2)]);
  const newTexts = [labelA, labelB, labelC];

  setPoints(newPoints);
  setPolygon(newPolygon);
  setTexts(newTexts);

  updateEqualAngleMarkers(document.getElementById("toggleEqualAngles")?.checked);
  addDraggingToPolygon(newPolygon, newPoints, newTexts);
}

function drawRightTriangle(base, height) {
  const offsetX = -base / 2;
  const offsetY = -height / 2;

  const A = board.create('point', [offsetX, offsetY], {visible: false, fixed: true});
  const B = board.create('point', [offsetX + base, offsetY], {visible: false, fixed: true});
  const C = board.create('point', [offsetX, offsetY + height], {visible:false, fixed: true});

  const newPoints = [A, B, C];
  const newPolygon = board.create('polygon', newPoints, {
    borders: {strokeColor: "black", fixed: true},
    fillColor: "white",
    fillOpacity: 1
  });

  const labelA = board.create('text', [A.X(), A.Y() - 0.3, getLabel(0)]);
  const labelB = board.create('text', [B.X(), B.Y() - 0.3, getLabel(1)]);
  const labelC = board.create('text', [C.X(), C.Y() + 0.3, getLabel(2)]);
  const newTexts = [labelA, labelB, labelC];

  setPoints(newPoints);
  setPolygon(newPolygon);
  setTexts(newTexts);

  addDraggingToPolygon(newPolygon, newPoints, newTexts);
  updateRightAngleMarkers(document.getElementById("toggleRightAngles").checked);
  console.log("→ Triangle rectangle généré avec base =", base, "et hauteur =", height);
}

function drawIsoscelesTriangle(base = 4, height = 3) {
  const A = board.create('point', [0, 0], {visible: false, fixed: true});
  const B = board.create('point', [base, 0], {visible: false, fixed: true});
  const C = board.create('point', [base / 2, height], {visible: false, fixed: true});

  const newPoints = [A, B, C];
  const newPolygon = board.create('polygon', newPoints, {
    borders: { strokeColor: 'black' },
    fillColor: 'white',
    fillOpacity: 1
  });

  const labelA = board.create('text', [A.X(), A.Y() - 0.3, getLabel(0)]);
  const labelB = board.create('text', [B.X(), B.Y() - 0.3, getLabel(1)]);
  const labelC = board.create('text', [C.X(), C.Y() + 0.3, getLabel(2)]);
  const newTexts = [labelA, labelB, labelC];

  setPoints(newPoints);
  setPolygon(newPolygon);
  setTexts(newTexts);

  addDraggingToPolygon(newPolygon, newPoints, newTexts);
  updateEqualAngleMarkers(document.getElementById("toggleEqualAngles")?.checked);
  updateRightAngleMarkers(document.getElementById("toggleRightAngles")?.checked);
  updateLengthLabels();
  updateCodings();
  updateDiagonals();
}

function drawScaleneTriangleFromSides(a, b, c) {
  // Vérification de l'inégalité triangulaire
  if (a + b <= c || a + c <= b || b + c <= a) {
    alert(`⚠️ Impossible de construire un triangle avec ces côtés !\n\n` +
          `Vérification de l'inégalité triangulaire :\n` +
          `• ${a} + ${b} = ${a + b} ${a + b > c ? '>' : '≤'} ${c}\n` +
          `• ${a} + ${c} = ${a + c} ${a + c > b ? '>' : '≤'} ${b}\n` +
          `• ${b} + ${c} = ${b + c} ${b + c > a ? '>' : '≤'} ${a}\n\n` +
          `Pour former un triangle, la somme de deux côtés doit être strictement supérieure au troisième.`);
    console.error(`❌ Triangle invalide : a=${a}, b=${b}, c=${c}`);
    return;
  }

  // Loi des cosinus
  const cosA = (a * a + c * c - b * b) / (2 * a * c);
  const angleA = Math.acos(Math.max(-1, Math.min(1, cosA)));
  
  const Cx = c * Math.cos(angleA);
  const Cy = c * Math.sin(angleA);
  
  const centerX = a / 2;
  const centerY = Cy / 2;
  
  const A = board.create('point', [-centerX, -centerY], {visible: false, fixed: true});
  const B = board.create('point', [a - centerX, -centerY], {visible: false, fixed: true});
  const C = board.create('point', [Cx - centerX, Cy - centerY], {visible: false, fixed: true});

  const newPoints = [A, B, C];
  const newPolygon = board.create('polygon', newPoints, {
    borders: {strokeColor: "black", fixed: true},
    fillColor: "white",
    fillOpacity: 1
  });

  const labelA = board.create('text', [A.X(), A.Y() - 0.3, getLabel(0)]);
  const labelB = board.create('text', [B.X(), B.Y() - 0.3, getLabel(1)]);
  const labelC = board.create('text', [C.X(), C.Y() + 0.3, getLabel(2)]);
  const newTexts = [labelA, labelB, labelC];

  setPoints(newPoints);
  setPolygon(newPolygon);
  setTexts(newTexts);

  addDraggingToPolygon(newPolygon, newPoints, newTexts);
  updateLengthLabels(document.getElementById("toggleLengths").checked);
  
  console.log(`→ Triangle quelconque généré : AB=${a}, BC=${b}, CA=${c}`);
}

// ==========================================
// POLYGONES RÉGULIERS
// ==========================================

function drawRegularPolygon(n, side) {
  const center = [0, 0];
  const angle = (2 * Math.PI) / n;
  const radius = side / (2 * Math.sin(Math.PI / n));

  const newPoints = [];
  for (let i = 0; i < n; i++) {
    const x = center[0] + radius * Math.cos(i * angle - Math.PI / 2);
    const y = center[1] + radius * Math.sin(i * angle - Math.PI / 2);
    newPoints.push(board.create('point', [x, y], {visible: false, fixed: true}));
  }

  const newPolygon = board.create('polygon', newPoints, {
    borders: {strokeColor: "black", fixed: true},
    fillColor: "white",
    fillOpacity: 1
  });

  const newTexts = [];
  for (let i = 0; i < newPoints.length; i++) {
    const pt = newPoints[i];
    const label = board.create('text', [pt.X() + 0.2, pt.Y() + 0.2, getLabel(i)]);
    newTexts.push(label);
  }

  setPoints(newPoints);
  setPolygon(newPolygon);
  setTexts(newTexts);

  addDraggingToPolygon(newPolygon, newPoints, newTexts);
}

// ==========================================
// CERCLES
// ==========================================

function drawCircle(radius) {
  // Cleanup
  if (centerPoint) try { board.removeObject(centerPoint); } catch (e) {}
  if (circlePoint) try { board.removeObject(circlePoint); } catch (e) {}
  if (circleObject) try { board.removeObject(circleObject); } catch (e) {}
  if (labelHandles && labelHandles.length) {
    labelHandles.forEach(h => { try { board.removeObject(h); } catch (e) {} });
    setLabelHandles([]);
  }
  if (labelTexts && labelTexts.length) {
    labelTexts.forEach(t => { try { board.removeObject(t); } catch (e) {} });
    setLabelTexts([]);
  }

  // Créer le centre
  const newCenterPoint = board.create('point', [0, 0], {
    name: '',
    showInfobox: false,
    fixed: false,
    size: 4,
    face: 'x',
    strokeColor: 'black',
    fillColor: 'black'
  });

  // Créer le cercle
  const newCircleObject = board.create('circle', [newCenterPoint, radius], {
    strokeWidth: 2,
    strokeColor: 'black'
  });

  // Point sur le cercle (glider)
  const newCirclePoint = board.create('glider', [radius, 0, newCircleObject], {
    name: '',
    showInfobox: false,
    size: 3,
    strokeColor: 'black',
    fillColor: 'black'
  });

  const newPoints = [newCirclePoint];
  
  // Labels personnalisés
  const customLabels = []; // TODO: récupérer depuis config
  let centerLabel = 'O';
  let pointLabel = 'A';
  
  if (customLabels && customLabels.length > 0) {
    centerLabel = customLabels[0] || 'O';
    pointLabel = customLabels[1] || 'A';
  }
  
  // Label du centre qui suit automatiquement
  const labelCenter = board.create('text', [
    () => newCenterPoint.X() - 0.1,
    () => newCenterPoint.Y() + 0.2,
    centerLabel
  ], {
    anchorX: 'middle',
    anchorY: 'bottom',
    fontSize: 16,
    fixed: true,
    name: ''
  });

  // Label du point sur cercle
  const labelPoint = board.create('text', [
    () => newCirclePoint.X() + 0.3,
    () => newCirclePoint.Y(),
    pointLabel
  ], {
    anchorX: 'middle',
    anchorY: 'bottom',
    fontSize: 16,
    fixed: true,
    name: ''
  });

  // Event pour déplacer le cercle
  newCenterPoint.on('drag', function() {
    board.update();
  });

  const newLabelTexts = [labelCenter, labelPoint];
  const newTexts = [labelCenter, labelPoint];

  setCenterPoint(newCenterPoint);
  setCirclePoint(newCirclePoint);
  setCircleObject(newCircleObject);
  setPoints(newPoints);
  setLabelTexts(newLabelTexts);
  setTexts(newTexts);

  board.update();
  updateCircleExtras();
}

// ==========================================
// UTILITAIRES TRIANGLES
// ==========================================

function isRightTriangle() {
  if (!points || points.length !== 3) return false;
  
  const tolerance = 0.1;
  
  for (let i = 0; i < 3; i++) {
    const A = points[(i - 1 + 3) % 3];
    const B = points[i];
    const C = points[(i + 1) % 3];
    
    const v1x = A.X() - B.X();
    const v1y = A.Y() - B.Y();
    const v2x = C.X() - B.X();
    const v2y = C.Y() - B.Y();
    
    const dotProduct = v1x * v2x + v1y * v2y;
    const len1 = Math.hypot(v1x, v1y);
    const len2 = Math.hypot(v2x, v2y);
    
    if (len1 > 0 && len2 > 0) {
      const cosAngle = dotProduct / (len1 * len2);
      const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle)));
      
      if (Math.abs(angle - Math.PI/2) < tolerance) {
        return { isRight: true, rightAngleIndex: i };
      }
    }
  }
  
  return { isRight: false, rightAngleIndex: -1 };
}

function getHypotenuseIndex() {
  if (!points || points.length !== 3) return -1;
  
  const sideLengths = [];
  
  for (let i = 0; i < 3; i++) {
    const pt1 = points[i];
    const pt2 = points[(i + 1) % 3];
    const length = Math.hypot(pt2.X() - pt1.X(), pt2.Y() - pt1.Y());
    sideLengths.push({ index: i, length });
  }
  
  const longestSide = sideLengths.reduce((max, side) => 
    side.length > max.length ? side : max
  );
  
  return longestSide.index;
}

// ==========================================
// MODULE: js/markers.js
// ==========================================
/**
 * ============================================
 * MARKERS.JS - Marqueurs visuels
 * ============================================
 * 
 * Gestion des marqueurs visuels (longueurs, codages, angles droits, diagonales)
 */

// ⚠️ Import temporaire - sera activé quand handlers.js sera finalisé
// Import temporaire depuis board.js
// ==========================================
// CERCLES - EXTRAS (RAYON, DIAMÈTRE)
// ==========================================

function updateCircleExtras() {
  // Vérifications de base
  if (!centerPoint || !circlePoint) {
    console.log('❌ Pas de cercle détecté');
    return;
  }

  // Récupération des options
  const showRadius = document.getElementById("toggleRadius")?.checked || false;
  const showDiameter = document.getElementById("toggleDiameter")?.checked || false;
  const showCodings = document.getElementById("toggleCodings")?.checked || false;
  const showLengths = document.getElementById("toggleLengths")?.checked || false;
  const showUnits = document.getElementById("showUnitsCheckbox")?.checked || false;
  const unit = document.getElementById("unitSelector")?.value || "cm";

  // ✅ SECTION 1 : NETTOYAGE (y compris les codages existants)
  if (radiusSegment) {
    try { board.removeObject(radiusSegment); } catch (e) {}
    setRadiusSegment(null);
  }
  if (radiusLabel) {
    try { board.removeObject(radiusLabel); } catch (e) {}
    setRadiusLabel(null);
  }
  if (diameterSegment) {
    try { board.removeObject(diameterSegment); } catch (e) {}
    setDiameterSegment(null);
  }
  diameterPoints.forEach(pt => { 
    try { board.removeObject(pt); } catch (e) {} 
  });
  setDiameterPoints([]);

  // ✅ NOUVEAU : Nettoyer les codages existants à chaque fois
  codingMarks.forEach(mark => { 
    try { board.removeObject(mark); } catch (e) {} 
  });
  setCodingMarks([]);

  const dx = circlePoint.X() - centerPoint.X();
  const dy = circlePoint.Y() - centerPoint.Y();
  const r = Math.sqrt(dx * dx + dy * dy);

  // ✅ SECTION 2 : CRÉER LES ÉLÉMENTS GÉOMÉTRIQUES D'ABORD
  
  // AFFICHAGE DU RAYON
  if (showRadius) {
    circlePoint.setAttribute({
      fixed: false,
      size: 3,
      strokeOpacity: 1,
      fillOpacity: 1,
      strokeColor: 'black',
      fillColor: 'black'
    });

    const newRadiusSegment = board.create('segment', [centerPoint, circlePoint], {
      strokeColor: 'black',
      strokeWidth: 2,
      fixed: true
    });
    setRadiusSegment(newRadiusSegment);

    if (showLengths) {
      const startX = (centerPoint.X() + circlePoint.X()) / 2 + 0.3;
      const startY = (centerPoint.Y() + circlePoint.Y()) / 2 + 0.3;

      const radiusHandle = board.create('point', [startX, startY], {
        size: 6,
        strokeOpacity: 0,
        fillOpacity: 0,
        fixed: false,
        highlight: false,
        showInfobox: false
      });

      const newRadiusLabel = board.create('text', [
        () => radiusHandle.X(),
        () => radiusHandle.Y(),
        () => {
          const currentRadius = Math.sqrt(
            Math.pow(circlePoint.X() - centerPoint.X(), 2) + 
            Math.pow(circlePoint.Y() - centerPoint.Y(), 2)
          );
          const rounded = Math.round(currentRadius * 10) / 10;
          const value = Number.isInteger(rounded) ? `${rounded}` : `${rounded}`.replace('.', ',');
          return showUnits ? `${value}\u00A0${unit}` : `${value}`;
        }
      ], {
        anchorX: 'middle',
        anchorY: 'middle',
        fontSize: 14,
        fixed: false
      });

      lengthHandles.push(radiusHandle);
      lengthLabels.push(newRadiusLabel);
      
      setRadiusLabel(newRadiusLabel);
    }
  } else {
    circlePoint.setAttribute({
      size: 0,
      strokeOpacity: 0,
      fillOpacity: 0
    });
  }

  // AFFICHAGE DU DIAMÈTRE
  if (showDiameter) {
    const angleA = Math.atan2(dy, dx);
    const angleB = angleA + Math.PI / 3;

    const B = board.create('point', [
      () => centerPoint.X() + r * Math.cos(angleB),
      () => centerPoint.Y() + r * Math.sin(angleB)
    ], {
      name: 'B',
      showInfobox: false,
      fixed: true,
      size: 3,
      strokeColor: 'black',
      fillColor: 'black'
    });

    const C = board.create('point', [
      () => centerPoint.X() - r * Math.cos(angleB),
      () => centerPoint.Y() - r * Math.sin(angleB)
    ], {
      name: 'C',
      showInfobox: false,
      fixed: true,
      size: 3,
      strokeColor: 'black',
      fillColor: 'black'
    });

    setDiameterPoints([B, C]);

    const newDiameterSegment = board.create('segment', [B, C], {
      strokeColor: 'black',
      strokeWidth: 2,
      fixed: true
    });
    
    setDiameterSegment(newDiameterSegment);
  }

  // ✅ SECTION 3 : CRÉER LES CODAGES APRÈS QUE TOUS LES POINTS EXISTENT
  if (showCodings) {
    console.log('🔧 Création des codages après création des éléments...');
    
    // Codage sur le rayon [OA] (si rayon affiché)
    if (showRadius && centerPoint && circlePoint) {
      createSimpleCodingMark(centerPoint, circlePoint, 1);
      console.log('✅ Codage créé sur rayon OA');
    }
    
    // Codages sur les rayons [OB] et [OC] (si diamètre affiché)
    if (showDiameter && diameterPoints.length >= 2) {
      createSimpleCodingMark(centerPoint, diameterPoints[0], 1);
      createSimpleCodingMark(centerPoint, diameterPoints[1], 1);
      console.log('✅ Codages créés sur rayons OB et OC');
    }
  }

  // ✅ SECTION 4 : MISE À JOUR FINALE
  board.update();
  console.log(`✅ updateCircleExtras terminé - Codages: ${showCodings}, Rayon: ${showRadius}, Diamètre: ${showDiameter}`);
}

// ==========================================
// DIAGONALES
// ==========================================

function updateDiagonals() {
  // Supprimer les anciennes diagonales ET le label d'intersection
  diagonals.forEach(d => board.removeObject(d));
  setDiagonals([]);
  
  if (intersectionLabel) {
    try { board.removeObject(intersectionLabel); } catch (e) {}
    setIntersectionLabel(null);
  }
  if (intersectionPoint) {
    try { board.removeObject(intersectionPoint); } catch (e) {}
    setIntersectionPoint(null);
  }

  // Vérifier si on doit afficher les diagonales
  const show = document.getElementById('toggleDiagonals')?.checked;
  const intersectionGroup = document.getElementById('intersectionGroup');
  
  if (!show || !points || points.length !== 4) {
    // Masquer l'option d'intersection si pas de diagonales
    if (intersectionGroup) intersectionGroup.style.display = 'none';
    return;
  }

  // ✅ AFFICHER l'option d'intersection quand les diagonales sont cochées
  if (intersectionGroup) intersectionGroup.style.display = 'block';

  console.log('Création diagonales pour quadrilatère avec', points.length, 'points');

  // QUADRILATÈRE : 2 diagonales uniquement
  const diag1 = board.create('segment', [points[0], points[2]], {
    strokeColor: 'black',
    strokeWidth: 1,
    dash: 0,
    fixed: true,
    withLabel: false
  });
  
  const diag2 = board.create('segment', [points[1], points[3]], {
    strokeColor: 'black', 
    strokeWidth: 1,
    dash: 0,
    fixed: true,
    withLabel: false
  });

  const newDiagonals = [diag1, diag2];
  setDiagonals(newDiagonals);
  console.log('✅ 2 diagonales créées');
  
  // ✅ CRÉER LE LABEL D'INTERSECTION (si demandé)
  const showIntersectionLabel = document.getElementById('toggleIntersectionLabel')?.checked;
  if (showIntersectionLabel) {
    createIntersectionLabel();
  }
  
  board.update();
}

// ✅ FONCTION : Créer le label d'intersection
function createIntersectionLabel() {
  if (!points || points.length !== 4) return;
  
  // Récupérer le texte personnalisé (défaut : "I")
  const intersectionTextInput = document.getElementById('intersectionTextInput');
  const labelText = intersectionTextInput?.value.trim() || 'I';
  
  // ✅ CALCULER L'INTERSECTION DES DIAGONALES
  const intersection = calculateDiagonalsIntersection();
  if (!intersection) {
    console.warn('⚠️ Impossible de calculer l\'intersection des diagonales');
    return;
  }
  
  // ✅ NOUVEAU : Créer un handle invisible déplaçable pour positionner le label
  const intersectionHandle = board.create('point', [
    intersection.x + 0.2, // Position initiale avec décalage
    intersection.y + 0.2
  ], {
    size: 6,
    strokeOpacity: 0,
    fillOpacity: 0,
    fixed: false,
    name: '',
    highlight: false,
    showInfobox: false
  });
  
  // Point de calcul de l'intersection (invisible)
  const newIntersectionPoint = board.create('point', [intersection.x, intersection.y], {
    visible: false,
    fixed: true,
    name: ''
  });
  setIntersectionPoint(newIntersectionPoint);

  // Label qui suit le handle déplaçable
  const newIntersectionLabel = board.create('text', [
    () => intersectionHandle.X(),
    () => intersectionHandle.Y(),
    labelText
  ], {
    anchorX: 'middle',
    anchorY: 'middle',
    fontSize: 14,
    strokeColor: 'black',
    fixed: false,
    highlight: false,
    name: ''
  });
  
  setIntersectionLabel(newIntersectionLabel);
  
  // Rendre le label déplaçable
  try {
    if (intersectionHandle.rendNode) {
      intersectionHandle.rendNode.style.cursor = 'move';
    }
    
    if (newIntersectionLabel.rendNode) {
      newIntersectionLabel.rendNode.style.cursor = 'move';
      
      newIntersectionLabel.rendNode.addEventListener('pointerdown', function (ev) {
        ev.stopPropagation();
        ev.preventDefault();
        
        const start = board.getUsrCoordsOfMouse(ev);
        
        function onMove(e) {
          const pos = board.getUsrCoordsOfMouse(e);
          const dx = pos[0] - start[0];
          const dy = pos[1] - start[1];
          
          try {
            intersectionHandle.moveTo([intersectionHandle.X() + dx, intersectionHandle.Y() + dy], 0);
          } catch (err) {
            try {
              intersectionHandle.setPosition(JXG.COORDS_BY_USER, [intersectionHandle.X() + dx, intersectionHandle.Y() + dy]);
            } catch (e) {}
          }
          
          start[0] = pos[0];
          start[1] = pos[1];
          board.update();
        }
        
        function onUp() {
          document.removeEventListener('pointermove', onMove);
          document.removeEventListener('pointerup', onUp);
        }
        
        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp);
      }, { passive: false });
    }
  } catch (e) {
    console.warn('⚠️ Impossible de configurer le drag and drop pour le label d\'intersection:', e);
  }
  
  lengthHandles.push(intersectionHandle);
  
  console.log(`✅ Label d'intersection déplaçable créé: "${labelText}" à (${intersection.x.toFixed(2)}, ${intersection.y.toFixed(2)})`);
}

// ✅ FONCTION POUR CALCULER L'INTERSECTION DES DIAGONALES
function calculateDiagonalsIntersection() {
  if (!points || points.length !== 4) return null;
  
  const A = points[0];
  const C = points[2];
  const B = points[1];
  const D = points[3];
  
  const x1 = A.X(), y1 = A.Y();
  const x2 = C.X(), y2 = C.Y();
  const x3 = B.X(), y3 = B.Y();
  const x4 = D.X(), y4 = D.Y();
  
  const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  
  if (Math.abs(denominator) < 1e-10) {
    console.warn('⚠️ Les diagonales sont parallèles (pas d\'intersection)');
    return null;
  }
  
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
  
  const intersectionX = x1 + t * (x2 - x1);
  const intersectionY = y1 + t * (y2 - y1);
  
  return {
    x: intersectionX,
    y: intersectionY
  };
}

// ==========================================
// CODAGES (CÔTÉS ÉGAUX)
// ==========================================

function updateCodings() {
  // Supprimer les codages existants
  codingMarks.forEach(m => board.removeObject(m));
  setCodingMarks([]);

  if (!document.getElementById("toggleCodings")?.checked || !points || points.length < 3) {
    return;
  }

  const n = points.length;

  if (n === 3) {
    // TRIANGLE
    const tolerance = 0.1;
    const sideLengths = [];
    
    for (let i = 0; i < 3; i++) {
      const pt1 = points[i];
      const pt2 = points[(i + 1) % 3];
      const length = Math.hypot(pt2.X() - pt1.X(), pt2.Y() - pt1.Y());
      sideLengths.push(length);
    }
    
    // Triangle équilatéral
    if (sideLengths.every(len => Math.abs(len - sideLengths[0]) < tolerance)) {
      for (let i = 0; i < 3; i++) {
        createSimpleCodingMark(points[i], points[(i + 1) % 3], 1);
      }
    }
    // Triangle isocèle
    else {
      for (let i = 0; i < 3; i++) {
        for (let j = i + 1; j < 3; j++) {
          if (Math.abs(sideLengths[i] - sideLengths[j]) < tolerance) {
            createSimpleCodingMark(points[i], points[(i + 1) % 3], 1);
            createSimpleCodingMark(points[j], points[(j + 1) % 3], 1);
            return;
          }
        }
      }
    }
    
  } else if (n === 4) {
    // QUADRILATÈRE
    const figureType = getCurrentFigureType();
    
    if (figureType.subtype === 'square') {
      for (let i = 0; i < 4; i++) {
        createSimpleCodingMark(points[i], points[(i + 1) % 4], 1);
      }
    } 
    else if (figureType.subtype === 'rectangle') {
      createSimpleCodingMark(points[0], points[1], 1);
      createSimpleCodingMark(points[2], points[3], 1);
      createSimpleCodingMark(points[1], points[2], 2);
      createSimpleCodingMark(points[3], points[0], 2);
    }
    else if (figureType.subtype === 'rhombus') {
      for (let i = 0; i < 4; i++) {
        createSimpleCodingMark(points[i], points[(i + 1) % 4], 1);
      }
    }
    else if (figureType.subtype === 'parallelogram') {
      createSimpleCodingMark(points[0], points[1], 1);
      createSimpleCodingMark(points[2], points[3], 1);
      createSimpleCodingMark(points[1], points[2], 2);
      createSimpleCodingMark(points[3], points[0], 2);
    }
  }
  else if (n >= 5) {
    // POLYGONES RÉGULIERS
    const tolerance = 0.15;
    const sideLengths = [];
    
    for (let i = 0; i < n; i++) {
      const pt1 = points[i];
      const pt2 = points[(i + 1) % n];
      const length = Math.hypot(pt2.X() - pt1.X(), pt2.Y() - pt1.Y());
      sideLengths.push(length);
    }
    
    const isRegular = sideLengths.every(len => Math.abs(len - sideLengths[0]) < tolerance);
    
    if (isRegular) {
      console.log(`✅ Polygone régulier détecté (${n} côtés) - tous les côtés égaux`);
      for (let i = 0; i < n; i++) {
        createSimpleCodingMark(points[i], points[(i + 1) % n], 1);
      }
    } else {
      console.log(`ℹ️ Polygone irrégulier (${n} côtés) - pas de codage`);
    }
  }

  board.update();
}

function createSimpleCodingMark(pt1, pt2, markCount = 1) {
  const dx = pt2.X() - pt1.X();
  const dy = pt2.Y() - pt1.Y();
  const len = Math.hypot(dx, dy);
  
  if (len === 0) return;

  const mx = (pt1.X() + pt2.X()) / 2;
  const my = (pt1.Y() + pt2.Y()) / 2;

  const segmentAngle = Math.atan2(dy, dx);
  const isHorizontal = Math.abs(Math.sin(segmentAngle)) < 0.2;
  const isVertical = Math.abs(Math.cos(segmentAngle)) < 0.2;
  
  let finalX, finalY;

  if (isHorizontal || isVertical) {
    const perpX = -dy / len;
    const perpY = dx / len;
    
    const angle30 = Math.PI / 6;
    const cos30 = Math.cos(angle30);
    const sin30 = Math.sin(angle30);
    
    finalX = perpX * cos30 - perpY * sin30;
    finalY = perpX * sin30 + perpY * cos30;
    
  } else {
    finalX = -dy / len;
    finalY = dx / len;
  }

  const markLength = 0.15;
  const spacing = 0.12;

  for (let i = 0; i < markCount; i++) {
    const offset = (i - (markCount - 1) / 2) * spacing;
    const centerX = mx + (dx / len) * offset;
    const centerY = my + (dy / len) * offset;

    const mark = board.create('segment', [
      [centerX - finalX * markLength, centerY - finalY * markLength],
      [centerX + finalX * markLength, centerY + finalY * markLength]
    ], {
      strokeColor: 'black',
      strokeWidth: 1.5,
      fixed: true,
      highlight: false
    });

    codingMarks.push(mark);
  }
  
  console.log(`✅ Codage créé : ${isHorizontal || isVertical ? 'perpendiculaire+30°' : 'strictement perpendiculaire'}`);
}

// ==========================================
// ANGLES DROITS
// ==========================================

function updateRightAngleMarkers(visible) {
  if (typeof visible === 'object' && visible !== null && 'target' in visible) {
    visible = !!visible.target.checked;
  } else {
    visible = !!visible;
  }

  rightAngleMarkers.forEach(m => { 
    try { board.removeObject(m); } catch (e) {} 
  });
  setRightAngleMarkers([]);

  const singleAngleGroup = document.getElementById('singleAngleGroup');
  const singleAngleCheckbox = document.getElementById('toggleSingleAngle');

  if (!visible || !points || points.length < 3) {
    if (singleAngleGroup) singleAngleGroup.style.display = 'none';
    if (singleAngleCheckbox) singleAngleCheckbox.checked = false;
    board.update(); 
    return; 
  }

  const handler = getCurrentFigureHandler();
  
  if (!handler) {
    console.warn('⚠️ Pas de handler trouvé pour les angles droits');
    if (singleAngleGroup) singleAngleGroup.style.display = 'none';
    board.update();
    return;
  }
  
  const rightAngles = handler.getRightAngles();
  console.log(`🎯 Handler ${handler.constructor.name} → angles droits: [${rightAngles.join(', ')}]`);
  
  const supportsSingleAngle = handler.shouldShowSingleRightAngle();
  
  if (rightAngles.length > 0 && supportsSingleAngle) {
    if (singleAngleGroup) singleAngleGroup.style.display = 'block';
  } else {
    if (singleAngleGroup) singleAngleGroup.style.display = 'none';
    if (singleAngleCheckbox) singleAngleCheckbox.checked = false;
  }
  
  const showSingleAngle = singleAngleCheckbox && singleAngleCheckbox.checked;
  
  if (rightAngles.length > 0) {
    createRightAngleMarkersFromHandler(rightAngles, showSingleAngle, points.length);
  }
  
  board.update();
}

function createRightAngleMarkersFromHandler(angleIndices, singleAngle, figureSize) {
  const size = 0.3;
  
  if (singleAngle && angleIndices.length > 1) {
    createSingleRightAngleMarker(angleIndices[0], size, figureSize);
    console.log(`📐 Un seul angle droit affiché: index ${angleIndices[0]}`);
  } else {
    angleIndices.forEach(angleIndex => {
      createSingleRightAngleMarker(angleIndex, size, figureSize);
    });
    console.log(`📐 ${angleIndices.length} angles droits affichés`);
  }
}

function createSingleRightAngleMarker(angleIndex, size, figureSize = 4) {
  if (!points || angleIndex < 0 || angleIndex >= points.length) {
    console.warn(`⚠️ Index d'angle invalide: ${angleIndex}`);
    return;
  }
  
  const vertex = points[angleIndex];
  const prevPoint = points[(angleIndex - 1 + figureSize) % figureSize];
  const nextPoint = points[(angleIndex + 1) % figureSize];
  
  if (!vertex || !prevPoint || !nextPoint) {
    console.warn(`⚠️ Points manquants pour l'angle ${angleIndex}`);
    return;
  }
  
  const v1x = prevPoint.X() - vertex.X();
  const v1y = prevPoint.Y() - vertex.Y();
  const v2x = nextPoint.X() - vertex.X();
  const v2y = nextPoint.Y() - vertex.Y();
  
  const len1 = Math.hypot(v1x, v1y);
  const len2 = Math.hypot(v2x, v2y);
  
  if (len1 === 0 || len2 === 0) {
    console.warn(`⚠️ Vecteurs de longueur nulle pour l'angle ${angleIndex}`);
    return;
  }
  
  const u1x = v1x / len1;
  const u1y = v1y / len1;
  const u2x = v2x / len2;
  const u2y = v2y / len2;
  
  const cornerSize = Math.min(size, Math.min(len1, len2) * 0.3);
  
  const p1x = vertex.X() + u1x * cornerSize;
  const p1y = vertex.Y() + u1y * cornerSize;
  
  const p2x = vertex.X() + u2x * cornerSize;
  const p2y = vertex.Y() + u2y * cornerSize;
  
  const p3x = p1x + u2x * cornerSize;
  const p3y = p1y + u2y * cornerSize;
  
  const seg1 = board.create('segment', [
    [p1x, p1y], [p3x, p3y]
  ], {
    strokeColor: 'black',
    strokeWidth: 1.5,
    fixed: true,
    highlight: false
  });
  
  const seg2 = board.create('segment', [
    [p3x, p3y], [p2x, p2y]
  ], {
    strokeColor: 'black',
    strokeWidth: 1.5,
    fixed: true,
    highlight: false
  });
  
  rightAngleMarkers.push(seg1, seg2);
  
  console.log(`✅ Angle droit créé au sommet ${angleIndex} (${getLabel(angleIndex)})`);
}

// ==========================================
// ANGLES ÉGAUX
// ==========================================

function updateEqualAngleMarkers(visible) {
  if (typeof visible === 'object' && visible !== null && 'target' in visible) visible = !!visible.target.checked;
  else visible = !!visible;

  angleMarkers.forEach(m => { try { board.removeObject(m); } catch (e) {} });
  setAngleMarkers([]);

  if (!visible || !points || points.length < 3) { 
    board.update(); 
    return; 
  }

  const fig = getCurrentFigureType();
  if (fig.subtype === 'square' || fig.subtype === 'rectangle') { 
    board.update(); 
    return; 
  }

  function pointInPolygon(x, y, polyPts) {
    let inside = false;
    for (let i = 0, j = polyPts.length - 1; i < polyPts.length; j = i++) {
      const xi = polyPts[i][0], yi = polyPts[i][1];
      const xj = polyPts[j][0], yj = polyPts[j][1];
      const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  const polyCoords = points.map(p => [p.X(), p.Y()]);
  const n = points.length;
  const angles = new Array(n).fill(null);

  for (let i = 0; i < n; i++) {
    const A = points[(i - 1 + n) % n], B = points[i], C = points[(i + 1) % n];
    if (!A || !B || !C) continue;
    const v1x = A.X() - B.X(), v1y = A.Y() - B.Y();
    const v2x = C.X() - B.X(), v2y = C.Y() - B.Y();
    const l1 = Math.hypot(v1x, v1y), l2 = Math.hypot(v2x, v2y);
    if (l1 === 0 || l2 === 0) continue;
    let cosv = (v1x * v2x + v1y * v2y) / (l1 * l2);
    cosv = Math.max(-1, Math.min(1, cosv));
    angles[i] = Math.acos(cosv);
  }

  let isParallelogram = false;
  if (n === 4 && angles.every(a => a != null)) {
    const tol = 0.03;
    if (Math.abs(angles[0] - angles[2]) < tol && Math.abs(angles[1] - angles[3]) < tol) isParallelogram = true;
  }

  let isIsosceles = false;
  let isoEqualIndices = [];
  if (n === 3) {
    const d01 = points[0].Dist(points[1]);
    const d12 = points[1].Dist(points[2]);
    const d20 = points[2].Dist(points[0]);
    const tol = Math.max(1e-6, 1e-3 * Math.max(d01, d12, d20));
    if (Math.abs(d01 - d12) < tol) { isIsosceles = true; isoEqualIndices = [2, 0]; }
    else if (Math.abs(d12 - d20) < tol) { isIsosceles = true; isoEqualIndices = [0, 1]; }
    else if (Math.abs(d20 - d01) < tol) { isIsosceles = true; isoEqualIndices = [1, 2]; }
  }

  const groups = {};
  for (let i = 0; i < n; i++) {
    const a = angles[i];
    if (a == null) continue;
    const key = (Math.round(a * 100) / 100).toFixed(2);
    (groups[key] = groups[key] || []).push(i);
  }

  const baseRadius = 0.42;
  let angleCodeMarks = [];

  function createPerpTick(B, angleOnArc, radius, tickLen, lateralOffset = 0) {
    const seg = board.create('segment', [
      () => {
        const Bx = B.X(), By = B.Y();
        const cx = Bx + Math.cos(angleOnArc) * radius - Math.sin(angleOnArc) * lateralOffset;
        const cy = By + Math.sin(angleOnArc) * radius + Math.cos(angleOnArc) * lateralOffset;
        const rx = Math.cos(angleOnArc), ry = Math.sin(angleOnArc);
        return [cx - rx * (tickLen / 2), cy - ry * (tickLen / 2)];
      },
      () => {
        const Bx = B.X(), By = B.Y();
        const cx = Bx + Math.cos(angleOnArc) * radius - Math.sin(angleOnArc) * lateralOffset;
        const cy = By + Math.sin(angleOnArc) * radius + Math.cos(angleOnArc) * lateralOffset;
        const rx = Math.cos(angleOnArc), ry = Math.sin(angleOnArc);
        return [cx + rx * (tickLen / 2), cy + ry * (tickLen / 2)];
      }
    ], {
      strokeColor: 'black',
      strokeWidth: 1.6,
      fixed: true,
      highlight: false
    });
    angleCodeMarks.push(seg);
  }

  function normAng(a) { while (a <= -Math.PI) a += 2*Math.PI; while (a > Math.PI) a -= 2*Math.PI; return a; }

  for (const key in groups) {
    const indices = groups[key];
    if (indices.length < 2) continue;

    for (const idx of indices) {
      const B = points[idx];
      const A = points[(idx - 1 + n) % n], C = points[(idx + 1) % n];
      if (!A || !B || !C) continue;

      const v1x = A.X() - B.X(), v1y = A.Y() - B.Y();
      const v2x = C.X() - B.X(), v2y = C.Y() - B.Y();
      const l1 = Math.hypot(v1x, v1y), l2 = Math.hypot(v2x, v2y);
      if (l1 === 0 || l2 === 0) continue;
      const u1x = v1x / l1, u1y = v1y / l1; 
      const u2x = v2x / l2, u2y = v2y / l2;

      let a1 = Math.atan2(u1y, u1x);
      let a2 = Math.atan2(u2y, u2x);
      let delta = normAng(a2 - a1);

      const radius = Math.min(baseRadius, Math.min(l1, l2) * 0.22);

      const midSmall = a1 + delta / 2;
      const testX = B.X() + Math.cos(midSmall) * radius * 0.9;
      const testY = B.Y() + Math.sin(midSmall) * radius * 0.9;
      const smallInside = pointInPolygon(testX, testY, polyCoords);
      if (!smallInside) {
        if (delta > 0) delta = delta - 2 * Math.PI;
        else delta = delta + 2 * Math.PI;
      }

      const aStart = a1;
      const aDelta = delta;
      
      const curve = board.create('curve', [
        function(t) { return B.X() + Math.cos(aStart + t * aDelta) * radius; },
        function(t) { return B.Y() + Math.sin(aStart + t * aDelta) * radius; },
        0, 1
      ], {
        strokeColor: 'black',
        strokeWidth: 1.4,
        fixed: true,
        highlight: false,
        dash: 0,
        name: ''
      });
      angleMarkers.push(curve);

      const bisect = normAng(aStart + aDelta / 2);
      if (isIsosceles && isoEqualIndices.includes(idx)) {
        const tickLen = Math.min(0.24, radius * 1.0);
        createPerpTick(B, bisect, radius, tickLen, 0);
      } else if (isParallelogram) {
        const count = (idx % 2 === 0) ? 1 : 2;
        const tickLen = Math.min(0.28, radius * 1.1);
        const lateralSpacing = Math.min(0.12, radius * 0.6);
        if (count === 1) {
          createPerpTick(B, bisect, radius, tickLen, 0);
        } else {
          createPerpTick(B, bisect, radius, tickLen, -lateralSpacing / 2);
          createPerpTick(B, bisect, radius, tickLen, +lateralSpacing / 2);
        }
      } else {
        const tickLen = Math.min(0.24, radius * 1.0);
        createPerpTick(B, normAng(a1 + delta / 2), radius, tickLen, 0);
      }
    }
  }

  angleMarkers.push(...angleCodeMarks);
  board.update();
}

// ==========================================
// LABELS DE LONGUEURS
// ==========================================

function updateLengthLabels() {
  // Sauvegarder les positions des handles déplacés manuellement
  const savedPositions = [];
  for (let i = 0; i < (points ? points.length : 0); i++) {
    savedPositions[i] = null;
  }

  lengthHandleMeta.forEach(meta => {
    if (meta && meta.handle && !meta.handle._auto && meta.sideIndex !== undefined) {
      savedPositions[meta.sideIndex] = { 
        x: meta.handle.X(), 
        y: meta.handle.Y() 
      };
    }
  });

  lengthLabels.forEach(label => { try { board.removeObject(label); } catch (e) {} });
  lengthHandles.forEach(handle => { try { board.removeObject(handle); } catch (e) {} });
  
  setLengthLabels([]);
  setLengthHandles([]);
  setLengthHandleMeta([]);

  const showLengths = document.getElementById("toggleLengths")?.checked;
  if (!showLengths || !points || points.length === 0) {
    console.log('❌ Mesures désactivées ou pas de points');
    return;
  }

  console.log(`🔍 Affichage des mesures pour ${points.length} points`);

  const showUnits = document.getElementById("showUnitsCheckbox")?.checked;
  const unit = document.getElementById("unitSelector")?.value || 'cm';
  
  // Triangle helper (importé depuis drawing.js)
  function isRightTriangle() {
    if (!points || points.length !== 3) return false;
    
    const tolerance = 0.1;
    
    for (let i = 0; i < 3; i++) {
      const A = points[(i - 1 + 3) % 3];
      const B = points[i];
      const C = points[(i + 1) % 3];
      
      const v1x = A.X() - B.X();
      const v1y = A.Y() - B.Y();
      const v2x = C.X() - B.X();
      const v2y = C.Y() - B.Y();
      
      const dotProduct = v1x * v2x + v1y * v2y;
      const len1 = Math.hypot(v1x, v1y);
      const len2 = Math.hypot(v2x, v2y);
      
      if (len1 > 0 && len2 > 0) {
        const cosAngle = dotProduct / (len1 * len2);
        const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle)));
        
        if (Math.abs(angle - Math.PI/2) < tolerance) {
          return { isRight: true, rightAngleIndex: i };
        }
      }
    }
    
    return { isRight: false, rightAngleIndex: -1 };
  }
  
  const rightTriangleInfo = isRightTriangle();
  const hypotenuseGroup = document.getElementById('hypotenuseGroup');
  const hideHypotenuseCheckbox = document.getElementById('toggleHideHypotenuse');
  
  if (rightTriangleInfo && rightTriangleInfo.isRight && points.length === 3) {
    if (hypotenuseGroup) hypotenuseGroup.style.display = 'block';
  } else {
    if (hypotenuseGroup) hypotenuseGroup.style.display = 'none';
    if (hideHypotenuseCheckbox) hideHypotenuseCheckbox.checked = false;
  }
  
  const hideHypotenuse = hideHypotenuseCheckbox && hideHypotenuseCheckbox.checked;

  function getSidesToShow() {
    const handler = getCurrentFigureHandler();
    
    if (!handler) {
      console.warn('⚠️ Pas de handler trouvé, affichage de tous les côtés');
      return [...Array(points.length).keys()];
    }
    
    let sidesToShow = handler.getSidesToShow();
    
    if (hideHypotenuse && handler.shouldHideHypotenuse()) {
      const hypotenuseIndex = handler.getHypotenuseIndex();
      if (hypotenuseIndex !== -1) {
        sidesToShow = sidesToShow.filter(i => i !== hypotenuseIndex);
        console.log(`🚫 Hypoténuse (côté ${hypotenuseIndex}) cachée`);
      }
    }
    
    console.log(`🎯 Handler ${handler.constructor.name} → côtés: [${sidesToShow.join(', ')}]`);
    
    return sidesToShow;
  }

  function formatLength(len) {
    const rounded = Math.round(len * 10) / 10;
    const space = '\u00A0';
    const value = Number.isInteger(rounded) ? `${rounded}` : `${rounded}`.replace('.', ',');
    return showUnits ? `${value}${space}${unit.trim()}` : `${value}`;
  }
  
  function createLengthLabel(sideIndex) {
    const n = points.length;
    const pt1 = points[sideIndex];
    const pt2 = points[(sideIndex + 1) % n];
    
    console.log(`🏷️ Création label pour côté ${sideIndex}: ${getLabel(sideIndex)}${getLabel((sideIndex + 1) % n)}`);
    
    let startX, startY;
    
    if (savedPositions[sideIndex] && savedPositions[sideIndex] !== null) {
      startX = savedPositions[sideIndex].x;
      startY = savedPositions[sideIndex].y;
    } else {
      const dx = pt2.X() - pt1.X();
      const dy = pt2.Y() - pt1.Y();
      const len = Math.hypot(dx, dy) || 1;
      
      const midX = (pt1.X() + pt2.X()) / 2;
      const midY = (pt1.Y() + pt2.Y()) / 2;
      
      const figureType = getCurrentFigureType();
      const isQuadrilateral = figureType && figureType.type === 'quadrilateral';
      
      let offsetX, offsetY;
      
      if (isQuadrilateral) {
        const figureCenter = getFigureCenter();
        const centerX = figureCenter[0];
        const centerY = figureCenter[1];
        
        const perpX = -dy / len;
        const perpY = dx / len;
        
        const toCenterX = midX - centerX;
        const toCenterY = midY - centerY;
        
        const dotProduct = toCenterX * perpX + toCenterY * perpY;
        const direction = dotProduct > 0 ? 1 : -1;
        
        const offset = 0.5;
        offsetX = direction * perpX * offset;
        offsetY = direction * perpY * offset;
        
        console.log(`📐 Quadrilatère détecté : label ${sideIndex} placé à l'EXTÉRIEUR`);
        
      } else {
        const offset = -0.4;
        offsetX = -offset * (dy / len);
        offsetY = offset * (dx / len);
        
        if (Math.abs(dy) < 0.1) {
          offsetY += 0.2;
        }
        
        console.log(`📐 Figure non-quadrilatère : placement standard pour côté ${sideIndex}`);
      }
      
      startX = midX + offsetX;
      startY = midY + offsetY;
    }

    const handle = board.create('point', [startX, startY], {
      size: 6,
      strokeOpacity: 0,
      fillOpacity: 0,
      fixed: false,
      name: '',
      highlight: false,
      showInfobox: false
    });
    
    handle._auto = (savedPositions[sideIndex] === null);

    try { 
      if (handle.rendNode) handle.rendNode.style.cursor = 'move'; 
    } catch (e) {}

    const label = board.create('text', [
      () => handle.X(),
      () => handle.Y(),
      () => formatLength(Math.hypot(pt2.X() - pt1.X(), pt2.Y() - pt1.Y()))
    ], {
      fontSize: 14,
      fixed: false,
      anchorX: 'middle',
      anchorY: 'middle',
      highlight: false,
      name: ''
    });

    makeLabelDraggable(label, handle);

    lengthHandles.push(handle);
    lengthLabels.push(label);
    lengthHandleMeta.push({ 
      handle, 
      pt1, 
      pt2, 
      offset: 0.5,
      sideIndex 
    });
    
    console.log(`✅ Label créé pour côté ${sideIndex}`);
  }
  
  function makeLabelDraggable(label, handle) {
    try {
      if (label.rendNode) {
        label.rendNode.style.cursor = 'move';
        label.rendNode.addEventListener('pointerdown', function (ev) {
          ev.stopPropagation(); 
          ev.preventDefault();
          
          handle._auto = false;
          const start = board.getUsrCoordsOfMouse(ev);
          
          function onMove(e) {
            const pos = board.getUsrCoordsOfMouse(e);
            const dxm = pos[0] - start[0];
            const dym = pos[1] - start[1];
            
            try { 
              handle.moveTo([handle.X() + dxm, handle.Y() + dym], 0); 
            } catch (err) { 
              try { 
                handle.setPosition(JXG.COORDS_BY_USER, [handle.X() + dxm, handle.Y() + dym]); 
              } catch(e) {} 
            }
            
            start[0] = pos[0]; 
            start[1] = pos[1];
            board.update();
          }
          
          function onUp() {
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerup', onUp);
          }
          
          document.addEventListener('pointermove', onMove);
          document.addEventListener('pointerup', onUp);
        }, { passive: false });
      }
    } catch (e) {}
  }

  const sidesToShow = getSidesToShow();
  
  console.log(`🔍 Côtés à afficher: [${sidesToShow.join(', ')}]`);
  
  sidesToShow.forEach(sideIndex => {
    createLengthLabel(sideIndex);
  });

  console.log(`✅ ${lengthLabels.length} labels de longueur créés au total`);
  
  board.update();
}

// ==========================================
// MODULE: js/effects.js
// ==========================================
/**
 * ============================================
 * EFFECTS.JS - Effets visuels
 * ============================================
 * 
 * Gestion de l'effet "main levée" pour les figures géométriques
 */

// ==========================================
// TOGGLE EFFET MAIN LEVÉE
// ==========================================

function toggleHandDrawnEffect(enabled) {
  if (typeof enabled === 'object' && enabled !== null && 'target' in enabled) {
    enabled = !!enabled.target.checked;
  } else {
    enabled = !!enabled;
  }
  
  setIsHandDrawnMode(enabled);
  
  if (enabled) {
    applyHandDrawnEffect();
  } else {
    removeHandDrawnEffect();
  }
  
  board.update();
}

// ==========================================
// APPLIQUER L'EFFET
// ==========================================

function applyHandDrawnEffect() {
  if (!points || points.length === 0) return;
  
  // Nettoyer les anciens éléments main levée
  removeHandDrawnElements();
  
  // ✅ CORRECTION : Cacher TOUS les éléments de la figure originale
  
  // 1. Cacher le polygone s'il existe
  if (polygon && !originalPolygon) {
    setOriginalPolygon(polygon);
    polygon.setAttribute({ visible: false });
  }
  
  // 2. Cacher le cercle s'il existe
  if (centerPoint && circlePoint && circleObject) {
    circleObject.setAttribute({ visible: false });
    createHandDrawnCircle();
    return; // Sortir ici pour les cercles
  }
  
  // 3. ✅ NOUVEAU : Cacher tous les segments/bordures du polygone
  if (polygon && polygon.borders) {
    polygon.borders.forEach(border => {
      if (border && typeof border.setAttribute === 'function') {
        border.setAttribute({ visible: false });
      }
    });
  }
  
  // 4. ✅ NOUVEAU : Cacher tous les éléments créés individuellement
  // (pour les figures qui ne sont pas des polygones JSXGraph standard)
  board.objectsList.forEach(obj => {
    // Cacher tous les segments qui relient les points de la figure
    if (obj.type === JXG.OBJECT_TYPE_LINE || obj.type === 'segment') {
      // Vérifier si ce segment fait partie de notre figure
      const isPartOfFigure = points.some(p1 => 
        points.some(p2 => 
          p1 !== p2 && 
          obj.point1 === p1 && obj.point2 === p2
        )
      );
      
      if (isPartOfFigure) {
        obj.setAttribute({ visible: false });
      }
    }
  });
  
  // 5. Créer la version main levée
  if (points.length >= 3) {
    createHandDrawnPolygon();
  }
}

// ==========================================
// SUPPRIMER L'EFFET
// ==========================================

function removeHandDrawnEffect() {
  // Nettoyer les éléments main levée
  removeHandDrawnElements();
  
  // ✅ CORRECTION : Restaurer TOUS les éléments originaux
  
  // 1. Restaurer le polygone original
  if (originalPolygon) {
    originalPolygon.setAttribute({ visible: true });
    
    // ✅ NOUVEAU : Restaurer aussi les bordures du polygone
    if (originalPolygon.borders) {
      originalPolygon.borders.forEach(border => {
        if (border && typeof border.setAttribute === 'function') {
          border.setAttribute({ visible: true });
        }
      });
    }
    
    setPolygon(originalPolygon);
    setOriginalPolygon(null);
  }
  
  // 2. Restaurer le cercle original
  if (circleObject) {
    circleObject.setAttribute({ visible: true });
  }
  
  // 3. ✅ NOUVEAU : Restaurer tous les segments cachés
  board.objectsList.forEach(obj => {
    if (obj.type === JXG.OBJECT_TYPE_LINE || obj.type === 'segment') {
      const isPartOfFigure = points.some(p1 => 
        points.some(p2 => 
          p1 !== p2 && 
          obj.point1 === p1 && obj.point2 === p2
        )
      );
      
      if (isPartOfFigure) {
        obj.setAttribute({ visible: true });
      }
    }
  });
}

// ==========================================
// NETTOYAGE
// ==========================================

function removeHandDrawnElements() {
  handDrawnElements.forEach(element => {
    try { board.removeObject(element); } catch (e) {}
  });
  setHandDrawnElements([]);
}

// ==========================================
// CRÉATION POLYGONE MAIN LEVÉE
// ==========================================

function createHandDrawnPolygon() {
  const n = points.length;
  
  // Créer des segments main levée entre chaque paire de points
  for (let i = 0; i < n; i++) {
    const startPoint = points[i];
    const endPoint = points[(i + 1) % n];
    
    const handDrawnSegment = createHandDrawnSegment(startPoint, endPoint);
    handDrawnElements.push(handDrawnSegment);
  }
}

// ==========================================
// CRÉATION SEGMENT MAIN LEVÉE
// ==========================================

function createHandDrawnSegment(startPoint, endPoint) {
  const numPoints = 60; // Plus de points pour plus de détails
  const baseIntensity = 0.06; // ✅ Intensité de base augmentée (x3)
  
  // Calculer la longueur pour adapter l'intensité
  const segmentLength = Math.hypot(endPoint.X() - startPoint.X(), endPoint.Y() - startPoint.Y());
  const lengthFactor = Math.min(1.5, segmentLength / 2.5); // ✅ Facteur de longueur plus généreux
  
  // Générer des points de contrôle pour créer des ondulations naturelles plus marquées
  const controlPoints = [];
  for (let i = 0; i <= 10; i++) { // ✅ Plus de points de contrôle
    const t = i / 10;
    // ✅ Ondulations plus marquées avec plusieurs fréquences
    const wave1 = Math.sin(t * Math.PI * 3.2) * 0.035 * lengthFactor; // Vague principale plus forte
    const wave2 = Math.sin(t * Math.PI * 6.5) * 0.020 * lengthFactor; // Vague secondaire
    const wave3 = Math.sin(t * Math.PI * 12.8) * 0.010 * lengthFactor; // Micro-ondulations
    const noise = (Math.random() - 0.5) * 0.025 * lengthFactor; // ✅ Bruit plus fort
    controlPoints.push(wave1 + wave2 + wave3 + noise);
  }
  
  const curve = board.create('curve', [
    function(t) {
      const x1 = startPoint.X();
      const x2 = endPoint.X();
      const baseX = x1 + (x2 - x1) * t;
      
      // Interpolation des points de contrôle
      const controlIndex = t * (controlPoints.length - 1);
      const index1 = Math.floor(controlIndex);
      const index2 = Math.min(index1 + 1, controlPoints.length - 1);
      const fraction = controlIndex - index1;
      
      const controlOffset = controlPoints[index1] * (1 - fraction) + controlPoints[index2] * fraction;
      
      // Direction perpendiculaire pour l'ondulation
      const dx = x2 - x1;
      const dy = endPoint.Y() - startPoint.Y();
      const len = Math.hypot(dx, dy) || 1;
      const perpX = -dy / len;
      
      // ✅ Tremblement plus intense avec variation continue
      const edgeFactor = Math.sin(t * Math.PI); // 0 aux bords, 1 au centre
      const continuousTremor = Math.sin(t * Math.PI * 8.5) * 0.015 * edgeFactor * lengthFactor;
      const randomTremor = (Math.random() - 0.5) * baseIntensity * edgeFactor * lengthFactor;
      
      return baseX + controlOffset * perpX + continuousTremor + randomTremor * 0.3;
    },
    function(t) {
      const y1 = startPoint.Y();
      const y2 = endPoint.Y();
      const baseY = y1 + (y2 - y1) * t;
      
      // Même logique pour Y avec légère variation de phase
      const controlIndex = t * (controlPoints.length - 1);
      const index1 = Math.floor(controlIndex);
      const index2 = Math.min(index1 + 1, controlPoints.length - 1);
      const fraction = controlIndex - index1;
      
      const controlOffset = controlPoints[index1] * (1 - fraction) + controlPoints[index2] * fraction;
      
      const dx = endPoint.X() - startPoint.X();
      const dy = y2 - y1;
      const len = Math.hypot(dx, dy) || 1;
      const perpY = dx / len;
      
      const edgeFactor = Math.sin(t * Math.PI);
      const continuousTremor = Math.cos(t * Math.PI * 7.8) * 0.018 * edgeFactor * lengthFactor; // ✅ Phase légèrement différente
      const randomTremor = (Math.random() - 0.5) * baseIntensity * edgeFactor * lengthFactor;
      
      return baseY + controlOffset * perpY + continuousTremor + randomTremor * 0.3;
    },
    0, 1
  ], {
    strokeColor: '#2c2c2c', // ✅ Couleur légèrement plus foncée pour plus de contraste
    strokeWidth: 1.6, // ✅ Légèrement plus épais
    fixed: true,
    highlight: false
  });
  
  return curve;
}

// ==========================================
// CRÉATION CERCLE MAIN LEVÉE
// ==========================================

function createHandDrawnCircle() {
  if (!centerPoint || !circlePoint) return;
  
  // Cacher le cercle original
  if (circleObject) {
    circleObject.setAttribute({ visible: false });
  }
  
  const centerX = centerPoint.X();
  const centerY = centerPoint.Y();
  const radius = Math.hypot(circlePoint.X() - centerX, circlePoint.Y() - centerY);
  
  // ✅ Plus de sections pour plus de variation
  const numSections = 3; // Plus de sections
  const radiusVariations = [];
  
  for (let i = 0; i < numSections; i++) {
    // ✅ Variations plus marquées avec plusieurs harmoniques
    const angle = (i * Math.PI * 2) / numSections;
    const baseVariation1 = Math.sin(angle * 2.7) * 0.055; // Vague principale plus forte
    const baseVariation2 = Math.sin(angle * 5.3) * 0.032; // Vague secondaire
    const baseVariation3 = Math.sin(angle * 11.1) * 0.018; // Micro-variations
    const noise = (Math.random() - 0.5) * 0.040; // ✅ Bruit plus fort
    radiusVariations.push(1 + baseVariation1 + baseVariation2 + baseVariation3 + noise);
  }
  
  const handDrawnCircle = board.create('curve', [
    function(t) {
      const angle = t * 2 * Math.PI;
      
      // Interpoler les variations de rayon avec plus de fluidité
      const sectionIndex = (t * numSections) % numSections;
      const index1 = Math.floor(sectionIndex);
      const index2 = (index1 + 1) % numSections;
      const fraction = sectionIndex - index1;
      
      // ✅ Interpolation cubique pour plus de fluidité
      const t2 = fraction * fraction;
      const t3 = t2 * fraction;
      const radiusVar = radiusVariations[index1] * (1 - 3*t2 + 2*t3) + 
                       radiusVariations[index2] * (3*t2 - 2*t3);
      
      const currentRadius = radius * radiusVar;
      
      // ✅ Tremblement additionnel plus marqué
      const continuousTremor = Math.sin(angle * 13.7 + t * Math.PI * 8) * 0.025 * radius;
      const randomTremor = (Math.random() - 0.5) * 0.030 * radius;
      const angleTremor = (Math.random() - 0.5) * 0.05; // ✅ Plus de variation angulaire
      
      return centerX + (currentRadius + continuousTremor + randomTremor) * Math.cos(angle + angleTremor);
    },
    function(t) {
      const angle = t * 2 * Math.PI;
      
      // Même logique pour Y avec légère variation de phase
      const sectionIndex = (t * numSections) % numSections;
      const index1 = Math.floor(sectionIndex);
      const index2 = (index1 + 1) % numSections;
      const fraction = sectionIndex - index1;
      
      const t2 = fraction * fraction;
      const t3 = t2 * fraction;
      const radiusVar = radiusVariations[index1] * (1 - 3*t2 + 2*t3) + 
                       radiusVariations[index2] * (3*t2 - 2*t3);
      
      const currentRadius = radius * radiusVar;
      
      const continuousTremor = Math.cos(angle * 12.3 + t * Math.PI * 9) * 0.028 * radius; // ✅ Phase différente
      const randomTremor = (Math.random() - 0.5) * 0.030 * radius;
      const angleTremor = (Math.random() - 0.5) * 0.05;
      
      return centerY + (currentRadius + continuousTremor + randomTremor) * Math.sin(angle + angleTremor);
    },
    0, 1
  ], {
    strokeColor: '#2c2c2c',
    strokeWidth: 1.2,
    fixed: true,
    highlight: false
  });
  
  handDrawnElements.push(handDrawnCircle);
}

// ==========================================
// VERSION MULTI-COUCHES (ALTERNATIVE)
// ==========================================

function createHandDrawnSegmentMultiLayer(startPoint, endPoint) {
  const curves = [];
  const numLayers = 2; // Deux passes pour simuler le reppassage naturel
  
  for (let layer = 0; layer < numLayers; layer++) {
    const opacity = layer === 0 ? 1 : 0.3; // Première passe plus marquée
    const offset = layer * 0.01; // Léger décalage entre les passes
    
    const curve = board.create('curve', [
      function(t) {
        const x1 = startPoint.X();
        const x2 = endPoint.X();
        const baseX = x1 + (x2 - x1) * t;
        
        // Ondulation principale
        const wave = Math.sin(t * Math.PI * 3) * 0.02 * Math.sin(t * Math.PI);
        
        // Micro-tremblement
        const microTremor = (Math.random() - 0.5) * 0.008;
        
        return baseX + wave + microTremor + offset;
      },
      function(t) {
        const y1 = startPoint.Y();
        const y2 = endPoint.Y();
        const baseY = y1 + (y2 - y1) * t;
        
        const wave = Math.cos(t * Math.PI * 2.8) * 0.018 * Math.sin(t * Math.PI);
        const microTremor = (Math.random() - 0.5) * 0.008;
        
        return baseY + wave + microTremor + offset;
      },
      0, 1
    ], {
      strokeColor: `rgba(51, 51, 51, ${opacity})`,
      strokeWidth: layer === 0 ? 1.6 : 1.2,
      fixed: true,
      highlight: false
    });
    
    curves.push(curve);
  }
  
  return curves;
}

// ==========================================
// MODULE: js/ui.js
// ==========================================
/**
 * ============================================
 * UI.JS - Interface utilisateur et génération
 * ============================================
 * 
 * Fonction principale generateFigure() et toutes les fonctions d'interface
 */

// ==========================================
// FONCTION PRINCIPALE : GÉNÉRATION DE FIGURE
// ==========================================

function generateFigure() {
  // ==========================================
  // 1. NETTOYAGE INITIAL
  // ==========================================
  
  // Nettoyer tous les éléments existants
  if (polygon) try { board.removeObject(polygon); } catch (e) {}
  if (centerPoint) try { board.removeObject(centerPoint); } catch (e) {}
  if (circlePoint) try { board.removeObject(circlePoint); } catch (e) {}
  if (circleObject) try { board.removeObject(circleObject); } catch (e) {}

  // Nettoyer les arrays d'éléments
  points.forEach(p => { try { board.removeObject(p); } catch (e) {} });
  texts.forEach(t => { try { board.removeObject(t); } catch (e) {} });
  rightAngleMarkers.forEach(m => { try { board.removeObject(m); } catch (e) {} });
  lengthLabels.forEach(l => { try { board.removeObject(l); } catch (e) {} });
  lengthHandles.forEach(h => { try { board.removeObject(h); } catch (e) {} });
  codingMarks.forEach(m => { try { board.removeObject(m); } catch (e) {} });
  codingSegments.forEach(s => { try { board.removeObject(s); } catch (e) {} });
  diagonals.forEach(d => { try { board.removeObject(d); } catch (e) {} });
  angleMarkers.forEach(m => { try { board.removeObject(m); } catch (e) {} });
  diameterPoints.forEach(p => { try { board.removeObject(p); } catch (e) {} });
  if (diameterSegment) try { board.removeObject(diameterSegment); } catch (e) {}
  if (radiusSegment) try { board.removeObject(radiusSegment); } catch (e) {}
  if (radiusLabel) try { board.removeObject(radiusLabel); } catch (e) {}
  if (intersectionLabel) try { board.removeObject(intersectionLabel); } catch (e) {}
  if (intersectionPoint) try { board.removeObject(intersectionPoint); } catch (e) {}

  // Reset des variables globales via config.js
  resetAllGlobalVariables();

  // ==========================================
  // 2. RÉCUPÉRATION DES DONNÉES UTILISATEUR
  // ==========================================
  
  const input = document.getElementById("promptInput").value.trim().toLowerCase();
  const labelInput = document.getElementById("labelInput")?.value.trim() || '';

  if (!input) {
    alert("Veuillez entrer une description de figure.");
    return;
  }

  console.log(`🎨 Génération de figure: "${input}"`);

  // Traitement des labels personnalisés
  if (labelInput) {
    const labels = labelInput.split(/[,\s]+/).filter(label => label.length > 0);
    setCustomLabels(labels);
    console.log(`🏷️ Labels personnalisés: [${labels.join(', ')}]`);
  }

  // ==========================================
  // 3. PARSING ET GÉNÉRATION DE LA FIGURE
  // ==========================================
  
  try {
    // CARRÉS
    if (input.includes("carré")) {
      const size = extractNumber(input, 4);
      drawSquare(size);
      console.log(`✅ Carré généré (côté: ${size})`);
    }
    
    // TRIANGLES
    else if (input.includes("triangle")) {
      // Triangle quelconque avec 3 côtés (priorité absolue)
      if ((input.includes("côté") || input.includes("cote") || input.includes("longueur")) 
          && input.match(/(\d+(?:[.,]\d+)?)/g)?.length >= 3) {
        const [a, b, c] = extractThreeNumbers(input, [3, 4, 5]);
        drawScaleneTriangleFromSides(a, b, c);
        console.log(`✅ Triangle quelconque généré (côtés: ${a}, ${b}, ${c})`);
      }
      // Triangle rectangle
      else if (input.includes("rectangle") || input.includes("droit")) {
        const [base, height] = extractTwoNumbers(input, [3, 4]);
        drawRightTriangle(base, height);
        console.log(`✅ Triangle rectangle généré (base: ${base}, hauteur: ${height})`);
      }
      // Triangle équilatéral
      else if (input.includes("équilatéral") || input.includes("equilateral")) {
        const side = extractNumber(input, 4);
        drawEquilateralTriangle(side);
        console.log(`✅ Triangle équilatéral généré (côté: ${side})`);
      }
      // Triangle isocèle
      else if (input.includes("isocèle") || input.includes("isocele")) {
        const [base, height] = extractTwoNumbers(input, [6, 4]);
        drawIsoscelesTriangle(base, height);
        console.log(`✅ Triangle isocèle généré (base: ${base}, hauteur: ${height})`);
      }
      // Triangle par défaut
      else {
        const [base, height] = extractTwoNumbers(input, [4, 3]);
        drawRightTriangle(base, height);
        console.log(`✅ Triangle généré (base: ${base}, hauteur: ${height})`);
      }
    }
    
    // RECTANGLES
    else if (input.includes("rectangle")) {
      const [width, height] = extractTwoNumbers(input, [5, 3]);
      drawRectangle(width, height);
      console.log(`✅ Rectangle généré (${width} × ${height})`);
    }
    
    // LOSANGES
    else if (input.includes("losange")) {
      const side = extractNumber(input, 4);
      drawLosange(side);
      console.log(`✅ Losange généré (côté: ${side})`);
    }
    
    // PARALLÉLOGRAMMES
    else if (input.includes("parallélogramme") || input.includes("parallelogramme")) {
      const [base, side] = extractTwoNumbers(input, [5, 3]);
      drawParallelogram(base, side);
      console.log(`✅ Parallélogramme généré (base: ${base}, côté: ${side})`);
    }
    
    // CERCLES
    else if (input.includes("cercle")) {
      const radius = extractNumber(input, 2);
      drawCircle(radius);
      console.log(`✅ Cercle généré (rayon: ${radius})`);
    }
    
    // POLYGONES RÉGULIERS
    else if (input.includes("pentagone") || input.includes("pentagon")) {
      const side = extractNumber(input, 3);
      drawRegularPolygon(5, side);
      console.log(`✅ Pentagone généré (côté: ${side})`);
    }
    else if (input.includes("hexagone") || input.includes("hexagon")) {
      const side = extractNumber(input, 3);
      drawRegularPolygon(6, side);
      console.log(`✅ Hexagone généré (côté: ${side})`);
    }
    else if (input.includes("heptagone") || input.includes("heptagon")) {
      const side = extractNumber(input, 3);
      drawRegularPolygon(7, side);
      console.log(`✅ Heptagone généré (côté: ${side})`);
    }
    else if (input.includes("octogone") || input.includes("octagon")) {
      const side = extractNumber(input, 3);
      drawRegularPolygon(8, side);
      console.log(`✅ Octogone généré (côté: ${side})`);
    }
    
    // FIGURE NON RECONNUE
    else {
      // Essayer d'utiliser les suggestions disponibles
      const suggestionBox = document.getElementById('suggestionBox');
      const hasSuggestions = suggestionBox && suggestionBox.style.display === 'block';
      
      if (hasSuggestions) {
        const firstSuggestion = suggestionBox.querySelector('.suggestion-item');
        if (firstSuggestion) {
          const suggestionText = firstSuggestion.textContent;
          document.getElementById("promptInput").value = suggestionText;
          console.log(`🔄 Auto-correction: "${input}" → "${suggestionText}"`);
          
          setTimeout(() => generateFigure(), 100);
          return;
        }
      }
      
      alert(`Figure non reconnue: "${input}". Essayez: carré, rectangle, triangle, cercle, losange, parallélogramme, pentagone, hexagone.`);
      console.warn(`❌ Figure non reconnue: "${input}"`);
      return;
    }

  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error);
    alert('❌ Erreur lors de la génération de la figure');
    return;
  }

  // ==========================================
  // 4. FINALISATION AVEC SYSTÈME DE HANDLERS
  // ==========================================
  
  invalidateFigureCache('new figure generated');
  
  try { 
    centerFigure(); 
  } catch (e) { 
    console.warn('centerFigure failed', e); 
  }
  
  // Appliquer l'effet main levée si activé
  const handDrawnCheckbox = document.getElementById('toggleHandDrawn');
  if (handDrawnCheckbox && handDrawnCheckbox.checked) {
    setTimeout(() => {
      applyHandDrawnEffect();
    }, 100);
  }
  
  // Mise à jour intelligente
  setTimeout(() => {
    autoInvalidateCache();
  }, 150);
  
  board.update();
  
  console.log(`✅ Figure générée et optimisée avec le système de handlers`);
  
  // ==========================================
  // 5. FEEDBACK UTILISATEUR
  // ==========================================
  
  const suggestionBox = document.getElementById('suggestionBox');
  if (suggestionBox) {
    suggestionBox.style.display = 'none';
  }
  
  const figureType = getCurrentFigureType();
  if (figureType && figureType.type !== 'unknown') {
    console.log(`🎯 Type détecté: ${figureType.type} - ${figureType.subtype}`);
  }
}

// ==========================================
// CACHE ET OPTIMISATION
// ==========================================

function autoInvalidateCache() {
  invalidateFigureCache('figure modified');
  
  const activeOptions = getActiveDisplayOptions();
  
  if (activeOptions.lengths) updateLengthLabels();
  if (activeOptions.codings) updateCodings();
  if (activeOptions.rightAngles) updateRightAngleMarkers(true);
  if (activeOptions.equalAngles) updateEqualAngleMarkers(true);
  if (activeOptions.diagonals) updateDiagonals();
  if (activeOptions.circleExtras) updateCircleExtras();
}

function getActiveDisplayOptions() {
  return {
    lengths: document.getElementById('toggleLengths')?.checked || false,
    codings: document.getElementById('toggleCodings')?.checked || false,
    rightAngles: document.getElementById('toggleRightAngles')?.checked || false,
    equalAngles: document.getElementById('toggleEqualAngles')?.checked || false,
    diagonals: document.getElementById('toggleDiagonals')?.checked || false,
    radius: document.getElementById('toggleRadius')?.checked || false,
    diameter: document.getElementById('toggleDiameter')?.checked || false,
    circleExtras: (document.getElementById('toggleRadius')?.checked || document.getElementById('toggleDiameter')?.checked) || false
  };
}

// ==========================================
// MONITORING DES PERFORMANCES
// ==========================================

function measurePerformance(functionName, fn) {
  const startTime = performance.now();
  const result = fn();
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  if (duration > 10) {
    console.log(`⏱️ ${functionName}: ${duration.toFixed(2)}ms`);
  }
  
  return result;
}

// ==========================================
// EXPORT SVG
// ==========================================

function exportBoardToSVG() {
  try {
    if (document.getElementById('toggleDiagonals')?.checked) {
      updateDiagonals();
    }
    if (document.getElementById('toggleCodings')?.checked) {
      updateCodings();
    }
    if (document.getElementById('toggleRadius')?.checked || document.getElementById('toggleDiameter')?.checked) {
      updateCircleExtras();
    }
    if (document.getElementById('toggleEqualAngles')?.checked) {
      updateEqualAngleMarkers(true);
    }
    if (document.getElementById('toggleRightAngles')?.checked) {
      updateRightAngleMarkers(true);
    }
    
    board.update();

    const svgRoot = board.renderer.svgRoot;
    if (!svgRoot) {
      alert('❌ Impossible de générer le SVG');
      return;
    }

    const svgClone = svgRoot.cloneNode(true);
    
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgClone);
    
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'figure-geometrique.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    console.log('✅ Export SVG réussi');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'export SVG:', error);
    alert('❌ Erreur lors de l\'export SVG');
  }
}

// ==========================================
// COPIE DANS LE PRESSE-PAPIERS
// ==========================================

export async function copyBoardToClipboard() {
  try {
    if (document.getElementById('toggleDiagonals')?.checked) {
      updateDiagonals();
    }
    if (document.getElementById('toggleCodings')?.checked) {
      updateCodings();
    }
    if (document.getElementById('toggleRadius')?.checked || document.getElementById('toggleDiameter')?.checked) {
      updateCircleExtras();
    }
    if (document.getElementById('toggleEqualAngles')?.checked) {
      updateEqualAngleMarkers(true);
    }
    if (document.getElementById('toggleRightAngles')?.checked) {
      updateRightAngleMarkers(true);
    }
    
    board.update();

    const jxgBox = document.getElementById('jxgbox');
    if (!jxgBox) { 
      alert('❌ Zone graphique introuvable'); 
      return; 
    }

    if (!navigator.clipboard || !navigator.clipboard.write) {
      alert('❌ Votre navigateur ne supporte pas la copie dans le presse-papier.\nUtilisez plutôt le bouton "Exporter SVG".');
      return;
    }

    const copyBtn = document.getElementById('copyClipboardBtn');
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '⏳ Copie...';
    copyBtn.disabled = true;

    try {
      if (!window.html2canvas) {
        const script = document.createElement('script');
        script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
        document.head.appendChild(script);
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }

      await new Promise(resolve => setTimeout(resolve, 150));

      const figureBounds = calculateFigureBounds();
      console.log('📐 Limites de la figure calculées:', figureBounds);

      const realWorldScale = calculateRealWorldScale(figureBounds);
      console.log('📏 Échelle monde réel calculée:', realWorldScale);

      const fullCanvas = await html2canvas(jxgBox, {
        backgroundColor: '#ffffff',
        scale: realWorldScale.canvasScale,
        useCORS: true,
        allowTaint: true,
        ignoreElements: (element) => {
          return element.tagName === 'BUTTON' || 
                 element.classList.contains('control-btn') ||
                 element.classList.contains('jxg-button');
        }
      });

      const croppedCanvas = cropCanvasToFigureRealSize(fullCanvas, figureBounds, jxgBox, realWorldScale);

      const blob = await createPngWithDPI(croppedCanvas, realWorldScale.targetDPI);

      const clipboardItem = new ClipboardItem({
        'image/png': blob
      });

      await navigator.clipboard.write([clipboardItem]);

      const dimensions = calculateImageDimensions(figureBounds, realWorldScale);
      copyBtn.innerHTML = '✅ Copié !';
      copyBtn.style.background = 'linear-gradient(135deg, #00b894, #55efc4)';
      
      console.log('📋 Image copiée avec dimensions réelles !');
      console.log(`📏 Taille de l'image: ${dimensions.widthCm.toFixed(1)} × ${dimensions.heightCm.toFixed(1)} cm`);
      
      showCopyNotification(`Image copiée ! (${dimensions.widthCm.toFixed(1)} × ${dimensions.heightCm.toFixed(1)} cm)`);

    } catch (error) {
      console.error('❌ Erreur lors de la copie:', error);
      alert('❌ Erreur lors de la copie dans le presse-papier.');
      
      copyBtn.innerHTML = '❌ Échec';
      copyBtn.style.background = 'linear-gradient(135deg, #d63031, #e84393)';
    }

    setTimeout(() => {
      copyBtn.innerHTML = originalText;
      copyBtn.disabled = false;
      copyBtn.style.background = 'linear-gradient(135deg, #00b894, #00cec9)';
    }, 3000);

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    alert('❌ Erreur lors de la copie. Essayez de recharger la page.');
  }
}

// ==========================================
// FONCTIONS UTILITAIRES POUR COPIE
// ==========================================

function calculateRealWorldScale(figureBounds) {
  const targetDPI = 300;
  const pixelsPerCm = targetDPI / 2.54;
  
  const figureWidthUnits = figureBounds.maxX - figureBounds.minX;
  const figureHeightUnits = figureBounds.maxY - figureBounds.minY;
  
  let realWidthCm = figureWidthUnits;
  let realHeightCm = figureHeightUnits;
  
  if (points && points.length > 0) {
    const realDimensions = calculateRealFigureDimensions();
    if (realDimensions.width > 0) realWidthCm = realDimensions.width;
    if (realDimensions.height > 0) realHeightCm = realDimensions.height;
  }
  
  const requiredWidthPixels = realWidthCm * pixelsPerCm;
  const requiredHeightPixels = realHeightCm * pixelsPerCm;
  
  const currentBoardSize = board.canvasWidth || 400;
  const canvasScale = Math.max(requiredWidthPixels / currentBoardSize, 1);
  
  return {
    targetDPI,
    pixelsPerCm,
    realWidthCm,
    realHeightCm,
    canvasScale,
    requiredWidthPixels,
    requiredHeightPixels
  };
}

function calculateRealFigureDimensions() {
  if (!points || points.length === 0) {
    return { width: 0, height: 0 };
  }
  
  if (centerPoint && circlePoint && circleObject) {
    const radius = Math.hypot(circlePoint.X() - centerPoint.X(), circlePoint.Y() - centerPoint.Y());
    const diameter = radius * 2;
    return { width: diameter, height: diameter };
  }
  
  if (points.length === 4) {
    const figureType = getCurrentFigureType();
    if (figureType.subtype === 'square') {
      const sideLength = Math.hypot(points[1].X() - points[0].X(), points[1].Y() - points[0].Y());
      return { width: sideLength, height: sideLength };
    }
    
    if (figureType.subtype === 'rectangle') {
      const width = Math.hypot(points[1].X() - points[0].X(), points[1].Y() - points[0].Y());
      const height = Math.hypot(points[3].X() - points[0].X(), points[3].Y() - points[0].Y());
      return { width, height };
    }
  }
  
  if (points.length === 3) {
    const base = Math.hypot(points[1].X() - points[0].X(), points[1].Y() - points[0].Y());
    const height = Math.abs(points[2].Y() - Math.min(points[0].Y(), points[1].Y()));
    return { width: base, height };
  }
  
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  
  points.forEach(p => {
    minX = Math.min(minX, p.X());
    maxX = Math.max(maxX, p.X());
    minY = Math.min(minY, p.Y());
    maxY = Math.max(maxY, p.Y());
  });
  
  return {
    width: maxX - minX,
    height: maxY - minY
  };
}

function cropCanvasToFigureRealSize(sourceCanvas, figureBounds, jxgBox, realWorldScale) {
  const boundingBox = board.getBoundingBox();
  const boardWidth = boundingBox[2] - boundingBox[0];
  const boardHeight = boundingBox[1] - boundingBox[3];
  
  const canvasWidth = sourceCanvas.width;
  const canvasHeight = sourceCanvas.height;
  
  const scaleX = canvasWidth / boardWidth;
  const scaleY = canvasHeight / boardHeight;
  
  const pixelBounds = {
    left: Math.max(0, (figureBounds.minX - boundingBox[0]) * scaleX),
    right: Math.min(canvasWidth, (figureBounds.maxX - boundingBox[0]) * scaleX),
    top: Math.max(0, (boundingBox[1] - figureBounds.maxY) * scaleY),
    bottom: Math.min(canvasHeight, (boundingBox[1] - figureBounds.minY) * scaleY)
  };
  
  const cropWidth = Math.max(100, Math.round(pixelBounds.right - pixelBounds.left));
  const cropHeight = Math.max(100, Math.round(pixelBounds.bottom - pixelBounds.top));
  
  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = cropWidth;
  croppedCanvas.height = cropHeight;
  const ctx = croppedCanvas.getContext('2d');
  
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, cropWidth, cropHeight);
  
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  ctx.drawImage(
    sourceCanvas,
    Math.round(pixelBounds.left),
    Math.round(pixelBounds.top),
    cropWidth,
    cropHeight,
    0, 0,
    cropWidth,
    cropHeight
  );
  
  const imageData = ctx.getImageData(0, 0, cropWidth, cropHeight);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    
    const isGrayish = (
      Math.abs(r - g) < 10 && 
      Math.abs(g - b) < 10 && 
      Math.abs(r - b) < 10 && 
      r > 200 && r < 240 &&
      a > 200
    );
    
    if (isGrayish) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255;
    }
    
    const isVeryLight = r > 250 && g > 250 && b > 250;
    if (isVeryLight) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255;
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
  
  return croppedCanvas;
}

async function createPngWithDPI(canvas, targetDPI) {
  const blob = await new Promise(resolve => {
    canvas.toBlob(resolve, 'image/png', 1.0);
  });
  
  return blob;
}

function calculateImageDimensions(figureBounds, realWorldScale) {
  const widthCm = realWorldScale.realWidthCm;
  const heightCm = realWorldScale.realHeightCm;
  const widthPixels = Math.round(widthCm * realWorldScale.pixelsPerCm);
  const heightPixels = Math.round(heightCm * realWorldScale.pixelsPerCm);
  
  return {
    widthCm,
    heightCm,
    widthPixels,
    heightPixels
  };
}

function showCopyNotification(message) {
  const existingNotif = document.querySelector('.copy-notification');
  if (existingNotif) existingNotif.remove();
  
  const notification = document.createElement('div');
  notification.className = 'copy-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #00b894, #00cec9);
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    font-family: inherit;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    z-index: 10000;
    opacity: 0;
    transform: translateX(100px);
    transition: all 0.4s ease;
    max-width: 280px;
    line-height: 1.4;
  `;
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span>✅</span>
      <div>${message}</div>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100px)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 400);
  }, 4000);
}

function calculateFigureBounds() {
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  
  const allPoints = [];
  
  if (points && points.length > 0) {
    allPoints.push(...points);
  }
  
  if (centerPoint) allPoints.push(centerPoint);
  if (circlePoint) allPoints.push(circlePoint);
  
  if (diameterPoints && diameterPoints.length > 0) {
    allPoints.push(...diameterPoints);
  }
  
  if (lengthHandles && lengthHandles.length > 0) {
    allPoints.push(...lengthHandles);
  }
  
  allPoints.forEach(point => {
    if (point && typeof point.X === 'function' && typeof point.Y === 'function') {
      const x = point.X();
      const y = point.Y();
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  });
  
  if (centerPoint && circleObject) {
    const radius = Math.hypot(circlePoint.X() - centerPoint.X(), circlePoint.Y() - centerPoint.Y());
    const centerX = centerPoint.X();
    const centerY = centerPoint.Y();
    
    minX = Math.min(minX, centerX - radius);
    maxX = Math.max(maxX, centerX + radius);
    minY = Math.min(minY, centerY - radius);
    maxY = Math.max(maxY, centerY + radius);
  }
  
  const marginX = (maxX - minX) * 0.15;
  const marginY = (maxY - minY) * 0.15;
  
  const minMargin = 0.8;
  const finalMarginX = Math.max(marginX, minMargin);
  const finalMarginY = Math.max(marginY, minMargin);
  
  return {
    minX: minX - finalMarginX,
    maxX: maxX + finalMarginX,
    minY: minY - finalMarginY,
    maxY: maxY + finalMarginY
  };
}

// ==========================================
// SETUP EVENT LISTENERS
// ==========================================

function setupEventListeners() {
  console.log('🚀 Initialisation du générateur de figures 2D...');

  // ==========================================
  // 1. SYSTÈME DE SUGGESTIONS INTELLIGENTES
  // ==========================================
  
  const input = document.getElementById("promptInput");
  const suggestionsDiv = document.getElementById("suggestionBox");

  const suggestionsList = [
    "carré de côté 4",
    "rectangle de 5 sur 3",
    "triangle équilatéral de côté 4",
    "triangle rectangle de base 3 et hauteur 4",
    "triangle isocèle de base 6 et hauteur 4",
    "triangle côtés 3, 4.5, 5",
    "triangle de côtés 5.5, 6, 7",
    "triangle quelconque 4, 5, 6.5",
    "cercle de rayon 2",
    "losange de côté 5",
    "parallélogramme 5 x 3",
    "hexagone de côté 4",
    "pentagone de côté 4",
    "octogone de côté 4"
  ];

  let selectedSuggestionIndex = -1;

  // Affichage dynamique des suggestions pendant la frappe
  if (input && suggestionsDiv) {
    input.addEventListener("input", function () {
      const value = input.value.trim().toLowerCase();
      suggestionsDiv.innerHTML = "";
      selectedSuggestionIndex = -1;
      
      if (!value) {
        suggestionsDiv.style.display = "none";
        return;
      }
      
      // Filtrer et limiter à 5 suggestions
      const filtered = suggestionsList
        .filter(s => s.toLowerCase().includes(value))
        .slice(0, 5);
      
      if (filtered.length === 0) {
        suggestionsDiv.style.display = "none";
        return;
      }
      
      // Générer le HTML des suggestions
      filtered.forEach(suggestion => {
        const div = document.createElement("div");
        div.className = "suggestion-item";
        div.textContent = suggestion;
        
        // Événement au survol
        div.addEventListener("mouseover", function () {
          const items = suggestionsDiv.querySelectorAll(".suggestion-item");
          items.forEach(item => item.style.background = "white");
          this.style.background = "#f0f0f0";
        });
        
        // Événement au clic
        div.addEventListener("click", function () {
          input.value = suggestion;
          suggestionsDiv.style.display = "none";
          selectedSuggestionIndex = -1;
          generateFigure();
        });
        
        suggestionsDiv.appendChild(div);
      });
      
      suggestionsDiv.style.display = "block";
    });

    // Navigation clavier et autocomplétion
    input.addEventListener("keydown", function (e) {
      const items = suggestionsDiv.querySelectorAll(".suggestion-item");
      
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (items.length > 0) {
          selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, items.length - 1);
          highlightSuggestion(items);
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (items.length > 0) {
          selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
          highlightSuggestion(items);
        }
      } else if (e.key === "Tab") {
        e.preventDefault();
        if (items.length > 0) {
          const index = selectedSuggestionIndex >= 0 ? selectedSuggestionIndex : 0;
          input.value = items[index].textContent;
          suggestionsDiv.style.display = "none";
          selectedSuggestionIndex = -1;
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        
        // Logique de sélection intelligente des suggestions
        if (suggestionsDiv.style.display === "block" && items.length > 0) {
          let suggestionToUse = null;
          
          // Si une suggestion est sélectionnée -> l'utiliser
          if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < items.length) {
            suggestionToUse = items[selectedSuggestionIndex].textContent;
          } 
          // Sinon, prendre automatiquement la PREMIÈRE suggestion
          else {
            suggestionToUse = items[0].textContent;
          }
          
          // Appliquer la suggestion
          if (suggestionToUse) {
            input.value = suggestionToUse;
            suggestionsDiv.style.display = "none";
            selectedSuggestionIndex = -1;
            generateFigure();
            return;
          }
        }
        
        // Si pas de suggestions, générer avec le texte actuel
        if (suggestionsDiv.style.display !== "block" && input.value.trim()) {
          generateFigure();
        }
      }
    });

    console.log('✅ Système de suggestions configuré');
  }

  // Fonction helper pour highlight
  function highlightSuggestion(items) {
    items.forEach((item, i) => {
      item.style.background = i === selectedSuggestionIndex ? "#f0f0f0" : "white";
    });
  }

  // ==========================================
  // 2. RESET INITIAL DE L'INTERFACE
  // ==========================================
  
  // Reset de tous les checkboxes
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
  });
  
  // Reset des champs de saisie
  const promptInput = document.getElementById('promptInput');
  const labelInput = document.getElementById('labelInput');
  const figureSearch = document.getElementById('figureSearch');
  
  if (promptInput) promptInput.value = '';
  if (labelInput) labelInput.value = '';
  if (figureSearch) figureSearch.value = '';
  
  // Reset des suggestions
  const suggestionBox = document.getElementById('suggestionBox');
  if (suggestionBox) {
    suggestionBox.style.display = 'none';
    suggestionBox.innerHTML = '';
  }
  
  // Reset de la liste des figures
  const figuresList = document.getElementById('figuresList');
  if (figuresList) {
    Array.from(figuresList.children).forEach(li => {
      li.classList.remove('selected', 'highlighted');
    });
  }

  // ==========================================
  // 3. GESTION DES UNITÉS ET MESURES
  // ==========================================
  
  const toggleLengths = document.getElementById('toggleLengths');
  const unitGroup = document.getElementById('unitGroup');
  const showUnitsCheckbox = document.getElementById('showUnitsCheckbox');
  const unitSelector = document.getElementById('unitSelector');

  if (toggleLengths && unitGroup) {
    // Fonction pour afficher/masquer le groupe unités
    function updateUnitVisibility() {
      if (toggleLengths.checked) {
        unitGroup.style.display = 'block';
      } else {
        unitGroup.style.display = 'none';
        if (showUnitsCheckbox) showUnitsCheckbox.checked = false;
      }
      updateLengthLabels();
    }
    
    // État initial : unités cachées
    unitGroup.style.display = 'none';
    
    // Event listeners pour les mesures
    toggleLengths.addEventListener('change', updateUnitVisibility);
    
    if (showUnitsCheckbox) {
      showUnitsCheckbox.addEventListener('change', () => {
        updateLengthLabels();
      });
    }
    
    if (unitSelector) {
      unitSelector.addEventListener('change', () => {
        updateLengthLabels();
      });
    }
    
    console.log('✅ Gestion des unités configurée');
  }

  // ==========================================
  // 4. EVENT LISTENERS POUR LES OPTIONS D'AFFICHAGE
  // ==========================================
  
  // Fonction helper pour ajouter des event listeners en sécurité
  function addSafeEventListener(elementId, event, handler, description) {
    const element = document.getElementById(elementId);
    if (element) {
      element.addEventListener(event, handler);
      console.log(`✅ ${description} configuré`);
      return true;
    }
    return false;
  }
  
  // Codages des côtés égaux
  addSafeEventListener('toggleCodings', 'change', () => {
    updateCodings();
  }, 'Codages des côtés');
  
  // Diagonales
  addSafeEventListener('toggleDiagonals', 'change', () => {
    updateDiagonals();
  }, 'Diagonales');
  
  // Event listener pour la checkbox d'intersection
  addSafeEventListener('toggleIntersectionLabel', 'change', () => {
    updateDiagonals();
  }, "Label d'intersection");

  // Event listener pour le champ texte d'intersection
  addSafeEventListener('intersectionTextInput', 'input', () => {
    const showIntersectionLabel = document.getElementById('toggleIntersectionLabel')?.checked;
    if (showIntersectionLabel) {
      updateDiagonals();
    }
  }, "Texte d'intersection");

  // Event listener pour Enter dans le champ texte
  const intersectionTextInput = document.getElementById('intersectionTextInput');
  if (intersectionTextInput) {
    intersectionTextInput.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        const showIntersectionLabel = document.getElementById('toggleIntersectionLabel')?.checked;
        if (showIntersectionLabel) {
          updateDiagonals();
        }
      }
    });
  }
  
  // Angles égaux
  addSafeEventListener('toggleEqualAngles', 'change', (e) => {
    updateEqualAngleMarkers(e.target.checked);
  }, 'Angles égaux');
  
  // Angles droits
  addSafeEventListener('toggleRightAngles', 'change', (e) => {
    updateRightAngleMarkers(e.target.checked);
  }, 'Angles droits');
  
  // Option "un seul angle droit"
  addSafeEventListener('toggleSingleAngle', 'change', () => {
    const toggleRightAngles = document.getElementById('toggleRightAngles');
    if (toggleRightAngles) {
      updateRightAngleMarkers(toggleRightAngles.checked);
    }
  }, 'Un seul angle droit');
  
  // Option "cacher l'hypoténuse"
  addSafeEventListener('toggleHideHypotenuse', 'change', () => {
    updateLengthLabels();
  }, 'Cacher hypoténuse');
  
  // Rayon du cercle
  addSafeEventListener('toggleRadius', 'change', () => {
    updateCircleExtras();
  }, 'Rayon du cercle');
  
  // Diamètre du cercle
  addSafeEventListener('toggleDiameter', 'change', () => {
    updateCircleExtras();
  }, 'Diamètre du cercle');
  
  // Effet main levée
  addSafeEventListener('toggleHandDrawn', 'change', (e) => {
    const isHandDrawnMode = e.target.checked;
    if (isHandDrawnMode) {
      applyHandDrawnEffect();
    } else {
      // Regenerate sans effet
      invalidateFigureCache();
      generateFigure();
    }
  }, 'Effet main levée');

  // ==========================================
  // 5. INTERACTION AVEC LA LISTE DES FIGURES
  // ==========================================
  
  if (figuresList && promptInput) {
    figuresList.addEventListener('click', function (e) {
      const listItem = e.target.closest('li');
      if (!listItem) return;
      
      // Récupérer le prompt depuis l'attribut data-prompt ou générer depuis le texte
      let figurePrompt = listItem.getAttribute('data-prompt');
      
      if (!figurePrompt) {
        const itemText = listItem.textContent || listItem.innerText;
        
        // Mapping texte → prompt pour génération
        const textToPromptMap = {
          'Carré': 'carré de côté 4',
          'Rectangle': 'rectangle de 5 sur 3',
          'Triangle équilatéral': 'triangle équilatéral de côté 4',
          'Triangle rectangle': 'triangle rectangle de base 3 et hauteur 4',
          'Triangle isocèle': 'triangle isocèle de base 6 et hauteur 4',
          'Triangle quelconque': 'triangle côtés 4.5, 5, 7',
          'Cercle': 'cercle de rayon 2',
          'Losange': 'losange de côté 5',
          'Parallélogramme': 'parallélogramme base 5 hauteur 3',
          'Hexagone': 'hexagone de côté 4',
          'Pentagone': 'pentagone de côté 4'
        };
        
        // Chercher la correspondance
        figurePrompt = Object.entries(textToPromptMap).find(([key]) => 
          itemText.includes(key)
        )?.[1] || itemText.toLowerCase();
      }
      
      // Appliquer le prompt et générer la figure
      promptInput.value = figurePrompt;
      generateFigure();
      
      // Marquer visuellement l'élément sélectionné
      figuresList.querySelectorAll('li').forEach(li => li.classList.remove('selected'));
      listItem.classList.add('selected');
    });
    
    console.log('✅ Liste des figures interactive configurée');
  }

  // ==========================================
  // 6. FONCTION DE RECHERCHE DANS LA LISTE
  // ==========================================
  
  if (figureSearch && figuresList) {
    figureSearch.addEventListener('input', function () {
      const searchQuery = this.value.trim().toLowerCase();
      
      Array.from(figuresList.children).forEach(listItem => {
        const itemText = (listItem.textContent || '').toLowerCase();
        const isVisible = itemText.includes(searchQuery);
        listItem.style.display = isVisible ? '' : 'none';
      });
    });
    
    console.log('✅ Recherche dans la liste configurée');
  }

  // ==========================================
  // 7. CRÉATION DES BOUTONS D'EXPORT
  // ==========================================

  const optionsPanel = document.getElementById('optionsPanel');
  if (optionsPanel) {
    
    // Créer un conteneur flex pour les boutons côte à côte
    let buttonsContainer = document.getElementById('exportButtonsContainer');
    if (!buttonsContainer) {
      buttonsContainer = document.createElement('div');
      buttonsContainer.id = 'exportButtonsContainer';
      buttonsContainer.style.cssText = `
        display: flex;
        flex-direction: row;
        gap: 10px;
        margin-top: 15px;
        justify-content: flex-start;
        align-items: center;
        flex-wrap: nowrap;
      `;
      optionsPanel.insertAdjacentElement('afterend', buttonsContainer);
    }
    
    // Bouton Export SVG
    if (!document.getElementById('exportSvgBtn')) {
      const exportButton = document.createElement('button');
      exportButton.id = 'exportSvgBtn';
      exportButton.textContent = 'Exporter SVG';
      exportButton.style.cssText = `
        padding: 10px 20px; 
        background: linear-gradient(135deg, #6c5ce7, #a29bfe);
        color: white; 
        border: none; 
        border-radius: 6px; 
        cursor: pointer;
        font-family: inherit;
        font-weight: 500;
        transition: all 0.3s ease;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        margin: 0;
        flex-shrink: 0;
        order: 1;
      `;
      
      exportButton.addEventListener('mouseenter', () => {
        exportButton.style.transform = 'translateY(-1px)';
        exportButton.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
      });
      
      exportButton.addEventListener('mouseleave', () => {
        exportButton.style.transform = 'translateY(0)';
        exportButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      });
      
      exportButton.addEventListener('click', function() {
        exportBoardToSVG();
      });
      
      buttonsContainer.appendChild(exportButton);
      console.log('✅ Bouton d\'export SVG créé');
    }
    
    // Bouton Copier Presse-papier
    if (!document.getElementById('copyClipboardBtn')) {
      const copyButton = document.createElement('button');
      copyButton.id = 'copyClipboardBtn';
      copyButton.innerHTML = '📋 Copier';
      copyButton.style.cssText = `
        padding: 10px 20px; 
        background: linear-gradient(135deg, #00b894, #00cec9);
        color: white; 
        border: none; 
        border-radius: 6px; 
        cursor: pointer;
        font-family: inherit;
        font-weight: 500;
        transition: all 0.3s ease;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        margin: 0;
        flex-shrink: 0;
        order: 2;
      `;
      
      copyButton.addEventListener('mouseenter', () => {
        copyButton.style.transform = 'translateY(-1px)';
        copyButton.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
      });
      
      copyButton.addEventListener('mouseleave', () => {
        copyButton.style.transform = 'translateY(0)';
        copyButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      });
      
      copyButton.addEventListener('click', function() {
        copyBoardToClipboard();
      });
      
      buttonsContainer.appendChild(copyButton);
      console.log('✅ Bouton copier presse-papier créé');
    }
  }

  console.log('🎉 Initialisation du générateur terminée avec succès !');
  console.log('📋 Tapez une figure dans le champ de saisie ou cliquez sur la liste');
}

// ==========================================
// MODULE: js/main.js
// ==========================================
/**
 * ============================================
 * MAIN.JS - Point d'entrée de l'application
 * ============================================
 * 
 * Initialisation de l'application Générateur de Figures 2D
 */

// ==========================================
// IMPORTS DES MODULES
// ==========================================

// Configuration et état global
// Initialisation du board JSXGraph
// Interface utilisateur et événements
// Effets visuels
// Marqueurs visuels
// ==========================================
// INITIALISATION DE L'APPLICATION
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Initialisation du Générateur de Figures 2D...');

  // 1. Initialiser le board JSXGraph
  initBoard();
  console.log('✅ Board JSXGraph initialisé');

  // 2. Configurer les event listeners
  setupEventListeners();
  console.log('✅ Event listeners configurés');

  // ==========================================
  // EXPOSITION DES FONCTIONS GLOBALES
  // ==========================================

  // Rendre les fonctions accessibles depuis le HTML (onclick, etc.)
  window.generateFigure = generateFigure;
  window.exportBoardToSVG = exportBoardToSVG;
  window.copyBoardToClipboard = copyBoardToClipboard;
  window.toggleHandDrawnEffect = toggleHandDrawnEffect;
  window.updateLengthLabels = updateLengthLabels;
  window.updateCodings = updateCodings;
  window.updateRightAngleMarkers = updateRightAngleMarkers;
  window.updateEqualAngleMarkers = updateEqualAngleMarkers;
  window.updateDiagonals = updateDiagonals;
  window.updateCircleExtras = updateCircleExtras;

  console.log('✅ Fonctions exposées globalement');
  console.log('🎉 Application prête !');
});


// ==========================================
// FIN DU BUNDLE
// ==========================================

