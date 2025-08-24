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
function createBoardControls() {
  const container = document.getElementById('jxgbox');
  if (!container) return;

  const existing = container.querySelector('.jxg-controls');
  if (existing) existing.remove();

  const panel = document.createElement('div');
  panel.className = 'jxg-controls';
  panel.style.zIndex = 10000;
  panel.style.pointerEvents = 'auto';
  panel.addEventListener('mousedown', e => { e.stopPropagation(); });
  panel.addEventListener('wheel', e => { e.stopPropagation(); });

  const row1 = document.createElement('div');
  row1.className = 'small-row';

  const plus = document.createElement('button');
  plus.className = 'zoom-btn';
  plus.innerHTML = '<svg width="18" height="18" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M8 2v12M2 8h12" stroke="black" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';
  plus.title = 'Zoom +';
  plus.setAttribute('aria-label','Zoom +');
  plus.addEventListener('click', (e) => { e.stopPropagation(); zoomIn(); board.update(); });

  const minus = document.createElement('button');
  minus.className = 'zoom-btn';
  minus.innerHTML = '<svg width="18" height="18" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M2 8h12" stroke="black" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';
  minus.title = 'Zoom -';
  minus.setAttribute('aria-label','Zoom -');
  minus.addEventListener('click', (e) => { e.stopPropagation(); zoomOut(); board.update(); });

  row1.appendChild(minus);
  row1.appendChild(plus);

  const row2 = document.createElement('div');
  row2.className = 'small-row';

  // rotation gauche
  const rotateLeft = document.createElement('button');
  rotateLeft.className = 'rotate-btn';
  rotateLeft.textContent = '↶';
  rotateLeft.title = 'Rotation -10°';
  rotateLeft.addEventListener('click', (e) => { e.stopPropagation(); rotateFigureLeft(); board.update(); });

  // rotation droite
  const rotate = document.createElement('button');
  rotate.className = 'rotate-btn';
  rotate.textContent = '↷';
  rotate.title = 'Rotation +10°';
  rotate.addEventListener('click', (e) => { e.stopPropagation(); rotateFigure(); board.update(); });

  row2.appendChild(rotateLeft);
  row2.appendChild(rotate);

  // nouvelle ligne pour le bouton réinitialiser (sous les rotates)
  const row3 = document.createElement('div');
  row3.className = 'small-row reset-row';

  const reset = document.createElement('button');
  reset.className = 'reset-btn';
  reset.textContent = 'Réinitialiser';
  reset.title = 'Réinitialiser';
  reset.setAttribute('aria-label','Réinitialiser');
  reset.addEventListener('click', (e) => { e.stopPropagation(); resetBoard(); /* resetBoard ré-appelle createBoardControls */ });

  row3.appendChild(reset);


  panel.appendChild(row1);
  panel.appendChild(row2);
  panel.appendChild(row3);

  container.appendChild(panel);
}
// appelle la création du panneau après l'init du board
createBoardControls();


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
    let angleMarkers = [];
    let lengthHandles = []; // <-- NEW: handles for draggable length labels
    let labelHandles = []; // handles for draggable point-label anchors (O, A, ...)
    let labelTexts = [];   // text objects for those labels
    let lengthHandleMeta = []; // meta pour synchroniser handles ↔ segments/points
    let _lengthSyncAttached = false;





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
// ...existing code...
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

      // calculer position initiale du label (milieu du rayon + offset orthogonal)
      const dx0 = circlePoint.X() - centerPoint.X();
      const dy0 = circlePoint.Y() - centerPoint.Y();
      const len0 = Math.sqrt(dx0 * dx0 + dy0 * dy0) || 1;
      const offset0 = 0.3;
      const nx0 = offset0 * (-dy0 / len0);
      const ny0 = offset0 * (dx0 / len0);
      const startX = (centerPoint.X() + circlePoint.X()) / 2 + nx0;
      const startY = (centerPoint.Y() + circlePoint.Y()) / 2 + ny0;

      // handle numérique déplaçable (zone cliquable invisible)
      const handle = board.create('point', [startX, startY], {
        size: 6,
        strokeOpacity: 0,
        fillOpacity: 0,
        fixed: false,
        name: '',
        highlight: false,
        showInfobox: false
      });
      try { if (handle.rendNode) handle.rendNode.style.cursor = 'move'; } catch (e) {}

      // label qui suit le handle ; affiche la longueur seulement si showLengths
      radiusLabel = board.create('text', [
        () => handle.X(),
        () => handle.Y(),
        () => {
          const dx = circlePoint.X() - centerPoint.X();
          const dy = circlePoint.Y() - centerPoint.Y();
          const len = Math.sqrt(dx * dx + dy * dy);
          if (!showLengths) return ''; // texte vide si on ne veut pas afficher la valeur
          return showUnits ? `${Number(len.toFixed(2))} ${unit}` : `${Number(len.toFixed(2))}`;
        }
      ], {
        anchorX: 'middle',
        anchorY: 'middle',
        fontSize: 14,
        fixed: false,
        name: ''
      });

      // rendre la zone de texte draggable : on relaie les événements souris vers le handle
      try {
        if (radiusLabel.rendNode) {
          radiusLabel.rendNode.style.cursor = 'move';
          radiusLabel.rendNode.addEventListener('mousedown', function (ev) {
            ev.stopPropagation();
            ev.preventDefault();
            const start = board.getUsrCoordsOfMouse(ev);
            function onMove(e) {
              const pos = board.getUsrCoordsOfMouse(e);
              const dxm = pos[0] - start[0];
              const dym = pos[1] - start[1];
              handle.moveTo([handle.X() + dxm, handle.Y() + dym], 0);
              start[0] = pos[0]; start[1] = pos[1];
              board.update();
            }
            function onUp() {
              document.removeEventListener('mousemove', onMove);
              document.removeEventListener('mouseup', onUp);
            }
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
          }, { passive: false });
        }
      } catch (e) { /* ignore if DOM not accessible */ }

      // conserver pour nettoyage global si nécessaire
      lengthHandles.push(handle);
      lengthLabels.push(radiusLabel);
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

  // Vérifier si on doit afficher les diagonales
  const show = document.getElementById('toggleDiagonals')?.checked;
  if (!show) return;
  
  // Vérifier qu'on a un polygone avec des points
  if (!points || points.length !== 4) return;

  console.log('Création diagonales pour quadrilatère avec', points.length, 'points');

  // QUADRILATÈRE : 2 diagonales uniquement
  // Diagonale 1 : point[0] vers point[2] 
  const diag1 = board.create('segment', [points[0], points[2]], {
    strokeColor: 'black',
    strokeWidth: 1,
    dash: 0,
    fixed: true,
    withLabel: false
  });
  
  // Diagonale 2 : point[1] vers point[3]
  const diag2 = board.create('segment', [points[1], points[3]], {
    strokeColor: 'black', 
    strokeWidth: 1,
    dash: 0,
    fixed: true,
    withLabel: false
  });

  diagonals.push(diag1, diag2);
  console.log('✅ 2 diagonales créées');
  
  board.update();
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

  let markCount = 1;

  for (const key in groups) {
    const indices = groups[key];
    if (indices.length < 2) continue;

    for (const i of indices) {
      const pt1 = points[i];
      const pt2 = points[(i + 1) % n];

      for (let j = 0; j < markCount; j++) {
        const shift = (j - (markCount - 1) / 2) * 0.15; // espacement entre traits

        const segment = board.create('segment', [
          () => {
            const x1 = pt1.X(), y1 = pt1.Y();
            const x2 = pt2.X(), y2 = pt2.Y();
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;

            const dx = x2 - x1;
            const dy = y2 - y1;
            const norm = Math.sqrt(dx * dx + dy * dy);
            const ux = dx / norm;
            const uy = dy / norm;

            const angle = Math.PI / 4;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const vx = cos * ux - sin * uy;
            const vy = sin * ux + cos * uy;

            const cx = midX + shift * ux;
            const cy = midY + shift * uy;
            const len = 0.20;

            return [cx - vx * len / 2, cy - vy * len / 2];
          },
          () => {
            const x1 = pt1.X(), y1 = pt1.Y();
            const x2 = pt2.X(), y2 = pt2.Y();
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;

            const dx = x2 - x1;
            const dy = y2 - y1;
            const norm = Math.sqrt(dx * dx + dy * dy);
            const ux = dx / norm;
            const uy = dy / norm;

            const angle = Math.PI / 4;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const vx = cos * ux - sin * uy;
            const vy = sin * ux + cos * uy;

            const cx = midX + shift * ux;
            const cy = midY + shift * uy;
            const len = 0.20;

            return [cx + vx * len / 2, cy + vy * len / 2];
          }
        ], {
          strokeWidth: 1.4,
          strokeColor: 'black',
          fixed: true
        });

        codingMarks.push(segment);
      }
    }

    markCount++;
  }
}


