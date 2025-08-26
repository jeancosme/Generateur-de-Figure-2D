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
    let originalPolygon = null;
    let handDrawnElements = [];
    let isHandDrawnMode = false;





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
  // Accepter event ou bool
  if (typeof visible === 'object' && visible !== null && 'target' in visible) {
    visible = !!visible.target.checked;
  } else {
    visible = !!visible;
  }

  // Nettoyer les anciens marqueurs
  rightAngleMarkers.forEach(m => { 
    try { board.removeObject(m); } catch (e) {} 
  });
  rightAngleMarkers = [];

  // Gérer l'affichage du groupe "un seul angle"
  const singleAngleGroup = document.getElementById('singleAngleGroup');
  const singleAngleCheckbox = document.getElementById('toggleSingleAngle');
  
  // ✅ CORRECTION : Vérifier les figures avec angles droits (carrés, rectangles ET triangles rectangles)
  const hasRightAngles = isRectangularFigure() || (points.length === 3 && isRightTriangle().isRight);
  
  if (visible && hasRightAngles) {
    // Afficher l'option "un seul angle" pour toutes les figures avec angles droits
    if (singleAngleGroup) singleAngleGroup.style.display = 'block';
  } else {
    // Cacher l'option et décocher si nécessaire
    if (singleAngleGroup) singleAngleGroup.style.display = 'none';
    if (singleAngleCheckbox) singleAngleCheckbox.checked = false;
  }

  if (!visible || !points || points.length < 3) { 
    board.update(); 
    return; 
  }

  // Vérifier si on doit afficher un seul angle
  const showSingleAngle = singleAngleCheckbox && singleAngleCheckbox.checked;
  
  // Créer les marqueurs d'angles droits
  createRightAngleMarkers(showSingleAngle);
  
  board.update();
}

// Fonction helper pour détecter si c'est un carré/rectangle
function isRectangularFigure() {
  if (!points || points.length !== 4) return false;
  
  const tolerance = 0.15; // ✅ Tolérance plus stricte
  let rightAngleCount = 0;
  
  // Vérifier chaque angle
  for (let i = 0; i < 4; i++) {
    const A = points[(i - 1 + 4) % 4];
    const B = points[i];
    const C = points[(i + 1) % 4];
    
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
      const angleDegrees = angle * 180 / Math.PI;
      
      // ✅ DEBUG : Afficher les angles pour diagnostic
      console.log(`🔍 Angle ${i}: ${angleDegrees.toFixed(1)}°`);
      
      // Compter les angles droits (proches de 90°)
      if (Math.abs(angle - Math.PI/2) < tolerance) {
        rightAngleCount++;
      }
    }
  }
  
  // ✅ CORRECTION : Un quadrilatère rectangulaire doit avoir EXACTEMENT 4 angles droits
  const isRectangular = (rightAngleCount === 4);
  
  console.log(`🔍 Quadrilatère: ${rightAngleCount}/4 angles droits → ${isRectangular ? 'RECTANGULAIRE' : 'PAS RECTANGULAIRE'}`);
  
  return isRectangular;
}

// Fonction pour créer les marqueurs d'angles droits
function createRightAngleMarkers(singleAngle = false) {
  if (!points || points.length < 3) return;
  
  if (points.length === 3) {
    // TRIANGLE RECTANGLE
    createTriangleRightAngleMarker(singleAngle);
  } else if (points.length === 4) {
    // QUADRILATÈRE (carré, rectangle)
    createQuadrilateralRightAngleMarkers(singleAngle);
  }
}

// Fonction pour créer le marqueur d'angle droit du triangle
function createTriangleRightAngleMarker(singleAngle = false) {
  const rightTriangleInfo = isRightTriangle();
  if (!rightTriangleInfo || !rightTriangleInfo.isRight) return;
  
  const rightAngleIndex = rightTriangleInfo.rightAngleIndex;
  const size = 0.3;
  
  // Créer le marqueur d'angle droit au bon sommet
  createSingleTriangleRightAngleMarker(rightAngleIndex, size);
}

// Fonction pour créer les marqueurs d'angles droits du quadrilatère
function createQuadrilateralRightAngleMarkers(singleAngle = false) {
  const size = 0.3;
  
  if (singleAngle) {
    // Afficher seulement l'angle en haut à droite (index 1)
    createSingleRightAngleMarker(1, size);
  } else {
    // Afficher tous les angles droits
    for (let i = 0; i < 4; i++) {
      createSingleRightAngleMarker(i, size);
    }
  }
}

// Fonction pour créer un marqueur d'angle droit de triangle
function createSingleTriangleRightAngleMarker(angleIndex, size) {
  const vertex = points[angleIndex];
  const prevPoint = points[(angleIndex - 1 + 3) % 3];
  const nextPoint = points[(angleIndex + 1) % 3];
  
  if (!vertex || !prevPoint || !nextPoint) return;
  
  // Vecteurs depuis le sommet vers les points adjacents
  const v1x = prevPoint.X() - vertex.X();
  const v1y = prevPoint.Y() - vertex.Y();
  const v2x = nextPoint.X() - vertex.X();
  const v2y = nextPoint.Y() - vertex.Y();
  
  // Normaliser les vecteurs
  const len1 = Math.hypot(v1x, v1y);
  const len2 = Math.hypot(v2x, v2y);
  
  if (len1 === 0 || len2 === 0) return;
  
  const u1x = v1x / len1;
  const u1y = v1y / len1;
  const u2x = v2x / len2;
  const u2y = v2y / len2;
  
  // Créer le petit carré d'angle droit
  const cornerSize = Math.min(size, Math.min(len1, len2) * 0.3);
  
  // Points du petit carré
  const p1x = vertex.X() + u1x * cornerSize;
  const p1y = vertex.Y() + u1y * cornerSize;
  
  const p2x = vertex.X() + u2x * cornerSize;
  const p2y = vertex.Y() + u2y * cornerSize;
  
  const p3x = p1x + u2x * cornerSize;
  const p3y = p1y + u2y * cornerSize;
  
  // Créer les segments du petit carré
  const seg1 = board.create('segment', [
    [p1x, p1y], [p3x, p3y]
  ], {
    strokeColor: 'black',
    strokeWidth: 1.5,
    fixed: true,
    highlight: false
  });
  
  const seg2 = board.create('segment', [
    [p3x, p3y], [p2x, p2y]
  ], {
    strokeColor: 'black',
    strokeWidth: 1.5,
    fixed: true,
    highlight: false
  });
  
  rightAngleMarkers.push(seg1, seg2);
  
  console.log(`✅ Angle droit créé au sommet ${angleIndex} du triangle rectangle`);
}

// Fonction pour créer un seul marqueur d'angle droit (quadrilatères)
function createSingleRightAngleMarker(angleIndex, size) {
  const vertex = points[angleIndex];
  const prevPoint = points[(angleIndex - 1 + 4) % 4];
  const nextPoint = points[(angleIndex + 1) % 4];
  
  if (!vertex || !prevPoint || !nextPoint) return;
  
  // Vecteurs depuis le sommet vers les points adjacents
  const v1x = prevPoint.X() - vertex.X();
  const v1y = prevPoint.Y() - vertex.Y();
  const v2x = nextPoint.X() - vertex.X();
  const v2y = nextPoint.Y() - vertex.Y();
  
  // Normaliser les vecteurs
  const len1 = Math.hypot(v1x, v1y);
  const len2 = Math.hypot(v2x, v2y);
  
  if (len1 === 0 || len2 === 0) return;
  
  const u1x = v1x / len1;
  const u1y = v1y / len1;
  const u2x = v2x / len2;
  const u2y = v2y / len2;
  
  // Créer le petit carré d'angle droit
  const cornerSize = Math.min(size, Math.min(len1, len2) * 0.3);
  
  // Points du petit carré
  const p1x = vertex.X() + u1x * cornerSize;
  const p1y = vertex.Y() + u1y * cornerSize;
  
  const p2x = vertex.X() + u2x * cornerSize;
  const p2y = vertex.Y() + u2y * cornerSize;
  
  const p3x = p1x + u2x * cornerSize;
  const p3y = p1y + u2y * cornerSize;
  
  // Créer les segments du petit carré
  const seg1 = board.create('segment', [
    [p1x, p1y], [p3x, p3y]
  ], {
    strokeColor: 'black',
    strokeWidth: 1.5,
    fixed: true,
    highlight: false
  });
  
  const seg2 = board.create('segment', [
    [p3x, p3y], [p2x, p2y]
  ], {
    strokeColor: 'black',
    strokeWidth: 1.5,
    fixed: true,
    highlight: false
  });
  
  rightAngleMarkers.push(seg1, seg2);
}

