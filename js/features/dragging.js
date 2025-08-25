// js/features/dragging.js

function addDraggingToPolygon(polygon, points, texts) {
  console.log('🔄 Ajout du dragging au polygone');
  
  if (!polygon || !points || !texts) {
    console.warn('⚠️ Éléments manquants pour le dragging');
    return;
  }

  // Fonction pour mettre à jour les positions des labels
  function updateLabels() {
    if (texts && texts.length >= points.length) {
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        const label = texts[i];
        
        if (point && label) {
          // Calculer les offsets selon la position du point
          let offsetX = -0.3;
          let offsetY = -0.3;
          
          // Ajuster selon la position relative du point
          if (i === 1 || i === 2) offsetX = 0.3; // Points de droite
          if (i === 0 || i === 1) offsetY = 0.3; // Points du haut
          
          label.setPosition(JXG.COORDS_BY_USER, [
            point.X() + offsetX, 
            point.Y() + offsetY
          ]);
        }
      }
    }
  }

  // Fonction pour mettre à jour toutes les features quand on bouge la figure
  function updateAllFeatures() {
    // Mettre à jour les angles si activés
    if (document.getElementById('toggleRightAngles')?.checked) {
      updateRightAngleMarkers(true);
    }
    if (document.getElementById('toggleEqualAngles')?.checked) {
      updateEqualAngleMarkers(true);
    }
    
    // Mettre à jour les mesures si activées
    if (document.getElementById('toggleLengths')?.checked) {
      updateLengthLabels();
    }
    
    // Mettre à jour les codages si activés
    if (document.getElementById('toggleCodings')?.checked) {
      updateCodings();
    }
    
    // Mettre à jour les diagonales si activées
    if (document.getElementById('toggleDiagonals')?.checked) {
      updateDiagonals();
    }
  }

  // Rendre les points draggables
  points.forEach((point, index) => {
    point.setAttribute({
      visible: false, // Garder les points invisibles
      fixed: false    // Mais les rendre draggables
    });

    // Event listener pour le drag
    point.on('drag', function() {
      updateLabels();
      // Petit délai pour les features lourdes
      clearTimeout(point.updateTimeout);
      point.updateTimeout = setTimeout(updateAllFeatures, 100);
    });
  });

  console.log('✅ Dragging configuré');
}

console.log('✅ Dragging.js chargé');