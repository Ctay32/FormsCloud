-- Migration definitive du schema FormCloud
-- Objectif:
-- 1. aligner public.users avec auth.users
-- 2. ajouter forms.user_id pour le dashboard
-- 3. conserver les profils existants quand c'est possible
-- 4. relier questions.user_id et responses.user_id au nouveau schema

BEGIN;

ALTER TABLE public.questions DROP CONSTRAINT IF EXISTS questions_user_id_fkey;
ALTER TABLE public.responses DROP CONSTRAINT IF EXISTS responses_user_id_fkey;

ALTER TABLE public.forms ADD COLUMN IF NOT EXISTS user_id UUID;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'users'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu
      ON tc.constraint_name = ccu.constraint_name
     AND tc.table_schema = ccu.table_schema
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'users'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND ccu.table_schema = 'auth'
      AND ccu.table_name = 'users'
      AND ccu.column_name = 'id'
  ) THEN
    DROP TABLE IF EXISTS public.users_legacy;
    ALTER TABLE public.users RENAME TO users_legacy;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.users_legacy (
  id uuid,
  email text,
  role text,
  created_at timestamp without time zone,
  full_name text,
  avatar_url text,
  bio text,
  company text,
  phone_number text,
  preferences jsonb
);

CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  bio text,
  company text,
  phone_number text,
  preferences jsonb DEFAULT '{"notifications": true, "language": "fr", "theme": "light"}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.users (
  id,
  email,
  full_name,
  avatar_url,
  bio,
  company,
  phone_number,
  preferences,
  created_at,
  updated_at
)
SELECT
  au.id,
  au.email,
  COALESCE(ul.full_name, au.raw_user_meta_data->>'full_name'),
  ul.avatar_url,
  ul.bio,
  ul.company,
  ul.phone_number,
  COALESCE(ul.preferences, '{"notifications": true, "language": "fr", "theme": "light"}'::jsonb),
  COALESCE(ul.created_at::timestamp with time zone, au.created_at),
  timezone('utc'::text, now())
FROM auth.users au
LEFT JOIN public.users_legacy ul
  ON lower(ul.email) = lower(au.email)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
  avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
  bio = COALESCE(EXCLUDED.bio, public.users.bio),
  company = COALESCE(EXCLUDED.company, public.users.company),
  phone_number = COALESCE(EXCLUDED.phone_number, public.users.phone_number),
  preferences = COALESCE(EXCLUDED.preferences, public.users.preferences),
  updated_at = timezone('utc'::text, now());

UPDATE public.questions q
SET user_id = u.id
FROM public.users_legacy ul
JOIN public.users u ON lower(u.email) = lower(ul.email)
WHERE q.user_id = ul.id;

UPDATE public.responses r
SET user_id = u.id
FROM public.users_legacy ul
JOIN public.users u ON lower(u.email) = lower(ul.email)
WHERE r.user_id = ul.id;

UPDATE public.forms f
SET user_id = q.user_id
FROM public.questions q
WHERE q.form_id = f.id
  AND q.user_id IS NOT NULL
  AND f.user_id IS NULL;

UPDATE public.forms f
SET user_id = r.user_id
FROM public.responses r
WHERE r.form_id = f.id
  AND r.user_id IS NOT NULL
  AND f.user_id IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'forms_user_id_fkey'
  ) THEN
    ALTER TABLE public.forms
      ADD CONSTRAINT forms_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'questions_user_id_fkey'
  ) THEN
    ALTER TABLE public.questions
      ADD CONSTRAINT questions_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'responses_user_id_fkey'
  ) THEN
    ALTER TABLE public.responses
      ADD CONSTRAINT responses_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_forms_user_id ON public.forms(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_user_id ON public.questions(user_id);
CREATE INDEX IF NOT EXISTS idx_responses_user_id ON public.responses(user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, created_at, updated_at)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', now(), now())
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
      updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

COMMIT;

SELECT id, email, full_name FROM public.users ORDER BY created_at DESC;
SELECT id, title, user_id FROM public.forms ORDER BY created_at DESC;