-- Fonction SQL pour créer un compte admin en contournant les politiques RLS
-- À exécuter dans l'éditeur SQL de Supabase

CREATE OR REPLACE FUNCTION public.create_admin_account(
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
SECURITY DEFINER -- Exécute avec les privilèges du créateur de la fonction
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

-- Donner les permissions d'exécution à tous les utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION public.create_admin_account TO authenticated;

-- Tester la fonction (optionnel)
-- SELECT * FROM public.create_admin_account(
--   '00000000-0000-0000-0000-000000000001'::UUID,
--   'Admin',
--   'Root',
--   'joantsayem@gmail.com',
--   'Administrateur'
-- );
