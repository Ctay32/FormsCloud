-- Fix du dashboard FormCloud
-- Exécuter dans Supabase SQL Editor pour aligner la base avec le frontend actuel

ALTER TABLE forms
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_forms_user_id ON forms(user_id);

UPDATE forms
SET user_id = auth.uid()
WHERE user_id IS NULL
  AND auth.uid() IS NOT NULL;

ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own forms" ON forms;
DROP POLICY IF EXISTS "Users can create forms" ON forms;
DROP POLICY IF EXISTS "Users can insert own forms" ON forms;
DROP POLICY IF EXISTS "Users can update own forms" ON forms;
DROP POLICY IF EXISTS "Users can delete own forms" ON forms;

CREATE POLICY "Users can view own forms" ON forms
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create forms" ON forms
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own forms" ON forms
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own forms" ON forms
  FOR DELETE
  USING (auth.uid() = user_id);

SELECT id, title, user_id, created_at
FROM forms
ORDER BY created_at DESC;