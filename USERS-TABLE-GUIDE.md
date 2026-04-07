# 👥 TABLE UTILISATEURS - GUIDE COMPLET

## Vue d'ensemble

FormCloud inclut maintenant une table `users` pour enrichir les profils utilisateur au-delà de ce que propose Supabase Auth.

## ✅ Changements effectués

### 1️⃣ Base de données (USERS-TABLE.sql)

**Table `users`**
- `id` (UUID, clé primaire) - Référence à `auth.users.id`
- `email` (text, unique) - Email utilisateur
- `full_name` (text) - Nom complet
- `avatar_url` (text) - URL de l'avatar
- `bio` (text) - Biographie
- `company` (text) - Entreprise
- `phone_number` (text) - Numéro de téléphone
- `preferences` (jsonb) - Préférences utilisateur (notifications, langue, thème)
- `created_at` - Date de création
- `updated_at` - Dernière modification

**Triggers automatiques**
- `on_auth_user_created` - Crée automatiquement le profil utilisateur lors de l'inscription
- `update_users_updated_at` - Met à jour le timestamp à chaque modification

**RLS Policies**
- Les utilisateurs ne voient que leur propre profil
- Les utilisateurs peuvent modifier leur profil
- Les profils publics sont visibles à tous (pour les partages futurs)

### 2️⃣ API JavaScript (app/lib/users.js)

Nouvelles méthodes:

```javascript
// Récupérer le profil de l'utilisateur connecté
await usersApi.getCurrentProfile()

// Mettre à jour le profil
await usersApi.updateProfile({
  full_name: "Jean Dupont",
  bio: "Créateur de formulaires",
  company: "Mon Entreprise",
  phone_number: "+33 1 23 45 67 89"
})

// Mettre à jour l'avatar
await usersApi.updateAvatar(file)

// Mettre à jour les préférences
await usersApi.updatePreferences({
  notifications: false,
  language: "en",
  theme: "dark"
})

// Obtenir un profil public (ID utilisateur)
await usersApi.getPublicProfile(userId)

// Supprimer le compte (CASCADE supprime toutes les données)
await usersApi.deleteAccount()
```

### 3️⃣ Composant UserProfile (app/components/UserProfile.js)

**Nouveau:**
- Affiche le profil utilisateur enrichi
- Permet d'éditer le profil en ligne (nom, entreprise, téléphone, bio)
- Affiche l'avatar utilisateur
- Affiche les informations du profil dans le dropdown

**Avant:**
- Juste le dropdown avec déconnexion

## 📋 TODO: Étapes à suivre

### 1️⃣ Exécuter USERS-TABLE.sql (OBLIGATOIRE)

```sql
Aller dans Supabase > SQL Editor > New Query
Copier le contenu de: /USERS-TABLE.sql
Exécuter (Ctrl+Entrée)
```

**Résultat attendu:**
```
SUCCESS: Users table created with triggers and RLS policies configured!
```

### 2️⃣ Exécuter RLS-POLICIES.sql (si pas déjà fait)

Si vous n'avez pas encore exécuté les RLS policies pour forms/questions/responses, exécutez:
```
/RLS-POLICIES.sql
```

### 3️⃣ Tester la création de compte

1. Allez à `http://localhost:3000/auth`
2. Créez un nouveau compte (email + mot de passe)
3. Vérifiez dans Supabase que:
   - Un utilisateur est créé dans `auth.users`
   - Un profil est créé automatiquement dans la table `users`

### 4️⃣ Tester l'édition du profil

1. Connectez-vous
2. Cliquez sur votre avatar dans la barre en haut à droite
3. Cliquez sur "Modifier le profil"
4. Modifiez votre nom, entreprise, téléphone, bio
5. Cliquez sur "Enregistrer"
6. Vérifiez que les données sont sauvegardées dans Supabase > `users` table

## 🔐 Sécurité

### Synchronisation automatique
Le trigger `on_auth_user_created` crée automatiquement un profil utilisateur dès que quelqu'un s'inscrit. Aucun code supplémentaire requis.

### Suppression en cascade
Si un utilisateur supprime son compte (DELETE CASCADE), toutes ses données sont supprimées:
- ✅ Profil utilisateur (`users`)
- ✅ Formulaires (`forms`)
- ✅ Questions (`questions`)
- ✅ Réponses (`responses`)
- ✅ Détails des réponses (`response_details`)

### RLS Protection
- Chaque utilisateur ne peut voir/modifier que son propre profil
- Les données sensibles sont protégées au niveau base de données

## 💾 Structure de données préférences

Les préférences sont stockées en JSON et peuvent contenir:

```json
{
  "notifications": true,
  "language": "fr",
  "theme": "light",
  "newsletter": false,
  "emailUpdates": true,
  "autoSave": true,
  "customField1": "valeur"
}
```

## 🔌 Intégration avec le reste de l'app

### Dans les formulaires
Le `user_id` du propriétaire est automatiquement stocké dans `forms.user_id`

### Dans les réponses
Les profils publics peuvent être affichés si on partage un formulaire:
```javascript
const ownerProfile = await usersApi.getPublicProfile(form.user_id)
```

### Dans les pages
Importez et utilisez:
```javascript
import { usersApi } from '../lib/users'

const profile = await usersApi.getCurrentProfile()
```

## 📁 Architecture

```
app/
  lib/
    users.js          ← API pour les profils
    auth.js           ← Authentification Supabase
    api.js            ← Formulaires (avec user_id)
    api-temp.js       ← Réponses publiques
  components/
    UserProfile.js    ← Affichage/édition profil
  page.js             ← Dashboard
  auth/
    page.js           ← Page d'authentification

Base de données Supabase:
  auth.users          ← Authentification (Supabase)
  public.users        ← Profils enrichis (notre table)
  public.forms        ← Formulaires (avec user_id)
  public.questions    ← Questions
  public.responses    ← Réponses
  public.response_details ← Détails réponses
```

## ⚠️ Points importants

- **Pas de modification directe de `auth.users`** - C'est Supabase qui gère
- **La table `users` se crée automatiquement** via le trigger `on_auth_user_created`
- **Suppression en cascade** - Supprimer un utilisateur supprime tout
- **RLS est obligatoire** - Sans RLS, l'isolation des données ne fonctionne pas
- **`user_id` dans les formulaires** - Tous les formulaires sont liés à `forms.user_id`

## 🚀 Prochains appels

1. Exécuter `USERS-TABLE.sql` dans Supabase
2. Créer un compte de test
3. Vérifier que le profil s'affiche et peut être édité
4. Créer un formulaire et vérifier qu'il s'affiche au dashboard
5. Tester l'isolation: créer un 2e compte et vérifier qu'il ne voit pas les données du 1er compte
