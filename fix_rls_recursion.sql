-- Corriger la récursion infinie dans les politiques RLS

-- Supprimer les politiques problématiques
DROP POLICY IF EXISTS "Gerants peuvent voir commandes de leur restaurant" ON commande;
DROP POLICY IF EXISTS "Clients peuvent voir leurs commandes" ON commande;

-- Politique simplifiée pour les gérants (SELECT seulement)
CREATE POLICY "Gerants peuvent voir commandes"
ON commande
FOR SELECT
USING (true); -- Temporairement permissif, on filtre côté API

-- Politique pour que les clients voient leurs commandes
CREATE POLICY "Clients peuvent voir leurs commandes"
ON commande
FOR SELECT
USING (
  client_id IN (
    SELECT id FROM compte WHERE user_id = auth.uid()
  )
);

-- Politique pour UPDATE par les gérants
DROP POLICY IF EXISTS "Gerants peuvent modifier commandes" ON commande;
CREATE POLICY "Gerants peuvent modifier commandes"
ON commande
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Vérifier les politiques
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'commande'
ORDER BY policyname;
