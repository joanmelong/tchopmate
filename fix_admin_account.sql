-- Script pour vérifier et créer le compte administrateur

-- 1. Vérifier si le compte admin existe
SELECT id, email, role, user_id, nom, prenom 
FROM compte 
WHERE email = 'joantsayem@gmail.com';

-- 2. Si le compte n'existe pas, le créer
-- (Décommenter cette ligne si nécessaire)
-- INSERT INTO compte (email, nom, prenom, role)
-- VALUES ('joantsayem@gmail.com', 'Tsayem', 'Joan', 'Administrateur');

-- 3. Si le compte existe mais avec le mauvais rôle, le corriger
UPDATE compte 
SET role = 'Administrateur'
WHERE email = 'joantsayem@gmail.com' 
  AND role != 'Administrateur';

-- 4. Vérifier le résultat final
SELECT id, email, role, user_id, nom, prenom 
FROM compte 
WHERE email = 'joantsayem@gmail.com';

-- 5. Lister tous les rôles existants dans la base
SELECT DISTINCT role FROM compte;
