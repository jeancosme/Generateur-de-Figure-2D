let board = JXG.JSXGraph.initBoard('jxgbox', {
  boundingbox: [-5, 5, 5, -5],
  axis: false,
  showCopyright: false,
  showNavigation: false,
  keepaspectratio: true,
  zoom: {
    enabled: false
  }
});

// Zoom à la molette ou pavé tactile
document.getElementById('jxgbox').addEventListener('wheel', function (event) {
  event.preventDefault(); // évite le scroll de la page

  const zoomFactor = 1.1;
  if (event.deltaY < 0) {
    board.zoom(1 / zoomFactor, 1 / zoomFactor); // Zoom avant
  } else {
    board.zoom(zoomFactor, zoomFactor); // Zoom arrière
  }

  board.update();
});

    let points = [];
    let polygon = null;
    let texts = [];
    let rightAngleMarkers = [];
    let lengthLabels = [];
    let codingMarks = [];
    let codingSegments = [];
    let diagonals = [];
    let diameterSegment = null;
    let diameterPoints = []; 
    let centerPoint = null;
    let circlePoint = null;
    let circleObject = null;
    let radiusSegment = null;
    let radiusLabel = null;
    let radiusLabelAnchor = null;
    let extraElements = []; 
    let r = null;
    let customLabels = [];

    if (labelInput !== "") {
  customLabels = labelInput.split(",").map(l => l.trim().toUpperCase());
}

function getLabel(index) {
  const defaultLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
  if (customLabels && customLabels.length > index) {
    return customLabels[index];
  }
  return defaultLabels[index];
}

