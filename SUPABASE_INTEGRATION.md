# Guide d'intégration Supabase pour FormCloud

## 🚀 Étapes de configuration

### 1. Configurer les variables d'environnement

Modifiez le fichier `.env.local` avec vos credentials Supabase :

```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_supabase
```

### 2. Créer les tables dans Supabase

Exécutez le SQL contenu dans `database-schema.sql` dans l'éditeur SQL de votre projet Supabase :

1. Allez dans votre dashboard Supabase
2. Cliquez sur "SQL Editor"
3. Copiez-collez le contenu de `database-schema.sql`
4. Cliquez sur "Run"

### 3. Tables créées

- **forms** : Stocke les formulaires (id, title, description, created_at, updated_at)
- **questions** : Stocke les questions de chaque formulaire (form_id, text, type, order_index)
- **responses** : Stocke les soumissions de formulaires (form_id, submitted_at)
- **response_details** : Stocke les réponses détaillées (response_id, question_id, answer)

### 4. Fonctionnalités implémentées

#### Dashboard (/)
- ✅ Charge les formulaires depuis Supabase
- ✅ Affiche le nombre de réponses
- ✅ Gestion des erreurs et états de chargement

#### Création de formulaire (/create)
- ✅ Crée des formulaires dans Supabase
- ✅ Ajoute les questions associées
- ✅ Validation et gestion des erreurs
- ✅ Redirection automatique après création

#### Réponse au formulaire (/form/[id])
- ✅ Charge dynamiquement le formulaire depuis Supabase
- ✅ Soumet les réponses dans la base de données
- ✅ Validation et confirmation

#### Résultats (/results/[id])
- ✅ Affiche les réponses en temps réel
- ✅ Analyse intelligente des réponses
- ✅ Statistiques et regroupements

## 🔧 API utilisée

### formsApi
- `getAll()` : Récupère tous les formulaires
- `getById(id)` : Récupère un formulaire avec ses questions
- `create(data)` : Crée un nouveau formulaire avec ses questions
- `delete(id)` : Supprime un formulaire

### responsesApi
- `submit(formId, answers)` : Soumet une réponse
- `getByFormId(formId)` : Récupère toutes les réponses d'un formulaire
- `getAnalysis(formId)` : Analyse les réponses

## 🎯 Prochaines améliorations

- [ ] Authentification des utilisateurs
- [ ] Permissions et RLS plus granulaires
- [ ] Export CSV/PDF des résultats
- [ ] Notifications par email
- [ ] Formulaires publiques/privés
- [ ] Upload de fichiers dans les réponses

## 🚨 Sécurité

Le RLS (Row Level Security) est activé mais avec des politiques permissives pour démonstration. En production, vous devriez :

1. Implémenter l'authentification
2. Créer des politiques RLS basées sur l'utilisateur
3. Utiliser les service roles pour les opérations admin

## 🧪 Test

Pour tester l'intégration :

1. Configurez vos variables d'environnement
2. Créez les tables avec le SQL fourni
3. Démarrez l'application : `npm run next-dev`
4. Créez un formulaire, répondez-y, et consultez les résultats
