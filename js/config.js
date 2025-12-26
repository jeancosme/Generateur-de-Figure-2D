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
let figureSegments = []; // Segments individuels de la figure (pour la gomme)

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
// HISTORIQUE (UNDO/REDO)
// ==========================================

/**
 * Pile d'historique pour sauvegarder les états de la figure
 * Chaque état contient une copie sérialisable de tous les éléments
 */
let historyStack = [];
let maxHistorySize = 20; // Limite de 20 états
let isRestoringState = false; // Flag pour éviter la sauvegarde pendant la restauration
let figureCommandHistory = []; // Historique des commandes de figures ajoutées (figures complexes)

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
// FONCTIONS D'HISTORIQUE (UNDO)
// ==========================================

/**
 * Sauvegarde l'état actuel du board dans l'historique
 * Capture tous les éléments et leur configuration
 */
function saveState() {
  // Ne pas sauvegarder si on est en train de restaurer un état
  if (isRestoringState) {
    console.log('⏸️ Sauvegarde ignorée (restauration en cours)');
    return;
  }
  
  // Capturer TOUS les objets du board (pas seulement le tableau points)
  const allPoints = board.objectsList.filter(obj => obj.elType === 'point' && obj.name);
  const allPolygons = board.objectsList.filter(obj => obj.elType === 'polygon');
  const allTexts = board.objectsList.filter(obj => obj.elType === 'text');
  
  const state = {
    timestamp: Date.now(),    // Historique des commandes de figures (figures complexes)
    figureCommands: [...figureCommandHistory],    // Capturer tous les points avec nom du board
    allBoardObjects: {
      points: allPoints.map(p => ({
        x: p.X(),
        y: p.Y(),
        name: p.name,
        id: p.id,
        visible: p.visProp.visible
      })),
      polygonCount: allPolygons.length,
      textCount: allTexts.length
    },
    // Copie profonde des coordonnées des points (pour compatibilité)
    points: points.map(p => ({ 
      x: p.X(), 
      y: p.Y(), 
      name: p.name,
      id: p.id
    })),
    // État des checkboxes/options
    options: {
      rightAngles: document.getElementById('toggleRightAngles')?.checked || false,
      singleAngle: document.getElementById('toggleSingleAngle')?.checked || false,
      equalAngles: document.getElementById('toggleEqualAngles')?.checked || false,
      lengths: document.getElementById('toggleLengths')?.checked || false,
      showUnits: document.getElementById('showUnitsCheckbox')?.checked || false,
      hideHypotenuse: document.getElementById('toggleHideHypotenuse')?.checked || false,
      codings: document.getElementById('toggleCodings')?.checked || false,
      diagonals: document.getElementById('toggleDiagonals')?.checked || false,
      intersectionLabel: document.getElementById('toggleIntersectionLabel')?.checked || false,
      intersectionRightAngle: document.getElementById('toggleIntersectionRightAngle')?.checked || false,
      showRadius: document.getElementById('toggleRadius')?.checked || false,
      showDiameter: document.getElementById('toggleDiameter')?.checked || false,
      unitSelector: document.getElementById('unitSelector')?.value || 'cm'
    },
    // Inputs utilisateur
    inputs: {
      prompt: document.getElementById('promptInput')?.value || '',
      label: document.getElementById('labelInput')?.value || '',
      creatorPrompt: document.getElementById('creatorPromptInput')?.value || ''
    },
    // État du cercle si présent
    circle: centerPoint ? {
      center: { x: centerPoint.X(), y: centerPoint.Y() },
      point: { x: circlePoint.X(), y: circlePoint.Y() },
      radius: r
    } : null,
    // Mode dessin à main levée
    handDrawnMode: isHandDrawnMode,
    fontSize: globalFontSize
  };

  historyStack.push(state);
  
  // Limiter la taille de l'historique
  if (historyStack.length > maxHistorySize) {
    historyStack.shift();
  }

  console.log(`💾 État sauvegardé (${historyStack.length} états, ${state.figureCommands.length} commandes, ${state.allBoardObjects.points.length} points nommés, ${state.allBoardObjects.polygonCount} polygones)`);

  // Activer le bouton Annuler
  updateUndoButton();
}

/**
 * Annule la dernière action et restaure l'état précédent
 */
function undoLastAction() {
  if (historyStack.length <= 1) {
    console.log('Aucun historique disponible pour annuler');
    // S'il ne reste que l'état initial, effacer tout
    if (historyStack.length === 1) {
      clearAllFigures();
    }
    return;
  }

  // Retirer l'état actuel
  historyStack.pop();

  // Récupérer l'état précédent (sans le retirer)
  const previousState = historyStack[historyStack.length - 1];

  // Activer le flag de restauration
  isRestoringState = true;
  
  // Nettoyer le board
  resetAllGlobalVariables();
  clearBoard();

  // Restaurer l'état
  restoreState(previousState);
  
  // Désactiver le flag de restauration
  isRestoringState = false;
  
  updateUndoButton();
  
  console.log(`↩️ État restauré (${historyStack.length} états dans l'historique)`);
}

