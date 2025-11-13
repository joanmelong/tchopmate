-- ========================================
-- Correctif: Aligner la table plat avec l'application
-- Objectifs:
-- 1) S'assurer qu'une colonne id (UUID) existe (utilisée par l'app pour update/delete)
-- 2) S'assurer que restaurant_id est de type INTEGER et pointe vers restaurant(id_restaurant)
-- 3) Réappliquer des politiques RLS compatibles
-- NOTE: Exécutez ce script dans l'éditeur SQL Supabase en tant que superuser.
-- Vérifiez chaque bloc avant d'exécuter le suivant dans un environnement de prod.
-- ========================================

-- 0) Prévisualiser l'état actuel
SELECT 'plat columns' as info, column_name, data_type
FROM information_schema.columns
WHERE table_schema='public' AND table_name='plat'
ORDER BY ordinal_position;

-- 1) Ajouter une colonne id (UUID) si elle n'existe pas déjà
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='plat' AND column_name='id'
  ) THEN
    ALTER TABLE public.plat ADD COLUMN id UUID DEFAULT gen_random_uuid();
    -- Optionnel: rendre unique pour garantir l'unicité si l'ancienne PK est conservée
    CREATE UNIQUE INDEX IF NOT EXISTS plat_id_uuid_unique ON public.plat(id);
  END IF;
END $$;

-- 1.b) Supprimer TOUTES les politiques RLS existantes sur public.plat
-- (nécessaire pour pouvoir modifier le type d'une colonne référencée par des policies)
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'plat'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.plat', pol.policyname);
  END LOOP;
END $$;

-- Désactiver temporairement la RLS le temps des modifications
ALTER TABLE public.plat DISABLE ROW LEVEL SECURITY;

-- 2) Aligner restaurant_id sur UUID (conforme à restaurant.id_restaurant)
DO $$
DECLARE
  t TEXT;
BEGIN
  SELECT data_type INTO t
  FROM information_schema.columns
  WHERE table_schema='public' AND table_name='plat' AND column_name='restaurant_id';

  IF t IS NULL THEN
    RAISE NOTICE 'La colonne restaurant_id est absente. Ajout en UUID...';
    ALTER TABLE public.plat ADD COLUMN restaurant_id UUID;
  ELSIF t <> 'uuid' THEN
    RAISE NOTICE 'Conversion de restaurant_id (%) -> uuid', t;
    -- Conversion sûre: si la valeur ressemble à un UUID, on caste, sinon NULL
    ALTER TABLE public.plat
      ALTER COLUMN restaurant_id TYPE uuid USING (
        CASE 
          WHEN restaurant_id IS NULL THEN NULL
          WHEN (restaurant_id::text ~ '^[0-9a-fA-F-]{36}$') THEN (restaurant_id::text)::uuid
          ELSE NULL
        END
      );
  END IF;
END $$;

-- 2.b) Ajouter les colonnes attendues par l'application si absentes
ALTER TABLE public.plat
  ADD COLUMN IF NOT EXISTS categorie VARCHAR(100) NOT NULL DEFAULT 'Autre',
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS disponible BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS temps_preparation INTEGER;

-- 3) Créer la contrainte FK (restaurant_id UUID -> restaurant.id_restaurant UUID)
DO $$
BEGIN
  -- Crée la FK seulement si les colonnes existent avec les bons types
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='restaurant' AND column_name='id_restaurant'
  ) THEN
    -- Supprimer l'ancienne contrainte FK si elle existe et pointe ailleurs
    ALTER TABLE public.plat DROP CONSTRAINT IF EXISTS plat_restaurant_id_fkey;

    ALTER TABLE public.plat
      ADD CONSTRAINT plat_restaurant_id_fkey
      FOREIGN KEY (restaurant_id) REFERENCES public.restaurant(id_restaurant) ON DELETE CASCADE;
  END IF;
END $$;

-- 4) Définir id comme PRIMARY KEY si aucune PK n'existe déjà
DO $$
DECLARE
  has_pk BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_schema='public' AND table_name='plat' AND constraint_type='PRIMARY KEY'
  ) INTO has_pk;

  IF NOT has_pk THEN
    ALTER TABLE public.plat ADD CONSTRAINT plat_pkey PRIMARY KEY (id);
  END IF;
END $$;

-- 5) RLS: Réactiver des politiques compatibles
ALTER TABLE public.plat ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gerants peuvent voir leurs plats" ON public.plat;
DROP POLICY IF EXISTS "Gerants peuvent creer des plats" ON public.plat;
DROP POLICY IF EXISTS "Gerants peuvent modifier leurs plats" ON public.plat;
DROP POLICY IF EXISTS "Gerants peuvent supprimer leurs plats" ON public.plat;
DROP POLICY IF EXISTS "Clients peuvent voir les plats disponibles" ON public.plat;

CREATE POLICY "Gerants peuvent voir leurs plats" 
  ON public.plat
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

CREATE POLICY "Gerants peuvent creer des plats" 
  ON public.plat
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

CREATE POLICY "Gerants peuvent modifier leurs plats" 
  ON public.plat
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

CREATE POLICY "Gerants peuvent supprimer leurs plats" 
  ON public.plat
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

CREATE POLICY "Clients peuvent voir les plats disponibles" 
  ON public.plat
  FOR SELECT 
  TO anon, authenticated
  USING (disponible = TRUE);

-- 6) Vérifications finales
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies WHERE tablename = 'plat'
ORDER BY policyname;

SELECT 'plat sample' as info, * FROM public.plat LIMIT 1;
