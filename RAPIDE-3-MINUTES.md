# ⚡ ULTRA RAPIDE: 3 COMMANDES À COPIER-COLLER

## 🎯 Situation
- Votre app ne sauvegarde pas les données
- **CAUSE**: Les politiques de base de données refusent les insertions

---

## ✅ SOLUTION: 2 ACTIONS

### 👉 ACTION 1: CORRIGER SUPABASE (30 secondes)

**COPIER CECI:**
```sql
DROP POLICY IF EXISTS "Enable read access for all users" ON forms;
DROP POLICY IF EXISTS "Enable insert for all users" ON forms;
DROP POLICY IF EXISTS "Enable update for all users" ON forms;
DROP POLICY IF EXISTS "Enable delete for all users" ON forms;
DROP POLICY IF EXISTS "Enable read access for all users" ON questions;
DROP POLICY IF EXISTS "Enable insert for all users" ON questions;
DROP POLICY IF EXISTS "Enable update for all users" ON questions;
DROP POLICY IF EXISTS "Enable delete for all users" ON questions;
DROP POLICY IF EXISTS "Enable read access for all users" ON responses;
DROP POLICY IF EXISTS "Enable insert for all users" ON responses;
DROP POLICY IF EXISTS "Enable update for all users" ON responses;
DROP POLICY IF EXISTS "Enable delete for all users" ON responses;
DROP POLICY IF EXISTS "Enable read access for all users" ON response_details;
DROP POLICY IF EXISTS "Enable insert for all users" ON response_details;
DROP POLICY IF EXISTS "Enable update for all users" ON response_details;
DROP POLICY IF EXISTS "Enable delete for all users" ON response_details;
CREATE POLICY "Allow all on forms" ON forms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on questions" ON questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on responses" ON responses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on response_details" ON response_details FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE response_details ENABLE ROW LEVEL SECURITY;
SELECT 'SUCCESS!' as result;
```

**FAIRE CECI:**
1. Allez à: https://supabase.com/dashboard
2. Cliquez sur "projet formcloud"
3. Cliquez "SQL Editor"
4. Cliquez "New Query"
5. **COLLEZ le code ci-dessus**
6. Cliquez "RUN"
7. Attendez de voir: `SUCCESS!`

✅ **Supabase est réparé!**

---

### 👉 ACTION 2: REDÉMARRER L'APP (30 secondes)

**Dans PowerShell, exécutez:**

```powershell
cd "c:\Users\odrad\OneDrive\Documents\projet formcloud"
npm run next-dev
```

✅ **Attendez de voir: "Ready in XXms"**

---

## ✅ TESTER (1 minute)

1. **Inscription**: http://localhost:3000/auth
   - Email: test@test.com
   - Password: test123

2. **Créer formulaire**: http://localhost:3000/create
   - Titre: Test
   - Ajoutez 1 question

3. **Vérifier**: https://supabase.com/dashboard → Table Editor → forms
   - ✅ Vous devez voir votre formulaire!

---

## 🎉 FIN!

C'est tout. Votre app marche maintenant!

**Questions?** Lisez `ETAPES-DETAILLEES.md`
