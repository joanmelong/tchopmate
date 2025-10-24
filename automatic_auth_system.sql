git-- Script SQL corrigé pour le système d'authentification automatique
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Créer la fonction RPC pour créer automatiquement les comptes
CREATE OR REPLACE FUNCTION public.create_user_account(
  p_user_id UUID,
  p_nom VARCHAR(100),
  p_prenom VARCHAR(100),
  p_email VARCHAR(150),
  p_role VARCHAR(20)
)
RETURNS TABLE(
  id INTEGER,
  user_id UUID,
  nom VARCHAR(100),
  prenom VARCHAR(100),
  email VARCHAR(150),
  role VARCHAR(20),
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_compte_id INTEGER;
BEGIN
  -- Vérifier si un compte avec cet email existe déjà
  SELECT c.id INTO v_compte_id
  FROM public.compte c
  WHERE c.email = p_email;
  
  IF v_compte_id IS NOT NULL THEN
    -- Mettre à jour le compte existant
    UPDATE public.compte 
    SET 
      user_id = p_user_id,
      nom = p_nom,
      prenom = p_prenom,
      role = p_role,
      updated_at = NOW()
    WHERE id = v_compte_id;
    
    -- Retourner le compte mis à jour
    RETURN QUERY
    SELECT 
      c.id,
      c.user_id,
      c.nom,
      c.prenom,
      c.email,
      c.role,
      c.created_at
    FROM public.compte c
    WHERE c.id = v_compte_id;
  ELSE
    -- Créer un nouveau compte
    INSERT INTO public.compte (
      user_id,
      nom,
      prenom,
      email,
      role,
      created_at,
      updated_at
    ) VALUES (
      p_user_id,
      p_nom,
      p_prenom,
      p_email,
      p_role,
      NOW(),
      NOW()
    ) RETURNING 
      public.compte.id,
      public.compte.user_id,
      public.compte.nom,
      public.compte.prenom,
      public.compte.email,
      public.compte.role,
      public.compte.created_at;
  END IF;
END;
$$;

-- 2. Donner les permissions d'exécution
GRANT EXECUTE ON FUNCTION public.create_user_account TO authenticated;

-- 3. Corriger les politiques RLS
DROP POLICY IF EXISTS p_select_self_compte ON public.compte;
DROP POLICY IF EXISTS p_insert_self_compte ON public.compte;
DROP POLICY IF EXISTS p_update_self_compte ON public.compte;
DROP POLICY IF EXISTS p_delete_self_compte ON public.compte;

-- 4. Créer les nouvelles politiques RLS
CREATE POLICY p_select_self_compte ON public.compte 
FOR SELECT 
USING (
  user_id = auth.uid() 
  OR public.is_admin()
);

CREATE POLICY p_insert_self_compte ON public.compte 
FOR INSERT 
WITH CHECK (
  user_id = auth.uid() 
  OR public.is_admin()
);

CREATE POLICY p_update_self_compte ON public.compte 
FOR UPDATE 
USING (
  user_id = auth.uid() 
  OR public.is_admin()
)
WITH CHECK (
  user_id = auth.uid() 
  OR public.is_admin()
);

CREATE POLICY p_delete_self_compte ON public.compte 
FOR DELETE 
USING (
  user_id = auth.uid() 
  OR public.is_admin()
);

-- 5. Créer un trigger pour créer automatiquement les comptes après authentification
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Cas 1: L'admin se connecte -> garantir/mettre 
  -- à jour son compte avec rôle Administrateur
  IF NEW.email = 'joantsayem@gmail.com' THEN
    INSERT INTO public.compte (
      user_id,
      nom,
      prenom,
      email,
      role,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Administrateur'),
      'Admin',
      NEW.email,
      'Administrateur',
      NOW(),
      NOW()
    )
    ON CONFLICT (email) DO UPDATE
    SET
      user_id = EXCLUDED.user_id,
      nom = COALESCE(public.compte.nom, EXCLUDED.nom),
      prenom = COALESCE(public.compte.prenom, EXCLUDED.prenom),
      -- NE PAS modifier role si d9j0 pr9sent
      updated_at = NOW();

    RETURN NEW;
  END IF;

  -- Cas 2: Tout autre utilisateur
  -- Ne pas cr9er de nouveau compte automatiquement.
  -- Si un compte pr9-autoris9 (public.compte) existe avec le mame email
  -- et user_id NULL, alors lier (remplir user_id). Sinon, noop.
  UPDATE public.compte
  SET user_id = NEW.id,
      updated_at = NOW()
  WHERE email = NEW.email
    AND (user_id IS NULL OR user_id = NEW.id);

  -- Toujours retourner NEW pour ne pas bloquer la cr9ation de l'utilisateur Auth
  RETURN NEW;
END;
$$;

-- 6. Créer le trigger sur auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Vérifier l'état actuel
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'compte'
ORDER BY policyname;

-- 8. Vérifier si le compte admin existe déjà
SELECT * FROM public.compte WHERE email = 'joantsayem@gmail.com';

-- 9. Si le compte admin n'existe pas, il sera créé automatiquement lors de la première connexion
-- Pas besoin de le créer manuellement maintenant
