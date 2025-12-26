/**
 * ============================================
 * UI.JS - Interface utilisateur et génération
 * ============================================
 * 
 * Fonction principale generateFigure() et toutes les fonctions d'interface
 */




// ==========================================
// FONCTION PRINCIPALE : GÉNÉRATION DE FIGURE
// ==========================================

function generateFigure() {
  // ==========================================
  // 1. NETTOYAGE INITIAL
  // ==========================================
  
  // Nettoyer tous les éléments existants
  if (polygon) try { board.removeObject(polygon); } catch (e) {}
  if (centerPoint) try { board.removeObject(centerPoint); } catch (e) {}
  if (circlePoint) try { board.removeObject(circlePoint); } catch (e) {}
  if (circleObject) try { board.removeObject(circleObject); } catch (e) {}

  // Nettoyer les arrays d'éléments
  points.forEach(p => { try { board.removeObject(p); } catch (e) {} });
  texts.forEach(t => { try { board.removeObject(t); } catch (e) {} });
  rightAngleMarkers.forEach(m => { try { board.removeObject(m); } catch (e) {} });
  lengthLabels.forEach(l => { try { board.removeObject(l); } catch (e) {} });
  lengthHandles.forEach(h => { try { board.removeObject(h); } catch (e) {} });
  codingMarks.forEach(m => { try { board.removeObject(m); } catch (e) {} });
  codingSegments.forEach(s => { try { board.removeObject(s); } catch (e) {} });
  diagonals.forEach(d => { try { board.removeObject(d); } catch (e) {} });
  angleMarkers.forEach(m => { try { board.removeObject(m); } catch (e) {} });
  diameterPoints.forEach(p => { try { board.removeObject(p); } catch (e) {} });
  if (diameterSegment) try { board.removeObject(diameterSegment); } catch (e) {}
  if (radiusSegment) try { board.removeObject(radiusSegment); } catch (e) {}
  if (radiusLabel) try { board.removeObject(radiusLabel); } catch (e) {}
  if (intersectionLabel) try { board.removeObject(intersectionLabel); } catch (e) {}
  if (intersectionPoint) try { board.removeObject(intersectionPoint); } catch (e) {}

  // Reset des variables globales via config.js
  resetAllGlobalVariables();

  // ==========================================
  // 2. RÉCUPÉRATION DES DONNÉES UTILISATEUR
  // ==========================================
  
  const input = document.getElementById("promptInput").value.trim().toLowerCase();
  const labelInput = document.getElementById("labelInput")?.value.trim() || '';

  if (!input) {
    alert("Veuillez entrer une description de figure.");
    return;
  }

  console.log(`🎨 Génération de figure: "${input}"`);

  // Traitement des labels personnalisés
  if (labelInput) {
    const labels = labelInput.split(/[,\s]+/).filter(label => label.length > 0);
    setCustomLabels(labels);
    console.log(`🏷️ Labels personnalisés: [${labels.join(', ')}]`);
  }

  // ==========================================
  // 3. PARSING ET GÉNÉRATION DE LA FIGURE
  // ==========================================
  
  try {
    // CARRÉS
    if (input.includes("carré")) {
      const size = extractNumber(input, 4);
      drawSquare(size);
      console.log(`✅ Carré généré (côté: ${size})`);
    }
    
    // TRIANGLES
    else if (input.includes("triangle")) {
      // Triangle quelconque avec 3 côtés (priorité absolue)
      if ((input.includes("côté") || input.includes("cote") || input.includes("longueur")) 
          && input.match(/(\d+(?:[.,]\d+)?)/g)?.length >= 3) {
        const [a, b, c] = extractThreeNumbers(input, [3, 4, 5]);
        drawScaleneTriangleFromSides(a, b, c);
        console.log(`✅ Triangle quelconque généré (côtés: ${a}, ${b}, ${c})`);
      }
      // Triangle rectangle
      else if (input.includes("rectangle") || input.includes("droit")) {
        const [base, height] = extractTwoNumbers(input, [3, 4]);
        drawRightTriangle(base, height);
        console.log(`✅ Triangle rectangle généré (base: ${base}, hauteur: ${height})`);
      }
      // Triangle équilatéral
      else if (input.includes("équilatéral") || input.includes("equilateral")) {
        const side = extractNumber(input, 4);
        drawEquilateralTriangle(side);
        console.log(`✅ Triangle équilatéral généré (côté: ${side})`);
      }
      // Triangle isocèle
      else if (input.includes("isocèle") || input.includes("isocele")) {
        const [base, height] = extractTwoNumbers(input, [6, 4]);
        drawIsoscelesTriangle(base, height);
        console.log(`✅ Triangle isocèle généré (base: ${base}, hauteur: ${height})`);
      }
      // Triangle par défaut
      else {
        const [base, height] = extractTwoNumbers(input, [4, 3]);
        drawRightTriangle(base, height);
        console.log(`✅ Triangle généré (base: ${base}, hauteur: ${height})`);
      }
    }
    
    // TRAPÈZES (vérifier AVANT rectangle car "trapèze rectangle" contient "rectangle")
    else if (input.includes("trapèze") || input.includes("trapeze")) {
      if (input.includes("rectangle")) {
        // Trapèze rectangle
        const numbers = extractThreeNumbers(input, [6, 4, 3]);
        const [baseBottom, baseTop, height] = numbers;
        drawRightTrapezoid(baseBottom, baseTop, height);
        console.log(`✅ Trapèze rectangle généré (base inf: ${baseBottom}, base sup: ${baseTop}, hauteur: ${height})`);
      } else {
        // Trapèze quelconque
        const numbers = extractThreeNumbers(input, [6, 4, 3]);
        const [baseBottom, baseTop, height] = numbers;
        drawTrapezoid(baseBottom, baseTop, height);
        console.log(`✅ Trapèze généré (base inf: ${baseBottom}, base sup: ${baseTop}, hauteur: ${height})`);
      }
    }
    
    // RECTANGLES
    else if (input.includes("rectangle")) {
      const [width, height] = extractTwoNumbers(input, [5, 3]);
      drawRectangle(width, height);
      console.log(`✅ Rectangle généré (${width} × ${height})`);
    }
    
    // LOSANGES
    else if (input.includes("losange")) {
      const side = extractNumber(input, 4);
      drawLosange(side);
      console.log(`✅ Losange généré (côté: ${side})`);
    }
    
    // PARALLÉLOGRAMMES
    else if (input.includes("parallélogramme") || input.includes("parallelogramme")) {
      const [base, side] = extractTwoNumbers(input, [5, 3]);
      drawParallelogram(base, side);
      console.log(`✅ Parallélogramme généré (base: ${base}, côté: ${side})`);
    }
    
    // CERCLES
    else if (input.includes("demi-cercle") || input.includes("demi cercle") || input.includes("demicercle")) {
      const radius = extractNumber(input, 3);
      drawSemicircle(radius);
      console.log(`✅ Demi-cercle généré (rayon: ${radius})`);
    }
    else if (input.includes("arc de cercle") || input.includes("arc")) {
      // Arc avec angles optionnels : "arc 3 60 120" ou "arc de cercle 3"
      const numbers = input.match(/\d+(?:[.,]\d+)?/g);
      if (numbers && numbers.length >= 3) {
        const [radius, angleStart, angleEnd] = numbers.map(n => parseFloat(n.replace(',', '.')));
        drawArc(radius, angleStart, angleEnd);
        console.log(`✅ Arc de cercle généré (rayon: ${radius}, ${angleStart}° à ${angleEnd}°)`);
      } else if (numbers && numbers.length >= 1) {
        const radius = parseFloat(numbers[0].replace(',', '.'));
        drawArc(radius, 0, 90); // Arc par défaut de 0° à 90°
        console.log(`✅ Arc de cercle généré (rayon: ${radius}, 0° à 90°)`);
      } else {
        drawArc(3, 0, 90);
        console.log(`✅ Arc de cercle généré avec valeurs par défaut`);
      }
    }
    else if (input.includes("cercle")) {
      const radius = extractNumber(input, 2);
      drawCircle(radius);
      console.log(`✅ Cercle généré (rayon: ${radius})`);
    }
    
    // POLYGONES RÉGULIERS
    else if (input.includes("polygone régulier") || input.includes("polygone regulier")) {
      // Extraire n= de la chaîne
      const nMatch = input.match(/n\s*=\s*(\d+)/);
      if (nMatch) {
        const n = parseInt(nMatch[1]);
        // Extraire le nombre après "côté" ou "cote"
        const sideMatch = input.match(/(?:côté|cote)\s+(\d+(?:[.,]\d+)?)/);
        const side = sideMatch ? parseFloat(sideMatch[1].replace(',', '.')) : 3;
        if (n >= 3 && n <= 20) {
          drawRegularPolygon(n, side);
          console.log(`✅ Polygone régulier à ${n} côtés généré (côté: ${side})`);
          // Ajuster le zoom pour les polygones > 7 côtés
          if (n > 7) {
            setTimeout(() => board.zoom(1.5, 1.5), 50);
          }
        } else {
          alert(`Le nombre de côtés doit être entre 3 et 20.`);
          console.warn(`❌ Nombre de côtés invalide: ${n}`);
          return;
        }
      } else {
        alert(`Format attendu: "polygone régulier n=8 de côté 3"`);
        console.warn(`❌ Format invalide pour polygone régulier: "${input}"`);
        return;
      }
    }
    else if (input.includes("pentagone") || input.includes("pentagon")) {
      const side = extractNumber(input, 3);
      drawRegularPolygon(5, side);
      console.log(`✅ Pentagone généré (côté: ${side})`);
    }
    else if (input.includes("hexagone") || input.includes("hexagon")) {
      const side = extractNumber(input, 3);
      drawRegularPolygon(6, side);
      console.log(`✅ Hexagone généré (côté: ${side})`);
    }
    else if (input.includes("heptagone") || input.includes("heptagon")) {
      const side = extractNumber(input, 3);
      drawRegularPolygon(7, side);
      console.log(`✅ Heptagone généré (côté: ${side})`);
    }
    else if (input.includes("octogone") || input.includes("octagon")) {
      const side = extractNumber(input, 3);
      drawRegularPolygon(8, side);
      console.log(`✅ Octogone généré (côté: ${side})`);
    }
    
    // CONFIGURATIONS DE THALÈS
    else if (input.includes("thalès") || input.includes("thales")) {
      if (input.includes("papillon") || input.includes("butterfly")) {
        // Thalès papillon : 4 valeurs possibles (AB, AC, AD, AE)
        const numbers = input.match(/\d+(?:[.,]\d+)?/g);
        if (numbers && numbers.length >= 3) {
          const [AB, AC, AD, AE] = numbers.map(n => parseFloat(n.replace(',', '.')));
          drawThalesPapillon(AB, AC, AD, AE || null);
          console.log(`✅ Thalès papillon généré (AB=${AB}, AC=${AC}, AD=${AD})`);
        } else {
          // Valeurs par défaut pour le papillon
          drawThalesPapillon(2, 6, 3);
          console.log(`✅ Thalès papillon généré avec valeurs par défaut`);
        }
      } else {
        // Thalès classique : 3 valeurs (PQ, PR, PT) → calcule PS
        const numbers = input.match(/\d+(?:[.,]\d+)?/g);
        if (numbers && numbers.length >= 3) {
          const [PQ, PR, PT] = numbers.map(n => parseFloat(n.replace(',', '.')));
          drawThalesClassic(PQ, PR, PT);
          console.log(`✅ Thalès classique généré (PQ=${PQ}, PR=${PR}, PT=${PT})`);
        } else {
          // Valeurs par défaut
          drawThalesClassic(4, 8, 5);
          console.log(`✅ Thalès classique généré avec valeurs par défaut`);
        }
      }
    }
    
    // FIGURE NON RECONNUE
    else {
      // Essayer d'utiliser les suggestions disponibles
      const suggestionBox = document.getElementById('suggestionBox');
      const hasSuggestions = suggestionBox && suggestionBox.style.display === 'block';
      
      if (hasSuggestions) {
        const firstSuggestion = suggestionBox.querySelector('.suggestion-item');
        if (firstSuggestion) {
          const suggestionText = firstSuggestion.textContent;
          document.getElementById("promptInput").value = suggestionText;
          console.log(`🔄 Auto-correction: "${input}" → "${suggestionText}"`);
          
          setTimeout(() => generateFigure(), 100);
          return;
        }
      }
      
      alert(`Figure non reconnue: "${input}". Essayez: carré, rectangle, triangle, cercle, losange, parallélogramme, pentagone, hexagone.`);
      console.warn(`❌ Figure non reconnue: "${input}"`);
      return;
    }

  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error);
    alert('❌ Erreur lors de la génération de la figure');
    return;
  }

  // ==========================================
  // 4. FINALISATION AVEC SYSTÈME DE HANDLERS
  // ==========================================
  
  invalidateFigureCache('new figure generated');
  
  try { 
    centerFigure(); 
  } catch (e) { 
    console.warn('centerFigure failed', e); 
  }
  
  // Appliquer l'effet main levée si activé
  const handDrawnCheckbox = document.getElementById('toggleHandDrawn');
  if (handDrawnCheckbox && handDrawnCheckbox.checked) {
    setTimeout(() => {
      applyHandDrawnEffect();
    }, 100);
  }
  
  // Mise à jour intelligente
  setTimeout(() => {
    autoInvalidateCache();
  }, 150);
  
  board.update();
  
  console.log(`✅ Figure générée et optimisée avec le système de handlers`);
  
  // ==========================================
  // 5. SAUVEGARDE DE L'ÉTAT POUR HISTORIQUE
  // ==========================================
  
  // Sauvegarder l'état après génération réussie
  setTimeout(() => {
    saveState();
  }, 200);
  
  // ==========================================
  // 6. FEEDBACK UTILISATEUR
  // ==========================================
  
  const suggestionBox = document.getElementById('suggestionBox');
  if (suggestionBox) {
    suggestionBox.style.display = 'none';
  }
  
  const figureType = getCurrentFigureType();
  if (figureType && figureType.type !== 'unknown') {
    console.log(`🎯 Type détecté: ${figureType.type} - ${figureType.subtype}`);
  }
}

