-- ✅ SCRIPT CORRECTION SCHÉMA - EXÉCUTER DANS SUPABASE SQL EDITOR
-- Ce script corrige le schéma pour que tout fonctionne

-- Étape 1: Ajouter les colonnes manquantes à questions
ALTER TABLE questions ADD COLUMN IF NOT EXISTS required boolean DEFAULT false;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS options jsonb;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS settings jsonb;

-- Étape 2: Supprimer les contraintes problématiques
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_type_check;

-- Étape 3: Ajouter la bonne contrainte CHECK pour accepter tous les types
ALTER TABLE questions ADD CONSTRAINT questions_type_check CHECK (
  type::text = ANY (ARRAY[
    'text'::text,
    'short_answer'::text,
    'long_answer'::text,
    'choice'::text,
    'multiple_choice'::text,
    'checkboxes'::text,
    'dropdown'::text,
    'linear_scale'::text,
    'grid'::text,
    'date'::text,
    'time'::text,
    'datetime'::text,
    'email'::text,
    'number'::text,
    'phone'::text,
    'url'::text
  ])
);

-- Étape 4: Rendre form_id NOT NULL dans questions
ALTER TABLE questions ALTER COLUMN form_id SET NOT NULL;

-- Étape 5: Rendre form_id NOT NULL dans responses
ALTER TABLE responses ALTER COLUMN form_id SET NOT NULL;

-- Étape 6: Ajouter ON DELETE CASCADE aux foreign keys
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_form_id_fkey;
ALTER TABLE questions ADD CONSTRAINT questions_form_id_fkey 
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE;

ALTER TABLE responses DROP CONSTRAINT IF EXISTS responses_form_id_fkey;
ALTER TABLE responses ADD CONSTRAINT responses_form_id_fkey 
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE;

ALTER TABLE response_details DROP CONSTRAINT IF EXISTS response_details_response_id_fkey;
ALTER TABLE response_details ADD CONSTRAINT response_details_response_id_fkey 
  FOREIGN KEY (response_id) REFERENCES responses(id) ON DELETE CASCADE;

ALTER TABLE response_details DROP CONSTRAINT IF EXISTS response_details_question_id_fkey;
ALTER TABLE response_details ADD CONSTRAINT response_details_question_id_fkey 
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE;

-- ✅ Schéma est maintenant correct!
SELECT 'SUCCESS: Schema has been corrected! Questions will now save correctly.' as "Status";
