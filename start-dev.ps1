# Script de démarrage du projet Monity en mode développement
# Pour Windows PowerShell

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║      Démarrage du Projet Monity en Mode Développement      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Docker est installé
Write-Host "🔍 Vérification de Docker..." -ForegroundColor Yellow
$dockerCheck = docker --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Docker est installé: $dockerCheck" -ForegroundColor Green
} else {
    Write-Host "❌ Docker n'est pas installé ou n'est pas accessible" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Vérifier si Docker est en cours d'exécution
Write-Host "🔍 Vérification du statut de Docker..." -ForegroundColor Yellow
$dockerRunning = docker ps 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Docker est en cours d'exécution" -ForegroundColor Green
} else {
    Write-Host "❌ Docker n'est pas en cours d'exécution" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Démarrage de PostgreSQL et Backend..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Services Docker démarrés avec succès" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur lors du démarrage des services Docker" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "⏳ Attente du démarrage complet des services (10 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "📋 Statut des conteneurs:" -ForegroundColor Cyan
docker ps --format "table {{.Names}}\t{{.Status}}"

Write-Host ""
Write-Host "✅ Backend API:    http://localhost:5000" -ForegroundColor Green
Write-Host "✅ Base de données: postgresql://postgres:password@localhost:5432/monity_db" -ForegroundColor Green
Write-Host ""
Write-Host "Pour voir les logs: docker-compose logs -f" -ForegroundColor Gray
Write-Host "Pour arrêter: docker-compose down" -ForegroundColor Gray