// ==========================================
// CACHE ET OPTIMISATION
// ==========================================

function autoInvalidateCache() {
  invalidateFigureCache('figure modified');
  
  const activeOptions = getActiveDisplayOptions();
  
  if (activeOptions.lengths) updateLengthLabels();
  if (activeOptions.codings) updateCodings();
  if (activeOptions.rightAngles) updateRightAngleMarkers(true);
  if (activeOptions.equalAngles) updateEqualAngleMarkers(true);
  if (activeOptions.diagonals) updateDiagonals();
  if (activeOptions.circleExtras) updateCircleExtras();
}

function getActiveDisplayOptions() {
  return {
    lengths: document.getElementById('toggleLengths')?.checked || false,
    codings: document.getElementById('toggleCodings')?.checked || false,
    rightAngles: document.getElementById('toggleRightAngles')?.checked || false,
    equalAngles: document.getElementById('toggleEqualAngles')?.checked || false,
    diagonals: document.getElementById('toggleDiagonals')?.checked || false,
    radius: document.getElementById('toggleRadius')?.checked || false,
    diameter: document.getElementById('toggleDiameter')?.checked || false,
    circleExtras: (document.getElementById('toggleRadius')?.checked || document.getElementById('toggleDiameter')?.checked) || false
  };
}