/**
 * Nettoie tous les éléments du board
 */
function clearBoard() {
  if (board && board.objectsList && board.objectsList.length > 0) {
    // Copier le tableau car removeObject modifie objectsList
    const objectsCopy = [...board.objectsList];
    objectsCopy.forEach(obj => {
      try {
        board.removeObject(obj);
      } catch (e) {
        // Ignorer les erreurs de suppression
      }
    });
  }
}

/**
 * Restaure un état sauvegardé
 */
function restoreState(state) {
  console.log(`🔄 Restauration de l'état (${state.figureCommands?.length || 0} commandes, ${state.allBoardObjects?.polygonCount || 0} polygones, prompt: "${state.inputs.prompt}")`);
  
  // Restaurer les inputs
  if (document.getElementById('promptInput')) {
    document.getElementById('promptInput').value = state.inputs.prompt;
  }
  if (document.getElementById('labelInput')) {
    document.getElementById('labelInput').value = state.inputs.label;
  }
  if (document.getElementById('creatorPromptInput')) {
    document.getElementById('creatorPromptInput').value = state.inputs.creatorPrompt;
  }

  // Restaurer les options
  const opts = state.options;
  if (document.getElementById('toggleRightAngles')) {
    document.getElementById('toggleRightAngles').checked = opts.rightAngles;
  }
  if (document.getElementById('toggleSingleAngle')) {
    document.getElementById('toggleSingleAngle').checked = opts.singleAngle;
  }
  if (document.getElementById('toggleEqualAngles')) {
    document.getElementById('toggleEqualAngles').checked = opts.equalAngles;
  }
  if (document.getElementById('toggleLengths')) {
    document.getElementById('toggleLengths').checked = opts.lengths;
  }
  if (document.getElementById('showUnitsCheckbox')) {
    document.getElementById('showUnitsCheckbox').checked = opts.showUnits;
  }
  if (document.getElementById('toggleHideHypotenuse')) {
    document.getElementById('toggleHideHypotenuse').checked = opts.hideHypotenuse;
  }
  if (document.getElementById('toggleCodings')) {
    document.getElementById('toggleCodings').checked = opts.codings;
  }
  if (document.getElementById('toggleDiagonals')) {
    document.getElementById('toggleDiagonals').checked = opts.diagonals;
  }
  if (document.getElementById('toggleIntersectionLabel')) {
    document.getElementById('toggleIntersectionLabel').checked = opts.intersectionLabel;
  }
  if (document.getElementById('toggleIntersectionRightAngle')) {
    document.getElementById('toggleIntersectionRightAngle').checked = opts.intersectionRightAngle;
  }
  if (document.getElementById('toggleRadius')) {
    document.getElementById('toggleRadius').checked = opts.showRadius;
  }
  if (document.getElementById('toggleDiameter')) {
    document.getElementById('toggleDiameter').checked = opts.showDiameter;
  }
  if (document.getElementById('unitSelector')) {
    document.getElementById('unitSelector').value = opts.unitSelector;
  }

  // Restaurer la taille de police
  globalFontSize = state.fontSize;

  // Restaurer le mode dessin
  isHandDrawnMode = state.handDrawnMode;

  // Restaurer l'historique des commandes
  figureCommandHistory = [...(state.figureCommands || [])];

  // FIGURES COMPLEXES : rejouer les commandes sauvegardées
  if (state.figureCommands && state.figureCommands.length > 0) {
    console.log(`🔄 Rejeu de ${state.figureCommands.length} commandes...`);
    window.nextLabelIndex = 0; // Réinitialiser les labels
    
    state.figureCommands.forEach((cmd, index) => {
      console.log(`  ↪️ Commande ${index + 1}: ${cmd}`);
      document.getElementById('creatorPromptInput').value = cmd;
      addFigureToScene();
    });
    
    document.getElementById('creatorPromptInput').value = '';
  }
  // MODE SIMPLE : régénérer via le prompt
  else if (state.inputs.prompt && state.inputs.prompt.length > 0) {
    const wasRestoring = isRestoringState;
    isRestoringState = false;
    generateFigure();
    isRestoringState = wasRestoring;
  } else {
    console.log('⚠️ État vide restauré (board nettoyé)');
  }
}

/**
 * Met à jour l'état du bouton Annuler (actif/désactivé)
 */
function updateUndoButton() {
  const undoBtn = document.getElementById('undoBtn');
  if (undoBtn) {
    // Désactiver si pas d'historique OU seulement l'état initial
    undoBtn.disabled = historyStack.length <= 1;
    undoBtn.style.opacity = historyStack.length <= 1 ? '0.5' : '1';
    undoBtn.style.cursor = historyStack.length <= 1 ? 'not-allowed' : 'pointer';
  }
}

/**
 * Efface tout l'historique
 */
function clearHistory() {
  historyStack = [];
  figureCommandHistory = [];
  updateUndoButton();
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
    undo: "Annuler",
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
    undo: "Undo",
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
