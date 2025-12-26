/**
 * Module de gestion de l'aimantation magnétique pour le Mode Créateur
 * Permet de fusionner automatiquement les figures lorsque leurs segments se rapprochent
 */

// Variables globales pour le système d'aimantation
const SNAP_DISTANCE = 0.5; // Distance en unités pour l'aimantation
let magneticIndicators = []; // Indicateurs visuels temporaires

/**
 * Détecte les paires de points proches entre la figure en mouvement et les autres
 * @param {Array} movingPoints - Points de la figure en déplacement
 * @returns {Array} - Liste des paires de points à aimanter
 */
function detectMagneticPoints(movingPoints) {
  const pairs = [];
  
  // Ne PAS filtrer sur visible car tous nos points sont créés avec visible:false
  const allPoints = board.objectsList.filter(obj => 
    obj.elType === 'point' &&
    !movingPoints.includes(obj) // Exclure les points de la figure en mouvement
  );
  
  movingPoints.forEach(movingPoint => {
    allPoints.forEach(otherPoint => {
      const dist = Math.sqrt(
        Math.pow(movingPoint.X() - otherPoint.X(), 2) + 
        Math.pow(movingPoint.Y() - otherPoint.Y(), 2)
      );
      
      if (dist < SNAP_DISTANCE && dist > 0.01) {
        pairs.push({
          moving: movingPoint,
          target: otherPoint,
          distance: dist
        });
      }
    });
  });
  
  return pairs;
}

/**
 * Affiche les indicateurs visuels d'aimantation
 * @param {Array} pairs - Liste des paires de points proches
 */
function showMagneticIndicators(pairs) {
  clearMagneticIndicators();
  
  pairs.forEach(pair => {
    const indicator = board.create('circle', [[pair.target.X(), pair.target.Y()], 0.3], {
      strokeColor: '#00ff00',
      strokeWidth: 3,
      fillColor: 'rgba(0, 255, 0, 0.1)',
      fixed: true,
      highlight: false,
      name: '',
      withLabel: false
    });
    
    magneticIndicators.push(indicator);
  });
  
  board.update();
}

/**
 * Nettoie les indicateurs visuels d'aimantation
 */
function clearMagneticIndicators() {
  magneticIndicators.forEach(indicator => {
    try {
      board.removeObject(indicator);
    } catch (e) {
      // Ignore les erreurs si l'objet est déjà supprimé
    }
  });
  magneticIndicators = [];
}

/**
 * Applique l'aimantation finale (fusion des points)
 * @param {Array} pairs - Liste des paires de points à fusionner
 * @param {Array} figurePoints - TOUS les points de la figure en mouvement
 * @param {Array} figureTexts - Textes de la figure en mouvement
 */
function applyMagneticSnap(pairs, figurePoints, figureTexts) {
  if (pairs.length === 0) return;
  
  // 1. CALCULER LE DÉPLACEMENT MOYEN
  let totalDx = 0, totalDy = 0;
  
  pairs.forEach(pair => {
    totalDx += pair.target.X() - pair.moving.X();
    totalDy += pair.target.Y() - pair.moving.Y();
  });
  
  const avgDx = totalDx / pairs.length;
  const avgDy = totalDy / pairs.length;
  
  // 2. DÉPLACER TOUS LES POINTS DE LA FIGURE
  figurePoints.forEach(point => {
    try {
      point.moveTo([point.X() + avgDx, point.Y() + avgDy], 0);
    } catch (e) {
      console.warn('Erreur lors du déplacement:', e);
    }
  });
  
  // 3. DÉPLACER LES TEXTES
  if (figureTexts && figureTexts.length > 0) {
    figureTexts.forEach(text => {
      try {
        if (text.setPosition) {
          text.setPosition(JXG.COORDS_BY_USER, [text.X() + avgDx, text.Y() + avgDy]);
        }
      } catch (e) {}
    });
  }
  
  board.update();
  
  // 4. RENOMMER TOUS LES POINTS AVEC UNE NOUVELLE SÉQUENCE
  // Nombre de points fusionnés = nombre de paires
  renumberAllLabels(pairs.length);
}

/**
 * Renumérote tous les labels du board en fonction du nombre de points fusionnés
 * @param {Number} fusedPairsCount - Nombre de paires de points fusionnés
 */
