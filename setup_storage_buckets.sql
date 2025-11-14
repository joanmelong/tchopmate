-- ========================================
-- Configuration Supabase Storage
-- Création des buckets et politiques RLS pour les images
-- User Story 4.1 - TchopMate
-- ========================================

-- ========================================
-- IMPORTANT : Ce script doit être exécuté via l'interface Supabase
-- Dashboard → Storage → Create Bucket (pour créer les buckets)
-- Puis exécutez les politiques ci-dessous dans SQL Editor
-- ========================================

-- ========================================
-- 1. Création des buckets (via Dashboard ou SQL)
-- ========================================
-- Créer les buckets suivants dans Supabase Dashboard → Storage :
-- - Nom: dishes
--   Public: true (pour permettre l'accès public aux images)
--   File size limit: 5MB
--   Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp, image/gif

-- - Nom: menus
--   Public: true
--   File size limit: 5MB
--   Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp, image/gif

-- - Nom: restaurants (optionnel, pour les logos)
--   Public: true
--   File size limit: 5MB
--   Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp, image/gif

-- ========================================
-- 2. Politiques RLS pour le bucket 'dishes'
-- ========================================

-- Politique : Les gérants peuvent uploader des images pour leurs restaurants
CREATE POLICY "Gerants peuvent uploader des images de plats"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'dishes' AND
  -- Le chemin doit commencer par le restaurant_id du gérant
  (storage.foldername(name))[1] IN (
    SELECT r.id_restaurant::text
    FROM public.restaurant r
    JOIN public.compte c ON r.gerant_id = c.id
    WHERE c.user_id = auth.uid()
  )
);

-- Politique : Les gérants peuvent mettre à jour leurs images
CREATE POLICY "Gerants peuvent mettre a jour leurs images de plats"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'dishes' AND
  (storage.foldername(name))[1] IN (
    SELECT r.id_restaurant::text
    FROM public.restaurant r
    JOIN public.compte c ON r.gerant_id = c.id
    WHERE c.user_id = auth.uid()
  )
)
WITH CHECK (
  bucket_id = 'dishes' AND
  (storage.foldername(name))[1] IN (
    SELECT r.id_restaurant::text
    FROM public.restaurant r
    JOIN public.compte c ON r.gerant_id = c.id
    WHERE c.user_id = auth.uid()
  )
);

-- Politique : Les gérants peuvent supprimer leurs images
CREATE POLICY "Gerants peuvent supprimer leurs images de plats"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'dishes' AND
  (storage.foldername(name))[1] IN (
    SELECT r.id_restaurant::text
    FROM public.restaurant r
    JOIN public.compte c ON r.gerant_id = c.id
    WHERE c.user_id = auth.uid()
  )
);

-- Politique : Tout le monde peut voir les images (lecture publique)
CREATE POLICY "Tout le monde peut voir les images de plats"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'dishes');

-- ========================================
-- 3. Politiques RLS pour le bucket 'menus'
-- ========================================

-- Politique : Les gérants peuvent uploader des images pour leurs restaurants
CREATE POLICY "Gerants peuvent uploader des images de menus"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'menus' AND
  (storage.foldername(name))[1] IN (
    SELECT r.id_restaurant::text
    FROM public.restaurant r
    JOIN public.compte c ON r.gerant_id = c.id
    WHERE c.user_id = auth.uid()
  )
);

-- Politique : Les gérants peuvent mettre à jour leurs images
CREATE POLICY "Gerants peuvent mettre a jour leurs images de menus"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'menus' AND
  (storage.foldername(name))[1] IN (
    SELECT r.id_restaurant::text
    FROM public.restaurant r
    JOIN public.compte c ON r.gerant_id = c.id
    WHERE c.user_id = auth.uid()
  )
)
WITH CHECK (
  bucket_id = 'menus' AND
  (storage.foldername(name))[1] IN (
    SELECT r.id_restaurant::text
    FROM public.restaurant r
    JOIN public.compte c ON r.gerant_id = c.id
    WHERE c.user_id = auth.uid()
  )
);

-- Politique : Les gérants peuvent supprimer leurs images
CREATE POLICY "Gerants peuvent supprimer leurs images de menus"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'menus' AND
  (storage.foldername(name))[1] IN (
    SELECT r.id_restaurant::text
    FROM public.restaurant r
    JOIN public.compte c ON r.gerant_id = c.id
    WHERE c.user_id = auth.uid()
  )
);

