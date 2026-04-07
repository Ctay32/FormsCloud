-- ✅ OPTION B: Configuration SÉCURISÉE pour production
-- Exécutez ce SQL complet dans Supabase SQL Editor
-- Cela configure l'authentification et les politiques RLS basées sur l'utilisateur

-- ÉTAPE 1: Ajouter la colonne user_id à la table forms
-- Cette colonne permettra de lier chaque formulaire à son créateur
ALTER TABLE forms ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Si vous avez des formulaires existants, vous devez leur assigner un utilisateur
-- Option A: Supprimer les formulaires existants
DELETE FROM forms WHERE user_id IS NULL;

-- Option B: Les assigner à un utilisateur spécifique (remplacer par un UUID réel)
-- UPDATE forms SET user_id = 'YOUR_USER_ID_HERE' WHERE user_id IS NULL;

-- Rendre la colonne NOT NULL (obligatoire)
ALTER TABLE forms ALTER COLUMN user_id SET NOT NULL;

-- ÉTAPE 2: Faire la même chose pour les autres tables si nécessaire
-- (optionnel - les questions et réponses héritent des permissions du formulaire)

-- ÉTAPE 3: Supprimer les anciennes politiques RLS permissives
DROP POLICY IF EXISTS "Enable read access for all users" ON forms CASCADE;
DROP POLICY IF EXISTS "Enable insert for all users" ON forms CASCADE;
DROP POLICY IF EXISTS "Enable update for all users" ON forms CASCADE;
DROP POLICY IF EXISTS "Enable delete for all users" ON forms CASCADE;

DROP POLICY IF EXISTS "Enable all operations on forms" ON forms CASCADE;

DROP POLICY IF EXISTS "Enable read access for all users" ON questions CASCADE;
DROP POLICY IF EXISTS "Enable insert for all users" ON questions CASCADE;
DROP POLICY IF EXISTS "Enable update for all users" ON questions CASCADE;
DROP POLICY IF EXISTS "Enable delete for all users" ON questions CASCADE;

DROP POLICY IF EXISTS "Enable all operations on questions" ON questions CASCADE;

DROP POLICY IF EXISTS "Enable read access for all users" ON responses CASCADE;
DROP POLICY IF EXISTS "Enable insert for all users" ON responses CASCADE;
DROP POLICY IF EXISTS "Enable update for all users" ON responses CASCADE;
DROP POLICY IF EXISTS "Enable delete for all users" ON responses CASCADE;

DROP POLICY IF EXISTS "Enable all operations on responses" ON responses CASCADE;

DROP POLICY IF EXISTS "Enable read access for all users" ON response_details CASCADE;
DROP POLICY IF EXISTS "Enable insert for all users" ON response_details CASCADE;
DROP POLICY IF EXISTS "Enable update for all users" ON response_details CASCADE;
DROP POLICY IF EXISTS "Enable delete for all users" ON response_details CASCADE;

DROP POLICY IF EXISTS "Enable all operations on response_details" ON response_details CASCADE;

-- ÉTAPE 4: Créer les politiques RLS sécurisées basées sur l'utilisateur

-- Politiques pour la table forms
CREATE POLICY "Users can view own forms" ON forms 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own forms" ON forms 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own forms" ON forms 
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own forms" ON forms 
FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour la table questions
-- Les utilisateurs peuvent accéder aux questions de leurs propres formulaires
CREATE POLICY "Users can view own questions" ON questions 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM forms WHERE forms.id = questions.form_id AND forms.user_id = auth.uid())
);

CREATE POLICY "Users can insert own questions" ON questions 
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM forms WHERE forms.id = questions.form_id AND forms.user_id = auth.uid())
);

CREATE POLICY "Users can update own questions" ON questions 
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM forms WHERE forms.id = questions.form_id AND forms.user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM forms WHERE forms.id = questions.form_id AND forms.user_id = auth.uid())
);

CREATE POLICY "Users can delete own questions" ON questions 
FOR DELETE USING (
  EXISTS (SELECT 1 FROM forms WHERE forms.id = questions.form_id AND forms.user_id = auth.uid())
);

-- Politiques pour la table responses
CREATE POLICY "Users can view own responses" ON responses 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM forms WHERE forms.id = responses.form_id AND forms.user_id = auth.uid())
);

-- Tout le monde peut soumettre une réponse (les formulaires publics)
CREATE POLICY "Anyone can submit responses" ON responses 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own responses" ON responses 
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM forms WHERE forms.id = responses.form_id AND forms.user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM forms WHERE forms.id = responses.form_id AND forms.user_id = auth.uid())
);

CREATE POLICY "Users can delete own responses" ON responses 
FOR DELETE USING (
  EXISTS (SELECT 1 FROM forms WHERE forms.id = responses.form_id AND forms.user_id = auth.uid())
);

-- Politiques pour la table response_details
CREATE POLICY "Users can view own response details" ON response_details 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM responses 
    JOIN forms ON forms.id = responses.form_id 
    WHERE responses.id = response_details.response_id 
    AND forms.user_id = auth.uid()
  )
);

-- Tout le monde peut soumettre des détails de réponse
CREATE POLICY "Anyone can submit response details" ON response_details 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own response details" ON response_details 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM responses 
    JOIN forms ON forms.id = responses.form_id 
    WHERE responses.id = response_details.response_id 
    AND forms.user_id = auth.uid()
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM responses 
    JOIN forms ON forms.id = responses.form_id 
    WHERE responses.id = response_details.response_id 
    AND forms.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own response details" ON response_details 
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM responses 
    JOIN forms ON forms.id = responses.form_id 
    WHERE responses.id = response_details.response_id 
    AND forms.user_id = auth.uid()
  )
);

-- ÉTAPE 5: Vérifier que RLS est activé
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE response_details ENABLE ROW LEVEL SECURITY;

-- ÉTAPE 6: Confirmation
SELECT 'Configuration OPTION B (sécurisée) appliquée avec succès!' as status;
