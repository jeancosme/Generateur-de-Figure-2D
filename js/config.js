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
export let board = null;

/**
 * Setter pour le board (appelé uniquement depuis board.js)
 */
export function setBoard(newBoard) {
  board = newBoard;
}

// ==========================================
// ÉLÉMENTS GÉOMÉTRIQUES
// ==========================================

export let points = [];
export let polygon = null;
export let texts = [];
export let customLabels = [];

// ==========================================
// MARQUEURS VISUELS
// ==========================================

export let rightAngleMarkers = [];
export let lengthLabels = [];
export let lengthHandles = [];
export let lengthHandleMeta = [];
export let codingMarks = [];
export let codingSegments = [];
export let angleMarkers = [];
export let diagonals = [];

// ==========================================
// ÉLÉMENTS SPÉCIFIQUES AU CERCLE
// ==========================================

export let centerPoint = null;
export let circlePoint = null;
export let circleObject = null;
export let radiusSegment = null;
export let radiusLabel = null;
export let radiusLabelAnchor = null;
export let diameterSegment = null;
export let diameterPoints = [];

// ==========================================
// ÉLÉMENTS DES LABELS
// ==========================================

export let labelHandles = [];
export let labelTexts = [];

// ==========================================
// INTERSECTION DES DIAGONALES
// ==========================================

export let intersectionLabel = null;
export let intersectionPoint = null;

// ==========================================
// EFFET MAIN LEVÉE
// ==========================================

export let originalPolygon = null;
export let handDrawnElements = [];
export let isHandDrawnMode = false;

// ==========================================
// DIVERS
// ==========================================

export let extraElements = [];
export let r = null;
export let _lengthSyncAttached = false;

// ==========================================
// SETTERS POUR MODIFICATION D'ÉTAT
// ==========================================

export function setPoints(newPoints) { points = newPoints; }
export function setPolygon(newPolygon) { polygon = newPolygon; }
export function setTexts(newTexts) { texts = newTexts; }
export function setCustomLabels(newLabels) { customLabels = newLabels; }
export function setRightAngleMarkers(newMarkers) { rightAngleMarkers = newMarkers; }
export function setLengthLabels(newLabels) { lengthLabels = newLabels; }
export function setLengthHandles(newHandles) { lengthHandles = newHandles; }
export function setLengthHandleMeta(newMeta) { lengthHandleMeta = newMeta; }
export function setCodingMarks(newMarks) { codingMarks = newMarks; }
export function setCodingSegments(newSegments) { codingSegments = newSegments; }
export function setAngleMarkers(newMarkers) { angleMarkers = newMarkers; }
export function setDiagonals(newDiagonals) { diagonals = newDiagonals; }
export function setCenterPoint(newPoint) { centerPoint = newPoint; }
export function setCirclePoint(newPoint) { circlePoint = newPoint; }
export function setCircleObject(newCircle) { circleObject = newCircle; }
export function setRadiusSegment(newSegment) { radiusSegment = newSegment; }
export function setRadiusLabel(newLabel) { radiusLabel = newLabel; }
export function setRadiusLabelAnchor(newAnchor) { radiusLabelAnchor = newAnchor; }
export function setDiameterSegment(newSegment) { diameterSegment = newSegment; }
export function setDiameterPoints(newPoints) { diameterPoints = newPoints; }
export function setLabelHandles(newHandles) { labelHandles = newHandles; }
export function setLabelTexts(newTexts) { labelTexts = newTexts; }
export function setIntersectionLabel(newLabel) { intersectionLabel = newLabel; }
export function setIntersectionPoint(newPoint) { intersectionPoint = newPoint; }
export function setOriginalPolygon(newPolygon) { originalPolygon = newPolygon; }
export function setHandDrawnElements(newElements) { handDrawnElements = newElements; }
export function setIsHandDrawnMode(newMode) { isHandDrawnMode = newMode; }
export function setExtraElements(newElements) { extraElements = newElements; }
export function setR(newR) { r = newR; }
export function setLengthSyncAttached(newValue) { _lengthSyncAttached = newValue; }

// ==========================================
// HELPERS POUR RESET COMPLET
// ==========================================

/**
 * Réinitialise toutes les variables globales à leur état initial
 * Utilisé lors d'un reset complet de la figure
 */
export function resetAllGlobalVariables() {
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
