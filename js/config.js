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
