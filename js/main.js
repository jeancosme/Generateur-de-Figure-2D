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

console.log('🚀 Initialisation du Générateur de Figures 2D...');

// ==========================================
// EXPOSITION DES FONCTIONS GLOBALES D'ABORD
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
window.changeLanguage = changeLanguage;
window.createSimilarTriangle = createSimilarTriangle;
window.removeSimilarTriangle = removeSimilarTriangle;
window.updateSimilarTriangle = updateSimilarTriangle;

console.log('✅ Fonctions exposées globalement');

// Vérifier que JXG est chargé
if (typeof JXG === 'undefined') {
  console.error('❌ JSXGraph (JXG) n\'est pas chargé !');
  alert('Erreur : JSXGraph n\'est pas chargé. Vérifiez votre connexion Internet.');
} else {
  console.log('✅ JSXGraph détecté');
  
  // 1. Initialiser le board JSXGraph
  initBoard();
  console.log('✅ Board JSXGraph initialisé');

  // 2. Configurer les event listeners
  setupEventListeners();
  console.log('✅ Event listeners configurés');
  
  // 3. Initialiser la langue par défaut (français)
  document.getElementById('flagFR').classList.add('active');
  
  console.log('🎉 Application prête !');
}
