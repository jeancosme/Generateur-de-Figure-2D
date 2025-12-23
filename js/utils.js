/**
 * ============================================
 * UTILS.JS - Fonctions utilitaires
 * ============================================
 * 
 * Fonctions de parsing, calculs et utilitaires
 * sans dépendances complexes.
 */


// ==========================================
// EXTRACTION DE NOMBRES
// ==========================================

/**
 * Extrait un nombre d'une chaîne de texte
 * @param {string} text - Texte contenant le nombre
 * @param {number} defaultValue - Valeur par défaut si aucun nombre trouvé
 * @returns {number} Le nombre extrait ou la valeur par défaut
 */
function extractNumber(text, defaultValue = 1) {
  const match = text.match(/(\d+(?:[.,]\d+)?)/);
  if (!match) return defaultValue;
  return parseFloat(match[1].replace(',', '.'));
}

/**
 * Extrait deux nombres d'une chaîne de texte
 * @param {string} text - Texte contenant les nombres
 * @param {Array} defaultValues - Valeurs par défaut [a, b]
 * @returns {Array} Tableau de 2 nombres
 */
function extractTwoNumbers(text, defaultValues = [3, 5]) {
  const matches = text.match(/(\d+(?:[.,]\d+)?)/g);
  if (!matches || matches.length < 2) return defaultValues;
  return matches.slice(0, 2).map(n => parseFloat(n.replace(',', '.')));
}

/**
 * Extrait trois nombres d'une chaîne de texte
 * @param {string} text - Texte contenant les nombres
 * @param {Array} defaultValues - Valeurs par défaut [a, b, c]
 * @returns {Array} Tableau de 3 nombres
 */
function extractThreeNumbers(text, defaultValues = [3, 4, 5]) {
  const matches = text.match(/(\d+(?:[.,]\d+)?)/g);
  
  if (!matches || matches.length < 3) {
    console.warn(`⚠️ Moins de 3 nombres trouvés dans "${text}", utilisation des valeurs par défaut`);
    return defaultValues;
  }
  
  return matches.slice(0, 3).map(n => parseFloat(n.replace(',', '.')));
}

// ==========================================
// GESTION DES LABELS
// ==========================================

/**
 * Retourne le label pour un point à l'index donné
 * @param {number} index - Index du point
 * @returns {string} Label du point (A, B, C, etc.)
 */
function getLabel(index) {
  const defaultLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
  
  // ✅ CORRECTION : Parser les labels personnalisés caractère par caractère
  if (customLabels && customLabels.length > 0) {
    // Si l'utilisateur a tapé une seule chaîne comme "BDFG"
    if (customLabels.length === 1 && customLabels[0].length > 1) {
      const singleString = customLabels[0];
      
      // ✅ NOUVEAU : Séparer automatiquement les lettres
      const individualLetters = singleString.split('');
      
      if (index < individualLetters.length) {
        return individualLetters[index];
      }
    }
    // Si l'utilisateur a tapé "B,D,F,G" ou "B D F G" (séparés)
    else if (index < customLabels.length) {
      return customLabels[index];
    }
  }
  
  // Fallback sur les labels par défaut
  return defaultLabels[index] || `P${index}`;
}

// ==========================================
// PERFORMANCE MONITORING
// ==========================================

/**
 * Mesure le temps d'exécution d'une fonction
 * @param {string} functionName - Nom de la fonction
 * @param {Function} fn - Fonction à exécuter
 * @returns {*} Résultat de la fonction
 */
function measurePerformance(functionName, fn) {
  const startTime = performance.now();
  const result = fn();
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  if (duration > 10) { // Seulement si > 10ms
    console.log(`⏱️ ${functionName}: ${duration.toFixed(2)}ms`);
  }
  
  return result;
}
