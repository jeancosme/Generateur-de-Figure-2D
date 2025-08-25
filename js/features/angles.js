// js/features/angles.js

function updateRightAngleMarkers(isChecked) {
  console.log('🔄 Mise à jour angles droits:', isChecked);
  
  // Nettoyer les marqueurs existants
  rightAngleMarkers.forEach(marker => {
    try { board.removeObject(marker); } catch(e) {}
  });
  rightAngleMarkers = [];

  if (!isChecked || !points || points.length < 3) return;

  // Détecter les angles droits selon le type de figure
  if (polygon && points.length === 4) {
    // Quadrilatères - vérifier tous les angles
    for (let i = 0; i < 4; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % 4];
      const p3 = points[(i + 2) % 4];
      
      if (isRightAngle(p1, p2, p3)) {
        const marker = board.create('angle', [p1, p2, p3], {
          type: 'square',
          size: 8,
          fillColor: '#ff0000',
          strokeColor: '#ff0000',
          fillOpacity: 0.3
        });
        rightAngleMarkers.push(marker);
      }
    }
  } else if (points.length === 3) {
    // Triangles - vérifier les 3 angles
    for (let i = 0; i < 3; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % 3];
      const p3 = points[(i + 2) % 3];
      
      if (isRightAngle(p1, p2, p3)) {
        const marker = board.create('angle', [p1, p2, p3], {
          type: 'square',
          size: 8,
          fillColor: '#ff0000',
          strokeColor: '#ff0000',
          fillOpacity: 0.3
        });
        rightAngleMarkers.push(marker);
      }
    }
  }

  board.update();
  console.log(`✅ ${rightAngleMarkers.length} angles droits affichés`);
}

function updateEqualAngleMarkers(isChecked) {
  console.log('🔄 Mise à jour angles égaux:', isChecked);
  
  // Nettoyer les marqueurs existants
  angleMarkers.forEach(marker => {
    try { board.removeObject(marker); } catch(e) {}
  });
  angleMarkers = [];

  if (!isChecked || !points || points.length < 3) return;

  // Logique pour marquer les angles égaux selon le type de figure
  if (points.length === 3) {
    // Triangle isocèle ou équilatéral
    const angles = [];
    for (let i = 0; i < 3; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % 3];
      const p3 = points[(i + 2) % 3];
      angles.push(calculateAngle(p1, p2, p3));
    }
    
    // Marquer les angles égaux avec des arcs similaires
    for (let i = 0; i < 3; i++) {
      for (let j = i + 1; j < 3; j++) {
        if (Math.abs(angles[i] - angles[j]) < 0.1) { // Angles égaux (tolérance)
          const marker1 = board.create('angle', [points[i], points[(i + 1) % 3], points[(i + 2) % 3]], {
            type: 'sector',
            size: 12,
            fillColor: '#00aa00',
            strokeColor: '#00aa00',
            fillOpacity: 0.2
          });
          const marker2 = board.create('angle', [points[j], points[(j + 1) % 3], points[(j + 2) % 3]], {
            type: 'sector',
            size: 12,
            fillColor: '#00aa00',
            strokeColor: '#00aa00',
            fillOpacity: 0.2
          });
          angleMarkers.push(marker1, marker2);
        }
      }
    }
  }

  board.update();
  console.log(`✅ ${angleMarkers.length} angles égaux affichés`);
}

// Fonctions utilitaires
function isRightAngle(p1, p2, p3) {
  const dx1 = p1.X() - p2.X();
  const dy1 = p1.Y() - p2.Y();
  const dx2 = p3.X() - p2.X();
  const dy2 = p3.Y() - p2.Y();
  
  const dotProduct = dx1 * dx2 + dy1 * dy2;
  return Math.abs(dotProduct) < 0.1; // Tolérance pour angle droit
}

function calculateAngle(p1, p2, p3) {
  const dx1 = p1.X() - p2.X();
  const dy1 = p1.Y() - p2.Y();
  const dx2 = p3.X() - p2.X();
  const dy2 = p3.Y() - p2.Y();
  
  const dot = dx1 * dx2 + dy1 * dy2;
  const mag1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
  const mag2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
  
  return Math.acos(dot / (mag1 * mag2));
}

console.log('✅ Angles.js chargé');