// Fonction pour ajouter les marqueurs d'angles égaux
function updateEqualAngleMarkers(visible) {
  // accepter event ou bool
  if (typeof visible === 'object' && visible !== null && 'target' in visible) visible = !!visible.target.checked;
  else visible = !!visible;

  // ⚠️ CORRECTION : Nettoyer SEULEMENT les angleMarkers, PAS les codingMarks
  angleMarkers.forEach(m => { try { board.removeObject(m); } catch (e) {} });
  angleMarkers = [];
  
  // ❌ SUPPRIMER CES LIGNES QUI CAUSENT LE PROBLÈME :
  // codingMarks.forEach(m => { try { board.removeObject(m); } catch (e) {} });
  // codingMarks = [];

  if (!visible || !points || points.length < 3) { 
    board.update(); 
    return; 
  }

  // éviter pour carré/rectangle (optionnel)
  const fig = typeof detectCurrentFigure === 'function' ? detectCurrentFigure() : '';
  if (fig === 'square' || fig === 'rectangle') { 
    board.update(); 
    return; 
  }

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
    if (Math.abs(d01 - d12) < tol) { isIsosceles = true; isoEqualIndices = [2, 0]; }
    else if (Math.abs(d12 - d20) < tol) { isIsosceles = true; isoEqualIndices = [0, 1]; }
    else if (Math.abs(d20 - d01) < tol) { isIsosceles = true; isoEqualIndices = [1, 2]; }
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

  // ✅ CRÉER UNE NOUVELLE VARIABLE SÉPARÉE POUR LES CODAGES D'ANGLES
  let angleCodeMarks = []; // Variable séparée pour les codages d'angles

  // dessine un petit tiret perpendiculaire (radial) centré sur l'arc,
  // avec possibilité de décalage latéral le long de la tangente pour faire des "//" parallèles
  function createPerpTick(B, angleOnArc, radius, tickLen, lateralOffset = 0) {
    const seg = board.create('segment', [
      () => {
        const Bx = B.X(), By = B.Y();
        const cx = Bx + Math.cos(angleOnArc) * radius - Math.sin(angleOnArc) * lateralOffset;
        const cy = By + Math.sin(angleOnArc) * radius + Math.cos(angleOnArc) * lateralOffset;
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
    angleCodeMarks.push(seg); // ✅ Ajouter aux codages d'angles, pas aux codages de côtés
  }

  // normaliser angle en [-PI,PI)
  function normAng(a) { while (a <= -Math.PI) a += 2*Math.PI; while (a > Math.PI) a -= 2*Math.PI; return a; }

  // parcourir groupes et dessiner arcs + codages
  for (const key in groups) {
    const indices = groups[key];
    if (indices.length < 2) continue;

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

      // s'assurer de dessiner l'arc à l'intérieur du polygone
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

      // codage : perpendiculaires au rayon
      const bisect = normAng(aStart + aDelta / 2);
      if (isIsosceles && isoEqualIndices.includes(idx)) {
        const tickLen = Math.min(0.24, radius * 1.0);
        createPerpTick(B, bisect, radius, tickLen, 0);
      } else if (isParallelogram) {
        const count = (idx % 2 === 0) ? 1 : 2;
        const tickLen = Math.min(0.28, radius * 1.1);
        const lateralSpacing = Math.min(0.12, radius * 0.6);
        if (count === 1) {
          createPerpTick(B, bisect, radius, tickLen, 0);
        } else {
          createPerpTick(B, bisect, radius, tickLen, -lateralSpacing / 2);
          createPerpTick(B, bisect, radius, tickLen, +lateralSpacing / 2);
        }
      } else {
        const tickLen = Math.min(0.24, radius * 1.0);
        createPerpTick(B, normAng(a1 + delta / 2), radius, tickLen, 0);
      }
    }
  }

  // ✅ Ajouter les codages d'angles aux angleMarkers pour le nettoyage
  angleMarkers.push(...angleCodeMarks);

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



// Fonction principale pour activer/désactiver l'effet main levée
function toggleHandDrawnEffect(enabled) {
  if (typeof enabled === 'object' && enabled !== null && 'target' in enabled) {
    enabled = !!enabled.target.checked;
  } else {
    enabled = !!enabled;
  }
  
  isHandDrawnMode = enabled;
  
  if (enabled) {
    applyHandDrawnEffect();
  } else {
    removeHandDrawnEffect();
  }
  
  board.update();
}

// Appliquer l'effet main levée
// Appliquer l'effet main levée
function applyHandDrawnEffect() {
  if (!points || points.length === 0) return;
  
  // Nettoyer les anciens éléments main levée
  removeHandDrawnElements();
  
  // ✅ CORRECTION : Cacher TOUS les éléments de la figure originale
  
  // 1. Cacher le polygone s'il existe
  if (polygon && !originalPolygon) {
    originalPolygon = polygon;
    polygon.setAttribute({ visible: false });
  }
  
  // 2. Cacher le cercle s'il existe
  if (centerPoint && circlePoint && circleObject) {
    circleObject.setAttribute({ visible: false });
    createHandDrawnCircle();
    return; // Sortir ici pour les cercles
  }
  
  // 3. ✅ NOUVEAU : Cacher tous les segments/bordures du polygone
  if (polygon && polygon.borders) {
    polygon.borders.forEach(border => {
      if (border && typeof border.setAttribute === 'function') {
        border.setAttribute({ visible: false });
      }
    });
  }
  
  // 4. ✅ NOUVEAU : Cacher tous les éléments créés individuellement
  // (pour les figures qui ne sont pas des polygones JSXGraph standard)
  board.objectsList.forEach(obj => {
    // Cacher tous les segments qui relient les points de la figure
    if (obj.type === JXG.OBJECT_TYPE_LINE || obj.type === 'segment') {
      // Vérifier si ce segment fait partie de notre figure
      const isPartOfFigure = points.some(p1 => 
        points.some(p2 => 
          p1 !== p2 && 
          obj.point1 === p1 && obj.point2 === p2
        )
      );
      
      if (isPartOfFigure) {
        obj.setAttribute({ visible: false });
      }
    }
  });
  
  // 5. Créer la version main levée
  if (points.length >= 3) {
    createHandDrawnPolygon();
  }
}

// Supprimer l'effet main levée
// Supprimer l'effet main levée
function removeHandDrawnEffect() {
  // Nettoyer les éléments main levée
  removeHandDrawnElements();
  
  // ✅ CORRECTION : Restaurer TOUS les éléments originaux
  
  // 1. Restaurer le polygone original
  if (originalPolygon) {
    originalPolygon.setAttribute({ visible: true });
    
    // ✅ NOUVEAU : Restaurer aussi les bordures du polygone
    if (originalPolygon.borders) {
      originalPolygon.borders.forEach(border => {
        if (border && typeof border.setAttribute === 'function') {
          border.setAttribute({ visible: true });
        }
      });
    }
    
    polygon = originalPolygon;
    originalPolygon = null;
  }
  
  // 2. Restaurer le cercle original
  if (circleObject) {
    circleObject.setAttribute({ visible: true });
  }
  
  // 3. ✅ NOUVEAU : Restaurer tous les segments cachés
  board.objectsList.forEach(obj => {
    if (obj.type === JXG.OBJECT_TYPE_LINE || obj.type === 'segment') {
      const isPartOfFigure = points.some(p1 => 
        points.some(p2 => 
          p1 !== p2 && 
          obj.point1 === p1 && obj.point2 === p2
        )
      );
      
      if (isPartOfFigure) {
        obj.setAttribute({ visible: true });
      }
    }
  });
}

// Nettoyer les éléments main levée
function removeHandDrawnElements() {
  handDrawnElements.forEach(element => {
    try { board.removeObject(element); } catch (e) {}
  });
  handDrawnElements = [];
}

// Créer un polygone à main levée
function createHandDrawnPolygon() {
  const n = points.length;
  
  // Créer des segments main levée entre chaque paire de points
  for (let i = 0; i < n; i++) {
    const startPoint = points[i];
    const endPoint = points[(i + 1) % n];
    
    const handDrawnSegment = createHandDrawnSegment(startPoint, endPoint);
    handDrawnElements.push(handDrawnSegment);
  }
}

// Créer un segment à main levée plus prononcé
function createHandDrawnSegment(startPoint, endPoint) {
  const numPoints = 60; // Plus de points pour plus de détails
  const baseIntensity = 0.06; // ✅ Intensité de base augmentée (x3)
  
  // Calculer la longueur pour adapter l'intensité
  const segmentLength = Math.hypot(endPoint.X() - startPoint.X(), endPoint.Y() - startPoint.Y());
  const lengthFactor = Math.min(1.5, segmentLength / 2.5); // ✅ Facteur de longueur plus généreux
  
  // Générer des points de contrôle pour créer des ondulations naturelles plus marquées
  const controlPoints = [];
  for (let i = 0; i <= 10; i++) { // ✅ Plus de points de contrôle
    const t = i / 10;
    // ✅ Ondulations plus marquées avec plusieurs fréquences
    const wave1 = Math.sin(t * Math.PI * 3.2) * 0.035 * lengthFactor; // Vague principale plus forte
    const wave2 = Math.sin(t * Math.PI * 6.5) * 0.020 * lengthFactor; // Vague secondaire
    const wave3 = Math.sin(t * Math.PI * 12.8) * 0.010 * lengthFactor; // Micro-ondulations
    const noise = (Math.random() - 0.5) * 0.025 * lengthFactor; // ✅ Bruit plus fort
    controlPoints.push(wave1 + wave2 + wave3 + noise);
  }
  
  const curve = board.create('curve', [
    function(t) {
      const x1 = startPoint.X();
      const x2 = endPoint.X();
      const baseX = x1 + (x2 - x1) * t;
      
      // Interpolation des points de contrôle
      const controlIndex = t * (controlPoints.length - 1);
      const index1 = Math.floor(controlIndex);
      const index2 = Math.min(index1 + 1, controlPoints.length - 1);
      const fraction = controlIndex - index1;
      
      const controlOffset = controlPoints[index1] * (1 - fraction) + controlPoints[index2] * fraction;
      
      // Direction perpendiculaire pour l'ondulation
      const dx = x2 - x1;
      const dy = endPoint.Y() - startPoint.Y();
      const len = Math.hypot(dx, dy) || 1;
      const perpX = -dy / len;
      
      // ✅ Tremblement plus intense avec variation continue
      const edgeFactor = Math.sin(t * Math.PI); // 0 aux bords, 1 au centre
      const continuousTremor = Math.sin(t * Math.PI * 8.5) * 0.015 * edgeFactor * lengthFactor;
      const randomTremor = (Math.random() - 0.5) * baseIntensity * edgeFactor * lengthFactor;
      
      return baseX + controlOffset * perpX + continuousTremor + randomTremor * 0.3;
    },
    function(t) {
      const y1 = startPoint.Y();
      const y2 = endPoint.Y();
      const baseY = y1 + (y2 - y1) * t;
      
      // Même logique pour Y avec légère variation de phase
      const controlIndex = t * (controlPoints.length - 1);
      const index1 = Math.floor(controlIndex);
      const index2 = Math.min(index1 + 1, controlPoints.length - 1);
      const fraction = controlIndex - index1;
      
      const controlOffset = controlPoints[index1] * (1 - fraction) + controlPoints[index2] * fraction;
      
      const dx = endPoint.X() - startPoint.X();
      const dy = y2 - y1;
      const len = Math.hypot(dx, dy) || 1;
      const perpY = dx / len;
      
      const edgeFactor = Math.sin(t * Math.PI);
      const continuousTremor = Math.cos(t * Math.PI * 7.8) * 0.018 * edgeFactor * lengthFactor; // ✅ Phase légèrement différente
      const randomTremor = (Math.random() - 0.5) * baseIntensity * edgeFactor * lengthFactor;
      
      return baseY + controlOffset * perpY + continuousTremor + randomTremor * 0.3;
    },
    0, 1
  ], {
    strokeColor: '#2c2c2c', // ✅ Couleur légèrement plus foncée pour plus de contraste
    strokeWidth: 1.6, // ✅ Légèrement plus épais
    fixed: true,
    highlight: false
  });
  
  return curve;
}

// Créer un cercle à main levée plus prononcé
function createHandDrawnCircle() {
  if (!centerPoint || !circlePoint) return;
  
  // Cacher le cercle original
  if (circleObject) {
    circleObject.setAttribute({ visible: false });
  }
  
  const centerX = centerPoint.X();
  const centerY = centerPoint.Y();
  const radius = Math.hypot(circlePoint.X() - centerX, circlePoint.Y() - centerY);
  
  // ✅ Plus de sections pour plus de variation
  const numSections = 3; // Plus de sections
  const radiusVariations = [];
  
  for (let i = 0; i < numSections; i++) {
    // ✅ Variations plus marquées avec plusieurs harmoniques
    const angle = (i * Math.PI * 2) / numSections;
    const baseVariation1 = Math.sin(angle * 2.7) * 0.055; // Vague principale plus forte
    const baseVariation2 = Math.sin(angle * 5.3) * 0.032; // Vague secondaire
    const baseVariation3 = Math.sin(angle * 11.1) * 0.018; // Micro-variations
    const noise = (Math.random() - 0.5) * 0.040; // ✅ Bruit plus fort
    radiusVariations.push(1 + baseVariation1 + baseVariation2 + baseVariation3 + noise);
  }
  
  const handDrawnCircle = board.create('curve', [
    function(t) {
      const angle = t * 2 * Math.PI;
      
      // Interpoler les variations de rayon avec plus de fluidité
      const sectionIndex = (t * numSections) % numSections;
      const index1 = Math.floor(sectionIndex);
      const index2 = (index1 + 1) % numSections;
      const fraction = sectionIndex - index1;
      
      // ✅ Interpolation cubique pour plus de fluidité
      const t2 = fraction * fraction;
      const t3 = t2 * fraction;
      const radiusVar = radiusVariations[index1] * (1 - 3*t2 + 2*t3) + 
                       radiusVariations[index2] * (3*t2 - 2*t3);
      
      const currentRadius = radius * radiusVar;
      
      // ✅ Tremblement additionnel plus marqué
      const continuousTremor = Math.sin(angle * 13.7 + t * Math.PI * 8) * 0.025 * radius;
      const randomTremor = (Math.random() - 0.5) * 0.030 * radius;
      const angleTremor = (Math.random() - 0.5) * 0.05; // ✅ Plus de variation angulaire
      
      return centerX + (currentRadius + continuousTremor + randomTremor) * Math.cos(angle + angleTremor);
    },
    function(t) {
      const angle = t * 2 * Math.PI;
      
      // Même logique pour Y avec légère variation de phase
      const sectionIndex = (t * numSections) % numSections;
      const index1 = Math.floor(sectionIndex);
      const index2 = (index1 + 1) % numSections;
      const fraction = sectionIndex - index1;
      
      const t2 = fraction * fraction;
      const t3 = t2 * fraction;
      const radiusVar = radiusVariations[index1] * (1 - 3*t2 + 2*t3) + 
                       radiusVariations[index2] * (3*t2 - 2*t3);
      
      const currentRadius = radius * radiusVar;
      
      const continuousTremor = Math.cos(angle * 12.3 + t * Math.PI * 9) * 0.028 * radius; // ✅ Phase différente
      const randomTremor = (Math.random() - 0.5) * 0.030 * radius;
      const angleTremor = (Math.random() - 0.5) * 0.05;
      
      return centerY + (currentRadius + continuousTremor + randomTremor) * Math.sin(angle + angleTremor);
    },
    0, 1
  ], {
    strokeColor: '#2c2c2c',
    strokeWidth: 1.2,
    fixed: true,
    highlight: false
  });
  
  handDrawnElements.push(handDrawnCircle);
}

// Version encore plus réaliste avec plusieurs passes
function createHandDrawnSegmentMultiLayer(startPoint, endPoint) {
  const curves = [];
  const numLayers = 2; // Deux passes pour simuler le reppassage naturel
  
  for (let layer = 0; layer < numLayers; layer++) {
    const opacity = layer === 0 ? 1 : 0.3; // Première passe plus marquée
    const offset = layer * 0.01; // Léger décalage entre les passes
    
    const curve = board.create('curve', [
      function(t) {
        const x1 = startPoint.X();
        const x2 = endPoint.X();
        const baseX = x1 + (x2 - x1) * t;
        
        // Ondulation principale
        const wave = Math.sin(t * Math.PI * 3) * 0.02 * Math.sin(t * Math.PI);
        
        // Micro-tremblement
        const microTremor = (Math.random() - 0.5) * 0.008;
        
        return baseX + wave + microTremor + offset;
      },
      function(t) {
        const y1 = startPoint.Y();
        const y2 = endPoint.Y();
        const baseY = y1 + (y2 - y1) * t;
        
        const wave = Math.cos(t * Math.PI * 2.8) * 0.018 * Math.sin(t * Math.PI);
        const microTremor = (Math.random() - 0.5) * 0.008;
        
        return baseY + wave + microTremor + offset;
      },
      0, 1
    ], {
      strokeColor: `rgba(51, 51, 51, ${opacity})`,
      strokeWidth: layer === 0 ? 1.6 : 1.2,
      fixed: true,
      highlight: false
    });
    
    curves.push(curve);
  }
  
  return curves;
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
    const size = extractNumber(prompt, 5);
    drawLosange(size);
  } else if (prompt.includes("parallélogramme")) {
    // ✅ CORRECTION : Le 2e paramètre est la longueur du côté oblique BC, pas la hauteur
    const [base, sideLength] = extractTwoNumbers(prompt, [5, 3]); // base=5, côté oblique=3
    drawParallelogram(base, sideLength);
  } else if (prompt.includes("hexagone")) {
    const side = extractNumber(prompt, 4);
    drawRegularPolygon(6, side);
  } else if (prompt.includes("pentagone")) {
    const side = extractNumber(prompt, 4);
    drawRegularPolygon(5, side);
  }

  // recentrer la figure générée au centre du panneau
  try { centerFigure(); } catch (e) { console.warn('centerFigure failed', e); }

  // ✅ AJOUT : Appliquer l'effet main levée si la checkbox est cochée
  const handDrawnCheckbox = document.getElementById('toggleHandDrawn');
  if (handDrawnCheckbox && handDrawnCheckbox.checked) {
    setTimeout(() => {
      applyHandDrawnEffect();
    }, 100); // Petit délai pour s'assurer que la figure est créée
  }

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
      const A = board.create('point', [0, size], {name: '',fixed: true, visible: false});
      const B = board.create('point', [size, size], {name: '',fixed: true, visible: false});
      const C = board.create('point', [size, 0], {name: '',fixed: true, visible: false});
      const D = board.create('point', [0, 0], {name: '',fixed: true, visible: false});

      points = [A, B, C, D];
      polygon = board.create('polygon', points, {
        withLabel: false,
        borders: {strokeColor: "black",fixed: true },
        fillColor: "white",
        fillOpacity: 1
      });

        let labelA = board.create('text', [A.X() - 0.3, A.Y() + 0.2, getLabel(0)]); // HAUT-GAUCHE
        let labelB = board.create('text', [B.X() + 0.15, B.Y() + 0.2, getLabel(1)]); // HAUT-DROITE
        let labelC = board.create('text', [C.X() + 0.15, C.Y() - 0.2, getLabel(2)]); // BAS-DROITE
        let labelD = board.create('text', [D.X() - 0.3, D.Y() - 0.2, getLabel(3)]); // BAS-GAUCHE
        texts.push(labelA, labelB, labelC, labelD);


        points = [A, B, C, D];

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

  // AJOUT : Rotation de 30° vers la droite (π/6 radians)
  const rotationAngle = Math.PI / 6;   // 30° en radians
  
  // Fonction helper pour appliquer la rotation
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

  const A = board.create('point', [rotA_x, rotA_y], { visible: false, fixed: true }); // HAUT-GAUCHE tourné
  const B = board.create('point', [rotB_x, rotB_y], { visible: false, fixed: true }); // HAUT-DROITE tourné
  const C = board.create('point', [rotC_x, rotC_y], { visible: false, fixed: true }); // BAS-DROITE tourné
  const D = board.create('point', [rotD_x, rotD_y], { visible: false, fixed: true }); // BAS-GAUCHE tourné

  points = [A, B, C, D];
  polygon = board.create('polygon', points, {
    borders: { strokeColor: 'black', fixed: true },
    fillColor: 'white',
    fillOpacity: 1
  });

  // Labels avec positions ajustées pour la rotation
  const LA = board.create('text', [A.X() - 0.4, A.Y() , getLabel(0)]); // HAUT-GAUCHE
  const LB = board.create('text', [B.X() - 0.1, B.Y() + 0.3, getLabel(1)]); // HAUT-DROITE
  const LC = board.create('text', [C.X() + 0.25, C.Y(), getLabel(2)]); // BAS-DROITE
  const LD = board.create('text', [D.X() - 0.1, D.Y() - 0.3, getLabel(3)]); // BAS-GAUCHE
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
  // ==========================================
  // 1. NETTOYAGE ET SAUVEGARDE DES POSITIONS
  // ==========================================
  
  // Sauvegarder les positions des handles déplacés manuellement
  const savedPositions = [];
// Initialiser un tableau de la taille du polygone
for (let i = 0; i < (points ? points.length : 0); i++) {
  savedPositions[i] = null;
}

// Sauvegarder les positions des handles déplacés avec leurs vrais index
lengthHandleMeta.forEach(meta => {
  if (meta && meta.handle && !meta.handle._auto && meta.sideIndex !== undefined) {
    savedPositions[meta.sideIndex] = { 
      x: meta.handle.X(), 
      y: meta.handle.Y() 
    };
  }
});

  // Supprimer tous les anciens éléments
  lengthLabels.forEach(label => { try { board.removeObject(label); } catch (e) {} });
  lengthHandles.forEach(handle => { try { board.removeObject(handle); } catch (e) {} });
  
  // Reset des arrays
  lengthLabels = [];
  lengthHandles = [];
  lengthHandleMeta = [];

  // ==========================================
  // 2. VÉRIFICATIONS PRÉLIMINAIRES
  // ==========================================
  
  const showLengths = document.getElementById("toggleLengths")?.checked;
  if (!showLengths || !points || points.length === 0) return;

  // ==========================================
  // 3. GESTION DES OPTIONS CONDITIONNELLES
  // ==========================================
  
  const showUnits = document.getElementById("showUnitsCheckbox")?.checked;
  const unit = document.getElementById("unitSelector")?.value || 'cm';
  
  // OPTION HYPOTÉNUSE (triangles rectangles uniquement)
  const rightTriangleInfo = isRightTriangle();
  const hypotenuseGroup = document.getElementById('hypotenuseGroup');
  const hideHypotenuseCheckbox = document.getElementById('toggleHideHypotenuse');
  
  if (rightTriangleInfo && rightTriangleInfo.isRight && points.length === 3) {
    if (hypotenuseGroup) hypotenuseGroup.style.display = 'block';
  } else {
    if (hypotenuseGroup) hypotenuseGroup.style.display = 'none';
    if (hideHypotenuseCheckbox) hideHypotenuseCheckbox.checked = false;
  }
  
  const hideHypotenuse = hideHypotenuseCheckbox && hideHypotenuseCheckbox.checked;
  const hypotenuseIndex = hideHypotenuse ? getHypotenuseIndex() : -1;

  // ==========================================
  // 4. DÉTERMINER QUELS CÔTÉS AFFICHER
  // ==========================================
  
  function getSidesToShow() {
    const n = points.length;
    let sidesToShow = [];
    
    if (n === 3) {
      // TRIANGLES : Toujours tous les côtés par défaut
      sidesToShow = [0, 1, 2];
      
      // Filtrer l'hypoténuse si demandé
      if (hideHypotenuse && hypotenuseIndex !== -1) {
        sidesToShow = sidesToShow.filter(i => i !== hypotenuseIndex);
      }
      
    } else if (n === 4) {
      // QUADRILATÈRES : Optimisation selon les longueurs égales
      const sideLens = [];
      for (let i = 0; i < 4; i++) {
        const pt1 = points[i];
        const pt2 = points[(i + 1) % 4];
        const len = Math.hypot(pt2.X() - pt1.X(), pt2.Y() - pt1.Y());
        sideLens.push(len);
      }
      
      const rounded = sideLens.map(len => Math.round(len * 100) / 100);
      const unique = [...new Set(rounded.map(l => l.toFixed(2)))];
      
      if (unique.length === 1) {
        // Carré : 1 seul côté
        sidesToShow = [0];
      } else if (unique.length === 2) {
        // Rectangle : 2 côtés (longueur + largeur)
        sidesToShow = [0, 1];
      } else {
        // Autres quadrilatères : tous les côtés
        sidesToShow = [0, 1, 2, 3];
      }
      
    } else {
      // AUTRES POLYGONES : Tous les côtés
      sidesToShow = [...Array(n).keys()];
    }
    
    return sidesToShow;
  }

  // ==========================================
  // 5. CRÉER LES LABELS DE LONGUEUR
  // ==========================================
  
  function formatLength(len) {
    const rounded = Math.round(len * 10) / 10;
    const space = '\u00A0'; // Espace insécable
    const value = Number.isInteger(rounded) ? `${rounded}` : `${rounded}`.replace('.', ',');
    return showUnits ? `${value}${space}${unit.trim()}` : `${value}`;
  }
  
  function getOffsetForSide(sideIndex, figureType) {
    // Offsets personnalisés selon le type de figure
    const offsets = {
      'parallelogram': [0.2, 0.5, 0.2, 0.5], // Différents pour éviter les chevauchements
      'default': 0.3
    };
    
    if (figureType === 'parallelogram' && offsets.parallelogram[sideIndex] !== undefined) {
      return offsets.parallelogram[sideIndex];
    }
    
    return offsets.default;
  }
  
  function createLengthLabel(sideIndex) {
    const n = points.length;
    const pt1 = points[sideIndex];
    const pt2 = points[(sideIndex + 1) % n];
    
    // Position du handle (sauvegardée ou par défaut)
    let startX, startY;
    const savedIndex = lengthHandles.length;
    
    // ✅ CORRECTION : Utiliser sideIndex comme clé, pas lengthHandles.length
    if (savedPositions[sideIndex] && savedPositions[sideIndex] !== null) {
      // Utiliser la position sauvegardée avec le bon index
      startX = savedPositions[sideIndex].x;
      startY = savedPositions[sideIndex].y;
    } else {
      // Calculer la position par défaut
      const figureType = detectFigureType() === 'quadrilateral' ? 'parallelogram' : 'default';
      const offset = getOffsetForSide(sideIndex, figureType);
      
      const dx = pt2.X() - pt1.X();
      const dy = pt2.Y() - pt1.Y();
      const len = Math.hypot(dx, dy) || 1;
      
      // Position au milieu du côté + décalage perpendiculaire
      startX = (pt1.X() + pt2.X()) / 2 + offset * (dy / len);
      startY = (pt1.Y() + pt2.Y()) / 2 - offset * (dx / len);
    }

    // Créer le handle invisible déplaçable
    const handle = board.create('point', [startX, startY], {
      size: 6,
      strokeOpacity: 0,
      fillOpacity: 0,
      fixed: false,
      name: '',
      highlight: false,
      showInfobox: false
    });
    
    // Marquer si c'est une position automatique ou manuelle
    handle._auto = (savedPositions[sideIndex] === null);

    try { 
      if (handle.rendNode) handle.rendNode.style.cursor = 'move'; 
    } catch (e) {}

    // Créer le label qui suit le handle
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

    // Rendre le label déplaçable
    makeLabelDraggable(label, handle);

    // Stocker les éléments
    lengthHandles.push(handle);
    lengthLabels.push(label);
    lengthHandleMeta.push({ 
      handle, 
      pt1, 
      pt2, 
      offset: getOffsetForSide(sideIndex, 'default'),
      sideIndex 
    });
  }
  
  function makeLabelDraggable(label, handle) {
    try {
      if (label.rendNode) {
        label.rendNode.style.cursor = 'move';
        label.rendNode.addEventListener('pointerdown', function (ev) {
          ev.stopPropagation(); 
          ev.preventDefault();
          
          handle._auto = false; // Marquer comme déplacé manuellement
          const start = board.getUsrCoordsOfMouse(ev);
          
          function onMove(e) {
            const pos = board.getUsrCoordsOfMouse(e);
            const dxm = pos[0] - start[0];
            const dym = pos[1] - start[1];
            
            try { 
              handle.moveTo([handle.X() + dxm, handle.Y() + dym], 0); 
            } catch (err) { 
              try { 
                handle.setPosition(JXG.COORDS_BY_USER, [handle.X() + dxm, handle.Y() + dym]); 
              } catch(e) {} 
            }
            
            start[0] = pos[0]; 
            start[1] = pos[1];
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
  }

  // ==========================================
  // 6. CRÉER TOUS LES LABELS
  // ==========================================
  
  const sidesToShow = getSidesToShow();
  
  // Debug
  console.log(`🔍 Figure: ${points.length} points, côtés à afficher:`, sidesToShow);
  if (hideHypotenuse && hypotenuseIndex !== -1) {
    console.log(`🔍 Hypoténuse cachée: index ${hypotenuseIndex}`);
  }
  
  sidesToShow.forEach(sideIndex => {
    createLengthLabel(sideIndex);
  });

  // ==========================================
  // 7. SYNCHRONISATION AUTOMATIQUE
  // ==========================================
  
  function syncLengthHandles() {
    lengthHandleMeta.forEach(meta => {
      const { handle, pt1, pt2, offset } = meta;
      
      // Ne synchroniser que les handles en position automatique
      if (!handle || !handle._auto) return;
      
      // Recalculer la position automatique
      const dx = pt2.X() - pt1.X();
      const dy = pt2.Y() - pt1.Y();
      const len = Math.hypot(dx, dy) || 1;
      const x = (pt1.X() + pt2.X()) / 2 + offset * (dy / len);
      const y = (pt1.Y() + pt2.Y()) / 2 - offset * (dx / len);
      
      try { 
        handle.moveTo([x, y], 0); 
      } catch (err) { 
        try { 
          handle.setPosition(JXG.COORDS_BY_USER, [x, y]); 
        } catch(e) {} 
      }
    });
    
    board.update();
  }

  // Attacher la synchronisation (une seule fois)
  if (!_lengthSyncAttached) {
    try {
      if (typeof board.on === 'function') {
        board.on('update', syncLengthHandles);
      } else {
        setInterval(syncLengthHandles, 120);
      }
      _lengthSyncAttached = true;
    } catch (e) {
      console.warn('Synchronisation automatique non disponible');
    }
  }

  console.log(`✅ ${lengthLabels.length} labels de longueur créés`);
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
    name: '',
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
    size: 3,
    strokeColor: 'black',
    fillColor: 'black'
  });

  points = [circlePoint];

  
  // Récupérer les labels du centre et du point sur le cercle
  let centerLabel = 'O';  // par défaut
  let pointLabel = 'A';   // par défaut
  
  if (customLabels && customLabels.length > 0) {
    centerLabel = customLabels[0] || 'O';  // Premier label = centre
    pointLabel = customLabels[1] || 'A';   // Deuxième label = point sur cercle
  }
  
  // Label du centre qui suit automatiquement centerPoint
  const labelCenter = board.create('text', [
    () => centerPoint.X() - 0.1,  // Position relative automatique
    () => centerPoint.Y() + 0.2,
    centerLabel  // ← Utilise le label personnalisé
  ], {
    anchorX: 'middle',
    anchorY: 'bottom',
    fontSize: 16,
    fixed: true,  // Le texte suit automatiquement le point
    name: ''
  });

  // Label du point sur cercle qui suit automatiquement circlePoint  
  const labelPoint = board.create('text', [
    () => circlePoint.X() + 0.3,   // Position relative automatique
    () => circlePoint.Y(),
    pointLabel  // ← Utilise le label personnalisé
  ], {
    anchorX: 'middle',
    anchorY: 'bottom',
    fontSize: 16,
    fixed: true,  // Le texte suit automatiquement le point
    name: ''
  });

  // AJOUT : Permettre le déplacement du cercle entier
  // Ajouter un event listener sur le centerPoint pour déplacer tout le cercle
  centerPoint.on('drag', function() {
    // Le cercle se déplace automatiquement car il est lié au centerPoint
    // Le circlePoint (glider) reste sur le cercle automatiquement
    // Les labels suivent automatiquement grâce aux fonctions flèches
    board.update();
  });

  // Stocker les labels (mais plus besoin de handles séparés)
  labelTexts.push(labelCenter, labelPoint);
  texts.push(labelCenter, labelPoint);

  board.update();

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

  const labelA = board.create('text', [A.X(), A.Y() - 0.3, getLabel(0)]); // ✅ Utilise getLabel()
  const labelB = board.create('text', [B.X(), B.Y() - 0.3, getLabel(1)]); // ✅ Utilise getLabel()
  const labelC = board.create('text', [C.X(), C.Y() + 0.3, getLabel(2)]); // ✅ Utilise getLabel()
  texts.push(labelA, labelB, labelC);

  addDraggingToPolygon(polygon, points, texts);
  updateRightAngleMarkers(document.getElementById("toggleRightAngles").checked);
  console.log("→ Triangle rectangle généré avec base =", base, "et hauteur =", height);
}

// Fonction pour détecter si c'est un triangle rectangle
function isRightTriangle() {
  if (!points || points.length !== 3) return false;
  
  const tolerance = 0.1;
  
  // Vérifier chaque angle pour voir si l'un est proche de 90°
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
      
      // Si l'angle est proche de 90° (π/2)
      if (Math.abs(angle - Math.PI/2) < tolerance) {
        return { isRight: true, rightAngleIndex: i };
      }
    }
  }
  
  return { isRight: false, rightAngleIndex: -1 };
}

// Fonction pour identifier l'hypoténuse (le côté le plus long)
function getHypotenuseIndex() {
  if (!points || points.length !== 3) return -1;
  
  const sideLengths = [];
  
  for (let i = 0; i < 3; i++) {
    const pt1 = points[i];
    const pt2 = points[(i + 1) % 3];
    const length = Math.hypot(pt2.X() - pt1.X(), pt2.Y() - pt1.Y());
    sideLengths.push({ index: i, length });
  }
  
  // Trouver le côté le plus long (hypoténuse)
  const longestSide = sideLengths.reduce((max, side) => 
    side.length > max.length ? side : max
  );
  
  return longestSide.index;
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
  const theta = Math.PI / 3; // 60°
  const offset = sideLength * Math.cos(theta); // projection horizontale du côté oblique
  const height = sideLength * Math.sin(theta); // hauteur géométrique pour le calcul

  // CORRECTION : Créer les points dans l'ordre horaire correct
  // A = haut-gauche, B = haut-droite, C = bas-droite, D = bas-gauche
  const A = board.create('point', [-offset, height], { visible: false, fixed: true }); // HAUT-GAUCHE
  const B = board.create('point', [base - offset, height], { visible: false, fixed: true }); // HAUT-DROITE
  const C = board.create('point', [base, 0], { visible: false, fixed: true }); // BAS-DROITE
  const D = board.create('point', [0, 0], { visible: false, fixed: true }); // BAS-GAUCHE

  points = [A, B, C, D]; // Ordre horaire : A→B→C→D

  polygon = board.create('polygon', points, {
    borders: { strokeColor: "black" },
    fillColor: "white",
    fillOpacity: 1
  });

  // CORRECTION : Labels positionnés selon leur position réelle
  const labelA = board.create('text', [A.X() - 0.3, A.Y() + 0.3, getLabel(0)], {fontSize: 14}); // HAUT-GAUCHE
  const labelB = board.create('text', [B.X() + 0.3, B.Y() + 0.3, getLabel(1)], {fontSize: 14}); // HAUT-DROITE
  const labelC = board.create('text', [C.X() + 0.3, C.Y() - 0.3, getLabel(2)], {fontSize: 14}); // BAS-DROITE
  const labelD = board.create('text', [D.X() - 0.3, D.Y() - 0.3, getLabel(3)], {fontSize: 14}); // BAS-GAUCHE
  
  texts.push(labelA, labelB, labelC, labelD);

  addDraggingToPolygon(polygon, points, texts);

  updateDiagonals();
  updateCodings();
  updateLengthLabels();
  updateRightAngleMarkers(document.getElementById("toggleRightAngles").checked);

  // ✅ AJOUT : Log pour vérifier les dimensions
  console.log(`Parallélogramme créé:
  - Base AD = ${base}
  - Côté oblique AB/DC = ${sideLength} 
  - Hauteur géométrique = ${height.toFixed(2)}`);
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

  // Utilise getLabel() pour les noms personnalisés
  const labelA = board.create('text', [A.X(), A.Y() - 0.3, getLabel(0)]);
  const labelB = board.create('text', [B.X(), B.Y() - 0.3, getLabel(1)]);
  const labelC = board.create('text', [C.X(), C.Y() + 0.3, getLabel(2)]);
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

  // ✅ AJOUT : Reset de l'effet main levée
  isHandDrawnMode = false;
  originalPolygon = null;
  removeHandDrawnElements();
  
  // Décocher la checkbox main levée
  const handDrawnCheckbox = document.getElementById('toggleHandDrawn');
  if (handDrawnCheckbox) {
    handDrawnCheckbox.checked = false;
  }

  // AJOUT : Décocher toutes les options d'affichage
  const checkboxes = [
    'toggleRightAngles',
    'toggleEqualAngles', 
    'toggleLengths',
    'showUnitsCheckbox',
    'toggleCodings',
    'toggleDiagonals',
    'toggleRadius',
    'toggleDiameter'
  ];
  
  checkboxes.forEach(id => {
    const checkbox = document.getElementById(id);
    if (checkbox) {
      checkbox.checked = false;
    }
  });
  
  // Masquer le groupe des unités (puisque toggleLengths est décoché)
  const unitGroup = document.getElementById('unitGroup');
  if (unitGroup) {
    unitGroup.style.display = 'none';
  }




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
  "parallélogramme 5 x 3",
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
  } else if (e.key === "Tab") {
    // AJOUT : Autocomplétion avec Tab (sans générer)
    if (suggestionsDiv.style.display === "block" && items.length > 0) {
      e.preventDefault(); // Empêcher le Tab normal temporairement
      
      let suggestionToUse = null;
      
      // Si une suggestion est sélectionnée (navigation avec flèches) -> l'utiliser
      if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < items.length) {
        suggestionToUse = items[selectedSuggestionIndex].textContent;
      } 
      // Sinon, prendre automatiquement la PREMIÈRE suggestion visible
      else {
        suggestionToUse = items[0].textContent;
      }
      
      // Appliquer la suggestion sélectionnée
      if (suggestionToUse) {
        input.value = suggestionToUse;
        suggestionsDiv.style.display = "none";
        selectedSuggestionIndex = -1; // Reset
        
        // Passer au champ suivant (labelInput) après un court délai
        setTimeout(() => {
          const labelInput = document.getElementById('labelInput');
          if (labelInput) {
            labelInput.focus();
            labelInput.select(); // Sélectionner le texte s'il y en a
          }
        }, 50);
        
        return; // Important : sortir ici
      }
    }
    
    // Si pas de suggestions visibles, laisser le Tab normal fonctionner
    // (pas de e.preventDefault(), donc Tab normal vers le champ suivant)
    
  } else if (e.key === "Enter") {
    e.preventDefault(); // Toujours empêcher le comportement par défaut
    
    // AJOUT : Logique de sélection intelligente des suggestions
    if (suggestionsDiv.style.display === "block" && items.length > 0) {
      let suggestionToUse = null;
      
      // Si une suggestion est sélectionnée (navigation avec flèches) -> l'utiliser
      if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < items.length) {
        suggestionToUse = items[selectedSuggestionIndex].textContent;
      } 
      // Sinon, prendre automatiquement la PREMIÈRE suggestion visible
      else {
        suggestionToUse = items[0].textContent;
      }
      
      // Appliquer la suggestion sélectionnée
      if (suggestionToUse) {
        input.value = suggestionToUse;
        suggestionsDiv.style.display = "none";
        selectedSuggestionIndex = -1; // Reset
        
        // Générer automatiquement la figure (comme Google)
        generateFigure();
        return; // Important : sortir ici pour éviter la double génération
      }
    }
    
    // Si pas de suggestions visibles, générer avec le texte actuel
    if (suggestionsDiv.style.display !== "block" && input.value.trim()) {
      generateFigure();
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

    const toggleHandDrawn = document.getElementById('toggleHandDrawn');
    if (toggleHandDrawn) {
      toggleHandDrawn.addEventListener('change', function() {
        toggleHandDrawnEffect(this.checked);
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
    ['toggleRightAngles', 'change', (e) => { if (typeof updateRightAngleMarkers=== 'function') updateRightAngleMarkers(e.target.checked); }]
  ];
  
  let listenersAdded = 0;
  eventListeners.forEach(([id, event, handler]) => {
    if (safeAddEventListener(id, event, handler)) {
      listenersAdded++;
    }
  });

  // Event listener pour "un seul angle"
const toggleSingleAngle = document.getElementById("toggleSingleAngle");
if (toggleSingleAngle) {
  toggleSingleAngle.addEventListener('change', function() {
    // Relancer updateRightAngleMarkers pour prendre en compte le changement
    updateRightAngleMarkers(document.getElementById("toggleRightAngles").checked);
  });
}

// Modifier l'event listener existant des angles droits
const toggleRightAngles = document.getElementById("toggleRightAngles");
if (toggleRightAngles) {
  toggleRightAngles.addEventListener('change', function() {
    updateRightAngleMarkers(this.checked);
  });
}

  //  Event listener pour l'effet main levée
  const toggleHandDrawn = document.getElementById('toggleHandDrawn');
  if (toggleHandDrawn) {
    toggleHandDrawn.addEventListener('change', function() {
      toggleHandDrawnEffect(this.checked);
    });
  }

// Event listener pour "cacher l'hypoténuse"
const toggleHideHypotenuse = document.getElementById("toggleHideHypotenuse");
if (toggleHideHypotenuse) {
  toggleHideHypotenuse.addEventListener('change', function() {
    // Relancer updateLengthLabels pour prendre en compte le changement
    updateLengthLabels();
  });
}
  
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
    // ✅ CORRECTION : Ne pas forcer updateLengthLabels() qui repositionne les labels
    // Mettre à jour seulement les éléments qui ne déplacent pas les labels personnalisés
    
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
    
    // ✅ Mise à jour simple du board sans repositionner les labels
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


function trackVisit() {
  // Stocker dans localStorage
  let visits = parseInt(localStorage.getItem('appVisits') || '0');
  visits++;
  localStorage.setItem('appVisits', visits.toString());
  
  // Afficher dans la console
  console.log(`👥 Visite n°${visits} de cet utilisateur`);
  
  // Optionnel : envoyer à un service gratuit
  fetch('https://api.countapi.xyz/hit/mon-generateur-figures/visits')
    .then(response => response.json())
    .then(data => {
      console.log(`📊 Total visiteurs: ${data.value}`);
    })
    .catch(e => console.log('Count API indisponible'));
}

// Appeler au chargement
document.addEventListener('DOMContentLoaded', trackVisit);


function detectFigureType() {
  if (centerPoint && circlePoint && circleObject) {
    return 'circle';
  } else if (points.length === 3) {
    return 'triangle';
  } else if (points.length === 4) {
    const fig = detectCurrentFigure();
    if (fig === 'square') return 'square';
    if (fig === 'rectangle') return 'rectangle';
    return 'quadrilateral'; // parallélogramme, losange...
  } else if (points.length > 4) {
    return 'polygon';
  }
  return 'unknown';
}

function exportCircleToTikZ() {
  let code = '';
  const cx = centerPoint.X();
  const cy = centerPoint.Y();
  const radius = Math.hypot(circlePoint.X() - cx, circlePoint.Y() - cy);
  
  // Centre
  const centerLabel = texts[0] ? texts[0].plaintext || 'O' : 'O';
  code += `  \\coordinate (${centerLabel}) at (${cx.toFixed(2)}, ${cy.toFixed(2)});\n`;
  code += `  \\fill (${centerLabel}) circle (1.5pt);\n`;
  code += `  \\node[below left] at (${centerLabel}) {$${centerLabel}$};\n\n`;
  
  // Point sur le cercle
  const pointLabel = texts[1] ? texts[1].plaintext || 'A' : 'A';
  const px = circlePoint.X();
  const py = circlePoint.Y();
  code += `  \\coordinate (${pointLabel}) at (${px.toFixed(2)}, ${py.toFixed(2)});\n`;
  code += `  \\fill (${pointLabel}) circle (1.5pt);\n`;
  code += `  \\node[above right] at (${pointLabel}) {$${pointLabel}$};\n\n`;
  
  // Cercle
  code += `  \\draw (${centerLabel}) circle (${radius.toFixed(2)});\n\n`;
  
  // Options selon les checkboxes
  if (document.getElementById('toggleRadius')?.checked) {
    code += `  % Rayon\n`;
    code += `  \\draw[dashed] (${centerLabel}) -- (${pointLabel});\n\n`;
  }
  
  if (document.getElementById('toggleDiameter')?.checked && diameterPoints.length >= 2) {
    code += `  % Diamètre\n`;
    const dx1 = diameterPoints[0].X();
    const dy1 = diameterPoints[0].Y();
    const dx2 = diameterPoints[1].X();
    const dy2 = diameterPoints[1].Y();
    code += `  \\coordinate (B) at (${dx1.toFixed(2)}, ${dy1.toFixed(2)});\n`;
    code += `  \\coordinate (C) at (${dx2.toFixed(2)}, ${dy2.toFixed(2)});\n`;
    code += `  \\draw (B) -- (C);\n`;
    code += `  \\fill (B) circle (1.5pt) node[above left] {$B$};\n`;
    code += `  \\fill (C) circle (1.5pt) node[below right] {$C$};\n\n`;
  }
  
  return code;
}

function exportPolygonToTikZ(figureType) {
  let code = '';
  const n = points.length;
  
  // Coordonnées des points
  code += `  % Points du ${figureType}\n`;
  for (let i = 0; i < n; i++) {
    const label = getLabel(i);
    const x = points[i].X();
    const y = points[i].Y();
    code += `  \\coordinate (${label}) at (${x.toFixed(2)}, ${y.toFixed(2)});\n`;
  }
  code += '\n';
  
  // Polygone
  code += `  % ${figureType.charAt(0).toUpperCase() + figureType.slice(1)}\n`;
  let drawCommand = '  \\draw';
  
  // Style selon le type
  if (figureType === 'square' || figureType === 'rectangle') {
    drawCommand += '[thick]';
  }
  
  drawCommand += ' ';
  for (let i = 0; i < n; i++) {
    const label = getLabel(i);
    drawCommand += `(${label})${i < n - 1 ? ' -- ' : ' -- cycle'}`;
  }
  drawCommand += ';\n\n';
  code += drawCommand;
  
  // Labels des points
  code += '  % Labels\n';
  const labelPositions = getLabelPositions(figureType, n);
  for (let i = 0; i < n; i++) {
    const label = getLabel(i);
    const position = labelPositions[i];
    code += `  \\node[${position}] at (${label}) {$${label}$};\n`;
  }
  code += '\n';
  
  // Angles droits
  if (document.getElementById('toggleRightAngles')?.checked) {
    code += addRightAnglesToTikZ(figureType);
  }
  
  // Codages
  if (document.getElementById('toggleCodings')?.checked) {
    code += addCodingsToTikZ(figureType);
  }
  
  // Diagonales
  if (document.getElementById('toggleDiagonals')?.checked && n === 4) {
    code += '  % Diagonales\n';
    code += `  \\draw[dashed] (${getLabel(0)}) -- (${getLabel(2)});\n`;
    code += `  \\draw[dashed] (${getLabel(1)}) -- (${getLabel(3)});\n\n`;
  }
  
  // Mesures
  if (document.getElementById('toggleLengths')?.checked) {
    code += addMeasuresToTikZ(figureType);
  }
  
  return code;
}

function getLabelPositions(figureType, n) {
  if (figureType === 'triangle') {
    return ['below left', 'below right', 'above'];
  } else if (n === 4) {
    return ['below left', 'below right', 'above right', 'above left'];
  } else {
    // Polygone général : alterner autour
    const positions = [];
    for (let i = 0; i < n; i++) {
      const angle = (i * 2 * Math.PI / n) - Math.PI / 2;
      if (angle >= -Math.PI/4 && angle < Math.PI/4) positions.push('right');
      else if (angle >= Math.PI/4 && angle < 3*Math.PI/4) positions.push('above');
      else if (angle >= 3*Math.PI/4 || angle < -3*Math.PI/4) positions.push('left');
      else positions.push('below');
    }
    return positions;
  }
}

function addRightAnglesToTikZ(figureType) {
  let code = '  % Angles droits\n';
  
  if (figureType === 'square' || figureType === 'rectangle') {
    // Tous les angles sont droits
    for (let i = 0; i < 4; i++) {
      const A = getLabel((i - 1 + 4) % 4);
      const B = getLabel(i);
      const C = getLabel((i + 1) % 4);
      code += `  \\draw (${A}) ++(0.2,0) -- ++(0,0.2) -- ++(-0.2,0) -- cycle; % Angle droit en ${B}\n`;
    }
  } else if (figureType === 'triangle') {
    // Détecter les angles droits (triangle rectangle)
    const rightAngles = getRightAngleTriples();
    rightAngles.forEach(([A, B, C], index) => {
      const labelA = getLabel(points.indexOf(A));
      const labelB = getLabel(points.indexOf(B));
      const labelC = getLabel(points.indexOf(C));
      code += `  \\draw (${labelB}) ++(0.15,0) -- ++(0,0.15) -- ++(-0.15,0); % Angle droit en ${labelB}\n`;
    });
  }
  
  code += '\n';
  return code;
}

function addCodingsToTikZ(figureType) {
  let code = '  % Codages des côtés égaux\n';
  
  // Analyser les longueurs des côtés
  const sideLengths = [];
  const n = points.length;
  
  for (let i = 0; i < n; i++) {
    const pt1 = points[i];
    const pt2 = points[(i + 1) % n];
    const len = Math.sqrt((pt2.X() - pt1.X()) ** 2 + (pt2.Y() - pt1.Y()) ** 2);
    sideLengths.push({ index: i, length: Math.round(len * 100) / 100 });
  }
  
  // Grouper les côtés égaux
  const groups = {};
  sideLengths.forEach(seg => {
    const key = seg.length.toFixed(2);
    if (!groups[key]) groups[key] = [];
    groups[key].push(seg.index);
  });
  
  let markCount = 1;
  const marks = ['|', '||', '|||'];
  
  for (const key in groups) {
    const indices = groups[key];
    if (indices.length < 2) continue;
    
    const mark = marks[Math.min(markCount - 1, marks.length - 1)];
    
    for (const i of indices) {
      const labelA = getLabel(i);
      const labelB = getLabel((i + 1) % n);
      code += `  \\draw (\\$(${labelA})!0.5!(${labelB})$) node {${mark}}; % Codage ${labelA}${labelB}\n`;
    }
    
    markCount++;
  }
  
  code += '\n';
  return code;
}

function addMeasuresToTikZ(figureType) {
  let code = '  % Mesures\n';
  const unit = document.getElementById('unitSelector')?.value || 'cm';
  const showUnits = document.getElementById('showUnitsCheckbox')?.checked;
  const n = points.length;
  
  // Afficher seulement certains côtés selon le type
  let sidesToShow = [];
  if (figureType === 'square') {
    sidesToShow = [0]; // Un seul côté
  } else if (figureType === 'rectangle') {
    sidesToShow = [0, 1]; // Longueur et largeur
  } else {
    sidesToShow = [...Array(n).keys()]; // Tous les côtés
  }
  
  for (const i of sidesToShow) {
    const pt1 = points[i];
    const pt2 = points[(i + 1) % n];
    const length = Math.sqrt((pt2.X() - pt1.X()) ** 2 + (pt2.Y() - pt1.Y()) ** 2);
    const labelA = getLabel(i);
    const labelB = getLabel((i + 1) % n);
    
    const value = Math.round(length * 10) / 10;
    const text = showUnits ? `${value}\\,\\text{${unit}}` : `${value}`;
    
    code += `  \\draw (\\$(${labelA})!0.5!(${labelB})$) node[above, sloped] {${text}};\n`;
  }
  
  code += '\n';
  return code;
}

function showTikZDialog(tikzCode) {
  // Créer la popup
  const dialog = document.createElement('div');
  dialog.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border: 2px solid #333;
    border-radius: 8px;
    padding: 20px;
    z-index: 10000;
    max-width: 80%;
    max-height: 80%;
    overflow-y: auto;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  `;
  
  dialog.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
      <h3 style="margin: 0;">Code TikZ généré</h3>
      <button id="closeTikZDialog" style="background: #ff4757; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">×</button>
    </div>
    
    <p style="margin-bottom: 15px; color: #666;">
      Copiez ce code dans votre document LaTeX (ajoutez <code>\\usepackage{tikz}</code> et <code>\\usetikzlibrary{calc}</code> dans le préambule) :
    </p>
    
    <textarea id="tikzCodeArea" style="width: 100%; height: 300px; font-family: monospace; font-size: 12px; border: 1px solid #ddd; padding: 10px;" readonly>${tikzCode}</textarea>
    
    <div style="margin-top: 15px; text-align: center;">
      <button id="copyTikZCode" style="background: #2ecc71; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-right: 10px;">Copier le code</button>
      <button id="downloadTikZCode" style="background: #3742fa; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">Télécharger .tex</button>
    </div>
  `;
  
  // Overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    z-index: 9999;
  `;
  
  document.body.appendChild(overlay);
  document.body.appendChild(dialog);
  
  // Event listeners
  document.getElementById('closeTikZDialog').addEventListener('click', () => {
    document.body.removeChild(dialog);
    document.body.removeChild(overlay);
  });
  
  document.getElementById('copyTikZCode').addEventListener('click', async () => {
    const textarea = document.getElementById('tikzCodeArea');
    textarea.select();
    try {
      await navigator.clipboard.writeText(tikzCode);
      alert('Code TikZ copié dans le presse-papier !');
    } catch (err) {
      alert('Code sélectionné, appuyez sur Ctrl+C pour copier');
    }
  });
  
  document.getElementById('downloadTikZCode').addEventListener('click', () => {
    const fullDocument = `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{tikz}
\\usetikzlibrary{calc}
\\begin{document}

${tikzCode}

\\end{document}`;
    
    const blob = new Blob([fullDocument], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'figure.tex';
    a.click();
    URL.revokeObjectURL(url);
  });
  
  // Fermer avec Escape
  const escapeHandler = (e) => {
    if (e.key === 'Escape') {
      document.body.removeChild(dialog);
      document.body.removeChild(overlay);
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
}


function initThemeToggle() {
  const toggle = document.createElement('button');
  toggle.innerHTML = '🌙';
  toggle.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: none;
    background: white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    font-size: 20px;
    cursor: pointer;
    z-index: 1000;
    transition: all 0.3s ease;
  `;
  
  toggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    toggle.innerHTML = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
  });
  
  document.body.appendChild(toggle);
}

