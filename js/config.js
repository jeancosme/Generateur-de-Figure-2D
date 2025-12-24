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
let intersectionRightAngleMarkers = []; // Marqueurs spécifiques pour l'angle droit à l'intersection
let lengthLabels = [];
let lengthHandles = [];
let lengthHandleMeta = [];
let codingMarks = [];
let codingSegments = [];
let angleMarkers = [];
let diagonals = [];

// ==========================================
// PARAMÈTRES D'AFFICHAGE
// ==========================================

let globalFontSize = 14; // Taille par défaut de la police

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
function setIntersectionRightAngleMarkers(newMarkers) { intersectionRightAngleMarkers = newMarkers; }
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

// Getters/Setters pour globalFontSize
function setGlobalFontSize(size) {
  globalFontSize = Math.max(8, Math.min(24, size)); // Entre 8 et 24
}

function getGlobalFontSize() {
  return globalFontSize;
}

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
  intersectionRightAngleMarkers = [];
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
// LANGUE ET TRADUCTIONS
// ==========================================

let currentLanguage = 'fr';

const translations = {
  fr: {
    title: "Générateur de figure 2D",
    figureNature: "Nature de la figure",
    figureName: "Nom de la figure",
    generate: "Générer",
    placeholderNature: "Ex : carré de côté 4",
    placeholderName: "Lettres des points (ex: ABCD ou A,B,C,D)",
    displayOptions: "🛠️ Options d'affichage",
    showRightAngles: "Afficher les angles droits",
    showSingleAngle: "Afficher un seul angle",
    showEqualAngles: "Afficher les angles égaux",
    showMeasures: "Afficher les mesures",
    showUnits: "Afficher les unités",
    hideHypotenuse: "Cacher l'hypoténuse",
    showCodings: "Afficher les codages",
    showDiagonals: "Afficher les diagonales",
    nameIntersection: "Nommer l'intersection",
    rightAngleIntersection: "Angle droit à l'intersection",
    showRadius: "Afficher un rayon",
    showDiameter: "Afficher un diamètre",
    handDrawn: "Dessin à main levée",
    intensity: "Intensité",
    exportSVG: "Exporter SVG",
    copy: "Copier",
    reset: "Réinitialiser",
    figuresList: "📚 Liste des figures",
    square: "Carré",
    circle: "Cercle",
    hexagon: "Hexagone",
    rhombus: "Losange",
    parallelogram: "Parallélogramme",
    regularPolygon: "Polygone régulier",
    rectangle: "Rectangle",
    equilateralTriangle: "Triangle équilatéral",
    isoscelesTriangle: "Triangle isocèle",
    scaleneTriangle: "Triangle quelconque",
    rightTriangle: "Triangle rectangle"
  },
  en: {
    title: "2D Shape Generator",
    figureNature: "Shape type",
    figureName: "Shape name",
    generate: "Generate",
    placeholderNature: "Ex: square with side 4",
    placeholderName: "Point letters (ex: ABCD or A,B,C,D)",
    displayOptions: "🛠️ Display options",
    showRightAngles: "Show right angles",
    showSingleAngle: "Show single angle",
    showEqualAngles: "Show equal angles",
    showMeasures: "Show measurements",
    showUnits: "Show units",
    hideHypotenuse: "Hide hypotenuse",
    showCodings: "Show codings",
    showDiagonals: "Show diagonals",
    nameIntersection: "Name intersection",
    rightAngleIntersection: "Right angle at intersection",
    showRadius: "Show radius",
    showDiameter: "Show diameter",
    handDrawn: "Hand-drawn effect",
    intensity: "Intensity",
    exportSVG: "Export SVG",
    copy: "Copy",
    reset: "Reset",
    figuresList: "📚 Shape list",
    square: "Square",
    circle: "Circle",
    hexagon: "Hexagon",
    rhombus: "Rhombus",
    parallelogram: "Parallelogram",
    regularPolygon: "Regular polygon",
    rectangle: "Rectangle",
    equilateralTriangle: "Equilateral triangle",
    isoscelesTriangle: "Isosceles triangle",
    scaleneTriangle: "Scalene triangle",
    rightTriangle: "Right triangle"
  }
};

function getCurrentLanguage() {
  return currentLanguage;
}

function setCurrentLanguage(lang) {
  currentLanguage = lang;
}

function getTranslation(key) {
  return translations[currentLanguage][key] || key;
}
