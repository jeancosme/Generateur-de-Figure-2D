let board = JXG.JSXGraph.initBoard('jxgbox', {
  boundingbox: [-5, 5, 5, -5],
  axis: false,
  showCopyright: false,
  showNavigation: false,
  keepaspectratio: true,
  zoom: {
    enabled: false
  },
  grid: false // On va créer notre propre grille
});


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

  const row2 = document.createElement('div');
  row2.className = 'small-row';

  // rotation gauche
  const rotateLeft = document.createElement('button');
  rotateLeft.className = 'rotate-btn';
  rotateLeft.textContent = '↶';
  rotateLeft.title = 'Rotation -10°';
  rotateLeft.addEventListener('click', (e) => { e.stopPropagation(); rotateFigureLeft(); board.update(); });

  // rotation droite
  const rotate = document.createElement('button');
  rotate.className = 'rotate-btn';
  rotate.textContent = '↷';
  rotate.title = 'Rotation +10°';
  rotate.addEventListener('click', (e) => { e.stopPropagation(); rotateFigure(); board.update(); });

  row2.appendChild(rotateLeft);
  row2.appendChild(rotate);

  // nouvelle ligne pour le bouton réinitialiser (sous les rotates)
  const row3 = document.createElement('div');
  row3.className = 'small-row reset-row';

  const reset = document.createElement('button');
  reset.className = 'reset-btn';
  reset.textContent = 'Réinitialiser';
  reset.title = 'Réinitialiser';
  reset.setAttribute('aria-label','Réinitialiser');
  reset.addEventListener('click', (e) => { e.stopPropagation(); resetBoard(); /* resetBoard ré-appelle createBoardControls */ });

  row3.appendChild(reset);


  panel.appendChild(row1);
  panel.appendChild(row2);
  panel.appendChild(row3);

  container.appendChild(panel);
}
// appelle la création du panneau après l'init du board
createBoardControls();


// Zoom à la molette ou pavé tactile
document.getElementById('jxgbox').addEventListener('wheel', function (event) {
  event.preventDefault(); // évite le scroll de la page

  const zoomFactor = 1.1;
  if (event.deltaY < 0) {
    board.zoom(1 / zoomFactor, 1 / zoomFactor); // Zoom avant
  } else {
    board.zoom(zoomFactor, zoomFactor); // Zoom arrière
  }

  board.update();
});

    let points = [];
    let polygon = null;
    let texts = [];
    let rightAngleMarkers = [];
    let lengthLabels = [];
    let codingMarks = [];
    let codingSegments = [];
    let diagonals = [];
    let diameterSegment = null;
    let diameterPoints = []; 
    let centerPoint = null;
    let circlePoint = null;
    let circleObject = null;
    let radiusSegment = null;
    let radiusLabel = null;
    let radiusLabelAnchor = null;
    let extraElements = []; 
    let r = null;
    let customLabels = [];
    let angleMarkers = [];
    let lengthHandles = []; // <-- NEW: handles for draggable length labels
    let labelHandles = []; // handles for draggable point-label anchors (O, A, ...)
    let labelTexts = [];   // text objects for those labels
    let lengthHandleMeta = []; // meta pour synchroniser handles ↔ segments/points
    let _lengthSyncAttached = false;
    let originalPolygon = null;
    let handDrawnElements = [];
    let isHandDrawnMode = false;
    let intersectionLabel = null;
    let intersectionPoint = null;

// ==========================================
// SYSTÈME DE DÉTECTION CENTRALISÉ DES FIGURES
// ==========================================

/**
 * Détecteur centralisé pour identifier le type exact d'une figure géométrique
 */
class FigureDetector {
  
  /**
   * Détecte le type de figure basé sur les points
   * @param {Array} figurePoints - Array des points JSXGraph
   * @param {Object} extraData - Données supplémentaires (centerPoint, circlePoint, etc.)
   * @returns {Object} Information détaillée sur la figure
   */
  static detect(figurePoints, extraData = {}) {
    console.log('🔍 Détection de figure pour', figurePoints?.length, 'points');
    
    // Validation de base
    if (!figurePoints || figurePoints.length === 0) {
      return { type: 'unknown', subtype: null, properties: {} };
    }
    
    const n = figurePoints.length;
    
    // ✅ CERCLE
    if (extraData.centerPoint && extraData.circlePoint && extraData.circleObject) {
      return this._detectCircle(extraData.centerPoint, extraData.circlePoint);
    }
    
    // ✅ TRIANGLE (3 points)
    if (n === 3) {
      return this._detectTriangle(figurePoints);
    }
    
    // ✅ QUADRILATÈRE (4 points)
    if (n === 4) {
      return this._detectQuadrilateral(figurePoints);
    }
    
    // ✅ POLYGONE RÉGULIER (5+ points)
    if (n >= 5) {
      return this._detectPolygon(figurePoints);
    }
    
    return { type: 'unknown', subtype: null, properties: {} };
  }
  
  // ==========================================
  // MÉTHODES PRIVÉES DE DÉTECTION
  // ==========================================
  
  /**
   * Détecte le type de cercle
   */
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
  
  /**
   * Détecte le type de triangle
   */
  static _detectTriangle(figurePoints) {
    const tolerance = 0.1;
    
    // Calculer les longueurs des côtés
    const sideLengths = this._calculateSideLengths(figurePoints);
    const sortedLengths = [...sideLengths].sort((a, b) => a - b);
    
    // Vérifier si c'est un triangle rectangle (théorème de Pythagore)
    const [a, b, c] = sortedLengths;
    const isRightTriangle = Math.abs(a*a + b*b - c*c) < tolerance;
    
    // Compter les côtés égaux
    const uniqueLengths = this._getUniqueLengths(sideLengths, tolerance);
    
    let subtype;
    let properties = {
      sideLengths: sideLengths,
      isRight: isRightTriangle,
      rightAngleIndex: -1
    };
    
    // Détection du type
    if (uniqueLengths.length === 1) {
      subtype = 'equilateral'; // 3 côtés égaux
    } else if (uniqueLengths.length === 2) {
      subtype = 'isosceles'; // 2 côtés égaux
    } else {
      subtype = isRightTriangle ? 'right' : 'scalene';
    }
    
    // Si c'est un triangle rectangle, trouver l'angle droit
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
  
  /**
   * Détecte le type de quadrilatère
   */
  static _detectQuadrilateral(figurePoints) {
    const tolerance = 0.15;
    
    // Calculer les longueurs des côtés
    const sideLengths = this._calculateSideLengths(figurePoints);
    const uniqueLengths = this._getUniqueLengths(sideLengths, tolerance);
    
    // Vérifier les angles droits
    const rightAngles = this._countRightAngles(figurePoints, tolerance);
    
    // Vérifier si les côtés opposés sont égaux (parallélogramme)
    const hasParallelSides = this._hasParallelOppositeSides(sideLengths, tolerance);
    
    let subtype;
    let properties = {
      sideLengths: sideLengths,
      rightAnglesCount: rightAngles,
      hasParallelSides: hasParallelSides
    };
    
    // ✅ LOGIQUE DE DÉTECTION HIÉRARCHIQUE
    if (rightAngles === 4) {
      // 4 angles droits = carré ou rectangle
      if (uniqueLengths.length === 1) {
        subtype = 'square'; // 4 côtés égaux + 4 angles droits
      } else {
        subtype = 'rectangle'; // côtés opposés égaux + 4 angles droits
      }
    } else if (uniqueLengths.length === 1) {
      // 4 côtés égaux sans angles droits
      subtype = 'rhombus';
    } else if (hasParallelSides && uniqueLengths.length === 2) {
      // Côtés opposés égaux (mais pas tous égaux)
      subtype = 'parallelogram';
    } else {
      // Quadrilatère quelconque
      subtype = 'irregular';
    }
    
    console.log(`✅ Quadrilatère détecté: ${subtype}, côtés: [${sideLengths.map(l => l.toFixed(1)).join(', ')}], angles droits: ${rightAngles}`);
    
    return {
      type: 'quadrilateral',
      subtype: subtype,
      properties: properties
    };
  }
  
  /**
   * Détecte le type de polygone (5+ côtés)
   */
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
  
  // ==========================================
  // MÉTHODES UTILITAIRES
  // ==========================================
  
  /**
   * Calcule les longueurs de tous les côtés
   */
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
  
  /**
   * Trouve les longueurs uniques avec tolérance
   */
  static _getUniqueLengths(lengths, tolerance) {
    const rounded = lengths.map(l => Math.round(l / tolerance) * tolerance);
    return [...new Set(rounded.map(l => l.toFixed(2)))];
  }
  
  /**
   * Compte le nombre d'angles droits
   */
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
  
  /**
   * Vérifie si un angle est droit
   */
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
  
  /**
   * Trouve l'index du sommet avec l'angle droit (pour triangles)
   */
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
  
  /**
   * Vérifie si les côtés opposés sont parallèles (parallélogramme)
   */
  static _hasParallelOppositeSides(sideLengths, tolerance) {
    if (sideLengths.length !== 4) return false;
    
    // Vérifier si les côtés opposés sont égaux
    const [s1, s2, s3, s4] = sideLengths;
    const opposite1Equal = Math.abs(s1 - s3) < tolerance;
    const opposite2Equal = Math.abs(s2 - s4) < tolerance;
    
    return opposite1Equal && opposite2Equal;
  }
}

// ==========================================
// CACHE DE DÉTECTION DE FIGURE
// ==========================================

/**
 * Cache global pour éviter de recalculer le type de figure
 */
let _figureCache = {
  lastPoints: null,
  lastExtraData: null,
  result: null,
  isValid: false
};

/**
 * Obtient le type de figure avec mise en cache
 */
function getCurrentFigureType() {
  // Préparer les données actuelles
  const currentPoints = points ? [...points] : [];
  const currentExtraData = {
    centerPoint: centerPoint,
    circlePoint: circlePoint,
    circleObject: circleObject
  };
  
  // Vérifier si le cache est encore valide
  const cacheValid = (
    _figureCache.isValid &&
    _figureCache.lastPoints &&
    _figureCache.lastPoints.length === currentPoints.length &&
    _figureCache.lastExtraData?.centerPoint === currentExtraData.centerPoint
  );
  
  if (!cacheValid) {
    // Recalculer et mettre en cache
    _figureCache.result = FigureDetector.detect(currentPoints, currentExtraData);
    _figureCache.lastPoints = currentPoints;
    _figureCache.lastExtraData = currentExtraData;
    _figureCache.isValid = true;
    
    console.log('🔄 Cache de figure mis à jour:', _figureCache.result.type, _figureCache.result.subtype);
  }
  
  return _figureCache.result;
}

/**
 * Invalide le cache (à appeler après génération/modification d'une figure)
 */
/**
 * Invalide le cache de manière intelligente
 * @param {string} reason - Raison de l'invalidation (pour debug)
 */
function invalidateFigureCache(reason = 'manual') {
  const wasValid = _figureCache.isValid;
  _figureCache.isValid = false;
  
  if (wasValid) {
    console.log(`🗑️ Cache invalidé: ${reason}`);
  }
  
  // ✅ OPTIMISATION : Invalider aussi les caches dérivés
  _lengthLabelsCache = null;
  _codingsCache = null;
  _rightAnglesCache = null;
}

/**
 * Invalide automatiquement le cache quand la figure change
 */
function autoInvalidateCache() {
  // Déclenché automatiquement lors des modifications de figure
  invalidateFigureCache('figure modified');
  
  // ✅ OPTIMISATION : Mettre à jour seulement ce qui est visible
  const activeOptions = getActiveDisplayOptions();
  
  if (activeOptions.lengths) updateLengthLabels();
  if (activeOptions.codings) updateCodings();
  if (activeOptions.rightAngles) updateRightAngleMarkers(true);
  if (activeOptions.equalAngles) updateEqualAngleMarkers(true);
  if (activeOptions.diagonals) updateDiagonals();
  if (activeOptions.circleExtras) updateCircleExtras();
}

/**
 * Récupère les options d'affichage actives
 */
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

// ✅ Variables de cache pour optimiser les performances
let _lengthLabelsCache = null;
let _codingsCache = null; 
let _rightAnglesCache = null;

// ==========================================
// SYSTÈME DE HANDLERS SPÉCIALISÉS PAR FIGURE
// ==========================================

/**
 * Classe de base pour tous les handlers de figures
 */
class BaseFigureHandler {
  constructor(figurePoints, figureInfo) {
    this.points = figurePoints;
    this.figureInfo = figureInfo;
  }
  
  // Méthodes par défaut (à override dans les classes filles)
  getSidesToShow() { return []; }
  getRightAngles() { return []; }
  getCodings() { return { groups: [], type: 'none' }; }
  shouldShowSingleRightAngle() { return false; }
  shouldHideHypotenuse() { return false; }
  getHypotenuseIndex() { return -1; }
  
  // Méthodes utilitaires communes
  getSideLength(sideIndex) {
    if (!this.points || sideIndex >= this.points.length) return 0;
    const pt1 = this.points[sideIndex];
    const pt2 = this.points[(sideIndex + 1) % this.points.length];
    return Math.hypot(pt2.X() - pt1.X(), pt2.Y() - pt1.Y());
  }
}

/**
 * Handler pour les carrés
 */
class SquareHandler extends BaseFigureHandler {
  getSidesToShow() {
    // CARRÉ : Afficher seulement le côté du bas (index 2: C→D)
    return [2];
  }
  
  getRightAngles() {
    // CARRÉ : Les 4 angles sont droits
    return [1, 0, 2, 3]; // 1 en premier = haut-droite sera affiché seul
  }
  
  getCodings() {
    // CARRÉ : Tous les côtés égaux (1 trait sur chaque)
    return {
      groups: [
        { sides: [0, 1, 2, 3], markCount: 1 }
      ],
      type: 'all-equal'
    };
  }
  
  shouldShowSingleRightAngle() {
    // Option disponible pour les carrés
    return true;
  }
}

/**
 * Handler pour les rectangles
 */
class RectangleHandler extends BaseFigureHandler {
  getSidesToShow() {
    // RECTANGLE : Afficher 2 côtés consécutifs (largeur et hauteur)
    return [1, 2]; // AB (bas) et BC (droite)
  }
  
  getRightAngles() {
    // RECTANGLE : Les 4 angles sont droits
    return [1, 0, 2, 3]; // 2 en premier = haut-droite sera affiché seul
  }
  
  getCodings() {
    // RECTANGLE : Côtés opposés égaux
    const sideLengths = this.figureInfo.properties?.sideLengths || [];
    if (sideLengths.length !== 4) return { groups: [], type: 'none' };
    
    // Grouper les côtés opposés égaux
    return {
      groups: [
        { sides: [0, 2], markCount: 1 }, // Côtés opposés AB et CD
        { sides: [1, 3], markCount: 2 }  // Côtés opposés BC et DA
      ],
      type: 'opposite-pairs'
    };
  }
  
  shouldShowSingleRightAngle() {
    // Option disponible pour les rectangles
    return true;
  }
}

/**
 * Handler pour les losanges
 */
class RhombusHandler extends BaseFigureHandler {
  getSidesToShow() {
    // LOSANGE : Seulement un côté (tous égaux)
    return [2]; // Côté du bas
  }
  
  getRightAngles() {
    // LOSANGE : Pas d'angles droits par défaut
    return [];
  }
  
