# 🔧 Diagnostic et Solutions - FormCloud

## Problème Principal
**Les données ne s'enregistrent pas dans la base de données Supabase**

---

## 🔍 Causes Identifiées

### 1. ❌ Colonne `user_id` manquante dans la table `forms`
- Le schéma initial (`database-schema.sql`) ne crée pas la colonne `user_id`
- Le fichier `auth-schema-update.sql` contient le SQL pour l'ajouter, **mais il n'a pas été exécuté**
- Cela cause des conflits entre le code et la DB

### 2. ❌ Politiques RLS inconsistentes
- Les politiques actuelles autorisent tout le monde (`USING (true)`)
- Les politiques dans `auth-schema-update.sql` font référence à `user_id` qui n'existe pas
- Si les deux sont appliquées, cela crée des conflits

### 3. ❌ Configuration du schéma incomplète
- Le schéma initial n'est pas cohérent avec les migrations planifiées
- Deux versions d'API existent (`api.js` et `api-temp.js`) causant de la confusion

---

## ✅ Solutions à Appliquer

### Option A: Configuration SIMPLE (Recommandée pour développement)
**Utiliser API sans authentification pour le moment**

#### Étape 1: Mettre à jour le schéma de base de données
Exécutez ce SQL dans le **SQL Editor de Supabase**:

```sql
-- 1. Modifier les politiques RLS existantes pour permettre les opérations
DROP POLICY IF EXISTS "Enable read access for all users" ON forms;
DROP POLICY IF EXISTS "Enable insert for all users" ON forms;
DROP POLICY IF EXISTS "Enable update for all users" ON forms;
DROP POLICY IF EXISTS "Enable delete for all users" ON forms;

-- 2. Créer des politiques RLS permissives (développement)
CREATE POLICY "Enable all operations on forms" ON forms FOR ALL USING (true) WITH CHECK (true);

-- 3. Faire la même chose pour les autres tables
DROP POLICY IF EXISTS "Enable read access for all users" ON questions;
DROP POLICY IF EXISTS "Enable insert for all users" ON questions;
DROP POLICY IF EXISTS "Enable update for all users" ON questions;
DROP POLICY IF EXISTS "Enable delete for all users" ON questions;

CREATE POLICY "Enable all operations on questions" ON questions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON responses;
DROP POLICY IF EXISTS "Enable insert for all users" ON responses;
DROP POLICY IF EXISTS "Enable update for all users" ON responses;
DROP POLICY IF EXISTS "Enable delete for all users" ON responses;

CREATE POLICY "Enable all operations on responses" ON responses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON response_details;
DROP POLICY IF EXISTS "Enable insert for all users" ON response_details;
DROP POLICY IF EXISTS "Enable update for all users" ON response_details;
DROP POLICY IF EXISTS "Enable delete for all users" ON response_details;

CREATE POLICY "Enable all operations on response_details" ON response_details FOR ALL USING (true) WITH CHECK (true);
```

#### Étape 2: Tester les opérations de création
- Accédez à http://localhost:3000/create
- Créez un formulaire de test
- Vérifiez dans Supabase Dashboard → Table Editor que les données apparaissent

---

### Option B: Configuration SÉCURISÉE (Recommandée pour production)
**Utiliser API avec authentification et politiques RLS basées sur l'utilisateur**

#### Étape 1: Ajouter la colonne `user_id`
```sql
-- Ajouter la colonne user_id à la table forms
ALTER TABLE forms ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Remplir les formulaires existants avec une valeur par défaut (si nécessaire)
UPDATE forms SET user_id = '00000000-0000-0000-0000-000000000000' WHERE user_id IS NULL;

-- Rendre la colonne NOT NULL
ALTER TABLE forms ALTER COLUMN user_id SET NOT NULL;
```

#### Étape 2: Appliquer les politiques RLS sécurisées
Exécutez le contenu du fichier `auth-schema-update.sql` complet

#### Étape 3: Utiliser `api.js` au lieu de `api-temp.js`
Mettez à jour les imports dans les pages:
```javascript
// ❌ À changer
import { formsApi, responsesApi } from '../../lib/api-temp'

// ✅ Vers
import { formsApi, responsesApi } from '../../lib/api'
```

---

## 🧪 Test de Diagnostic

Exécutez ce test dans la console du navigateur pour vérifier que Supabase fonctionne:

```javascript
// Ouvrir DevTools → Console
import { supabase } from './app/lib/supabase.js'

// Test 1: Vérifier la connexion
const { data, error } = await supabase.from('forms').select('*').limit(1)
console.log('Test connexion:', error ? '❌ ERREUR:' + error.message : '✅ OK')

// Test 2: Tenter une insertion
const { data: form, error: insertError } = await supabase
  .from('forms')
  .insert([{ title: 'Test', description: 'Test form' }])
  .select()
  .single()

console.log('Test insertion:', insertError ? '❌ ERREUR:' + insertError.message : '✅ Créé avec ID:' + form.id)
```

---

## 📋 Checklist pour Resynchroniser

- [ ] **Choisir Option A (simple) ou Option B (sécurisée)**
- [ ] **Exécuter le SQL approprié dans Supabase**
- [ ] **Tester la création d'un formulaire**
- [ ] **Vérifier les données dans le Table Editor de Supabase**
- [ ] **Si OK, mettre à jour les imports des pages**
- [ ] **Redémarrer le serveur Next.js**

---

## 📞 Si Ça Ne Marche Toujours Pas

Vérifiez:

1. ✅ **Les variables d'environnement** dans `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://flnpxcedutkqrpmlkzyq.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_C5BuDu1UILkLtqLSly9Ycw_VviSu6R1
   ```

2. ✅ **RLS est activé** sur les tables (Dashboard → Security → Row Level Security)

3. ✅ **Les politiques RLS** autorisant les opérations
   
4. ✅ **Les types de colonnes** correspondent aux données insérées

5. ✅ **Regardez les logs Supabase** (Dashboard → Logs)

---

## 🎯 Recommandation Finale

**Pour démarrer rapidement**: Utilisez **Option A** (configuration simple) maintenant.  
**Pour production**: Migrez vers **Option B** avec authentification complète.
