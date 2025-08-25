// js/figures/polygons.js

function drawRegularPolygon(sides, radius) {
  console.log(`Création d'un polygone régulier à ${sides} côtés, rayon ${radius}`);
  
  const angleStep = (2 * Math.PI) / sides;
  const polygonPoints = [];
  
  // Créer les points du polygone
  for (let i = 0; i < sides; i++) {
    const angle = i * angleStep - Math.PI / 2; // Commencer par le haut
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    
    const point = board.create('point', [x, y], {
      visible: false,
      fixed: true
    });
    polygonPoints.push(point);
  }
  
  points = polygonPoints;
  
  polygon = board.create('polygon', points, {
    borders: { strokeColor: 'black', fixed: true },
    fillColor: 'white',
    fillOpacity: 1
  });
  
  // Labels
  const labels = [];
  for (let i = 0; i < sides; i++) {
    const point = points[i];
    const angle = i * angleStep - Math.PI / 2;
    
    // Offset pour les labels (plus loin du centre)
    const labelOffset = 0.4;
    const labelX = point.X() + labelOffset * Math.cos(angle);
    const labelY = point.Y() + labelOffset * Math.sin(angle);
    
    const label = board.create('text', [labelX, labelY, getLabel(i)], {
      fontSize: 14
    });
    labels.push(label);
  }
  
  texts = labels;
  
  board.update();
  console.log(`✅ Polygone à ${sides} côtés créé`);
}

function drawHexagone(side) {
  console.log(`Création d'un hexagone de côté ${side}`);
  
  // Pour un hexagone régulier, le rayon circonscrit = côté
  drawRegularPolygon(6, side);
}

function drawPentagone(side) {
  console.log(`Création d'un pentagone de côté ${side}`);
  
  // Pour un pentagone régulier, calculer le rayon circonscrit
  const radius = side / (2 * Math.sin(Math.PI / 5));
  drawRegularPolygon(5, radius);
}

console.log('✅ Polygons.js chargé');