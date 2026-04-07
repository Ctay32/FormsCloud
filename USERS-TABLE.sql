-- ✅ CRÉATION TABLE UTILISATEURS
-- Exécuter dans Supabase SQL Editor

-- ===== TABLE: users =====
-- Table pour stocker les informations utilisateur enrichies

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  bio text,
  company text,
  phone_number text,
  preferences jsonb DEFAULT '{
    "notifications": true,
    "language": "fr",
    "theme": "light"
  }'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_created_at_idx ON users(created_at);

-- ===== TRIGGER: Créer automatiquement un profil utilisateur lors de l'inscription =====
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, created_at, updated_at)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', now(), now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer le trigger s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Créer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ===== TRIGGER: Mettre à jour updated_at automatiquement =====
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON users;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ===== RLS POLICIES pour la table users =====
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leur propre profil
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Les utilisateurs peuvent mettre à jour leur propre profil
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Les utilisateurs peuvent voir les profils publics des autres (optionnel - pour future partage)
DROP POLICY IF EXISTS "Users can view public profiles" ON users;
CREATE POLICY "Users can view public profiles" ON users
  FOR SELECT
  USING (true);


-- ===== FONCTION HELPER pour récupérer le profil utilisateur actuel =====
CREATE OR REPLACE FUNCTION current_user_profile()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  avatar_url text,
  bio text,
  company text,
  phone_number text,
  preferences jsonb,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
) AS $$
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.avatar_url,
  u.bio,
  u.company,
  u.phone_number,
  u.preferences,
  u.created_at,
  u.updated_at
FROM users u
WHERE u.id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;


-- ✅ Table users créée avec succès!
SELECT 'SUCCESS: Users table created with triggers and RLS policies configured!' as "Status";
