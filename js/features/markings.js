// js/features/markings.js

function updateCodings() {
  const isChecked = document.getElementById('toggleCodings')?.checked || false;
  console.log('🔄 Mise à jour codages:', isChecked);

  // Nettoyer les codages existants
  codingMarks.forEach(mark => {
    try { board.removeObject(mark); } catch(e) {}
  });
  codingMarks = [];

  if (!isChecked || !points || points.length < 3) return;

  if (points.length === 4) {
    // Quadrilatères - marquer les côtés égaux
    const sides = [];
    for (let i = 0; i < 4; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % 4];
      const length = Math.hypot(p2.X() - p1.X(), p2.Y() - p1.Y());
      sides.push({ length, p1, p2, index: i });
    }

    // Grouper les côtés égaux
    const equalSides = [];
    for (let i = 0; i < sides.length; i++) {
      for (let j = i + 1; j < sides.length; j++) {
        if (Math.abs(sides[i].length - sides[j].length) < 0.1) {
          equalSides.push([sides[i], sides[j]]);
        }
      }
    }

    // Marquer les côtés égaux avec des traits
    equalSides.forEach((pair, groupIndex) => {
      pair.forEach(side => {
        const midX = (side.p1.X() + side.p2.X()) / 2;
        const midY = (side.p1.Y() + side.p2.Y()) / 2;
        
        // Traits perpendiculaires au segment
        const dx = side.p2.X() - side.p1.X();
        const dy = side.p2.Y() - side.p1.Y();
        const length = Math.sqrt(dx * dx + dy * dy);
        const offsetX = -dy / length * 0.15;
        const offsetY = dx / length * 0.15;
        
        for (let t = 0; t <= groupIndex; t++) {
          const mark = board.create('segment', [
            [midX + offsetX * (t - groupIndex/2), midY + offsetY * (t - groupIndex/2)],
            [midX - offsetX * (t - groupIndex/2), midY - offsetY * (t - groupIndex/2)]
          ], {
            strokeColor: 'red',
            strokeWidth: 2
          });
          codingMarks.push(mark);
        }
      });
    });
  } else if (points.length === 3) {
    // Triangles - marquer les côtés égaux
    const sides = [];
    for (let i = 0; i < 3; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % 3];
      const length = Math.hypot(p2.X() - p1.X(), p2.Y() - p1.Y());
      sides.push({ length, p1, p2, index: i });
    }

    // Grouper les côtés égaux
    const equalSides = [];
    for (let i = 0; i < sides.length; i++) {
      for (let j = i + 1; j < sides.length; j++) {
        if (Math.abs(sides[i].length - sides[j].length) < 0.1) {
          equalSides.push([sides[i], sides[j]]);
        }
      }
    }

    // Marquer les côtés égaux
    equalSides.forEach(pair => {
      pair.forEach(side => {
        const midX = (side.p1.X() + side.p2.X()) / 2;
        const midY = (side.p1.Y() + side.p2.Y()) / 2;
        
        const dx = side.p2.X() - side.p1.X();
        const dy = side.p2.Y() - side.p1.Y();
        const length = Math.sqrt(dx * dx + dy * dy);
        const offsetX = -dy / length * 0.15;
        const offsetY = dx / length * 0.15;
        
        const mark = board.create('segment', [
          [midX + offsetX, midY + offsetY],
          [midX - offsetX, midY - offsetY]
        ], {
          strokeColor: 'red',
          strokeWidth: 2
        });
        codingMarks.push(mark);
      });
    });
  }

  board.update();
  console.log(`✅ ${codingMarks.length} codages affichés`);
}

function updateDiagonals() {
  const isChecked = document.getElementById('toggleDiagonals')?.checked || false;
  console.log('🔄 Mise à jour diagonales:', isChecked);

  // Nettoyer les diagonales existantes
  diagonals.forEach(diagonal => {
    try { board.removeObject(diagonal); } catch(e) {}
  });
  diagonals = [];

  if (!isChecked || !points || points.length !== 4) return;

  // Créer les diagonales pour les quadrilatères
  const diagonal1 = board.create('segment', [points[0], points[2]], {
    strokeColor: 'green',
    strokeWidth: 1,
    dash: 2
  });
  
  const diagonal2 = board.create('segment', [points[1], points[3]], {
    strokeColor: 'green',
    strokeWidth: 1,
    dash: 2
  });

  diagonals.push(diagonal1, diagonal2);

  board.update();
  console.log(`✅ ${diagonals.length} diagonales affichées`);
}

console.log('✅ Markings.js chargé');