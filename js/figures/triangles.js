// js/figures/triangles.js

function drawTriangleEquilateral(side) {
  console.log(`Création d'un triangle équilatéral de côté ${side}`);
  
  const height = side * Math.sqrt(3) / 2;
  
  const A = board.create('point', [0, 0], { visible: false, fixed: true });
  const B = board.create('point', [side, 0], { visible: false, fixed: true });
  const C = board.create('point', [side / 2, height], { visible: false, fixed: true });

  points = [A, B, C];
  
  polygon = board.create('polygon', points, {
    borders: { strokeColor: 'black', fixed: true },
    fillColor: 'white',
    fillOpacity: 1
  });

  const labelA = board.create('text', [A.X() - 0.3, A.Y() - 0.3, getLabel(0)]);
  const labelB = board.create('text', [B.X() + 0.3, B.Y() - 0.3, getLabel(1)]);
  const labelC = board.create('text', [C.X(), C.Y() + 0.3, getLabel(2)]);
  texts.push(labelA, labelB, labelC);

  board.update();
  console.log('✅ Triangle équilatéral créé');
}

function drawTriangleRectangle(base, height) {
  console.log(`Création d'un triangle rectangle base ${base}, hauteur ${height}`);
  
  const A = board.create('point', [0, 0], { visible: false, fixed: true });
  const B = board.create('point', [base, 0], { visible: false, fixed: true });
  const C = board.create('point', [0, height], { visible: false, fixed: true });

  points = [A, B, C];
  
  polygon = board.create('polygon', points, {
    borders: { strokeColor: 'black', fixed: true },
    fillColor: 'white',
    fillOpacity: 1
  });

  const labelA = board.create('text', [A.X() - 0.3, A.Y() - 0.3, getLabel(0)]);
  const labelB = board.create('text', [B.X() + 0.3, B.Y() - 0.3, getLabel(1)]);
  const labelC = board.create('text', [C.X() - 0.3, C.Y() + 0.3, getLabel(2)]);
  texts.push(labelA, labelB, labelC);

  board.update();
  console.log('✅ Triangle rectangle créé');
}

function drawTriangleIsocele(base, height) {
  console.log(`Création d'un triangle isocèle base ${base}, hauteur ${height}`);
  
  const A = board.create('point', [0, 0], { visible: false, fixed: true });
  const B = board.create('point', [base, 0], { visible: false, fixed: true });
  const C = board.create('point', [base / 2, height], { visible: false, fixed: true });

  points = [A, B, C];
  
  polygon = board.create('polygon', points, {
    borders: { strokeColor: 'black', fixed: true },
    fillColor: 'white',
    fillOpacity: 1
  });

  const labelA = board.create('text', [A.X() - 0.3, A.Y() - 0.3, getLabel(0)]);
  const labelB = board.create('text', [B.X() + 0.3, B.Y() - 0.3, getLabel(1)]);
  const labelC = board.create('text', [C.X(), C.Y() + 0.3, getLabel(2)]);
  texts.push(labelA, labelB, labelC);

  board.update();
  console.log('✅ Triangle isocèle créé');
}

console.log('✅ Triangles.js chargé');