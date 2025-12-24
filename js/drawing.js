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
// TRAPÈZES
// ==========================================

function drawTrapezoid(baseBottom, baseTop, height) {
  // Trapèze avec base inférieure plus grande que la base supérieure
  const offsetX = (baseBottom - baseTop) / 2;
  
  const A = board.create('point', [offsetX, height], { visible: false, fixed: true });
  const B = board.create('point', [offsetX + baseTop, height], { visible: false, fixed: true });
  const C = board.create('point', [baseBottom, 0], { visible: false, fixed: true });
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
  updateEqualAngleMarkers(document.getElementById("toggleEqualAngles")?.checked);

  console.log(`Trapèze créé: Base inf=${baseBottom}, Base sup=${baseTop}, Hauteur=${height}`);
}

function drawRightTrapezoid(baseBottom, baseTop, height) {
  // Trapèze rectangle : les côtés AD et BC sont perpendiculaires à la base
  const A = board.create('point', [0, height], { visible: false, fixed: true });
  const B = board.create('point', [baseTop, height], { visible: false, fixed: true });
  const C = board.create('point', [baseBottom, 0], { visible: false, fixed: true });
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
  updateEqualAngleMarkers(document.getElementById("toggleEqualAngles")?.checked);
  
  // Forcer l'affichage des angles droits si la checkbox est cochée
  setTimeout(() => {
    updateRightAngleMarkers(document.getElementById("toggleRightAngles")?.checked);
  }, 50);

  console.log(`Trapèze rectangle créé: Base inf=${baseBottom}, Base sup=${baseTop}, Hauteur=${height}`);
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

  // Point sur le cercle (glider) - invisible par défaut
  const newCirclePoint = board.create('glider', [radius, 0, newCircleObject], {
    name: '',
    showInfobox: false,
    size: 0,
    strokeColor: 'black',
    fillColor: 'black',
    strokeOpacity: 0,
    fillOpacity: 0,
    visible: false
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

  // Label du point sur cercle - invisible par défaut
  const labelPoint = board.create('text', [
    () => newCirclePoint.X() + 0.3,
    () => newCirclePoint.Y(),
    pointLabel
  ], {
    anchorX: 'middle',
    anchorY: 'bottom',
    fontSize: getGlobalFontSize(),
    fixed: true,
    name: '',
    visible: false
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

function drawSemicircle(radius) {
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

  // Points extrémités du diamètre
  const pointA = board.create('point', [-radius, 0], {
    name: '',
    showInfobox: false,
    fixed: true,
    size: 3,
    strokeColor: 'black',
    fillColor: 'black'
  });

  const pointB = board.create('point', [radius, 0], {
    name: '',
    showInfobox: false,
    fixed: true,
    size: 3,
    strokeColor: 'black',
    fillColor: 'black'
  });

  // Arc de cercle (demi-cercle supérieur)
  const semicircle = board.create('arc', [newCenterPoint, pointB, pointA], {
    strokeWidth: 1.4,
    strokeColor: 'black'
  });

  // Diamètre (segment)
  const diameter = board.create('segment', [pointA, pointB], {
    strokeWidth: 1.4,
    strokeColor: 'black'
  });

  // Labels
  const labelO = board.create('text', [
    () => newCenterPoint.X(),
    () => newCenterPoint.Y() - 0.3,
    'O'
  ], {
    anchorX: 'middle',
    anchorY: 'top',
    fontSize: getGlobalFontSize(),
    fixed: true
  });

  const labelA = board.create('text', [
    () => pointA.X() - 0.3,
    () => pointA.Y(),
    'A'
  ], {
    anchorX: 'right',
    anchorY: 'middle',
    fontSize: getGlobalFontSize(),
    fixed: true
  });

  const labelB = board.create('text', [
    () => pointB.X() + 0.3,
    () => pointB.Y(),
    'B'
  ], {
    anchorX: 'left',
    anchorY: 'middle',
    fontSize: getGlobalFontSize(),
    fixed: true
  });

  const newPoints = [pointA, pointB];
  const newTexts = [labelO, labelA, labelB];
  const newLabelTexts = [labelO, labelA, labelB];

  setCenterPoint(newCenterPoint);
  setCirclePoint(pointB); // Pour compatibilité avec les fonctions existantes
  setCircleObject(semicircle);
  setPoints(newPoints);
  setLabelTexts(newLabelTexts);
  setTexts(newTexts);

  extraElements.push(diameter, semicircle);

  board.update();
  console.log(`✅ Demi-cercle créé (rayon: ${radius})`);
}

function drawArc(radius, angleStart = 0, angleEnd = 90) {
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

  // Convertir les angles en radians
  const startRad = (angleStart * Math.PI) / 180;
  const endRad = (angleEnd * Math.PI) / 180;

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

  // Points extrémités de l'arc
  const pointA = board.create('point', [
    radius * Math.cos(startRad),
    radius * Math.sin(startRad)
  ], {
    name: '',
    showInfobox: false,
    fixed: true,
    size: 3,
    strokeColor: 'black',
    fillColor: 'black'
  });

  const pointB = board.create('point', [
    radius * Math.cos(endRad),
    radius * Math.sin(endRad)
  ], {
    name: '',
    showInfobox: false,
    fixed: true,
    size: 3,
    strokeColor: 'black',
    fillColor: 'black'
  });

  // Arc de cercle
  const arc = board.create('arc', [newCenterPoint, pointA, pointB], {
    strokeWidth: 1.4,
    strokeColor: 'black'
  });

  // Rayons optionnels
  const rayonA = board.create('segment', [newCenterPoint, pointA], {
    strokeWidth: 1,
    strokeColor: 'gray',
    dash: 2
  });

  const rayonB = board.create('segment', [newCenterPoint, pointB], {
    strokeWidth: 1,
    strokeColor: 'gray',
    dash: 2
  });

  // Labels
  const labelO = board.create('text', [
    () => newCenterPoint.X() - 0.3,
    () => newCenterPoint.Y() - 0.3,
    'O'
  ], {
    anchorX: 'right',
    anchorY: 'top',
    fontSize: getGlobalFontSize(),
    fixed: true
  });

  const labelA = board.create('text', [
    () => pointA.X() + 0.3,
    () => pointA.Y() + 0.3,
    'A'
  ], {
    anchorX: 'left',
    anchorY: 'bottom',
    fontSize: getGlobalFontSize(),
    fixed: true
  });

  const labelB = board.create('text', [
    () => pointB.X() + 0.3,
    () => pointB.Y() + 0.3,
    'B'
  ], {
    anchorX: 'left',
    anchorY: 'bottom',
    fontSize: getGlobalFontSize(),
    fixed: true
  });

  const newPoints = [pointA, pointB];
  const newTexts = [labelO, labelA, labelB];
  const newLabelTexts = [labelO, labelA, labelB];

  setCenterPoint(newCenterPoint);
  setCirclePoint(pointB);
  setCircleObject(arc);
  setPoints(newPoints);
  setLabelTexts(newLabelTexts);
  setTexts(newTexts);

  extraElements.push(arc, rayonA, rayonB);

  board.update();
  console.log(`✅ Arc de cercle créé (rayon: ${radius}, ${angleStart}° à ${angleEnd}°)`);
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

// ==========================================
// CONFIGURATIONS DE THALÈS
// ==========================================

/**
 * Dessine une configuration de Thalès classique
 * Triangle avec une sécante parallèle à un côté
 * @param {number} PQ - Longueur du petit segment vertical gauche
 * @param {number} PR - Longueur du grand segment vertical gauche
 * @param {number} PT - Longueur du petit segment vertical droit
 */
function drawThalesClassic(PQ, PR, PT) {
  // Calcul de PS par le théorème de Thalès : PQ/PR = PT/PS
  const PS = (PT * PR) / PQ;
  
  console.log(`📐 Thalès classique: PQ=${PQ}, PR=${PR}, PT=${PT}, PS=${PS.toFixed(2)}`);
  
  // Positions des points
  // P au sommet, Q et T sur une ligne horizontale (sécante), R et S à la base
  const P = board.create('point', [0, 3], { name: '', fixed: true, visible: false });
  const Q = board.create('point', [-PQ * 0.4, 3 - PQ * 0.6], { name: '', fixed: true, visible: false });
  const T = board.create('point', [PT * 0.4, 3 - PT * 0.6], { name: '', fixed: true, visible: false });
  const R = board.create('point', [-PR * 0.4, 3 - PR * 0.6], { name: '', fixed: true, visible: false });
  const S = board.create('point', [PS * 0.4, 3 - PS * 0.6], { name: '', fixed: true, visible: false });
  
  // Segments principaux
  const segPR = board.create('segment', [P, R], { strokeColor: 'black', strokeWidth: 2 });
  const segPS = board.create('segment', [P, S], { strokeColor: 'black', strokeWidth: 2 });
  const segRS = board.create('segment', [R, S], { strokeColor: 'black', strokeWidth: 2 });
  const segQT = board.create('segment', [Q, T], { strokeColor: 'black', strokeWidth: 2 });
  
  // Labels des points
  const labelP = board.create('text', [P.X(), P.Y() + 0.4, getLabel(0)], { fontSize: getGlobalFontSize() });
  const labelQ = board.create('text', [Q.X() - 0.3, Q.Y(), getLabel(1)], { fontSize: getGlobalFontSize() });
  const labelT = board.create('text', [T.X() + 0.3, T.Y(), getLabel(2)], { fontSize: getGlobalFontSize() });
  const labelR = board.create('text', [R.X() - 0.3, R.Y() - 0.3, getLabel(3)], { fontSize: getGlobalFontSize() });
  const labelS = board.create('text', [S.X() + 0.3, S.Y() - 0.3, getLabel(4)], { fontSize: getGlobalFontSize() });
  
  const newPoints = [P, Q, T, R, S];
  const newTexts = [labelP, labelQ, labelT, labelR, labelS];
  
  // Stocker les segments comme éléments extra pour le déplacement
  extraElements.push(segPR, segPS, segRS, segQT);
  
  setPoints(newPoints);
  setTexts(newTexts);
  setPolygon(null); // Pas de polygone pour Thalès
  
  // Ajouter le déplacement global
  addThalesDragging(newPoints, newTexts, [segPR, segPS, segRS, segQT]);
  
  // Centrer la figure
  setTimeout(() => centerBoard(), 100);
  
  console.log(`✅ Configuration de Thalès classique générée`);
}

/**
 * Dessine une configuration de Thalès papillon (en X)
 * Deux triangles qui se croisent en un point central
 * @param {number} AB - Longueur de A au centre
 * @param {number} AC - Longueur totale depuis A
 * @param {number} AD - Longueur de A vers D
 * @param {number} AE - Longueur totale de A vers E (calculée si non fournie)
 */
function drawThalesPapillon(AB, AC, AD, AE = null) {
  // Si AE n'est pas fourni, on utilise le rapport : AB/AC = AD/AE
  if (AE === null) {
    AE = (AD * AC) / AB;
  }
  
  console.log(`🦋 Thalès papillon: AB=${AB}, AC=${AC}, AD=${AD}, AE=${AE.toFixed(2)}`);
  
  // Point central A
  const A = board.create('point', [0, 0], { name: '', fixed: true, visible: false });
  
  // Points sur la première diagonale (horizontale)
  const B = board.create('point', [-AB, 0], { name: '', fixed: true, visible: false });
  const C = board.create('point', [AC - AB, 0], { name: '', fixed: true, visible: false });
  
  // Points sur la deuxième diagonale (angle ~60°)
  const angle = Math.PI / 4; // 45 degrés pour une belle visualisation
  const D = board.create('point', [AD * Math.cos(angle), AD * Math.sin(angle)], { name: '', fixed: true, visible: false });
  const E = board.create('point', [(AE - AD) * Math.cos(angle + Math.PI), (AE - AD) * Math.sin(angle + Math.PI)], { name: '', fixed: true, visible: false });
  
  // Segments principaux
  const segBC = board.create('segment', [B, C], { strokeColor: 'black', strokeWidth: 2 });
  const segDE = board.create('segment', [D, E], { strokeColor: 'black', strokeWidth: 2 });
  const segBD = board.create('segment', [B, D], { strokeColor: 'black', strokeWidth: 2 });
  const segCE = board.create('segment', [C, E], { strokeColor: 'black', strokeWidth: 2 });
  
  // Labels des points
  const labelA = board.create('text', [A.X() - 0.3, A.Y() - 0.3, getLabel(0)], { fontSize: getGlobalFontSize() });
  const labelB = board.create('text', [B.X() - 0.4, B.Y(), getLabel(1)], { fontSize: getGlobalFontSize() });
  const labelC = board.create('text', [C.X() + 0.3, C.Y(), getLabel(2)], { fontSize: getGlobalFontSize() });
  const labelD = board.create('text', [D.X(), D.Y() + 0.4, getLabel(3)], { fontSize: getGlobalFontSize() });
  const labelE = board.create('text', [E.X(), E.Y() - 0.4, getLabel(4)], { fontSize: getGlobalFontSize() });
  
  const newPoints = [A, B, C, D, E];
  const newTexts = [labelA, labelB, labelC, labelD, labelE];
  
  // Stocker les segments
  extraElements.push(segBC, segDE, segBD, segCE);
  
  setPoints(newPoints);
  setTexts(newTexts);
  setPolygon(null);
  
  // Ajouter le déplacement
  addThalesDragging(newPoints, newTexts, [segBC, segDE, segBD, segCE]);
  
  // Centrer
  setTimeout(() => centerBoard(), 100);
  
  console.log(`✅ Configuration de Thalès papillon générée`);
}

/**
 * Ajoute la fonctionnalité de dragging pour les configurations de Thalès
 */
function addThalesDragging(thalesPoints, thalesTexts, segments) {
  let startCoords = null;
  let isDragging = false;
  
  const startDrag = function(e) {
    isDragging = true;
    startCoords = board.getUsrCoordsOfMouse(e);
    e.stopPropagation();
  };
  
  const onMouseMove = function(ev) {
    if (!isDragging || !startCoords) return;
    
    const newCoords = board.getUsrCoordsOfMouse(ev);
    const dx = newCoords[0] - startCoords[0];
    const dy = newCoords[1] - startCoords[1];
    startCoords = newCoords;
    
    // Déplacer tous les points
    thalesPoints.forEach(pt => {
      try { pt.moveTo([pt.X() + dx, pt.Y() + dy], 0); }
      catch (err) { try { pt.setPosition(JXG.COORDS_BY_USER, [pt.X() + dx, pt.Y() + dy]); } catch(e){} }
    });
    
    // Déplacer les labels
    thalesTexts.forEach(txt => {
      try {
        if (typeof txt.setPosition === 'function') {
          txt.setPosition(JXG.COORDS_BY_USER, [txt.X() + dx, txt.Y() + dy]);
        }
      } catch (err) { /* ignore */ }
    });
    
    // Déplacer les handles des labels de points si présents
    if (labelHandles && labelHandles.length > 0) {
      labelHandles.forEach(h => {
        try { h.moveTo([h.X() + dx, h.Y() + dy], 0); }
        catch (err) { try { h.setPosition(JXG.COORDS_BY_USER, [h.X() + dx, h.Y() + dy]); } catch(e){} }
      });
    }
    
    board.update();
  };
  
  const endDrag = function() {
    isDragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', endDrag);
  };
  
  // Attacher les événements à chaque segment
  segments.forEach(seg => {
    if (seg && seg.rendNode) {
      seg.rendNode.style.cursor = 'move';
      seg.rendNode.addEventListener('mousedown', startDrag);
    }
  });
  
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', endDrag);
}
