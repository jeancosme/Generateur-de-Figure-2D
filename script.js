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
    let angleMarkers = [];
    let lengthHandles = []; // <-- NEW: handles for draggable length labels



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

    // Position initiale du label (au milieu du segment, décalé)
    const midX = (pt1.X() + pt2.X()) / 2 + offset * (dy / len);
    const midY = (pt1.Y() + pt2.Y()) / 2 - offset * (dx / len);

    // Créer un handle (point invisible mais cliquable) que l'utilisateur peut déplacer
    const handle = board.create('point', [
      () => midX,
      () => midY
    ], {
      size: 6,                // zone cliquable
      strokeOpacity: 0,      // invisible visuellement
      fillOpacity: 0,        // invisible visuellement
      fixed: false,
      name: '',
      highlight: false,
      showInfobox: false
    });

    // Forcer le curseur "move" sur le handle pour UX
    try { if (handle.rendNode) handle.rendNode.style.cursor = 'move'; } catch (e) {}

    // Créer un label qui suit le handle
    const label = board.create('text', [
      () => handle.X(),
      () => handle.Y(),
      () => formatLength(Math.sqrt((pt2.X() - pt1.X())**2 + (pt2.Y() - pt1.Y())**2))
    ], {
      fontSize: 14,
      fixed: false,            // non fixe => suit le handle dynamiquement
      anchorX: 'middle',
      anchorY: 'middle',
      highlight: false,
      name: ''
    });

    // Rendre la zone du texte également draggable : relayer les événements souris au handle
    try {
      if (label.rendNode) {
        label.rendNode.style.cursor = 'move';
        label.rendNode.addEventListener('mousedown', function (ev) {
          ev.stopPropagation();
          ev.preventDefault();
          const start = board.getUsrCoordsOfMouse(ev);
          function onMove(e) {
            const pos = board.getUsrCoordsOfMouse(e);
            const dxm = pos[0] - start[0];
            const dym = pos[1] - start[1];
            // déplacer handle (point.moveTo attend des coordonnées)
            handle.moveTo([handle.X() + dxm, handle.Y() + dym], 0);
            // mettre à jour start
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

    lengthHandles.push(handle);
    lengthLabels.push(label);
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
  if (typeof visible === 'object' && visible !== null && 'target' in visible) visible = !!visible.target.checked;
  else visible = !!visible;

  // supprimer anciens marqueurs
  angleMarkers.forEach(m => { try { board.removeObject(m); } catch (e) {} });
  angleMarkers = [];
  if (!visible || !points || points.length < 3) { board.update(); return; }

  // Ne pas afficher pour carré/rectangle
  const fig = typeof detectCurrentFigure === 'function' ? detectCurrentFigure() : '';
  if (fig === 'square' || fig === 'rectangle') { board.update(); return; }

  // helper : point in polygon (ray-casting)
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

  // construire tableau de coordonnées polygonales pour tests
  const polyCoords = points.map(p => [p.X(), p.Y()]);

  const n = points.length;
  const angles = new Array(n).fill(null);

  // calculer tous les angles (cos -> acos stable)
  for (let i = 0; i < n; i++) {
    const A = points[(i - 1 + n) % n];
    const B = points[i];
    const C = points[(i + 1) % n];
    if (!A || !B || !C) continue;

    const v1x = A.X() - B.X(), v1y = A.Y() - B.Y();
    const v2x = C.X() - B.X(), v2y = C.Y() - B.Y();
    const len1 = Math.hypot(v1x, v1y), len2 = Math.hypot(v2x, v2y);
    if (len1 === 0 || len2 === 0) continue;
    let cosv = (v1x * v2x + v1y * v2y) / (len1 * len2);
    cosv = Math.max(-1, Math.min(1, cosv));
    angles[i] = Math.acos(cosv);
  }

  // grouper angles égaux (tolérance)
  const groups = {};
  for (let i = 0; i < n; i++) {
    const ang = angles[i];
    if (ang == null) continue;
    const key = (Math.round(ang * 100) / 100).toFixed(2);
    if (!groups[key]) groups[key] = [];
    groups[key].push(i);
  }

  // paramètres d'affichage
  const baseRadius = 0.42;
  const segments = 36; // précision de l'arc

  // pour chaque groupe d'angles égaux, dessiner un arc à l'intérieur
  for (const key in groups) {
    const indices = groups[key];
    if (indices.length < 2) continue;

    for (const idx of indices) {
      const B = points[idx];
      const A = points[(idx - 1 + n) % n];
      const C = points[(idx + 1) % n];
      if (!A || !B || !C) continue;

      const v1x = A.X() - B.X(), v1y = A.Y() - B.Y();
      const v2x = C.X() - B.X(), v2y = C.Y() - B.Y();
      const len1 = Math.hypot(v1x, v1y), len2 = Math.hypot(v2x, v2y);
      if (len1 === 0 || len2 === 0) continue;
      const u1x = v1x / len1, u1y = v1y / len1;
      const u2x = v2x / len2, u2y = v2y / len2;

      // angles des rayons
      let a1 = Math.atan2(u1y, u1x);
      let a2 = Math.atan2(u2y, u2x);

      // normaliser diff en [-PI,PI)
      function normAng(a) { while (a <= -Math.PI) a += 2*Math.PI; while (a > Math.PI) a -= 2*Math.PI; return a; }
      let delta = normAng(a2 - a1);

      // radius adapté
      const radius = Math.min(baseRadius, Math.min(len1, len2) * 0.22);

      // tester si le petit arc (sens court) est à l'intérieur : prendre milieu angulaire du petit arc
      const midSmall = a1 + delta / 2;
      const midX = B.X() + Math.cos(midSmall) * radius * 0.9;
      const midY = B.Y() + Math.sin(midSmall) * radius * 0.9;
      const smallInside = pointInPolygon(midX, midY, polyCoords);

      // si le petit arc n'est pas à l'intérieur, on inverse le sens en prenant l'arc long (ajout/soustraction 2PI)
      if (!smallInside) {
        if (delta > 0) delta = delta - 2 * Math.PI;
        else delta = delta + 2 * Math.PI;
      }

      // construire une curve paramétrique t in [0,1] -> angle = a1 + t*delta
      const curve = board.create('curve', [
        function(t) { return B.X() + Math.cos(a1 + t * delta) * radius; },
        function(t) { return B.Y() + Math.sin(a1 + t * delta) * radius; },
        0,
        1
      ], {
        strokeColor: 'black',
        strokeWidth: 1.4,
        fixed: true,
        highlight: false,
        dash: 0,
        name: ''
      });

      angleMarkers.push(curve);
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
  } else if (prompt.includes("triangle isocèle")) {
    // extraire base et hauteur : exemple "triangle isocèle de base 6 et hauteur 4"
    const [base, height] = extractTwoNumbers(prompt, [4, 3]);
    drawIsoscelesTriangle(base, height);
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

function updateLengthLabels() {
  // Supprimer les longueurs précédentes et leurs handles
  lengthLabels.forEach(label => { try { board.removeObject(label); } catch (e) {} });
  lengthHandles.forEach(h => { try { board.removeObject(h); } catch (e) {} });
  lengthLabels = [];
  lengthHandles = [];

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

    // Position initiale du label (au milieu du segment, décalé)
    const midX = (pt1.X() + pt2.X()) / 2 + offset * (dy / len);
    const midY = (pt1.Y() + pt2.Y()) / 2 - offset * (dx / len);

    // Créer un handle (point invisible mais cliquable) que l'utilisateur peut déplacer
    const handle = board.create('point', [
      midX,
      midY
    ], {
      size: 6,                // zone cliquable
      strokeOpacity: 0,      // invisible visuellement
      fillOpacity: 0,        // invisible visuellement
      fixed: false,
      name: '',
      highlight: false,
      showInfobox: false
    });

    // Forcer le curseur "move" sur le handle pour UX
    try { if (handle.rendNode) handle.rendNode.style.cursor = 'move'; } catch (e) {}

    // Créer un label qui suit le handle
    const label = board.create('text', [
      () => handle.X(),
      () => handle.Y(),
      () => formatLength(Math.sqrt((pt2.X() - pt1.X())**2 + (pt2.Y() - pt1.Y())**2))
    ], {
      fontSize: 14,
      fixed: false,            // non fixe => suit le handle dynamiquement
      anchorX: 'middle',
      anchorY: 'middle',
      highlight: false,
      name: ''
    });

    // Rendre la zone du texte également draggable : relayer les événements souris au handle
    try {
      if (label.rendNode) {
        label.rendNode.style.cursor = 'move';
        label.rendNode.addEventListener('mousedown', function (ev) {
          ev.stopPropagation();
          ev.preventDefault();
          const start = board.getUsrCoordsOfMouse(ev);
          function onMove(e) {
            const pos = board.getUsrCoordsOfMouse(e);
            const dxm = pos[0] - start[0];
            const dym = pos[1] - start[1];
            // déplacer handle (point.moveTo attend des coordonnées)
            handle.moveTo([handle.X() + dxm, handle.Y() + dym], 0);
            // mettre à jour start
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

    lengthHandles.push(handle);
    lengthLabels.push(label);
  }
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


function drawParallelogram(base, height) {
  const offset = base / 3;

  // Création des 4 points, invisibles, avec uniquement l'étiquette visible
  const A = board.create('point', [0, 0], {
    name: 'A',
    visible: false,
    fixed: true,
    label: {
      visible: true,
      offset: [-10, -15],
      fontSize: 16
    }
  });

  const B = board.create('point', [base, 0], {
    name: 'B',
    visible: false,
    fixed: true,
    label: {
      visible: true,
      offset: [10, -15],
      fontSize: 16
    }
  });

  const C = board.create('point', [base - offset, height], {
    name: 'C',
    visible: false,
    fixed: true,
    label: {
      visible: true,
      offset: [10, 10],
      fontSize: 16
    }
  });

  const D = board.create('point', [-offset, height], {
    name: 'D',
    visible: false,
    fixed: true,
    label: {
      visible: true,
      offset: [-10, 10],
      fontSize: 16
    }
  });

  points = [A, B, C, D];

  // Création du parallélogramme
  polygon = board.create('polygon', points, {
    borders: { strokeColor: "black" },
    fillColor: "white",
    fillOpacity: 1
  });

  // On rend les sommets du polygone déplaçables (manuellement)
  polygon.borders.forEach(segment => {
    segment.point1.setAttribute({ fixed: false });
    segment.point2.setAttribute({ fixed: false });
  });

  // Pas besoin de texts à part
  addDraggingToPolygon(polygon, points, []);
  updateDiagonals();
  updateCodings();
  updateLengthLabels();
  updateRightAngleMarkers(document.getElementById("toggleRightAngles").checked);

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

// Masque case "unités" si case "longueur" n'est pas cochée
document.addEventListener("DOMContentLoaded", function () {
  const toggleLengths = document.getElementById("toggleLengths");
  const unitGroup = document.getElementById("unitGroup");

  function updateUnitVisibility() {
    unitGroup.style.display = toggleLengths.checked ? "block" : "none";

    // Optionnel : décocher automatiquement "Afficher les unités"
    if (!toggleLengths.checked) {
      document.getElementById("showUnitsCheckbox").checked = false;
    }
  }

  toggleLengths.addEventListener("change", updateUnitVisibility);

  // Mise à jour initiale à l'ouverture
  updateUnitVisibility();
});



// Masquer les suggestions si on clique ailleurs
document.addEventListener("click", (e) => {
  if (!suggestionsDiv.contains(e.target) && e.target !== input) {
    suggestionsDiv.style.display = "none";
  }
});

document.getElementById("toggleRightAngles").addEventListener("change", function (e) {
  updateRightAngleMarkers(e.target.checked);
});

document.getElementById("toggleHelp").addEventListener("click", function () {
  const box = document.getElementById("helpBox");
  box.style.display = (box.style.display === "none" || box.style.display === "") ? "block" : "none";
});

document.getElementById("promptInput").addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    const suggestions = document.querySelectorAll("#suggestionBox .suggestion-item");
    if (suggestions.length > 0) {
      const firstSuggestion = suggestions[0].textContent;
      this.value = firstSuggestion;

      // On cache la suggestion après l'insertion
      document.getElementById("suggestionBox").style.display = "none";

      // Optionnel : tu peux lancer automatiquement le bouton "Générer"
      // document.querySelector("button[onclick='generateFigure()']").click();

      event.preventDefault(); // empêche le rechargement du formulaire si c’est le cas
    }
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
document.getElementById("toggleEqualAngles").addEventListener("change", function(e){
  updateEqualAngleMarkers(e.target.checked);
});