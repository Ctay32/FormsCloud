-- ✅ OPTION A: Configuration SIMPLE pour développement
-- Exécutez ce SQL complet dans Supabase SQL Editor
-- Cela réinitialise les politiques RLS pour permettre les opérations sans authentification

-- Étape 1: Supprimer les anciennes politiques RLS
DROP POLICY IF EXISTS "Enable read access for all users" ON forms CASCADE;
DROP POLICY IF EXISTS "Enable insert for all users" ON forms CASCADE;
DROP POLICY IF EXISTS "Enable update for all users" ON forms CASCADE;
DROP POLICY IF EXISTS "Enable delete for all users" ON forms CASCADE;

DROP POLICY IF EXISTS "Enable read access for all users" ON questions CASCADE;
DROP POLICY IF EXISTS "Enable insert for all users" ON questions CASCADE;
DROP POLICY IF EXISTS "Enable update for all users" ON questions CASCADE;
DROP POLICY IF EXISTS "Enable delete for all users" ON questions CASCADE;

DROP POLICY IF EXISTS "Enable read access for all users" ON responses CASCADE;
DROP POLICY IF EXISTS "Enable insert for all users" ON responses CASCADE;
DROP POLICY IF EXISTS "Enable update for all users" ON responses CASCADE;
DROP POLICY IF EXISTS "Enable delete for all users" ON responses CASCADE;

DROP POLICY IF EXISTS "Enable read access for all users" ON response_details CASCADE;
DROP POLICY IF EXISTS "Enable insert for all users" ON response_details CASCADE;
DROP POLICY IF EXISTS "Enable update for all users" ON response_details CASCADE;
DROP POLICY IF EXISTS "Enable delete for all users" ON response_details CASCADE;

-- Supprimer les politiques basées sur user_id (de security-schema-update)
DROP POLICY IF EXISTS "Users can view own forms" ON forms CASCADE;
DROP POLICY IF EXISTS "Users can insert own forms" ON forms CASCADE;
DROP POLICY IF EXISTS "Users can update own forms" ON forms CASCADE;
DROP POLICY IF EXISTS "Users can delete own forms" ON forms CASCADE;

DROP POLICY IF EXISTS "Users can view own questions" ON questions CASCADE;
DROP POLICY IF EXISTS "Users can insert own questions" ON questions CASCADE;
DROP POLICY IF EXISTS "Users can update own questions" ON questions CASCADE;
DROP POLICY IF EXISTS "Users can delete own questions" ON questions CASCADE;

DROP POLICY IF EXISTS "Users can view own responses" ON responses CASCADE;
DROP POLICY IF EXISTS "Users can insert responses" ON responses CASCADE;
DROP POLICY IF EXISTS "Users can update own responses" ON responses CASCADE;
DROP POLICY IF EXISTS "Users can delete own responses" ON responses CASCADE;

DROP POLICY IF EXISTS "Users can view own response details" ON response_details CASCADE;
DROP POLICY IF EXISTS "Users can insert response details" ON response_details CASCADE;
DROP POLICY IF EXISTS "Users can update own response details" ON response_details CASCADE;
DROP POLICY IF EXISTS "Users can delete own response details" ON response_details CASCADE;

-- Étape 2: Créer les nouvelles politiques RLS permissives
-- Table forms
CREATE POLICY "Enable all operations on forms" ON forms 
FOR ALL USING (true) WITH CHECK (true);

-- Table questions
CREATE POLICY "Enable all operations on questions" ON questions 
FOR ALL USING (true) WITH CHECK (true);

-- Table responses
CREATE POLICY "Enable all operations on responses" ON responses 
FOR ALL USING (true) WITH CHECK (true);

-- Table response_details
CREATE POLICY "Enable all operations on response_details" ON response_details 
FOR ALL USING (true) WITH CHECK (true);

-- Étape 3: Vérifier que RLS est activé (IMPORTANT!)
-- Les tables doivent avoir RLS activé pour que les politiques fonctionnent
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE response_details ENABLE ROW LEVEL SECURITY;

-- Étape 4: Confirmation
SELECT 'Configuration OPTION A appliquée avec succès!' as status;
