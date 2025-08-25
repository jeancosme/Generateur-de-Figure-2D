// js/features/rotation.js

function rotateFigure() {
  console.log('🔄 Rotation droite +10°');
  rotateFigureBy(10);
}

function rotateFigureLeft() {
  console.log('🔄 Rotation gauche -10°');
  rotateFigureBy(-10);
}

function rotateFigureBy(degrees) {
  if (!points || points.length === 0) {
    console.warn('⚠️ Aucune figure à faire tourner');
    return;
  }

  const angle = degrees * Math.PI / 180; // Convertir en radians
  
  // Calculer le centre de la figure
  const center = getFigureCenter();
  
  // Faire tourner chaque point
  points.forEach(point => {
    const x = point.X() - center.x;
    const y = point.Y() - center.y;
    
    const newX = x * Math.cos(angle) - y * Math.sin(angle) + center.x;
    const newY = x * Math.sin(angle) + y * Math.cos(angle) + center.y;
    
    point.setPosition(JXG.COORDS_BY_USER, [newX, newY]);
  });

  // Mettre à jour les labels
  if (texts && texts.length > 0) {
    for (let i = 0; i < Math.min(texts.length, points.length); i++) {
      const point = points[i];
      const label = texts[i];
      
      if (point && label) {
        let offsetX = -0.3;
        let offsetY = -0.3;
        
        // Ajuster les offsets selon la position
        if (i === 1 || i === 2) offsetX = 0.3;
        if (i === 0 || i === 1) offsetY = 0.3;
        
        label.setPosition(JXG.COORDS_BY_USER, [
          point.X() + offsetX, 
          point.Y() + offsetY
        ]);
      }
    }
  }

  // Mettre à jour les features actives
  updateActiveFeatures();
  
  board.update();
  console.log(`✅ Figure tournée de ${degrees}°`);
}

function getFigureCenter() {
  if (!points || points.length === 0) {
    return { x: 0, y: 0 };
  }

  let sumX = 0;
  let sumY = 0;
  
  points.forEach(point => {
    sumX += point.X();
    sumY += point.Y();
  });
  
  return {
    x: sumX / points.length,
    y: sumY / points.length
  };
}

function updateActiveFeatures() {
  // Mettre à jour toutes les features actives après rotation
  setTimeout(() => {
    if (document.getElementById('toggleRightAngles')?.checked) {
      updateRightAngleMarkers(true);
    }
    if (document.getElementById('toggleEqualAngles')?.checked) {
      updateEqualAngleMarkers(true);
    }
    if (document.getElementById('toggleLengths')?.checked) {
      updateLengthLabels();
    }
    if (document.getElementById('toggleCodings')?.checked) {
      updateCodings();
    }
    if (document.getElementById('toggleDiagonals')?.checked) {
      updateDiagonals();
    }
  }, 50);
}

console.log('✅ Rotation.js chargé');