  getCodings() {
    // LOSANGE : Tous les côtés égaux
    return {
      groups: [
        { sides: [0, 1, 2, 3], markCount: 1 }
      ],
      type: 'all-equal'
    };
  }
}

/**
 * Handler pour les parallélogrammes
 */
class ParallelogramHandler extends BaseFigureHandler {
  getSidesToShow() {
    // PARALLÉLOGRAMME : 2 côtés consécutifs
    return [1, 2]; // Base et côté oblique
  }
  
  getRightAngles() {
    // PARALLÉLOGRAMME : Pas d'angles droits
    return [];
  }
  
  getCodings() {
    // PARALLÉLOGRAMME : Côtés opposés égaux
    return {
      groups: [
        { sides: [0, 2], markCount: 1 }, // Côtés opposés
        { sides: [1, 3], markCount: 2 }  // Côtés opposés
      ],
      type: 'opposite-pairs'
    };
  }
}

/**
 * Handler pour les triangles équilatéraux
 */
class EquilateralTriangleHandler extends BaseFigureHandler {
  getSidesToShow() {
    // TRIANGLE ÉQUILATÉRAL : Un seul côté (tous égaux)
    return [0]; // Côté de base
  }
  
  getRightAngles() {
    // TRIANGLE ÉQUILATÉRAL : Pas d'angles droits
    return [];
  }
  
  getCodings() {
    // TRIANGLE ÉQUILATÉRAL : Tous les côtés égaux
    return {
      groups: [
        { sides: [0, 1, 2], markCount: 1 }
      ],
      type: 'all-equal'
    };
  }
}

/**
 * Handler pour les triangles rectangles
 */
class RightTriangleHandler extends BaseFigureHandler {
  getSidesToShow() {
    // ✅ CORRECTION : Afficher TOUS les côtés par défaut, pas seulement les côtés de l'angle droit
    return [0, 1, 2]; // Afficher tous les côtés (AB, BC, CA)
  }
  
  getRightAngles() {
    // TRIANGLE RECTANGLE : Un seul angle droit
    const rightAngleIndex = this.figureInfo.properties?.rightAngleIndex ?? -1;
    return rightAngleIndex !== -1 ? [rightAngleIndex] : [];
  }
  
  getCodings() {
    // TRIANGLE RECTANGLE : Généralement pas de côtés égaux (sauf cas particulier)
    return { groups: [], type: 'none' };
  }
  
  shouldHideHypotenuse() {
    // Option disponible pour les triangles rectangles
    return true;
  }
  
