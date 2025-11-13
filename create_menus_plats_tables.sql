-- ========================================
-- Script de création des tables pour la gestion des menus et plats
-- User Story 4.1 - TchopMate
-- ========================================

-- ========================================
-- 1. Création des tables
-- ========================================

-- Table menus
CREATE TABLE IF NOT EXISTS menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  nom VARCHAR(255) NOT NULL,
  description TEXT,
  prix DECIMAL(10, 2),
  image_url TEXT,
  disponible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table plats
CREATE TABLE IF NOT EXISTS plats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
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
-- 2. Création des index
-- ========================================

-- Index pour menus
CREATE INDEX IF NOT EXISTS idx_menus_restaurant_id ON menus(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menus_disponible ON menus(disponible);

-- Index pour plats
CREATE INDEX IF NOT EXISTS idx_plats_restaurant_id ON plats(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_plats_categorie ON plats(categorie);
CREATE INDEX IF NOT EXISTS idx_plats_disponible ON plats(disponible);

-- ========================================
-- 3. Fonction trigger pour updated_at
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 4. Triggers
-- ========================================

-- Trigger pour menus
DROP TRIGGER IF EXISTS update_menus_updated_at ON menus;
CREATE TRIGGER update_menus_updated_at
  BEFORE UPDATE ON menus
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour plats
DROP TRIGGER IF EXISTS update_plats_updated_at ON plats;
CREATE TRIGGER update_plats_updated_at
  BEFORE UPDATE ON plats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 5. Row Level Security (RLS) - Menus
-- ========================================

ALTER TABLE menus ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Gérants peuvent voir leurs menus" ON menus;
DROP POLICY IF EXISTS "Gérants peuvent créer des menus" ON menus;
DROP POLICY IF EXISTS "Gérants peuvent modifier leurs menus" ON menus;
DROP POLICY IF EXISTS "Gérants peuvent supprimer leurs menus" ON menus;
DROP POLICY IF EXISTS "Clients peuvent voir les menus disponibles" ON menus;

-- Les gérants peuvent voir tous les menus de leur restaurant
CREATE POLICY "Gérants peuvent voir leurs menus"
  ON menus FOR SELECT
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM gerants 
      WHERE user_id = auth.uid()
    )
  );

-- Les gérants peuvent créer des menus pour leur restaurant
CREATE POLICY "Gérants peuvent créer des menus"
  ON menus FOR INSERT
  WITH CHECK (
    restaurant_id IN (
      SELECT restaurant_id FROM gerants 
      WHERE user_id = auth.uid()
    )
  );

-- Les gérants peuvent modifier leurs menus
CREATE POLICY "Gérants peuvent modifier leurs menus"
  ON menus FOR UPDATE
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM gerants 
      WHERE user_id = auth.uid()
    )
  );

-- Les gérants peuvent supprimer leurs menus
CREATE POLICY "Gérants peuvent supprimer leurs menus"
  ON menus FOR DELETE
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM gerants 
      WHERE user_id = auth.uid()
    )
  );

-- Les clients peuvent voir les menus disponibles
CREATE POLICY "Clients peuvent voir les menus disponibles"
  ON menus FOR SELECT
  USING (disponible = TRUE);

-- ========================================
-- 6. Row Level Security (RLS) - Plats
-- ========================================

ALTER TABLE plats ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Gérants peuvent voir leurs plats" ON plats;
DROP POLICY IF EXISTS "Gérants peuvent créer des plats" ON plats;
DROP POLICY IF EXISTS "Gérants peuvent modifier leurs plats" ON plats;
DROP POLICY IF EXISTS "Gérants peuvent supprimer leurs plats" ON plats;
DROP POLICY IF EXISTS "Clients peuvent voir les plats disponibles" ON plats;

-- Les gérants peuvent voir tous les plats de leur restaurant
CREATE POLICY "Gérants peuvent voir leurs plats"
  ON plats FOR SELECT
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM gerants 
      WHERE user_id = auth.uid()
    )
  );

-- Les gérants peuvent créer des plats pour leur restaurant
CREATE POLICY "Gérants peuvent créer des plats"
  ON plats FOR INSERT
  WITH CHECK (
    restaurant_id IN (
      SELECT restaurant_id FROM gerants 
      WHERE user_id = auth.uid()
    )
  );

-- Les gérants peuvent modifier leurs plats
CREATE POLICY "Gérants peuvent modifier leurs plats"
  ON plats FOR UPDATE
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM gerants 
      WHERE user_id = auth.uid()
    )
  );

-- Les gérants peuvent supprimer leurs plats
CREATE POLICY "Gérants peuvent supprimer leurs plats"
  ON plats FOR DELETE
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM gerants 
      WHERE user_id = auth.uid()
    )
  );

-- Les clients peuvent voir les plats disponibles
CREATE POLICY "Clients peuvent voir les plats disponibles"
  ON plats FOR SELECT
  USING (disponible = TRUE);

-- ========================================
-- 7. Données de test (optionnel)
-- ========================================

-- Décommentez les lignes suivantes pour insérer des données de test
-- Remplacez les UUID par ceux de votre base de données

/*
-- Exemple d'insertion de menus
INSERT INTO menus (restaurant_id, nom, description, prix, disponible) VALUES
('VOTRE-RESTAURANT-UUID', 'Menu du jour', 'Menu complet avec entrée, plat et dessert', 3500, TRUE),
('VOTRE-RESTAURANT-UUID', 'Menu express', 'Plat principal + boisson', 2000, TRUE);

-- Exemple d'insertion de plats
INSERT INTO plats (restaurant_id, nom, description, prix, categorie, temps_preparation, disponible) VALUES
('VOTRE-RESTAURANT-UUID', 'Ndolé aux crevettes', 'Plat traditionnel camerounais', 2500, 'Plats traditionnels', 25, TRUE),
('VOTRE-RESTAURANT-UUID', 'Poulet DG', 'Poulet sauté aux légumes et plantains', 3000, 'Plats traditionnels', 30, TRUE),
('VOTRE-RESTAURANT-UUID', 'Riz sauté aux légumes', 'Riz parfumé avec légumes frais', 1800, 'Plats végétariens', 20, TRUE),
('VOTRE-RESTAURANT-UUID', 'Jus de bissap', 'Boisson fraîchissante', 500, 'Boissons', 5, TRUE);
*/
