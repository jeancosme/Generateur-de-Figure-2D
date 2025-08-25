// js/ui/suggestions.js

// Liste des suggestions disponibles
const suggestionsList = [
  "carré de côté 4",
  "cercle de rayon 2", 
  "hexagone de côté 4",
  "losange de côté 5",
  "parallélogramme base 5 hauteur 3",
  "pentagone de côté 4",
  "rectangle de 5 sur 3",
  "triangle équilatéral de côté 4",
  "triangle isocèle de base 6 et hauteur 4",
  "triangle rectangle de base 3 et hauteur 4"
];

let selectedSuggestionIndex = -1;

function initializeSuggestions() {
  const input = document.getElementById("promptInput");
  const suggestionBox = document.getElementById("suggestionBox");
  
  if (!input || !suggestionBox) {
    console.warn('⚠️ Éléments de suggestions manquants');
    return;
  }

  console.log('🔍 Initialisation du système de suggestions');

  // Event listener pour la saisie
  input.addEventListener("input", function() {
    const query = this.value.toLowerCase();
    showSuggestions(query);
  });

  // Event listeners pour les touches
  input.addEventListener("keydown", function(e) {
    const suggestions = suggestionBox.querySelectorAll('.suggestion-item');
    
    if (suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, suggestions.length - 1);
      updateSuggestionHighlight(suggestions);
    } 
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
      updateSuggestionHighlight(suggestions);
    } 
    else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
        const selectedSuggestion = suggestions[selectedSuggestionIndex];
        applySuggestion(selectedSuggestion.textContent);
      } else {
        generateFigure();
      }
    } 
    else if (e.key === "Tab") {
      e.preventDefault();
      if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
        const selectedSuggestion = suggestions[selectedSuggestionIndex];
        applySuggestion(selectedSuggestion.textContent);
      }
    } 
    else if (e.key === "Escape") {
      hideSuggestions();
    }
  });

  // Cacher les suggestions quand on clique ailleurs
  document.addEventListener("click", function(e) {
    if (!input.contains(e.target) && !suggestionBox.contains(e.target)) {
      hideSuggestions();
    }
  });
}

function showSuggestions(query) {
  const suggestionBox = document.getElementById("suggestionBox");
  
  if (!query.trim()) {
    hideSuggestions();
    return;
  }

  // Filtrer les suggestions
  const filteredSuggestions = suggestionsList.filter(suggestion =>
    suggestion.toLowerCase().includes(query)
  );

  if (filteredSuggestions.length === 0) {
    hideSuggestions();
    return;
  }

  // Créer les éléments de suggestion
  suggestionBox.innerHTML = '';
  filteredSuggestions.forEach((suggestion, index) => {
    const suggestionItem = document.createElement('div');
    suggestionItem.className = 'suggestion-item';
    suggestionItem.textContent = suggestion;
    
    // Event listener pour le clic
    suggestionItem.addEventListener('click', function() {
      applySuggestion(suggestion);
    });
    
    // Event listener pour hover
    suggestionItem.addEventListener('mouseenter', function() {
      selectedSuggestionIndex = index;
      updateSuggestionHighlight(suggestionBox.querySelectorAll('.suggestion-item'));
    });

    suggestionBox.appendChild(suggestionItem);
  });

  selectedSuggestionIndex = -1;
  suggestionBox.style.display = 'block';
}

function hideSuggestions() {
  const suggestionBox = document.getElementById("suggestionBox");
  if (suggestionBox) {
    suggestionBox.style.display = 'none';
    selectedSuggestionIndex = -1;
  }
}

function updateSuggestionHighlight(suggestions) {
  suggestions.forEach((suggestion, index) => {
    if (index === selectedSuggestionIndex) {
      suggestion.classList.add('selected');
    } else {
      suggestion.classList.remove('selected');
    }
  });
}

function applySuggestion(suggestion) {
  const input = document.getElementById("promptInput");
  if (input) {
    input.value = suggestion;
    hideSuggestions();
    generateFigure();
  }
}

console.log('✅ Suggestions.js chargé');