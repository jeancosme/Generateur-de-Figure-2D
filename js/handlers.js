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
class FigureDetector {
  
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

class BaseFigureHandler {
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

class SquareHandler extends BaseFigureHandler {
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

class RectangleHandler extends BaseFigureHandler {
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

class RhombusHandler extends BaseFigureHandler {
  getSidesToShow() { return [2]; }
  getRightAngles() { return []; }
  getCodings() {
    return {
      groups: [{ sides: [0, 1, 2, 3], markCount: 1 }],
      type: 'all-equal'
    };
  }
}

class ParallelogramHandler extends BaseFigureHandler {
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

class EquilateralTriangleHandler extends BaseFigureHandler {
  getSidesToShow() { return [0]; }
  getRightAngles() { return []; }
  getCodings() {
    return {
      groups: [{ sides: [0, 1, 2], markCount: 1 }],
      type: 'all-equal'
    };
  }
}

class RightTriangleHandler extends BaseFigureHandler {
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

class IsoscelesTriangleHandler extends BaseFigureHandler {
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

class ScaleneTriangleHandler extends BaseFigureHandler {
  getSidesToShow() { return [0, 1, 2]; }
  getRightAngles() { return []; }
  getCodings() { return { groups: [], type: 'none' }; }
}

class CircleHandler extends BaseFigureHandler {
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

class RegularPolygonHandler extends BaseFigureHandler {
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

class DefaultFigureHandler extends BaseFigureHandler {
  getSidesToShow() { return [...Array(this.points.length).keys()]; }
  getRightAngles() { return []; }
  getCodings() { return { groups: [], type: 'none' }; }
}

// ==========================================
// FACTORY
// ==========================================

class FigureHandlerFactory {
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