// Fonction pour ajouter les angles droits
function updateRightAngleMarkers(visible) {
  // accepter event ou bool
  if (typeof visible === 'object' && visible !== null && 'target' in visible) {
    visible = !!visible.target.checked;
  } else {
    visible = !!visible;
  }

  // Supprimer anciens marqueurs
  rightAngleMarkers.forEach(marker => {
    try { board.removeObject(marker); } catch (e) { /* ignore */ }
  });
  rightAngleMarkers = [];

  if (!visible || !points || points.length < 3) return;

  const n = points.length;
  const fig = typeof detectCurrentFigure === 'function' ? detectCurrentFigure() : '';

  // Choix des triples à marquer :
  // - pour carré/rectangle : on force tous les sommets
  // - sinon : on détecte les angles droits (tolérance dans getRightAngleTriples)
  let triples = [];
  if (fig === 'square' || fig === 'rectangle') {
    for (let i = 0; i < n; i++) {
      const A = points[(i - 1 + n) % n];
      const B = points[i];
      const C = points[(i + 1) % n];
      if (A && B && C) triples.push([A, B, C]);
    }
  } else {
    triples = getRightAngleTriples();
  }

  // Créer un marqueur "petit carré" pour chaque triple
  triples.forEach(([A, B, C]) => {
    if (!A || !B || !C) return;

    // taille relative (s'adapte à la taille locale)
    const d1 = Math.hypot(A.X() - B.X(), A.Y() - B.Y());
    const d2 = Math.hypot(C.X() - B.X(), C.Y() - B.Y());
    const base = Math.min(d1, d2);
    const radius = Math.min(0.35, Math.max(0.12, base * 0.18)); // bornes pour lisibilité

    // Utiliser l'objet 'angle' avec type square (contour noir, fond blanc)
    try {
      const ang = board.create('angle', [A, B, C], {
        type: 'square',
        orthoType: 'square',
        radius: radius,
        withLabel: false,
        name: '',
        strokeColor: 'black',
        strokeWidth: 1.2,
        fillColor: 'white',
        fillOpacity: 1,
        fixed: true,
        highlight: false
      });
      rightAngleMarkers.push(ang);
    } catch (e) {
      // fallback : petit polygone si 'angle' ne s'affiche pas pour une raison quelconque
      const v1x = A.X() - B.X(), v1y = A.Y() - B.Y();
      const v2x = C.X() - B.X(), v2y = C.Y() - B.Y();
      const len1 = Math.hypot(v1x, v1y), len2 = Math.hypot(v2x, v2y);
      if (len1 === 0 || len2 === 0) return;
      const u1x = v1x / len1, u1y = v1y / len1;
      const u2x = v2x / len2, u2y = v2y / len2;
      const size = Math.min(radius, Math.min(len1, len2) * 0.35);
      const p0 = [() => B.X(), () => B.Y()];
      const p1 = [() => B.X() + u1x * size, () => B.Y() + u1y * size];
      const p2 = [() => B.X() + (u1x + u2x) * size, () => B.Y() + (u1y + u2y) * size];
      const p3 = [() => B.X() + u2x * size, () => B.Y() + u2y * size];
      const sq = board.create('polygon', [p0, p1, p2, p3], {
        fillColor: 'white',
        fillOpacity: 1,
        strokeColor: 'black',
        strokeWidth: 1.2,
        fixed: true,
        highlight: false,
        name: ''
      });
      rightAngleMarkers.push(sq);
    }
  });

  board.update();
}

