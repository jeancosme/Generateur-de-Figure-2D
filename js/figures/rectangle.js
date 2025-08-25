// js/figures/rectangle.js

function drawRectangle(width, height) {
  console.log(`Création d'un rectangle ${width} x ${height}`);
  
  // Points dans l'ordre horaire : A(haut-gauche), B(haut-droite), C(bas-droite), D(bas-gauche)
  const A = board.create('point', [0, height], {name: '', fixed: true, visible: false});
  const B = board.create('point', [width, height], {name: '', fixed: true, visible: false});
  const C = board.create('point', [width, 0], {name: '', fixed: true, visible: false});
  const D = board.create('point', [0, 0], {name: '', fixed: true, visible: false});

  points = [A, B, C, D];
  
  polygon = board.create('polygon', points, {
    borders: {strokeColor: "black", fixed: true},
    fillColor: "white",
    fillOpacity: 1
  });

  // Labels positionnés selon leur position réelle
  let labelA = board.create('text', [A.X() - 0.3, A.Y() + 0.3, getLabel(0)]);
  let labelB = board.create('text', [B.X() + 0.3, B.Y() + 0.3, getLabel(1)]);
  let labelC = board.create('text', [C.X() + 0.3, C.Y() - 0.3, getLabel(2)]);
  let labelD = board.create('text', [D.X() - 0.3, D.Y() - 0.3, getLabel(3)]);
  texts.push(labelA, labelB, labelC, labelD);

  board.update();
  console.log('✅ Rectangle créé');
}

console.log('✅ Rectangle.js chargé');