// Fonction Cercles   
function updateCircleExtras() {
  if (!centerPoint || !circlePoint) return;

  const dx = circlePoint.X() - centerPoint.X();
  const dy = circlePoint.Y() - centerPoint.Y();
  const r = Math.sqrt(dx * dx + dy * dy);
  const unitSelector = document.getElementById("unitSelector");
  const unit = unitSelector ? unitSelector.value : "cm";

  const showRadius = document.getElementById("toggleRadius").checked;
  const showDiameter = document.getElementById("toggleDiameter")?.checked;
  const showCodings = document.getElementById("toggleCodings")?.checked;

  // Supprimer ancien segment de rayon
  if (radiusSegment) {
    board.removeObject(radiusSegment);
    radiusSegment = null;
  }

  // Supprimer ancien label de rayon
  if (radiusLabel) {
    board.removeObject(radiusLabel);
    radiusLabel = null;
  }

  // Supprimer anciens codages
  codingSegments.forEach(obj => board.removeObject(obj));
  codingSegments = [];

  // Supprimer ancien diamètre
  if (diameterSegment) {
    board.removeObject(diameterSegment);
    diameterSegment = null;
  }
  if (diameterPoints.length > 0) {
    diameterPoints.forEach(pt => board.removeObject(pt));
    diameterPoints = [];
  }

  // === Rayon ===
  if (showRadius) {
    circlePoint.setAttribute({
      fixed: false,
      size: 0,
      strokeOpacity: 0,
      fillOpacity: 0
    });

    radiusSegment = board.create('segment', [centerPoint, circlePoint], {
      strokeColor: 'black',
      strokeWidth: 2,
      fixed: true
    });

    const showLengths = document.getElementById("toggleLengths")?.checked;
    const showUnits = document.getElementById("showUnitsCheckbox")?.checked;

    if (showLengths) {
      radiusLabel = board.create('text', [
        () => {
          const dx = circlePoint.X() - centerPoint.X();
          const dy = circlePoint.Y() - centerPoint.Y();
          const len = Math.sqrt(dx * dx + dy * dy);

          // Vecteur normal unitaire (orthogonal au rayon)
          const offset = 0.3; // ↗ valeur à ajuster pour décaler plus ou moins
          const nx = offset * (-dy / len);
          const ny = offset * (dx / len);

          return (centerPoint.X() + circlePoint.X()) / 2 + nx;
        },
        () => {
          const dx = circlePoint.X() - centerPoint.X();
          const dy = circlePoint.Y() - centerPoint.Y();
          const len = Math.sqrt(dx * dx + dy * dy);

          const offset = 0.3;
          const nx = offset * (-dy / len);
          const ny = offset * (dx / len);

          return (centerPoint.Y() + circlePoint.Y()) / 2 + ny;
        },
        () => {
          const dx = circlePoint.X() - centerPoint.X();
          const dy = circlePoint.Y() - centerPoint.Y();
          const len = Math.sqrt(dx * dx + dy * dy);
          return showUnits ? `${Number(len.toFixed(2))} ${unit}` : `${Number(len.toFixed(2))}`;        }
      ], {
        anchorX: 'middle',
        anchorY: 'middle',
        fontSize: 14,
        fixed: true
      });
      } 

  } else {
    circlePoint.setAttribute({
      size: 2,
      strokeColor: 'black',
      fillColor: 'black',
      strokeOpacity: 1,
      fillOpacity: 1,
      fixed: false
    });
  }

  // === Diamètre ===
  if (showDiameter) {
    const angleA = Math.atan2(dy, dx);
    const angleB = angleA + Math.PI / 3;

    const B = board.create('point', [
      () => centerPoint.X() + r * Math.cos(angleB),
      () => centerPoint.Y() + r * Math.sin(angleB)
    ], {
      name: 'B',
      showInfobox: false,
      fixed: true,
      size: 0,
      strokeColor: 'black',
      fillColor: 'black'
    });

    const C = board.create('point', [
      () => centerPoint.X() - r * Math.cos(angleB),
      () => centerPoint.Y() - r * Math.sin(angleB)
    ], {
      name: 'C',
      showInfobox: false,
      fixed: true,
      size: 0,
      strokeColor: 'black',
      fillColor: 'black'
    });

    diameterPoints = [B, C];

    diameterSegment = board.create('segment', [B, C], {
      strokeColor: 'black',
      strokeWidth: 2,
      fixed: true
    });

    // === Codages sur OB et OC ===
    if (showCodings) {
      for (let pt of diameterPoints) {
        const tick = board.create('segment', [
          () => [
            (centerPoint.X() + pt.X()) / 2 + 0.2 * (pt.Y() - centerPoint.Y()) / r,
            (centerPoint.Y() + pt.Y()) / 2 - 0.2 * (pt.X() - centerPoint.X()) / r
          ],
          () => [
            (centerPoint.X() + pt.X()) / 2 - 0.2 * (pt.Y() - centerPoint.Y()) / r,
            (centerPoint.Y() + pt.Y()) / 2 + 0.2 * (pt.X() - centerPoint.X()) / r
          ]
        ], {
          strokeColor: 'black',
          strokeWidth: 2,
          fixed: true
        });
        codingSegments.push(tick);
      }

      // Aussi sur [OA]
      const len = Math.sqrt(dx * dx + dy * dy);
      const tick = board.create('segment', [
        () => [
          (centerPoint.X() + circlePoint.X()) / 2 + 0.2 * (dy / len),
          (centerPoint.Y() + circlePoint.Y()) / 2 - 0.2 * (dx / len)
        ],
        () => [
          (centerPoint.X() + circlePoint.X()) / 2 - 0.2 * (dy / len),
          (centerPoint.Y() + circlePoint.Y()) / 2 + 0.2 * (dx / len)
        ]
      ], {
        strokeColor: 'black',
        strokeWidth: 2,
        fixed: true
      });
      codingSegments.push(tick);
    }

  } else if (showCodings && showRadius) {
    // === Codage sur [OA] uniquement (si pas de diamètre)
    const len = Math.sqrt(dx * dx + dy * dy);
    const tick = board.create('segment', [
      () => [
        (centerPoint.X() + circlePoint.X()) / 2 + 0.2 * (dy / len),
        (centerPoint.Y() + circlePoint.Y()) / 2 - 0.2 * (dx / len)
      ],
      () => [
        (centerPoint.X() + circlePoint.X()) / 2 - 0.2 * (dy / len),
        (centerPoint.Y() + circlePoint.Y()) / 2 + 0.2 * (dx / len)
      ]
    ], {
      strokeColor: 'black',
      strokeWidth: 2,
      fixed: true
    });
    codingSegments.push(tick);
  }
}


// Fonction Diagonales   
function updateDiagonals() {
  // Supprimer les anciennes diagonales
  diagonals.forEach(d => board.removeObject(d));
  diagonals = [];

  if (!document.getElementById("toggleDiagonals").checked) return;
  if (points.length !== 4) return; // seulement pour quadrilatère

  const diag1 = board.create('segment', [points[0], points[2]], {
    strokeColor: 'black',
    strokeWidth: 1, 
    fixed: true
  });

  const diag2 = board.create('segment', [points[1], points[3]], {
    strokeColor: 'black',
    strokeWidth: 1, 
    fixed: true
  });

  diagonals.push(diag1, diag2);
}

