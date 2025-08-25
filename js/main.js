// js/main.js - Version avec nettoyage avant génération

function generateFigure() {
  const input = document.getElementById("promptInput")?.value?.toLowerCase();
  const labelInput = document.getElementById("labelInput")?.value?.trim();
  
  if (!input) {
    console.warn('⚠️ Pas de texte saisi');
    return;
  }

  console.log('🎯 Génération de:', input);

  // === NETTOYAGE OBLIGATOIRE AVANT NOUVELLE FIGURE ===
  clearBoard();

  // === GESTION DES LABELS PERSONNALISÉS ===
  customLabels = [];
  if (labelInput) {
    if (labelInput.includes(",")) {
      customLabels = labelInput.split(',').map(s => s.trim().toUpperCase());
    } else if (labelInput.includes(" ")) {
      customLabels = labelInput.split(' ').map(s => s.trim().toUpperCase());
    } else {
      customLabels = labelInput.toUpperCase().split('');
    }
  }

  // === GÉNÉRATION DE LA FIGURE ===
  let figureGenerated = false;

  try {
    // Carré
    if (input.includes("carré")) {
      const sizeMatch = input.match(/(\d+(?:\.\d+)?)/);
      const size = sizeMatch ? parseFloat(sizeMatch[1]) : 4;
      drawSquare(size);
      figureGenerated = true;
      
    // Rectangle  
    } else if (input.includes("rectangle")) {
      const matches = input.match(/(\d+(?:\.\d+)?)/g);
      if (matches && matches.length >= 2) {
        const width = parseFloat(matches[0]);
        const height = parseFloat(matches[1]);
        drawRectangle(width, height);
      } else {
        drawRectangle(5, 3);
      }
      figureGenerated = true;
      
    // Cercle
    } else if (input.includes("cercle")) {
      const radiusMatch = input.match(/(\d+(?:\.\d+)?)/);
      const radius = radiusMatch ? parseFloat(radiusMatch[1]) : 2;
      drawCircle(radius);
      figureGenerated = true;
      
    // Losange
    } else if (input.includes("losange")) {
      const sideMatch = input.match(/(\d+(?:\.\d+)?)/);
      const side = sideMatch ? parseFloat(sideMatch[1]) : 5;
      drawLosange(side);
      figureGenerated = true;
      
    // Parallélogramme
    } else if (input.includes("parallélogramme") || input.includes("parallelogramme")) {
      const matches = input.match(/(\d+(?:\.\d+)?)/g);
      if (matches && matches.length >= 2) {
        const base = parseFloat(matches[0]);
        const height = parseFloat(matches[1]);
        drawParallelogram(base, height);
      } else {
        drawParallelogram(5, 3);
      }
      figureGenerated = true;
      
    // Triangle équilatéral
    } else if (input.includes("triangle équilatéral") || input.includes("triangle equilateral")) {
      const sideMatch = input.match(/(\d+(?:\.\d+)?)/);
      const side = sideMatch ? parseFloat(sideMatch[1]) : 4;
      drawTriangleEquilateral(side);
      figureGenerated = true;
      
    // Triangle rectangle
    } else if (input.includes("triangle rectangle")) {
      const matches = input.match(/(\d+(?:\.\d+)?)/g);
      if (matches && matches.length >= 2) {
        const base = parseFloat(matches[0]);
        const height = parseFloat(matches[1]);
        drawTriangleRectangle(base, height);
      } else {
        drawTriangleRectangle(3, 4);
      }
      figureGenerated = true;
      
    // Triangle isocèle
    } else if (input.includes("triangle isocèle") || input.includes("triangle isocele")) {
      const matches = input.match(/(\d+(?:\.\d+)?)/g);
      if (matches && matches.length >= 2) {
        const base = parseFloat(matches[0]);
        const height = parseFloat(matches[1]);
        drawTriangleIsocele(base, height);
      } else {
        drawTriangleIsocele(6, 4);
      }
      figureGenerated = true;
      
    // Hexagone
    } else if (input.includes("hexagone")) {
      const sideMatch = input.match(/(\d+(?:\.\d+)?)/);
      const side = sideMatch ? parseFloat(sideMatch[1]) : 4;
      if (typeof drawHexagone === 'function') {
        drawHexagone(side);
        figureGenerated = true;
      }
      
    // Pentagone
    } else if (input.includes("pentagone")) {
      const sideMatch = input.match(/(\d+(?:\.\d+)?)/);
      const side = sideMatch ? parseFloat(sideMatch[1]) : 4;
      if (typeof drawPentagone === 'function') {
        drawPentagone(side);
        figureGenerated = true;
      }
    }

    if (!figureGenerated) {
      alert('❌ Figure non reconnue. Essayez: carré, rectangle, cercle, triangle, losange, parallélogramme');
      return;
    }

    // === APPLIQUER LES FEATURES APRÈS GÉNÉRATION ===
    setTimeout(applyActiveFeatures, 100);
    
    console.log('✅ Figure générée avec succès');
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error);
    alert('Erreur lors de la génération de la figure');
  }
}

function applyActiveFeatures() {
  try {
    // Angles
    if (document.getElementById('toggleRightAngles')?.checked && typeof updateRightAngleMarkers === 'function') {
      updateRightAngleMarkers(true);
    }
    if (document.getElementById('toggleEqualAngles')?.checked && typeof updateEqualAngleMarkers === 'function') {
      updateEqualAngleMarkers(true);
    }
    
    // Mesures
    if (document.getElementById('toggleLengths')?.checked && typeof updateLengthLabels === 'function') {
      updateLengthLabels();
    }
    
    // Codages et diagonales
    if (document.getElementById('toggleCodings')?.checked && typeof updateCodings === 'function') {
      updateCodings();
    }
    if (document.getElementById('toggleDiagonals')?.checked && typeof updateDiagonals === 'function') {
      updateDiagonals();
    }
    
    // Options cercle
    if (document.getElementById('toggleRadius')?.checked && typeof updateCircleRadius === 'function') {
      updateCircleRadius();
    }
    if (document.getElementById('toggleDiameter')?.checked && typeof updateCircleDiameter === 'function') {
      updateCircleDiameter();
    }
  } catch (error) {
    console.warn('⚠️ Erreur lors de l\'application des features:', error);
  }
}

console.log('✅ Main.js chargé');