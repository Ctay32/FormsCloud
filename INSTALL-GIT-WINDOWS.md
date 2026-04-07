# 🔧 Installer Git sur Windows

**Git n'est pas trouvé sur votre ordinateur. Voici comment l'installer en 5 minutes.**

## ⬇️ Étape 1: Télécharger Git

1. **Allez sur**: https://git-scm.com/download/win
2. **Téléchargez** l'installateur Windows (fichier `.exe`)
   - Version 64-bit recommandée
   - Généralement: `Git-2.x.x-64-bit.exe`

---

## 🚀 Étape 2: Installer Git

### A. Exécuter l'Installateur
1. Double-cliquez sur le fichier `.exe` téléchargé
2. Windows demandera "Voulez-vous autoriser?" → Cliquez **Oui**

### B. Configuration de l'Installation

#### Screen 1: Bienvenue
- Cliquez **Next**

#### Screen 2: Chemin d'Installation
- **Laissez par défaut** `C:\Program Files\Git`
- Cliquez **Next**

#### Screen 3: Composants à Installer
- ✅ **Garder tout coché** (par défaut)
- Cliquez **Next**

#### Screen 4: Menu Démarrage
- Laissez par défaut
- Cliquez **Next**

#### Screen 5: Éditeur par Défaut
- Laissez **Nano** ou **Vim** (peu importe)
- Cliquez **Next**

#### Screen 6: Configurer le Terminal
- **Sélectionnez**: "Use Windows' default console window"
- Cliquez **Next**

#### Screen 7: Configurer Git Pull
- **Sélectionnez**: "Default (fast-forward or merge)"
- Cliquez **Next**

#### Screen 8: Gestionnaire des Credentials (Important!)
- **Sélectionnez**: "Git Credential Manager"
- Cliquez **Next**

#### Screen 9: Options Supplémentaires
- ✅ **Uncheck** "Enable file system caching"
- Cliquez **Next**

#### Screen 10: Expérimental
- ✅ **Laissez tout unchecked**
- Cliquez **Install**

### C. Terminer l'Installation
- Attendez que l'installation se termine
- Cliquez **Finish**

---

## 🔄 Étape 3: Redémarrer l'Ordinateur

**IMPORTANT**: Redémarrez votre ordinateur pour que Git soit completement accessible!

1. Fermez VS Code et autres applications
2. Cliquez **Démarrer** → **Arrêter**
3. Sélectionnez **Redémarrer**
4. Attendez que l'ordinateur redémarre

---

## ✅ Étape 4: Vérifier l'Installation

Après le redémarrage:

1. **Ouvrez PowerShell** ou **Terminal Windows**
   - Appuyez sur `Win + X` → Terminal Windows

2. **Tapez**:
   ```powershell
   git --version
   ```

3. **Vous devez voir**:
   ```
   git version 2.45.0 (ou une version récente)
   ```

Si vous voyez cette version, Git est ✅ **correctement installé**!

---

## 🚀 Étape 5: Pousser le Code sur GitHub

Une fois Git installé et l'ordinateur redémarré:

### Option A: Utiliser le Script Automatisé (Recommandé)

```powershell
cd "c:\Users\odrad\OneDrive\Documents\projet formcloud"
.\install-and-push.bat
```

Le script fera tout automatiquement!

### Option B: Commandes Manuelles

```powershell
cd "c:\Users\odrad\OneDrive\Documents\projet formcloud"

# Configuration
git config --global user.name "Ctay32"
git config --global user.email "votre.email@gmail.com"

# Initialiser et pousser
git init
git add .
git commit -m "Initial commit: FormCloud application setup"
git remote add origin https://github.com/Ctay32/FormsCloud.git
git branch -M main
git push -u origin main
```

---

## 🔐 Authentification GitHub

Quand vous lancez `git push`, Git demandera une **authentification**.

### Méthode 1: Personal Access Token (Recommandé)

1. Allez sur https://github.com/settings/tokens
2. Cliquez **Generate new token**
3. **Token name**: `FormCloud Push`
4. **Expiration**: 90 days
5. **Scopes**: Cochez `repo` (accès complet au repository)
6. Cliquez **Generate token**
7. **Copiez le token** (c'est votre mot de passe temporaire)
8. Quand Git demande le mot de passe:
   - **Username**: `Ctay32`
   - **Password**: Collez le token

### Méthode 2: Git Credential Manager (Plus Simple)

Si vous avez sélectionné "Git Credential Manager" lors de l'installation:
1. Quand Git demande, un navigateur s'ouvrira
2. Connectez-vous à GitHub
3. Autorisez l'accès
4. **C'est fait!** Git mémorisera vos credentials

---

## 🎯 Après le Push

Votre code sera accessible sur:
```
https://github.com/Ctay32/FormsCloud
```

Vous pouvez alors:
- 📖 Voir votre code sur GitHub
- 🚀 Déployer sur Vercel en 2 clics
- 📝 Partager le lien avec d'autres

---

## 🚨 Problèmes Communs

### Problème: "git is not installed"
**Solution**: 
- Vous avez oublié de redémarrer l'ordinateur après l'installation
- Redémarrez et réessayez

### Problème: "fatal: not a git repository"
**Solution**:
- Vous n'êtes pas dans le bon dossier
- Utilisez: `cd "c:\Users\odrad\OneDrive\Documents\projet formcloud"`

### Problème: "Permission denied" ou authentification échoue
**Solution**:
- Utilisez un Personal Access Token au lieu du mot de passe GitHub
- Voir "Authentification GitHub" ci-dessus

### Problème: "fatal: 'origin' already exists"
**Solution**:
```powershell
git remote remove origin
git remote add origin https://github.com/Ctay32/FormsCloud.git
```

---

## 📋 Checklist Complète

- [ ] Git téléchargé (https://git-scm.com/download/win)
- [ ] Installateur exécuté avec options par défaut
- [ ] Ordinateur redémarré
- [ ] `git --version` fonctionne ✅
- [ ] Repository GitHub créé et vide
- [ ] Script `install-and-push.bat` exécuté OU commandes manuelles tapées
- [ ] Code visible sur https://github.com/Ctay32/FormsCloud

---

## ✨ Prochaines Étapes (Après le Push)

Une fois le code sur GitHub:

1. **Allez sur Vercel**: https://vercel.com/new
2. **Importez**: `Ctay32/FormsCloud`
3. **Ajoutez les variables Supabase**
4. **Cliquez Deploy**
5. **Votre app sera live en 1-2 minutes!** 🎉

---

**Besoin d'aide supplémentaire?**
- Git Docs: https://git-scm.com/doc
- GitHub Help: https://docs.github.com
- Vercel Docs: https://vercel.com/docs