function updateLengthLabels() {
  // Supprimer les longueurs précédentes
  lengthLabels.forEach(label => board.removeObject(label));
  lengthLabels = [];

  const showLengths = document.getElementById("toggleLengths").checked;
  const showUnits = document.getElementById("showUnitsCheckbox").checked;
  const unit = document.getElementById("unitSelector").value;

  if (!showLengths || points.length === 0) return;

  // Fonction pour formater les longueurs
  function formatLength(len) {
    const rounded = Math.round(len * 10) / 10;
    const space = '\u00A0'; // espace insécable
    const value = Number.isInteger(rounded) ? `${rounded}` : `${rounded}`.replace('.', ',');

    return showUnits ? `${value}${space}${unit.trim()}` : `${value}`;
  }

  const n = points.length;
  let sidesToShow = [];

  if (n === 4) {
    const sideLens = [];
    for (let i = 0; i < 4; i++) {
      const pt1 = points[i];
      const pt2 = points[(i + 1) % 4];
      const len = Math.sqrt((pt2.X() - pt1.X()) ** 2 + (pt2.Y() - pt1.Y()) ** 2);
      sideLens.push(len);
    }

    const rounded = sideLens.map(len => Math.round(len * 100) / 100);
    const unique = [...new Set(rounded.map(l => l.toFixed(2)))];

    if (unique.length === 1) {
      sidesToShow = [0];
    } else if (unique.length === 2) {
      sidesToShow = [0, 1];
    } else {
      sidesToShow = [0, 1, 2, 3];
    }
  } else {
    sidesToShow = [...Array(n).keys()];
  }

  for (let i of sidesToShow) {
    const pt1 = points[i];
    const pt2 = points[(i + 1) % n];
    const dx = pt2.X() - pt1.X();
    const dy = pt2.Y() - pt1.Y();
    const len = Math.sqrt(dx * dx + dy * dy);
    const offset = 0.3;

    const label = board.create('text', [
      () => (pt1.X() + pt2.X()) / 2 + offset * (dy / len),
      () => (pt1.Y() + pt2.Y()) / 2 - offset * (dx / len),
      () => formatLength(Math.sqrt((pt2.X() - pt1.X())**2 + (pt2.Y() - pt1.Y())**2))
    ], {
      fontSize: 14,
      fixed: true,
      anchorX: 'middle',
      anchorY: 'middle'
    });

    lengthLabels.push(label);
  }
}

function drawCodingMark(pt1, pt2, index = 1) {
  const dx = pt2.X() - pt1.X();
  const dy = pt2.Y() - pt1.Y();
  const len = Math.sqrt(dx * dx + dy * dy);

  // Milieu du segment
  const mx = (pt1.X() + pt2.X()) / 2;
  const my = (pt1.Y() + pt2.Y()) / 2;

  // Vecteur normal perpendiculaire au segment (normalisé)
  const nx = -dy / len;
  const ny = dx / len;

  const offset = 0.2;      // Distance du segment
  const size = 0.3;        // Longueur des traits
  const spacing = 0.2;     // Espace entre les traits

  for (let i = 0; i < index; i++) {
    const centerX = mx + nx * offset + nx * (i - (index - 1) / 2) * spacing;
    const centerY = my + ny * offset + ny * (i - (index - 1) / 2) * spacing;

    const mark = board.create('segment', [
      [centerX - ny * size / 2, centerY + nx * size / 2],
      [centerX + ny * size / 2, centerY - nx * size / 2]
    ], {
      strokeColor: 'black',
      strokeWidth: 2,
      fixed: true,
      highlight: false
    });

    codingSegments.push(mark);
  }
}

