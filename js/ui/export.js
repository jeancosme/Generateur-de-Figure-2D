// js/ui/export.js

async function exportBoardToSVG(filename = null) {
  console.log('📤 Export SVG en cours...');
  
  if (!board) {
    alert('Aucune figure à exporter');
    return;
  }

  try {
    // Créer un canvas temporaire
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Définir la taille du canvas
    const container = document.getElementById('jxgbox');
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Fond blanc
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Obtenir l'image du board JSXGraph
    const imgData = canvas.toDataURL('image/png');
    
    // Créer le contenu SVG
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
     width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}">
  <rect width="100%" height="100%" fill="white"/>
  <image width="${canvas.width}" height="${canvas.height}" xlink:href="${imgData}"/>
</svg>`;

    // Créer le fichier de téléchargement
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `figure-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Nettoyer
    URL.revokeObjectURL(url);
    
    console.log('✅ Export SVG terminé');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'export:', error);
    alert('Erreur lors de l\'export SVG');
  }
}

console.log('✅ Export.js chargé');