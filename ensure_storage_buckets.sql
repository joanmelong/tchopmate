-- ========================================
-- Ensure Supabase Storage buckets and policies exist (idempotent)
-- Creates 'dishes' and 'menus' buckets if missing and (re)applies policies
-- Run in Supabase SQL Editor as an admin role
-- ========================================

-- 0) Inspect current buckets
SELECT * FROM storage.buckets WHERE name IN ('dishes','menus');

DO $$
BEGIN
  -- Upsert bucket 'dishes'
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('dishes', 'dishes', TRUE)
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, public = EXCLUDED.public;
  UPDATE storage.buckets
    SET file_size_limit = 5242880,
        allowed_mime_types = ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif']::text[]
  WHERE id = 'dishes';

  -- Upsert bucket 'menus'
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('menus', 'menus', TRUE)
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, public = EXCLUDED.public;
  UPDATE storage.buckets
    SET file_size_limit = 5242880,
        allowed_mime_types = ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif']::text[]
  WHERE id = 'menus';
END $$;

-- 2) Drop existing policies for a clean slate
-- Drop known policies idempotently (pg_policies is global; no storage.policies relation)
DROP POLICY IF EXISTS "Gerants peuvent uploader des images de plats" ON storage.objects;
DROP POLICY IF EXISTS "Gerants peuvent mettre a jour leurs images de plats" ON storage.objects;
DROP POLICY IF EXISTS "Gerants peuvent supprimer leurs images de plats" ON storage.objects;
DROP POLICY IF EXISTS "Tout le monde peut voir les images de plats" ON storage.objects;

DROP POLICY IF EXISTS "Gerants peuvent uploader des images de menus" ON storage.objects;
DROP POLICY IF EXISTS "Gerants peuvent mettre a jour leurs images de menus" ON storage.objects;
DROP POLICY IF EXISTS "Gerants peuvent supprimer leurs images de menus" ON storage.objects;
DROP POLICY IF EXISTS "Tout le monde peut voir les images de menus" ON storage.objects;

-- 3) Recreate policies for 'dishes'
CREATE POLICY "Gerants peuvent uploader des images de plats"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'dishes' AND
  (storage.foldername(name))[1] IN (
    SELECT r.id_restaurant::text
    FROM public.restaurant r
    JOIN public.compte c ON r.gerant_id = c.id
    WHERE c.user_id = auth.uid()
  )
);

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

CREATE POLICY "Tout le monde peut voir les images de plats"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'dishes');

-- 4) Recreate policies for 'menus'
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

CREATE POLICY "Tout le monde peut voir les images de menus"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'menus');

-- 5) Verify
SELECT id as bucket_id, public, file_size_limit, allowed_mime_types FROM storage.buckets WHERE id IN ('dishes','menus');
SELECT schemaname, tablename, policyname, cmd, qual, with_check FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' ORDER BY policyname;
