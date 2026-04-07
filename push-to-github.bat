@echo off
REM Script pour initialiser git et pousser vers GitHub
REM Exécutez ce script après avoir:
REM 1. Installé Git (https://git-scm.com/download/win)
REM 2. Créé un repository vide sur GitHub.com
REM 3. Édité ce script pour ajouter votre USERNAME GitHub

setlocal enabledelayedexpansion

echo.
echo ============================================
echo   FormCloud - GitHub Push Script
echo ============================================
echo.

REM MODIFIEZ CES VALEURS
set GITHUB_USERNAME=votre-username
set GITHUB_REPO=formcloud
set GITHUB_EMAIL=votre.email@gmail.com
set GITHUB_NAME=Votre Nom

REM Vérifier si les valeurs sont remplies
if "%GITHUB_USERNAME%"=="votre-username" (
    echo.
    echo ❌ ERREUR: Veuillez éditer ce script et remplacer:
    echo    - GITHUB_USERNAME par votre username
    echo    - GITHUB_NAME par votre nom
    echo    - GITHUB_EMAIL par votre email
    echo.
    pause
    exit /b 1
)

echo ✓ Configuration:
echo   - Username: %GITHUB_USERNAME%
echo   - Repository: %GITHUB_REPO%
echo   - Email: %GITHUB_EMAIL%
echo   - Name: %GITHUB_NAME%
echo.

REM Vérifier si git est installé
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git n'est pas installé!
    echo    Téléchargez et installez Git: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo ✓ Git détecté
echo.

REM Configurer git (si première fois)
echo [1/5] Configuration de Git...
git config --global user.name "%GITHUB_NAME%" >nul 2>&1
git config --global user.email "%GITHUB_EMAIL%" >nul 2>&1
echo ✓ Configuration Git: OK
echo.

REM Initialiser repository
echo [2/5] Initialisation du repository...
if exist .git (
    echo ⚠ Repository déjà initialisé, on continue...
) else (
    git init
    echo ✓ Repository initialisé
)
echo.

REM Ajouter tous les fichiers
echo [3/5] Ajout des fichiers...
git add .
echo ✓ Fichiers ajoutés
echo.

REM Premier commit
echo [4/5] Création du commit...
git commit -m "Initial commit: FormCloud application setup" >nul 2>&1
if errorlevel 1 (
    echo ⚠ Git commit échoué - vérifier l'état
) else (
    echo ✓ Commit créé
)
echo.

REM Configurer remote
echo [5/5] Connexion à GitHub...
set REMOTE_URL=https://github.com/%GITHUB_USERNAME%/%GITHUB_REPO%.git

REM Vérifier si remote existe déjà
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    git remote add origin %REMOTE_URL%
    echo ✓ Remote ajouté: %REMOTE_URL%
) else (
    git remote set-url origin %REMOTE_URL%
    echo ✓ Remote mis à jour: %REMOTE_URL%
)

REM Renommer en main
git branch -M main >nul 2>&1

REM Pousser
echo.
echo [FINAL] Envoi du code vers GitHub...
echo URL: %REMOTE_URL%
echo.
git push -u origin main

if errorlevel 1 (
    echo.
    echo ❌ ERREUR lors du push!
    echo.
    echo Vérifiez:
    echo   1. Repository créé sur https://github.com/new ✓
    echo   2. Repository est vide (pas de README)
    echo   3. URL correcte: %REMOTE_URL%
    echo   4. Authentification GitHub configurée
    echo.
    echo Pour HTTPS, vous pouvez aussi utiliser: https://github.com/settings/tokens
    echo.
) else (
    echo.
    echo ✅ SUCCESS! Votre code est sur GitHub!
    echo.
    echo URL: %(REMOTE_URL)
    echo.
    echo 🚀 Prochaine étape:
    echo   1. Allez sur https://vercel.com/new
    echo   2. Importez le repository %GITHUB_USERNAME%/%GITHUB_REPO%
    echo   3. Ajoutez les variables Supabase
    echo   4. Déployez!
    echo.
)

pause