// ==========================================
// MONITORING DES PERFORMANCES
// ==========================================

function measurePerformance(functionName, fn) {
  const startTime = performance.now();
  const result = fn();
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  if (duration > 10) {
    console.log(`⏱️ ${functionName}: ${duration.toFixed(2)}ms`);
  }
  
  return result;
}

// ==========================================
// EXPORT SVG
// ==========================================

function exportBoardToSVG() {
  try {
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

    const svgRoot = board.renderer.svgRoot;
    if (!svgRoot) {
      alert('❌ Impossible de générer le SVG');
      return;
    }

    const svgClone = svgRoot.cloneNode(true);
    
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgClone);
    
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'figure-geometrique.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    console.log('✅ Export SVG réussi');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'export SVG:', error);
    alert('❌ Erreur lors de l\'export SVG');
  }
}

// ==========================================
// COPIE DANS LE PRESSE-PAPIERS
// ==========================================

async function copyBoardToClipboard() {
  try {
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

    const jxgBox = document.getElementById('jxgbox');
    if (!jxgBox) { 
      alert('❌ Zone graphique introuvable'); 
      return; 
    }

    if (!navigator.clipboard || !navigator.clipboard.write) {
      alert('❌ Votre navigateur ne supporte pas la copie dans le presse-papier.\nUtilisez plutôt le bouton "Exporter SVG".');
      return;
    }

    const copyBtn = document.getElementById('copyClipboardBtn');
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '⏳ Copie...';
    copyBtn.disabled = true;

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

      await new Promise(resolve => setTimeout(resolve, 150));

      const figureBounds = calculateFigureBounds();
      console.log('📐 Limites de la figure calculées:', figureBounds);

      const realWorldScale = calculateRealWorldScale(figureBounds);
      console.log('📏 Échelle monde réel calculée:', realWorldScale);

      const fullCanvas = await html2canvas(jxgBox, {
        backgroundColor: '#ffffff',
        scale: realWorldScale.canvasScale,
        useCORS: true,
        allowTaint: true,
        ignoreElements: (element) => {
          return element.tagName === 'BUTTON' || 
                 element.classList.contains('control-btn') ||
                 element.classList.contains('jxg-button');
        }
      });

      const croppedCanvas = cropCanvasToFigureRealSize(fullCanvas, figureBounds, jxgBox, realWorldScale);

      const blob = await createPngWithDPI(croppedCanvas, realWorldScale.targetDPI);

      const clipboardItem = new ClipboardItem({
        'image/png': blob
      });

      await navigator.clipboard.write([clipboardItem]);

      const dimensions = calculateImageDimensions(figureBounds, realWorldScale);
      copyBtn.innerHTML = '✅ Copié !';
      copyBtn.style.background = 'linear-gradient(135deg, #00b894, #55efc4)';
      
      console.log('📋 Image copiée avec dimensions réelles !');
      console.log(`📏 Taille de l'image: ${dimensions.widthCm.toFixed(1)} × ${dimensions.heightCm.toFixed(1)} cm`);
      
      showCopyNotification(`Image copiée ! (${dimensions.widthCm.toFixed(1)} × ${dimensions.heightCm.toFixed(1)} cm)`);

    } catch (error) {
      console.error('❌ Erreur lors de la copie:', error);
      alert('❌ Erreur lors de la copie dans le presse-papier.');
      
      copyBtn.innerHTML = '❌ Échec';
      copyBtn.style.background = 'linear-gradient(135deg, #d63031, #e84393)';
    }

    setTimeout(() => {
      copyBtn.innerHTML = originalText;
      copyBtn.disabled = false;
      copyBtn.style.background = 'linear-gradient(135deg, #00b894, #00cec9)';
    }, 3000);

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    alert('❌ Erreur lors de la copie. Essayez de recharger la page.');
  }
}

// ==========================================
// FONCTIONS UTILITAIRES POUR COPIE
// ==========================================

function calculateRealWorldScale(figureBounds) {
  const targetDPI = 300;
  const pixelsPerCm = targetDPI / 2.54;
  
  const figureWidthUnits = figureBounds.maxX - figureBounds.minX;
  const figureHeightUnits = figureBounds.maxY - figureBounds.minY;
  
  let realWidthCm = figureWidthUnits;
  let realHeightCm = figureHeightUnits;
  
  if (points && points.length > 0) {
    const realDimensions = calculateRealFigureDimensions();
    if (realDimensions.width > 0) realWidthCm = realDimensions.width;
    if (realDimensions.height > 0) realHeightCm = realDimensions.height;
  }
  
  const requiredWidthPixels = realWidthCm * pixelsPerCm;
  const requiredHeightPixels = realHeightCm * pixelsPerCm;
  
  const currentBoardSize = board.canvasWidth || 400;
  const canvasScale = Math.max(requiredWidthPixels / currentBoardSize, 1);
  
  return {
    targetDPI,
    pixelsPerCm,
    realWidthCm,
    realHeightCm,
    canvasScale,
    requiredWidthPixels,
    requiredHeightPixels
  };
}

function calculateRealFigureDimensions() {
  if (!points || points.length === 0) {
    return { width: 0, height: 0 };
  }
  
  if (centerPoint && circlePoint && circleObject) {
    const radius = Math.hypot(circlePoint.X() - centerPoint.X(), circlePoint.Y() - centerPoint.Y());
    const diameter = radius * 2;
    return { width: diameter, height: diameter };
  }
  
  if (points.length === 4) {
    const figureType = getCurrentFigureType();
    if (figureType.subtype === 'square') {
      const sideLength = Math.hypot(points[1].X() - points[0].X(), points[1].Y() - points[0].Y());
      return { width: sideLength, height: sideLength };
    }
    
    if (figureType.subtype === 'rectangle') {
      const width = Math.hypot(points[1].X() - points[0].X(), points[1].Y() - points[0].Y());
      const height = Math.hypot(points[3].X() - points[0].X(), points[3].Y() - points[0].Y());
      return { width, height };
    }
  }
  
  if (points.length === 3) {
    const base = Math.hypot(points[1].X() - points[0].X(), points[1].Y() - points[0].Y());
    const height = Math.abs(points[2].Y() - Math.min(points[0].Y(), points[1].Y()));
    return { width: base, height };
  }
  
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  
  points.forEach(p => {
    minX = Math.min(minX, p.X());
    maxX = Math.max(maxX, p.X());
    minY = Math.min(minY, p.Y());
    maxY = Math.max(maxY, p.Y());
  });
  
  return {
    width: maxX - minX,
    height: maxY - minY
  };
}

