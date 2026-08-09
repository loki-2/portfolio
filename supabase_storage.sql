-- Run this in your Supabase project → SQL Editor
-- Creates the storage bucket for Notion images

-- 1. Create the bucket (public so images can be accessed without auth)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'notion-images',
  'notion-images',
  true,
  10485760,  -- 10 MB limit per file
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
on conflict (id) do nothing;

-- 2. Allow anonymous uploads (the anon key is used during sync)
create policy "Public upload notion-images" on storage.objects
  for insert to anon
  with check (bucket_id = 'notion-images');

-- 3. Allow public reads
create policy "Public read notion-images" on storage.objects
  for select to anon
  using (bucket_id = 'notion-images');

-- 4. Allow updates (so re-sync can overwrite existing images)
create policy "Public update notion-images" on storage.objects
  for update to anon
  using (bucket_id = 'notion-images');