function updateCodings() {
  // Supprimer les codages existants
  codingMarks.forEach(m => board.removeObject(m));
  codingMarks = [];

  board.on('boundingbox', () => {
    if (document.getElementById("toggleCodings").checked) {
      updateCodings();
    }
  });

  if (!document.getElementById("toggleCodings").checked || points.length < 3) return;

  const n = points.length;
  const segmentLengths = [];

  for (let i = 0; i < n; i++) {
    const pt1 = points[i];
    const pt2 = points[(i + 1) % n];
    const len = Math.sqrt((pt2.X() - pt1.X()) ** 2 + (pt2.Y() - pt1.Y()) ** 2);
    segmentLengths.push({ index: i, length: Math.round(len * 100) / 100 });
  }

  // Regrouper les segments par longueurs équivalentes
  const groups = {};
  segmentLengths.forEach(seg => {
    const key = seg.length.toFixed(2); // arrondi pour regrouper
    if (!groups[key]) groups[key] = [];
    groups[key].push(seg.index);
  });

  let markCount = 1; // nombre de traits par groupe

  for (const key in groups) {
    const indices = groups[key];
    if (indices.length < 2) continue;

    for (const i of indices) {
      const pt1 = points[i];
      const pt2 = points[(i + 1) % n];

      const midX = (pt1.X() + pt2.X()) / 2;
      const midY = (pt1.Y() + pt2.Y()) / 2;

      const dx = pt2.X() - pt1.X();
      const dy = pt2.Y() - pt1.Y();
      const norm = Math.sqrt(dx * dx + dy * dy);
      const ux = dx / norm;
      const uy = dy / norm;

      // Vecteur oblique à 45°
      const angle = Math.PI / 4;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const vx = cos * ux - sin * uy;
      const vy = sin * ux + cos * uy;

      for (let j = 0; j < markCount; j++) {
        const shift = (j - (markCount - 1) / 2) * 0.1;  // écart horizontal entre traits
        const cx = midX + shift * ux;
        const cy = midY + shift * uy;

        const len = 0.20; // allongé
        const mark = board.create('segment', [
          [cx - vx * len / 2, cy - vy * len / 2],
          [cx + vx * len / 2, cy + vy * len / 2]
        ], {
          strokeWidth: 1.4, // plus fin
          strokeColor: 'black',
          fixed: true
        });

        codingMarks.push(mark);
      }
    }

    markCount++;
  }
}


// Fonction pour ajouter les angles droits
function updateRightAngleMarkers(visible) {
  // Supprimer les anciens
  rightAngleMarkers.forEach(marker => board.removeObject(marker));
  rightAngleMarkers = [];

  if (!visible || !points.length) return;

  const figureType = detectCurrentFigure();

  if (figureType === "square" || figureType === "rectangle" || figureType === "rightTriangle") {
    const triples = getRightAngleTriples();

    triples.forEach(([A, B, C]) => {
      const marker = board.create('nonreflexangle', [A, B, C], {
        type: 'square',
        radius: 0.4,
        orthoType: 'square',
        visible: true,
        strokeColor: 'black',
        fillColor: 'white',        // ✅ fond blanc
        fillOpacity: 1,            // ✅ opacité totale
        name: '', // pas de nom
        label: { visible: false } // cache toute étiquette
      });
      rightAngleMarkers.push(marker);
    });
  }
}   

// Détection du type de figure pour ajuster les angles droits
function detectCurrentFigure() {
  if (points.length === 4 && polygon) {
    const d1 = points[0].Dist(points[1]);
    const d2 = points[1].Dist(points[2]);
    const d3 = points[2].Dist(points[3]);
    const d4 = points[3].Dist(points[0]);
    if (Math.abs(d1 - d3) < 0.01 && Math.abs(d2 - d4) < 0.01) return "rectangle";
    return "square";
  }
  if (points.length === 3) return "rightTriangle";
  return "";
}

// Points d’angle droit (sens horaire)
function getRightAngleTriples() {
  if (points.length === 4) {
    return [
      [points[3], points[0], points[1]],
      [points[0], points[1], points[2]],
      [points[1], points[2], points[3]],
      [points[2], points[3], points[0]]
    ];
  }
  if (points.length === 3) {
    // Le triangle rectangle a un angle droit en A (hypothèse), à adapter si besoin
    return [[points[1], points[0], points[2]]];
  }
  return [];
}

function generateFigure() {
  const prompt = document.getElementById("promptInput").value.toLowerCase();

  const labelInput = document.getElementById("labelInput").value.trim();
    if (labelInput.includes(",")) {
      // Cas 1 : séparés par des virgules
      customLabels = labelInput.split(',').map(s => s.trim().toUpperCase());
    } else if (labelInput.includes(" ")) {
      // Cas 2 : séparés par des espaces
      customLabels = labelInput.split(' ').map(s => s.trim().toUpperCase());
    } else {
      // Cas 3 : chaîne unique — on découpe chaque lettre
      customLabels = labelInput.toUpperCase().split('');
    }  

  // Réinitialiser proprement le board
  board.removeObject([...board.objectsList]); // <- ceci ne suffit pas toujours
  while (board.objectsList.length > 0) {
    board.removeObject(board.objectsList[0]);
  }

  points = [];
  texts = [];
  polygon = null;

  if (prompt.includes("carré")) {
    const size = extractNumber(prompt, 4);
    drawSquare(size);
  } else if (prompt.includes("triangle rectangle")) {
    const [base, height] = extractTwoNumbers(prompt, [3, 4]);
    drawRightTriangle(base, height);
  } else if (prompt.includes("rectangle")) {
    const [width, height] = extractTwoNumbers(prompt, [3, 5]);
    drawRectangle(width, height);
  } else if (prompt.includes("cercle")) {
    const radius = extractNumber(prompt, 2);
    drawCircle(radius);
    updateCircleExtras();
  } else if (prompt.includes("triangle équilatéral")) {
    const side = extractNumber(prompt, 4);
    drawEquilateralTriangle(side);
  } else if (prompt.includes("losange")) {
    const size = extractNumber(prompt, 4);
    drawLosange(size);           
  } else if (prompt.includes("parallélogramme")) {
    const [base, height] = extractTwoNumbers(prompt, [4, 3]);
    drawParallelogram(base, height);
  } else if (prompt.includes("hexagone")) {
    const side = extractNumber(prompt, 3);
    drawRegularPolygon(6, side);
  } else if (prompt.includes("pentagone")) {
    const side = extractNumber(prompt, 3);
    drawRegularPolygon(5, side);
  } 
}
    
