-- Permettre la lecture des comptes par le service role (API)

-- Vérifier les politiques actuelles
SELECT 
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'compte'
ORDER BY policyname;

-- Ajouter une politique permissive pour SELECT
-- Cette politique permet de lire tous les comptes (nécessaire pour l'API)
DROP POLICY IF EXISTS "Service role peut lire tous les comptes" ON compte;

CREATE POLICY "Service role peut lire tous les comptes"
ON compte
FOR SELECT
USING (true); -- Permet de lire tous les comptes

-- Politique pour que les utilisateurs puissent lire leur propre compte
DROP POLICY IF EXISTS "Users peuvent lire leur propre compte" ON compte;

CREATE POLICY "Users peuvent lire leur propre compte"
ON compte
FOR SELECT
USING (auth.uid() = user_id);

-- Politique pour UPDATE (utilisateurs peuvent modifier leur propre compte)
DROP POLICY IF EXISTS "Users peuvent modifier leur propre compte" ON compte;

CREATE POLICY "Users peuvent modifier leur propre compte"
ON compte
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Vérifier les politiques créées
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'compte'
ORDER BY cmd, policyname;
