-- Run this in your Supabase project → SQL Editor

create table if not exists projects (
  notion_page_id text primary key,
  title          text not null default '',
  subtext        text not null default '',
  role           text not null default '',
  team           text not null default '',
  duration       text not null default '',
  methods        text not null default '',
  tags           text[]  not null default '{}',
  blocks         jsonb   not null default '[]',
  updated_at     timestamptz not null default now()
);

-- Allow anonymous reads and writes (matches the anon key used in the app)
alter table projects enable row level security;

create policy "Public read" on projects
  for select using (true);

create policy "Public upsert" on projects
  for insert with check (true);

create policy "Public update" on projects
  for update using (true);
