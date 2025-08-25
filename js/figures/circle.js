// js/figures/circle.js

function drawCircle(radius) {
  console.log(`Création d'un cercle de rayon ${radius}`);
  
  // Centre au milieu du board
  centerPoint = board.create('point', [0, 0], {
    name: getLabel(0),
    size: 3,
    fillColor: 'black',
    strokeColor: 'black'
  });

  // Point sur le cercle
  circlePoint = board.create('point', [radius, 0], {
    name: getLabel(1),
    size: 3,
    fillColor: 'blue',
    strokeColor: 'blue'
  });

  // Le cercle
  circleObject = board.create('circle', [centerPoint, circlePoint], {
    strokeColor: 'black',
    strokeWidth: 2,
    fillColor: 'transparent'
  });

  // Rayon par défaut (invisible)
  radiusSegment = board.create('segment', [centerPoint, circlePoint], {
    visible: false,
    strokeColor: 'red',
    strokeWidth: 2,
    dash: 2
  });

  // Label du rayon (invisible par défaut)
  const midX = (centerPoint.X() + circlePoint.X()) / 2;
  const midY = (centerPoint.Y() + circlePoint.Y()) / 2;
  radiusLabel = board.create('text', [midX, midY + 0.3, `r = ${radius}`], {
    visible: false,
    fontSize: 12,
    color: 'red'
  });

  points = [centerPoint, circlePoint];
  texts = [];

  board.update();
  console.log('✅ Cercle créé');
}

console.log('✅ Circle.js chargé');