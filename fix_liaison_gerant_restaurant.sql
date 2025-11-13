-- ========================================
-- SCRIPT DE CORRECTION : Créer les liaisons manquantes
-- Gérant authentifié via Google → Compte → Restaurant
-- ========================================

-- IMPORTANT : Ce script doit être exécuté APRÈS vous être connecté
-- Remplacez les valeurs entre <> par vos vraies données

-- ========================================
-- ÉTAPE 1 : Vérifier votre user_id et email actuel
-- ========================================
SELECT 
  auth.uid() as mon_user_id,
  auth.email() as mon_email_auth,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as mon_email_users;

-- IMPORTANT : Si mon_email_auth est NULL, utilisez mon_email_users
-- Notez votre email affiché ci-dessus

-- ========================================
-- ÉTAPE 2 : Vérifier si vous avez déjà un compte
-- ========================================
SELECT * FROM public.compte WHERE user_id = auth.uid();

-- Si la requête retourne VIDE, passez à l'ÉTAPE 3
-- Si elle retourne un résultat, passez à l'ÉTAPE 4

-- ========================================
-- ÉTAPE 3 : Créer votre compte (si manquant)
-- ========================================
-- IMPORTANT : Remplacez <VOTRE_EMAIL> par votre vraie adresse email
-- (celle affichée dans l'ÉTAPE 1 comme mon_email_users)

INSERT INTO public.compte (user_id, nom, prenom, email, role)
VALUES (
  auth.uid(),                                -- Votre user_id (automatique)
  '<VOTRE_NOM>',                             -- Ex: 'Tchoupo'
  '<VOTRE_PRENOM>',                          -- Ex: 'Jean'
  '<VOTRE_EMAIL>',                           -- Ex: 'jean.tchoupo@gmail.com' ← IMPORTANT !
  'gerant'                                   -- Role fixe
)
RETURNING *;

-- Notez l'ID du compte créé (colonne "id")
-- Exemple : Si le résultat est { id: 5000, ... }, votre compte_id = 5000

-- ========================================
-- ÉTAPE 4 : Vérifier si vous avez déjà un restaurant
-- ========================================
SELECT 
  r.*,
  c.id as compte_id,
  c.nom as gerant_nom
FROM public.restaurant r
JOIN public.compte c ON r.gerant_id = c.id
WHERE c.user_id = auth.uid();

-- Si la requête retourne VIDE, passez à l'ÉTAPE 5
-- Si elle retourne un résultat, votre restaurant existe déjà !

-- ========================================
-- ÉTAPE 5 : Créer votre restaurant (si manquant)
-- ========================================
-- Remplacez les valeurs entre <> :

INSERT INTO public.restaurant (nom, localisation, gerant_id)
VALUES (
  '<NOM_RESTAURANT>',            -- Ex: 'Chez Mama Africa'
  '<LOCALISATION>',              -- Ex: 'Yaoundé, Bastos'
  (SELECT id FROM public.compte WHERE user_id = auth.uid())
)
RETURNING *;

-- Notez l'id_restaurant créé
-- Exemple : Si le résultat est { id_restaurant: 123, ... }, votre restaurant_id = 123

-- ========================================
-- ÉTAPE 6 : Vérifier que tout est lié correctement
-- ========================================
SELECT 
  'VÉRIFICATION FINALE' as etape,
  auth.uid() as auth_user_id,
  auth.email() as auth_email,
  c.id as compte_id,
  c.nom || ' ' || c.prenom as gerant_nom,
  r.id_restaurant,
  r.nom as restaurant_nom
FROM public.compte c
LEFT JOIN public.restaurant r ON r.gerant_id = c.id
WHERE c.user_id = auth.uid();

-- Cette requête DOIT retourner :
-- ✅ auth_user_id : votre UUID
-- ✅ compte_id : un nombre (ex: 5000)
-- ✅ id_restaurant : un nombre (ex: 123)
-- ✅ restaurant_nom : le nom de votre restaurant

-- ========================================
-- ÉTAPE 7 : Tester la création d'un plat (optionnel)
-- ========================================
-- Ceci teste si les politiques RLS fonctionnent

INSERT INTO public.plat (restaurant_id, nom, prix, categorie, disponible)
VALUES (
  (
    SELECT r.id_restaurant 
    FROM public.restaurant r
    JOIN public.compte c ON r.gerant_id = c.id
    WHERE c.user_id = auth.uid()
  ),
  'Plat de Test',
  2500,
  'Test',
  true
)
RETURNING *;

-- Si cette insertion fonctionne : ✅ Tout est correctement configuré !
-- Si elle échoue avec "RLS policy" : ⚠️ Problème de politiques RLS

-- ========================================
-- ÉTAPE 8 : Supprimer le plat de test (optionnel)
-- ========================================
DELETE FROM public.plat 
WHERE nom = 'Plat de Test' 
  AND restaurant_id IN (
    SELECT r.id_restaurant 
    FROM public.restaurant r
    JOIN public.compte c ON r.gerant_id = c.id
    WHERE c.user_id = auth.uid()
  );

-- ========================================
-- TROUBLESHOOTING
-- ========================================

-- Si vous obtenez "permission denied" ou "RLS policy violation" :

-- 1. Vérifier que vous êtes bien authentifié :
SELECT auth.uid(); -- Doit retourner votre UUID, pas NULL

-- 2. Vérifier que les politiques RLS existent :
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('compte', 'restaurant', 'plat');

-- 3. Vérifier le lien compte → restaurant :
SELECT 
  c.id as compte_id,
  c.user_id,
  r.id_restaurant,
  r.gerant_id
FROM public.compte c
LEFT JOIN public.restaurant r ON r.gerant_id = c.id
WHERE c.user_id = auth.uid();

-- Si gerant_id ≠ compte_id : Problème de liaison !
-- Solution : Mettez à jour le gerant_id
UPDATE public.restaurant 
SET gerant_id = (SELECT id FROM public.compte WHERE user_id = auth.uid())
WHERE id_restaurant = <VOTRE_ID_RESTAURANT>;

-- ========================================
-- EXEMPLE COMPLET (À ADAPTER)
-- ========================================

/*
-- 1. Vérifier l'authentification
SELECT auth.uid(), auth.email();
-- Résultat : { uid: "abc-123-xyz", email: "jean@gmail.com" }

-- 2. Créer le compte (si manquant)
INSERT INTO public.compte (user_id, nom, prenom, email, role)
VALUES (auth.uid(), 'Tchoupo', 'Jean', auth.email(), 'gerant')
RETURNING *;
-- Résultat : { id: 5000, user_id: "abc-123-xyz", ... }

-- 3. Créer le restaurant (si manquant)
INSERT INTO public.restaurant (nom, localisation, gerant_id)
VALUES ('Chez Mama Africa', 'Yaoundé, Bastos', 5000)
RETURNING *;
-- Résultat : { id_restaurant: 123, gerant_id: 5000, ... }

-- 4. Vérification finale
SELECT auth.uid(), c.id, r.id_restaurant
FROM public.compte c
JOIN public.restaurant r ON r.gerant_id = c.id
WHERE c.user_id = auth.uid();
-- Résultat : { uid: "abc-123-xyz", id: 5000, id_restaurant: 123 }

-- ✅ Configuration terminée !
*/
