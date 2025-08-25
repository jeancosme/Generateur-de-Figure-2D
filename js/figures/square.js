// js/figures/square.js

function drawSquare(size) {
  console.log(`Création d'un carré de côté ${size}`);
  
  // Points dans l'ordre horaire : A(haut-gauche), B(haut-droite), C(bas-droite), D(bas-gauche)
  const A = board.create('point', [0, size], {name: '', fixed: true, visible: false});
  const B = board.create('point', [size, size], {name: '', fixed: true, visible: false});
  const C = board.create('point', [size, 0], {name: '', fixed: true, visible: false});
  const D = board.create('point', [0, 0], {name: '', fixed: true, visible: false});

  points = [A, B, C, D];
  
  polygon = board.create('polygon', points, {
    withLabel: false,
    borders: {strokeColor: "black", fixed: true},
    fillColor: "white",
    fillOpacity: 1
  });

  // Labels
  let labelA = board.create('text', [A.X() - 0.3, A.Y() + 0.3, getLabel(0)]);
  let labelB = board.create('text', [B.X() + 0.3, B.Y() + 0.3, getLabel(1)]);
  let labelC = board.create('text', [C.X() + 0.3, C.Y() - 0.3, getLabel(2)]);
  let labelD = board.create('text', [D.X() - 0.3, D.Y() - 0.3, getLabel(3)]);
  texts.push(labelA, labelB, labelC, labelD);

  board.update();
  console.log('✅ Carré créé');
}

console.log('✅ Square.js chargé');