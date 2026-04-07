# ⚠️ Git Doit Être Installé

Pour pousser votre code vers GitHub à l'URL:
```
https://github.com/Ctay32/FormsCloud.git
```

Vous devez d'abord **installer Git sur Windows**.

## 🔧 Installation de Git

### Étape 1: Télécharger Git
Visitez: **https://git-scm.com/download/win**

### Étape 2: Installer Git
1. Double-cliquez le fichier `.exe` téléchargé
2. Acceptez les conditions de licence
3. Gardez les paramètres par défaut (tout cocher ✅)
4. Finalisez l'installation
5. **Redémarrez votre ordinateur**

### Étape 3: Vérifier l'Installation
Ouvrez PowerShell et tapez:
```powershell
git --version
```
Vous devez voir: `git version 2.x.x`

---

## 🚀 Une Fois Git Installé

Ouvrez PowerShell dans votre dossier formcloud et tapez:

```powershell
cd "c:\Users\odrad\OneDrive\Documents\projet formcloud"

# Configuration Git (première fois seulement)
git config --global user.name "Ctay32"
git config --global user.email "votre.email@gmail.com"

# Initialiser git
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "Initial commit: FormCloud application setup"

# Connecter à votre repository
git remote add origin https://github.com/Ctay32/FormsCloud.git

# Renommer la branche
git branch -M main

# Pousser vers GitHub
git push -u origin main
```

---

## 📝 Note Importante

Il faut que votre repository GitHub soit **créé et vide** avant de pousser.

Si le repository n'existe pas encore sur GitHub:
1. Allez sur https://github.com/Ctay32
2. Créez un nouveau repository: https://github.com/new
3. Nommez-le: `FormsCloud`
4. **Ne cochez PAS** "Initialize with README"
5. Créez le repository

---

## ✅ Après le Push

Votre code sera accessible sur:
```
https://github.com/Ctay32/FormsCloud
```

Et vous pourrez le déployer sur Vercel en 2 clics!

---

## 🎯 Prochaines Étapes

1. **Installer Git** (https://git-scm.com/download/win)
2. **Redémarrer l'ordinateur**
3. **Exécuter les commandes git ci-dessus**
4. **Vérifier sur GitHub** que le code est uploadé

Besoin d'aide? Consultez [GITHUB-VERCEL-SETUP.md](GITHUB-VERCEL-SETUP.md)
