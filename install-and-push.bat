@echo off
REM Installation et Push Git - FormCloud
REM Ce script installe Git et pousse le code vers GitHub

echo.
echo ============================================
echo   FormCloud - Git Installation & Push
echo ============================================
echo.

REM Vérifier si Git est déjà installé
git --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ⚠ Git n'est pas installé!
    echo.
    echo Pour installer Git:
    echo 1. Ouvrez ce lien dans votre navigateur:
    echo    https://git-scm.com/download/win
    echo.
    echo 2. Téléchargez l'installateur Git
    echo.
    echo 3. Exécutez l'installateur et acceptez les options par défaut
    echo.
    echo 4. REDÉMARREZ votre ordinateur
    echo.
    echo 5. Relancez ce script après le redémarrage
    echo.
    pause
    exit /b 1
)

echo ✓ Git détecté!
echo.

REM Configuration Git
echo [1/6] Configuration de Git...
git config --global user.name "Ctay32"
git config --global user.email "votre.email@gmail.com"
echo ✓ Configuration OK
echo.

REM Initialiser Git
echo [2/6] Initialisation du repository...
git init
echo ✓ Repository initialisé
echo.

REM Stageur les fichiers
echo [3/6] Ajout des fichiers...
git add .
echo ✓ Fichiers ajoutés
echo.

REM Créer le commit
echo [4/6] Création du commit...
git commit -m "Initial commit: FormCloud application setup"
if errorlevel 1 (
    echo ⚠ Commit échoué - repository peut être déjà initialisé
) else (
    echo ✓ Commit créé
)
echo.

REM Connecter à GitHub
echo [5/6] Connexion à GitHub...
git remote add origin https://github.com/Ctay32/FormsCloud.git >nul 2>&1
if errorlevel 1 (
    git remote set-url origin https://github.com/Ctay32/FormsCloud.git
    echo ✓ Remote mis à jour
) else (
    echo ✓ Remote ajouté
)
echo.

REM Renommer en main
git branch -M main >nul 2>&1
echo ✓ Branche renommée en main
echo.

REM Push vers GitHub
echo [6/6] Push vers GitHub...
echo.
git push -u origin main

if errorlevel 1 (
    echo.
    echo ❌ ERREUR lors du push!
    echo.
    echo Vérifiez:
    echo 1. Avez-vous créé le repository sur GitHub?
    echo    https://github.com/Ctay32/FormsCloud
    echo.
    echo 2. Le repository est-il vide (sans README)?
    echo.
    echo 3. Avez-vous accès à GitHub?
    echo.
    echo 4. Pour authentification, vous pouvez utiliser:
    echo    - Un Personal Access Token
    echo    - OAuth (GitHub vous demandera)
    echo.
) else (
    echo.
    echo ✅ SUCCESS! Code poussé sur GitHub!
    echo.
    echo URL: https://github.com/Ctay32/FormsCloud
    echo.
    echo 🚀 Prochaine étape: Déployer sur Vercel
    echo    1. Allez sur https://vercel.com/new
    echo    2. Importez le repository FormsCloud
    echo    3. Ajoutez les variables Supabase
    echo    4. Cliquez Deploy!
    echo.
)

pause