document.getElementById("promptInput").addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    generateFigure();
  }
});

    function extractNumber(text, defaultValue = 1) {
    const match = text.match(/(\d+(?:[.,]\d+)?)/);
    if (!match) return defaultValue;
    return parseFloat(match[1].replace(',', '.'));
    }
    function extractTwoNumbers(text, defaultValues = [3, 5]) {
    const matches = text.match(/(\d+(?:[.,]\d+)?)/g);
    if (!matches || matches.length < 2) return defaultValues;
    return matches.slice(0, 2).map(n => parseFloat(n.replace(',', '.')));
}

    function addDraggingToPolygon(polygon, points, texts) {
    let startCoords = null;

  polygon.rendNode.addEventListener('mousedown', function (e) {
    startCoords = board.getUsrCoordsOfMouse(e);

    function onMouseMove(ev) {
      const newCoords = board.getUsrCoordsOfMouse(ev);
      const dx = newCoords[0] - startCoords[0];
      const dy = newCoords[1] - startCoords[1];
      startCoords = newCoords;

      points.forEach(pt => pt.moveTo([pt.X() + dx, pt.Y() + dy], 0));
      texts.forEach(txt => {
        txt.setPosition(JXG.COORDS_BY_USER, [
          txt.X() + dx,
          txt.Y() + dy
        ]);
      });
      updateCodings(); 
    }

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
}

    //  LISTE DES DRAWS

    function drawSquare(size) {
      const A = board.create('point', [0, 0], {name: '',fixed: true, visible: false});
      const B = board.create('point', [size, 0], {name: '',fixed: true, visible: false});
      const C = board.create('point', [size, size], {name: '',fixed: true, visible: false});
      const D = board.create('point', [0, size], {name: '',fixed: true, visible: false});

      points = [A, B, C, D];
      polygon = board.create('polygon', points, {
        withLabel: false,
        borders: {strokeColor: "black",fixed: true },
        fillColor: "white",
        fillOpacity: 1
      });

        let labelA = board.create('text', [A.X(), A.Y() - 0.3, getLabel(0)]);
        let labelB = board.create('text', [B.X(), B.Y() - 0.3, getLabel(1)]);
        let labelC = board.create('text', [C.X(), C.Y() + 0.3, getLabel(2)]);
        let labelD = board.create('text', [D.X(), D.Y() + 0.3, getLabel(3)]);
        texts.push(labelA, labelB, labelC, labelD);

        addDraggingToPolygon(polygon, points, texts);
        updateRightAngleMarkers(document.getElementById("toggleRightAngles").checked);
        updateLengthLabels();
        updateCodings();
        updateDiagonals();
        
    }

function drawLosange(side) {
  const theta = Math.PI / 3;           // 60°
  const ox = side * Math.cos(theta);   // projection horizontale du côté oblique
  const oy = side * Math.sin(theta);   // hauteur

  const A = board.create('point', [0, 0],          { visible: false, fixed: true });
  const B = board.create('point', [side, 0],       { visible: false, fixed: true });
  const C = board.create('point', [side - ox, oy], { visible: false, fixed: true });
  const D = board.create('point', [-ox, oy],       { visible: false, fixed: true });

  points = [A, B, C, D];
  polygon = board.create('polygon', points, {
    borders: { strokeColor: 'black', fixed: true },
    fillColor: 'white',
    fillOpacity: 1
  });

  const LA = board.create('text', [A.X(), A.Y() - 0.3, 'A']);
  const LB = board.create('text', [B.X(), B.Y() - 0.3, 'B']);
  const LC = board.create('text', [C.X(), C.Y() + 0.3, 'C']);
  const LD = board.create('text', [D.X(), D.Y() + 0.3, 'D']);
  texts.push(LA, LB, LC, LD);

  addDraggingToPolygon(polygon, points, texts);
}

  function drawRectangle(width, height) {
  const A = board.create('point', [0, 0], { name: '', fixed: true, visible: false });
  const B = board.create('point', [width, 0], { name: '', fixed: true, visible: false });
  const C = board.create('point', [width, height], { name: '', fixed: true, visible: false });
  const D = board.create('point', [0, height], { name: '', fixed: true, visible: false });

  points = [A, B, C, D];

  polygon = board.create('polygon', points, {
    borders: {
      strokeColor: "black",
      fixed: true // 🔒 empêche de déplacer les côtés
    },
    fillColor: "white",
    fillOpacity: 1
  });

  let labelA = board.create('text', [A.X(), A.Y() - 0.3, getLabel(0)]);
  let labelB = board.create('text', [B.X(), B.Y() - 0.3, getLabel(1)]);
  let labelC = board.create('text', [C.X(), C.Y() + 0.3, getLabel(2)]);
  let labelD = board.create('text', [D.X(), D.Y() + 0.3, getLabel(3)]);
  texts.push(labelA, labelB, labelC, labelD);

  updateDiagonals();
  addDraggingToPolygon(polygon, points, texts);
  updateCodings();
  updateLengthLabels();
  updateRightAngleMarkers(document.getElementById("toggleRightAngles").checked);
}


function drawCircle(radius) {
  if (centerPoint) board.removeObject(centerPoint);
  if (circlePoint) board.removeObject(circlePoint);
  if (circleObject) board.removeObject(circleObject);

  centerPoint = board.create('point', [0, 0], {
    name: 'O',
    showInfobox: false,
    fixed: false, 
    size: 4,
    face: 'x',
    strokeColor: 'black',
    fillColor: 'black'
  });

  // Créer un cercle de rayon fixe
  circleObject = board.create('circle', [centerPoint, radius], {
    strokeWidth: 2,
    strokeColor: 'black'
    
  });

  // Créer un point A mobile sur le cercle
  circlePoint = board.create('glider', [radius, 0, circleObject], {
    name: 'A',
    showInfobox: false,
    size: 0,
    strokeOpacity: 0,
    fillOpacity: 0,
    label: {
      offset: [10, 10],
      anchorX: 'middle',
      anchorY: 'top'
    }
  });

  points = [circlePoint];
  texts = [];
  document.getElementById("toggleRadius").addEventListener("change", updateCircleExtras);
}


function drawRightTriangle(base, height) {
const offsetX = -base / 2;
const offsetY = -height / 2;

const A = board.create('point', [offsetX, offsetY], {visible: false, fixed: true});
const B = board.create('point', [offsetX + base, offsetY], {visible: false, fixed: true});
const C = board.create('point', [offsetX, offsetY + height], {visible:false, fixed: true});

  points = [A, B, C];
  polygon = board.create('polygon', points, {
    borders: {strokeColor: "black",fixed: true},
    fillColor: "white",
    fillOpacity: 1
  });

  const labelA = board.create('text', [A.X(), A.Y() - 0.3, "A"]);
  const labelB = board.create('text', [B.X(), B.Y() - 0.3, "B"]);
  const labelC = board.create('text', [C.X(), C.Y() + 0.3, "C"]);
  texts.push(labelA, labelB, labelC);

  addDraggingToPolygon(polygon, points, texts);
  updateRightAngleMarkers(document.getElementById("toggleRightAngles").checked);
  console.log("→ Triangle rectangle généré avec base =", base, "et hauteur =", height);
}

function drawParallelogram(base, height) {
  const offset = base / 3;
  const A = board.create('point', [0, 0], {visible: false});
  const B = board.create('point', [base, 0], {visible: false});
  const C = board.create('point', [base - offset, height], {visible: false});
  const D = board.create('point', [-offset, height], {visible: false});

  points = [A, B, C, D];
  polygon = board.create('polygon', points, {
    borders: {strokeColor: "black"},
    fillColor: "white",
    fillOpacity: 1
  });

  const labelA = board.create('text', [A.X(), A.Y() - 0.3, "A"]);
  const labelB = board.create('text', [B.X(), B.Y() - 0.3, "B"]);
  const labelC = board.create('text', [C.X(), C.Y() + 0.3, "C"]);
  const labelD = board.create('text', [D.X(), D.Y() + 0.3, "D"]);
  texts.push(labelA, labelB, labelC, labelD);

  addDraggingToPolygon(polygon, points, texts);
}

function drawRegularPolygon(n, side) {
  const center = [0, 0];
  const angle = (2 * Math.PI) / n;
  const radius = side / (2 * Math.sin(Math.PI / n));

  points = [];
  for (let i = 0; i < n; i++) {
    const x = center[0] + radius * Math.cos(i * angle);
    const y = center[1] + radius * Math.sin(i * angle);
    points.push(board.create('point', [x, y], {visible: false,fixed:true}));
  }

  polygon = board.create('polygon', points, {
    borders: {strokeColor: "black",fixed:true},
    fillColor: "white",
    fillOpacity: 1
  });

  const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    const label = board.create('text', [pt.X() + 0.2, pt.Y() + 0.2, labels[i]]);
    texts.push(label);
  }

  addDraggingToPolygon(polygon, points, texts);
}



function drawEquilateralTriangle(side) {
  const A = board.create('point', [0, 0], {visible: false});
  const B = board.create('point', [side, 0], {visible: false});
  const height = (Math.sqrt(3) / 2) * side;
  const C = board.create('point', [side / 2, height], {visible: false});

  points = [A, B, C];
  polygon = board.create('polygon', points, {
    borders: {strokeColor: "black"},
    fillColor: "white",
    fillOpacity: 1
  });

  const labelA = board.create('text', [A.X(), A.Y() - 0.3, "A"]);
  const labelB = board.create('text', [B.X(), B.Y() - 0.3, "B"]);
  const labelC = board.create('text', [C.X(), C.Y() + 0.3, "C"]);
  texts.push(labelA, labelB, labelC);

  addDraggingToPolygon(polygon, points, texts);
}
    

//ROTATION
function rotateCoord(x, y, cx, cy, angle) {
  const cos = Math.cos(angle), sin = Math.sin(angle);
  const dx = x - cx, dy = y - cy;
  return [cx + dx * cos - dy * sin, cy + dx * sin + dy * cos];
}

function rotateFigure(step = Math.PI / 18) {
  // Cas 1 : cercle (centerPoint + circlePoint)
  if (centerPoint && circlePoint) {
    const cx = centerPoint.X(), cy = centerPoint.Y();
    const [nx, ny] = rotateCoord(circlePoint.X(), circlePoint.Y(), cx, cy, step);
    circlePoint.moveTo([nx, ny], 0);

    // MAJ des extras (rayon/diamètre/codages)
    updateCircleExtras();
    board.update();
    return;
  }

  // Cas 2 : polygone / n’importe quel ensemble de points
  if (!points || points.length === 0) return;

  // Centroïde (moyenne simple des sommets)
  let cx = 0, cy = 0;
  for (const p of points) { cx += p.X(); cy += p.Y(); }
  cx /= points.length; cy /= points.length;

  // Rotation de tous les points autour du centroïde
  for (const p of points) {
    const [nx, ny] = rotateCoord(p.X(), p.Y(), cx, cy, step);
    p.moveTo([nx, ny], 0);
  }

  // Replacer rapidement les étiquettes près des points (si tu en as)
  if (texts && texts.length && points.length === texts.length) {
    for (let i = 0; i < points.length; i++) {
      const pt = points[i], txt = texts[i];
      if (txt && typeof txt.setPosition === 'function') {
        txt.setPosition(JXG.COORDS_BY_USER, [pt.X(), pt.Y() + (i === 1 || i === 0 ? -0.3 : 0.3)]);
      }
    }
  }

  // MAJ des éléments dérivés
  updateLengthLabels();
  updateCodings();
  updateDiagonals();
  updateRightAngleMarkers(document.getElementById("toggleRightAngles")?.checked);
  board.update();
}


    function zoomIn() {
      board.zoomIn();
    }

    function zoomOut() {
      board.zoomOut();
    }
    function resetBoard() {
    // Supprimer tous les objets manuellement
    board.objectsList.forEach(obj => board.removeObject(obj));
    
    // Réinitialiser les variables
    points = [];
    texts = [];
    polygon = null;

    // Redessiner le board proprement
    board.fullupdate();
    }  

function enableDrag() {
  if (points.length === 0) return;

  // Supprimer ancien handle s’il existe
  if (window.dragHandle) {
    board.removeObject(dragHandle);
  }

}

// Suggestions
const input = document.getElementById("promptInput");
const suggestionsDiv = document.getElementById("suggestionBox");

const suggestionsList = [
  "carré de côté 4",
  "rectangle de 5 sur 3",
  "triangle équilatéral de côté 4",
  "triangle rectangle de base 3 et hauteur 4",
  "cercle de rayon 2",
  "losange de côté 5",
  "parallélogramme base 5 hauteur 3",
  "hexagone de côté 3",
  "pentagone de côté 3"
];

// Affichage dynamique des suggestions
let selectedSuggestionIndex = -1;

input.addEventListener("input", function () {
  const value = this.value.toLowerCase();
  suggestionsDiv.innerHTML = "";
  selectedSuggestionIndex = -1;

  if (!value) {
    suggestionsDiv.style.display = "none";
    return;
  }

  const matches = suggestionsList.filter(s => s.includes(value)).slice(0, 5);
  if (matches.length === 0) {
    suggestionsDiv.style.display = "none";
    return;
  }

  suggestionsDiv.style.display = "block";
  suggestionsDiv.innerHTML = matches
    .map((s, i) => `<div class="suggestion-item" data-index="${i}" style="padding:5px; cursor:pointer;">${s}</div>`)
    .join("");

  const items = suggestionsDiv.querySelectorAll(".suggestion-item");

  items.forEach((item) => {
    item.addEventListener("mouseover", () => {
      items.forEach(i => i.style.background = "white");
      item.style.background = "#f0f0f0";
      selectedSuggestionIndex = parseInt(item.dataset.index);
    });

    item.addEventListener("click", () => {
      input.value = item.textContent;
      suggestionsDiv.style.display = "none";
      generateFigure();
    });
  });
});

input.addEventListener("keydown", function (e) {
  const items = suggestionsDiv.querySelectorAll(".suggestion-item");

  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (items.length > 0) {
      selectedSuggestionIndex = (selectedSuggestionIndex + 1) % items.length;
      highlightSuggestion(items);
    }
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (items.length > 0) {
      selectedSuggestionIndex = (selectedSuggestionIndex - 1 + items.length) % items.length;
      highlightSuggestion(items);
    }
  } else if (e.key === "Enter") {
    if (suggestionsDiv.style.display === "block" && selectedSuggestionIndex >= 0) {
      input.value = items[selectedSuggestionIndex].textContent;
      suggestionsDiv.style.display = "none";
      generateFigure(); // ✅ ici c'est OK de le lancer car l'entrée est bien définie
      e.preventDefault(); // ⛔ Empêche la soumission par défaut ou d’autres effets
    } else if (suggestionsDiv.style.display !== "block") {
      generateFigure(); // ✅ On lance uniquement si pas de suggestion visible
    } else {
      e.preventDefault(); // ⛔ Ne rien faire si suggestions visibles mais rien de sélectionné
    }
  }
});


