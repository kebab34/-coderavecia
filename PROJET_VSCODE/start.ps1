# Script de démarrage pour l'atelier IA générative
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Atelier IA Generative - Demarrage" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Vérification des prérequis..." -ForegroundColor Yellow
Write-Host ""

# Vérifier si Docker est installé
try {
    $dockerVersion = docker --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker est installé: $dockerVersion" -ForegroundColor Green
    } else {
        throw "Docker non trouvé"
    }
} catch {
    Write-Host "❌ Docker n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    Write-Host "Veuillez installer Docker Desktop" -ForegroundColor Yellow
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
}

# Vérifier si Ollama est installé
try {
    $ollamaVersion = ollama --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Ollama est installé: $ollamaVersion" -ForegroundColor Green
    } else {
        throw "Ollama non trouvé"
    }
} catch {
    Write-Host "❌ Ollama n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    Write-Host "Veuillez installer Ollama depuis https://ollama.com/download/windows" -ForegroundColor Yellow
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
}

Write-Host ""
Write-Host "Démarrage des services avec Docker Compose..." -ForegroundColor Yellow
docker-compose up --build

Read-Host "Appuyez sur Entrée pour quitter"