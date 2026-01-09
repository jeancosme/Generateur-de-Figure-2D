/**
 * ============================================
 * EFFECTS.JS - Effets visuels
 * ============================================
 * 
 * Gestion de l'effet "main levée" pour les figures géométriques
 */


// ==========================================
// TOGGLE EFFET MAIN LEVÉE
// ==========================================

function toggleHandDrawnEffect(enabled) {
  if (typeof enabled === 'object' && enabled !== null && 'target' in enabled) {
    enabled = !!enabled.target.checked;
  } else {
    enabled = !!enabled;
  }
  
  setIsHandDrawnMode(enabled);
  
  if (enabled) {
    applyHandDrawnEffect();
  } else {
    removeHandDrawnEffect();
  }
  
  board.update();
}

// ==========================================
// APPLIQUER L'EFFET
// ==========================================

function applyHandDrawnEffect() {
  if (!points || points.length === 0) return;
  
  // Nettoyer les anciens éléments main levée
  removeHandDrawnElements();
  
  // ✅ CORRECTION : Cacher TOUS les éléments de la figure originale
  
  // 1. Cacher le polygone s'il existe
  if (polygon && !originalPolygon) {
    setOriginalPolygon(polygon);
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

// ==========================================
// SUPPRIMER L'EFFET
// ==========================================

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
    
    setPolygon(originalPolygon);
    setOriginalPolygon(null);
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

// ==========================================
// NETTOYAGE
// ==========================================

function removeHandDrawnElements() {
  handDrawnElements.forEach(element => {
    try { board.removeObject(element); } catch (e) {}
  });
  setHandDrawnElements([]);
}

// ==========================================
// CRÉATION POLYGONE MAIN LEVÉE
// ==========================================

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

// ==========================================
// CRÉATION SEGMENT MAIN LEVÉE
// ==========================================

function createHandDrawnSegment(startPoint, endPoint) {
  const numPoints = 60; // Plus de points pour plus de détails
  
  // ✅ Récupérer l'intensité depuis le curseur (0-100)
  const intensitySlider = document.getElementById('handDrawnIntensitySlider');
  const intensityPercent = intensitySlider ? parseInt(intensitySlider.value) : 50;
  const intensityFactor = intensityPercent / 50; // 0-2 (50% = facteur 1)
  const baseIntensity = 0.06 * intensityFactor; // Intensité ajustable
  
  // Calculer la longueur pour adapter l'intensité
  const segmentLength = Math.hypot(endPoint.X() - startPoint.X(), endPoint.Y() - startPoint.Y());
  const lengthFactor = Math.min(1.5, segmentLength / 2.5); // ✅ Facteur de longueur plus généreux
  
  // Générer des points de contrôle pour créer des ondulations naturelles plus marquées
  const controlPoints = [];
  for (let i = 0; i <= 10; i++) { // ✅ Plus de points de contrôle
    const t = i / 10;
    // ✅ Ondulations plus marquées avec plusieurs fréquences (ajustées par l'intensité)
    const wave1 = Math.sin(t * Math.PI * 3.2) * 0.035 * lengthFactor * intensityFactor; // Vague principale
    const wave2 = Math.sin(t * Math.PI * 6.5) * 0.020 * lengthFactor * intensityFactor; // Vague secondaire
    const wave3 = Math.sin(t * Math.PI * 12.8) * 0.010 * lengthFactor * intensityFactor; // Micro-ondulations
    const noise = (Math.random() - 0.5) * 0.025 * lengthFactor * intensityFactor; // Bruit ajusté
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
      
      // ✅ Tremblement plus intense avec variation continue (ajusté par l'intensité)
      const edgeFactor = Math.sin(t * Math.PI); // 0 aux bords, 1 au centre
      const continuousTremor = Math.sin(t * Math.PI * 8.5) * 0.015 * edgeFactor * lengthFactor * intensityFactor;
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
      const continuousTremor = Math.cos(t * Math.PI * 7.8) * 0.018 * edgeFactor * lengthFactor * intensityFactor; // Phase légèrement différente
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

// ==========================================
// CRÉATION CERCLE MAIN LEVÉE
// ==========================================

function createHandDrawnCircle() {
  if (!centerPoint || !circlePoint) return;
  
  // Cacher le cercle original
  if (circleObject) {
    circleObject.setAttribute({ visible: false });
  }
  
  // ✅ Récupérer l'intensité depuis le curseur
  const intensitySlider = document.getElementById('handDrawnIntensitySlider');
  const intensityPercent = intensitySlider ? parseInt(intensitySlider.value) : 50;
  const intensityFactor = intensityPercent / 50; // 0-2 (50% = facteur 1)
  
  const centerX = centerPoint.X();
  const centerY = centerPoint.Y();
  const radius = Math.hypot(circlePoint.X() - centerX, circlePoint.Y() - centerY);
  
  // ✅ Plus de sections pour plus de variation
  const numSections = 3; // Plus de sections
  const radiusVariations = [];
  
  for (let i = 0; i < numSections; i++) {
    // ✅ Variations plus marquées avec plusieurs harmoniques (ajustées par l'intensité)
    const angle = (i * Math.PI * 2) / numSections;
    const baseVariation1 = Math.sin(angle * 2.7) * 0.055 * intensityFactor; // Vague principale
    const baseVariation2 = Math.sin(angle * 5.3) * 0.032 * intensityFactor; // Vague secondaire
    const baseVariation3 = Math.sin(angle * 11.1) * 0.018 * intensityFactor; // Micro-variations
    const noise = (Math.random() - 0.5) * 0.040 * intensityFactor; // Bruit ajusté
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

// ==========================================
// VERSION MULTI-COUCHES (ALTERNATIVE)
// ==========================================

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

// ==========================================
// TRIANGLE SEMBLABLE
// ==========================================

/**
 * Crée un triangle semblable au triangle principal
 * @param {number} ratio - Rapport d'agrandissement (0.5 à 5)
 */
function createSimilarTriangle(ratio = 2.0) {
  // Vérifier qu'on a bien un triangle
  if (!points || points.length !== 3) {
    console.warn('⚠️ Triangle semblable : nécessite exactement 3 points');
    return;
  }
  
  // Nettoyer l'ancien triangle semblable s'il existe
  removeSimilarTriangle();
  
  console.log(`🔺 Création d'un triangle semblable avec ratio ${ratio}`);
  
  // Calculer le centre de gravité du triangle original
  const centerX = (points[0].X() + points[1].X() + points[2].X()) / 3;
  const centerY = (points[0].Y() + points[1].Y() + points[2].Y()) / 3;
  
  // Décalage pour positionner le triangle semblable à côté
  const offsetX = 5; // Décalage horizontal
  const offsetY = 0;
  
  // Créer les nouveaux points
  const newPoints = [];
  for (let i = 0; i < 3; i++) {
    const originalPoint = points[i];
    
    // Vecteur depuis le centre vers le point
    const dx = originalPoint.X() - centerX;
    const dy = originalPoint.Y() - centerY;
    
    // Appliquer le ratio et le décalage
    const newX = centerX + dx * ratio + offsetX;
    const newY = centerY + dy * ratio + offsetY;
    
    const newPoint = board.create('point', [newX, newY], {
      name: '',
      fixed: true,
      visible: false
    });
    
    newPoints.push(newPoint);
  }
  
  // Créer le polygone semblable
  const newPolygon = board.create('polygon', newPoints, {
    fillColor: 'transparent',
    strokeColor: '#0066cc',
    strokeWidth: 1,
    borders: {
      strokeColor: '#0066cc',
      strokeWidth: 1
    },
    fixed: true,
    hasInnerPoints: false
  });
  
  // Créer les labels des points
  const labelOffsets = [
    { dx: 0, dy: 0.4 },    // Point 0 : en haut
    { dx: -0.4, dy: -0.3 }, // Point 1 : en bas à gauche
    { dx: 0.4, dy: -0.3 }   // Point 2 : en bas à droite
  ];
  
  const newTexts = [];
  for (let i = 0; i < 3; i++) {
    const label = board.create('text', [
      newPoints[i].X() + labelOffsets[i].dx,
      newPoints[i].Y() + labelOffsets[i].dy,
      `${getLabel(i)}'`  // Ajouter un prime (') pour différencier
    ], {
      fontSize: getGlobalFontSize(),
      fixed: true
    });
    
    newTexts.push(label);
  }
  
  // Stocker dans les variables globales
  similarTriangle = newPolygon;
  similarTrianglePoints = newPoints;
  similarTriangleTexts = newTexts;
  isSimilarTriangleMode = true;
  
  console.log(`✅ Triangle semblable créé avec succès`);
  board.update();
}

/**
 * Supprime le triangle semblable
 */
function removeSimilarTriangle() {
  if (similarTriangle) {
    board.removeObject(similarTriangle);
    similarTriangle = null;
  }
  
  similarTrianglePoints.forEach(pt => {
    if (pt) board.removeObject(pt);
  });
  similarTrianglePoints = [];
  
  similarTriangleTexts.forEach(txt => {
    if (txt) board.removeObject(txt);
  });
  similarTriangleTexts = [];
  
  isSimilarTriangleMode = false;
  
  board.update();
}

/**
 * Met à jour le triangle semblable avec un nouveau ratio
 * @param {number} ratio - Nouveau rapport d'agrandissement
 */
function updateSimilarTriangle(ratio) {
  if (isSimilarTriangleMode) {
    createSimilarTriangle(ratio);
  }
}