function cropCanvasToFigureRealSize(sourceCanvas, figureBounds, jxgBox, realWorldScale) {
  const boundingBox = board.getBoundingBox();
  const boardWidth = boundingBox[2] - boundingBox[0];
  const boardHeight = boundingBox[1] - boundingBox[3];
  
  const canvasWidth = sourceCanvas.width;
  const canvasHeight = sourceCanvas.height;
  
  const scaleX = canvasWidth / boardWidth;
  const scaleY = canvasHeight / boardHeight;
  
  const pixelBounds = {
    left: Math.max(0, (figureBounds.minX - boundingBox[0]) * scaleX),
    right: Math.min(canvasWidth, (figureBounds.maxX - boundingBox[0]) * scaleX),
    top: Math.max(0, (boundingBox[1] - figureBounds.maxY) * scaleY),
    bottom: Math.min(canvasHeight, (boundingBox[1] - figureBounds.minY) * scaleY)
  };
  
  const cropWidth = Math.max(100, Math.round(pixelBounds.right - pixelBounds.left));
  const cropHeight = Math.max(100, Math.round(pixelBounds.bottom - pixelBounds.top));
  
  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = cropWidth;
  croppedCanvas.height = cropHeight;
  const ctx = croppedCanvas.getContext('2d');
  
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, cropWidth, cropHeight);
  
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  ctx.drawImage(
    sourceCanvas,
    Math.round(pixelBounds.left),
    Math.round(pixelBounds.top),
    cropWidth,
    cropHeight,
    0, 0,
    cropWidth,
    cropHeight
  );
  
  const imageData = ctx.getImageData(0, 0, cropWidth, cropHeight);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    
    const isGrayish = (
      Math.abs(r - g) < 10 && 
      Math.abs(g - b) < 10 && 
      Math.abs(r - b) < 10 && 
      r > 200 && r < 240 &&
      a > 200
    );
    
    if (isGrayish) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255;
    }
    
    const isVeryLight = r > 250 && g > 250 && b > 250;
    if (isVeryLight) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255;
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
  
  return croppedCanvas;
}

async function createPngWithDPI(canvas, targetDPI) {
  const blob = await new Promise(resolve => {
    canvas.toBlob(resolve, 'image/png', 1.0);
  });
  
  return blob;
}

function calculateImageDimensions(figureBounds, realWorldScale) {
  const widthCm = realWorldScale.realWidthCm;
  const heightCm = realWorldScale.realHeightCm;
  const widthPixels = Math.round(widthCm * realWorldScale.pixelsPerCm);
  const heightPixels = Math.round(heightCm * realWorldScale.pixelsPerCm);
  
  return {
    widthCm,
    heightCm,
    widthPixels,
    heightPixels
  };
}

