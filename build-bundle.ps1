# ==========================================
# SCRIPT DE BUILD - Generateur de Figures 2D
# ==========================================
# Combine tous les modules ES6 en un seul fichier script-bundle.js
# Usage: .\build-bundle.ps1

Write-Host "Build du bundle en cours..." -ForegroundColor Cyan
Write-Host ""

# Chemin de sortie
$outputFile = "script-bundle.js"
$tempFile = "temp-bundle.js"

# Ordre de concaténation (du plus bas niveau au plus haut)
$modules = @(
    "js/config.js",
    "js/utils.js", 
    "js/board.js",
    "js/handlers.js",
    "js/drawing.js",
    "js/markers.js",
    "js/effects.js",
    "js/ui.js",
    "js/main.js"
)

# Créer le header
$header = @"
// ==========================================
// GÉNÉRATEUR DE FIGURES 2D - Bundle Version
// ==========================================
// Ce fichier est généré automatiquement par build-bundle.ps1
// Ne pas modifier directement - Modifier les modules dans js/
// Date de build: $(Get-Date -Format "dd/MM/yyyy HH:mm:ss")
// ==========================================

"@

# Ecrire le header
$header | Out-File -FilePath $tempFile -Encoding UTF8

Write-Host "Modules a combiner:" -ForegroundColor Yellow
$modules | ForEach-Object { Write-Host "   - $_" -ForegroundColor Gray }
Write-Host ""

# Traiter chaque module
foreach ($module in $modules) {
    if (Test-Path $module) {
        Write-Host "OK Traitement de $module..." -ForegroundColor Green
        
        # Lire le contenu
        $content = Get-Content $module -Raw -Encoding UTF8
        
        # Retirer les lignes import
        $content = $content -replace "import\s+\{[^}]+\}\s+from\s+['""][^'""]+['""];?\s*\r?\n?", ""
        $content = $content -replace "import\s+[^'""]+\s+from\s+['""][^'""]+['""];?\s*\r?\n?", ""
        
        # Retirer les export (garder juste les déclarations)
        $content = $content -replace "export\s+(function|const|let|var)\s+", "`$1 "
        $content = $content -replace "export\s+\{[^}]+\};?\s*\r?\n?", ""
        
        # Ajouter un séparateur de module
        $separator = @"

// ==========================================
// MODULE: $module
// ==========================================

"@
        
        $separator | Out-File -FilePath $tempFile -Append -Encoding UTF8 -NoNewline
        $content | Out-File -FilePath $tempFile -Append -Encoding UTF8 -NoNewline
        
    } else {
        Write-Host "ERREUR: $module introuvable !" -ForegroundColor Red
        exit 1
    }
}

# Ajouter le footer
$footer = @"


// ==========================================
// FIN DU BUNDLE
// ==========================================
"@

$footer | Out-File -FilePath $tempFile -Append -Encoding UTF8

# Remplacer window.* par des déclarations directes dans main.js
$finalContent = Get-Content $tempFile -Raw -Encoding UTF8

# Nettoyer les DOMContentLoaded imbriqués (garder juste le dernier de main.js)
# On garde l'initialisation du main.js

# Sauvegarder le fichier final
$finalContent | Out-File -FilePath $outputFile -Encoding UTF8

# Supprimer le fichier temporaire
Remove-Item $tempFile

# Statistiques
$lines = (Get-Content $outputFile).Count
$size = (Get-Item $outputFile).Length
$sizeKB = [math]::Round($size / 1KB, 2)

Write-Host ""
Write-Host "Build termine avec succes !" -ForegroundColor Green
Write-Host "Fichier genere: $outputFile" -ForegroundColor Cyan
Write-Host "Taille: $sizeKB KB ($lines lignes)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pour utiliser le bundle:" -ForegroundColor Yellow
Write-Host "   1. Ouvrir index-bundle.html dans un navigateur" -ForegroundColor Gray
Write-Host "   2. Aucun serveur HTTP necessaire !" -ForegroundColor Gray
Write-Host ""