-- Politique : Tout le monde peut voir les images (lecture publique)
CREATE POLICY "Tout le monde peut voir les images de menus"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'menus');

-- ========================================
-- 4. Politiques RLS pour le bucket 'restaurants' (optionnel)
-- ========================================

-- Politique : Les gérants peuvent uploader des images pour leurs restaurants
CREATE POLICY "Gerants peuvent uploader des images de restaurants"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'restaurants' AND
  (storage.foldername(name))[1] IN (
    SELECT r.id_restaurant::text
    FROM public.restaurant r
    JOIN public.compte c ON r.gerant_id = c.id
    WHERE c.user_id = auth.uid()
  )
);

-- Politique : Les gérants peuvent mettre à jour leurs images
CREATE POLICY "Gerants peuvent mettre a jour leurs images de restaurants"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'restaurants' AND
  (storage.foldername(name))[1] IN (
    SELECT r.id_restaurant::text
    FROM public.restaurant r
    JOIN public.compte c ON r.gerant_id = c.id
    WHERE c.user_id = auth.uid()
  )
)
WITH CHECK (
  bucket_id = 'restaurants' AND
  (storage.foldername(name))[1] IN (
    SELECT r.id_restaurant::text
    FROM public.restaurant r
    JOIN public.compte c ON r.gerant_id = c.id
    WHERE c.user_id = auth.uid()
  )
);

-- Politique : Les gérants peuvent supprimer leurs images
CREATE POLICY "Gerants peuvent supprimer leurs images de restaurants"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'restaurants' AND
  (storage.foldername(name))[1] IN (
    SELECT r.id_restaurant::text
    FROM public.restaurant r
    JOIN public.compte c ON r.gerant_id = c.id
    WHERE c.user_id = auth.uid()
  )
);

-- Politique : Tout le monde peut voir les images (lecture publique)
CREATE POLICY "Tout le monde peut voir les images de restaurants"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'restaurants');

-- ========================================
-- 5. Vérifications
-- ========================================

-- Vérifier que les buckets sont créés
-- SELECT * FROM storage.buckets WHERE name IN ('dishes', 'menus', 'restaurants');

-- Vérifier les politiques
-- SELECT * FROM storage.policies WHERE bucket_id IN ('dishes', 'menus', 'restaurants');

-- Tester l'upload (depuis l'application)
-- 1. Connectez-vous en tant que gérant
-- 2. Créez un plat ou menu
-- 3. Uploadez une image via drag & drop
-- 4. Vérifiez que l'image apparaît correctement

-- ========================================
-- 6. Notes importantes
-- ========================================

/*
STRUCTURE DES CHEMINS :
- Les images sont organisées par restaurant_id : {restaurant_id}/{filename}
- Exemple : dishes/5000/1699123456789-abc123.jpg

SÉCURITÉ :
- Les gérants ne peuvent uploader que dans le dossier de LEUR restaurant
- Les politiques vérifient le lien : restaurant.gerant_id → compte.id → compte.user_id
- Tout le monde peut LIRE les images (public)
- Seuls les gérants peuvent ÉCRIRE/SUPPRIMER leurs images

FORMATS ACCEPTÉS :
- JPEG/JPG
- PNG
- WebP
- GIF
Taille max : 5MB

COMPRESSION :
- L'ImageUploadService compresse automatiquement les images à 1200px de largeur
- Qualité JPEG : 80%
- Cela réduit significativement la taille des fichiers
*/

-- ========================================
-- 7. Dépannage
-- ========================================

/*
ERREUR : "new row violates row-level security policy"
SOLUTION : Vérifiez que :
1. L'utilisateur est bien authentifié
2. Il existe un enregistrement dans compte avec user_id = auth.uid()
3. Il existe un restaurant avec gerant_id = compte.id
4. Le chemin commence bien par le restaurant_id : {id_restaurant}/{filename}

ERREUR : "bucket does not exist"
SOLUTION : Créez les buckets via Dashboard → Storage

ERREUR : "permission denied for bucket"
SOLUTION : Vérifiez que le bucket est configuré en "Public"

TEST MANUEL :
SELECT 
  r.id_restaurant,
  c.id as compte_id,
  c.user_id
FROM public.restaurant r
JOIN public.compte c ON r.gerant_id = c.id
WHERE c.user_id = auth.uid();

-- Si cette requête retourne vide, vous n'êtes pas lié à un restaurant
*/
