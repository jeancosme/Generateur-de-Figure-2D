// js/figures/parallelogram.js

function drawParallelogram(base, sideLength) {
  console.log(`Création d'un parallélogramme base ${base}, hauteur ${sideLength}`);
  
  const theta = Math.PI / 3; // 60°
  const offset = sideLength * Math.cos(theta); // projection horizontale du côté oblique
  const height = sideLength * Math.sin(theta); // hauteur effective

  // Créer les points dans l'ordre horaire voulu
  // A = haut-gauche, B = haut-droite, C = bas-droite, D = bas-gauche
  const A = board.create('point', [-offset, height], { visible: false, fixed: true });
  const B = board.create('point', [base - offset, height], { visible: false, fixed: true });
  const C = board.create('point', [base, 0], { visible: false, fixed: true });
  const D = board.create('point', [0, 0], { visible: false, fixed: true });

  points = [A, B, C, D];

  polygon = board.create('polygon', points, {
    borders: { strokeColor: "black" },
    fillColor: "white",
    fillOpacity: 1
  });

  // Labels positionnés selon leur VRAIE position géométrique
  const labelA = board.create('text', [A.X() - 0.3, A.Y() + 0.3, getLabel(0)], {fontSize: 14});
  const labelB = board.create('text', [B.X() + 0.3, B.Y() + 0.3, getLabel(1)], {fontSize: 14});
  const labelC = board.create('text', [C.X() + 0.3, C.Y() - 0.3, getLabel(2)], {fontSize: 14});
  const labelD = board.create('text', [D.X() - 0.3, D.Y() - 0.3, getLabel(3)], {fontSize: 14});
  
  texts.push(labelA, labelB, labelC, labelD);

  board.update();
  console.log('✅ Parallélogramme créé');
}

console.log('✅ Parallelogram.js chargé');