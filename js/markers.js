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

  // ✅ SECTION 1 : NETTOYAGE RADICAL - TOUT SUPPRIMER
  
  // Supprimer TOUS les objets text du board (même le O, on le recréera)
  const allBoardObjects = [...board.objectsList];
  allBoardObjects.forEach(obj => {
    if (obj.elType === 'text') {
      try { board.removeObject(obj); } catch (e) {}
    }
  });
  
  // Nettoyer tous les handles de labels
  labelHandles.forEach(h => {
    try { board.removeObject(h); } catch (e) {}
  });
  setLabelHandles([]);
  
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

  // ✅ SECTION 2 : CRÉER LES ÉLÉMENTS GÉOMÉTRIQUES
  
  // Arrays locaux pour collecter les nouveaux éléments
  const newTexts = [];
  const newHandles = [];
  
  // TOUJOURS créer le label O du centre
  const labelO = board.create('text', [
    () => centerPoint.X() - 0.1,
    () => centerPoint.Y() + 0.2,
    'O'
  ], {
    anchorX: 'middle',
    anchorY: 'bottom',
    fontSize: getGlobalFontSize(),
    fixed: true,
    name: ''
  });
  newTexts.push(labelO);
  
  // AFFICHAGE DU RAYON
  if (showRadius) {
    circlePoint.setAttribute({
      fixed: false,
      size: 0,
      strokeOpacity: 0,
      fillOpacity: 0,
      strokeColor: 'black',
      fillColor: 'black',
      visible: false
    });
    
    // Créer un handle pour déplacer le label "A"
    const labelAHandle = board.create('point', [
      circlePoint.X() + 0.3,
      circlePoint.Y()
    ], {
      name: '',
      withLabel: false,
      size: 6,
      strokeOpacity: 0,
      fillOpacity: 0,
      fixed: false,
      highlight: false,
      showInfobox: false
    });
    
    // Créer ou mettre à jour le label "A" déplaçable
    const labelA = board.create('text', [
      () => labelAHandle.X(),
      () => labelAHandle.Y(),
      'A'
    ], {
      anchorX: 'middle',
      anchorY: 'middle',
      fontSize: getGlobalFontSize(),
      fixed: false
    });
    
    // Ajouter le handle et le label aux arrays locaux
    newHandles.push(labelAHandle);
    newTexts.push(labelA);

    const newRadiusSegment = board.create('segment', [centerPoint, circlePoint], {
      strokeColor: 'black',
      strokeWidth: 1.4,
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
        fontSize: getGlobalFontSize(),
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
      fillOpacity: 0,
      visible: false
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
      name: '',
      withLabel: false,
      showInfobox: false,
      fixed: true,
      size: 0,
      strokeOpacity: 0,
      fillOpacity: 0,
      visible: false
    });

    const C = board.create('point', [
      () => centerPoint.X() - r * Math.cos(angleB),
      () => centerPoint.Y() - r * Math.sin(angleB)
    ], {
      name: '',
      withLabel: false,
      showInfobox: false,
      fixed: true,
      size: 0,
      strokeOpacity: 0,
      fillOpacity: 0,
      visible: false
    });

    setDiameterPoints([B, C]);

    // Créer les handles pour les labels B et C avec des coordonnées statiques
    const labelBHandle = board.create('point', [
      B.X() + 0.3,
      B.Y() + 0.2
    ], {
      name: '',
      withLabel: false,
      size: 6,
      strokeOpacity: 0,
      fillOpacity: 0,
      fixed: false,
      highlight: false,
      showInfobox: false
    });
    
    const labelCHandle = board.create('point', [
      C.X() - 0.3,
      C.Y() - 0.2
    ], {
      name: '',
      withLabel: false,
      size: 6,
      strokeOpacity: 0,
      fillOpacity: 0,
      fixed: false,
      highlight: false,
      showInfobox: false
    });
    
    // Créer les labels B et C déplaçables
    const labelB = board.create('text', [
      () => labelBHandle.X(),
      () => labelBHandle.Y(),
      'B'
    ], {
      anchorX: 'middle',
      anchorY: 'middle',
      fontSize: getGlobalFontSize(),
      fixed: false
    });
    
    const labelC = board.create('text', [
      () => labelCHandle.X(),
      () => labelCHandle.Y(),
      'C'
    ], {
      anchorX: 'middle',
      anchorY: 'middle',
      fontSize: getGlobalFontSize(),
      fixed: false
    });
    
    // Ajouter les handles et labels aux arrays locaux
    newHandles.push(labelBHandle, labelCHandle);
    newTexts.push(labelB, labelC);

    const newDiameterSegment = board.create('segment', [B, C], {
      strokeColor: 'black',
      strokeWidth: 1.4,
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

  // ✅ SECTION 4 : MISE À JOUR DES ARRAYS GLOBAUX À LA FIN
  setLabelHandles(newHandles);
  setTexts(newTexts);
  setLabelTexts([labelO]); // Le label O est toujours présent
  
  // ✅ SECTION 5 : MISE À JOUR FINALE
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
  
  // ✅ Nettoyer uniquement les marqueurs d'angles droits à l'intersection
  intersectionRightAngleMarkers.forEach(m => { 
    try { board.removeObject(m); } catch (e) {} 
  });
  setIntersectionRightAngleMarkers([]);

  // ✅ Nettoyer les anciens handles et labels (y compris les labels de centre de polygone)
  lengthHandles.forEach(h => {
    if (h && h.elType === 'point') {
      // Supprimer tous les labels texte attachés à ce handle
      board.objectsList.forEach(obj => {
        if (obj.elType === 'text') {
          const coords = obj.coords;
          if (coords && typeof coords.usrCoords[1] === 'function') {
            // C'est un label attaché à un handle, le supprimer
            try { board.removeObject(obj); } catch (e) {}
          }
        }
      });
      try { board.removeObject(h); } catch (e) {}
    }
  });
  setLengthHandles([]);

  // Vérifier si on doit afficher les diagonales
  const show = document.getElementById('toggleDiagonals')?.checked;
  const intersectionGroup = document.getElementById('intersectionGroup');
  
  if (!show || !points || points.length < 4) {
    // Masquer l'option d'intersection si pas de diagonales
    if (intersectionGroup) intersectionGroup.style.display = 'none';
    return;
  }

  const n = points.length;
  
  // QUADRILATÈRE (4 sommets) : 2 diagonales avec intersection
  if (n === 4) {
    // ✅ AFFICHER l'option d'intersection quand les diagonales sont cochées
    if (intersectionGroup) {
      intersectionGroup.style.display = 'block';
      // ✅ Réafficher l'option angle droit pour les quadrilatères
      const angleCheckbox = document.getElementById('toggleIntersectionRightAngle');
      if (angleCheckbox && angleCheckbox.parentElement) {
        angleCheckbox.parentElement.style.display = 'flex';
      }
    }

    console.log('Création diagonales pour quadrilatère avec', points.length, 'points');

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
    
    // ✅ CRÉER L'ANGLE DROIT À L'INTERSECTION (si demandé et si perpendiculaire)
    const showIntersectionRightAngle = document.getElementById('toggleIntersectionRightAngle')?.checked;
    if (showIntersectionRightAngle) {
      createIntersectionRightAngle();
    }
  }
  // POLYGONE RÉGULIER avec nombre pair de sommets : diagonales passant par le centre
  else if (n >= 5 && n % 2 === 0) {
    // Afficher l'option d'intersection (label uniquement, pas d'angle droit)
    if (intersectionGroup) {
      intersectionGroup.style.display = 'block';
      // Masquer l'option angle droit (pas applicable pour polygones réguliers)
      const angleCheckbox = document.getElementById('toggleIntersectionRightAngle');
      if (angleCheckbox && angleCheckbox.parentElement) {
        angleCheckbox.parentElement.style.display = 'none';
      }
    }

    console.log('Création diagonales pour polygone régulier à', n, 'sommets');

    const newDiagonals = [];
    // Créer n/2 diagonales reliant les sommets opposés
    for (let i = 0; i < n / 2; i++) {
      const diag = board.create('segment', [points[i], points[i + n / 2]], {
        strokeColor: 'black',
        strokeWidth: 1,
        dash: 0,
        fixed: true,
        withLabel: false
      });
      newDiagonals.push(diag);
    }

    setDiagonals(newDiagonals);
    console.log(`✅ ${n / 2} diagonales créées pour polygone régulier`);
    
    // ✅ CRÉER LE LABEL D'INTERSECTION (si demandé)
    const showIntersectionLabel = document.getElementById('toggleIntersectionLabel')?.checked;
    if (showIntersectionLabel) {
      createPolygonCenterLabel();
    }
  }
  else {
    // Polygone avec nombre impair de sommets : pas de diagonales passant par le centre
    if (intersectionGroup) intersectionGroup.style.display = 'none';
    console.log('⚠️ Diagonales non supportées pour ce type de polygone');
    return;
  }
  
  // ✅ Remettre à jour les marqueurs d'angles droits réguliers si l'option est active
  const showRightAngles = document.getElementById('toggleRightAngles')?.checked;
  if (showRightAngles) {
    updateRightAngleMarkers(true);
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
    fontSize: getGlobalFontSize(),
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

// ✅ FONCTION POUR CRÉER LE LABEL DU CENTRE D'UN POLYGONE RÉGULIER
function createPolygonCenterLabel() {
  if (!points || points.length < 3) {
    console.warn('⚠️ Pas assez de points pour créer un label de centre');
    return;
  }

  // ✅ Utiliser le même input que pour les quadrilatères
  const labelInput = document.getElementById('intersectionTextInput');
  const labelText = labelInput ? labelInput.value.trim() || 'I' : 'I';
  
  // Calculer le centre géométrique du polygone
  const center = calculatePolygonCenter();
  
  if (!center) {
    console.warn('⚠️ Impossible de calculer le centre du polygone');
    return;
  }

  console.log(`📍 Centre du polygone calculé: (${center.x.toFixed(2)}, ${center.y.toFixed(2)})`);

  // Créer un handle invisible au centre (avec petit décalage)
  const centerHandle = board.create('point', [center.x + 0.2, center.y + 0.2], {
    name: '',
    size: 6,
    strokeOpacity: 0,
    fillOpacity: 0,
    fixed: false,
    highlight: false,
    showInfobox: false
  });

  // Point de calcul du centre (invisible)
  const centerPoint = board.create('point', [center.x, center.y], {
    visible: false,
    fixed: true,
    name: ''
  });
  setIntersectionPoint(centerPoint);

  // Créer le label attaché au handle
  const centerLabel = board.create('text', [
    () => centerHandle.X(),
    () => centerHandle.Y(),
    labelText
  ], {
    fontSize: getGlobalFontSize(),
    color: '#000',
    anchorX: 'middle',
    anchorY: 'middle',
    fixed: false,
    highlight: false
  });

  // ✅ Stocker le label pour pouvoir le mettre à jour
  setIntersectionLabel(centerLabel);

  // Rendre le label déplaçable
  try {
    if (centerHandle.rendNode) {
      centerHandle.rendNode.style.cursor = 'move';
    }
    
    if (centerLabel.rendNode) {
      centerLabel.rendNode.style.cursor = 'move';
      
      centerLabel.rendNode.addEventListener('pointerdown', function (ev) {
        ev.stopPropagation();
        ev.preventDefault();
        
        const start = board.getUsrCoordsOfMouse(ev);
        
        function onMove(e) {
          const pos = board.getUsrCoordsOfMouse(e);
          const dx = pos[0] - start[0];
          const dy = pos[1] - start[1];
          
          try {
            centerHandle.moveTo([centerHandle.X() + dx, centerHandle.Y() + dy], 0);
          } catch (err) {
            try {
              centerHandle.setPosition(JXG.COORDS_BY_USER, [centerHandle.X() + dx, centerHandle.Y() + dy]);
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
    console.warn('⚠️ Impossible de configurer le drag and drop pour le label du centre:', e);
  }
  
  lengthHandles.push(centerHandle);
  
  console.log(`✅ Label du centre du polygone créé: "${labelText}" à (${center.x.toFixed(2)}, ${center.y.toFixed(2)})`);
}

// ✅ FONCTION POUR CALCULER LE CENTRE GÉOMÉTRIQUE D'UN POLYGONE
function calculatePolygonCenter() {
  if (!points || points.length < 3) return null;
  
  let sumX = 0, sumY = 0;
  
  for (let i = 0; i < points.length; i++) {
    sumX += points[i].X();
    sumY += points[i].Y();
  }
  
  return {
    x: sumX / points.length,
    y: sumY / points.length
  };
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

// ✅ FONCTION POUR VÉRIFIER SI LES DIAGONALES SONT PERPENDICULAIRES
function areDiagonalsPerpendicular() {
  if (!points || points.length !== 4) return false;
  
  const A = points[0];
  const C = points[2];
  const B = points[1];
  const D = points[3];
  
  // Vecteurs directeurs des diagonales AC et BD
  const v1x = C.X() - A.X();
  const v1y = C.Y() - A.Y();
  const v2x = D.X() - B.X();
  const v2y = D.Y() - B.Y();
  
  // Produit scalaire
  const dotProduct = v1x * v2x + v1y * v2y;
  
  // Longueurs des vecteurs
  const len1 = Math.hypot(v1x, v1y);
  const len2 = Math.hypot(v2x, v2y);
  
  if (len1 === 0 || len2 === 0) return false;
  
  // Cosinus de l'angle
  const cosAngle = dotProduct / (len1 * len2);
  
  // Tolérance pour considérer l'angle comme droit (90°)
  const tolerance = 0.05; // ~2.8 degrés
  
  return Math.abs(cosAngle) < tolerance;
}

// ✅ FONCTION : Créer l'angle droit à l'intersection des diagonales
function createIntersectionRightAngle() {
  if (!points || points.length !== 4) return;
  
  // Vérifier si les diagonales sont perpendiculaires
  if (!areDiagonalsPerpendicular()) {
    console.log('ℹ️ Les diagonales ne sont pas perpendiculaires, pas d\'angle droit à afficher');
    return;
  }
  
  // Taille du marqueur d'angle droit
  const cornerSize = 0.3;
  
  // ✅ Utiliser des fonctions pour que le marqueur suive les points en temps réel
  const A = points[0];
  const C = points[2];
  const B = points[1];
  const D = points[3];
  
  // Créer les deux segments du marqueur d'angle droit avec des fonctions dynamiques
  const seg1 = board.create('segment', [
    () => {
      // Recalculer l'intersection en temps réel
      const intersection = calculateDiagonalsIntersection();
      if (!intersection) return [0, 0];
      
      const v1x = C.X() - A.X();
      const v1y = C.Y() - A.Y();
      const v2x = B.X() - intersection.x;
      const v2y = B.Y() - intersection.y;
      
      const len1 = Math.hypot(v1x, v1y);
      const len2 = Math.hypot(v2x, v2y);
      
      if (len1 === 0 || len2 === 0) return [intersection.x, intersection.y];
      
      const u1x = v1x / len1;
      const u1y = v1y / len1;
      
      const p1x = intersection.x + u1x * cornerSize;
      const p1y = intersection.y + u1y * cornerSize;
      
      return [p1x, p1y];
    },
    () => {
      const intersection = calculateDiagonalsIntersection();
      if (!intersection) return [0, 0];
      
      const v1x = C.X() - A.X();
      const v1y = C.Y() - A.Y();
      const v2x = B.X() - intersection.x;
      const v2y = B.Y() - intersection.y;
      
      const len1 = Math.hypot(v1x, v1y);
      const len2 = Math.hypot(v2x, v2y);
      
      if (len1 === 0 || len2 === 0) return [intersection.x, intersection.y];
      
      const u1x = v1x / len1;
      const u1y = v1y / len1;
      const u2x = v2x / len2;
      const u2y = v2y / len2;
      
      const p1x = intersection.x + u1x * cornerSize;
      const p1y = intersection.y + u1y * cornerSize;
      const p3x = p1x + u2x * cornerSize;
      const p3y = p1y + u2y * cornerSize;
      
      return [p3x, p3y];
    }
  ], {
    strokeColor: 'black',
    strokeWidth: 1.5,
    fixed: true,
    highlight: false
  });
  
  const seg2 = board.create('segment', [
    () => {
      const intersection = calculateDiagonalsIntersection();
      if (!intersection) return [0, 0];
      
      const v1x = C.X() - A.X();
      const v1y = C.Y() - A.Y();
      const v2x = B.X() - intersection.x;
      const v2y = B.Y() - intersection.y;
      
      const len1 = Math.hypot(v1x, v1y);
      const len2 = Math.hypot(v2x, v2y);
      
      if (len1 === 0 || len2 === 0) return [intersection.x, intersection.y];
      
      const u1x = v1x / len1;
      const u1y = v1y / len1;
      const u2x = v2x / len2;
      const u2y = v2y / len2;
      
      const p1x = intersection.x + u1x * cornerSize;
      const p1y = intersection.y + u1y * cornerSize;
      const p3x = p1x + u2x * cornerSize;
      const p3y = p1y + u2y * cornerSize;
      
      return [p3x, p3y];
    },
    () => {
      const intersection = calculateDiagonalsIntersection();
      if (!intersection) return [0, 0];
      
      const v2x = B.X() - intersection.x;
      const v2y = B.Y() - intersection.y;
      
      const len2 = Math.hypot(v2x, v2y);
      
      if (len2 === 0) return [intersection.x, intersection.y];
      
      const u2x = v2x / len2;
      const u2y = v2y / len2;
      
      const p2x = intersection.x + u2x * cornerSize;
      const p2y = intersection.y + u2y * cornerSize;
      
      return [p2x, p2y];
    }
  ], {
    strokeColor: 'black',
    strokeWidth: 1.5,
    fixed: true,
    highlight: false
  });
  
  // Ajouter aux marqueurs d'angles droits à l'intersection pour le nettoyage
  intersectionRightAngleMarkers.push(seg1, seg2);
  
  const intersection = calculateDiagonalsIntersection();
  if (intersection) {
    console.log(`✅ Angle droit créé à l'intersection des diagonales à (${intersection.x.toFixed(2)}, ${intersection.y.toFixed(2)})`);
  }
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
  
  // ✅ Utiliser des fonctions pour que les marqueurs suivent les points en temps réel
  const seg1 = board.create('segment', [
    () => {
      const v1x = prevPoint.X() - vertex.X();
      const v1y = prevPoint.Y() - vertex.Y();
      const v2x = nextPoint.X() - vertex.X();
      const v2y = nextPoint.Y() - vertex.Y();
      
      const len1 = Math.hypot(v1x, v1y);
      const len2 = Math.hypot(v2x, v2y);
      
      if (len1 === 0 || len2 === 0) return [vertex.X(), vertex.Y()];
      
      const u1x = v1x / len1;
      const u1y = v1y / len1;
      const u2x = v2x / len2;
      const u2y = v2y / len2;
      
      const cornerSize = Math.min(size, Math.min(len1, len2) * 0.3);
      
      const p1x = vertex.X() + u1x * cornerSize;
      const p1y = vertex.Y() + u1y * cornerSize;
      
      return [p1x, p1y];
    },
    () => {
      const v1x = prevPoint.X() - vertex.X();
      const v1y = prevPoint.Y() - vertex.Y();
      const v2x = nextPoint.X() - vertex.X();
      const v2y = nextPoint.Y() - vertex.Y();
      
      const len1 = Math.hypot(v1x, v1y);
      const len2 = Math.hypot(v2x, v2y);
      
      if (len1 === 0 || len2 === 0) return [vertex.X(), vertex.Y()];
      
      const u1x = v1x / len1;
      const u1y = v1y / len1;
      const u2x = v2x / len2;
      const u2y = v2y / len2;
      
      const cornerSize = Math.min(size, Math.min(len1, len2) * 0.3);
      
      const p1x = vertex.X() + u1x * cornerSize;
      const p1y = vertex.Y() + u1y * cornerSize;
      const p3x = p1x + u2x * cornerSize;
      const p3y = p1y + u2y * cornerSize;
      
      return [p3x, p3y];
    }
  ], {
    strokeColor: 'black',
    strokeWidth: 1.5,
    fixed: true,
    highlight: false
  });
  
  const seg2 = board.create('segment', [
    () => {
      const v1x = prevPoint.X() - vertex.X();
      const v1y = prevPoint.Y() - vertex.Y();
      const v2x = nextPoint.X() - vertex.X();
      const v2y = nextPoint.Y() - vertex.Y();
      
      const len1 = Math.hypot(v1x, v1y);
      const len2 = Math.hypot(v2x, v2y);
      
      if (len1 === 0 || len2 === 0) return [vertex.X(), vertex.Y()];
      
      const u1x = v1x / len1;
      const u1y = v1y / len1;
      const u2x = v2x / len2;
      const u2y = v2y / len2;
      
      const cornerSize = Math.min(size, Math.min(len1, len2) * 0.3);
      
      const p1x = vertex.X() + u1x * cornerSize;
      const p1y = vertex.Y() + u1y * cornerSize;
      const p3x = p1x + u2x * cornerSize;
      const p3y = p1y + u2y * cornerSize;
      
      return [p3x, p3y];
    },
    () => {
      const v1x = prevPoint.X() - vertex.X();
      const v1y = prevPoint.Y() - vertex.Y();
      const v2x = nextPoint.X() - vertex.X();
      const v2y = nextPoint.Y() - vertex.Y();
      
      const len1 = Math.hypot(v1x, v1y);
      const len2 = Math.hypot(v2x, v2y);
      
      if (len1 === 0 || len2 === 0) return [vertex.X(), vertex.Y()];
      
      const u1x = v1x / len1;
      const u1y = v1y / len1;
      const u2x = v2x / len2;
      const u2y = v2y / len2;
      
      const cornerSize = Math.min(size, Math.min(len1, len2) * 0.3);
      
      const p2x = vertex.X() + u2x * cornerSize;
      const p2y = vertex.Y() + u2y * cornerSize;
      
      return [p2x, p2y];
    }
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

function createEqualAngleMarkersFromHandler(equalAnglesGroups) {
  if (!equalAnglesGroups || equalAnglesGroups.length === 0) return;
  
  const n = points.length;
  const baseRadius = 0.42;
  
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
  
  function normAng(a) { 
    while (a <= -Math.PI) a += 2*Math.PI; 
    while (a > Math.PI) a -= 2*Math.PI; 
    return a; 
  }
  
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
    angleMarkers.push(seg);
  }
  
  const polyCoords = points.map(p => [p.X(), p.Y()]);
  
  // Parcourir chaque groupe d'angles égaux
  equalAnglesGroups.forEach(group => {
    const { angles: angleIndices, markCount } = group;
    
    angleIndices.forEach(idx => {
      const B = points[idx];
      const A = points[(idx - 1 + n) % n];
      const C = points[(idx + 1) % n];
      
      if (!A || !B || !C) return;
      
      const v1x = A.X() - B.X(), v1y = A.Y() - B.Y();
      const v2x = C.X() - B.X(), v2y = C.Y() - B.Y();
      const l1 = Math.hypot(v1x, v1y), l2 = Math.hypot(v2x, v2y);
      if (l1 === 0 || l2 === 0) return;
      
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
      
      // Créer l'arc de cercle
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
      
      // Ajouter les marques selon markCount
      const bisect = normAng(aStart + aDelta / 2);
      const tickLen = Math.min(0.28, radius * 1.1);
      const lateralSpacing = Math.min(0.12, radius * 0.6);
      
      if (markCount === 1) {
        createPerpTick(B, bisect, radius, tickLen, 0);
      } else if (markCount === 2) {
        createPerpTick(B, bisect, radius, tickLen, -lateralSpacing / 2);
        createPerpTick(B, bisect, radius, tickLen, +lateralSpacing / 2);
      } else if (markCount === 3) {
        createPerpTick(B, bisect, radius, tickLen, -lateralSpacing);
        createPerpTick(B, bisect, radius, tickLen, 0);
        createPerpTick(B, bisect, radius, tickLen, +lateralSpacing);
      }
    });
  });
  
  console.log(`✅ ${angleMarkers.length} marqueurs d'angles égaux créés depuis le handler`);
}

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
  
  // Essayer d'utiliser le handler si disponible
  const handler = getCurrentFigureHandler();
  if (handler && typeof handler.getEqualAngles === 'function') {
    const equalAnglesGroups = handler.getEqualAngles();
    if (equalAnglesGroups && equalAnglesGroups.length > 0) {
      console.log(`🎯 Utilisation du handler ${handler.constructor.name} pour angles égaux:`, equalAnglesGroups);
      createEqualAngleMarkersFromHandler(equalAnglesGroups);
      board.update();
      return;
    }
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
  
  // Triangle helper - Détection plus précise avec le théorème de Pythagore
  function isRightTriangle() {
    if (!points || points.length !== 3) return { isRight: false, rightAngleIndex: -1 };
    
    // Calculer les longueurs des trois côtés
    const sides = [
      { length: Math.hypot(points[1].X() - points[0].X(), points[1].Y() - points[0].Y()), opposite: 2 },
      { length: Math.hypot(points[2].X() - points[1].X(), points[2].Y() - points[1].Y()), opposite: 0 },
      { length: Math.hypot(points[0].X() - points[2].X(), points[0].Y() - points[2].Y()), opposite: 1 }
    ];
    
    // Trier les côtés par longueur
    sides.sort((a, b) => a.length - b.length);
    
    const a = sides[0].length;
    const b = sides[1].length;
    const c = sides[2].length; // hypoténuse (le plus long)
    
    // Théorème de Pythagore : a² + b² = c²
    // Tolérance relative de 1% pour tenir compte des erreurs de calcul
    const tolerance = 0.01 * (c * c);
    const pythagorasCheck = Math.abs(a * a + b * b - c * c);
    
    if (pythagorasCheck < tolerance) {
      // C'est un triangle rectangle, l'angle droit est au sommet opposé à l'hypoténuse
      return { isRight: true, rightAngleIndex: sides[2].opposite };
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
  
  // Afficher/masquer l'option triangle semblable (uniquement pour les triangles)
  const similarTriangleCheckbox = document.getElementById('toggleSimilarTriangle');
  const similarTriangleLabel = document.getElementById('similarTriangleLabel');
  const similarTriangleGroup = document.getElementById('similarTriangleRatioGroup');
  
  if (points.length === 3) {
    // C'est un triangle, on montre l'option
    if (similarTriangleLabel) {
      similarTriangleLabel.style.display = 'block';
      // Si la checkbox est cochée, créer le triangle semblable
      if (similarTriangleCheckbox && similarTriangleCheckbox.checked) {
        const ratioSlider = document.getElementById('similarTriangleRatioSlider');
        const ratio = ratioSlider ? parseFloat(ratioSlider.value) : 2.0;
        setTimeout(() => createSimilarTriangle(ratio), 100);
      }
    }
  } else {
    // Ce n'est pas un triangle, on cache l'option
    if (similarTriangleLabel) {
      similarTriangleLabel.style.display = 'none';
      if (similarTriangleGroup) similarTriangleGroup.style.display = 'none';
      if (similarTriangleCheckbox) similarTriangleCheckbox.checked = false;
      // Nettoyer le triangle semblable s'il existe
      removeSimilarTriangle();
    }
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
      fontSize: getGlobalFontSize(),
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