// Fonction pour ajouter les marqueurs d'angles égaux
function updateEqualAngleMarkers(visible) {
  // accepter event ou bool
  if (typeof visible === 'object' && visible !== null && 'target' in visible) visible = !!visible.target.checked;
  else visible = !!visible;

  // nettoyer anciens marqueurs/codages
  angleMarkers.forEach(m => { try { board.removeObject(m); } catch (e) {} });
  angleMarkers = [];
  codingMarks.forEach(m => { try { board.removeObject(m); } catch (e) {} });
  codingMarks = [];

  if (!visible || !points || points.length < 3) { board.update(); return; }

  // éviter pour carré/rectangle (optionnel)
  const fig = typeof detectCurrentFigure === 'function' ? detectCurrentFigure() : '';
  if (fig === 'square' || fig === 'rectangle') { board.update(); return; }

  // helper : test point in polygon (ray-casting)
  function pointInPolygon(x, y, polyPts) {
    let inside = false;
    for (let i = 0, j = polyPts.length - 1; i < polyPts.length; j = i++) {
      const xi = polyPts[i][0], yi = polyPts[i][1];
      const xj = polyPts[j][0], yj = polyPts[j][1];
      const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  const polyCoords = points.map(p => [p.X(), p.Y()]);
  const n = points.length;
  const angles = new Array(n).fill(null);

  // calculer angles (stables)
  for (let i = 0; i < n; i++) {
    const A = points[(i - 1 + n) % n], B = points[i], C = points[(i + 1) % n];
    if (!A || !B || !C) continue;
    const v1x = A.X() - B.X(), v1y = A.Y() - B.Y();
    const v2x = C.X() - B.X(), v2y = C.Y() - B.Y();
    const l1 = Math.hypot(v1x, v1y), l2 = Math.hypot(v2x, v2y);
    if (l1 === 0 || l2 === 0) continue;
    let cosv = (v1x * v2x + v1y * v2y) / (l1 * l2);
    cosv = Math.max(-1, Math.min(1, cosv));
    angles[i] = Math.acos(cosv);
  }

  // détecter parallélogramme (angles opposés égaux)
  let isParallelogram = false;
  if (n === 4 && angles.every(a => a != null)) {
    const tol = 0.03;
    if (Math.abs(angles[0] - angles[2]) < tol && Math.abs(angles[1] - angles[3]) < tol) isParallelogram = true;
  }

  // détecter triangle isocèle et indices des angles égaux (si applicable)
  let isIsosceles = false;
  let isoEqualIndices = [];
  if (n === 3) {
    const d01 = points[0].Dist(points[1]);
    const d12 = points[1].Dist(points[2]);
    const d20 = points[2].Dist(points[0]);
    const tol = Math.max(1e-6, 1e-3 * Math.max(d01, d12, d20));
    if (Math.abs(d01 - d12) < tol) { isIsosceles = true; isoEqualIndices = [2, 0]; } // sides 01 ~ 12 -> angles at 2 & 0
    else if (Math.abs(d12 - d20) < tol) { isIsosceles = true; isoEqualIndices = [0, 1]; } // sides 12 ~ 20 -> angles at 0 & 1
    else if (Math.abs(d20 - d01) < tol) { isIsosceles = true; isoEqualIndices = [1, 2]; } // sides 20 ~ 01 -> angles at 1 & 2
  }

  // grouper angles égaux (arrondi)
  const groups = {};
  for (let i = 0; i < n; i++) {
    const a = angles[i];
    if (a == null) continue;
    const key = (Math.round(a * 100) / 100).toFixed(2);
    (groups[key] = groups[key] || []).push(i);
  }

  const baseRadius = 0.42;

  // dessine un petit tiret perpendiculaire (radial) centré sur l'arc,
  // avec possibilité de décalage latéral le long de la tangente pour faire des "//" parallèles
  function createPerpTick(B, angleOnArc, radius, tickLen, lateralOffset = 0) {
    const seg = board.create('segment', [
      () => {
        const Bx = B.X(), By = B.Y();
        // centre du tiret : point sur l'arc, puis décalé le long de la tangente (-sin, cos)
        const cx = Bx + Math.cos(angleOnArc) * radius - Math.sin(angleOnArc) * lateralOffset;
        const cy = By + Math.sin(angleOnArc) * radius + Math.cos(angleOnArc) * lateralOffset;
        // vecteur radial (orientation du tiret)
        const rx = Math.cos(angleOnArc), ry = Math.sin(angleOnArc);
        return [cx - rx * (tickLen / 2), cy - ry * (tickLen / 2)];
      },
      () => {
        const Bx = B.X(), By = B.Y();
        const cx = Bx + Math.cos(angleOnArc) * radius - Math.sin(angleOnArc) * lateralOffset;
        const cy = By + Math.sin(angleOnArc) * radius + Math.cos(angleOnArc) * lateralOffset;
        const rx = Math.cos(angleOnArc), ry = Math.sin(angleOnArc);
        return [cx + rx * (tickLen / 2), cy + ry * (tickLen / 2)];
      }
    ], {
      strokeColor: 'black',
      strokeWidth: 1.6,
      fixed: true,
      highlight: false
    });
    codingMarks.push(seg);
  }

  // normaliser angle en [-PI,PI)
  function normAng(a) { while (a <= -Math.PI) a += 2*Math.PI; while (a > Math.PI) a -= 2*Math.PI; return a; }

  // parcourir groupes et dessiner arcs + codages
  for (const key in groups) {
    const indices = groups[key];
    if (indices.length < 2) continue; // garder seulement angles répétés

    for (const idx of indices) {
      const B = points[idx];
      const A = points[(idx - 1 + n) % n], C = points[(idx + 1) % n];
      if (!A || !B || !C) continue;

      const v1x = A.X() - B.X(), v1y = A.Y() - B.Y();
      const v2x = C.X() - B.X(), v2y = C.Y() - B.Y();
      const l1 = Math.hypot(v1x, v1y), l2 = Math.hypot(v2x, v2y);
      if (l1 === 0 || l2 === 0) continue;
      const u1x = v1x / l1, u1y = v1y / l1;
      const u2x = v2x / l2, u2y = v2y / l2;

      let a1 = Math.atan2(u1y, u1x);
      let a2 = Math.atan2(u2y, u2x);
      let delta = normAng(a2 - a1);

      const radius = Math.min(baseRadius, Math.min(l1, l2) * 0.22);

      // s'assurer de dessiner l'arc à l'intérieur du polygone (prendre le petit arc intérieur)
      const midSmall = a1 + delta / 2;
      const testX = B.X() + Math.cos(midSmall) * radius * 0.9;
      const testY = B.Y() + Math.sin(midSmall) * radius * 0.9;
      const smallInside = pointInPolygon(testX, testY, polyCoords);
      if (!smallInside) {
        if (delta > 0) delta = delta - 2 * Math.PI;
        else delta = delta + 2 * Math.PI;
      }

      const aStart = a1;
      const aDelta = delta;
      // dessiner l'arc interne
      const curve = board.create('curve', [
        function(t) { return B.X() + Math.cos(aStart + t * aDelta) * radius; },
        function(t) { return B.Y() + Math.sin(aStart + t * aDelta) * radius; },
        0, 1
      ], {
        strokeColor: 'black',
        strokeWidth: 1.4,
        fixed: true,
        highlight: false,
        dash: 0,
        name: ''
      });
      angleMarkers.push(curve);

      // codage : perpendiculaires au rayon ; priorité : triangle isocèle -> 1 trait sur angles égaux
      const bisect = normAng(aStart + aDelta / 2);
      if (isIsosceles && isoEqualIndices.includes(idx)) {
        // triangle isocèle : un seul trait sur chaque angle égal
        const tickLen = Math.min(0.24, radius * 1.0);
        createPerpTick(B, bisect, radius, tickLen, 0);
      } else if (isParallelogram) {
        const count = (idx % 2 === 0) ? 1 : 2; // règle choisie : sommets pairs -> 1, impairs -> 2
        const tickLen = Math.min(0.28, radius * 1.1);
        const lateralSpacing = Math.min(0.12, radius * 0.6);
        if (count === 1) {
          createPerpTick(B, bisect, radius, tickLen, 0);
        } else {
          createPerpTick(B, bisect, radius, tickLen, -lateralSpacing / 2);
          createPerpTick(B, bisect, radius, tickLen, +lateralSpacing / 2);
        }
      } else {
        // figure générale : 1 tiret centré sur la bissectrice
        const tickLen = Math.min(0.24, radius * 1.0);
        createPerpTick(B, normAng(a1 + delta / 2), radius, tickLen, 0);
      }
    }
  }

  board.update();
}

// Détection du type de figure pour ajuster les angles droits
function detectCurrentFigure() {
  // Quadrilatère : vérifier si 4 angles droits (produit scalaire)
  if (points.length === 4 && polygon) {
    const n = 4;
    const REL_TOL = 5e-4;
    for (let i = 0; i < n; i++) {
      const A = points[(i - 1 + n) % n];
      const B = points[i];
      const C = points[(i + 1) % n];
      if (!A || !B || !C) return "";
      const ax = A.X(), ay = A.Y();
      const bx = B.X(), by = B.Y();
      const cx = C.X(), cy = C.Y();
      const v1x = ax - bx, v1y = ay - by;
      const v2x = cx - bx, v2y = cy - by;
      const len1 = Math.hypot(v1x, v1y), len2 = Math.hypot(v2x, v2y);
      if (len1 === 0 || len2 === 0) return "";
      const dot = v1x * v2x + v1y * v2y;
      const tol = Math.max(1e-6, REL_TOL * (len1 * len2));
      if (Math.abs(dot) > tol) return "";
    }

    // tous les angles sont droits -> différencier carré/rectangle
    const lens = [];
    for (let i = 0; i < 4; i++) lens.push(points[i].Dist(points[(i + 1) % 4]));
    const rounded = lens.map(l => Math.round(l * 100) / 100);
    const unique = [...new Set(rounded.map(v => v.toFixed(2)))];
    if (unique.length === 1) return "square";
    return "rectangle";
  }

  // Triangle rectangle ?
  if (points.length === 3) {
    const n = 3;
    const REL_TOL = 5e-4;
    for (let i = 0; i < n; i++) {
      const A = points[(i - 1 + n) % n];
      const B = points[i];
      const C = points[(i + 1) % n];
      if (!A || !B || !C) continue;
      const ax = A.X(), ay = A.Y();
      const bx = B.X(), by = B.Y();
      const cx = C.X(), cy = C.Y();
      const v1x = ax - bx, v1y = ay - by;
      const v2x = cx - bx, v2y = cy - by;
      const len1 = Math.hypot(v1x, v1y), len2 = Math.hypot(v2x, v2y);
      if (len1 === 0 || len2 === 0) continue;
      const dot = v1x * v2x + v1y * v2y;
      const tol = Math.max(1e-6, REL_TOL * (len1 * len2));
      if (Math.abs(dot) <= tol) return "rightTriangle";
    }
  }

  return "";
}

// Remplacement consolidé : détection et affichage des angles droits / égaux
function getRightAngleTriples() {
  if (!points || points.length < 3) return [];

  const rightTriples = [];
  const n = points.length;
  const REL_TOL = 5e-4;    // tolérance relative (ajustée)
  const ABS_MIN = 1e-6;

  for (let i = 0; i < n; i++) {
    const A = points[(i - 1 + n) % n];
    const B = points[i];
    const C = points[(i + 1) % n];
    if (!A || !B || !C) continue;

    const ax = A.X(), ay = A.Y();
    const bx = B.X(), by = B.Y();
    const cx = C.X(), cy = C.Y();

    const v1x = ax - bx, v1y = ay - by;
    const v2x = cx - bx, v2y = cy - by;
    const len1 = Math.hypot(v1x, v1y), len2 = Math.hypot(v2x, v2y);
    if (len1 === 0 || len2 === 0) continue;

    const dot = v1x * v2x + v1y * v2y;
    const tol = Math.max(ABS_MIN, REL_TOL * (len1 * len2));
    if (Math.abs(dot) <= tol) {
      rightTriples.push([A, B, C]);
    }
  }

  return rightTriples;
}


function drawAngleMark(vertex) {
  // Très simple : petit texte au-dessus du point
  return board.create('text', [vertex.X(), vertex.Y() + 0.5, '∠']);
}


function getBoardCenter() {
  // boundingbox: [xmin, ymax, xmax, ymin]
  const bb = board.getBoundingBox();
  const xmin = bb[0], ymax = bb[1], xmax = bb[2], ymin = bb[3];
  return [(xmin + xmax) / 2, (ymax + ymin) / 2];
}

function getFigureCenter() {
  // Cercle : préférer centre explicite
  if (typeof centerPoint !== 'undefined' && centerPoint) {
    return [centerPoint.X(), centerPoint.Y()];
  }
  // Sinon moyenne simple des sommets/points
  if (points && points.length > 0) {
    let sx = 0, sy = 0, n = 0;
    points.forEach(p => { sx += p.X(); sy += p.Y(); n++; });
    return n ? [sx / n, sy / n] : [0, 0];
  }
  return [0, 0];
}

function centerFigure() {
  const [figCx, figCy] = getFigureCenter();
  const [boardCx, boardCy] = getBoardCenter();
  const dx = boardCx - figCx;
  const dy = boardCy - figCy;
  if (Math.abs(dx) < 1e-9 && Math.abs(dy) < 1e-9) return;

  // déplacer les points (sommets, gliders, centre du cercle si nécessaire)
  (points || []).forEach(p => {
    try { p.moveTo([p.X() + dx, p.Y() + dy], 0); } catch (e) {
      try { p.setPosition(JXG.COORDS_BY_USER, [p.X() + dx, p.Y() + dy]); } catch (ee) {}
    }
  });

  if (typeof centerPoint !== 'undefined' && centerPoint && !points.includes(centerPoint)) {
    try { centerPoint.moveTo([centerPoint.X() + dx, centerPoint.Y() + dy], 0); } catch (e) {
      try { centerPoint.setPosition(JXG.COORDS_BY_USER, [centerPoint.X() + dx, centerPoint.Y() + dy]); } catch (ee) {}
    }
  }
  if (typeof circlePoint !== 'undefined' && circlePoint && !points.includes(circlePoint)) {
    try { circlePoint.moveTo([circlePoint.X() + dx, circlePoint.Y() + dy], 0); } catch (e) {
      try { circlePoint.setPosition(JXG.COORDS_BY_USER, [circlePoint.X() + dx, circlePoint.Y() + dy]); } catch (ee) {}
    }
  }

  // déplacer les handles invisibles (labels, length handles, etc.)
  const moveObj = (o) => {
    if (!o) return;
    try { o.moveTo([o.X() + dx, o.Y() + dy], 0); } catch (e) {
      try { o.setPosition(JXG.COORDS_BY_USER, [o.X() + dx, o.Y() + dy]); } catch (ee) {}
    }
  };

  (labelHandles || []).forEach(moveObj);
  (lengthHandles || []).forEach(moveObj);

  // déplacer les textes si possible
  const moveText = (t) => {
    if (!t) return;
    try {
      if (typeof t.setPosition === 'function') {
        t.setPosition(JXG.COORDS_BY_USER, [t.X() + dx, t.Y() + dy]);
      }
    } catch (e) {}
  };
  (labelTexts || []).forEach(moveText);
  (texts || []).forEach(moveText);
  (lengthLabels || []).forEach(moveText);

  // Mise à jour finale
  updateCodings();
  updateDiagonals();
  updateLengthLabels();
  updateEqualAngleMarkers(document.getElementById("toggleEqualAngles")?.checked);
  updateRightAngleMarkers(document.getElementById("toggleRightAngles")?.checked);
  board.update();
}


function generateFigure() {
  const prompt = document.getElementById("promptInput").value.toLowerCase();

  const labelInput = document.getElementById("labelInput").value.trim();
  if (labelInput.includes(",")) {
    customLabels = labelInput.split(',').map(s => s.trim().toUpperCase());
  } else if (labelInput.includes(" ")) {
    customLabels = labelInput.split(' ').map(s => s.trim().toUpperCase());
  } else {
    customLabels = labelInput.toUpperCase().split('');
  }

  // Réinitialiser proprement le board
  board.removeObject([...board.objectsList]);
  while (board.objectsList.length > 0) board.removeObject(board.objectsList[0]);

  // reset locals
  points = [];
  texts = [];
  polygon = null;
  centerPoint = null;
  circlePoint = null;
  circleObject = null;

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
  } else if (prompt.includes("triangle isocèle")) {
    const [base, height] = extractTwoNumbers(prompt, [4, 3]);
    drawIsoscelesTriangle(base, height);
  } else if (prompt.includes("losange")) {
    const size = extractNumber(prompt, 4);
    drawLosange(size);
  } else if (prompt.includes("parallélogramme")) {
    const [base, height] = extractTwoNumbers(prompt, [4, 3]);
    drawParallelogram(base, height);
  } else if (prompt.includes("hexagone")) {
    const side = extractNumber(prompt, 4);
    drawRegularPolygon(6, side);
  } else if (prompt.includes("pentagone")) {
    const side = extractNumber(prompt, 4);
    drawRegularPolygon(5, side);
  }

  // recentrer la figure générée au centre du panneau
  try { centerFigure(); } catch (e) { console.warn('centerFigure failed', e); }

  // mise à jour finale
  board.update();
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

function addDraggingToPolygon(polygon, points, texts, handles = []) {
  let startCoords = null;

  polygon.rendNode.addEventListener('mousedown', function (e) {
    startCoords = board.getUsrCoordsOfMouse(e);

    function onMouseMove(ev) {
      const newCoords = board.getUsrCoordsOfMouse(ev);
      const dx = newCoords[0] - startCoords[0];
      const dy = newCoords[1] - startCoords[1];
      startCoords = newCoords;

      points.forEach(pt => {
        try { pt.moveTo([pt.X() + dx, pt.Y() + dy], 0); }
        catch (err) { try { pt.setPosition(JXG.COORDS_BY_USER, [pt.X() + dx, pt.Y() + dy]); } catch(e){} }
      });

      // déplacer aussi les handles (labels) si fournis
      handles.forEach(h => {
        try { h.moveTo([h.X() + dx, h.Y() + dy], 0); }
        catch (err) { try { h.setPosition(JXG.COORDS_BY_USER, [h.X() + dx, h.Y() + dy]); } catch(e){} }
      });

      texts.forEach(txt => {
        try {
          if (typeof txt.setPosition === 'function') {
            txt.setPosition(JXG.COORDS_BY_USER, [txt.X() + dx, txt.Y() + dy]);
          }
        } catch (err) { /* ignore */ }
      });

      updateCodings();
      board.update();
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
  // Points dans l'ordre : A (bas-gauche), B (bas-droite), C (haut-droite), D (haut-gauche)
  const A = board.create('point', [0, 0], { name: '', fixed: true, visible: false });
  const B = board.create('point', [width, 0], { name: '', fixed: true, visible: false });
  const C = board.create('point', [width, height], { name: '', fixed: true, visible: false });
  const D = board.create('point', [0, height], { name: '', fixed: true, visible: false });

  points = [A, B, C, D]; // A=0, B=1, C=2, D=3
  
  console.log('Rectangle créé - Points dans l\'ordre:', 'A(0,0)', 'B(' + width + ',0)', 'C(' + width + ',' + height + ')', 'D(0,' + height + ')'); // Debug

  polygon = board.create('polygon', points, {
    borders: {
      strokeColor: "black",
      fixed: true
    },
    fillColor: "white",
    fillOpacity: 1
  });

  let labelA = board.create('text', [A.X(), A.Y() - 0.3, getLabel(0)]);
  let labelB = board.create('text', [B.X(), B.Y() - 0.3, getLabel(1)]);
  let labelC = board.create('text', [C.X(), C.Y() + 0.3, getLabel(2)]);
  let labelD = board.create('text', [D.X(), D.Y() + 0.3, getLabel(3)]);
  texts.push(labelA, labelB, labelC, labelD);

  addDraggingToPolygon(polygon, points, texts);
  updateCodings();
  updateDiagonals();
  updateLengthLabels();
  updateRightAngleMarkers(document.getElementById("toggleRightAngles").checked);
}

function updateLengthLabels() {
  // Supprimer les longueurs précédentes et leurs handles
  lengthLabels.forEach(label => { try { board.removeObject(label); } catch (e) {} });
  lengthHandles.forEach(h => { try { board.removeObject(h); } catch (e) {} });
  lengthLabels = [];
  lengthHandles = [];
  lengthHandleMeta = [];

  const showLengths = document.getElementById("toggleLengths")?.checked;
  const showUnits = document.getElementById("showUnitsCheckbox")?.checked;
  const unit = document.getElementById("unitSelector")?.value || 'cm';

  if (!showLengths || points.length === 0) return;

  function formatLength(len) {
    const rounded = Math.round(len * 10) / 10;
    const space = '\u00A0';
    const value = Number.isInteger(rounded) ? `${rounded}` : `${rounded}`.replace('.', ',');
    // CORRECTION : Toujours afficher les unités quand showLengths est coché
    return showUnits ? `${value}${space}${unit.trim()}` : `${value}`;
  }

  const n = points.length;
  let sidesToShow = [];

  if (n === 4) {
    const sideLens = [];
    for (let i = 0; i < 4; i++) {
      const pt1 = points[i];
      const pt2 = points[(i + 1) % 4];
      const len = Math.hypot(pt2.X() - pt1.X(), pt2.Y() - pt1.Y());
      sideLens.push(len);
    }
    const rounded = sideLens.map(len => Math.round(len * 100) / 100);
    const unique = [...new Set(rounded.map(l => l.toFixed(2)))];
    if (unique.length === 1) sidesToShow = [0];
    else if (unique.length === 2) sidesToShow = [0, 1];
    else sidesToShow = [0,1,2,3];
  } else {
    sidesToShow = [...Array(n).keys()];
  }

  for (let i of sidesToShow) {
    const pt1 = points[i];
    const pt2 = points[(i + 1) % n];

    // calcul position par défaut (milieu + décalage orthogonal)
    const defaultOffset = 0.3;
    const offsetsForParallelogram = [0.2, 0.5, 0.2, 0.5];
    let offset = defaultOffset;
    if (points.length === 4 && polygon) {
      offset = offsetsForParallelogram[i] !== undefined ? offsetsForParallelogram[i] : defaultOffset;
    }

    const dx = pt2.X() - pt1.X();
    const dy = pt2.Y() - pt1.Y();
    const len = Math.hypot(dx, dy) || 1;
    const midX = (pt1.X() + pt2.X()) / 2 + offset * (dy / len);
    const midY = (pt1.Y() + pt2.Y()) / 2 - offset * (dx / len);

    // Création du handle
    const handle = board.create('point', [ midX, midY ], {
      size: 6,
      strokeOpacity: 0,
      fillOpacity: 0,
      fixed: false,
      name: '',
      highlight: false,
      showInfobox: false
    });
    handle._auto = true;

    try { if (handle.rendNode) handle.rendNode.style.cursor = 'move'; } catch (e) {}

    // label qui suit le handle
    const label = board.create('text', [
      () => handle.X(),
      () => handle.Y(),
      () => formatLength(Math.hypot(pt2.X() - pt1.X(), pt2.Y() - pt1.Y()))
    ], {
      fontSize: 14,
      fixed: false,
      anchorX: 'middle',
      anchorY: 'middle',
      highlight: false,
      name: ''
    });

    // drag du label -> déplace handle
    try {
      if (label.rendNode) {
        label.rendNode.style.cursor = 'move';
        label.rendNode.addEventListener('pointerdown', function (ev) {
          ev.stopPropagation(); ev.preventDefault();
          handle._auto = false;
          const start = board.getUsrCoordsOfMouse(ev);
          function onMove(e) {
            const pos = board.getUsrCoordsOfMouse(e);
            const dxm = pos[0] - start[0];
            const dym = pos[1] - start[1];
            try { handle.moveTo([handle.X() + dxm, handle.Y() + dym], 0); }
            catch (err) { try { handle.setPosition(JXG.COORDS_BY_USER, [handle.X() + dxm, handle.Y() + dym]); } catch(e) {} }
            start[0] = pos[0]; start[1] = pos[1];
            board.update();
          }
          function onUp() {
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerup', onUp);
          }
          document.addEventListener('pointermove', onMove);
          document.addEventListener('pointerup', onUp);
        }, { passive: false });
      }
    } catch (e) {}

    lengthHandles.push(handle);
    lengthLabels.push(label);
    lengthHandleMeta.push({ handle, pt1, pt2, offset });
  }

  // Synchronisation automatique
  function syncLengthHandles() {
    for (const meta of lengthHandleMeta) {
      const h = meta.handle;
      if (!h || !h._auto) continue;
      const p1 = meta.pt1, p2 = meta.pt2, off = meta.offset || 0.3;
      const dx = p2.X() - p1.X(), dy = p2.Y() - p1.Y();
      const len = Math.hypot(dx, dy) || 1;
      const x = (p1.X() + p2.X()) / 2 + off * (dy / len);
      const y = (p1.Y() + p2.Y()) / 2 - off * (dx / len);
      try { h.moveTo([x, y], 0); } catch (err) { try { h.setPosition(JXG.COORDS_BY_USER, [x, y]); } catch(e) {} }
    }
    board.update();
  }

  if (!_lengthSyncAttached) {
    try {
      if (typeof board.on === 'function') {
        board.on('update', syncLengthHandles);
        _lengthSyncAttached = true;
      } else {
        setInterval(syncLengthHandles, 120);
        _lengthSyncAttached = true;
      }
    } catch (e) {}
  }
}



function drawCircle(radius) {
  // cleanup if déjà présents
  if (centerPoint) try { board.removeObject(centerPoint); } catch (e) {}
  if (circlePoint) try { board.removeObject(circlePoint); } catch (e) {}
  if (circleObject) try { board.removeObject(circleObject); } catch (e) {}
  // remove previous label handles/texts if any
  if (labelHandles && labelHandles.length) {
    labelHandles.forEach(h => { try { board.removeObject(h); } catch (e) {} });
    labelHandles = [];
  }
  if (labelTexts && labelTexts.length) {
    labelTexts.forEach(t => { try { board.removeObject(t); } catch (e) {} });
    labelTexts = [];
  }

  // créer le centre (sans label natif)
  centerPoint = board.create('point', [0, 0], {
    name: '',               // on gère le label séparément pour le rendre déplaçable
    showInfobox: false,
    fixed: false,
    size: 4,
    face: 'x',
    strokeColor: 'black',
    fillColor: 'black'
  });

  // cercle
  circleObject = board.create('circle', [centerPoint, radius], {
    strokeWidth: 2,
    strokeColor: 'black'
  });

  // point A sur le cercle (glider) sans label natif
  circlePoint = board.create('glider', [radius, 0, circleObject], {
    name: '',
    showInfobox: false,
    size: 4,
    strokeColor: 'black',
    fillColor: 'black'
  });

  points = [circlePoint];
  // --- Créer handles et textes déplaçables pour O et A ---

  // handle et label pour O (initial proche du centre)
  const startOX = centerPoint.X()-0.05;
  const startOY = centerPoint.Y()+0.15;
  const handleO = board.create('point', [startOX, startOY], {
    size: 6,
    strokeOpacity: 0,
    fillOpacity: 0,
    fixed: false,
    name: '',
    highlight: false,
    showInfobox: false
  });
  const labelO = board.create('text', [
    () => handleO.X(),
    () => handleO.Y(),
    'O'
  ], {
    anchorX: 'middle',
    anchorY: 'bottom',
    fontSize: 16,
    fixed: false,
    name: ''
  });

  // handle et label pour A (initial proche du point A)
  const startAX = circlePoint.X() + 0.3;
  const startAY = circlePoint.Y();
  const handleA = board.create('point', [startAX, startAY], {
    size: 6,
    strokeOpacity: 0,
    fillOpacity: 0,
    fixed: false,
    name: '',
    highlight: false,
    showInfobox: false
  });
  const labelA = board.create('text', [
    () => handleA.X(),
    () => handleA.Y(),
    'A'
  ], {
    anchorX: 'middle',
    anchorY: 'bottom',
    fontSize: 16,
    fixed: false,
    name: ''
  });

  // stocker pour nettoyage éventuel
  labelHandles.push(handleO, handleA);
  labelTexts.push(labelO, labelA);

  // after creating text objects, force a render so rendNode exists
  board.update();

  // rendre les labels "draggables" : relayer mousedown -> déplacer le handle
  function makeLabelDraggable(textObj, handle) {
    try {
      if (!textObj.rendNode) return;
      textObj.rendNode.style.cursor = 'move';
      // use pointer events to support touch+mouse
      textObj.rendNode.addEventListener('pointerdown', function (ev) {
        ev.stopPropagation();
        ev.preventDefault();
        const start = board.getUsrCoordsOfMouse(ev);
        function onMove(e) {
          const pos = board.getUsrCoordsOfMouse(e);
          const dxm = pos[0] - start[0];
          const dym = pos[1] - start[1];
          // moveTo expects user coords
          try { handle.moveTo([handle.X() + dxm, handle.Y() + dym], 0); } catch (err) {
            // fallback: setCoords if available
            try { handle.setPosition(JXG.COORDS_BY_USER, [handle.X() + dxm, handle.Y() + dym]); } catch (e) {}
          }
          start[0] = pos[0]; start[1] = pos[1];
          board.update();
        }
        function onUp() {
          document.removeEventListener('pointermove', onMove);
          document.removeEventListener('pointerup', onUp);
        }
        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp);
      }, { passive: false });
    } catch (e) { /* ignore */ }
  }

  makeLabelDraggable(labelO, handleO);
  makeLabelDraggable(labelA, handleA);

  // ensure radius option listener exists safely
  try {
    const el = document.getElementById("toggleRadius");
    if (el) el.addEventListener("change", updateCircleExtras);
  } catch (e) {}

  // MAJ initiale des extras si nécessaire
  updateCircleExtras();
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

function drawIsoscelesTriangle(base = 4, height = 3) {
  // position : base sur l'axe des abscisses, sommet au milieu
  const A = board.create('point', [0, 0], {visible: false, fixed: true});
  const B = board.create('point', [base, 0], {visible: false, fixed: true});
  const C = board.create('point', [base / 2, height], {visible: false, fixed: true});

  points = [A, B, C];
  polygon = board.create('polygon', points, {
    borders: { strokeColor: 'black' },
    fillColor: 'white',
    fillOpacity: 1
  });

  const labelA = board.create('text', [A.X(), A.Y() - 0.3, getLabel(0)]);
  const labelB = board.create('text', [B.X(), B.Y() - 0.3, getLabel(1)]);
  const labelC = board.create('text', [C.X(), C.Y() + 0.3, getLabel(2)]);
  texts.push(labelA, labelB, labelC);

  addDraggingToPolygon(polygon, points, texts);

  // Mettre à jour les marqueurs/labels pertinents
  updateEqualAngleMarkers(document.getElementById("toggleEqualAngles")?.checked);
  updateRightAngleMarkers(document.getElementById("toggleRightAngles")?.checked);
  updateLengthLabels();
  updateCodings();
  updateDiagonals();
}


function drawParallelogram(base, sideLength) {
  // angle entre la base et le côté adjacent (ajuste si tu veux une inclinaison différente)
  const theta = Math.PI / 3; // 60°
  const offset = sideLength * Math.cos(theta); // projection horizontale du côté oblique
  const height = sideLength * Math.sin(theta); // hauteur effective

  // sommets
  const A = board.create('point', [0, 0], { visible: false, fixed: true });
  const B = board.create('point', [base, 0], { visible: false, fixed: true });
  const C = board.create('point', [base - offset, height], { visible: false, fixed: true });
  const D = board.create('point', [-offset, height], { visible: false, fixed: true });

  points = [A, B, C, D];

  polygon = board.create('polygon', points, {
    borders: { strokeColor: "black" },
    fillColor: "white",
    fillOpacity: 1
  });

  // rendre les sommets déplaçables (comme avant)
  polygon.borders.forEach(segment => {
    segment.point1.setAttribute({ fixed: false });
    segment.point2.setAttribute({ fixed: false });
  });

  // handles invisibles et labels qui suivent les sommets
  const labelOffsetDefaults = [
    [-0.25, -0.25],
    [0.25, -0.25],
    [0.25, 0.25],
    [-0.25, 0.25]
  ];

  const localHandles = [];
  const localTexts = [];

  for (let i = 0; i < 4; i++) {
    const pt = points[i];
    const off = labelOffsetDefaults[i] || [0.25, 0.25];
    const hx = pt.X() + off[0];
    const hy = pt.Y() + off[1];

    const h = board.create('point', [hx, hy], {
      size: 6,
      strokeOpacity: 0,
      fillOpacity: 0,
      fixed: false,
      name: '',
      highlight: false,
      showInfobox: false
    });

    const txt = board.create('text', [
      () => h.X(),
      () => h.Y(),
      getLabel(i)
    ], {
      anchorX: 'middle',
      anchorY: 'bottom',
      fontSize: 16,
      fixed: false,
      name: ''
    });

    try {
      if (txt.rendNode) {
        txt.rendNode.style.cursor = 'move';
        txt.rendNode.addEventListener('pointerdown', function (ev) {
          ev.stopPropagation(); ev.preventDefault();
          const start = board.getUsrCoordsOfMouse(ev);
          function onMove(e) {
            const pos = board.getUsrCoordsOfMouse(e);
            const dx = pos[0] - start[0];
            const dy = pos[1] - start[1];
            try { h.moveTo([h.X() + dx, h.Y() + dy], 0); } catch (err) {
              try { h.setPosition(JXG.COORDS_BY_USER, [h.X() + dx, h.Y() + dy]); } catch(e) {}
            }
            start[0] = pos[0]; start[1] = pos[1];
            board.update();
          }
          function onUp() {
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerup', onUp);
          }
          document.addEventListener('pointermove', onMove);
          document.addEventListener('pointerup', onUp);
        }, { passive: false });
      }
    } catch (e) { /* ignore */ }

    localHandles.push(h);
    localTexts.push(txt);
    labelHandles.push(h);
    labelTexts.push(txt);
    texts.push(txt);
  }

  addDraggingToPolygon(polygon, points, localTexts, localHandles);

  updateDiagonals();
  updateCodings();
  updateLengthLabels();
  updateRightAngleMarkers(document.getElementById("toggleRightAngles").checked);
}



function drawRegularPolygon(n, side) {
  const center = [0, 0];
  const angle = (2 * Math.PI) / n;
  // CORRECTION : formule simplifiée pour avoir la bonne taille
  const radius = side / (2 * Math.sin(Math.PI / n));

  points = [];
  // CORRECTION : commencer à -π/2 pour avoir un sommet en haut
  for (let i = 0; i < n; i++) {
    const x = center[0] + radius * Math.cos(i * angle - Math.PI / 2);
    const y = center[1] + radius * Math.sin(i * angle - Math.PI / 2);
    points.push(board.create('point', [x, y], {visible: false, fixed: true}));
  }

  polygon = board.create('polygon', points, {
    borders: {strokeColor: "black", fixed: true},
    fillColor: "white",
    fillOpacity: 1
  });

  // CORRECTION : utiliser getLabel() pour cohérence avec les autres figures
  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    const label = board.create('text', [pt.X() + 0.2, pt.Y() + 0.2, getLabel(i)]);
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
  updateEqualAngleMarkers(document.getElementById("toggleEqualAngles")?.checked);
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
  updateEqualAngleMarkers(document.getElementById("toggleEqualAngles")?.checked);
  updateRightAngleMarkers(document.getElementById("toggleRightAngles")?.checked);
  board.update();
}

function rotateFigureLeft(step = Math.PI / 18) {
  // appelle rotateFigure avec signe négatif pour tourner à gauche
  rotateFigure(-Math.abs(step));
}


    function zoomIn() {
      board.zoomIn();
    }

    function zoomOut() {
      board.zoomOut();
    }
function resetBoard() {
  // Supprime complètement l'ancien board
  JXG.JSXGraph.freeBoard(board);

  // En recrée un tout neuf
  board = JXG.JSXGraph.initBoard('jxgbox', {
    boundingbox: [-5, 5, 5, -5],
    axis: false,
    showCopyright: false,
    showNavigation: false,
    keepaspectratio: true,
    zoom: { enabled: false }
  });

createBoardControls();



  // Remet à zéro tous les tableaux liés aux éléments
  points = [];
  polygon = null;
  texts = [];
  rightAngleMarkers = [];
  angleMarkers.forEach(marker => board.removeObject(marker));
  angleMarkers = [];
  lengthLabels = [];
  codingMarks = [];
  codingSegments = [];
  diagonals = [];
  diameterSegment = null;
  diameterPoints = [];
  centerPoint = null;
  circlePoint = null;
  circleObject = null;
  radiusSegment = null;
  radiusLabel = null;
  radiusLabelAnchor = null;
  extraElements = [];
  r = null;
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
  "triangle isocèle de base 6 et hauteur 4",
  "cercle de rayon 2",
  "losange de côté 5",
  "parallélogramme base 5 hauteur 3",
  "hexagone de côté 4",
  "pentagone de côté 4"
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

document.addEventListener('DOMContentLoaded', function () {
  console.log('🚀 Initialisation du générateur...');

  // ==========================================
  // 1. RESET INITIAL DE L'INTERFACE
  // ==========================================
  
  // Reset des checkboxes
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
  });
  
  // Reset des inputs
  const promptEl = document.getElementById('promptInput');
  const labelEl = document.getElementById('labelInput');
  const search = document.getElementById('figureSearch');
  
  if (promptEl) promptEl.value = '';
  if (labelEl) labelEl.value = '';
  if (search) search.value = '';
  
  // Reset suggestions
  const suggestionBox = document.getElementById('suggestionBox');
  if (suggestionBox) {
    suggestionBox.style.display = 'none';
    suggestionBox.innerHTML = '';
  }
  
  // Reset liste des figures
  const figuresList = document.getElementById('figuresList');
  if (figuresList) {
    Array.from(figuresList.children).forEach(li => {
      li.classList.remove('selected', 'highlighted');
    });
  }

  // ==========================================
  // 2. GESTION CONDITIONNELLE DES UNITÉS
  // ==========================================
  
  const toggleLengths = document.getElementById('toggleLengths');
  const unitGroup = document.getElementById('unitGroup');
  const showUnitsCheckbox = document.getElementById('showUnitsCheckbox');
  const unitSelector = document.getElementById('unitSelector');

  if (toggleLengths && unitGroup) {
    // Fonction pour afficher/cacher le groupe unités
    function updateUnitVisibility() {
      if (toggleLengths.checked) {
        unitGroup.style.display = 'block';
      } else {
        unitGroup.style.display = 'none';
        // Optionnel : décocher automatiquement les unités
        if (showUnitsCheckbox) showUnitsCheckbox.checked = false;
      }
      // Mettre à jour l'affichage des mesures
      if (typeof updateLengthLabels === 'function') {
        updateLengthLabels();
      }
    }
    
    // Appliquer la règle au chargement (unitGroup doit être caché par défaut)
    updateUnitVisibility();
    
    // Event listener pour "Afficher les mesures"
    toggleLengths.addEventListener('change', updateUnitVisibility);
    
    // Event listeners pour les contrôles d'unités
    if (showUnitsCheckbox) {
      showUnitsCheckbox.addEventListener('change', function() {
        if (typeof updateLengthLabels === 'function') updateLengthLabels();
      });
    }
    
    if (unitSelector) {
      unitSelector.addEventListener('change', function() {
        if (typeof updateLengthLabels === 'function') updateLengthLabels();
      });
    }
    
    console.log('✅ Gestion des unités configurée');
  }

  // ==========================================
  // 3. LISTE DES FIGURES - Clic pour générer
  // ==========================================
  
  if (figuresList && promptEl) {
    figuresList.addEventListener('click', function (e) {
      const li = e.target.closest('li');
      if (!li) return;
      
      // Récupérer le prompt depuis data-prompt ou générer depuis le texte
      let prompt = li.getAttribute('data-prompt');
      
      if (!prompt) {
        const text = li.textContent || li.innerText;
        
        // Mapping texte → prompt
        const textToPrompt = {
          'Carré': 'carré de côté 4',
          'Rectangle': 'rectangle de 5 sur 3', 
          'Triangle équilatéral': 'triangle équilatéral de côté 4',
          'Triangle rectangle': 'triangle rectangle de base 3 et hauteur 4',
          'Triangle isocèle': 'triangle isocèle de base 6 et hauteur 4',
          'Cercle': 'cercle de rayon 2',
          'Losange': 'losange de côté 5',
          'Parallélogramme': 'parallélogramme base 5 hauteur 3',
          'hexagone': 'hexagone de côté 4',
          'pentagone': 'pentagone de côté 4'
        };
        
        // Chercher la correspondance
        for (const [key, value] of Object.entries(textToPrompt)) {
          if (text.includes(key)) {
            prompt = value;
            break;
          }
        }
        
        // Fallback
        if (!prompt) prompt = text.toLowerCase();
      }
      
      // Mettre le prompt dans l'input ET générer
      promptEl.value = prompt;
      if (typeof generateFigure === 'function') {
        generateFigure();
      }
    });
    
    console.log('✅ Liste des figures configurée');
  }

  // ==========================================
  // 4. RECHERCHE DANS LA LISTE
  // ==========================================
  
  if (search && figuresList) {
    search.addEventListener('input', function () {
      const query = this.value.trim().toLowerCase();
      
      Array.from(figuresList.children).forEach(li => {
        const text = (li.textContent || '').toLowerCase();
        li.style.display = text.includes(query) ? '' : 'none';
      });
    });
    
    console.log('✅ Recherche configurée');
  }

  // ==========================================
  // 5. EVENT LISTENER POUR ENTRÉE CLAVIER
  // ==========================================
  
  if (promptEl) {
    promptEl.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        if (typeof generateFigure === 'function') {
          generateFigure();
        }
      }
    });
    
    console.log('✅ Touche Entrée configurée');
  }

  // ==========================================
  // 6. EVENT LISTENERS POUR LES OPTIONS
  // ==========================================
  
  // Fonction helper pour éviter les erreurs si l'élément n'existe pas
  function safeAddEventListener(id, event, handler) {
    const element = document.getElementById(id);
    if (element && typeof handler === 'function') {
      element.addEventListener(event, handler);
      return true;
    }
    return false;
  }
  
  // Event listeners pour les toggles (UNIQUEMENT ici, pas ailleurs)
  const eventListeners = [
    ['toggleCodings', 'change', () => { if (typeof updateCodings === 'function') updateCodings(); }],
    ['toggleDiagonals', 'change', () => { if (typeof updateDiagonals === 'function') updateDiagonals(); }],
    ['toggleRadius', 'change', () => { if (typeof updateCircleExtras === 'function') updateCircleExtras(); }],
    ['toggleDiameter', 'change', () => { if (typeof updateCircleExtras === 'function') updateCircleExtras(); }],
    ['toggleEqualAngles', 'change', (e) => { if (typeof updateEqualAngleMarkers === 'function') updateEqualAngleMarkers(e.target.checked); }],
    ['toggleRightAngles', 'change', (e) => { if (typeof updateRightAngleMarkers === 'function') updateRightAngleMarkers(e.target.checked); }]
  ];
  
  let listenersAdded = 0;
  eventListeners.forEach(([id, event, handler]) => {
    if (safeAddEventListener(id, event, handler)) {
      listenersAdded++;
    }
  });
  
  console.log(`✅ ${listenersAdded} event listeners configurés`);

  // ==========================================
  // 7. BOUTON D'EXPORT SVG
  // ==========================================
  
  const panel = document.getElementById('optionsPanel');
  if (panel && !document.getElementById('exportSvgBtn')) {
    const exportBtn = document.createElement('button');
    exportBtn.id = 'exportSvgBtn';
    exportBtn.textContent = 'Exporter SVG';
    exportBtn.style.cssText = `
      margin-top: 10px; 
      padding: 8px 16px; 
      background: #6c5ce7; 
      color: white; 
      border: none; 
      border-radius: 4px; 
      cursor: pointer;
      font-family: inherit;
    `;
    
    exportBtn.addEventListener('click', function() {
      if (typeof exportBoardToSVG === 'function') {
        exportBoardToSVG();
      }
    });
    
    panel.insertAdjacentElement('afterend', exportBtn);
    console.log('✅ Bouton export créé');
  }

  // ==========================================
  // 8. NETTOYAGE DES VARIABLES GLOBALES
  // ==========================================
  
  if (typeof customLabels !== 'undefined') {
    customLabels = [];
  }

  console.log('🎉 Initialisation terminée avec succès !');
});

// Masquer les suggestions si on clique ailleurs
document.addEventListener("click", (e) => {
  if (!suggestionsDiv.contains(e.target) && e.target !== input) {
    suggestionsDiv.style.display = "none";
  }
});


function updateSuggestionHighlight(suggestions) {
  suggestions.forEach((item, index) => {
    if (index === selectedSuggestionIndex) {
      item.classList.add("highlighted");
    } else {
      item.classList.remove("highlighted");
    }
  });
}


// Exporter le board JSXGraph en SVG (téléchargement)
async function exportBoardToSVG(filename = null) {
  try {
    // Forcer TOUTES les mises à jour selon les checkboxes cochées
    if (document.getElementById('toggleLengths')?.checked) {
      updateLengthLabels();
    }
    if (document.getElementById('toggleDiagonals')?.checked) {
      updateDiagonals();
    }
    if (document.getElementById('toggleCodings')?.checked) {
      updateCodings();
    }
    if (document.getElementById('toggleRadius')?.checked || document.getElementById('toggleDiameter')?.checked) {
      updateCircleExtras();
    }
    if (document.getElementById('toggleEqualAngles')?.checked) {
      updateEqualAngleMarkers(true);
    }
    if (document.getElementById('toggleRightAngles')?.checked) {
      updateRightAngleMarkers(true);
    }
    board.update();
  } catch (e) {}

  const jxgBox = document.getElementById('jxgbox');
  if (!jxgBox) { alert('Zone graphique introuvable'); return; }

  // MASQUER UNIQUEMENT les boutons de contrôle (pas les éléments graphiques)
  const controlButtons = jxgBox.querySelectorAll('button, .control-btn, .jxg-button, [class*="btn"]');
  const hiddenElements = [];
  
  controlButtons.forEach(btn => {
    // Vérifier si c'est vraiment un bouton de contrôle et non un élément graphique
    const isControlButton = btn.tagName === 'BUTTON' || 
                           btn.classList.contains('control-btn') || 
                           btn.classList.contains('jxg-button') ||
                           btn.textContent.includes('+') || 
                           btn.textContent.includes('-') ||
                           btn.textContent.includes('⟲') ||
                           btn.textContent.includes('⟳') ||
                           btn.textContent.includes('Réinitialiser');
    
    if (isControlButton && btn.style.display !== 'none') {
      btn.style.display = 'none';
      hiddenElements.push(btn);
    }
  });

  try {
    if (!window.html2canvas) {
      const script = document.createElement('script');
      script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
      document.head.appendChild(script);
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
      });
    }

    // Attendre un peu pour que les changements de style prennent effet
    await new Promise(resolve => setTimeout(resolve, 100));

    const canvas = await html2canvas(jxgBox, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      allowTaint: true,
      ignoreElements: (element) => {
        // Ignorer les éléments de contrôle qui n'ont pas pu être masqués
        return element.tagName === 'BUTTON' || 
               element.classList.contains('control-btn') ||
               element.classList.contains('jxg-button');
      }
    });

    const imgData = canvas.toDataURL('image/png');
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
     width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}">
  <rect width="100%" height="100%" fill="white"/>
  <image width="${canvas.width}" height="${canvas.height}" xlink:href="${imgData}"/>
</svg>`;

    if (!filename) {
      const baseName = document.getElementById('labelInput')?.value || 
                      document.getElementById('promptInput')?.value || 'figure';
      filename = (baseName.replace(/[^\w\-_\s\.]/g, '_') || 'figure') + '.svg';
    }

    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    console.error('Erreur export:', error);
    alert('Erreur lors de l\'export. Essayez de recharger la page.');
  } finally {
    // RÉAFFICHER tous les boutons masqués
    hiddenElements.forEach(btn => {
      btn.style.display = '';
    });
  }
}



function safeOn(id, event, handler) {
  const el = document.getElementById(id);
  if (el) el.addEventListener(event, handler);
}