  getHypotenuseIndex() {
    // Trouver le côté le plus long (hypoténuse)
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

/**
 * Handler pour les triangles isocèles
 */
class IsoscelesTriangleHandler extends BaseFigureHandler {
  getSidesToShow() {
    // TRIANGLE ISOCÈLE : Afficher tous les côtés (2 égaux + 1 différent)
    return [0, 1, 2];
  }
  
  getRightAngles() {
    // Vérifier si c'est aussi un triangle rectangle
    const rightAngleIndex = this.figureInfo.properties?.rightAngleIndex ?? -1;
    return rightAngleIndex !== -1 ? [rightAngleIndex] : [];
  }
  
  getCodings() {
    // TRIANGLE ISOCÈLE : 2 côtés égaux
    const sideLengths = this.figureInfo.properties?.sideLengths || [];
    if (sideLengths.length !== 3) return { groups: [], type: 'none' };
    
    // Identifier les côtés égaux
    const tolerance = 0.1;
    const groups = [];
    
    for (let i = 0; i < 3; i++) {
      for (let j = i + 1; j < 3; j++) {
        if (Math.abs(sideLengths[i] - sideLengths[j]) < tolerance) {
          // Côtés égaux trouvés
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

/**
 * Handler pour les triangles quelconques
 */
class ScaleneTriangleHandler extends BaseFigureHandler {
  getSidesToShow() {
    // TRIANGLE QUELCONQUE : Afficher tous les côtés
    return [0, 1, 2];
  }
  
  getRightAngles() {
    return []; // Pas d'angles droits
  }
  
  getCodings() {
    return { groups: [], type: 'none' }; // Pas de côtés égaux
  }
}

/**
 * Handler pour les cercles
 */
class CircleHandler extends BaseFigureHandler {
  constructor(centerPoint, circlePoint, figureInfo) {
    super([circlePoint], figureInfo); // Les cercles ont un point sur la circonférence
    this.centerPoint = centerPoint;
    this.circlePoint = circlePoint;
  }
  
  getSidesToShow() {
    // CERCLE : Pas de côtés au sens classique
    return [];
  }
  
  getRightAngles() {
    return []; // Pas d'angles dans un cercle
  }
  
  getCodings() {
    // CERCLE : Les rayons sont égaux (géré par updateCircleExtras)
    return { groups: [], type: 'radii' };
  }
  
  getRadius() {
    return this.figureInfo.properties?.radius || 0;
  }
}

/**
 * Handler pour les polygones réguliers
 */
class RegularPolygonHandler extends BaseFigureHandler {
  getSidesToShow() {
    // POLYGONE RÉGULIER : Un seul côté (tous égaux)
    return [0];
  }
  
  getRightAngles() {
    return []; // Généralement pas d'angles droits
  }
  
  getCodings() {
    // POLYGONE RÉGULIER : Tous les côtés égaux
    const allSides = [...Array(this.points.length).keys()];
    return {
      groups: [
        { sides: allSides, markCount: 1 }
      ],
      type: 'all-equal'
    };
  }
}

/**
 * Handler par défaut pour les figures inconnues
 */
class DefaultFigureHandler extends BaseFigureHandler {
  getSidesToShow() {
    // FIGURE INCONNUE : Afficher tous les côtés
    return [...Array(this.points.length).keys()];
  }
  
  getRightAngles() {
    return [];
  }
  
  getCodings() {
    return { groups: [], type: 'none' };
  }
}

// ==========================================
// FACTORY POUR CRÉER LES HANDLERS
// ==========================================

/**
 * Factory pour créer le handler approprié selon le type de figure
 */
class FigureHandlerFactory {
  
  /**
   * Crée le handler approprié pour une figure
   * @param {Object} figureInfo - Information de la figure (depuis FigureDetector)
   * @param {Array} figurePoints - Points de la figure
   * @param {Object} extraData - Données supplémentaires (centerPoint, etc.)
   * @returns {BaseFigureHandler} Handler spécialisé
   */
  static create(figureInfo, figurePoints, extraData = {}) {
    if (!figureInfo || !figureInfo.type) {
      console.warn('⚠️ Type de figure non défini, utilisation du handler par défaut');
      return new DefaultFigureHandler(figurePoints, figureInfo);
    }
    
    const { type, subtype } = figureInfo;
    
    console.log(`🏭 Création handler pour: ${type} - ${subtype}`);
    
    // CERCLES
    if (type === 'circle') {
      return new CircleHandler(extraData.centerPoint, extraData.circlePoint, figureInfo);
    }
    
    // TRIANGLES
    if (type === 'triangle') {
      switch (subtype) {
        case 'equilateral':
          return new EquilateralTriangleHandler(figurePoints, figureInfo);
        case 'right':
          return new RightTriangleHandler(figurePoints, figureInfo);
        case 'isosceles':
          return new IsoscelesTriangleHandler(figurePoints, figureInfo);
        case 'scalene':
        default:
          return new ScaleneTriangleHandler(figurePoints, figureInfo);
      }
    }
    
    // QUADRILATÈRES
    if (type === 'quadrilateral') {
      switch (subtype) {
        case 'square':
          return new SquareHandler(figurePoints, figureInfo);
        case 'rectangle':
          return new RectangleHandler(figurePoints, figureInfo);
        case 'rhombus':
          return new RhombusHandler(figurePoints, figureInfo);
        case 'parallelogram':
          return new ParallelogramHandler(figurePoints, figureInfo);
        default:
          return new DefaultFigureHandler(figurePoints, figureInfo);
      }
    }
    
    // POLYGONES
    if (type === 'polygon') {
      if (subtype.startsWith('regular_')) {
        return new RegularPolygonHandler(figurePoints, figureInfo);
      }
      return new DefaultFigureHandler(figurePoints, figureInfo);
    }
    
    // DÉFAUT
    console.warn(`⚠️ Pas de handler spécialisé pour ${type}-${subtype}`);
    return new DefaultFigureHandler(figurePoints, figureInfo);
  }
}


// ==========================================
// UTILITAIRE POUR OBTENIR LE HANDLER ACTUEL
// ==========================================

/**
 * Obtient le handler pour la figure actuellement affichée
 * @returns {BaseFigureHandler|null} Handler de la figure courante
 */
function getCurrentFigureHandler() {
  // Obtenir les informations de la figure
  const figureInfo = getCurrentFigureType();
  
  if (!figureInfo || figureInfo.type === 'unknown') {
    console.warn('⚠️ Aucune figure détectée ou figure inconnue');
    return null;
  }
  
  // Préparer les données supplémentaires
  const extraData = {
    centerPoint: centerPoint,
    circlePoint: circlePoint,
    circleObject: circleObject
  };
  
  // Créer et retourner le handler
  const handler = FigureHandlerFactory.create(figureInfo, points, extraData);
  
  console.log(`🎯 Handler actuel: ${handler.constructor.name}`);
  
  return handler;
}

// ✅ FONCTION DE TEST (à supprimer après)
function testHandlers() {
  console.log('🧪 === TEST DES HANDLERS ===');
  
  const handler = getCurrentFigureHandler();
  if (!handler) {
    console.log('❌ Aucun handler trouvé');
    return;
  }
  
  console.log(`📝 Handler: ${handler.constructor.name}`);
  console.log(`📏 Côtés à afficher: [${handler.getSidesToShow().join(', ')}]`);
  console.log(`📐 Angles droits: [${handler.getRightAngles().join(', ')}]`);
  console.log(`🔧 Codages:`, handler.getCodings());
  console.log(`⚡ Un seul angle droit?: ${handler.shouldShowSingleRightAngle()}`);
  console.log(`🚫 Cacher hypoténuse?: ${handler.shouldHideHypotenuse()}`);
}

// Rendre accessible depuis la console
window.testHandlers = testHandlers;


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
    radiusSegment = null;
  }
  if (radiusLabel) {
    try { board.removeObject(radiusLabel); } catch (e) {}
    radiusLabel = null;
  }
  if (diameterSegment) {
    try { board.removeObject(diameterSegment); } catch (e) {}
    diameterSegment = null;
  }
  diameterPoints.forEach(pt => { 
    try { board.removeObject(pt); } catch (e) {} 
  });
  diameterPoints = [];

  // ✅ NOUVEAU : Nettoyer les codages existants à chaque fois
  codingMarks.forEach(mark => { 
    try { board.removeObject(mark); } catch (e) {} 
  });
  codingMarks = [];

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

    radiusSegment = board.create('segment', [centerPoint, circlePoint], {
      strokeColor: 'black',
      strokeWidth: 2,
      fixed: true
    });

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

      radiusLabel = board.create('text', [
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
      lengthLabels.push(radiusLabel);
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

    diameterPoints = [B, C];

    diameterSegment = board.create('segment', [B, C], {
      strokeColor: 'black',
      strokeWidth: 2,
      fixed: true
    });
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

// Fonction Diagonales   
function updateDiagonals() {
  // Supprimer les anciennes diagonales ET le label d'intersection
  diagonals.forEach(d => board.removeObject(d));
  diagonals = [];
  
  if (intersectionLabel) {
    try { board.removeObject(intersectionLabel); } catch (e) {}
    intersectionLabel = null;
  }
  if (intersectionPoint) {
    try { board.removeObject(intersectionPoint); } catch (e) {}
    intersectionPoint = null;
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
  // Diagonale 1 : point[0] vers point[2] 
  const diag1 = board.create('segment', [points[0], points[2]], {
    strokeColor: 'black',
    strokeWidth: 1,
    dash: 0,
    fixed: true,
    withLabel: false
  });
  
  // Diagonale 2 : point[1] vers point[3]
  const diag2 = board.create('segment', [points[1], points[3]], {
    strokeColor: 'black', 
    strokeWidth: 1,
    dash: 0,
    fixed: true,
    withLabel: false
  });

  diagonals.push(diag1, diag2);
  console.log('✅ 2 diagonales créées');
  
  // ✅ CRÉER LE LABEL D'INTERSECTION (si demandé)
  const showIntersectionLabel = document.getElementById('toggleIntersectionLabel')?.checked;
  if (showIntersectionLabel) {
    createIntersectionLabel();
  }
  
  board.update();
}

// ✅ NOUVELLE FONCTION : Créer le label d'intersection
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
  intersectionPoint = board.create('point', [intersection.x, intersection.y], {
    visible: false,
    fixed: true,
    name: ''
  });

  // Label qui suit le handle déplaçable
  intersectionLabel = board.create('text', [
    () => intersectionHandle.X(), // Suit le handle
    () => intersectionHandle.Y(),
    labelText
  ], {
    anchorX: 'middle',
    anchorY: 'middle',
    fontSize: 14,
    strokeColor: 'black',
    fixed: false, // ✅ CHANGÉ : permettre le déplacement
    highlight: false,
    name: ''
  });
  
  // Rendre le label déplaçable avec la souris/tactile
  try {
    if (intersectionHandle.rendNode) {
      intersectionHandle.rendNode.style.cursor = 'move';
    }
    
    if (intersectionLabel.rendNode) {
      intersectionLabel.rendNode.style.cursor = 'move';
      
      // ✅ GESTION DU DRAG AND DROP pour le label
      intersectionLabel.rendNode.addEventListener('pointerdown', function (ev) {
        ev.stopPropagation();
        ev.preventDefault();
        
        const start = board.getUsrCoordsOfMouse(ev);
        
        function onMove(e) {
          const pos = board.getUsrCoordsOfMouse(e);
          const dx = pos[0] - start[0];
          const dy = pos[1] - start[1];
          
          // Déplacer le handle (et donc le label qui le suit)
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
  
  // ✅ NOUVEAU : Stocker le handle pour nettoyage
  lengthHandles.push(intersectionHandle);
  
  console.log(`✅ Label d'intersection déplaçable créé: "${labelText}" à (${intersection.x.toFixed(2)}, ${intersection.y.toFixed(2)})`);
}

// ✅ FONCTION POUR CALCULER L'INTERSECTION DES DIAGONALES
function calculateDiagonalsIntersection() {
  if (!points || points.length !== 4) return null;
  
  // Points des diagonales
  const A = points[0]; // Diagonale 1: A → C
  const C = points[2];
  const B = points[1]; // Diagonale 2: B → D  
  const D = points[3];
  
  // Coordonnées
  const x1 = A.X(), y1 = A.Y(); // Point A
  const x2 = C.X(), y2 = C.Y(); // Point C
  const x3 = B.X(), y3 = B.Y(); // Point B
  const x4 = D.X(), y4 = D.Y(); // Point D
  
  // ✅ FORMULE D'INTERSECTION DE DEUX DROITES
  // Diagonale AC: (x1,y1) → (x2,y2)
  // Diagonale BD: (x3,y3) → (x4,y4)
  
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

function updateCodings() {
  // Supprimer les codages existants
  codingMarks.forEach(m => board.removeObject(m));
  codingMarks = [];

  if (!document.getElementById("toggleCodings").checked || !points || points.length < 3) {
    return;
  }

  const n = points.length;

  // ✅ SYSTÈME SIMPLE ET DIRECT
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
    const figureType = detectQuadrilateralType();
    
    if (figureType === 'square') {
      // CARRÉ : tous les côtés égaux
      for (let i = 0; i < 4; i++) {
        createSimpleCodingMark(points[i], points[(i + 1) % 4], 1);
      }
    } 
    else if (figureType === 'rectangle') {
      // RECTANGLE : côtés opposés égaux
      createSimpleCodingMark(points[0], points[1], 1); // AB
      createSimpleCodingMark(points[2], points[3], 1); // DC
      createSimpleCodingMark(points[1], points[2], 2); // BC
      createSimpleCodingMark(points[3], points[0], 2); // AD
    }
    else if (figureType === 'rhombus') {
      // LOSANGE : tous les côtés égaux
      for (let i = 0; i < 4; i++) {
        createSimpleCodingMark(points[i], points[(i + 1) % 4], 1);
      }
    }
    else if (figureType === 'parallelogram') {
      // PARALLÉLOGRAMME : côtés opposés égaux
      createSimpleCodingMark(points[0], points[1], 1); // AB
      createSimpleCodingMark(points[2], points[3], 1); // DC
      createSimpleCodingMark(points[1], points[2], 2); // BC
      createSimpleCodingMark(points[3], points[0], 2); // AD
    }
  }
  // ✅ NOUVEAU : CAS DES POLYGONES RÉGULIERS (n >= 5)
  else if (n >= 5) {
    // POLYGONES RÉGULIERS : vérifier si tous les côtés sont égaux
    const tolerance = 0.15; // Tolérance plus large pour les polygones complexes
    const sideLengths = [];
    
    // Calculer toutes les longueurs de côtés
    for (let i = 0; i < n; i++) {
      const pt1 = points[i];
      const pt2 = points[(i + 1) % n];
      const length = Math.hypot(pt2.X() - pt1.X(), pt2.Y() - pt1.Y());
      sideLengths.push(length);
    }
    
    // Vérifier si c'est un polygone régulier (tous les côtés égaux)
    const isRegular = sideLengths.every(len => Math.abs(len - sideLengths[0]) < tolerance);
    
    if (isRegular) {
      // POLYGONE RÉGULIER : tous les côtés égaux (1 trait sur chaque)
      console.log(`✅ Polygone régulier détecté (${n} côtés) - tous les côtés égaux`);
      for (let i = 0; i < n; i++) {
        createSimpleCodingMark(points[i], points[(i + 1) % n], 1);
      }
    } else {
      // POLYGONE IRRÉGULIER : pas de codage particulier
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

  // ✅ DÉTECTION DE L'ORIENTATION DU SEGMENT
  const segmentAngle = Math.atan2(dy, dx);
  const isHorizontal = Math.abs(Math.sin(segmentAngle)) < 0.2; // ~11°
  const isVertical = Math.abs(Math.cos(segmentAngle)) < 0.2;   // ~11°
  
  let finalX, finalY;

  if (isHorizontal || isVertical) {
    // ✅ CAS 1 : CÔTÉS HORIZONTAUX/VERTICAUX → Perpendiculaire + 30°
    const perpX = -dy / len;  // Direction perpendiculaire
    const perpY = dx / len;
    
    const angle30 = Math.PI / 6; // 30° en radians
    const cos30 = Math.cos(angle30);
    const sin30 = Math.sin(angle30);
    
    // Rotation de 30° de la perpendiculaire
    finalX = perpX * cos30 - perpY * sin30;
    finalY = perpX * sin30 + perpY * cos30;
    
  } else {
    // ✅ CAS 2 : CÔTÉS OBLIQUES → Codage STRICTEMENT PERPENDICULAIRE au segment
    finalX = -dy / len;  // Perpendiculaire X (rotation 90° du vecteur directeur)
    finalY = dx / len;   // Perpendiculaire Y (rotation 90° du vecteur directeur)
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


// ✅ FONCTION UNIVERSELLE POUR CRÉER UN MARQUEUR D'ANGLE DROIT
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
  
  // Vecteurs depuis le sommet vers les points adjacents
  const v1x = prevPoint.X() - vertex.X();
  const v1y = prevPoint.Y() - vertex.Y();
  const v2x = nextPoint.X() - vertex.X();
  const v2y = nextPoint.Y() - vertex.Y();
  
  // Normaliser les vecteurs
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
  
  // Créer le petit carré d'angle droit
  const cornerSize = Math.min(size, Math.min(len1, len2) * 0.3);
  
  // Points du petit carré
  const p1x = vertex.X() + u1x * cornerSize;
  const p1y = vertex.Y() + u1y * cornerSize;
  
  const p2x = vertex.X() + u2x * cornerSize;
  const p2y = vertex.Y() + u2y * cornerSize;
  
  const p3x = p1x + u2x * cornerSize;
  const p3y = p1y + u2y * cornerSize;
  
  // Créer les segments du petit carré
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

// 🔍 FONCTION DE DEBUG AVANCÉE
function debugRightAngles() {
  console.log('🔍 === DEBUG ANGLES DROITS ===');
  
  if (!points || points.length === 0) {
    console.log('❌ Aucun point dans la figure');
    return;
  }
  
  console.log(`📍 Figure avec ${points.length} points:`);
  points.forEach((p, i) => {
    console.log(`  [${i}] ${getLabel(i)}: (${p.X().toFixed(2)}, ${p.Y().toFixed(2)})`);
  });
  
  const figureType = getCurrentFigureType();
  console.log('🎯 Type détecté:', figureType);
  
  const handler = getCurrentFigureHandler();
  if (handler) {
    console.log(`🎯 Handler: ${handler.constructor.name}`);
    
    const rightAngles = handler.getRightAngles();
    console.log(`📐 Angles droits selon handler: [${rightAngles.join(', ')}]`);
    
    rightAngles.forEach(angleIndex => {
      const vertex = points[angleIndex];
      if (vertex) {
        console.log(`  → Angle ${angleIndex} (${getLabel(angleIndex)}): (${vertex.X().toFixed(2)}, ${vertex.Y().toFixed(2)})`);
      }
    });
    
    console.log(`⚡ Supporte un seul angle?: ${handler.shouldShowSingleRightAngle()}`);
  } else {
    console.log('❌ Aucun handler trouvé');
  }
  
  // État des checkboxes
  const rightAnglesCheckbox = document.getElementById('toggleRightAngles');
  const singleAngleCheckbox = document.getElementById('toggleSingleAngle');
  console.log('☑️ Angles droits activés:', rightAnglesCheckbox?.checked || false);
  console.log('☑️ Un seul angle activé:', singleAngleCheckbox?.checked || false);
  
  // Marqueurs existants
  console.log('🎨 Marqueurs actuels:', rightAngleMarkers.length);
}

// Rendre accessible depuis la console
window.debugRightAngles = debugRightAngles;

// Fonction pour créer le marqueur d'angle droit du triangle
function createTriangleRightAngleMarker(singleAngle = false) {
  const rightTriangleInfo = isRightTriangle();
  if (!rightTriangleInfo || !rightTriangleInfo.isRight) return;
  
  const rightAngleIndex = rightTriangleInfo.rightAngleIndex;
  const size = 0.3;
  
  // Créer le marqueur d'angle droit au bon sommet
  createSingleTriangleRightAngleMarker(rightAngleIndex, size);
}


// Fonction pour créer un marqueur d'angle droit de triangle
function createSingleTriangleRightAngleMarker(angleIndex, size) {
  const vertex = points[angleIndex];
  const prevPoint = points[(angleIndex - 1 + 3) % 3];
  const nextPoint = points[(angleIndex + 1) % 3];
  
  if (!vertex || !prevPoint || !nextPoint) return;
  
  // Vecteurs depuis le sommet vers les points adjacents
  const v1x = prevPoint.X() - vertex.X();
  const v1y = prevPoint.Y() - vertex.Y();
  const v2x = nextPoint.X() - vertex.X();
  const v2y = nextPoint.Y() - vertex.Y();
  
  // Normaliser les vecteurs
  const len1 = Math.hypot(v1x, v1y);
  const len2 = Math.hypot(v2x, v2y);
  
  if (len1 === 0 || len2 === 0) return;
  
  const u1x = v1x / len1;
  const u1y = v1y / len1;
  const u2x = v2x / len2;
  const u2y = v2y / len2;
  
  // Créer le petit carré d'angle droit
  const cornerSize = Math.min(size, Math.min(len1, len2) * 0.3);
  
  // Points du petit carré
  const p1x = vertex.X() + u1x * cornerSize;
  const p1y = vertex.Y() + u1y * cornerSize;
  
  const p2x = vertex.X() + u2x * cornerSize;
  const p2y = vertex.Y() + u2y * cornerSize;
  
  const p3x = p1x + u2x * cornerSize;
  const p3y = p1y + u2y * cornerSize;
  
  // Créer les segments du petit carré
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
  
  console.log(`✅ Angle droit créé au sommet ${angleIndex} du triangle rectangle`);
}

// Fonction pour ajouter les marqueurs d'angles égaux
function updateEqualAngleMarkers(visible) {
  // accepter event ou bool
  if (typeof visible === 'object' && visible !== null && 'target' in visible) visible = !!visible.target.checked;
  else visible = !!visible;

  // ⚠️ CORRECTION : Nettoyer SEULEMENT les angleMarkers, PAS les codingMarks
  angleMarkers.forEach(m => { try { board.removeObject(m); } catch (e) {} });
  angleMarkers = [];

  if (!visible || !points || points.length < 3) { 
    board.update(); 
    return; 
  }

  // éviter pour carré/rectangle (optionnel)
  const fig = typeof detectCurrentFigure === 'function' ? detectCurrentFigure() : '';
  if (fig === 'square' || fig === 'rectangle') { 
    board.update(); 
    return; 
  }

  // helper : test point in polygon (ray-casting)
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

  // calculer angles (stables)
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

  // détecter parallélogramme (angles opposés égaux)
  let isParallelogram = false;
  if (n === 4 && angles.every(a => a != null)) {
    const tol = 0.03;
    if (Math.abs(angles[0] - angles[2]) < tol && Math.abs(angles[1] - angles[3]) < tol) isParallelogram = true;
  }

  // détecter triangle isocèle et indices des angles égaux (si applicable)
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

  // grouper angles égaux (arrondi)
  const groups = {};
  for (let i = 0; i < n; i++) {
    const a = angles[i];
    if (a == null) continue;
    const key = (Math.round(a * 100) / 100).toFixed(2);
    (groups[key] = groups[key] || []).push(i);
  }

  const baseRadius = 0.42;

  // ✅ CRÉER UNE NOUVELLE VARIABLE SÉPARÉE POUR LES CODAGES D'ANGLES
  let angleCodeMarks = []; // Variable séparée pour les codages d'angles

  // dessine un petit tiret perpendiculaire (radial) centré sur l'arc,
  // avec possibilité de décalage latéral le long de la tangente pour faire des "//" parallèles
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
    angleCodeMarks.push(seg); // ✅ Ajouter aux codages d'angles, pas aux codages de côtés
  }

  // normaliser angle en [-PI,PI)
  function normAng(a) { while (a <= -Math.PI) a += 2*Math.PI; while (a > Math.PI) a -= 2*Math.PI; return a; }

  // parcourir groupes et dessiner arcs + codages
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

      // s'assurer de dessiner l'arc à l'intérieur du polygone
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
      
      // dessiner l'arc interne
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

      // codage : perpendiculaires au rayon
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

  // ✅ Ajouter les codages d'angles aux angleMarkers pour le nettoyage
  angleMarkers.push(...angleCodeMarks);

  board.update();
}

// Fonction pour ajouter les marqueurs d'angles égaux
function updateEqualAngleMarkers(visible) {
  // accepter event ou bool
  if (typeof visible === 'object' && visible !== null && 'target' in visible) visible = !!visible.target.checked;
  else visible = !!visible;

  // ⚠️ CORRECTION : Nettoyer SEULEMENT les angleMarkers, PAS les codingMarks
  angleMarkers.forEach(m => { try { board.removeObject(m); } catch (e) {} });
  angleMarkers = [];
  


  if (!visible || !points || points.length < 3) { 
    board.update(); 
    return; 
  }

  // éviter pour carré/rectangle (optionnel)
  const fig = typeof detectCurrentFigure === 'function' ? detectCurrentFigure() : '';
  if (fig === 'square' || fig === 'rectangle') { 
    board.update(); 
    return; 
  }

  // helper : test point in polygon (ray-casting)
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

  // calculer angles (stables)
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

  // détecter parallélogramme (angles opposés égaux)
  let isParallelogram = false;
  if (n === 4 && angles.every(a => a != null)) {
    const tol = 0.03;
    if (Math.abs(angles[0] - angles[2]) < tol && Math.abs(angles[1] - angles[3]) < tol) isParallelogram = true;
  }

  // détecter triangle isocèle et indices des angles égaux (si applicable)
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

  // grouper angles égaux (arrondi)
  const groups = {};
  for (let i = 0; i < n; i++) {
    const a = angles[i];
    if (a == null) continue;
    const key = (Math.round(a * 100) / 100).toFixed(2);
    (groups[key] = groups[key] || []).push(i);
  }

  const baseRadius = 0.42;

  // ✅ CRÉER UNE NOUVELLE VARIABLE SÉPARÉE POUR LES CODAGES D'ANGLES
  let angleCodeMarks = []; // Variable séparée pour les codages d'angles

  // dessine un petit tiret perpendiculaire (radial) centré sur l'arc,
  // avec possibilité de décalage latéral le long de la tangente pour faire des "//" parallèles
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
    angleCodeMarks.push(seg); // ✅ Ajouter aux codages d'angles, pas aux codages de côtés
  }

  // normaliser angle en [-PI,PI)
  function normAng(a) { while (a <= -Math.PI) a += 2*Math.PI; while (a > Math.PI) a -= 2*Math.PI; return a; }

  // parcourir groupes et dessiner arcs + codages
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

      // s'assurer de dessiner l'arc à l'intérieur du polygone
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
      
      // dessiner l'arc interne
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

      // codage : perpendiculaires au rayon
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

  // ✅ Ajouter les codages d'angles aux angleMarkers pour le nettoyage
  angleMarkers.push(...angleCodeMarks);

  board.update();
}


// Remplacement consolidé : détection et affichage des angles droits / égaux
function getRightAngleTriples() {
  if (!points || points.length < 3) return [];

  const rightTriples = [];
  const n = points.length;
  const REL_TOL = 5e-4;    // tolérance relative (ajustée)
  const ABS_MIN = 1e-6;

  for (let i = 0; i < n; i++) {
    const A = points[(i - 1 + n) % n];
    const B = points[i];
    const C = points[(i + 1) % n];
    if (!A || !B || !C) continue;

    const ax = A.X(), ay = A.Y();
    const bx = B.X(), by = B.Y();
    const cx = C.X(), cy = C.Y();

    const v1x = ax - bx, v1y = ay - by;
    const v2x = cx - bx, v2y = cy - by;
    const len1 = Math.hypot(v1x, v1y), len2 = Math.hypot(v2x, v2y);
    if (len1 === 0 || len2 === 0) continue;

    const dot = v1x * v2x + v1y * v2y;
    const tol = Math.max(ABS_MIN, REL_TOL * (len1 * len2));
    if (Math.abs(dot) <= tol) {
      rightTriples.push([A, B, C]);
    }
  }

  return rightTriples;
}


function drawAngleMark(vertex) {
  // Très simple : petit texte au-dessus du point
  return board.create('text', [vertex.X(), vertex.Y() + 0.5, '∠']);
}



// Fonction principale pour activer/désactiver l'effet main levée
function toggleHandDrawnEffect(enabled) {
  if (typeof enabled === 'object' && enabled !== null && 'target' in enabled) {
    enabled = !!enabled.target.checked;
  } else {
    enabled = !!enabled;
  }
  
  isHandDrawnMode = enabled;
  
  if (enabled) {
    applyHandDrawnEffect();
  } else {
    removeHandDrawnEffect();
  }
  
  board.update();
}

// Appliquer l'effet main levée
// Appliquer l'effet main levée
function applyHandDrawnEffect() {
  if (!points || points.length === 0) return;
  
  // Nettoyer les anciens éléments main levée
  removeHandDrawnElements();
  
  // ✅ CORRECTION : Cacher TOUS les éléments de la figure originale
  
  // 1. Cacher le polygone s'il existe
  if (polygon && !originalPolygon) {
    originalPolygon = polygon;
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

// Supprimer l'effet main levée
// Supprimer l'effet main levée
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
    
    polygon = originalPolygon;
    originalPolygon = null;
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

// Nettoyer les éléments main levée
function removeHandDrawnElements() {
  handDrawnElements.forEach(element => {
    try { board.removeObject(element); } catch (e) {}
  });
  handDrawnElements = [];
}

// Créer un polygone à main levée
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

// Créer un segment à main levée plus prononcé
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

// Créer un cercle à main levée plus prononcé
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

// Version encore plus réaliste avec plusieurs passes
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

function getBoardCenter() {
  // boundingbox: [xmin, ymax, xmax, ymin]
  const bb = board.getBoundingBox();
  const xmin = bb[0], ymax = bb[1], xmax = bb[2], ymin = bb[3];
  return [(xmin + xmax) / 2, (ymax + ymin) / 2];
}

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

function centerFigure() {
  const [figCx, figCy] = getFigureCenter();
  const [boardCx, boardCy] = getBoardCenter();
  const dx = boardCx - figCx;
  const dy = boardCy - figCy;
  if (Math.abs(dx) < 1e-9 && Math.abs(dy) < 1e-9) return;

  // Fonction helper pour déplacer un objet
  const moveObj = (o) => {
    if (!o) return;
    try { o.moveTo([o.X() + dx, o.Y() + dy], 0); } catch (e) {
      try { o.setPosition(JXG.COORDS_BY_USER, [o.X() + dx, o.Y() + dy]); } catch (ee) {}
    }
  };

  // 1. Déplacer les points principaux (sommets, gliders, centre du cercle)
  (points || []).forEach(moveObj);

  if (typeof centerPoint !== 'undefined' && centerPoint && !points.includes(centerPoint)) {
    moveObj(centerPoint);
  }
  if (typeof circlePoint !== 'undefined' && circlePoint && !points.includes(circlePoint)) {
    moveObj(circlePoint);
  }

  // 2. ✅ CORRECTION : Déplacer les handles des labels de mesures
  (lengthHandles || []).forEach(moveObj);

  // 3. Déplacer les handles des labels de points
  (labelHandles || []).forEach(moveObj);

  // 4. Déplacer les textes si possible
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
  (lengthLabels || []).forEach(moveText); // ✅ AJOUT : Déplacer aussi les labels de longueur

  // 5. Mise à jour finale
  updateCodings();
  updateDiagonals();
  updateLengthLabels();
  updateEqualAngleMarkers(document.getElementById("toggleEqualAngles")?.checked);
  updateRightAngleMarkers(document.getElementById("toggleRightAngles")?.checked);
  board.update();
}

// Fonction pour ajouter les angles droits
function updateRightAngleMarkers(visible) {
  // Accepter event ou bool
  if (typeof visible === 'object' && visible !== null && 'target' in visible) {
    visible = !!visible.target.checked;
  } else {
    visible = !!visible;
  }

  // Nettoyer les anciens marqueurs
  rightAngleMarkers.forEach(m => { 
    try { board.removeObject(m); } catch (e) {} 
  });
  rightAngleMarkers = [];

  // Gérer l'affichage du groupe "un seul angle"
  const singleAngleGroup = document.getElementById('singleAngleGroup');
  const singleAngleCheckbox = document.getElementById('toggleSingleAngle');

  if (!visible || !points || points.length < 3) {
    // Cacher l'option si pas d'angles droits à afficher
    if (singleAngleGroup) singleAngleGroup.style.display = 'none';
    if (singleAngleCheckbox) singleAngleCheckbox.checked = false;
    board.update(); 
    return; 
  }

  // ==========================================
  // ✅ UTILISER LE HANDLER POUR DÉTERMINER LES ANGLES DROITS
  // ==========================================
  
  const handler = getCurrentFigureHandler();
  
  if (!handler) {
    console.warn('⚠️ Pas de handler trouvé pour les angles droits');
    if (singleAngleGroup) singleAngleGroup.style.display = 'none';
    board.update();
    return;
  }
  
  const rightAngles = handler.getRightAngles();
  console.log(`🎯 Handler ${handler.constructor.name} → angles droits: [${rightAngles.join(', ')}]`);
  
  // ✅ Vérifier si cette figure supporte l'option "un seul angle"
  const supportsSingleAngle = handler.shouldShowSingleRightAngle();
  
  if (rightAngles.length > 0 && supportsSingleAngle) {
    // Afficher l'option "un seul angle" 
    if (singleAngleGroup) singleAngleGroup.style.display = 'block';
  } else {
    // Cacher l'option et décocher si nécessaire
    if (singleAngleGroup) singleAngleGroup.style.display = 'none';
    if (singleAngleCheckbox) singleAngleCheckbox.checked = false;
  }
  
  // ✅ Vérifier si on doit afficher un seul angle
  const showSingleAngle = singleAngleCheckbox && singleAngleCheckbox.checked;
  
  // ✅ Créer les marqueurs selon les spécifications du handler
  if (rightAngles.length > 0) {
    createRightAngleMarkersFromHandler(rightAngles, showSingleAngle, points.length);
  }
  
  board.update();

  // ==========================================
  // ✅ FONCTION POUR CRÉER LES MARQUEURS DEPUIS LE HANDLER
  // ==========================================
  
  function createRightAngleMarkersFromHandler(angleIndices, singleAngle, figureSize) {
    const size = 0.3;
    
    if (singleAngle && angleIndices.length > 1) {
      // Afficher seulement le premier angle de la liste
      createSingleRightAngleMarker(angleIndices[0], size, figureSize);
      console.log(`📐 Un seul angle droit affiché: index ${angleIndices[0]}`);
    } else {
      // Afficher tous les angles droits
      angleIndices.forEach(angleIndex => {
        createSingleRightAngleMarker(angleIndex, size, figureSize);
      });
      console.log(`📐 ${angleIndices.length} angles droits affichés`);
    }
  }
}

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

  // Reset des variables globales
  polygon = null;
  points = [];
  texts = [];
  rightAngleMarkers = [];
  lengthLabels = [];
  lengthHandles = [];
  lengthHandleMeta = [];
  codingMarks = [];
  codingSegments = [];
  diagonals = [];
  if (intersectionLabel) try { board.removeObject(intersectionLabel); } catch (e) {}
  if (intersectionPoint) try { board.removeObject(intersectionPoint); } catch (e) {}
  intersectionLabel = null;
  intersectionPoint = null;
  angleMarkers = [];
  centerPoint = null;
  circlePoint = null;
  circleObject = null;
  radiusSegment = null;
  radiusLabel = null;
  diameterSegment = null;
  diameterPoints = [];
  customLabels = [];

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
    customLabels = labelInput.split(/[,\s]+/).filter(label => label.length > 0);
    console.log(`🏷️ Labels personnalisés: [${customLabels.join(', ')}]`);
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
      // Triangle quelconque par défaut (avec base et hauteur)
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
      // ✅ CORRECTION : Essayer d'utiliser les suggestions disponibles
      const suggestionBox = document.getElementById('suggestionBox');
      const hasSuggestions = suggestionBox && suggestionBox.style.display === 'block';
      
      if (hasSuggestions) {
        // Utiliser la première suggestion automatiquement
        const firstSuggestion = suggestionBox.querySelector('.suggestion-item');
        if (firstSuggestion) {
          const suggestionText = firstSuggestion.textContent;
          document.getElementById("promptInput").value = suggestionText;
          console.log(`🔄 Auto-correction: "${input}" → "${suggestionText}"`);
          
          // Relancer la génération avec la suggestion
          setTimeout(() => generateFigure(), 100);
          return;
        }
      }
      
      // Sinon, message d'erreur standard
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
  // 4. ✅ FINALISATION AVEC SYSTÈME DE HANDLERS
  // ==========================================
  
  // Invalider le cache de détection
  invalidateFigureCache('new figure generated');
  
  // Recentrer la figure
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
  
  // Mise à jour intelligente : seulement ce qui est activé
  setTimeout(() => {
    autoInvalidateCache();
  }, 150);
  
  // Mise à jour finale du board
  board.update();
  
  console.log(`✅ Figure générée et optimisée avec le système de handlers`);
  
  // ==========================================
  // 5. FEEDBACK UTILISATEUR
  // ==========================================
  
  // Masquer les suggestions
  const suggestionBox = document.getElementById('suggestionBox');
  if (suggestionBox) {
    suggestionBox.style.display = 'none';
  }
  
  // Log de confirmation
  const figureType = getCurrentFigureType();
  if (figureType && figureType.type !== 'unknown') {
    console.log(`🎯 Type détecté: ${figureType.type} - ${figureType.subtype}`);
  }
}
// ==========================================
// 🔍 MONITORING DES PERFORMANCES
// ==========================================

/**
 * Mesure le temps d'exécution d'une fonction
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

/**
 * Version optimisée de getCurrentFigureHandler avec monitoring
 */
function getCurrentFigureHandlerOptimized() {
  return measurePerformance('getCurrentFigureHandler', () => {
    return getCurrentFigureHandler();
  });
}

// ✅ Utiliser dans les fonctions critiques si besoin de debug performance
// const handler = getCurrentFigureHandlerOptimized();
    
document.getElementById("promptInput").addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    generateFigure();
  }
});

    function extractNumber(text, defaultValue = 1) {
    const match = text.match(/(\d+(?:[.,]\d+)?)/);
    if (!match) return defaultValue;
    return parseFloat(match[1].replace(',', '.'));
    }
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

function addDraggingToPolygon(polygon, points, texts, handles = []) {
  let startCoords = null;

  polygon.rendNode.addEventListener('mousedown', function (e) {
    startCoords = board.getUsrCoordsOfMouse(e);

    function onMouseMove(ev) {
      const newCoords = board.getUsrCoordsOfMouse(ev);
      const dx = newCoords[0] - startCoords[0];
      const dy = newCoords[1] - startCoords[1];
      startCoords = newCoords;

      // 1. Déplacer les points principaux de la figure
      points.forEach(pt => {
        try { pt.moveTo([pt.X() + dx, pt.Y() + dy], 0); }
        catch (err) { try { pt.setPosition(JXG.COORDS_BY_USER, [pt.X() + dx, pt.Y() + dy]); } catch(e){} }
      });

      // 2. ✅ NOUVEAU : Déplacer les handles des labels de mesures
      if (lengthHandles && lengthHandles.length > 0) {
        lengthHandles.forEach(handle => {
          try { handle.moveTo([handle.X() + dx, handle.Y() + dy], 0); }
          catch (err) { try { handle.setPosition(JXG.COORDS_BY_USER, [handle.X() + dx, handle.Y() + dy]); } catch(e){} }
        });
      }

      // 3. ✅ NOUVEAU : Déplacer les handles des labels de points (si ils existent)
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

      // 5. Déplacer les textes (labels des points)
      texts.forEach(txt => {
        try {
          if (typeof txt.setPosition === 'function') {
            txt.setPosition(JXG.COORDS_BY_USER, [txt.X() + dx, txt.Y() + dy]);
          }
        } catch (err) { /* ignore */ }
      });

      // 6. ✅ IMPORTANT : Mettre à jour les codages qui dépendent de la position
      updateCodings();
      board.update();
    }

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      
      // ✅ NOUVEAU : Mise à jour complète après le déplacement
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

    //  LISTE DES DRAWS

    function drawSquare(size) {
      const A = board.create('point', [0, size], {name: '',fixed: true, visible: false});
      const B = board.create('point', [size, size], {name: '',fixed: true, visible: false});
      const C = board.create('point', [size, 0], {name: '',fixed: true, visible: false});
      const D = board.create('point', [0, 0], {name: '',fixed: true, visible: false});

      points = [A, B, C, D];
      polygon = board.create('polygon', points, {
        withLabel: false,
       
       
       
        borders: {strokeColor: "black",fixed: true },
        fillColor: "white",
        fillOpacity: 1
      });

        let labelA = board.create('text', [A.X() - 0.3, A.Y() + 0.2, getLabel(0)]); // HAUT-GAUCHE
        let labelB = board.create('text', [B.X() + 0.15, B.Y() + 0.2, getLabel(1)]); // HAUT-DROITE
        let labelC = board.create('text', [C.X() + 0.15, C.Y() - 0.2, getLabel(2)]); // BAS-DROITE
        let labelD = board.create('text', [D.X() - 0.3, D.Y() - 0.2, getLabel(3)]); // BAS-GAUCHE
        texts.push(labelA, labelB, labelC, labelD);


        points = [A, B, C, D];

        addDraggingToPolygon(polygon, points, texts);
        updateRightAngleMarkers(document.getElementById("toggleRightAngles").checked);
        updateLengthLabels();
        updateCodings();
        updateDiagonals();
        
    }

function drawLosange(side) {
  const theta = Math.PI / 3;           // 60°
  const ox = side * Math.cos(theta);   // projection horizontale du côté oblique
  const oy = side * Math.sin(theta);   // hauteur

  // AJOUT : Rotation de 30° vers la droite (π/6 radians)
  const rotationAngle = Math.PI / 6;   // 30° en radians
  
  // Fonction helper pour appliquer la rotation
  function rotate(x, y) {
    const cos = Math.cos(rotationAngle);
    const sin = Math.sin(rotationAngle);
    return [x * cos - y * sin, x * sin + y * cos];
  }

  // Créer les points de base puis les faire tourner
  const baseA = [-ox, oy];       // HAUT-GAUCHE original
  const baseB = [side - ox, oy]; // HAUT-DROITE original
  const baseC = [side, 0];       // BAS-DROITE original
  const baseD = [0, 0];          // BAS-GAUCHE original

  // Appliquer la rotation de 30°
  const [rotA_x, rotA_y] = rotate(baseA[0], baseA[1]);
  const [rotB_x, rotB_y] = rotate(baseB[0], baseB[1]);
  const [rotC_x, rotC_y] = rotate(baseC[0], baseC[1]);
  const [rotD_x, rotD_y] = rotate(baseD[0], baseD[1]);

  const A = board.create('point', [rotA_x, rotA_y], { visible: false, fixed: true }); // HAUT-GAUCHE tourné
  const B = board.create('point', [rotB_x, rotB_y], { visible: false, fixed: true }); // HAUT-DROITE tourné
  const C = board.create('point', [rotC_x, rotC_y], { visible: false, fixed: true }); // BAS-DROITE tourné
  const D = board.create('point', [rotD_x, rotD_y], { visible: false, fixed: true }); // BAS-GAUCHE tourné

  points = [A, B, C, D];
  polygon = board.create('polygon', points, {
    borders: { strokeColor: 'black', fixed: true },
    fillColor: 'white',
    fillOpacity: 1
  });

  // Labels avec positions ajustées pour la rotation
  const LA = board.create('text', [A.X() - 0.4, A.Y() , getLabel(0)]); // HAUT-GAUCHE
  const LB = board.create('text', [B.X() - 0.1, B.Y() + 0.3, getLabel(1)]); // HAUT-DROITE
  const LC = board.create('text', [C.X() + 0.25, C.Y() , getLabel(2)]); // BAS-DROITE
  const LD = board.create('text', [D.X() - 0.1, D.Y() - 0.3, getLabel(3)]); // BAS-GAUCHE
  texts.push(LA, LB, LC, LD);

  addDraggingToPolygon(polygon, points, texts);
}

function drawRectangle(width, height) {
  // ✅ CORRECTION : Points dans l'ordre horaire depuis le haut-gauche
  // A (haut-gauche), B (haut-droite), C (bas-droite), D (bas-gauche)
  const A = board.create('point', [0, height], { name: '', fixed: true, visible: false }); // HAUT-GAUCHE
  const B = board.create('point', [width, height], { name: '', fixed: true, visible: false }); // HAUT-DROITE
  const C = board.create('point', [width, 0], { name: '', fixed: true, visible: false }); // BAS-DROITE
  const D = board.create('point', [0, 0], { name: '', fixed: true, visible: false }); // BAS-GAUCHE

  points = [A, B, C, D]; // A=0, B=1, C=2, D=3 dans l'ordre horaire
  
  console.log('Rectangle créé - Points dans l\'ordre horaire:', 
    'A(0,' + height + ')', 
    'B(' + width + ',' + height + ')', 
    'C(' + width + ',0)', 
    'D(0,0)'); // Debug

  polygon = board.create('polygon', points, {
    borders: {
      strokeColor: "black",
      fixed: true
    },
    fillColor: "white",
    fillOpacity: 1
  });

  // ✅ LABELS REPOSITIONNÉS SELON LE NOUVEL ORDRE
  let labelA = board.create('text', [A.X() - 0.3, A.Y() + 0.2, getLabel(0)]); // HAUT-GAUCHE
  let labelB = board.create('text', [B.X() + 0.15, B.Y() + 0.2, getLabel(1)]); // HAUT-DROITE
  let labelC = board.create('text', [C.X() + 0.15, C.Y() - 0.2, getLabel(2)]); // BAS-DROITE
  let labelD = board.create('text', [D.X() - 0.3, D.Y() - 0.2, getLabel(3)]); // BAS-GAUCHE
  texts.push(labelA, labelB, labelC, labelD);

  addDraggingToPolygon(polygon, points, texts);
  updateCodings();
  updateDiagonals();
  updateLengthLabels();
  updateRightAngleMarkers(document.getElementById("toggleRightAngles").checked);
}

// ✅ NOUVELLE VERSION utilisant le détecteur centralisé
function detectQuadrilateralType() {
  const figureInfo = getCurrentFigureType();
  
  if (figureInfo.type === 'quadrilateral') {
    console.log(`🎯 Détection centralisée: ${figureInfo.subtype}`);
    return figureInfo.subtype; // 'square', 'rectangle', 'rhombus', 'parallelogram', 'irregular'
  }
  
  return 'unknown';
}

function updateLengthLabels() {
  // ==========================================
  // 1. NETTOYAGE DES ANCIENS ÉLÉMENTS
  // ==========================================
  
  // Sauvegarder les positions des handles déplacés manuellement
  const savedPositions = [];
  for (let i = 0; i < (points ? points.length : 0); i++) {
    savedPositions[i] = null;
  }

  // Sauvegarder les positions des handles déplacés avec leurs vrais index
  lengthHandleMeta.forEach(meta => {
    if (meta && meta.handle && !meta.handle._auto && meta.sideIndex !== undefined) {
      savedPositions[meta.sideIndex] = { 
        x: meta.handle.X(), 
        y: meta.handle.Y() 
      };
    }
  });

  // Supprimer tous les anciens éléments
  lengthLabels.forEach(label => { try { board.removeObject(label); } catch (e) {} });
  lengthHandles.forEach(handle => { try { board.removeObject(handle); } catch (e) {} });
  
  // Reset des arrays
  lengthLabels = [];
  lengthHandles = [];
  lengthHandleMeta = [];

  // ==========================================
  // 2. VÉRIFICATIONS PRÉLIMINAIRES
  // ==========================================
  
  const showLengths = document.getElementById("toggleLengths")?.checked;
  if (!showLengths || !points || points.length === 0) {
    console.log('❌ Mesures désactivées ou pas de points');
    return;
  }

  console.log(`🔍 Affichage des mesures pour ${points.length} points`);

  // ==========================================
  // 3. GESTION DES OPTIONS
  // ==========================================
  
  const showUnits = document.getElementById("showUnitsCheckbox")?.checked;
  const unit = document.getElementById("unitSelector")?.value || 'cm';
  
  // OPTION HYPOTÉNUSE (triangles rectangles uniquement)
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

  // ==========================================
  // 4. UTILISER LES HANDLERS POUR DÉTERMINER LES CÔTÉS
  // ==========================================
  
  function getSidesToShow() {
    const handler = getCurrentFigureHandler();
    
    if (!handler) {
      console.warn('⚠️ Pas de handler trouvé, affichage de tous les côtés');
      return [...Array(points.length).keys()];
    }
    
    let sidesToShow = handler.getSidesToShow();
    
    // Filtrer l'hypoténuse si nécessaire
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

  // ==========================================
  // 5. FONCTIONS UTILITAIRES
  // ==========================================
  
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
    
    // ==========================================
    // CALCUL DE LA POSITION INTELLIGENTE
    // ==========================================
    
    let startX, startY;
    
    if (savedPositions[sideIndex] && savedPositions[sideIndex] !== null) {
      // Position sauvegardée (déplacée manuellement)
      startX = savedPositions[sideIndex].x;
      startY = savedPositions[sideIndex].y;
    } else {
      // ✅ NOUVEAU : Position par défaut avec règle pour quadrilatères
      const dx = pt2.X() - pt1.X();
      const dy = pt2.Y() - pt1.Y();
      const len = Math.hypot(dx, dy) || 1;
      
      // Point milieu du segment
      const midX = (pt1.X() + pt2.X()) / 2;
      const midY = (pt1.Y() + pt2.Y()) / 2;
      
      // ✅ DÉTECTION DU TYPE DE FIGURE
      const figureType = getCurrentFigureType();
      const isQuadrilateral = figureType && figureType.type === 'quadrilateral';
      
      let offsetX, offsetY;
      
      if (isQuadrilateral) {
        // ✅ RÈGLE POUR QUADRILATÈRES : Placer à l'EXTÉRIEUR
        
        // Calculer le centre de la figure pour déterminer la direction "extérieure"
        const figureCenter = getFigureCenter();
        const centerX = figureCenter[0];
        const centerY = figureCenter[1];
        
        // Vecteur perpendiculaire au segment (2 directions possibles)
        const perpX = -dy / len;
        const perpY = dx / len;
        
        // Vecteur du centre vers le milieu du segment
        const toCenterX = midX - centerX;
        const toCenterY = midY - centerY;
        
        // Choisir la direction perpendiculaire qui s'ÉLOIGNE du centre
        const dotProduct = toCenterX * perpX + toCenterY * perpY;
        const direction = dotProduct > 0 ? 1 : -1; // 1 = s'éloigner, -1 = se rapprocher
        
        // Appliquer le décalage vers l'EXTÉRIEUR
        const offset = 0.5; // Distance du segment
        offsetX = direction * perpX * offset;
        offsetY = direction * perpY * offset;
        
        console.log(`📐 Quadrilatère détecté : label ${sideIndex} placé à l'EXTÉRIEUR (direction: ${direction > 0 ? 'vers ext.' : 'vers int. (corrigé)'})`);
        
      } else {
        // ✅ RÈGLE POUR AUTRES FIGURES (triangles, polygones) : Position intelligente
        
        const offset = -0.4;
        offsetX = -offset * (dy / len);
        offsetY = offset * (dx / len);
        
        // Ajustement spécial pour segments horizontaux (vers le bas)
        if (Math.abs(dy) < 0.1) {
          offsetY += 0.2;
        }
        
        console.log(`📐 Figure non-quadrilatère : placement standard pour côté ${sideIndex}`);
      }
      
      // Position finale
      startX = midX + offsetX;
      startY = midY + offsetY;
    }

    // ==========================================
    // CRÉATION DU HANDLE ET DU LABEL
    // ==========================================

    // Handle invisible déplaçable
    const handle = board.create('point', [startX, startY], {
      size: 6,
      strokeOpacity: 0,
      fillOpacity: 0,
      fixed: false,
      name: '',
      highlight: false,
      showInfobox: false
    });
    
    // Marquer si c'est une position automatique ou manuelle
    handle._auto = (savedPositions[sideIndex] === null);

    try { 
      if (handle.rendNode) handle.rendNode.style.cursor = 'move'; 
    } catch (e) {}

    // Label qui suit le handle
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

    // Rendre le label déplaçable
    makeLabelDraggable(label, handle);

    // Stocker les éléments
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
          
          handle._auto = false; // Marquer comme déplacé manuellement
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

  // ==========================================
  // 6. UTILISER LE HANDLER POUR CRÉER LES LABELS
  // ==========================================
  
  const sidesToShow = getSidesToShow();
  
  console.log(`🔍 Côtés à afficher: [${sidesToShow.join(', ')}]`);
  
  sidesToShow.forEach(sideIndex => {
    createLengthLabel(sideIndex);
  });

  console.log(`✅ ${lengthLabels.length} labels de longueur créés au total`);
  
  // Mise à jour du board
  board.update();
}



function drawCircle(radius) {
  // cleanup if déjà présents
  if (centerPoint) try { board.removeObject(centerPoint); } catch (e) {}
  if (circlePoint) try { board.removeObject(circlePoint); } catch (e) {}
  if (circleObject) try { board.removeObject(circleObject); } catch (e) {}
  // remove previous label handles/texts if any
  if (labelHandles && labelHandles.length) {
    labelHandles.forEach(h => { try { board.removeObject(h); } catch (e) {} });
    labelHandles = [];
  }
  if (labelTexts && labelTexts.length) {
    labelTexts.forEach(t => { try { board.removeObject(t); } catch (e) {} });
    labelTexts = [];
  }

  // créer le centre (sans label natif)
  centerPoint = board.create('point', [0, 0], {
    name: '',
    showInfobox: false,
    fixed: false,
    size: 4,
    face: 'x',
    strokeColor: 'black',
    fillColor: 'black'
  });

  // cercle
  circleObject = board.create('circle', [centerPoint, radius], {
    strokeWidth: 2,
    strokeColor: 'black'
  });

  // point A sur le cercle (glider) sans label natif
  circlePoint = board.create('glider', [radius, 0, circleObject], {
    name: '',
    showInfobox: false,
    size: 3,
    strokeColor: 'black',
    fillColor: 'black'
  });

  points = [circlePoint];

  
  // Récupérer les labels du centre et du point sur le cercle
  let centerLabel = 'O';  // par défaut
  let pointLabel = 'A';   // par défaut
  
  if (customLabels && customLabels.length > 0) {
    centerLabel = customLabels[0] || 'O';  // Premier label = centre
    pointLabel = customLabels[1] || 'A';   // Deuxième label = point sur cercle
  }
  
  // Label du centre qui suit automatiquement centerPoint
  const labelCenter = board.create('text', [
    () => centerPoint.X() - 0.1,  // Position relative automatique
    () => centerPoint.Y() + 0.2,
    centerLabel  // ← Utilise le label personnalisé
  ], {
    anchorX: 'middle',
    anchorY: 'bottom',
    fontSize: 16,
    fixed: true,  // Le texte suit automatiquement le point
    name: ''
  });

  // Label du point sur cercle qui suit automatiquement circlePoint  
  const labelPoint = board.create('text', [
    () => circlePoint.X() + 0.3,   // Position relative automatique
    () => circlePoint.Y(),
    pointLabel  // ← Utilise le label personnalisé
  ], {
    anchorX: 'middle',
    anchorY: 'bottom',
    fontSize: 16,
    fixed: true,  // Le texte suit automatiquement le point
    name: ''
  });

  // AJOUT : Permettre le déplacement du cercle entier
  // Ajouter un event listener sur le centerPoint pour déplacer tout le cercle
  centerPoint.on('drag', function() {
    // Le cercle se déplace automatiquement car il est lié au centerPoint
    // Le circlePoint (glider) reste sur le cercle automatiquement
    // Les labels suivent automatiquement grâce aux fonctions flèches
    board.update();
  });

  // Stocker les labels (mais plus besoin de handles séparés)
  labelTexts.push(labelCenter, labelPoint);
  texts.push(labelCenter, labelPoint);

  board.update();

  // MAJ initiale des extras si nécessaire
  updateCircleExtras();
}

/**
 * Dessine un triangle quelconque connaissant les trois côtés
 * @param {number} a - Longueur du premier côté
 * @param {number} b - Longueur du deuxième côté
 * @param {number} c - Longueur du troisième côté
 */
function drawScaleneTriangleFromSides(a, b, c) {
  // Vérification de l'inégalité triangulaire
  if (a + b <= c || a + c <= b || b + c <= a) {
    alert(`⚠️ Impossible de construire un triangle avec ces côtés !\n\n` +
          `Vérification de l'inégalité triangulaire :\n` +
          `• ${a} + ${b} = ${a + b} ${a + b > c ? '>' : '≤'} ${c}\n` +
          `• ${a} + ${c} = ${a + c} ${a + c > b ? '>' : '≤'} ${b}\n` +
          `• ${b} + ${c} = ${b + c} ${b + c > a ? '>' : '≤'} ${a}\n\n` +
          `Pour former un triangle, la somme de deux côtés doit être strictement supérieure au troisième.`);
    console.error(`❌ Triangle invalide : a=${a}, b=${b}, c=${c} ne respectent pas l'inégalité triangulaire`);
    return;
  }

  // Placement des points :
  // A à l'origine
  // B sur l'axe X à distance a de A
  // C calculé avec la loi des cosinus
  
  // Loi des cosinus pour trouver l'angle en A : cos(A) = (b² + c² - a²) / (2bc)
  const cosA = (b * b + c * c - a * a) / (2 * b * c);
  const angleA = Math.acos(cosA);
  
  // Position de C : à distance b de A et angle angleA par rapport à l'axe X
  const Cx = b * Math.cos(angleA);
  const Cy = b * Math.sin(angleA);
  
  // Centrage de la figure
  const centerX = a / 2;
  const centerY = Cy / 2;
  
  // Création des points avec centrage
  const A = board.create('point', [-centerX, -centerY], {visible: false, fixed: true});
  const B = board.create('point', [a - centerX, -centerY], {visible: false, fixed: true});
  const C = board.create('point', [Cx - centerX, Cy - centerY], {visible: false, fixed: true});

  points = [A, B, C];
  polygon = board.create('polygon', points, {
    borders: {strokeColor: "black", fixed: true},
    fillColor: "white",
    fillOpacity: 1
  });

  // Labels des sommets
  const labelA = board.create('text', [A.X(), A.Y() - 0.3, getLabel(0)]);
  const labelB = board.create('text', [B.X(), B.Y() - 0.3, getLabel(1)]);
  const labelC = board.create('text', [C.X(), C.Y() + 0.3, getLabel(2)]);
  texts.push(labelA, labelB, labelC);

  addDraggingToPolygon(polygon, points, texts);
  
  // Mise à jour des labels de longueur si la checkbox est cochée
  updateLengthLabels(document.getElementById("toggleLengths").checked);
  
  console.log(`→ Triangle quelconque généré avec côtés a=${a}, b=${b}, c=${c}`);
}


function drawRightTriangle(base, height) {
const offsetX = -base / 2;
const offsetY = -height / 2;

const A = board.create('point', [offsetX, offsetY], {visible: false, fixed: true});
const B = board.create('point', [offsetX + base, offsetY], {visible: false, fixed: true});
const C = board.create('point', [offsetX, offsetY + height], {visible:false, fixed: true});

  points = [A, B, C];
  polygon = board.create('polygon', points, {
    borders: {strokeColor: "black",fixed: true},
    fillColor: "white",
    fillOpacity: 1
  });

  const labelA = board.create('text', [A.X(), A.Y() - 0.3, getLabel(0)]); // ✅ Utilise getLabel()
  const labelB = board.create('text', [B.X(), B.Y() - 0.3, getLabel(1)]); // ✅ Utilise getLabel()
  const labelC = board.create('text', [C.X(), C.Y() + 0.3, getLabel(2)]); // ✅ Utilise getLabel()
  texts.push(labelA, labelB, labelC);

  addDraggingToPolygon(polygon, points, texts);
  updateRightAngleMarkers(document.getElementById("toggleRightAngles").checked);
  console.log("→ Triangle rectangle généré avec base =", base, "et hauteur =", height);
}

// Fonction pour détecter si c'est un triangle rectangle
function isRightTriangle() {
  if (!points || points.length !== 3) return false;
  
  const tolerance = 0.1;
  
  // Vérifier chaque angle pour voir si l'un est proche de 90°
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
      
      // Si l'angle est proche de 90° (π/2)
      if (Math.abs(angle - Math.PI/2) < tolerance) {
        return { isRight: true, rightAngleIndex: i };
      }
    }
  }
  
  return { isRight: false, rightAngleIndex: -1 };
}

// Fonction pour identifier l'hypoténuse (le côté le plus long)
function getHypotenuseIndex() {
  if (!points || points.length !== 3) return -1;
  
  const sideLengths = [];
  
  for (let i = 0; i < 3; i++) {
    const pt1 = points[i];
    const pt2 = points[(i + 1) % 3];
    const length = Math.hypot(pt2.X() - pt1.X(), pt2.Y() - pt1.Y());
    sideLengths.push({ index: i, length });
  }
  
  // Trouver le côté le plus long (hypoténuse)
  const longestSide = sideLengths.reduce((max, side) => 
    side.length > max.length ? side : max
  );
  
  return longestSide.index;
}

function drawIsoscelesTriangle(base = 4, height = 3) {
  // position : base sur l'axe des abscisses, sommet au milieu
  const A = board.create('point', [0, 0], {visible: false, fixed: true});
  const B = board.create('point', [base, 0], {visible: false, fixed: true});
  const C = board.create('point', [base / 2, height], {visible: false, fixed: true});

  points = [A, B, C];
  polygon = board.create('polygon', points, {
    borders: { strokeColor: 'black' },
    fillColor: 'white',
    fillOpacity: 1
  });

  const labelA = board.create('text', [A.X(), A.Y() - 0.3, getLabel(0)]);
  const labelB = board.create('text', [B.X(), B.Y() - 0.3, getLabel(1)]);
  const labelC = board.create('text', [C.X(), C.Y() + 0.3, getLabel(2)]);
  texts.push(labelA, labelB, labelC);

  addDraggingToPolygon(polygon, points, texts);

  // Mettre à jour les marqueurs/labels pertinents
  updateEqualAngleMarkers(document.getElementById("toggleEqualAngles")?.checked);
  updateRightAngleMarkers(document.getElementById("toggleRightAngles")?.checked);
  updateLengthLabels();
  updateCodings();
  updateDiagonals();
}


function drawParallelogram(base, sideLength) {
  const theta = Math.PI / 3; // 60°
  const offset = sideLength * Math.cos(theta); // projection horizontale du côté oblique
  const height = sideLength * Math.sin(theta); // hauteur géométrique pour le calcul

  // CORRECTION : Créer les points dans l'ordre horaire correct
  // A = haut-gauche, B = haut-droite, C = bas-droite, D = bas-gauche
  const A = board.create('point', [-offset, height], { visible: false, fixed: true }); // HAUT-GAUCHE
  const B = board.create('point', [base - offset, height], { visible: false, fixed: true }); // HAUT-DROITE
  const C = board.create('point', [base, 0], { visible: false, fixed: true }); // BAS-DROITE
  const D = board.create('point', [0, 0], { visible: false, fixed: true }); // BAS-GAUCHE

  points = [A, B, C, D]; // Ordre horaire : A→B→C→D

  polygon = board.create('polygon', points, {
    borders: { strokeColor: "black" },
    fillColor: "white",
    fillOpacity: 1
  });

  // CORRECTION : labels positionnés selon leur position réelle
  const labelA = board.create('text', [A.X() - 0.3, A.Y() + 0.3, getLabel(0)], {fontSize: 14}); // HAUT-GAUCHE
  const labelB = board.create('text', [B.X() + 0.3, B.Y() + 0.3, getLabel(1)], {fontSize: 14}); // HAUT-DROITE
  const labelC = board.create('text', [C.X() + 0.3, C.Y() - 0.3, getLabel(2)], {fontSize: 14}); // BAS-DROITE
  const labelD = board.create('text', [D.X() - 0.3, D.Y() - 0.3, getLabel(3)], {fontSize: 14}); // BAS-GAUCHE
  
  texts.push(labelA, labelB, labelC, labelD);

  addDraggingToPolygon(polygon, points, texts);

  updateDiagonals();
  updateCodings();
  updateLengthLabels();
  updateRightAngleMarkers(document.getElementById("toggleRightAngles").checked);

  // ✅ AJOUT : Log pour vérifier les dimensions
  console.log(`Parallélogramme créé:
  - Base AD = ${base}
  - Côté oblique AB/DC = ${sideLength} 
  - Hauteur géométrique = ${height.toFixed(2)}`);
}

function drawRegularPolygon(n, side) {
  const center = [0, 0];
  const angle = (2 * Math.PI) / n;
  // CORRECTION : formule simplifiée pour avoir la bonne taille
  const radius = side / (2 * Math.sin(Math.PI / n));

  points = [];
  // CORRECTION : commencer à -π/2 pour avoir un sommet en haut
  for (let i = 0; i < n; i++) {
    const x = center[0] + radius * Math.cos(i * angle - Math.PI / 2);
    const y = center[1] + radius * Math.sin(i * angle - Math.PI / 2);
    points.push(board.create('point', [x, y], {visible: false, fixed: true}));
  }

  polygon = board.create('polygon', points, {
    borders: {strokeColor: "black", fixed: true},
    fillColor: "white",
    fillOpacity: 1
  });

  // CORRECTION : utiliser getLabel() pour cohérence avec les autres figures
  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    const label = board.create('text', [pt.X() + 0.2, pt.Y() + 0.2, getLabel(i)]);
    texts.push(label);
  }

  addDraggingToPolygon(polygon, points, texts);
}



function drawEquilateralTriangle(side) {
  const A = board.create('point', [0, 0], {visible: false});
  const B = board.create('point', [side, 0], {visible: false});
  const height = (Math.sqrt(3) / 2) * side;
  const C = board.create('point', [side / 2, height], {visible: false});

  points = [A, B, C];
  polygon = board.create('polygon', points, {
    borders: {strokeColor: "black"},
    fillColor: "white",
    fillOpacity: 1
  });

  // Utilise getLabel() pour les noms personnalisés
  const labelA = board.create('text', [A.X(), A.Y() - 0.3, getLabel(0)]);
  const labelB = board.create('text', [B.X(), B.Y() - 0.3, getLabel(1)]);
  const labelC = board.create('text', [C.X(), C.Y() + 0.3, getLabel(2)]);
  texts.push(labelA, labelB, labelC);

  updateEqualAngleMarkers(document.getElementById("toggleEqualAngles")?.checked);
  addDraggingToPolygon(polygon, points, texts);
}
    

//ROTATION
function rotateCoord(x, y, cx, cy, angle) {
  const cos = Math.cos(angle), sin = Math.sin(angle);
  const dx = x - cx, dy = y - cy;
  return [cx + dx * cos - dy * sin, cy + dx * sin + dy * cos];
}

function rotateFigure(step = Math.PI / 18) {
  // Cas 1 : cercle (centerPoint + circlePoint)
  if (centerPoint && circlePoint) {
    const cx = centerPoint.X(), cy = centerPoint.Y();
    const [nx, ny] = rotateCoord(circlePoint.X(), circlePoint.Y(), cx, cy, step);
    circlePoint.moveTo([nx, ny], 0);

    // MAJ des extras (rayon/diamètre/codages)
    updateCircleExtras();
    board.update();
    return;
  }

  // Cas 2 : polygone / n’importe quel ensemble de points
  if (!points || points.length === 0) return;

  // Centroïde (moyenne simple des sommets)
  let cx = 0, cy = 0;
  for (const p of points) { cx += p.X(); cy += p.Y(); }
  cx /= points.length; cy /= points.length;

  // Rotation de tous les points autour du centroïde
  for (const p of points) {
    const [nx, ny] = rotateCoord(p.X(), p.Y(), cx, cy, step);
    p.moveTo([nx, ny], 0);
  }

  // Replacer rapidement les étiquettes près des points (si tu en as)
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

function rotateFigureLeft(step = Math.PI / 18) {
  // appelle rotateFigure avec signe négatif pour tourner à gauche
  rotateFigure(-Math.abs(step));
}
    function zoomIn() {
      board.zoomIn();
    }

    function zoomOut() {
      board.zoomOut();
    }
function resetBoard() {
  // Supprime complètement l'ancien board
  JXG.JSXGraph.freeBoard(board);

  // En recrée un tout neuf
  board = JXG.JSXGraph.initBoard('jxgbox', {
    boundingbox: [-5, 5, 5, -5],
    axis: false,
    showCopyright: false,
    showNavigation: false,
    keepaspectratio: true,
    zoom: { enabled: false }
  });

createBoardControls();

  // ✅ AJOUT : Reset de l'effet main levée
  isHandDrawnMode = false;
  originalPolygon = null;
  removeHandDrawnElements();
  
  // Décocher la checkbox main levée
  const handDrawnCheckbox = document.getElementById('toggleHandDrawn');
  if (handDrawnCheckbox) {
    handDrawnCheckbox.checked = false;
  }

  // AJOUT : Décocher toutes les options d'affichage
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
  
  // Masquer le groupe des unités (puisque toggleLengths est décoché)
  const unitGroup = document.getElementById('unitGroup');
  if (unitGroup) {
    unitGroup.style.display = 'none';
  }




  // Remet à zéro tous les tableaux liés aux éléments
  points = [];
  polygon = null;
  texts = [];
  rightAngleMarkers = [];
  angleMarkers.forEach(marker => board.removeObject(marker));
  angleMarkers = [];
  lengthLabels = [];
  codingMarks = [];
  codingSegments = [];
  diagonals = [];
  diameterSegment = null;
  diameterPoints = [];
  centerPoint = null;
  circlePoint = null;
  circleObject = null;
  radiusSegment = null;
  radiusLabel = null;
  radiusLabelAnchor = null;
  extraElements = [];
  r = null;
  intersectionLabel = null;
  intersectionPoint = null;
}

function enableDrag() {
  if (points.length === 0) return;

  // Supprimer ancien handle s’il existe
  if (window.dragHandle) {
    board.removeObject(dragHandle);
  }

}

// Suggestions
const input = document.getElementById("promptInput");
const suggestionsDiv = document.getElementById("suggestionBox");

const suggestionsList = [
  "carré de côté 4",
  "rectangle de 5 sur 3",
  "triangle équilatéral de côté 4",
  "triangle rectangle de base 3 et hauteur 4",
  "triangle isocèle de base 6 et hauteur 4",
  "triangle côtés 3, 4, 5",
  "triangle de côtés 5, 6, 7",
  "triangle quelconque 4, 5, 6",
  "cercle de rayon 2",
  "losange de côté 5",
  "parallélogramme 5 x 3",
  "hexagone de côté 4",
  "pentagone de côté 4",
  "octogone de côté 4"
];

// Affichage dynamique des suggestions
let selectedSuggestionIndex = -1;

input.addEventListener("input", function () {
  const value = this.value.toLowerCase();
  suggestionsDiv.innerHTML = "";
  selectedSuggestionIndex = -1;

  if (!value) {
    suggestionsDiv.style.display = "none";
    return;
  }

  const matches = suggestionsList.filter(s => s.includes(value)).slice(0, 5);
  if (matches.length === 0) {
    suggestionsDiv.style.display = "none";
    return;
  }

  suggestionsDiv.style.display = "block";
  suggestionsDiv.innerHTML = matches
    .map((s, i) => `<div class="suggestion-item" data-index="${i}" style="padding:5px; cursor:pointer;">${s}</div>`)
    .join("");

  const items = suggestionsDiv.querySelectorAll(".suggestion-item");

  items.forEach((item) => {
    item.addEventListener("mouseover", () => {
      items.forEach(i => i.style.background = "white");
      item.style.background = "#f0f0f0";
      selectedSuggestionIndex = parseInt(item.dataset.index);
    });

    item.addEventListener("click", () => {
      input.value = item.textContent;
      suggestionsDiv.style.display = "none";
      generateFigure();
    });
  });
});

input.addEventListener("keydown", function (e) {
  const items = suggestionsDiv.querySelectorAll(".suggestion-item");

  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (items.length > 0) {
      selectedSuggestionIndex = (selectedSuggestionIndex + 1) % items.length;
      highlightSuggestion(items);
    }
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (items.length > 0) {
      selectedSuggestionIndex = (selectedSuggestionIndex - 1 + items.length) % items.length;
      highlightSuggestion(items);
    }
  } else if (e.key === "Tab") {
    // AJOUT : Autocomplétion avec Tab (sans générer)
    if (suggestionsDiv.style.display === "block" && items.length > 0) {
      e.preventDefault(); // Empêcher le Tab normal temporairement
      
      let suggestionToUse = null;
      
      // Si une suggestion est sélectionnée (navigation avec flèches) -> l'utiliser
      if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < items.length) {
        suggestionToUse = items[selectedSuggestionIndex].textContent;
      } 
      // Sinon, prendre automatiquement la PREMIÈRE suggestion visible
      else {
        suggestionToUse = items[0].textContent;
      }
      
      // Appliquer la suggestion sélectionnée
      if (suggestionToUse) {
        input.value = suggestionToUse;
        suggestionsDiv.style.display = "none";
        selectedSuggestionIndex = -1; // Reset
        
        // Passer au champ suivant (labelInput) après un court délai
        setTimeout(() => {
          const labelInput = document.getElementById('labelInput');
          if (labelInput) {
            labelInput.focus();
            labelInput.select(); // Sélectionner le texte s'il y en a
          }
        }, 50);
        
        return; // Important : sortir ici
      }
    }
    
    // Si pas de suggestions visibles, laisser le Tab normal fonctionner
    // (pas de e.preventDefault(), donc Tab normal vers le champ suivant)
    
  } else if (e.key === "Enter") {
    e.preventDefault(); // Toujours empêcher le comportement par défaut
    
    // AJOUT : Logique de sélection intelligente des suggestions
    if (suggestionsDiv.style.display === "block" && items.length > 0) {
      let suggestionToUse = null;
      
      // Si une suggestion est sélectionnée (navigation avec flèches) -> l'utiliser
      if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < items.length) {
        suggestionToUse = items[selectedSuggestionIndex].textContent;
      } 
      // Sinon, prendre automatiquement la PREMIÈRE suggestion visible
      else {
        suggestionToUse = items[0].textContent;
      }
      
      // Appliquer la suggestion sélectionnée
      if (suggestionToUse) {
        input.value = suggestionToUse;
        suggestionsDiv.style.display = "none";
        selectedSuggestionIndex = -1; // Reset
        
        // Générer automatiquement la figure (comme Google)
        generateFigure();
        return; // Important : sortir ici pour éviter la double génération
      }
    }
    
    // Si pas de suggestions visibles, générer avec le texte actuel
    if (suggestionsDiv.style.display !== "block" && input.value.trim()) {
      generateFigure();
    }
  }
});


function highlightSuggestion(items) {
  items.forEach((item, i) => {
    item.style.background = i === selectedSuggestionIndex ? "#f0f0f0" : "white";
  });
}

document.addEventListener('DOMContentLoaded', function () {
  console.log('🚀 Initialisation du générateur de figures 2D...');

  // ==========================================
  // 1. TRACKING DES VISITES
  // ==========================================
  
  if (typeof trackVisit === 'function') {
    trackVisit();
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
      if (typeof updateLengthLabels === 'function') {
        updateLengthLabels();
      }
    }
    
    // État initial : unités cachées
    unitGroup.style.display = 'none';
    
    // Event listeners pour les mesures
    toggleLengths.addEventListener('change', updateUnitVisibility);
    
    if (showUnitsCheckbox) {
      showUnitsCheckbox.addEventListener('change', () => {
        if (typeof updateLengthLabels === 'function') updateLengthLabels();
      });
    }
    
    if (unitSelector) {
      unitSelector.addEventListener('change', () => {
        if (typeof updateLengthLabels === 'function') updateLengthLabels();
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
    if (element && typeof handler === 'function') {
      element.addEventListener(event, handler);
      console.log(`✅ ${description} configuré`);
      return true;
    } else {
      console.warn(`⚠️ Élément '${elementId}' non trouvé ou handler invalide`);
      return false;
    }
  }
  
  // Codages des côtés égaux
  addSafeEventListener('toggleCodings', 'change', () => {
    if (typeof updateCodings === 'function') updateCodings();
  }, 'Codages des côtés');
  
  // Diagonales
  addSafeEventListener('toggleDiagonals', 'change', () => {
    if (typeof updateDiagonals === 'function') updateDiagonals();
  }, 'Diagonales');
  
      // ✅ Event listener pour la checkbox d'intersection
    addSafeEventListener('toggleIntersectionLabel', 'change', () => {
      if (typeof updateDiagonals === 'function') updateDiagonals();
    }, 'Label d\'intersection');

    // ✅ Event listener pour le champ texte d'intersection
    addSafeEventListener('intersectionTextInput', 'input', () => {
      const showIntersectionLabel = document.getElementById('toggleIntersectionLabel')?.checked;
      if (showIntersectionLabel && typeof updateDiagonals === 'function') {
        updateDiagonals(); // Recréer le label avec le nouveau texte
      }
    }, 'Texte d\'intersection');

    // ✅ Event listener pour Enter dans le champ texte
    const intersectionTextInput = document.getElementById('intersectionTextInput');
    if (intersectionTextInput) {
      intersectionTextInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          const showIntersectionLabel = document.getElementById('toggleIntersectionLabel')?.checked;
          if (showIntersectionLabel && typeof updateDiagonals === 'function') {
            updateDiagonals();
          }
        }
      });
    }
  
  // Angles égaux
  addSafeEventListener('toggleEqualAngles', 'change', (e) => {
    if (typeof updateEqualAngleMarkers === 'function') {
      updateEqualAngleMarkers(e.target.checked);
    }
  }, 'Angles égaux');
  
  // Angles droits
  addSafeEventListener('toggleRightAngles', 'change', (e) => {
    if (typeof updateRightAngleMarkers === 'function') {
      updateRightAngleMarkers(e.target.checked);
    }
  }, 'Angles droits');
  
  // Option "un seul angle droit"
  addSafeEventListener('toggleSingleAngle', 'change', () => {
    const toggleRightAngles = document.getElementById('toggleRightAngles');
    if (toggleRightAngles && typeof updateRightAngleMarkers === 'function') {
      updateRightAngleMarkers(toggleRightAngles.checked);
    }
  }, 'Un seul angle droit');
  
  // Option "cacher l'hypoténuse"
  addSafeEventListener('toggleHideHypotenuse', 'change', () => {
    if (typeof updateLengthLabels === 'function') updateLengthLabels();
  }, 'Cacher hypoténuse');
  
  // Rayon du cercle
  addSafeEventListener('toggleRadius', 'change', () => {
    if (typeof updateCircleExtras === 'function') updateCircleExtras();
  }, 'Rayon du cercle');
  
  // Diamètre du cercle
  addSafeEventListener('toggleDiameter', 'change', () => {
    if (typeof updateCircleExtras === 'function') updateCircleExtras();
  }, 'Diamètre du cercle');
  
  // Effet main levée
  addSafeEventListener('toggleHandDrawn', 'change', (e) => {
    if (typeof toggleHandDrawnEffect === 'function') {
      toggleHandDrawnEffect(e.target.checked);
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
      if (typeof generateFigure === 'function') {
        generateFigure();
      }
      
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
  // 7. INTERACTION CLAVIER POUR LA GÉNÉRATION
  // ==========================================
  
  if (promptInput) {
    promptInput.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        if (typeof generateFigure === 'function') {
          generateFigure();
        }
      }
    });
    
    console.log('✅ Génération par touche Entrée configurée');
  }

// ==========================================
// 8. CRÉATION DES BOUTONS D'EXPORT
// ==========================================

const optionsPanel = document.getElementById('optionsPanel');
if (optionsPanel) {
  
  // ✅ CRÉER UN CONTENEUR FLEX POUR LES BOUTONS CÔTE À CÔTE
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
  
  // ✅ BOUTON EXPORT SVG (PREMIER - à gauche)
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
      if (typeof exportBoardToSVG === 'function') {
        exportBoardToSVG();
      } else {
        console.error('❌ Fonction exportBoardToSVG non disponible');
        alert('Fonction d\'export non disponible');
      }
    });
    
    buttonsContainer.appendChild(exportButton);
    console.log('✅ Bouton d\'export SVG créé');
  }
  
  // ✅ BOUTON COPIER PRESSE-PAPIER (DEUXIÈME - à droite)
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
      if (typeof copyBoardToClipboard === 'function') {
        copyBoardToClipboard();
      } else {
        console.error('❌ Fonction copyBoardToClipboard non disponible');
        alert('Fonction de copie non disponible');
      }
    });
    
    buttonsContainer.appendChild(copyButton);
    console.log('✅ Bouton copier presse-papier créé');
  }
}

  // ==========================================
  // 9. INITIALISATION DES VARIABLES GLOBALES
  // ==========================================
  
  // Reset des variables de customisation
  if (typeof customLabels !== 'undefined') {
    customLabels = [];
  }
  
  // Reset des variables d'effet main levée
  if (typeof isHandDrawnMode !== 'undefined') {
    isHandDrawnMode = false;
  }
  
  if (typeof originalPolygon !== 'undefined') {
    originalPolygon = null;
  }
  
  if (typeof handDrawnElements !== 'undefined') {
    handDrawnElements = [];
  }
  
  // Reset du compteur de synchronisation des labels
  if (typeof _lengthSyncAttached !== 'undefined') {
    _lengthSyncAttached = false;
  }

  // ==========================================
  // 10. AFFICHAGE DES STATISTIQUES (DIFFÉRÉ)
  // ==========================================
  
  // Afficher les statistiques après 2 secondes pour laisser le temps aux APIs
  setTimeout(() => {
    if (typeof showStats === 'function') {
      showStats();
    }
    if (typeof getEngagementRatio === 'function') {
      getEngagementRatio();
    }
  }, 2000);

  // ==========================================
  // 11. FINALISATION
  // ==========================================
  
  // Masquer le loader si présent
  const loader = document.getElementById('loader');
  if (loader) {
    loader.style.display = 'none';
  }
  
  // Afficher le contenu principal
  const mainContent = document.getElementById('mainContent') || document.body;
  if (mainContent) {
    mainContent.style.visibility = 'visible';
    mainContent.style.opacity = '1';
  }
  
  console.log('🎉 Initialisation du générateur terminée avec succès !');
  console.log('📋 Tapez une figure dans le champ de saisie ou cliquez sur la liste');
  console.log('🔧 Utilisez les options d\'affichage pour personnaliser votre figure');
  console.log('📊 Tapez getStats() dans la console pour voir les statistiques de visite');

}); // ✅ FIN DU DOMContentLoaded

// ==========================================
// SYSTÈME DE COMPTAGE LOCAL (En dehors du DOMContentLoaded)
// ==========================================

// Variables globales pour les compteurs
let sessionId = null;
let isNewSession = false;

// Générer un ID de session unique
function generateSessionId() {
  return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Fonction de tracking des visites (version locale uniquement)
function trackVisit() {
  console.log('🚀 Initialisation du système de comptage local...');
  
  // === COMPTEUR LOCAL (par utilisateur) ===
  let userVisits = parseInt(localStorage.getItem('appVisits') || '0');
  userVisits++;
  localStorage.setItem('appVisits', userVisits.toString());
  console.log(`👤 Visite n°${userVisits} de cet utilisateur`);
  
  // === GESTION DES SESSIONS ===
  sessionId = sessionStorage.getItem('currentSessionId');
  if (!sessionId) {
    // Nouvelle session
    sessionId = generateSessionId();
    sessionStorage.setItem('currentSessionId', sessionId);
    isNewSession = true;
    console.log(`🆕 Nouvelle session créée: ${sessionId}`);
    
    // Incrémenter les compteurs globaux locaux
    incrementLocalCounters();
  } else {
    isNewSession = false;
    console.log(`🔄 Session existante: ${sessionId}`);
  }
  
  // Incrémenter les visites totales à chaque rechargement
  incrementLocalVisits();
}

// Incrémenter le compteur local de visites totales
function incrementLocalVisits() {
  const totalVisits = parseInt(localStorage.getItem('local_total_visits') || '0') + 1;
  localStorage.setItem('local_total_visits', totalVisits.toString());
  console.log(`📊 Total visites locales: ${totalVisits}`);
}

// Incrémenter les compteurs pour les nouvelles sessions uniquement
function incrementLocalCounters() {
  // Visiteurs uniques
  const uniqueVisitors = parseInt(localStorage.getItem('local_unique_visitors') || '0') + 1;
  localStorage.setItem('local_unique_visitors', uniqueVisitors.toString());
  console.log(`👥 Visiteurs uniques locaux: ${uniqueVisitors}`);
  
  // Enregistrer la date de première visite
  if (!localStorage.getItem('first_visit_date')) {
    localStorage.setItem('first_visit_date', new Date().toISOString());
  }
  
  // Enregistrer la date de dernière visite
  localStorage.setItem('last_visit_date', new Date().toISOString());
}

// Fonction pour récupérer les statistiques locales
async function getVisitorStats() {
  const stats = {
    totalVisits: parseInt(localStorage.getItem('local_total_visits') || '0'),
    uniqueVisitors: parseInt(localStorage.getItem('local_unique_visitors') || '0'),
    userVisits: parseInt(localStorage.getItem('appVisits') || '0'),
    sessionId: sessionId,
    firstVisit: localStorage.getItem('first_visit_date'),
    lastVisit: localStorage.getItem('last_visit_date')
  };
  
  return stats;
}

// Fonction pour afficher les statistiques dans la console
function showStats() {
  getVisitorStats().then(stats => {
    console.log('📈 === STATISTIQUES DE VISITE (LOCAL) ===');
    console.log(`🌐 Visites totales: ${stats.totalVisits}`);
    console.log(`👥 Visiteurs uniques: ${stats.uniqueVisitors}`);
    console.log(`👤 Vos visites personnelles: ${stats.userVisits}`);
    console.log(`🆔 ID de session actuel: ${stats.sessionId}`);
    console.log(`🔄 Nouvelle session: ${isNewSession ? 'Oui' : 'Non'}`);
    
    if (stats.firstVisit) {
      const firstDate = new Date(stats.firstVisit).toLocaleString('fr-FR');
      console.log(`📅 Première visite: ${firstDate}`);
    }
    
    if (stats.lastVisit) {
      const lastDate = new Date(stats.lastVisit).toLocaleString('fr-FR');
      console.log(`🕒 Dernière visite: ${lastDate}`);
    }
    
    console.log('💡 Note: Compteurs locaux uniquement (pas d\'API externe)');
  });
}

// Fonction pour obtenir le ratio visiteurs/visites
function getEngagementRatio() {
  getVisitorStats().then(stats => {
    if (stats.totalVisits > 0 && stats.uniqueVisitors > 0) {
      const ratio = (stats.totalVisits / stats.uniqueVisitors).toFixed(1);
      console.log(`📊 Ratio d'engagement: ${ratio} visites par visiteur`);
      
      // Analyse du comportement
      if (ratio >= 3) {
        console.log('🎯 Excellent engagement ! Les utilisateurs reviennent souvent.');
      } else if (ratio >= 2) {
        console.log('👍 Bon engagement, certains utilisateurs reviennent.');
      } else {
        console.log('🆕 La plupart des visites sont de nouveaux utilisateurs.');
      }
    }
  });
}

// ✅ FONCTION D'EXPORT SVG
function exportBoardToSVG() {
  try {
    // Mise à jour des éléments visuels avant export
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

    // Obtenir le SVG du board
    const svgRoot = board.renderer.svgRoot;
    if (!svgRoot) {
      alert('❌ Impossible de générer le SVG');
      return;
    }

    // Cloner le SVG pour éviter de modifier l'original
    const svgClone = svgRoot.cloneNode(true);
    
    // Ajouter les namespace nécessaires
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    
    // Serializer le SVG
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgClone);
    
    // Créer le fichier et le télécharger
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'figure-geometrique.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Nettoyer l'URL
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    console.log('✅ Export SVG réussi');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'export SVG:', error);
    alert('❌ Erreur lors de l\'export SVG');
  }
}

// Copier le board JSXGraph dans le presse-papier (image PNG) avec dimensions réelles
async function copyBoardToClipboard() {
  try {
    // Mise à jour des éléments visuels
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

    // Vérifier le support du presse-papier
    if (!navigator.clipboard || !navigator.clipboard.write) {
      alert('❌ Votre navigateur ne supporte pas la copie dans le presse-papier.\nUtilisez plutôt le bouton "Exporter SVG".');
      return;
    }

    // Feedback visuel
    const copyBtn = document.getElementById('copyClipboardBtn');
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '⏳ Copie...';
    copyBtn.disabled = true;

    try {
      // Charger html2canvas si nécessaire
      if (!window.html2canvas) {
        const script = document.createElement('script');
        script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
        document.head.appendChild(script);
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }

      // Attendre que les changements prennent effet
      await new Promise(resolve => setTimeout(resolve, 150));

      // ✅ ÉTAPE 1 : CALCULER LA BOÎTE ENGLOBANTE DE LA FIGURE
      const figureBounds = calculateFigureBounds();
      console.log('📐 Limites de la figure calculées:', figureBounds);

      // ✅ ÉTAPE 2 : CALCULER LA RÉSOLUTION POUR DIMENSIONS RÉELLES
      const realWorldScale = calculateRealWorldScale(figureBounds);
      console.log('📏 Échelle monde réel calculée:', realWorldScale);

      // ✅ ÉTAPE 3 : CAPTURER À LA RÉSOLUTION APPROPRIÉE
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

      // ✅ ÉTAPE 4 : DÉCOUPER INTELLIGEMMENT AUTOUR DE LA FIGURE
      const croppedCanvas = cropCanvasToFigureRealSize(fullCanvas, figureBounds, jxgBox, realWorldScale);

      // ✅ ÉTAPE 5 : AJOUTER LES MÉTADONNÉES DPI À L'IMAGE
      const blob = await createPngWithDPI(croppedCanvas, realWorldScale.targetDPI);

      // Copier dans le presse-papier
      const clipboardItem = new ClipboardItem({
        'image/png': blob
      });

      await navigator.clipboard.write([clipboardItem]);

      // Feedback de succès avec dimensions
      const dimensions = calculateImageDimensions(figureBounds, realWorldScale);
      copyBtn.innerHTML = '✅ Copié !';
      copyBtn.style.background = 'linear-gradient(135deg, #00b894, #55efc4)';
      
      console.log('📋 Image copiée avec dimensions réelles !');
      console.log(`📏 Taille de l'image: ${dimensions.widthCm.toFixed(1)} × ${dimensions.heightCm.toFixed(1)} cm`);
      
      // Notification avec les dimensions
      showCopyNotification(`Image copiée ! (${dimensions.widthCm.toFixed(1)} × ${dimensions.heightCm.toFixed(1)} cm)`);

    } catch (error) {
      console.error('❌ Erreur lors de la copie:', error);
      alert('❌ Erreur lors de la copie dans le presse-papier.');
      
      copyBtn.innerHTML = '❌ Échec';
      copyBtn.style.background = 'linear-gradient(135deg, #d63031, #e84393)';
    }

    // Restaurer le bouton après 3 secondes (plus long pour lire les dimensions)
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

// ✅ FONCTION POUR CALCULER L'ÉCHELLE MONDE RÉEL
function calculateRealWorldScale(figureBounds) {
  // ✅ PARAMÈTRES DE BASE
  const targetDPI = 300; // DPI élevé pour impression qualité (72 DPI = écran, 300 DPI = impression)
  const pixelsPerCm = targetDPI / 2.54; // Conversion DPI → pixels par cm (1 inch = 2.54 cm)
  
  // ✅ DIMENSIONS DE LA FIGURE EN UNITÉS UTILISATEUR JSXGraph
  const figureWidthUnits = figureBounds.maxX - figureBounds.minX;
  const figureHeightUnits = figureBounds.maxY - figureBounds.minY;
  
  // ✅ DÉTECTION DU TYPE DE FIGURE ET DE SES DIMENSIONS RÉELLES
  let realWidthCm = figureWidthUnits; // Par défaut
  let realHeightCm = figureHeightUnits;
  
  // Analyser les dimensions réelles à partir des points
  if (points && points.length > 0) {
    // Calculer les dimensions réelles de la figure géométrique
    const realDimensions = calculateRealFigureDimensions();
    if (realDimensions.width > 0) realWidthCm = realDimensions.width;
    if (realDimensions.height > 0) realHeightCm = realDimensions.height;
  }
  
  // ✅ CALCULER LA RÉSOLUTION NÉCESSAIRE
  const requiredWidthPixels = realWidthCm * pixelsPerCm;
  const requiredHeightPixels = realHeightCm * pixelsPerCm;
  
  // ✅ CALCULER LE FACTEUR D'ÉCHELLE POUR html2canvas
  // html2canvas scale = pixels souhaités / pixels naturels du DOM
  const currentBoardSize = board.canvasWidth || 400; // Taille approximative du board
  const canvasScale = Math.max(requiredWidthPixels / currentBoardSize, 1); // Minimum scale = 1
  
  console.log(`🔍 Calcul échelle monde réel:
  - Figure: ${figureWidthUnits.toFixed(2)} × ${figureHeightUnits.toFixed(2)} unités JSX
  - Réel: ${realWidthCm.toFixed(2)} × ${realHeightCm.toFixed(2)} cm
  - Résolution cible: ${targetDPI} DPI (${pixelsPerCm.toFixed(0)} px/cm)
  - Canvas scale: ${canvasScale.toFixed(2)}x`);
  
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

// ✅ FONCTION POUR CALCULER LES DIMENSIONS RÉELLES DE LA FIGURE
function calculateRealFigureDimensions() {
  if (!points || points.length === 0) {
    return { width: 0, height: 0 };
  }
  
  // ✅ CAS SPÉCIAUX SELON LE TYPE DE FIGURE
  
  // CERCLE : diameter = 2 * radius
  if (centerPoint && circlePoint && circleObject) {
    const radius = Math.hypot(circlePoint.X() - centerPoint.X(), circlePoint.Y() - centerPoint.Y());
    const diameter = radius * 2;
    return { width: diameter, height: diameter };
  }
  
  // CARRÉ : tous les côtés égaux
  if (points.length === 4) {
    const figureType = detectQuadrilateralType();
    if (figureType === 'square') {
      const sideLength = Math.hypot(points[1].X() - points[0].X(), points[1].Y() - points[0].Y());
      return { width: sideLength, height: sideLength };
    }
    
    // RECTANGLE : largeur ≠ hauteur
    if (figureType === 'rectangle') {
      const width = Math.hypot(points[1].X() - points[0].X(), points[1].Y() - points[0].Y());
      const height = Math.hypot(points[3].X() - points[0].X(), points[3].Y() - points[0].Y());
      return { width, height };
    }
  }
  
  // TRIANGLE : base × hauteur (approximatif)
  if (points.length === 3) {
    const base = Math.hypot(points[1].X() - points[0].X(), points[1].Y() - points[0].Y());
    const height = Math.abs(points[2].Y() - Math.min(points[0].Y(), points[1].Y()));
    return { width: base, height };
  }
  
  // ✅ CALCUL GÉNÉRAL : bounding box des points
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

// ✅ FONCTION POUR DÉCOUPER LE CANVAS AVEC DIMENSIONS RÉELLES (sans zone grise)
function cropCanvasToFigureRealSize(sourceCanvas, figureBounds, jxgBox, realWorldScale) {
  // Convertir les coordonnées utilisateur en coordonnées pixel
  const boundingBox = board.getBoundingBox();
  const boardWidth = boundingBox[2] - boundingBox[0];
  const boardHeight = boundingBox[1] - boundingBox[3];
  
  // Dimensions du canvas capturé (avec scale appliqué)
  const canvasWidth = sourceCanvas.width;
  const canvasHeight = sourceCanvas.height;
  
  // Facteurs de conversion utilisateur → pixel (avec scale)
  const scaleX = canvasWidth / boardWidth;
  const scaleY = canvasHeight / boardHeight;
  
  // Convertir les limites de la figure en coordonnées pixel
  const pixelBounds = {
    left: Math.max(0, (figureBounds.minX - boundingBox[0]) * scaleX),
    right: Math.min(canvasWidth, (figureBounds.maxX - boundingBox[0]) * scaleX),
    top: Math.max(0, (boundingBox[1] - figureBounds.maxY) * scaleY),
    bottom: Math.min(canvasHeight, (boundingBox[1] - figureBounds.minY) * scaleY)
  };
  
  // Dimensions finales du découpage
  const cropWidth = Math.max(100, Math.round(pixelBounds.right - pixelBounds.left));
  const cropHeight = Math.max(100, Math.round(pixelBounds.bottom - pixelBounds.top));
  
  console.log(`✂️ Découpage haute résolution: ${cropWidth} × ${cropHeight} pixels`);
  console.log(`📏 Soit: ${(cropWidth / realWorldScale.pixelsPerCm).toFixed(1)} × ${(cropHeight / realWorldScale.pixelsPerCm).toFixed(1)} cm`);
  
  // Créer le canvas découpé
  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = cropWidth;
  croppedCanvas.height = cropHeight;
  const ctx = croppedCanvas.getContext('2d');
  
  // ✅ CORRECTION : Fond blanc pur et opaque
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, cropWidth, cropHeight);
  
  // ✅ CORRECTION : Améliorer le rendu pour éviter les artefacts
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  // Découper et copier avec rendu amélioré
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
  
  // ✅ NOUVEAU : Nettoyer les pixels gris résiduels
  const imageData = ctx.getImageData(0, 0, cropWidth, cropHeight);
  const data = imageData.data;
  
  // Parcourir tous les pixels et remplacer les gris par du blanc
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    
    // Détecter les pixels gris (valeurs RGB proches et dans la gamme grise)
    const isGrayish = (
      Math.abs(r - g) < 10 && 
      Math.abs(g - b) < 10 && 
      Math.abs(r - b) < 10 && 
      r > 200 && r < 240 && // Gris clair
      a > 200 // Pas transparent
    );
    
    // Remplacer par du blanc pur
    if (isGrayish) {
      data[i] = 255;     // R = blanc
      data[i + 1] = 255; // G = blanc
      data[i + 2] = 255; // B = blanc
      data[i + 3] = 255; // A = opaque
    }
    
    // ✅ BONUS : S'assurer que le fond est bien blanc (pixels très clairs)
    const isVeryLight = r > 250 && g > 250 && b > 250;
    if (isVeryLight) {
      data[i] = 255;     // R = blanc pur
      data[i + 1] = 255; // G = blanc pur
      data[i + 2] = 255; // B = blanc pur
      data[i + 3] = 255; // A = opaque
    }
  }
  
  // Remettre les pixels nettoyés
  ctx.putImageData(imageData, 0, 0);
  
  return croppedCanvas;
}

// ✅ FONCTION POUR CRÉER UN PNG AVEC MÉTADONNÉES DPI
async function createPngWithDPI(canvas, targetDPI) {
  // Créer un blob normal
  const blob = await new Promise(resolve => {
    canvas.toBlob(resolve, 'image/png', 1.0);
  });
  
  // Note: Malheureusement, les navigateurs ne supportent pas nativement
  // l'ajout de métadonnées DPI aux PNG via canvas.toBlob()
  // L'image sera copiée avec les bonnes dimensions en pixels,
  // et la plupart des logiciels détecteront automatiquement la bonne échelle
  
  return blob;
}

// ✅ FONCTION POUR CALCULER LES DIMENSIONS FINALES DE L'IMAGE
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

// ✅ Fonction pour afficher une notification avec les dimensions
function showCopyNotification(message) {
  // Supprimer notification existante
  const existingNotif = document.querySelector('.copy-notification');
  if (existingNotif) existingNotif.remove();
  
  // Créer la notification
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
  
  // Ajouter au DOM
  document.body.appendChild(notification);
  
  // Animation d'apparition
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Animation de disparition et suppression
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100px)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 400);
  }, 4000); // Plus long pour lire les dimensions
}

// ✅ FONCTION POUR CALCULER LES LIMITES DE LA FIGURE
function calculateFigureBounds() {
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  
  // ✅ ANALYSER TOUS LES POINTS DE LA FIGURE
  const allPoints = [];
  
  // 1. Points principaux de la figure
  if (points && points.length > 0) {
    allPoints.push(...points);
  }
  
  // 2. Centre et point du cercle
  if (centerPoint) allPoints.push(centerPoint);
  if (circlePoint) allPoints.push(circlePoint);
  
  // 3. Points du diamètre
  if (diameterPoints && diameterPoints.length > 0) {
    allPoints.push(...diameterPoints);
  }
  
  // 4. Handles des labels de longueur
  if (lengthHandles && lengthHandles.length > 0) {
    allPoints.push(...lengthHandles);
  }
  
  // Calculer les limites en coordonnées utilisateur
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
  
  // ✅ GÉRER CAS SPÉCIAL : CERCLE (ajouter le rayon)
  if (centerPoint && circleObject) {
    const radius = Math.hypot(circlePoint.X() - centerPoint.X(), circlePoint.Y() - centerPoint.Y());
    const centerX = centerPoint.X();
    const centerY = centerPoint.Y();
    
    minX = Math.min(minX, centerX - radius);
    maxX = Math.max(maxX, centerX + radius);
    minY = Math.min(minY, centerY - radius);
    maxY = Math.max(maxY, centerY + radius);
  }
  
  // ✅ AJOUTER UNE MARGE POUR LES LABELS ET ÉLÉMENTS DÉCORATIFS
  const marginX = (maxX - minX) * 0.15; // 15% de marge
  const marginY = (maxY - minY) * 0.15;
  
  // Marge minimum absolue
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

// ✅ FONCTION POUR DÉCOUPER LE CANVAS
function cropCanvasToFigure(sourceCanvas, figureBounds, jxgBox) {
  // Convertir les coordonnées utilisateur en coordonnées pixel
  const boundingBox = board.getBoundingBox(); // [xmin, ymax, xmax, ymin]
  const boardWidth = boundingBox[2] - boundingBox[0];  // largeur en unités utilisateur
  const boardHeight = boundingBox[1] - boundingBox[3]; // hauteur en unités utilisateur
  
  // Dimensions du canvas capturé
  const canvasWidth = sourceCanvas.width;
  const canvasHeight = sourceCanvas.height;
  
  // Facteurs de conversion utilisateur → pixel
  const scaleX = canvasWidth / boardWidth;
  const scaleY = canvasHeight / boardHeight;
  
  // Convertir les limites de la figure en coordonnées pixel
  const pixelBounds = {
    left: Math.max(0, (figureBounds.minX - boundingBox[0]) * scaleX),
    right: Math.min(canvasWidth, (figureBounds.maxX - boundingBox[0]) * scaleX),
    top: Math.max(0, (boundingBox[1] - figureBounds.maxY) * scaleY), // Y inversé
    bottom: Math.min(canvasHeight, (boundingBox[1] - figureBounds.minY) * scaleY)
  };
  
  // Dimensions du découpage
  const cropWidth = Math.max(100, Math.round(pixelBounds.right - pixelBounds.left));
  const cropHeight = Math.max(100, Math.round(pixelBounds.bottom - pixelBounds.top));
  
  console.log(`✂️ Découpage: ${Math.round(pixelBounds.left)},${Math.round(pixelBounds.top)} → ${cropWidth}x${cropHeight}`);
  
  // Créer un nouveau canvas pour le découpage
  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = cropWidth;
  croppedCanvas.height = cropHeight;
  const ctx = croppedCanvas.getContext('2d');
  
  // Fond blanc
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, cropWidth, cropHeight);
  
  // Découper et copier la partie de l'image
  ctx.drawImage(
    sourceCanvas,
    Math.round(pixelBounds.left),   // source x
    Math.round(pixelBounds.top),    // source y
    cropWidth,                      // source width
    cropHeight,                     // source height
    0,                              // dest x
    0,                              // dest y
    cropWidth,                      // dest width
    cropHeight                      // dest height
  );
  
  return croppedCanvas;
}

// Fonctions globales pour la console du navigateur
window.getStats = showStats;
window.getEngagement = getEngagementRatio;
window.resetStats = function() {
  if (confirm('⚠️ Réinitialiser toutes les statistiques locales ?')) {
    const keys = [
      'local_total_visits',
      'local_unique_visitors', 
      'appVisits',
      'first_visit_date',
      'last_visit_date'
    ];
    
    keys.forEach(key => localStorage.removeItem(key));
    sessionStorage.removeItem('currentSessionId');
    
    console.log('✅ Toutes les statistiques locales réinitialisées');
    location.reload();
  }
};
