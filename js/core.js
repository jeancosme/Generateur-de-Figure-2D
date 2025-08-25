// js/core.js - Version corrigée avec variables globales simples

// === VARIABLES GLOBALES ===
let board;
let points = [];
let polygon = null;
let texts = [];
let customLabels = [];

// Variables des améliorations visuelles
let rightAngleMarkers = [];
let angleMarkers = [];
let lengthLabels = [];
let codingMarks = [];
let codingSegments = [];
let diagonals = [];

// Variables spécifiques au cercle
let centerPoint = null;
let circlePoint = null;
let circleObject = null;
let diameterSegment = null;
let diameterPoints = [];
let radiusSegment = null;
let radiusLabel = null;

// Variables pour les handles déplaçables
let lengthHandles = [];
let labelHandles = [];
let labelTexts = [];
let lengthHandleMeta = [];
let _lengthSyncAttached = false;

// Variables diverses
let extraElements = [];
let r = null;
let selectedSuggestionIndex = -1;

// === FONCTION DE NETTOYAGE COMPLÈTE ===
function clearBoard() {
  console.log('🧹 Nettoyage du board...');
  
  // Nettoyer tous les objets JSXGraph existants
  if (board) {
    try {
      // Supprimer tous les objets du board
      for (let el in board.objects) {
        board.removeObject(board.objects[el]);
      }
    } catch (e) {
      console.warn('Erreur lors du nettoyage:', e);
    }
  }

  // Reset de toutes les variables
  points = [];
  polygon = null;
  texts = [];
  rightAngleMarkers = [];
  angleMarkers = [];
  lengthLabels = [];
  codingMarks = [];
  codingSegments = [];
  diagonals = [];
  centerPoint = null;
  circlePoint = null;
  circleObject = null;
  diameterSegment = null;
  diameterPoints = [];
  radiusSegment = null;
  radiusLabel = null;
  extraElements = [];
  lengthHandles = [];
  labelHandles = [];
  labelTexts = [];
  lengthHandleMeta = [];
  _lengthSyncAttached = false;
  r = null;

  if (board) {
    board.update();
  }
}

// === INITIALISATION ===
function initializeApp() {
  // Vérifier que JSXGraph est disponible
  if (typeof JXG === 'undefined') {
    console.error('❌ JSXGraph non chargé !');
    setTimeout(initializeApp, 100);
    return;
  }

  console.log('✅ JSXGraph détecté, initialisation...');

  // Créer le board
  board = JXG.JSXGraph.initBoard('jxgbox', {
    boundingbox: [-5, 5, 5, -5],
    axis: false,
    showCopyright: false,
    showNavigation: false,
    keepaspectratio: true,
    zoom: { enabled: false }
  });

  createBoardControls();

  // Zoom à la molette
  document.getElementById('jxgbox').addEventListener('wheel', function (event) {
    event.preventDefault();
    const zoomFactor = 1.1;
    if (event.deltaY < 0) {
      board.zoom(1 / zoomFactor, 1 / zoomFactor);
    } else {
      board.zoom(zoomFactor, zoomFactor);
    }
    board.update();
  });

  console.log('✅ Core initialisé avec succès');
}

