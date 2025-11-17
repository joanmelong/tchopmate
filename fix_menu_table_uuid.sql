-- ========================================
-- Correctif: Aligner la table menu avec UUID
-- Objectif: S'assurer que restaurant_id est de type UUID
-- ========================================

-- 1) Vérifier l'état actuel
SELECT 'menu columns' as info, column_name, data_type
FROM information_schema.columns
WHERE table_schema='public' AND table_name='menu'
ORDER BY ordinal_position;

-- 2) Supprimer toutes les politiques RLS existantes sur public.menu
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'menu'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.menu', pol.policyname);
  END LOOP;
END $$;

-- Désactiver temporairement la RLS
ALTER TABLE public.menu DISABLE ROW LEVEL SECURITY;

-- 3) Convertir restaurant_id en UUID si nécessaire
DO $$
DECLARE
  t TEXT;
BEGIN
  SELECT data_type INTO t
  FROM information_schema.columns
  WHERE table_schema='public' AND table_name='menu' AND column_name='restaurant_id';

  IF t IS NULL THEN
    RAISE NOTICE 'La colonne restaurant_id est absente. Ajout en UUID...';
    ALTER TABLE public.menu ADD COLUMN restaurant_id UUID;
  ELSIF t <> 'uuid' THEN
    RAISE NOTICE 'Conversion de restaurant_id (%) -> uuid', t;
    -- Supprimer l'ancienne contrainte FK
    ALTER TABLE public.menu DROP CONSTRAINT IF EXISTS menu_restaurant_id_fkey;
    
    -- Conversion: si la valeur ressemble à un UUID, on caste, sinon NULL
    ALTER TABLE public.menu
      ALTER COLUMN restaurant_id TYPE uuid USING (
        CASE 
          WHEN restaurant_id IS NULL THEN NULL
          WHEN (restaurant_id::text ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$') 
            THEN (restaurant_id::text)::uuid
          ELSE NULL
        END
      );
  ELSE
    RAISE NOTICE 'restaurant_id est déjà de type UUID';
  END IF;
END $$;

-- 4) Recréer la contrainte FK (restaurant_id UUID -> restaurant.id_restaurant UUID)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='restaurant' AND column_name='id_restaurant'
  ) THEN
    ALTER TABLE public.menu DROP CONSTRAINT IF EXISTS menu_restaurant_id_fkey;
    
    ALTER TABLE public.menu
      ADD CONSTRAINT menu_restaurant_id_fkey
      FOREIGN KEY (restaurant_id) REFERENCES public.restaurant(id_restaurant) ON DELETE CASCADE;
      
    RAISE NOTICE 'Contrainte FK créée: menu.restaurant_id -> restaurant.id_restaurant';
  END IF;
END $$;

-- 5) Réactiver la RLS et recréer les politiques
ALTER TABLE public.menu ENABLE ROW LEVEL SECURITY;

-- Les gérants peuvent voir tous les menus de leur restaurant
CREATE POLICY "Gerants peuvent voir leurs menus" 
  ON public.menu
  FOR SELECT 
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT r.id_restaurant
      FROM public.restaurant r
      JOIN public.compte c ON r.gerant_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

-- Les gérants peuvent créer des menus pour leur restaurant
CREATE POLICY "Gerants peuvent creer des menus" 
  ON public.menu
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    restaurant_id IN (
      SELECT r.id_restaurant
      FROM public.restaurant r
      JOIN public.compte c ON r.gerant_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

-- Les gérants peuvent modifier leurs menus
CREATE POLICY "Gerants peuvent modifier leurs menus" 
  ON public.menu
  FOR UPDATE 
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT r.id_restaurant
      FROM public.restaurant r
      JOIN public.compte c ON r.gerant_id = c.id
      WHERE c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    restaurant_id IN (
      SELECT r.id_restaurant
      FROM public.restaurant r
      JOIN public.compte c ON r.gerant_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

-- Les gérants peuvent supprimer leurs menus
CREATE POLICY "Gerants peuvent supprimer leurs menus" 
  ON public.menu
  FOR DELETE 
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT r.id_restaurant
      FROM public.restaurant r
      JOIN public.compte c ON r.gerant_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

-- Les clients peuvent voir les menus disponibles
CREATE POLICY "Clients peuvent voir les menus disponibles" 
  ON public.menu
  FOR SELECT 
  TO anon, authenticated
  USING (disponible = TRUE);

-- 6) Vérifier le résultat
SELECT 'menu columns après correction' as info, column_name, data_type
FROM information_schema.columns
WHERE table_schema='public' AND table_name='menu'
ORDER BY ordinal_position;

SELECT 'Politiques RLS' as info, policyname
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'menu';
