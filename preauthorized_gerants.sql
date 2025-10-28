-- Script pour créer des comptes gérants pré-autorisés
-- À exécuter dans l'éditeur SQL de Supabase

-- Fonction pour créer un gérant pré-autorisé (sans user_id)
CREATE OR REPLACE FUNCTION public.create_preauthorized_gerant(
  p_email VARCHAR(150),
  p_nom VARCHAR(100) DEFAULT 'Gérant',
  p_prenom VARCHAR(100) DEFAULT 'Nouveau',
  p_numero_tel VARCHAR(20) DEFAULT NULL
)
RETURNS TABLE(
  id INTEGER,
  nom VARCHAR(100),
  prenom VARCHAR(100),
  email VARCHAR(150),
  numero_tel VARCHAR(20),
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
    -- Le compte existe déjà, retourner les informations
    RETURN QUERY
    SELECT 
      c.id,
      c.nom,
      c.prenom,
      c.email,
      c.numero_tel,
      c.role,
      c.created_at
    FROM public.compte c
    WHERE c.id = v_compte_id;
  ELSE
    -- Créer un nouveau compte gérant pré-autorisé
    INSERT INTO public.compte (
      user_id, -- NULL pour les comptes pré-autorisés
      nom,
      prenom,
      email,
      numero_tel,
      role,
      created_at,
      updated_at
    ) VALUES (
      NULL, -- user_id sera rempli lors de la première connexion
      p_nom,
      p_prenom,
      p_email,
      p_numero_tel,
      'Gerant',
      NOW(),
      NOW()
    ) RETURNING 
      public.compte.id,
      public.compte.nom,
      public.compte.prenom,
      public.compte.email,
      public.compte.numero_tel,
      public.compte.role,
      public.compte.created_at;
  END IF;
END;
$$;

-- Donner les permissions d'exécution
GRANT EXECUTE ON FUNCTION public.create_preauthorized_gerant TO authenticated;

-- Modifier la politique RLS pour permettre les comptes sans user_id
DROP POLICY IF EXISTS p_insert_self_compte ON public.compte;
CREATE POLICY p_insert_self_compte ON public.compte 
FOR INSERT 
WITH CHECK (
  user_id = auth.uid() 
  OR public.is_admin()
  OR user_id IS NULL -- Permettre les comptes pré-autorisés
);

-- Modifier la politique UPDATE pour permettre la liaison des comptes pré-autorisés
DROP POLICY IF EXISTS p_update_self_compte ON public.compte;
CREATE POLICY p_update_self_compte ON public.compte 
FOR UPDATE 
USING (
  user_id = auth.uid() 
  OR public.is_admin()
  OR (user_id IS NULL AND email = auth.jwt() ->> 'email') -- Permettre la liaison lors de la connexion
)
WITH CHECK (
  user_id = auth.uid() 
  OR public.is_admin()
  OR (user_id IS NULL AND email = auth.jwt() ->> 'email')
);

-- Fonction pour lier un compte pré-autorisé lors de la connexion
CREATE OR REPLACE FUNCTION public.link_preauthorized_account(
  p_user_id UUID,
  p_email VARCHAR(150)
)
RETURNS TABLE(
  id INTEGER,
  user_id UUID,
  nom VARCHAR(100),
  prenom VARCHAR(100),
  email VARCHAR(150),
  role VARCHAR(20)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_compte_id INTEGER;
  v_role VARCHAR(20);
BEGIN
  -- Vérifier si un compte pré-autorisé existe avec cet email
  SELECT c.id, c.role INTO v_compte_id, v_role
  FROM public.compte c
  WHERE c.email = p_email AND c.user_id IS NULL;
  
  IF v_compte_id IS NOT NULL THEN
    -- Lier le compte pré-autorisé à l'utilisateur authentifié
    UPDATE public.compte 
    SET 
      user_id = p_user_id,
      updated_at = NOW()
    WHERE id = v_compte_id;
    
    -- Retourner le compte lié
    RETURN QUERY
    SELECT 
      c.id,
      c.user_id,
      c.nom,
      c.prenom,
      c.email,
      c.role
    FROM public.compte c
    WHERE c.id = v_compte_id;
  ELSE
    -- Aucun compte pré-autorisé trouvé, créer un compte client par défaut
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
      'Utilisateur',
      'Nouveau',
      p_email,
      'Client',
      NOW(),
      NOW()
    ) RETURNING 
      public.compte.id,
      public.compte.user_id,
      public.compte.nom,
      public.compte.prenom,
      public.compte.email,
      public.compte.role;
  END IF;
END;
$$;

-- Donner les permissions d'exécution
GRANT EXECUTE ON FUNCTION public.link_preauthorized_account TO authenticated;

-- Test de la fonction (optionnel)
-- SELECT * FROM public.create_preauthorized_gerant('gerant@example.com', 'Jean', 'Dupont', '+237 6 XX XX XX XX');
