-- Permettre la création automatique de comptes lors de la première connexion

-- Vérifier les politiques actuelles sur la table compte
SELECT 
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'compte'
ORDER BY policyname;

-- Ajouter une politique pour permettre l'insertion de nouveaux comptes
-- Cette politique permet au service role (API) de créer des comptes
DROP POLICY IF EXISTS "Service role peut créer des comptes" ON compte;

CREATE POLICY "Service role peut créer des comptes"
ON compte
FOR INSERT
WITH CHECK (true); -- Le service role contourne RLS de toute façon

-- Alternative: Désactiver temporairement RLS sur compte pour les insertions
-- (moins sécurisé mais plus simple)
-- ALTER TABLE compte DISABLE ROW LEVEL SECURITY;

-- Vérifier que la politique a été créée
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'compte'
ORDER BY policyname;
