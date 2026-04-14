-- Ajouter la colonne is_super_admin à la table users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

-- Fonction pour vérifier si l'utilisateur courant est un super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(is_super_admin, false) FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- === POLICIES POUR FORMS ===
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admins can do everything on forms" ON forms;
CREATE POLICY "Super admins can do everything on forms" ON forms
  AS PERMISSIVE FOR ALL
  TO public
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- === POLICIES POUR USERS ===
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admins can do everything on users" ON users;
CREATE POLICY "Super admins can do everything on users" ON users
  AS PERMISSIVE FOR ALL
  TO public
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- === POLICIES POUR ORGANIZATIONS ===
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admins can do everything on organizations" ON organizations;
CREATE POLICY "Super admins can do everything on organizations" ON organizations
  AS PERMISSIVE FOR ALL
  TO public
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- Définir manuellement le premier super admin en utilisant son email :
-- UPDATE public.users SET is_super_admin = true WHERE email = 'votre-email@example.com';
