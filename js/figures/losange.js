// js/figures/losange.js

function drawLosange(side) {
  console.log(`Création d'un losange de côté ${side}`);
  
  const theta = Math.PI / 3;           // 60°
  const ox = side * Math.cos(theta);   // projection horizontale du côté oblique
  const oy = side * Math.sin(theta);   // hauteur

  // Rotation de 30° vers la droite (π/6 radians)
  const rotationAngle = Math.PI / 6;   // 30° en radians
  
  function rotate(x, y) {
    const cos = Math.cos(rotationAngle);
    const sin = Math.sin(rotationAngle);
    return [x * cos - y * sin, x * sin + y * cos];
  }

  // Créer les points de base puis les faire tourner
  const baseA = [-ox, oy];       // HAUT-GAUCHE original
  const baseB = [side - ox, oy]; // HAUT-DROITE original
  const baseC = [side, 0];       // BAS-DROITE original
  const baseD = [0, 0];          // BAS-GAUCHE original

  // Appliquer la rotation de 30°
  const [rotA_x, rotA_y] = rotate(baseA[0], baseA[1]);
  const [rotB_x, rotB_y] = rotate(baseB[0], baseB[1]);
  const [rotC_x, rotC_y] = rotate(baseC[0], baseC[1]);
  const [rotD_x, rotD_y] = rotate(baseD[0], baseD[1]);

  const A = board.create('point', [rotA_x, rotA_y], { visible: false, fixed: true });
  const B = board.create('point', [rotB_x, rotB_y], { visible: false, fixed: true });
  const C = board.create('point', [rotC_x, rotC_y], { visible: false, fixed: true });
  const D = board.create('point', [rotD_x, rotD_y], { visible: false, fixed: true });

  points = [A, B, C, D];
  polygon = board.create('polygon', points, {
    borders: { strokeColor: 'black', fixed: true },
    fillColor: 'white',
    fillOpacity: 1
  });

  // Labels avec positions ajustées pour la rotation
  const LA = board.create('text', [A.X() - 0.35, A.Y() + 0.25, getLabel(0)]);
  const LB = board.create('text', [B.X() + 0.2, B.Y() + 0.25, getLabel(1)]);
  const LC = board.create('text', [C.X() + 0.35, C.Y() - 0.25, getLabel(2)]);
  const LD = board.create('text', [D.X() - 0.3, D.Y() - 0.3, getLabel(3)]);
  texts.push(LA, LB, LC, LD);

  board.update();
  console.log('✅ Losange créé');
}

console.log('✅ Losange.js chargé');