// js/features/circle-options.js

function updateCircleRadius() {
  const isChecked = document.getElementById('toggleRadius')?.checked || false;
  console.log('🔄 Mise à jour rayon:', isChecked);

  if (radiusSegment) {
    radiusSegment.setAttribute({visible: isChecked});
  }

  if (radiusLabel) {
    radiusLabel.setAttribute({visible: isChecked});
  }

  // Mettre à jour les mesures si elles sont activées
  if (document.getElementById('toggleLengths')?.checked) {
    updateLengthLabels();
  }

  board.update();
  console.log(`✅ Rayon ${isChecked ? 'affiché' : 'masqué'}`);
}

function updateCircleDiameter() {
  const isChecked = document.getElementById('toggleDiameter')?.checked || false;
  console.log('🔄 Mise à jour diamètre:', isChecked);

  // Nettoyer le diamètre existant
  if (diameterSegment) {
    try { board.removeObject(diameterSegment); } catch(e) {}
    diameterSegment = null;
  }
  diameterPoints.forEach(point => {
    try { board.removeObject(point); } catch(e) {}
  });
  diameterPoints = [];

  if (!isChecked || !centerPoint || !circleObject) return;

  // Créer un diamètre horizontal
  const radius = Math.hypot(circlePoint.X() - centerPoint.X(), circlePoint.Y() - centerPoint.Y());
  
  const leftPoint = board.create('point', [centerPoint.X() - radius, centerPoint.Y()], {
    visible: false,
    fixed: true
  });
  
  const rightPoint = board.create('point', [centerPoint.X() + radius, centerPoint.Y()], {
    visible: false,
    fixed: true
  });

  diameterSegment = board.create('segment', [leftPoint, rightPoint], {
    strokeColor: 'purple',
    strokeWidth: 2,
    dash: 1
  });

  diameterPoints = [leftPoint, rightPoint];

  board.update();
  console.log(`✅ Diamètre ${isChecked ? 'affiché' : 'masqué'}`);
}

console.log('✅ Circle-options.js chargé');