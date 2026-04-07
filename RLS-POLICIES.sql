-- ✅ RLS POLICIES - SÉCURITÉ MULTI-UTILISATEUR
-- Exécuter dans Supabase SQL Editor
-- Ces policies assurent que chaque utilisateur ne voit que SES données

-- ===== TABLE: forms =====
-- Permettre aux utilisateurs de voir/modifier LEURS propres formulaires

ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leurs propres formulaires
DROP POLICY IF EXISTS "Users can view own forms" ON forms;
CREATE POLICY "Users can view own forms" ON forms
  FOR SELECT
  USING (auth.uid() = user_id);

-- Les utilisateurs peuvent créer des formulaires
DROP POLICY IF EXISTS "Users can create forms" ON forms;
CREATE POLICY "Users can create forms" ON forms
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent modifier leurs propres formulaires
DROP POLICY IF EXISTS "Users can update own forms" ON forms;
CREATE POLICY "Users can update own forms" ON forms
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leurs propres formulaires
DROP POLICY IF EXISTS "Users can delete own forms" ON forms;
CREATE POLICY "Users can delete own forms" ON forms
  FOR DELETE
  USING (auth.uid() = user_id);


-- ===== TABLE: questions =====
-- Les questions sont liées aux formulaires, contrôlées via forms

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir les questions de LEURS formulaires
DROP POLICY IF EXISTS "Users can view questions of own forms" ON questions;
CREATE POLICY "Users can view questions of own forms" ON questions
  FOR SELECT
  USING (
    form_id IN (
      SELECT id FROM forms WHERE user_id = auth.uid()
    )
  );

-- Les utilisateurs peuvent créer des questions pour LEURS formulaires
DROP POLICY IF EXISTS "Users can create questions for own forms" ON questions;
CREATE POLICY "Users can create questions for own forms" ON questions
  FOR INSERT
  WITH CHECK (
    form_id IN (
      SELECT id FROM forms WHERE user_id = auth.uid()
    )
  );

-- Les utilisateurs peuvent modifier les questions de LEURS formulaires
DROP POLICY IF EXISTS "Users can update questions of own forms" ON questions;
CREATE POLICY "Users can update questions of own forms" ON questions
  FOR UPDATE
  USING (
    form_id IN (
      SELECT id FROM forms WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    form_id IN (
      SELECT id FROM forms WHERE user_id = auth.uid()
    )
  );

-- Les utilisateurs peuvent supprimer les questions de LEURS formulaires
DROP POLICY IF EXISTS "Users can delete questions of own forms" ON questions;
CREATE POLICY "Users can delete questions of own forms" ON questions
  FOR DELETE
  USING (
    form_id IN (
      SELECT id FROM forms WHERE user_id = auth.uid()
    )
  );


-- ===== TABLE: responses =====
-- Les réponses peuvent être publiques (n'importe qui peut répondre)
-- Mais seul le propriétaire du formulaire peut voir les réponses

ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- N'importe qui peut créer une réponse (le formulaire est public)
DROP POLICY IF EXISTS "Anyone can create responses" ON responses;
CREATE POLICY "Anyone can create responses" ON responses
  FOR INSERT
  WITH CHECK (true);

-- Seul le propriétaire du formulaire peut voir les réponses
DROP POLICY IF EXISTS "Users can view responses to own forms" ON responses;
CREATE POLICY "Users can view responses to own forms" ON responses
  FOR SELECT
  USING (
    form_id IN (
      SELECT id FROM forms WHERE user_id = auth.uid()
    )
  );

-- Le propriétaire peut supprimer les réponses à ses formulaires
DROP POLICY IF EXISTS "Users can delete responses to own forms" ON responses;
CREATE POLICY "Users can delete responses to own forms" ON responses
  FOR DELETE
  USING (
    form_id IN (
      SELECT id FROM forms WHERE user_id = auth.uid()
    )
  );


-- ===== TABLE: response_details =====
-- Les détails sont liés aux réponses

ALTER TABLE response_details ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir les détails des réponses à LEURS formulaires
DROP POLICY IF EXISTS "Users can view response details of own forms" ON response_details;
CREATE POLICY "Users can view response details of own forms" ON response_details
  FOR SELECT
  USING (
    response_id IN (
      SELECT r.id FROM responses r
      WHERE r.form_id IN (
        SELECT id FROM forms WHERE user_id = auth.uid()
      )
    )
  );

-- Les utilisateurs peuvent créer des détails pour les réponses à LEURS formulaires
DROP POLICY IF EXISTS "Users can create response details for own forms" ON response_details;
CREATE POLICY "Users can create response details for own forms" ON response_details
  FOR INSERT
  WITH CHECK (
    response_id IN (
      SELECT r.id FROM responses r
      WHERE r.form_id IN (
        SELECT id FROM forms WHERE user_id = auth.uid()
      )
    )
  );


-- ✅ RLS Policies configurées avec succès!
SELECT 'SUCCESS: RLS Policies configured! Each user can only see their own forms and responses.' as "Status";
