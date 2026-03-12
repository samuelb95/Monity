@echo off
REM Script de démarrage du projet Monity en mode développement
REM Pour Windows Command Prompt

echo.
echo ================================================================
echo      Démarrage du Projet Monity en Mode Développement
echo ================================================================
echo.

REM Vérifier si Docker est installé
echo Vérification de Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR: Docker n'est pas installé ou n'est pas accessible
    echo Téléchargez Docker Desktop depuis: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)
echo OK - Docker est installé
echo.

REM Vérifier si Docker est en cours d'exécution
echo Vérification du statut de Docker...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR: Docker n'est pas en cours d'exécution
    echo Veuillez lancer Docker Desktop depuis le menu Démarrer
    pause
    exit /b 1
)
echo OK - Docker est en cours d'exécution
echo.

REM Démarrer docker-compose
echo Démarrage de PostgreSQL et Backend...
docker-compose up -d
if %errorlevel% neq 0 (
    echo ERREUR: Impossible de démarrer les services Docker
    pause
    exit /b 1
)
echo OK - Services Docker démarrés avec succès
echo.

REM Attendre que les services démarrent
echo Attente du démarrage complet des services (10 secondes)...
timeout /t 10 /nobreak
echo.

REM Afficher le statut
echo Statut des conteneurs:
docker ps --format "table {{.Names}}\t{{.Status}}"
echo.

echo ================================================================
echo Services disponibles:
echo ================================================================
echo Backend API:    http://localhost:5000
echo Base de données: postgresql://postgres:password@localhost:5432/monity_db
echo.
echo Pour voir les logs: docker-compose logs -f
echo Pour arrêter: docker-compose down
echo.
pause