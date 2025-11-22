-- ========================================
-- Correctif: Corriger la fonction recalc_commande_total
-- Problème: La fonction utilise p.id_plat alors que la table plat utilise id (UUID)
-- ========================================

-- 1) Corriger la fonction recalc_commande_total pour utiliser p.id au lieu de p.id_plat
CREATE OR REPLACE FUNCTION public.recalc_commande_total(p_commande UUID)
RETURNS VOID
LANGUAGE sql AS $$
  UPDATE public.commande c
  SET montant_total = COALESCE((
    SELECT SUM(p.prix * cp.quantite)
    FROM public.commande_plat cp
    JOIN public.plat p ON p.id = cp.plat_id
    WHERE cp.commande_id = c.id_commande
  ), 0)
  WHERE c.id_commande = p_commande;
$$;

-- 2) Vérifier et corriger la contrainte de clé étrangère commande_plat.plat_id
-- Supprimer toutes les contraintes qui pourraient pointer vers id_plat
DO $$
DECLARE
  constraint_rec RECORD;
BEGIN
  -- Supprimer toutes les contraintes de clé étrangère sur plat_id dans commande_plat
  FOR constraint_rec IN
    SELECT constraint_name
    FROM information_schema.table_constraints 
    WHERE constraint_type = 'FOREIGN KEY'
    AND table_schema = 'public' 
    AND table_name = 'commande_plat'
    AND constraint_name IN (
      SELECT constraint_name
      FROM information_schema.key_column_usage
      WHERE table_schema = 'public'
      AND table_name = 'commande_plat'
      AND column_name = 'plat_id'
    )
  LOOP
    EXECUTE format('ALTER TABLE public.commande_plat DROP CONSTRAINT IF EXISTS %I', constraint_rec.constraint_name);
  END LOOP;
  
  -- Recréer la contrainte en pointant vers plat.id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'plat' 
    AND column_name = 'id'
  ) THEN
    -- Vérifier que la contrainte n'existe pas déjà
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'commande_plat_plat_id_fkey' 
      AND table_schema = 'public' 
      AND table_name = 'commande_plat'
    ) THEN
      ALTER TABLE public.commande_plat
      ADD CONSTRAINT commande_plat_plat_id_fkey
      FOREIGN KEY (plat_id) REFERENCES public.plat(id) ON DELETE RESTRICT;
    END IF;
  END IF;
END $$;

-- 3) Vérifier que la fonction menu_plat utilise aussi la bonne colonne (si elle existe)
DO $$
BEGIN
  -- Supprimer l'ancienne contrainte menu_plat si elle existe avec la mauvaise référence
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name LIKE '%menu_plat%plat%fkey%'
    AND table_schema = 'public'
  ) THEN
    -- Note: Cette partie est commentée car la contrainte exacte peut varier
    -- Décommentez et ajustez selon votre schéma si nécessaire
    -- ALTER TABLE public.menu_plat DROP CONSTRAINT IF EXISTS menu_plat_plat_id_fkey;
  END IF;
END $$;

-- Vérification: Afficher la structure de la fonction corrigée
SELECT 
  'Fonction recalc_commande_total corrigée' as info,
  pg_get_functiondef(oid) as definition
FROM pg_proc
WHERE proname = 'recalc_commande_total'
AND pronamespace = 'public'::regnamespace;

