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
import { board } from './config.js';

// Initialisation du board JSXGraph
import { initBoard } from './board.js';

// Interface utilisateur et événements
import { setupEventListeners, generateFigure, exportBoardToSVG, copyBoardToClipboard } from './ui.js';

// Effets visuels
import { toggleHandDrawnEffect } from './effects.js';

// Marqueurs visuels
import { 
  updateLengthLabels, 
  updateCodings, 
  updateRightAngleMarkers, 
  updateEqualAngleMarkers, 
  updateDiagonals,
  updateCircleExtras
} from './markers.js';

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
