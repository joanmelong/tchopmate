-- ========================================
-- DIAGNOSTIC : Liaison Gérant → Compte → Restaurant → Plats
-- ========================================

-- ========================================
-- 1. Vérifier l'utilisateur authentifié
-- ========================================
SELECT 
  'Utilisateur actuel' as info,
  auth.uid() as user_id,
  auth.email() as email;

-- ========================================
-- 2. Vérifier le compte lié à l'utilisateur
-- ========================================
SELECT 
  'Compte du gérant' as info,
  c.id as compte_id,
  c.user_id,
  c.nom,
  c.prenom,
  c.email,
  c.role,
  c.created_at
FROM public.compte c
WHERE c.user_id = auth.uid();

-- ========================================
-- 3. Vérifier le restaurant lié au compte
-- ========================================
SELECT 
  'Restaurant du gérant' as info,
  r.id_restaurant,
  r.nom as restaurant_nom,
  r.gerant_id,
  c.id as compte_id,
  c.nom as gerant_nom,
  c.prenom as gerant_prenom,
  c.email as gerant_email
FROM public.restaurant r
JOIN public.compte c ON r.gerant_id = c.id
WHERE c.user_id = auth.uid();

-- ========================================
-- 4. Vérifier les plats du restaurant
-- ========================================
SELECT 
  'Plats du restaurant' as info,
  p.id,
  p.nom as plat_nom,
  p.prix,
  p.restaurant_id,
  r.nom as restaurant_nom
FROM public.plat p
JOIN public.restaurant r ON p.restaurant_id = r.id_restaurant
JOIN public.compte c ON r.gerant_id = c.id
WHERE c.user_id = auth.uid()
LIMIT 5;

-- ========================================
-- 5. Vérifier les menus du restaurant
-- ========================================
SELECT 
  'Menus du restaurant' as info,
  m.id,
  m.nom as menu_nom,
  m.prix,
  m.restaurant_id,
  r.nom as restaurant_nom
FROM public.menu m
JOIN public.restaurant r ON m.restaurant_id = r.id_restaurant
JOIN public.compte c ON r.gerant_id = c.id
WHERE c.user_id = auth.uid()
LIMIT 5;

-- ========================================
-- 6. Vérifier la chaîne complète (RÉSUMÉ)
-- ========================================
SELECT 
  'RÉSUMÉ COMPLET' as info,
  auth.uid() as auth_user_id,
  c.id as compte_id,
  c.nom || ' ' || c.prenom as gerant_nom_complet,
  r.id_restaurant,
  r.nom as restaurant_nom,
  COUNT(DISTINCT p.id) as nombre_plats,
  COUNT(DISTINCT m.id) as nombre_menus
FROM public.compte c
LEFT JOIN public.restaurant r ON r.gerant_id = c.id
LEFT JOIN public.plat p ON p.restaurant_id = r.id_restaurant
LEFT JOIN public.menu m ON m.restaurant_id = r.id_restaurant
WHERE c.user_id = auth.uid()
GROUP BY auth.uid(), c.id, c.nom, c.prenom, r.id_restaurant, r.nom;

-- ========================================
-- 7. Vérifier s'il manque des liaisons
-- ========================================

-- Cas 1 : Utilisateur sans compte
SELECT 
  'PROBLÈME: Utilisateur sans compte' as diagnostic,
  auth.uid() as user_id,
  auth.email() as email
WHERE NOT EXISTS (
  SELECT 1 FROM public.compte WHERE user_id = auth.uid()
);

-- Cas 2 : Compte sans restaurant
SELECT 
  'PROBLÈME: Compte sans restaurant' as diagnostic,
  c.id as compte_id,
  c.user_id,
  c.nom,
  c.prenom,
  c.email
FROM public.compte c
WHERE c.user_id = auth.uid()
  AND NOT EXISTS (
    SELECT 1 FROM public.restaurant WHERE gerant_id = c.id
  );

-- Cas 3 : Restaurant sans plats ni menus
SELECT 
  'PROBLÈME: Restaurant sans plats ni menus' as diagnostic,
  r.id_restaurant,
  r.nom as restaurant_nom,
  r.gerant_id
FROM public.restaurant r
JOIN public.compte c ON r.gerant_id = c.id
WHERE c.user_id = auth.uid()
  AND NOT EXISTS (
    SELECT 1 FROM public.plat WHERE restaurant_id = r.id_restaurant
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.menu WHERE restaurant_id = r.id_restaurant
  );

-- ========================================
-- 8. SOLUTION : Créer les liaisons manquantes
-- ========================================

-- Si vous n'avez PAS de compte, créez-en un :
/*
INSERT INTO public.compte (user_id, nom, prenom, email, role)
VALUES (
  auth.uid(),
  'Votre Nom',
  'Votre Prénom',
  auth.email(),
  'gerant'
);
*/

-- Si vous n'avez PAS de restaurant, créez-en un :
/*
INSERT INTO public.restaurant (nom, localisation, gerant_id)
VALUES (
  'Mon Restaurant',
  'Yaoundé, Cameroun',
  (SELECT id FROM public.compte WHERE user_id = auth.uid())
);
*/

-- ========================================
-- 9. Vérifier la structure des tables
-- ========================================
SELECT 
  'Structure table compte' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'compte'
ORDER BY ordinal_position;

SELECT 
  'Structure table restaurant' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'restaurant'
ORDER BY ordinal_position;

SELECT 
  'Structure table plat' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'plat'
ORDER BY ordinal_position;

-- ========================================
-- 10. Vérifier les politiques RLS
-- ========================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('compte', 'restaurant', 'plat', 'menu')
ORDER BY tablename, policyname;
