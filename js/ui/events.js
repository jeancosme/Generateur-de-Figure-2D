// js/ui/events.js

document.addEventListener('DOMContentLoaded', function() {
  console.log('🎯 Initialisation des événements UI...');

  // === INITIALISER LES SUGGESTIONS ===
  initializeSuggestions();

  // === EVENT LISTENERS DES CHECKBOXES ===
  
  // Angles droits
  const toggleRightAngles = document.getElementById('toggleRightAngles');
  if (toggleRightAngles) {
    toggleRightAngles.addEventListener('change', function() {
      updateRightAngleMarkers(this.checked);
    });
  }

  // Angles égaux
  const toggleEqualAngles = document.getElementById('toggleEqualAngles');
  if (toggleEqualAngles) {
    toggleEqualAngles.addEventListener('change', function() {
      updateEqualAngleMarkers(this.checked);
    });
  }

  // Mesures
  const toggleLengths = document.getElementById('toggleLengths');
  if (toggleLengths) {
    toggleLengths.addEventListener('change', updateLengthLabels);
  }

  // Unités
  const showUnitsCheckbox = document.getElementById('showUnitsCheckbox');
  if (showUnitsCheckbox) {
    showUnitsCheckbox.addEventListener('change', updateLengthLabels);
  }

  const unitSelector = document.getElementById('unitSelector');
  if (unitSelector) {
    unitSelector.addEventListener('change', updateLengthLabels);
  }

  // Codages
  const toggleCodings = document.getElementById('toggleCodings');
  if (toggleCodings) {
    toggleCodings.addEventListener('change', updateCodings);
  }

  // Diagonales
  const toggleDiagonals = document.getElementById('toggleDiagonals');
  if (toggleDiagonals) {
    toggleDiagonals.addEventListener('change', updateDiagonals);
  }

  // Rayon
  const toggleRadius = document.getElementById('toggleRadius');
  if (toggleRadius) {
    toggleRadius.addEventListener('change', updateCircleRadius);
  }

  // Diamètre
  const toggleDiameter = document.getElementById('toggleDiameter');
  if (toggleDiameter) {
    toggleDiameter.addEventListener('change', updateCircleDiameter);
  }

  // === EVENT LISTENERS DE LA LISTE DES FIGURES ===
  const figuresList = document.getElementById('figuresList');
  if (figuresList) {
    figuresList.addEventListener('click', function(e) {
      const li = e.target.closest('li');
      if (li && li.dataset.prompt) {
        const promptInput = document.getElementById('promptInput');
        if (promptInput) {
          promptInput.value = li.dataset.prompt;
          generateFigure();
        }
      }
    });
  }

  console.log('✅ Events.js chargé - Event listeners et suggestions configurés');
});