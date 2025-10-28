-- Storage setup for 'restaurants' bucket (public read, authenticated upload)
-- Run this in Supabase SQL Editor

-- 1) Ensure bucket exists and is public
insert into storage.buckets (id, name, public)
values ('restaurants','restaurants', true)
on conflict (id) do update set public = true;

-- 2) Drop any previous policies we manage here (safe if they don't exist)
drop policy if exists "restaurants-insert-auth" on storage.objects;
drop policy if exists "restaurants-select-public" on storage.objects;

-- 3) Allow authenticated users to upload into this bucket
create policy "restaurants-insert-auth"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'restaurants');

-- 4) Allow public read of objects in this bucket (works with getPublicUrl)
create policy "restaurants-select-public"
  on storage.objects for select
  using (bucket_id = 'restaurants');

-- NOTE:
-- - If you also want to restrict UPDATE/DELETE to the object owner, add policies like:
--   create policy "restaurants-update-own"
--     on storage.objects for update to authenticated
--     using (bucket_id = 'restaurants' and owner = auth.uid())
--     with check (bucket_id = 'restaurants' and owner = auth.uid());
--   create policy "restaurants-delete-own"
--     on storage.objects for delete to authenticated
--     using (bucket_id = 'restaurants' and owner = auth.uid());
-- - Depending on your Supabase version, the `owner` column is set automatically on upload; if not, remove the owner checks.