function renumberAllLabels(fusedPairsCount) {
  console.log('═══════════════════════════════════════');
  console.log('📊 RENOMMAGE DES LABELS');
  
  // ÉTAPE 1: Trouver tous les POLYGONES (figures)
  const allPolygons = board.objectsList.filter(obj => obj.elType === 'polygon');
  console.log(`🔷 Total polygones: ${allPolygons.length}`);
  
  // ÉTAPE 2: Collecter tous les points UNIQUES des polygones avec leur polygone d'origine
  const pointsWithPolygon = [];
  allPolygons.forEach(poly => {
    if (poly.vertices) {
      poly.vertices.forEach(point => {
        // Vérifier si ce point n'est pas déjà dans la liste (points fusionnés)
        const duplicate = pointsWithPolygon.find(p => 
          Math.abs(p.point.X() - point.X()) < 0.1 && 
          Math.abs(p.point.Y() - point.Y()) < 0.1
        );
        if (!duplicate) {
          pointsWithPolygon.push({point: point, polygon: poly});
        }
      });
    }
  });
  
  console.log(`📍 Points uniques des polygones: ${pointsWithPolygon.length}`);
  
  // ÉTAPE 3: Supprimer TOUS les anciens labels
  const allTexts = board.objectsList.filter(obj => obj.elType === 'text');
  console.log(`🗑️  Suppression de ${allTexts.length} anciens labels`);
  allTexts.forEach(text => {
    try {
      board.removeObject(text);
    } catch (e) {}
  });
  
  // ÉTAPE 4: Générer les nouveaux labels
  const uniquePointsCount = pointsWithPolygon.length;
  const newLabels = [];
  for (let i = 0; i < uniquePointsCount; i++) {
    newLabels.push(String.fromCharCode(65 + i)); // A, B, C, etc.
  }
  console.log(`🔤 Labels à créer: ${newLabels.join('')} (${newLabels.length} lettres)`);
  
  // ÉTAPE 5: Trier les points de gauche à droite, puis de haut en bas
  pointsWithPolygon.sort((a, b) => {
    const dx = a.point.X() - b.point.X();
    if (Math.abs(dx) > 0.5) return dx;
    return b.point.Y() - a.point.Y();
  });
  
  // ÉTAPE 6: Créer des labels DÉPLAÇABLES pour chaque point unique
  const newTextsByPolygon = new Map();
  const createdLabels = []; // Pour éviter les doublons
  
  pointsWithPolygon.forEach((item, index) => {
    if (index < newLabels.length) {
      const point = item.point;
      const poly = item.polygon;
      
      // Créer le label texte DÉPLAÇABLE directement
      const label = board.create('text', [
        point.X() - 0.3, 
        point.Y() + 0.3,
        newLabels[index]
      ], {
        fontSize: getGlobalFontSize(),
        anchorX: 'middle',
        anchorY: 'middle',
        fixed: false,  // Déplaçable
        highlight: true,
        cssClass: 'draggable-label',
        highlightStrokeColor: '#3498db',
        highlightStrokeWidth: 2
      });
      
      // Associer le label au polygone
      if (!newTextsByPolygon.has(poly)) {
        newTextsByPolygon.set(poly, []);
      }
      newTextsByPolygon.get(poly).push(label);
      createdLabels.push(label);
      
      console.log(`✏️  Label déplaçable "${newLabels[index]}" créé à (${point.X().toFixed(2)}, ${point.Y().toFixed(2)})`);
    }
  });
  
  // ÉTAPE 7: Mettre à jour les tableaux figureTexts de chaque polygone
  // (chercher dans les gestionnaires de drag attachés au polygone)
  allPolygons.forEach(poly => {
    const newTexts = newTextsByPolygon.get(poly) || [];
    // Stocker les nouveaux textes sur le polygone pour les prochains drags
    poly._figureTexts = newTexts;
  });
  
  console.log(`✅ Résultat final: ${uniquePointsCount} points → ${newLabels.join('')}`);
  console.log('═══════════════════════════════════════');
  
  board.update();
}

/**
 * Récupère le label d'un point
 * @param {Object} point - Point JSXGraph
 * @param {Array} limitToTexts - Limiter la recherche à certains textes (optionnel)
 * @returns {String} - Le label du point ou null
 */
function getPointLabel(point, limitToTexts = null) {
  const textsToSearch = limitToTexts || board.objectsList.filter(obj => obj.elType === 'text');
  let closestText = null;
  let minDist = Infinity;
  
  textsToSearch.forEach(text => {
    if (!text || !text.X || !text.Y) return;
    
    const dist = Math.sqrt(
      Math.pow(point.X() - text.X(), 2) + 
      Math.pow(point.Y() - text.Y(), 2)
    );
    
    if (dist < minDist && dist < 0.8) {
      minDist = dist;
      closestText = text;
    }
  });
  
  return closestText ? closestText.plaintext : null;
}

console.log('🧲 Module d\'aimantation magnétique chargé');
