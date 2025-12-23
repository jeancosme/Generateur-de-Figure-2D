/**
 * ============================================
 * MARKERS.JS - Marqueurs visuels
 * ============================================
 * 
 * Gestion des marqueurs visuels (longueurs, codages, angles droits, diagonales)
 */


// ⚠️ Import temporaire - sera activé quand handlers.js sera finalisé

// Import temporaire depuis board.js

// ==========================================
// CERCLES - EXTRAS (RAYON, DIAMÈTRE)
// ==========================================

function updateCircleExtras() {
  // Vérifications de base
  if (!centerPoint || !circlePoint) {
    console.log('❌ Pas de cercle détecté');
    return;
  }

  // Récupération des options
  const showRadius = document.getElementById("toggleRadius")?.checked || false;
  const showDiameter = document.getElementById("toggleDiameter")?.checked || false;
  const showCodings = document.getElementById("toggleCodings")?.checked || false;
  const showLengths = document.getElementById("toggleLengths")?.checked || false;
  const showUnits = document.getElementById("showUnitsCheckbox")?.checked || false;
  const unit = document.getElementById("unitSelector")?.value || "cm";

  // ✅ SECTION 1 : NETTOYAGE (y compris les codages existants)
  if (radiusSegment) {
    try { board.removeObject(radiusSegment); } catch (e) {}
    setRadiusSegment(null);
  }
  if (radiusLabel) {
    try { board.removeObject(radiusLabel); } catch (e) {}
    setRadiusLabel(null);
  }
  if (diameterSegment) {
    try { board.removeObject(diameterSegment); } catch (e) {}
    setDiameterSegment(null);
  }
  diameterPoints.forEach(pt => { 
    try { board.removeObject(pt); } catch (e) {} 
  });
  setDiameterPoints([]);

  // ✅ NOUVEAU : Nettoyer les codages existants à chaque fois
  codingMarks.forEach(mark => { 
    try { board.removeObject(mark); } catch (e) {} 
  });
  setCodingMarks([]);

  const dx = circlePoint.X() - centerPoint.X();
  const dy = circlePoint.Y() - centerPoint.Y();
  const r = Math.sqrt(dx * dx + dy * dy);

  // ✅ SECTION 2 : CRÉER LES ÉLÉMENTS GÉOMÉTRIQUES D'ABORD
  
  // AFFICHAGE DU RAYON
  if (showRadius) {
    circlePoint.setAttribute({
      fixed: false,
      size: 3,
      strokeOpacity: 1,
      fillOpacity: 1,
      strokeColor: 'black',
      fillColor: 'black'
    });

    const newRadiusSegment = board.create('segment', [centerPoint, circlePoint], {
      strokeColor: 'black',
      strokeWidth: 2,
      fixed: true
    });
    setRadiusSegment(newRadiusSegment);

    if (showLengths) {
      const startX = (centerPoint.X() + circlePoint.X()) / 2 + 0.3;
      const startY = (centerPoint.Y() + circlePoint.Y()) / 2 + 0.3;

      const radiusHandle = board.create('point', [startX, startY], {
        size: 6,
        strokeOpacity: 0,
        fillOpacity: 0,
        fixed: false,
        highlight: false,
        showInfobox: false
      });

      const newRadiusLabel = board.create('text', [
        () => radiusHandle.X(),
        () => radiusHandle.Y(),
        () => {
          const currentRadius = Math.sqrt(
            Math.pow(circlePoint.X() - centerPoint.X(), 2) + 
            Math.pow(circlePoint.Y() - centerPoint.Y(), 2)
          );
          const rounded = Math.round(currentRadius * 10) / 10;
          const value = Number.isInteger(rounded) ? `${rounded}` : `${rounded}`.replace('.', ',');
          return showUnits ? `${value}\u00A0${unit}` : `${value}`;
        }
      ], {
        anchorX: 'middle',
        anchorY: 'middle',
        fontSize: 14,
        fixed: false
      });

      lengthHandles.push(radiusHandle);
      lengthLabels.push(newRadiusLabel);
      
      setRadiusLabel(newRadiusLabel);
    }
  } else {
    circlePoint.setAttribute({
      size: 0,
      strokeOpacity: 0,
      fillOpacity: 0
    });
  }

  // AFFICHAGE DU DIAMÈTRE
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
      size: 3,
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
      size: 3,
      strokeColor: 'black',
      fillColor: 'black'
    });

    setDiameterPoints([B, C]);

    const newDiameterSegment = board.create('segment', [B, C], {
      strokeColor: 'black',
      strokeWidth: 2,
      fixed: true
    });
    
    setDiameterSegment(newDiameterSegment);
  }

  // ✅ SECTION 3 : CRÉER LES CODAGES APRÈS QUE TOUS LES POINTS EXISTENT
  if (showCodings) {
    console.log('🔧 Création des codages après création des éléments...');
    
    // Codage sur le rayon [OA] (si rayon affiché)
    if (showRadius && centerPoint && circlePoint) {
      createSimpleCodingMark(centerPoint, circlePoint, 1);
      console.log('✅ Codage créé sur rayon OA');
    }
    
    // Codages sur les rayons [OB] et [OC] (si diamètre affiché)
    if (showDiameter && diameterPoints.length >= 2) {
      createSimpleCodingMark(centerPoint, diameterPoints[0], 1);
      createSimpleCodingMark(centerPoint, diameterPoints[1], 1);
      console.log('✅ Codages créés sur rayons OB et OC');
    }
  }

  // ✅ SECTION 4 : MISE À JOUR FINALE
  board.update();
  console.log(`✅ updateCircleExtras terminé - Codages: ${showCodings}, Rayon: ${showRadius}, Diamètre: ${showDiameter}`);
}