function highlightSuggestion(items) {
  items.forEach((item, i) => {
    item.style.background = i === selectedSuggestionIndex ? "#f0f0f0" : "white";
  });
}

// Masquer les suggestions si on clique ailleurs
document.addEventListener("click", (e) => {
  if (!suggestionsDiv.contains(e.target) && e.target !== input) {
    suggestionsDiv.style.display = "none";
  }
});

document.getElementById("toggleRightAngles").addEventListener("change", function () {
  updateRightAngleMarkers(this.checked);
});

document.getElementById("toggleHelp").addEventListener("click", function () {
  const box = document.getElementById("helpBox");
  box.style.display = (box.style.display === "none" || box.style.display === "") ? "block" : "none";
});



// Tous les autres AddEvent
document.getElementById("toggleLengths").addEventListener("change", updateLengthLabels);
document.getElementById("showUnitsCheckbox").addEventListener("change", updateLengthLabels);
document.getElementById("unitSelector").addEventListener("change", updateLengthLabels);
document.getElementById("toggleCodings").addEventListener("change", updateCodings);
document.getElementById("toggleDiagonals").addEventListener("change", updateDiagonals);
document.getElementById("toggleLengths").addEventListener("change", updateCircleExtras);
document.getElementById("showUnitsCheckbox").addEventListener("change", updateCircleExtras);
document.getElementById("toggleRadius").addEventListener("change", updateCircleExtras);
document.getElementById("unitSelector").addEventListener("change", updateCircleExtras);
document.getElementById("toggleDiameter").addEventListener("change", updateCircleExtras);
document.getElementById("toggleCodings").addEventListener("change", updateCircleExtras);