function createBoardControls() {
  const container = document.getElementById('jxgbox');
  if (!container) {
    console.warn('❌ Container jxgbox non trouvé');
    return;
  }

  const existing = container.querySelector('.jxg-controls');
  if (existing) existing.remove();

  const panel = document.createElement('div');
  panel.className = 'jxg-controls';
  panel.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 10000;
    pointer-events: auto;
    background: rgba(255,255,255,0.9);
    border-radius: 5px;
    padding: 5px;
  `;
  
  panel.addEventListener('mousedown', e => e.stopPropagation());
  panel.addEventListener('wheel', e => e.stopPropagation());

  // Boutons de zoom
  const zoomContainer = document.createElement('div');
  zoomContainer.style.cssText = 'display: flex; gap: 2px; margin-bottom: 5px;';

  const zoomOut = document.createElement('button');
  zoomOut.textContent = '−';
  zoomOut.style.cssText = 'width: 30px; height: 30px; border: 1px solid #ccc; background: white; cursor: pointer;';
  zoomOut.addEventListener('click', (e) => { 
    e.stopPropagation(); 
    board.zoomOut(); 
    board.update(); 
  });

  const zoomIn = document.createElement('button');
  zoomIn.textContent = '+';
  zoomIn.style.cssText = 'width: 30px; height: 30px; border: 1px solid #ccc; background: white; cursor: pointer;';
  zoomIn.addEventListener('click', (e) => { 
    e.stopPropagation(); 
    board.zoomIn(); 
    board.update(); 
  });

  zoomContainer.appendChild(zoomOut);
  zoomContainer.appendChild(zoomIn);

  // Boutons de rotation
  const rotateContainer = document.createElement('div');
  rotateContainer.style.cssText = 'display: flex; gap: 2px; margin-bottom: 5px;';

  const rotateLeft = document.createElement('button');
  rotateLeft.textContent = '↶';
  rotateLeft.style.cssText = 'width: 30px; height: 30px; border: 1px solid #ccc; background: white; cursor: pointer;';
  rotateLeft.addEventListener('click', (e) => { 
    e.stopPropagation(); 
    if (typeof rotateFigureLeft === 'function') rotateFigureLeft(); 
  });

  const rotateRight = document.createElement('button');
  rotateRight.textContent = '↷';
  rotateRight.style.cssText = 'width: 30px; height: 30px; border: 1px solid #ccc; background: white; cursor: pointer;';
  rotateRight.addEventListener('click', (e) => { 
    e.stopPropagation(); 
    if (typeof rotateFigure === 'function') rotateFigure(); 
  });

  rotateContainer.appendChild(rotateLeft);
  rotateContainer.appendChild(rotateRight);

  // Bouton reset
  const resetBtn = document.createElement('button');
  resetBtn.textContent = 'Reset';
  resetBtn.style.cssText = 'width: 62px; height: 25px; border: 1px solid #ccc; background: white; cursor: pointer; font-size: 11px;';
  resetBtn.addEventListener('click', (e) => { 
    e.stopPropagation(); 
    resetBoard(); 
  });

  panel.appendChild(zoomContainer);
  panel.appendChild(rotateContainer);
  panel.appendChild(resetBtn);
  container.appendChild(panel);
}

function getLabel(index) {
  const defaultLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
  if (customLabels && customLabels.length > index) {
    return customLabels[index];
  }
  return defaultLabels[index];
}

function resetBoard() {
  console.log('🔄 Reset du board');
  
  // Décocher toutes les checkboxes
  const checkboxes = [
    'toggleRightAngles', 'toggleEqualAngles', 'toggleLengths',
    'showUnitsCheckbox', 'toggleCodings', 'toggleDiagonals',
    'toggleRadius', 'toggleDiameter'
  ];
  
  checkboxes.forEach(id => {
    const checkbox = document.getElementById(id);
    if (checkbox) checkbox.checked = false;
  });
  
  const unitGroup = document.getElementById('unitGroup');
  if (unitGroup) unitGroup.style.display = 'none';

  // Nettoyer le board
  clearBoard();
  
  // Recreate board controls
  createBoardControls();
  
  console.log('✅ Board réinitialisé');
}

// Fonctions temporaires (seront remplacées par les vrais modules)
function rotateFigure() {
  console.log('🔄 Rotation droite (temporaire)');
}

function rotateFigureLeft() {
  console.log('🔄 Rotation gauche (temporaire)');
}

function exportBoardToSVG() {
  console.log('📤 Export SVG (temporaire)');
  alert('Export pas encore implémenté');
}

// === DÉMARRAGE ===
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

console.log('✅ Core.js chargé');