// ==========================================
// DIAGONALES
// ==========================================

function updateDiagonals() {
  // Supprimer les anciennes diagonales ET le label d'intersection
  diagonals.forEach(d => board.removeObject(d));
  setDiagonals([]);
  
  if (intersectionLabel) {
    try { board.removeObject(intersectionLabel); } catch (e) {}
    setIntersectionLabel(null);
  }
  if (intersectionPoint) {
    try { board.removeObject(intersectionPoint); } catch (e) {}
    setIntersectionPoint(null);
  }

  // Vérifier si on doit afficher les diagonales
  const show = document.getElementById('toggleDiagonals')?.checked;
  const intersectionGroup = document.getElementById('intersectionGroup');
  
  if (!show || !points || points.length !== 4) {
    // Masquer l'option d'intersection si pas de diagonales
    if (intersectionGroup) intersectionGroup.style.display = 'none';
    return;
  }

  // ✅ AFFICHER l'option d'intersection quand les diagonales sont cochées
  if (intersectionGroup) intersectionGroup.style.display = 'block';

  console.log('Création diagonales pour quadrilatère avec', points.length, 'points');

  // QUADRILATÈRE : 2 diagonales uniquement
  const diag1 = board.create('segment', [points[0], points[2]], {
    strokeColor: 'black',
    strokeWidth: 1,
    dash: 0,
    fixed: true,
    withLabel: false
  });
  
  const diag2 = board.create('segment', [points[1], points[3]], {
    strokeColor: 'black', 
    strokeWidth: 1,
    dash: 0,
    fixed: true,
    withLabel: false
  });

  const newDiagonals = [diag1, diag2];
  setDiagonals(newDiagonals);
  console.log('✅ 2 diagonales créées');
  
  // ✅ CRÉER LE LABEL D'INTERSECTION (si demandé)
  const showIntersectionLabel = document.getElementById('toggleIntersectionLabel')?.checked;
  if (showIntersectionLabel) {
    createIntersectionLabel();
  }
  
  board.update();
}

