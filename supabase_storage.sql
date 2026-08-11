-- Run this in your Supabase project → SQL Editor
-- Creates/updates the storage bucket for Notion images & videos

-- 1. Create the bucket if missing
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'notion-images',
  'notion-images',
  true,
  524288000,  -- 500 MB limit per file for videos
  null        -- Allow all mime types (images, videos, etc.)
)
on conflict (id) do nothing;

-- 2. Update existing bucket settings to support video MIME types and larger limits
update storage.buckets
set allowed_mime_types = null,
    file_size_limit = 524288000
where id = 'notion-images';

-- 3. Allow anonymous uploads (the anon key is used during sync)
create policy "Public upload notion-images" on storage.objects
  for insert to anon
  with check (bucket_id = 'notion-images');

-- 4. Allow public reads
create policy "Public read notion-images" on storage.objects
  for select to anon
  using (bucket_id = 'notion-images');

-- 5. Allow updates (so re-sync can overwrite existing media)
create policy "Public update notion-images" on storage.objects
  for update to anon
  using (bucket_id = 'notion-images');

