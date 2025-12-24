/**
 * ============================================
 * DRAWING.JS - Fonctions de dessin de figures
 * ============================================
 * 
 * Toutes les fonctions pour dessiner les différentes figures géométriques
 */


// ==========================================
// FONCTION DE DRAGGING
// ==========================================

/**
 * Ajoute la fonctionnalité de déplacement à un polygone
 */
function addDraggingToPolygon(polygon, figurePoints, figureTexts, handles = []) {
  let startCoords = null;

  polygon.rendNode.addEventListener('mousedown', function (e) {
    startCoords = board.getUsrCoordsOfMouse(e);

    function onMouseMove(ev) {
      const newCoords = board.getUsrCoordsOfMouse(ev);
      const dx = newCoords[0] - startCoords[0];
      const dy = newCoords[1] - startCoords[1];
      startCoords = newCoords;

      // 1. Déplacer les points principaux
      figurePoints.forEach(pt => {
        try { pt.moveTo([pt.X() + dx, pt.Y() + dy], 0); }
        catch (err) { try { pt.setPosition(JXG.COORDS_BY_USER, [pt.X() + dx, pt.Y() + dy]); } catch(e){} }
      });

      // 2. Déplacer les handles des labels de mesures
      if (lengthHandles && lengthHandles.length > 0) {
        lengthHandles.forEach(handle => {
          try { handle.moveTo([handle.X() + dx, handle.Y() + dy], 0); }
          catch (err) { try { handle.setPosition(JXG.COORDS_BY_USER, [handle.X() + dx, handle.Y() + dy]); } catch(e){} }
        });
      }

      // 3. Déplacer les handles des labels de points
      if (labelHandles && labelHandles.length > 0) {
        labelHandles.forEach(h => {
          try { h.moveTo([h.X() + dx, h.Y() + dy], 0); }
          catch (err) { try { h.setPosition(JXG.COORDS_BY_USER, [h.X() + dx, h.Y() + dy]); } catch(e){} }
        });
      }

      // 4. Déplacer les handles fournis en paramètre (legacy)
      handles.forEach(h => {
        try { h.moveTo([h.X() + dx, h.Y() + dy], 0); }
        catch (err) { try { h.setPosition(JXG.COORDS_BY_USER, [h.X() + dx, h.Y() + dy]); } catch(e){} }
      });

      // 5. Déplacer les textes
      figureTexts.forEach(txt => {
        try {
          if (typeof txt.setPosition === 'function') {
            txt.setPosition(JXG.COORDS_BY_USER, [txt.X() + dx, txt.Y() + dy]);
          }
        } catch (err) { /* ignore */ }
      });

      // 6. Mettre à jour les codages
      updateCodings();
      board.update();
    }

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      
      // Mise à jour complète après le déplacement
      setTimeout(() => {
        updateCodings();
        updateDiagonals();
        updateRightAngleMarkers(document.getElementById("toggleRightAngles")?.checked);
        updateEqualAngleMarkers(document.getElementById("toggleEqualAngles")?.checked);
        board.update();
      }, 50);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
}

// ==========================================
// CARRÉS
// ==========================================

function drawSquare(size) {
  const A = board.create('point', [0, size], {name: '', fixed: true, visible: false});
  const B = board.create('point', [size, size], {name: '', fixed: true, visible: false});
  const C = board.create('point', [size, 0], {name: '', fixed: true, visible: false});
  const D = board.create('point', [0, 0], {name: '', fixed: true, visible: false});

  const newPoints = [A, B, C, D];
  const newPolygon = board.create('polygon', newPoints, {
    withLabel: false,
    borders: {strokeColor: "black", fixed: true },
    fillColor: "white",
    fillOpacity: 1
  });

  const labelA = board.create('text', [A.X() - 0.3, A.Y() + 0.2, getLabel(0)]);
  const labelB = board.create('text', [B.X() + 0.15, B.Y() + 0.2, getLabel(1)]);
  const labelC = board.create('text', [C.X() + 0.15, C.Y() - 0.2, getLabel(2)]);
  const labelD = board.create('text', [D.X() - 0.3, D.Y() - 0.2, getLabel(3)]);
  const newTexts = [labelA, labelB, labelC, labelD];

  setPoints(newPoints);
  setPolygon(newPolygon);
  setTexts(newTexts);

  addDraggingToPolygon(newPolygon, newPoints, newTexts);
  updateRightAngleMarkers(document.getElementById("toggleRightAngles").checked);
  updateLengthLabels();
  updateCodings();
  updateDiagonals();
}

// ==========================================
// RECTANGLES
// ==========================================

function drawRectangle(width, height) {
  const A = board.create('point', [0, height], { name: '', fixed: true, visible: false });
  const B = board.create('point', [width, height], { name: '', fixed: true, visible: false });
  const C = board.create('point', [width, 0], { name: '', fixed: true, visible: false });
  const D = board.create('point', [0, 0], { name: '', fixed: true, visible: false });

  const newPoints = [A, B, C, D];
  const newPolygon = board.create('polygon', newPoints, {
    borders: {strokeColor: "black", fixed: true},
    fillColor: "white",
    fillOpacity: 1
  });

  const labelA = board.create('text', [A.X() - 0.3, A.Y() + 0.2, getLabel(0)]);
  const labelB = board.create('text', [B.X() + 0.15, B.Y() + 0.2, getLabel(1)]);
  const labelC = board.create('text', [C.X() + 0.15, C.Y() - 0.2, getLabel(2)]);
  const labelD = board.create('text', [D.X() - 0.3, D.Y() - 0.2, getLabel(3)]);
  const newTexts = [labelA, labelB, labelC, labelD];

  setPoints(newPoints);
  setPolygon(newPolygon);
  setTexts(newTexts);

  addDraggingToPolygon(newPolygon, newPoints, newTexts);
  updateCodings();
  updateDiagonals();
  updateLengthLabels();
  updateRightAngleMarkers(document.getElementById("toggleRightAngles").checked);
}

// ==========================================
// LOSANGES
// ==========================================

function drawLosange(side) {
  const theta = Math.PI / 3;
  const ox = side * Math.cos(theta);
  const oy = side * Math.sin(theta);
  const rotationAngle = Math.PI / 6;
  
  function rotate(x, y) {
    const cos = Math.cos(rotationAngle);
    const sin = Math.sin(rotationAngle);
    return [x * cos - y * sin, x * sin + y * cos];
  }

  const baseA = [-ox, oy];
  const baseB = [side - ox, oy];
  const baseC = [side, 0];
  const baseD = [0, 0];

  const [rotA_x, rotA_y] = rotate(baseA[0], baseA[1]);
  const [rotB_x, rotB_y] = rotate(baseB[0], baseB[1]);
  const [rotC_x, rotC_y] = rotate(baseC[0], baseC[1]);
  const [rotD_x, rotD_y] = rotate(baseD[0], baseD[1]);

  const A = board.create('point', [rotA_x, rotA_y], { visible: false, fixed: true });
  const B = board.create('point', [rotB_x, rotB_y], { visible: false, fixed: true });
  const C = board.create('point', [rotC_x, rotC_y], { visible: false, fixed: true });
  const D = board.create('point', [rotD_x, rotD_y], { visible: false, fixed: true });

  const newPoints = [A, B, C, D];
  const newPolygon = board.create('polygon', newPoints, {
    borders: { strokeColor: 'black', fixed: true },
    fillColor: 'white',
    fillOpacity: 1
  });

  const LA = board.create('text', [A.X() - 0.4, A.Y(), getLabel(0)], {fontSize: getGlobalFontSize()});
  const LB = board.create('text', [B.X() - 0.1, B.Y() + 0.3, getLabel(1)], {fontSize: getGlobalFontSize()});
  const LC = board.create('text', [C.X() + 0.25, C.Y(), getLabel(2)], {fontSize: getGlobalFontSize()});
  const LD = board.create('text', [D.X() - 0.1, D.Y() - 0.3, getLabel(3)], {fontSize: getGlobalFontSize()});
  const newTexts = [LA, LB, LC, LD];

  setPoints(newPoints);
  setPolygon(newPolygon);
  setTexts(newTexts);

  addDraggingToPolygon(newPolygon, newPoints, newTexts);
}

// ==========================================
// PARALLÉLOGRAMMES
// ==========================================

function drawParallelogram(base, sideLength) {
  const theta = Math.PI / 3;
  const offset = sideLength * Math.cos(theta);
  const height = sideLength * Math.sin(theta);

  const A = board.create('point', [-offset, height], { visible: false, fixed: true });
  const B = board.create('point', [base - offset, height], { visible: false, fixed: true });
  const C = board.create('point', [base, 0], { visible: false, fixed: true });
  const D = board.create('point', [0, 0], { visible: false, fixed: true });

  const newPoints = [A, B, C, D];
  const newPolygon = board.create('polygon', newPoints, {
    borders: { strokeColor: "black" },
    fillColor: "white",
    fillOpacity: 1
  });

  const labelA = board.create('text', [A.X() - 0.3, A.Y() + 0.3, getLabel(0)], {fontSize: getGlobalFontSize()});
  const labelB = board.create('text', [B.X() + 0.3, B.Y() + 0.3, getLabel(1)], {fontSize: getGlobalFontSize()});
  const labelC = board.create('text', [C.X() + 0.3, C.Y() - 0.3, getLabel(2)], {fontSize: getGlobalFontSize()});
  const labelD = board.create('text', [D.X() - 0.3, D.Y() - 0.3, getLabel(3)], {fontSize: getGlobalFontSize()});
  const newTexts = [labelA, labelB, labelC, labelD];

  setPoints(newPoints);
  setPolygon(newPolygon);
  setTexts(newTexts);

  addDraggingToPolygon(newPolygon, newPoints, newTexts);
  updateDiagonals();
  updateCodings();
  updateLengthLabels();
  updateRightAngleMarkers(document.getElementById("toggleRightAngles").checked);

  console.log(`Parallélogramme créé: Base=${base}, Côté=${sideLength}, Hauteur=${height.toFixed(2)}`);
}

// ==========================================
// TRIANGLES
// ==========================================

function drawEquilateralTriangle(side) {
  const A = board.create('point', [0, 0], {visible: false});
  const B = board.create('point', [side, 0], {visible: false});
  const height = (Math.sqrt(3) / 2) * side;
  const C = board.create('point', [side / 2, height], {visible: false});

  const newPoints = [A, B, C];
  const newPolygon = board.create('polygon', newPoints, {
    borders: {strokeColor: "black"},
    fillColor: "white",
    fillOpacity: 1
  });

  const labelA = board.create('text', [A.X(), A.Y() - 0.3, getLabel(0)]);
  const labelB = board.create('text', [B.X(), B.Y() - 0.3, getLabel(1)]);
  const labelC = board.create('text', [C.X(), C.Y() + 0.3, getLabel(2)]);
  const newTexts = [labelA, labelB, labelC];

  setPoints(newPoints);
  setPolygon(newPolygon);
  setTexts(newTexts);

  updateEqualAngleMarkers(document.getElementById("toggleEqualAngles")?.checked);
  addDraggingToPolygon(newPolygon, newPoints, newTexts);
}

function drawRightTriangle(base, height) {
  const offsetX = -base / 2;
  const offsetY = -height / 2;

  const A = board.create('point', [offsetX, offsetY], {visible: false, fixed: true});
  const B = board.create('point', [offsetX + base, offsetY], {visible: false, fixed: true});
  const C = board.create('point', [offsetX, offsetY + height], {visible:false, fixed: true});

  const newPoints = [A, B, C];
  const newPolygon = board.create('polygon', newPoints, {
    borders: {strokeColor: "black", fixed: true},
    fillColor: "white",
    fillOpacity: 1
  });

  const labelA = board.create('text', [A.X(), A.Y() - 0.3, getLabel(0)]);
  const labelB = board.create('text', [B.X(), B.Y() - 0.3, getLabel(1)]);
  const labelC = board.create('text', [C.X(), C.Y() + 0.3, getLabel(2)]);
  const newTexts = [labelA, labelB, labelC];

  setPoints(newPoints);
  setPolygon(newPolygon);
  setTexts(newTexts);

  addDraggingToPolygon(newPolygon, newPoints, newTexts);
  updateRightAngleMarkers(document.getElementById("toggleRightAngles").checked);
  console.log("→ Triangle rectangle généré avec base =", base, "et hauteur =", height);
}

function drawIsoscelesTriangle(base = 4, height = 3) {
  const A = board.create('point', [0, 0], {visible: false, fixed: true});
  const B = board.create('point', [base, 0], {visible: false, fixed: true});
  const C = board.create('point', [base / 2, height], {visible: false, fixed: true});

  const newPoints = [A, B, C];
  const newPolygon = board.create('polygon', newPoints, {
    borders: { strokeColor: 'black' },
    fillColor: 'white',
    fillOpacity: 1
  });

  const labelA = board.create('text', [A.X(), A.Y() - 0.3, getLabel(0)]);
  const labelB = board.create('text', [B.X(), B.Y() - 0.3, getLabel(1)]);
  const labelC = board.create('text', [C.X(), C.Y() + 0.3, getLabel(2)]);
  const newTexts = [labelA, labelB, labelC];

  setPoints(newPoints);
  setPolygon(newPolygon);
  setTexts(newTexts);

  addDraggingToPolygon(newPolygon, newPoints, newTexts);
  updateEqualAngleMarkers(document.getElementById("toggleEqualAngles")?.checked);
  updateRightAngleMarkers(document.getElementById("toggleRightAngles")?.checked);
  updateLengthLabels();
  updateCodings();
  updateDiagonals();
}

function drawScaleneTriangleFromSides(a, b, c) {
  // Vérification de l'inégalité triangulaire
  if (a + b <= c || a + c <= b || b + c <= a) {
    alert(`⚠️ Impossible de construire un triangle avec ces côtés !\n\n` +
          `Vérification de l'inégalité triangulaire :\n` +
          `• ${a} + ${b} = ${a + b} ${a + b > c ? '>' : '≤'} ${c}\n` +
          `• ${a} + ${c} = ${a + c} ${a + c > b ? '>' : '≤'} ${b}\n` +
          `• ${b} + ${c} = ${b + c} ${b + c > a ? '>' : '≤'} ${a}\n\n` +
          `Pour former un triangle, la somme de deux côtés doit être strictement supérieure au troisième.`);
    console.error(`❌ Triangle invalide : a=${a}, b=${b}, c=${c}`);
    return;
  }

  // Loi des cosinus
  const cosA = (a * a + c * c - b * b) / (2 * a * c);
  const angleA = Math.acos(Math.max(-1, Math.min(1, cosA)));
  
  const Cx = c * Math.cos(angleA);
  const Cy = c * Math.sin(angleA);
  
  const centerX = a / 2;
  const centerY = Cy / 2;
  
  const A = board.create('point', [-centerX, -centerY], {visible: false, fixed: true});
  const B = board.create('point', [a - centerX, -centerY], {visible: false, fixed: true});
  const C = board.create('point', [Cx - centerX, Cy - centerY], {visible: false, fixed: true});

  const newPoints = [A, B, C];
  const newPolygon = board.create('polygon', newPoints, {
    borders: {strokeColor: "black", fixed: true},
    fillColor: "white",
    fillOpacity: 1
  });

  const labelA = board.create('text', [A.X(), A.Y() - 0.3, getLabel(0)]);
  const labelB = board.create('text', [B.X(), B.Y() - 0.3, getLabel(1)]);
  const labelC = board.create('text', [C.X(), C.Y() + 0.3, getLabel(2)]);
  const newTexts = [labelA, labelB, labelC];

  setPoints(newPoints);
  setPolygon(newPolygon);
  setTexts(newTexts);

  addDraggingToPolygon(newPolygon, newPoints, newTexts);
  updateLengthLabels(document.getElementById("toggleLengths").checked);
  
  console.log(`→ Triangle quelconque généré : AB=${a}, BC=${b}, CA=${c}`);
}

// ==========================================
// POLYGONES RÉGULIERS
// ==========================================

function drawRegularPolygon(n, side) {
  const center = [0, 0];
  const angle = (2 * Math.PI) / n;
  const radius = side / (2 * Math.sin(Math.PI / n));

  const newPoints = [];
  for (let i = 0; i < n; i++) {
    const x = center[0] + radius * Math.cos(i * angle - Math.PI / 2);
    const y = center[1] + radius * Math.sin(i * angle - Math.PI / 2);
    newPoints.push(board.create('point', [x, y], {visible: false, fixed: true}));
  }

  const newPolygon = board.create('polygon', newPoints, {
    borders: {strokeColor: "black", fixed: true},
    fillColor: "white",
    fillOpacity: 1
  });

  const newTexts = [];
  for (let i = 0; i < newPoints.length; i++) {
    const pt = newPoints[i];
    const label = board.create('text', [pt.X() + 0.2, pt.Y() + 0.2, getLabel(i)]);
    newTexts.push(label);
  }

  setPoints(newPoints);
  setPolygon(newPolygon);
  setTexts(newTexts);

  addDraggingToPolygon(newPolygon, newPoints, newTexts);
}

// ==========================================
// CERCLES
// ==========================================

function drawCircle(radius) {
  // Cleanup
  if (centerPoint) try { board.removeObject(centerPoint); } catch (e) {}
  if (circlePoint) try { board.removeObject(circlePoint); } catch (e) {}
  if (circleObject) try { board.removeObject(circleObject); } catch (e) {}
  if (labelHandles && labelHandles.length) {
    labelHandles.forEach(h => { try { board.removeObject(h); } catch (e) {} });
    setLabelHandles([]);
  }
  if (labelTexts && labelTexts.length) {
    labelTexts.forEach(t => { try { board.removeObject(t); } catch (e) {} });
    setLabelTexts([]);
  }

  // Créer le centre
  const newCenterPoint = board.create('point', [0, 0], {
    name: '',
    showInfobox: false,
    fixed: false,
    size: 4,
    face: 'x',
    strokeColor: 'black',
    fillColor: 'black'
  });

  // Créer le cercle
  const newCircleObject = board.create('circle', [newCenterPoint, radius], {
    strokeWidth: 1.4,
    strokeColor: 'black'
  });

  // Point sur le cercle (glider)
  const newCirclePoint = board.create('glider', [radius, 0, newCircleObject], {
    name: '',
    showInfobox: false,
    size: 3,
    strokeColor: 'black',
    fillColor: 'black'
  });

  const newPoints = [newCirclePoint];
  
  // Labels personnalisés
  const customLabels = []; // TODO: récupérer depuis config
  let centerLabel = 'O';
  let pointLabel = 'A';
  
  if (customLabels && customLabels.length > 0) {
    centerLabel = customLabels[0] || 'O';
    pointLabel = customLabels[1] || 'A';
  }
  
  // Label du centre qui suit automatiquement
  const labelCenter = board.create('text', [
    () => newCenterPoint.X() - 0.1,
    () => newCenterPoint.Y() + 0.2,
    centerLabel
  ], {
    anchorX: 'middle',
    anchorY: 'bottom',
    fontSize: getGlobalFontSize(),
    fixed: true,
    name: ''
  });

  // Label du point sur cercle
  const labelPoint = board.create('text', [
    () => newCirclePoint.X() + 0.3,
    () => newCirclePoint.Y(),
    pointLabel
  ], {
    anchorX: 'middle',
    anchorY: 'bottom',
    fontSize: getGlobalFontSize(),
    fixed: true,
    name: ''
  });

  // Event pour déplacer le cercle
  newCenterPoint.on('drag', function() {
    board.update();
  });

  const newLabelTexts = [labelCenter, labelPoint];
  const newTexts = [labelCenter, labelPoint];

  setCenterPoint(newCenterPoint);
  setCirclePoint(newCirclePoint);
  setCircleObject(newCircleObject);
  setPoints(newPoints);
  setLabelTexts(newLabelTexts);
  setTexts(newTexts);

  board.update();
  updateCircleExtras();
}

// ==========================================
// UTILITAIRES TRIANGLES
// ==========================================

function isRightTriangle() {
  if (!points || points.length !== 3) return false;
  
  const tolerance = 0.1;
  
  for (let i = 0; i < 3; i++) {
    const A = points[(i - 1 + 3) % 3];
    const B = points[i];
    const C = points[(i + 1) % 3];
    
    const v1x = A.X() - B.X();
    const v1y = A.Y() - B.Y();
    const v2x = C.X() - B.X();
    const v2y = C.Y() - B.Y();
    
    const dotProduct = v1x * v2x + v1y * v2y;
    const len1 = Math.hypot(v1x, v1y);
    const len2 = Math.hypot(v2x, v2y);
    
    if (len1 > 0 && len2 > 0) {
      const cosAngle = dotProduct / (len1 * len2);
      const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle)));
      
      if (Math.abs(angle - Math.PI/2) < tolerance) {
        return { isRight: true, rightAngleIndex: i };
      }
    }
  }
  
  return { isRight: false, rightAngleIndex: -1 };
}

function getHypotenuseIndex() {
  if (!points || points.length !== 3) return -1;
  
  const sideLengths = [];
  
  for (let i = 0; i < 3; i++) {
    const pt1 = points[i];
    const pt2 = points[(i + 1) % 3];
    const length = Math.hypot(pt2.X() - pt1.X(), pt2.Y() - pt1.Y());
    sideLengths.push({ index: i, length });
  }
  
  const longestSide = sideLengths.reduce((max, side) => 
    side.length > max.length ? side : max
  );
  
  return longestSide.index;
}