// ✅ FONCTION : Créer le label d'intersection
function createIntersectionLabel() {
  if (!points || points.length !== 4) return;
  
  // Récupérer le texte personnalisé (défaut : "I")
  const intersectionTextInput = document.getElementById('intersectionTextInput');
  const labelText = intersectionTextInput?.value.trim() || 'I';
  
  // ✅ CALCULER L'INTERSECTION DES DIAGONALES
  const intersection = calculateDiagonalsIntersection();
  if (!intersection) {
    console.warn('⚠️ Impossible de calculer l\'intersection des diagonales');
    return;
  }
  
  // ✅ NOUVEAU : Créer un handle invisible déplaçable pour positionner le label
  const intersectionHandle = board.create('point', [
    intersection.x + 0.2, // Position initiale avec décalage
    intersection.y + 0.2
  ], {
    size: 6,
    strokeOpacity: 0,
    fillOpacity: 0,
    fixed: false,
    name: '',
    highlight: false,
    showInfobox: false
  });
  
  // Point de calcul de l'intersection (invisible)
  const newIntersectionPoint = board.create('point', [intersection.x, intersection.y], {
    visible: false,
    fixed: true,
    name: ''
  });
  setIntersectionPoint(newIntersectionPoint);

  // Label qui suit le handle déplaçable
  const newIntersectionLabel = board.create('text', [
    () => intersectionHandle.X(),
    () => intersectionHandle.Y(),
    labelText
  ], {
    anchorX: 'middle',
    anchorY: 'middle',
    fontSize: 14,
    strokeColor: 'black',
    fixed: false,
    highlight: false,
    name: ''
  });
  
  setIntersectionLabel(newIntersectionLabel);
  
  // Rendre le label déplaçable
  try {
    if (intersectionHandle.rendNode) {
      intersectionHandle.rendNode.style.cursor = 'move';
    }
    
    if (newIntersectionLabel.rendNode) {
      newIntersectionLabel.rendNode.style.cursor = 'move';
      
      newIntersectionLabel.rendNode.addEventListener('pointerdown', function (ev) {
        ev.stopPropagation();
        ev.preventDefault();
        
        const start = board.getUsrCoordsOfMouse(ev);
        
        function onMove(e) {
          const pos = board.getUsrCoordsOfMouse(e);
          const dx = pos[0] - start[0];
          const dy = pos[1] - start[1];
          
          try {
            intersectionHandle.moveTo([intersectionHandle.X() + dx, intersectionHandle.Y() + dy], 0);
          } catch (err) {
            try {
              intersectionHandle.setPosition(JXG.COORDS_BY_USER, [intersectionHandle.X() + dx, intersectionHandle.Y() + dy]);
            } catch (e) {}
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
  } catch (e) {
    console.warn('⚠️ Impossible de configurer le drag and drop pour le label d\'intersection:', e);
  }
  
  lengthHandles.push(intersectionHandle);
  
  console.log(`✅ Label d'intersection déplaçable créé: "${labelText}" à (${intersection.x.toFixed(2)}, ${intersection.y.toFixed(2)})`);
}

// ✅ FONCTION POUR CALCULER L'INTERSECTION DES DIAGONALES
function calculateDiagonalsIntersection() {
  if (!points || points.length !== 4) return null;
  
  const A = points[0];
  const C = points[2];
  const B = points[1];
  const D = points[3];
  
  const x1 = A.X(), y1 = A.Y();
  const x2 = C.X(), y2 = C.Y();
  const x3 = B.X(), y3 = B.Y();
  const x4 = D.X(), y4 = D.Y();
  
  const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  
  if (Math.abs(denominator) < 1e-10) {
    console.warn('⚠️ Les diagonales sont parallèles (pas d\'intersection)');
    return null;
  }
  
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
  
  const intersectionX = x1 + t * (x2 - x1);
  const intersectionY = y1 + t * (y2 - y1);
  
  return {
    x: intersectionX,
    y: intersectionY
  };
}

// ==========================================
// CODAGES (CÔTÉS ÉGAUX)
// ==========================================

function updateCodings() {
  // Supprimer les codages existants
  codingMarks.forEach(m => board.removeObject(m));
  setCodingMarks([]);

  if (!document.getElementById("toggleCodings")?.checked || !points || points.length < 3) {
    return;
  }

  const n = points.length;

  if (n === 3) {
    // TRIANGLE
    const tolerance = 0.1;
    const sideLengths = [];
    
    for (let i = 0; i < 3; i++) {
      const pt1 = points[i];
      const pt2 = points[(i + 1) % 3];
      const length = Math.hypot(pt2.X() - pt1.X(), pt2.Y() - pt1.Y());
      sideLengths.push(length);
    }
    
    // Triangle équilatéral
    if (sideLengths.every(len => Math.abs(len - sideLengths[0]) < tolerance)) {
      for (let i = 0; i < 3; i++) {
        createSimpleCodingMark(points[i], points[(i + 1) % 3], 1);
      }
    }
    // Triangle isocèle
    else {
      for (let i = 0; i < 3; i++) {
        for (let j = i + 1; j < 3; j++) {
          if (Math.abs(sideLengths[i] - sideLengths[j]) < tolerance) {
            createSimpleCodingMark(points[i], points[(i + 1) % 3], 1);
            createSimpleCodingMark(points[j], points[(j + 1) % 3], 1);
            return;
          }
        }
      }
    }
    
  } else if (n === 4) {
    // QUADRILATÈRE
    const figureType = getCurrentFigureType();
    
    if (figureType.subtype === 'square') {
      for (let i = 0; i < 4; i++) {
        createSimpleCodingMark(points[i], points[(i + 1) % 4], 1);
      }
    } 
    else if (figureType.subtype === 'rectangle') {
      createSimpleCodingMark(points[0], points[1], 1);
      createSimpleCodingMark(points[2], points[3], 1);
      createSimpleCodingMark(points[1], points[2], 2);
      createSimpleCodingMark(points[3], points[0], 2);
    }
    else if (figureType.subtype === 'rhombus') {
      for (let i = 0; i < 4; i++) {
        createSimpleCodingMark(points[i], points[(i + 1) % 4], 1);
      }
    }
    else if (figureType.subtype === 'parallelogram') {
      createSimpleCodingMark(points[0], points[1], 1);
      createSimpleCodingMark(points[2], points[3], 1);
      createSimpleCodingMark(points[1], points[2], 2);
      createSimpleCodingMark(points[3], points[0], 2);
    }
  }
  else if (n >= 5) {
    // POLYGONES RÉGULIERS
    const tolerance = 0.15;
    const sideLengths = [];
    
    for (let i = 0; i < n; i++) {
      const pt1 = points[i];
      const pt2 = points[(i + 1) % n];
      const length = Math.hypot(pt2.X() - pt1.X(), pt2.Y() - pt1.Y());
      sideLengths.push(length);
    }
    
    const isRegular = sideLengths.every(len => Math.abs(len - sideLengths[0]) < tolerance);
    
    if (isRegular) {
      console.log(`✅ Polygone régulier détecté (${n} côtés) - tous les côtés égaux`);
      for (let i = 0; i < n; i++) {
        createSimpleCodingMark(points[i], points[(i + 1) % n], 1);
      }
    } else {
      console.log(`ℹ️ Polygone irrégulier (${n} côtés) - pas de codage`);
    }
  }

  board.update();
}

function createSimpleCodingMark(pt1, pt2, markCount = 1) {
  const dx = pt2.X() - pt1.X();
  const dy = pt2.Y() - pt1.Y();
  const len = Math.hypot(dx, dy);
  
  if (len === 0) return;

  const mx = (pt1.X() + pt2.X()) / 2;
  const my = (pt1.Y() + pt2.Y()) / 2;

  const segmentAngle = Math.atan2(dy, dx);
  const isHorizontal = Math.abs(Math.sin(segmentAngle)) < 0.2;
  const isVertical = Math.abs(Math.cos(segmentAngle)) < 0.2;
  
  let finalX, finalY;

  if (isHorizontal || isVertical) {
    const perpX = -dy / len;
    const perpY = dx / len;
    
    const angle30 = Math.PI / 6;
    const cos30 = Math.cos(angle30);
    const sin30 = Math.sin(angle30);
    
    finalX = perpX * cos30 - perpY * sin30;
    finalY = perpX * sin30 + perpY * cos30;
    
  } else {
    finalX = -dy / len;
    finalY = dx / len;
  }

  const markLength = 0.15;
  const spacing = 0.12;

  for (let i = 0; i < markCount; i++) {
    const offset = (i - (markCount - 1) / 2) * spacing;
    const centerX = mx + (dx / len) * offset;
    const centerY = my + (dy / len) * offset;

    const mark = board.create('segment', [
      [centerX - finalX * markLength, centerY - finalY * markLength],
      [centerX + finalX * markLength, centerY + finalY * markLength]
    ], {
      strokeColor: 'black',
      strokeWidth: 1.5,
      fixed: true,
      highlight: false
    });

    codingMarks.push(mark);
  }
  
  console.log(`✅ Codage créé : ${isHorizontal || isVertical ? 'perpendiculaire+30°' : 'strictement perpendiculaire'}`);
}

// ==========================================
// ANGLES DROITS
// ==========================================

function updateRightAngleMarkers(visible) {
  if (typeof visible === 'object' && visible !== null && 'target' in visible) {
    visible = !!visible.target.checked;
  } else {
    visible = !!visible;
  }

  rightAngleMarkers.forEach(m => { 
    try { board.removeObject(m); } catch (e) {} 
  });
  setRightAngleMarkers([]);

  const singleAngleGroup = document.getElementById('singleAngleGroup');
  const singleAngleCheckbox = document.getElementById('toggleSingleAngle');

  if (!visible || !points || points.length < 3) {
    if (singleAngleGroup) singleAngleGroup.style.display = 'none';
    if (singleAngleCheckbox) singleAngleCheckbox.checked = false;
    board.update(); 
    return; 
  }

  const handler = getCurrentFigureHandler();
  
  if (!handler) {
    console.warn('⚠️ Pas de handler trouvé pour les angles droits');
    if (singleAngleGroup) singleAngleGroup.style.display = 'none';
    board.update();
    return;
  }
  
  const rightAngles = handler.getRightAngles();
  console.log(`🎯 Handler ${handler.constructor.name} → angles droits: [${rightAngles.join(', ')}]`);
  
  const supportsSingleAngle = handler.shouldShowSingleRightAngle();
  
  if (rightAngles.length > 0 && supportsSingleAngle) {
    if (singleAngleGroup) singleAngleGroup.style.display = 'block';
  } else {
    if (singleAngleGroup) singleAngleGroup.style.display = 'none';
    if (singleAngleCheckbox) singleAngleCheckbox.checked = false;
  }
  
  const showSingleAngle = singleAngleCheckbox && singleAngleCheckbox.checked;
  
  if (rightAngles.length > 0) {
    createRightAngleMarkersFromHandler(rightAngles, showSingleAngle, points.length);
  }
  
  board.update();
}

function createRightAngleMarkersFromHandler(angleIndices, singleAngle, figureSize) {
  const size = 0.3;
  
  if (singleAngle && angleIndices.length > 1) {
    createSingleRightAngleMarker(angleIndices[0], size, figureSize);
    console.log(`📐 Un seul angle droit affiché: index ${angleIndices[0]}`);
  } else {
    angleIndices.forEach(angleIndex => {
      createSingleRightAngleMarker(angleIndex, size, figureSize);
    });
    console.log(`📐 ${angleIndices.length} angles droits affichés`);
  }
}

function createSingleRightAngleMarker(angleIndex, size, figureSize = 4) {
  if (!points || angleIndex < 0 || angleIndex >= points.length) {
    console.warn(`⚠️ Index d'angle invalide: ${angleIndex}`);
    return;
  }
  
  const vertex = points[angleIndex];
  const prevPoint = points[(angleIndex - 1 + figureSize) % figureSize];
  const nextPoint = points[(angleIndex + 1) % figureSize];
  
  if (!vertex || !prevPoint || !nextPoint) {
    console.warn(`⚠️ Points manquants pour l'angle ${angleIndex}`);
    return;
  }
  
  const v1x = prevPoint.X() - vertex.X();
  const v1y = prevPoint.Y() - vertex.Y();
  const v2x = nextPoint.X() - vertex.X();
  const v2y = nextPoint.Y() - vertex.Y();
  
  const len1 = Math.hypot(v1x, v1y);
  const len2 = Math.hypot(v2x, v2y);
  
  if (len1 === 0 || len2 === 0) {
    console.warn(`⚠️ Vecteurs de longueur nulle pour l'angle ${angleIndex}`);
    return;
  }
  
  const u1x = v1x / len1;
  const u1y = v1y / len1;
  const u2x = v2x / len2;
  const u2y = v2y / len2;
  
  const cornerSize = Math.min(size, Math.min(len1, len2) * 0.3);
  
  const p1x = vertex.X() + u1x * cornerSize;
  const p1y = vertex.Y() + u1y * cornerSize;
  
  const p2x = vertex.X() + u2x * cornerSize;
  const p2y = vertex.Y() + u2y * cornerSize;
  
  const p3x = p1x + u2x * cornerSize;
  const p3y = p1y + u2y * cornerSize;
  
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
  
  console.log(`✅ Angle droit créé au sommet ${angleIndex} (${getLabel(angleIndex)})`);
}

// ==========================================
// ANGLES ÉGAUX
// ==========================================

function updateEqualAngleMarkers(visible) {
  if (typeof visible === 'object' && visible !== null && 'target' in visible) visible = !!visible.target.checked;
  else visible = !!visible;

  angleMarkers.forEach(m => { try { board.removeObject(m); } catch (e) {} });
  setAngleMarkers([]);

  if (!visible || !points || points.length < 3) { 
    board.update(); 
    return; 
  }

  const fig = getCurrentFigureType();
  if (fig.subtype === 'square' || fig.subtype === 'rectangle') { 
    board.update(); 
    return; 
  }

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

  let isParallelogram = false;
  if (n === 4 && angles.every(a => a != null)) {
    const tol = 0.03;
    if (Math.abs(angles[0] - angles[2]) < tol && Math.abs(angles[1] - angles[3]) < tol) isParallelogram = true;
  }

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

  const groups = {};
  for (let i = 0; i < n; i++) {
    const a = angles[i];
    if (a == null) continue;
    const key = (Math.round(a * 100) / 100).toFixed(2);
    (groups[key] = groups[key] || []).push(i);
  }

  const baseRadius = 0.42;
  let angleCodeMarks = [];

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
    angleCodeMarks.push(seg);
  }

  function normAng(a) { while (a <= -Math.PI) a += 2*Math.PI; while (a > Math.PI) a -= 2*Math.PI; return a; }

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

  angleMarkers.push(...angleCodeMarks);
  board.update();
}

// ==========================================
// LABELS DE LONGUEURS
// ==========================================

function updateLengthLabels() {
  // Sauvegarder les positions des handles déplacés manuellement
  const savedPositions = [];
  for (let i = 0; i < (points ? points.length : 0); i++) {
    savedPositions[i] = null;
  }

  lengthHandleMeta.forEach(meta => {
    if (meta && meta.handle && !meta.handle._auto && meta.sideIndex !== undefined) {
      savedPositions[meta.sideIndex] = { 
        x: meta.handle.X(), 
        y: meta.handle.Y() 
      };
    }
  });

  lengthLabels.forEach(label => { try { board.removeObject(label); } catch (e) {} });
  lengthHandles.forEach(handle => { try { board.removeObject(handle); } catch (e) {} });
  
  setLengthLabels([]);
  setLengthHandles([]);
  setLengthHandleMeta([]);

  const showLengths = document.getElementById("toggleLengths")?.checked;
  if (!showLengths || !points || points.length === 0) {
    console.log('❌ Mesures désactivées ou pas de points');
    return;
  }

  console.log(`🔍 Affichage des mesures pour ${points.length} points`);

  const showUnits = document.getElementById("showUnitsCheckbox")?.checked;
  const unit = document.getElementById("unitSelector")?.value || 'cm';
  
  // Triangle helper (importé depuis drawing.js)
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

  function getSidesToShow() {
    const handler = getCurrentFigureHandler();
    
    if (!handler) {
      console.warn('⚠️ Pas de handler trouvé, affichage de tous les côtés');
      return [...Array(points.length).keys()];
    }
    
    let sidesToShow = handler.getSidesToShow();
    
    if (hideHypotenuse && handler.shouldHideHypotenuse()) {
      const hypotenuseIndex = handler.getHypotenuseIndex();
      if (hypotenuseIndex !== -1) {
        sidesToShow = sidesToShow.filter(i => i !== hypotenuseIndex);
        console.log(`🚫 Hypoténuse (côté ${hypotenuseIndex}) cachée`);
      }
    }
    
    console.log(`🎯 Handler ${handler.constructor.name} → côtés: [${sidesToShow.join(', ')}]`);
    
    return sidesToShow;
  }

  function formatLength(len) {
    const rounded = Math.round(len * 10) / 10;
    const space = '\u00A0';
    const value = Number.isInteger(rounded) ? `${rounded}` : `${rounded}`.replace('.', ',');
    return showUnits ? `${value}${space}${unit.trim()}` : `${value}`;
  }
  
  function createLengthLabel(sideIndex) {
    const n = points.length;
    const pt1 = points[sideIndex];
    const pt2 = points[(sideIndex + 1) % n];
    
    console.log(`🏷️ Création label pour côté ${sideIndex}: ${getLabel(sideIndex)}${getLabel((sideIndex + 1) % n)}`);
    
    let startX, startY;
    
    if (savedPositions[sideIndex] && savedPositions[sideIndex] !== null) {
      startX = savedPositions[sideIndex].x;
      startY = savedPositions[sideIndex].y;
    } else {
      const dx = pt2.X() - pt1.X();
      const dy = pt2.Y() - pt1.Y();
      const len = Math.hypot(dx, dy) || 1;
      
      const midX = (pt1.X() + pt2.X()) / 2;
      const midY = (pt1.Y() + pt2.Y()) / 2;
      
      const figureType = getCurrentFigureType();
      const isQuadrilateral = figureType && figureType.type === 'quadrilateral';
      
      let offsetX, offsetY;
      
      if (isQuadrilateral) {
        const figureCenter = getFigureCenter();
        const centerX = figureCenter[0];
        const centerY = figureCenter[1];
        
        const perpX = -dy / len;
        const perpY = dx / len;
        
        const toCenterX = midX - centerX;
        const toCenterY = midY - centerY;
        
        const dotProduct = toCenterX * perpX + toCenterY * perpY;
        const direction = dotProduct > 0 ? 1 : -1;
        
        const offset = 0.5;
        offsetX = direction * perpX * offset;
        offsetY = direction * perpY * offset;
        
        console.log(`📐 Quadrilatère détecté : label ${sideIndex} placé à l'EXTÉRIEUR`);
        
      } else {
        const offset = -0.4;
        offsetX = -offset * (dy / len);
        offsetY = offset * (dx / len);
        
        if (Math.abs(dy) < 0.1) {
          offsetY += 0.2;
        }
        
        console.log(`📐 Figure non-quadrilatère : placement standard pour côté ${sideIndex}`);
      }
      
      startX = midX + offsetX;
      startY = midY + offsetY;
    }

    const handle = board.create('point', [startX, startY], {
      size: 6,
      strokeOpacity: 0,
      fillOpacity: 0,
      fixed: false,
      name: '',
      highlight: false,
      showInfobox: false
    });
    
    handle._auto = (savedPositions[sideIndex] === null);

    try { 
      if (handle.rendNode) handle.rendNode.style.cursor = 'move'; 
    } catch (e) {}

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

    makeLabelDraggable(label, handle);

    lengthHandles.push(handle);
    lengthLabels.push(label);
    lengthHandleMeta.push({ 
      handle, 
      pt1, 
      pt2, 
      offset: 0.5,
      sideIndex 
    });
    
    console.log(`✅ Label créé pour côté ${sideIndex}`);
  }
  
  function makeLabelDraggable(label, handle) {
    try {
      if (label.rendNode) {
        label.rendNode.style.cursor = 'move';
        label.rendNode.addEventListener('pointerdown', function (ev) {
          ev.stopPropagation(); 
          ev.preventDefault();
          
          handle._auto = false;
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

  const sidesToShow = getSidesToShow();
  
  console.log(`🔍 Côtés à afficher: [${sidesToShow.join(', ')}]`);
  
  sidesToShow.forEach(sideIndex => {
    createLengthLabel(sideIndex);
  });

  console.log(`✅ ${lengthLabels.length} labels de longueur créés au total`);
  
  board.update();
}
