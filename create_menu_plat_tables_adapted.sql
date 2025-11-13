-- ========================================
-- Script de création adapté au schéma existant
-- User Story 4.1 - TchopMate
-- Tables: menu et plat (au lieu de menus et plats)
-- ========================================

-- ========================================
-- 1. Vérifier la structure existante
-- ========================================

-- Vérifier si les tables existent déjà
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name IN ('menu', 'plat');

-- ========================================
-- 2. Création des tables (si elles n'existent pas)
-- ========================================

-- Table menu (singulier selon votre convention)
CREATE TABLE IF NOT EXISTS public.menu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id INTEGER NOT NULL REFERENCES public.restaurant(id_restaurant) ON DELETE CASCADE,
  nom VARCHAR(255) NOT NULL,
  description TEXT,
  prix DECIMAL(10, 2),
  image_url TEXT,
  disponible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table plat (singulier selon votre convention)
CREATE TABLE IF NOT EXISTS public.plat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id INTEGER NOT NULL REFERENCES public.restaurant(id_restaurant) ON DELETE CASCADE,
  nom VARCHAR(255) NOT NULL,
  description TEXT,
  prix DECIMAL(10, 2) NOT NULL,
  categorie VARCHAR(100) NOT NULL,
  image_url TEXT,
  disponible BOOLEAN DEFAULT TRUE,
  temps_preparation INTEGER, -- en minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 3. Création des index
-- ========================================

-- Index pour menu
CREATE INDEX IF NOT EXISTS idx_menu_restaurant_id ON public.menu(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_disponible ON public.menu(disponible);

-- Index pour plat
CREATE INDEX IF NOT EXISTS idx_plat_restaurant_id ON public.plat(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_plat_categorie ON public.plat(categorie);
CREATE INDEX IF NOT EXISTS idx_plat_disponible ON public.plat(disponible);

-- ========================================
-- 4. Fonction trigger pour updated_at
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 5. Triggers
-- ========================================

-- Trigger pour menu
DROP TRIGGER IF EXISTS update_menu_updated_at ON public.menu;
CREATE TRIGGER update_menu_updated_at
  BEFORE UPDATE ON public.menu
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour plat
DROP TRIGGER IF EXISTS update_plat_updated_at ON public.plat;
CREATE TRIGGER update_plat_updated_at
  BEFORE UPDATE ON public.plat
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 6. Row Level Security (RLS) - Menu
-- ========================================

ALTER TABLE public.menu ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Gerants peuvent voir leurs menus" ON public.menu;
DROP POLICY IF EXISTS "Gerants peuvent creer des menus" ON public.menu;
DROP POLICY IF EXISTS "Gerants peuvent modifier leurs menus" ON public.menu;
DROP POLICY IF EXISTS "Gerants peuvent supprimer leurs menus" ON public.menu;
DROP POLICY IF EXISTS "Clients peuvent voir les menus disponibles" ON public.menu;

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

-- Les clients peuvent voir les menus disponibles (anonymous + authenticated)
CREATE POLICY "Clients peuvent voir les menus disponibles" 
  ON public.menu
  FOR SELECT 
  TO anon, authenticated
  USING (disponible = TRUE);

-- ========================================
-- 7. Row Level Security (RLS) - Plat
-- ========================================

ALTER TABLE public.plat ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Gerants peuvent voir leurs plats" ON public.plat;
DROP POLICY IF EXISTS "Gerants peuvent creer des plats" ON public.plat;
DROP POLICY IF EXISTS "Gerants peuvent modifier leurs plats" ON public.plat;
DROP POLICY IF EXISTS "Gerants peuvent supprimer leurs plats" ON public.plat;
DROP POLICY IF EXISTS "Clients peuvent voir les plats disponibles" ON public.plat;

-- Les gérants peuvent voir tous les plats de leur restaurant
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

-- Les gérants peuvent créer des plats pour leur restaurant
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

-- Les gérants peuvent modifier leurs plats
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

-- Les gérants peuvent supprimer leurs plats
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

-- Les clients peuvent voir les plats disponibles (anonymous + authenticated)
CREATE POLICY "Clients peuvent voir les plats disponibles" 
  ON public.plat
  FOR SELECT 
  TO anon, authenticated
  USING (disponible = TRUE);

-- ========================================
-- 8. Vérifications
-- ========================================

-- Vérifier que les tables sont créées
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name IN ('menu', 'plat');

-- Vérifier les politiques RLS
-- SELECT schemaname, tablename, policyname FROM pg_policies 
-- WHERE tablename IN ('menu', 'plat');

-- Vérifier les index
-- SELECT tablename, indexname FROM pg_indexes 
-- WHERE tablename IN ('menu', 'plat');
