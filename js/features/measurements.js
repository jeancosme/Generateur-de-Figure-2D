// js/features/measurements.js

function updateLengthLabels() {
  const isChecked = document.getElementById('toggleLengths')?.checked || false;
  const showUnits = document.getElementById('showUnitsCheckbox')?.checked || false;
  const unit = document.getElementById('unitSelector')?.value || 'cm';
  
  console.log('🔄 Mise à jour mesures:', isChecked, 'unités:', showUnits, unit);

  // Nettoyer les labels existants
  lengthLabels.forEach(label => {
    try { board.removeObject(label); } catch(e) {}
  });
  lengthLabels = [];

  // Afficher/masquer le groupe unités
  const unitGroup = document.getElementById('unitGroup');
  if (unitGroup) {
    unitGroup.style.display = isChecked ? 'block' : 'none';
  }

  if (!isChecked || !points || points.length < 2) return;

  if (circleObject && centerPoint && circlePoint) {
    // Cercle - afficher le rayon
    const radius = Math.hypot(circlePoint.X() - centerPoint.X(), circlePoint.Y() - centerPoint.Y());
    const radiusText = showUnits ? `r = ${radius.toFixed(1)}${unit}` : `r = ${radius.toFixed(1)}`;
    
    if (radiusSegment && radiusSegment.getAttribute('visible')) {
      const midX = (centerPoint.X() + circlePoint.X()) / 2;
      const midY = (centerPoint.Y() + circlePoint.Y()) / 2;
      
      const label = board.create('text', [midX, midY + 0.3, radiusText], {
        fontSize: 12,
        color: 'red'
      });
      lengthLabels.push(label);
    }
  } else if (polygon && points.length >= 3) {
    // Polygones - afficher les longueurs des côtés
    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % points.length];
      
      const length = Math.hypot(p2.X() - p1.X(), p2.Y() - p1.Y());
      const lengthText = showUnits ? `${length.toFixed(1)}${unit}` : `${length.toFixed(1)}`;
      
      // Position du milieu du segment
      const midX = (p1.X() + p2.X()) / 2;
      const midY = (p1.Y() + p2.Y()) / 2;
      
      // Décalage perpendiculaire pour éviter que le texte soit sur le segment
      const dx = p2.X() - p1.X();
      const dy = p2.Y() - p1.Y();
      const length_seg = Math.sqrt(dx * dx + dy * dy);
      const offsetX = -dy / length_seg * 0.3;
      const offsetY = dx / length_seg * 0.3;
      
      const label = board.create('text', [midX + offsetX, midY + offsetY, lengthText], {
        fontSize: 10,
        color: 'blue'
      });
      lengthLabels.push(label);
    }
  }

  board.update();
  console.log(`✅ ${lengthLabels.length} mesures affichées`);
}

console.log('✅ Measurements.js chargé');