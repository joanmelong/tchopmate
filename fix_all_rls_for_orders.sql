-- Corriger toutes les politiques RLS pour permettre la création de commandes

-- ========================================
-- TABLE: commande
-- ========================================

-- Politique pour INSERT (permettre aux utilisateurs de créer des commandes)
DROP POLICY IF EXISTS "Users peuvent créer des commandes" ON commande;
CREATE POLICY "Users peuvent créer des commandes"
ON commande
FOR INSERT
WITH CHECK (
  client_id IN (
    SELECT id FROM compte WHERE user_id = auth.uid()
  )
);

-- Politique permissive pour INSERT (service role)
DROP POLICY IF EXISTS "Service role peut créer des commandes" ON commande;
CREATE POLICY "Service role peut créer des commandes"
ON commande
FOR INSERT
WITH CHECK (true);

-- ========================================
-- TABLE: commande_plat
-- ========================================

-- Politique pour INSERT
DROP POLICY IF EXISTS "Service role peut créer commande_plat" ON commande_plat;
CREATE POLICY "Service role peut créer commande_plat"
ON commande_plat
FOR INSERT
WITH CHECK (true);

-- Politique pour SELECT
DROP POLICY IF EXISTS "Users peuvent voir leurs commande_plat" ON commande_plat;
CREATE POLICY "Users peuvent voir leurs commande_plat"
ON commande_plat
FOR SELECT
USING (
  commande_id IN (
    SELECT id_commande FROM commande 
    WHERE client_id IN (
      SELECT id FROM compte WHERE user_id = auth.uid()
    )
  )
);

-- ========================================
-- Vérifier les politiques créées
-- ========================================
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN ('commande', 'commande_plat', 'compte')
ORDER BY tablename, cmd, policyname;