function showCopyNotification(message) {
  const existingNotif = document.querySelector('.copy-notification');
  if (existingNotif) existingNotif.remove();
  
  const notification = document.createElement('div');
  notification.className = 'copy-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #00b894, #00cec9);
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    font-family: inherit;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    z-index: 10000;
    opacity: 0;
    transform: translateX(100px);
    transition: all 0.4s ease;
    max-width: 280px;
    line-height: 1.4;
  `;
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span>✅</span>
      <div>${message}</div>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100px)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 400);
  }, 4000);
}

function calculateFigureBounds() {
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  
  const allPoints = [];
  
  if (points && points.length > 0) {
    allPoints.push(...points);
  }
  
  if (centerPoint) allPoints.push(centerPoint);
  if (circlePoint) allPoints.push(circlePoint);
  
  if (diameterPoints && diameterPoints.length > 0) {
    allPoints.push(...diameterPoints);
  }
  
  if (lengthHandles && lengthHandles.length > 0) {
    allPoints.push(...lengthHandles);
  }
  
  allPoints.forEach(point => {
    if (point && typeof point.X === 'function' && typeof point.Y === 'function') {
      const x = point.X();
      const y = point.Y();
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  });
  
  if (centerPoint && circleObject) {
    const radius = Math.hypot(circlePoint.X() - centerPoint.X(), circlePoint.Y() - centerPoint.Y());
    const centerX = centerPoint.X();
    const centerY = centerPoint.Y();
    
    minX = Math.min(minX, centerX - radius);
    maxX = Math.max(maxX, centerX + radius);
    minY = Math.min(minY, centerY - radius);
    maxY = Math.max(maxY, centerY + radius);
  }
  
  const marginX = (maxX - minX) * 0.15;
  const marginY = (maxY - minY) * 0.15;
  
  const minMargin = 0.8;
  const finalMarginX = Math.max(marginX, minMargin);
  const finalMarginY = Math.max(marginY, minMargin);
  
  return {
    minX: minX - finalMarginX,
    maxX: maxX + finalMarginX,
    minY: minY - finalMarginY,
    maxY: maxY + finalMarginY
  };
}

// ==========================================
// SETUP EVENT LISTENERS
// ==========================================

function setupEventListeners() {
  console.log('🚀 Initialisation du générateur de figures 2D...');

  // Déclaration des éléments DOM principaux
  const simpleInput = document.getElementById("promptInput");
  const simpleSuggestions = document.getElementById("suggestionBox");
  const creatorInput = document.getElementById("creatorPromptInput");
  const creatorSuggestions = document.getElementById("creatorSuggestionBox");

  // ==========================================
  // 1. SYSTÈME DE SUGGESTIONS INTELLIGENTES
  // ==========================================
  
  const suggestionsList = [
    "carré de côté 4",
    "rectangle de 5 sur 3",
    "triangle équilatéral de côté 4",
    "triangle rectangle de base 3 et hauteur 4",
    "triangle isocèle de base 6 et hauteur 4",
    "triangle côtés 3, 4.5, 5",
    "triangle de côtés 5.5, 6, 7",
    "triangle quelconque 4, 5, 6.5",
    "cercle de rayon 2",
    "losange de côté 5",
    "parallélogramme 5 x 3",
    "hexagone de côté 4",
    "pentagone de côté 4",
    "octogone de côté 4",
    "polygone régulier n=8 de côté 3"
  ];

  /**
   * Configure le système de suggestions pour un champ input
   * @param {HTMLInputElement} input - Le champ input
   * @param {HTMLElement} suggestionsDiv - La div des suggestions
   * @param {Function} onSelect - Fonction appelée quand une suggestion est sélectionnée
   */
  function setupSuggestions(input, suggestionsDiv, onSelect) {
    if (!input || !suggestionsDiv) return;
    
    let selectedSuggestionIndex = -1;

    // Affichage dynamique des suggestions pendant la frappe
    input.addEventListener("input", function () {
      const value = input.value.trim().toLowerCase();
      suggestionsDiv.innerHTML = "";
      selectedSuggestionIndex = -1;
      
      if (!value) {
        suggestionsDiv.style.display = "none";
        return;
      }
      
      // Filtrer et limiter à 5 suggestions
      const filtered = suggestionsList
        .filter(s => s.toLowerCase().includes(value))
        .slice(0, 5);
      
      if (filtered.length === 0) {
        suggestionsDiv.style.display = "none";
        return;
      }
      
      // Générer le HTML des suggestions
      filtered.forEach(suggestion => {
        const div = document.createElement("div");
        div.className = "suggestion-item";
        div.textContent = suggestion;
        
        // Événement au survol
        div.addEventListener("mouseover", function () {
          const items = suggestionsDiv.querySelectorAll(".suggestion-item");
          items.forEach(item => item.style.background = "white");
          this.style.background = "#f0f0f0";
        });
        
        // Événement au clic
        div.addEventListener("click", function () {
          input.value = suggestion;
          suggestionsDiv.style.display = "none";
          selectedSuggestionIndex = -1;
          onSelect();
        });
        
        suggestionsDiv.appendChild(div);
      });
      
      suggestionsDiv.style.display = "block";
    });

    // Navigation clavier et autocomplétion
    input.addEventListener("keydown", function (e) {
      const items = suggestionsDiv.querySelectorAll(".suggestion-item");
      
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (items.length > 0) {
          selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, items.length - 1);
          highlightSuggestion(items, selectedSuggestionIndex);
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (items.length > 0) {
          selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
          highlightSuggestion(items, selectedSuggestionIndex);
        }
      } else if (e.key === "Tab") {
        e.preventDefault();
        if (items.length > 0) {
          const index = selectedSuggestionIndex >= 0 ? selectedSuggestionIndex : 0;
          input.value = items[index].textContent;
          suggestionsDiv.style.display = "none";
          selectedSuggestionIndex = -1;
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        
        // Logique de sélection intelligente des suggestions
        if (suggestionsDiv.style.display === "block" && items.length > 0) {
          let suggestionToUse = null;
          
          // Si une suggestion est sélectionnée -> l'utiliser
          if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < items.length) {
            suggestionToUse = items[selectedSuggestionIndex].textContent;
          } 
          // Sinon, prendre automatiquement la PREMIÈRE suggestion
          else {
            suggestionToUse = items[0].textContent;
          }
          
          // Appliquer la suggestion
          if (suggestionToUse) {
            input.value = suggestionToUse;
            suggestionsDiv.style.display = "none";
            selectedSuggestionIndex = -1;
            onSelect();
            return;
          }
        }
        
        // Si pas de suggestions, générer avec le texte actuel
        if (suggestionsDiv.style.display !== "block" && input.value.trim()) {
          onSelect();
        }
      }
    });
  }

  // Fonction helper pour highlight
  function highlightSuggestion(items, selectedIndex) {
    items.forEach((item, i) => {
      item.style.background = i === selectedIndex ? "#f0f0f0" : "white";
    });
  }

  // Configuration des suggestions pour les deux modes
  setupSuggestions(simpleInput, simpleSuggestions, generateFigure);
  setupSuggestions(creatorInput, creatorSuggestions, addFigureToScene);

  console.log('✅ Système de suggestions configuré pour les deux modes');

  // ==========================================
  // 2. RESET INITIAL DE L'INTERFACE
  // ==========================================
  
  // Reset de tous les checkboxes
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
  });
  
  // Reset des champs de saisie (réutilisation des variables déjà déclarées)
  const labelInput = document.getElementById('labelInput');
  const figureSearch = document.getElementById('figureSearch');
  
  if (simpleInput) simpleInput.value = '';
  if (labelInput) labelInput.value = '';
  if (figureSearch) figureSearch.value = '';
  
  // Reset des suggestions (réutilisation de la variable déjà déclarée)
  if (simpleSuggestions) {
    simpleSuggestions.style.display = 'none';
    simpleSuggestions.innerHTML = '';
  }
  
  // Reset de la liste des figures
  const figuresList = document.getElementById('figuresList');
  if (figuresList) {
    Array.from(figuresList.children).forEach(li => {
      li.classList.remove('selected', 'highlighted');
    });
  }

  // ==========================================
  // 3. GESTION DES UNITÉS ET MESURES
  // ==========================================
  
  const toggleLengths = document.getElementById('toggleLengths');
  const unitGroup = document.getElementById('unitGroup');
  const showUnitsCheckbox = document.getElementById('showUnitsCheckbox');
  const unitSelector = document.getElementById('unitSelector');

  if (toggleLengths && unitGroup) {
    // Fonction pour afficher/masquer le groupe unités
    function updateUnitVisibility() {
      if (toggleLengths.checked) {
        unitGroup.style.display = 'block';
      } else {
        unitGroup.style.display = 'none';
        if (showUnitsCheckbox) showUnitsCheckbox.checked = false;
      }
      updateLengthLabels();
    }
    
    // État initial : unités cachées
    unitGroup.style.display = 'none';
    
    // Event listeners pour les mesures
    toggleLengths.addEventListener('change', updateUnitVisibility);
    
    if (showUnitsCheckbox) {
      showUnitsCheckbox.addEventListener('change', () => {
        updateLengthLabels();
      });
    }
    
    if (unitSelector) {
      unitSelector.addEventListener('change', () => {
        updateLengthLabels();
      });
    }
    
    console.log('✅ Gestion des unités configurée');
  }

  // ==========================================
  // 4. EVENT LISTENERS POUR LES OPTIONS D'AFFICHAGE
  // ==========================================
  
  // Fonction helper pour ajouter des event listeners en sécurité
  function addSafeEventListener(elementId, event, handler, description) {
    const element = document.getElementById(elementId);
    if (element) {
      element.addEventListener(event, handler);
      console.log(`✅ ${description} configuré`);
      return true;
    }
    return false;
  }
  
  // Codages des côtés égaux
  addSafeEventListener('toggleCodings', 'change', () => {
    updateCodings();
  }, 'Codages des côtés');
  
  // Diagonales
  addSafeEventListener('toggleDiagonals', 'change', () => {
    updateDiagonals();
  }, 'Diagonales');
  
  // Event listener pour la checkbox d'intersection
  addSafeEventListener('toggleIntersectionLabel', 'change', () => {
    updateDiagonals();
  }, "Label d'intersection");

  // Event listener pour le champ texte d'intersection
  addSafeEventListener('intersectionTextInput', 'input', () => {
    const showIntersectionLabel = document.getElementById('toggleIntersectionLabel')?.checked;
    if (showIntersectionLabel) {
      updateDiagonals();
    }
  }, "Texte d'intersection");

  // Event listener pour Enter dans le champ texte
  const intersectionTextInput = document.getElementById('intersectionTextInput');
  if (intersectionTextInput) {
    intersectionTextInput.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        const showIntersectionLabel = document.getElementById('toggleIntersectionLabel')?.checked;
        if (showIntersectionLabel) {
          updateDiagonals();
        }
      }
    });
  }
  
  // Event listener pour l'angle droit à l'intersection
  addSafeEventListener('toggleIntersectionRightAngle', 'change', () => {
    updateDiagonals();
  }, "Angle droit à l'intersection");
  
  // Angles égaux
  addSafeEventListener('toggleEqualAngles', 'change', (e) => {
    updateEqualAngleMarkers(e.target.checked);
  }, 'Angles égaux');
  
  // Angles droits
  addSafeEventListener('toggleRightAngles', 'change', (e) => {
    updateRightAngleMarkers(e.target.checked);
  }, 'Angles droits');
  
  // Option "un seul angle droit"
  addSafeEventListener('toggleSingleAngle', 'change', () => {
    const toggleRightAngles = document.getElementById('toggleRightAngles');
    if (toggleRightAngles) {
      updateRightAngleMarkers(toggleRightAngles.checked);
    }
  }, 'Un seul angle droit');
  
  // Option "cacher l'hypoténuse"
  addSafeEventListener('toggleHideHypotenuse', 'change', () => {
    updateLengthLabels();
  }, 'Cacher hypoténuse');
  
  // Rayon du cercle
  addSafeEventListener('toggleRadius', 'change', () => {
    updateCircleExtras();
  }, 'Rayon du cercle');
  
  // Diamètre du cercle
  addSafeEventListener('toggleDiameter', 'change', () => {
    updateCircleExtras();
  }, 'Diamètre du cercle');
  
  // Effet main levée
  addSafeEventListener('toggleHandDrawn', 'change', (e) => {
    const isHandDrawnMode = e.target.checked;
    const intensityGroup = document.getElementById('handDrawnIntensityGroup');
    
    if (isHandDrawnMode) {
      if (intensityGroup) intensityGroup.style.display = 'block';
      applyHandDrawnEffect();
    } else {
      if (intensityGroup) intensityGroup.style.display = 'none';
      // Regenerate sans effet
      invalidateFigureCache();
      generateFigure();
    }
  }, 'Effet main levée');
  
  // Event listener pour le curseur d'intensité
  addSafeEventListener('handDrawnIntensitySlider', 'input', (e) => {
    const intensityValue = document.getElementById('handDrawnIntensityValue');
    if (intensityValue) {
      intensityValue.textContent = e.target.value;
    }
    
    // Réappliquer l'effet avec la nouvelle intensité
    const handDrawnCheckbox = document.getElementById('toggleHandDrawn');
    if (handDrawnCheckbox && handDrawnCheckbox.checked) {
      applyHandDrawnEffect();
    }
  }, 'Intensité main levée');

  // ==========================================
  // 5. INTERACTION AVEC LA LISTE DES FIGURES
  // ==========================================
  // 5. GESTION DE LA LISTE INTERACTIVE DES FIGURES (ACCORDÉON)
  // ==========================================
  
  // Gestion de l'accordéon des catégories
  const categoryHeaders = document.querySelectorAll('.category-header');
  const toggleAllBtn = document.getElementById('toggleAllCategories');
  let allOpen = false;

  categoryHeaders.forEach(header => {
    header.addEventListener('click', function() {
      const category = this.closest('.accordion-category');
      const wasOpen = category.classList.contains('open');
      
      // Fermer toutes les catégories (une seule ouverte à la fois)
      document.querySelectorAll('.accordion-category').forEach(cat => {
        cat.classList.remove('open');
      });
      
      // Ouvrir la catégorie cliquée si elle était fermée
      if (!wasOpen) {
        category.classList.add('open');
      }
    });
  });

  // Bouton Tout ouvrir / Tout fermer
  if (toggleAllBtn) {
    toggleAllBtn.addEventListener('click', function() {
      const categories = document.querySelectorAll('.accordion-category');
      
      if (allOpen) {
        // Tout fermer
        categories.forEach(cat => cat.classList.remove('open'));
        toggleAllBtn.textContent = '⊞ Tout ouvrir';
        allOpen = false;
      } else {
        // Tout ouvrir
        categories.forEach(cat => cat.classList.add('open'));
        toggleAllBtn.textContent = '⊟ Tout fermer';
        allOpen = true;
      }
    });
  }

  // Gestion du clic sur les figures dans l'accordéon
  const figureItems = document.querySelectorAll('.category-content li');
  
  if (figureItems.length > 0) {
    figureItems.forEach(item => {
      item.addEventListener('click', function() {
        const figurePrompt = this.getAttribute('data-prompt');
        
        if (figurePrompt) {
          // Détecter le mode actif
          const creatorMode = document.getElementById('modeCreator');
          const isCreatorMode = creatorMode && creatorMode.style.display !== 'none';
          
          if (isCreatorMode) {
            // Figures complexes: remplir creatorPromptInput et ajouter à la scène
            const creatorInputElem = document.getElementById('creatorPromptInput');
            if (creatorInputElem) {
              creatorInputElem.value = figurePrompt;
              addFigureToScene();
            }
          } else {
            // Mode Simple: remplir promptInput et générer
            const simpleInputElem = document.getElementById('promptInput');
            if (simpleInputElem) {
              simpleInputElem.value = figurePrompt;
              generateFigure();
            }
          }
          
          // Marquer visuellement l'élément sélectionné
          figureItems.forEach(li => li.classList.remove('selected'));
          this.classList.add('selected');
        }
      });
    });
    
    console.log('✅ Accordéon des figures configuré');
  }

  // ==========================================
  // 6. FONCTION DE RECHERCHE DANS LA LISTE
  // ==========================================
  
  if (figureSearch && figuresList) {
    figureSearch.addEventListener('input', function () {
      const searchQuery = this.value.trim().toLowerCase();
      
      Array.from(figuresList.children).forEach(listItem => {
        const itemText = (listItem.textContent || '').toLowerCase();
        const isVisible = itemText.includes(searchQuery);
        listItem.style.display = isVisible ? '' : 'none';
      });
    });
    
    console.log('✅ Recherche dans la liste configurée');
  }

  // ==========================================
  // 7. CRÉATION DES BOUTONS D'EXPORT
  // ==========================================

  const optionsPanel = document.getElementById('optionsPanel');
  if (optionsPanel) {
    
    // Créer un conteneur flex pour les boutons côte à côte
    let buttonsContainer = document.getElementById('exportButtonsContainer');
    if (!buttonsContainer) {
      buttonsContainer = document.createElement('div');
      buttonsContainer.id = 'exportButtonsContainer';
      buttonsContainer.style.cssText = `
        display: flex;
        flex-direction: row;
        gap: 10px;
        margin-top: 15px;
        justify-content: flex-start;
        align-items: center;
        flex-wrap: nowrap;
      `;
      optionsPanel.insertAdjacentElement('afterend', buttonsContainer);
    }
    
    // Bouton Export SVG
    if (!document.getElementById('exportSvgBtn')) {
      const exportButton = document.createElement('button');
      exportButton.id = 'exportSvgBtn';
      exportButton.textContent = 'Exporter SVG';
      exportButton.style.cssText = `
        padding: 10px 20px; 
        background: linear-gradient(135deg, #6c5ce7, #a29bfe);
        color: white; 
        border: none; 
        border-radius: 6px; 
        cursor: pointer;
        font-family: inherit;
        font-weight: 500;
        transition: all 0.3s ease;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        margin: 0;
        flex-shrink: 0;
        order: 2;
      `;
      
      exportButton.addEventListener('mouseenter', () => {
        exportButton.style.transform = 'translateY(-1px)';
        exportButton.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
      });
      
      exportButton.addEventListener('mouseleave', () => {
        exportButton.style.transform = 'translateY(0)';
        exportButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      });
      
      exportButton.addEventListener('click', function() {
        exportBoardToSVG();
      });
      
      buttonsContainer.appendChild(exportButton);
      console.log('✅ Bouton d\'export SVG créé');
    }
    
    // Bouton Copier Presse-papier
    if (!document.getElementById('copyClipboardBtn')) {
      const copyButton = document.createElement('button');
      copyButton.id = 'copyClipboardBtn';
      copyButton.innerHTML = '📋 Copier';
      copyButton.style.cssText = `
        padding: 10px 20px; 
        background: linear-gradient(135deg, #00b894, #00cec9);
        color: white; 
        border: none; 
        border-radius: 6px; 
        cursor: pointer;
        font-family: inherit;
        font-weight: 500;
        transition: all 0.3s ease;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        margin: 0;
        flex-shrink: 0;
        order: 1;
      `;
      
      copyButton.addEventListener('mouseenter', () => {
        copyButton.style.transform = 'translateY(-1px)';
        copyButton.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
      });
      
      copyButton.addEventListener('mouseleave', () => {
        copyButton.style.transform = 'translateY(0)';
        copyButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      });
      
      copyButton.addEventListener('click', function() {
        copyBoardToClipboard();
      });
      
      buttonsContainer.appendChild(copyButton);
      console.log('✅ Bouton copier presse-papier créé');
    }
  }

  console.log('🎉 Initialisation du générateur terminée avec succès !');
  console.log('📋 Tapez une figure dans le champ de saisie ou cliquez sur la liste');
}

// ==========================================
// CHANGEMENT DE LANGUE
// ==========================================

function changeLanguage(lang) {
  setCurrentLanguage(lang);
  
  // Mettre à jour les drapeaux (ajouter classe active)
  document.getElementById('flagFR').classList.toggle('active', lang === 'fr');
  document.getElementById('flagEN').classList.toggle('active', lang === 'en');
  
  // Mettre à jour tous les textes de l'interface
  document.querySelector('h1').textContent = getTranslation('title');
  document.querySelector('label[for="promptInput"]').textContent = getTranslation('figureNature');
  document.querySelector('label[for="labelInput"]').textContent = getTranslation('figureName');
  document.querySelector('.control-actions button[onclick="generateFigure()"]').textContent = getTranslation('generate');
  document.getElementById('promptInput').placeholder = getTranslation('placeholderNature');
  document.getElementById('labelInput').placeholder = getTranslation('placeholderName');
  
  // Options d'affichage
  document.querySelector('#optionsPanel h3').textContent = getTranslation('displayOptions');
  
  // Fonction helper pour mettre à jour le texte des labels
  const updateCheckboxLabel = (checkboxId, translationKey) => {
    const checkbox = document.getElementById(checkboxId);
    if (checkbox && checkbox.parentElement.tagName === 'LABEL') {
      const label = checkbox.parentElement;
      // Garder la checkbox et remplacer le texte
      const textNode = label.childNodes[1];
      if (textNode && textNode.nodeType === Node.TEXT_NODE) {
        textNode.textContent = ' ' + getTranslation(translationKey);
      }
    } else if (checkbox) {
      // Si le label est séparé (avec for="...")
      const label = document.querySelector(`label[for="${checkboxId}"]`);
      if (label) {
        label.textContent = getTranslation(translationKey);
      }
    }
  };
  
  updateCheckboxLabel('toggleRightAngles', 'showRightAngles');
  updateCheckboxLabel('toggleSingleAngle', 'showSingleAngle');
  updateCheckboxLabel('toggleEqualAngles', 'showEqualAngles');
  updateCheckboxLabel('toggleLengths', 'showMeasures');
  updateCheckboxLabel('showUnitsCheckbox', 'showUnits');
  updateCheckboxLabel('toggleHideHypotenuse', 'hideHypotenuse');
  updateCheckboxLabel('toggleCodings', 'showCodings');
  updateCheckboxLabel('toggleDiagonals', 'showDiagonals');
  updateCheckboxLabel('toggleIntersectionLabel', 'nameIntersection');
  updateCheckboxLabel('toggleIntersectionRightAngle', 'rightAngleIntersection');
  updateCheckboxLabel('toggleRadius', 'showRadius');
  updateCheckboxLabel('toggleDiameter', 'showDiameter');
  updateCheckboxLabel('toggleHandDrawn', 'handDrawn');
  
  // Label d'intensité
  const intensityLabel = document.querySelector('label[for="handDrawnIntensitySlider"]');
  if (intensityLabel) {
    const intensityValue = document.getElementById('handDrawnIntensityValue');
    const currentValue = intensityValue ? intensityValue.textContent : '50';
    intensityLabel.innerHTML = `${getTranslation('intensity')}: <span id="handDrawnIntensityValue">${currentValue}</span>%`;
  }
  
  // Boutons
  document.getElementById('exportSvgBtn').textContent = getTranslation('exportSVG');
  
  // Bouton Reset
  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.textContent = getTranslation('reset');
    resetBtn.title = getTranslation('reset');
    resetBtn.setAttribute('aria-label', getTranslation('reset'));
  }
  
  // Bouton Copier
  const copyButtons = document.querySelectorAll('button');
  copyButtons.forEach(btn => {
    if (btn.textContent.includes('Copier') || btn.textContent.includes('Copy')) {
      btn.textContent = `📋 ${getTranslation('copy')}`;
    }
  });
  
  // Liste des figures
  document.querySelector('#figuresPanel h3').textContent = getTranslation('figuresList');
  
  // Mettre à jour les noms de figures dans la liste
  const figureItems = document.querySelectorAll('#figuresList li');
  const figureKeys = ['square', 'circle', 'hexagon', 'rhombus', 'parallelogram', 'regularPolygon', 'rectangle', 'equilateralTriangle', 'isoscelesTriangle', 'scaleneTriangle', 'rightTriangle'];
  figureItems.forEach((item, index) => {
    if (index < figureKeys.length) {
      const nameSpan = item.querySelector('.figure-name');
      if (nameSpan) {
        nameSpan.textContent = getTranslation(figureKeys[index]);
      }
    }
  });
  
  console.log(`🌍 Langue changée: ${lang}`);
}
// ==========================================
// FIGURES COMPLEXES - Gestion multi-figures
// ==========================================

// Variable globale pour stocker les figures de la scène
let sceneFigures = [];
let nextLabelIndex = 0; // Pour continuer l'alphabet

/**
 * Bascule entre mode simple et figures complexes
 */
function switchMode(mode) {
  const simpleMode = document.getElementById('modeSimple');
  const creatorMode = document.getElementById('modeCreator');
  const tabSimple = document.getElementById('tabSimple');
  const tabCreator = document.getElementById('tabCreator');
  
  if (mode === 'simple') {
    simpleMode.style.display = 'block';
    creatorMode.style.display = 'none';
    tabSimple.classList.add('active');
    tabCreator.classList.remove('active');
  } else {
    simpleMode.style.display = 'none';
    creatorMode.style.display = 'block';
    tabSimple.classList.remove('active');
    tabCreator.classList.add('active');
  }
}

/**
 * Ajoute une figure à la scène (figures complexes)
 */
function addFigureToScene() {
  const input = document.getElementById("creatorPromptInput").value.trim().toLowerCase();
  
  if (!input) {
    alert("Veuillez entrer une description de figure.");
    return;
  }
  
  // Enregistrer la commande dans l'historique (figures complexes)
  figureCommandHistory.push(input);
  
  // Générer des labels alphabétiques continus (on en demande plus car certaines figures en utilisent plus)
  const labels = generateNextLabels(10); // Demander suffisamment de labels
  
  // Position aléatoire autour du centre
  const offsetX = (Math.random() - 0.5) * 8;
  const offsetY = (Math.random() - 0.5) * 8;
  
  // Définir les labels personnalisés
  setCustomLabels(labels);
  
  // Sauvegarder les offsets pour cette génération
  window.currentOffsetX = offsetX;
  window.currentOffsetY = offsetY;
  
  // Générer la figure (réutilise la logique de generateFigure mais sans nettoyage)
  try {
    console.log(`🎨 Ajout de figure: "${input}" avec offset (${offsetX.toFixed(2)}, ${offsetY.toFixed(2)})`);
    
    // Appeler la logique de parsing de generateFigure (copie simplifiée)
    // CARRÉS
    if (input.includes("carré")) {
      const size = extractNumber(input, 4);
      drawSquare(size, offsetX, offsetY);
      nextLabelIndex += 4;
      console.log(`✅ Carré ajouté (côté: ${size})`);
    }
    // TRIANGLES
    else if (input.includes("triangle")) {
      if ((input.includes("côté") || input.includes("cote") || input.includes("longueur")) 
          && input.match(/(\d+(?:[.,]\d+)?)/g)?.length >= 3) {
        const [a, b, c] = extractThreeNumbers(input, [3, 4, 5]);
        drawScaleneTriangleFromSides(a, b, c, offsetX, offsetY);
        nextLabelIndex += 3;
      }
      else if (input.includes("rectangle") || input.includes("droit")) {
        const [base, height] = extractTwoNumbers(input, [3, 4]);
        drawRightTriangle(base, height, offsetX, offsetY);
        nextLabelIndex += 3;
      }
      else if (input.includes("équilatéral") || input.includes("equilateral")) {
        const side = extractNumber(input, 4);
        drawEquilateralTriangle(side, offsetX, offsetY);
        nextLabelIndex += 3;
      }
      else if (input.includes("isocèle") || input.includes("isocele")) {
        const [base, height] = extractTwoNumbers(input, [6, 4]);
        drawIsoscelesTriangle(base, height, offsetX, offsetY);
        nextLabelIndex += 3;
      }
      console.log(`✅ Triangle ajouté`);
    }
    // CERCLES
    else if (input.includes("cercle")) {
      const radius = extractNumber(input, 3);
      drawCircle(radius, offsetX, offsetY);
      nextLabelIndex += 2; // O et A
      console.log(`✅ Cercle ajouté (rayon: ${radius})`);
    }
    // RECTANGLES
    else if (input.includes("rectangle")) {
      const [width, height] = extractTwoNumbers(input, [5, 3]);
      drawRectangle(width, height, offsetX, offsetY);
      nextLabelIndex += 4;
      console.log(`✅ Rectangle ajouté (${width} × ${height})`);
    }
    // LOSANGES
    else if (input.includes("losange")) {
      const side = extractNumber(input, 5);
      drawRhombus(side, offsetX, offsetY);
      nextLabelIndex += 4;
      console.log(`✅ Losange ajouté (côté: ${side})`);
    }
    // PARALLÉLOGRAMMES
    else if (input.includes("parallélogramme") || input.includes("parallelogramme")) {
      const [width, height] = extractTwoNumbers(input, [5, 3]);
      drawParallelogram(width, height, offsetX, offsetY);
      nextLabelIndex += 4;
      console.log(`✅ Parallélogramme ajouté`);
    }
    // TRAPÈZES
    else if (input.includes("trapèze") || input.includes("trapeze")) {
      const [base1, base2, height] = extractThreeNumbers(input, [6, 4, 3]);
      if (input.includes("rectangle")) {
        drawRightTrapezoid(base1, base2, height, offsetX, offsetY);
      } else {
        drawTrapezoid(base1, base2, height, offsetX, offsetY);
      }
      nextLabelIndex += 4;
      console.log(`✅ Trapèze ajouté`);
    }
    // HEXAGONES
    else if (input.includes("hexagone")) {
      const side = extractNumber(input, 4);
      drawHexagon(side, offsetX, offsetY);
      nextLabelIndex += 6;
      console.log(`✅ Hexagone ajouté (côté: ${side})`);
    }
    // POLYGONES RÉGULIERS
    else if (input.includes("polygone")) {
      const sides = extractNumber(input, 6);
      const sideLength = 4;
      drawRegularPolygon(sides, sideLength, offsetX, offsetY);
      nextLabelIndex += sides;
      console.log(`✅ Polygone régulier ajouté (${sides} côtés)`);
    }
    else {
      alert("Type de figure non reconnu. Essayez: carré, triangle, cercle, rectangle, etc.");
      return;
    }
    
    // Mettre à jour l'affichage
    board.update();
    
    // L'aimantation magnétique est gérée automatiquement par addDraggingToPolygon()
    
    // Sauvegarder l'état APRÈS l'ajout
    setTimeout(() => {
      saveState();
    }, 100);
    
    // Nettoyer le champ
    document.getElementById("creatorPromptInput").value = '';
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout:', error);
    alert('Erreur lors de l\'ajout de la figure: ' + error.message);
  }
  
  // Réinitialiser les offsets
  window.currentOffsetX = 0;
  window.currentOffsetY = 0;
}

/**
 * Génère les prochains labels alphabétiques
 */
function generateNextLabels(count) {
  const labels = [];
  for (let i = 0; i < count; i++) {
    const index = nextLabelIndex + i;
    labels.push(String.fromCharCode(65 + (index % 26))); // A-Z puis recommence
  }
  return labels;
}

/**
 * Met à jour la liste des figures dans l'interface
 */
function updateFiguresList() {
  const listContainer = document.getElementById('figuresList');
  const countSpan = document.getElementById('figureCount');
  
  // Si les éléments n'existent pas, ne rien faire (figures complexes désactivé)
  if (!listContainer || !countSpan) return;
  
  listContainer.innerHTML = '';
  countSpan.textContent = sceneFigures.length;
  
  sceneFigures.forEach((figure, index) => {
    const item = document.createElement('div');
    item.className = 'figure-item';
    item.innerHTML = `
      <div class="figure-item-info">
        <span class="figure-item-name">#${index + 1} ${figure.labels}</span>
        <span class="figure-item-desc">${figure.type}</span>
      </div>
      <div class="figure-item-actions">
        <button class="btn-toggle" onclick="toggleFigureVisibility(${figure.id})">
          ${figure.visible ? '👁️' : '👁️‍🗨️'}
        </button>
        <button class="btn-delete" onclick="deleteFigure(${figure.id})">
          🗑️
        </button>
      </div>
    `;
    listContainer.appendChild(item);
  });
}

/**
 * Bascule la visibilité d'une figure
 */
function toggleFigureVisibility(id) {
  const figure = sceneFigures.find(f => f.id === id);
  if (figure) {
    figure.visible = !figure.visible;
    updateFiguresList();
    // TODO: Masquer/afficher réellement la figure sur le board
    console.log(`👁️ Visibilité de la figure ${id}: ${figure.visible}`);
  }
}

/**
 * Supprime une figure de la scène
 */
function deleteFigure(id) {
  sceneFigures = sceneFigures.filter(f => f.id !== id);
  updateFiguresList();
  // TODO: Supprimer réellement la figure du board
  console.log(`🗑️ Figure ${id} supprimée`);
}

/**
 * Efface toutes les figures de la scène
 */
function clearAllFigures() {
  if (sceneFigures.length > 0) {
    if (!confirm('Voulez-vous vraiment effacer toutes les figures ?')) {
      return;
    }
  }
  
  sceneFigures = [];
  nextLabelIndex = 0;
  
  // Mettre à jour l'interface si elle existe
  const listContainer = document.getElementById('figuresList');
  if (listContainer) {
    updateFiguresList();
  }
  
  // Nettoyer le board seulement s'il y a des objets
  if (board && board.objectsList && board.objectsList.length > 0) {
    const objectsCopy = [...board.objectsList];
    objectsCopy.forEach(obj => {
      try {
        board.removeObject(obj);
      } catch (e) {
        console.warn('Erreur lors de la suppression d\'un objet:', e);
      }
    });
  }
  
  // Effacer l'historique après tout effacement
  clearHistory();
  
  console.log('🧹 Toutes les figures ont été effacées');
}