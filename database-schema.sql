-- Création des tables pour FormCloud
-- Exécutez ce SQL dans l'éditeur Supabase

-- Table des formulaires
CREATE TABLE IF NOT EXISTS forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des questions
CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('text', 'choice', 'short_answer', 'long_answer', 'multiple_choice', 'checkboxes', 'dropdown', 'linear_scale', 'grid', 'date', 'time', 'datetime', 'email', 'number', 'phone', 'url')),
  order_index INTEGER NOT NULL DEFAULT 0,
  required BOOLEAN DEFAULT FALSE,
  options JSONB, -- Pour stocker les options des questions à choix
  settings JSONB, -- Pour stocker les paramètres avancés (échelle, grilles, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des réponses
CREATE TABLE IF NOT EXISTS responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des détails des réponses
CREATE TABLE IF NOT EXISTS response_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  response_id UUID REFERENCES responses(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_forms_created_at ON forms(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_form_id ON questions(form_id);
CREATE INDEX IF NOT EXISTS idx_responses_form_id ON responses(form_id);
CREATE INDEX IF NOT EXISTS idx_response_details_response_id ON response_details(response_id);

-- RLS (Row Level Security) - Activer la sécurité
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE response_details ENABLE ROW LEVEL SECURITY;

-- Politiques RLS (pour l'instant, tout le monde peut lire/écrire)
-- À personnaliser selon vos besoins d'authentification
CREATE POLICY "Enable read access for all users" ON forms FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON forms FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON forms FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON forms FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON questions FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON questions FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON questions FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON responses FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON responses FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON responses FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON response_details FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON response_details FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON response_details FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON response_details FOR DELETE USING (true);
