import { createClient } from '@supabase/supabase-js';
import type { NotionProject } from './types';

// ─── Supabase client ─────────────────────────────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
);

// Cache is considered fresh for 1 hour
const CACHE_TTL_MS = 60 * 60 * 1000;

// ─── Row shape (matches the Supabase table) ──────────────────────────────────
interface ProjectRow {
  notion_page_id: string;
  title: string;
  subtext: string;
  role: string;
  team: string;
  duration: string;
  methods: string;
  tags: string[];
  blocks: unknown;          // JSONB — Notion raw block array
  updated_at: string;
}

function rowToProject(row: ProjectRow): NotionProject {
  return {
    notionPageId: row.notion_page_id,
    title:        row.title,
    subtext:      row.subtext,
    role:         row.role,
    team:         row.team,
    duration:     row.duration,
    methods:      row.methods,
    tags:         row.tags ?? [],
    blocks:       (row.blocks as NotionProject['blocks']) ?? [],
    updatedAt:    row.updated_at,
  };
}

// ─── Public helpers ───────────────────────────────────────────────────────────

/**
 * Fetches ALL projects from Supabase (used on the homepage).
 * This is the primary data source in production so we never need a Notion proxy.
 */
export async function getAllProjectsFromCache(): Promise<NotionProject[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) throw new Error(`Supabase fetch failed: ${error.message}`);
  return (data ?? []).map((row) => rowToProject(row as ProjectRow));
}

/**
 * Returns the cached project if it exists and is still fresh (< 1 h old).
 * Returns null if missing or stale so the caller can re-fetch from Notion.
 */
export async function getCachedProject(notionPageId: string): Promise<NotionProject | null> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('notion_page_id', notionPageId)
      .single();

    if (error || !data) return null;

    const age = Date.now() - new Date(data.updated_at).getTime();
    if (age > CACHE_TTL_MS) return null;   // stale

    return rowToProject(data as ProjectRow);
  } catch {
    return null;   // table may not exist yet — fail gracefully
  }
}

/**
 * Writes (or updates) a project record in Supabase.
 * Call this after fetching fresh data from Notion.
 */
export async function upsertProject(project: NotionProject): Promise<void> {
  const { error } = await supabase.from('projects').upsert(
    {
      notion_page_id: project.notionPageId,
      title:          project.title,
      subtext:        project.subtext,
      role:           project.role,
      team:           project.team,
      duration:       project.duration,
      methods:        project.methods,
      tags:           project.tags,
      blocks:         project.blocks,
      updated_at:     new Date().toISOString(),
    },
    { onConflict: 'notion_page_id' }
  );
  if (error) {
    // Non-fatal — cache write failure should never break the page,
    // but we log the real error so DB issues are visible in the console.
    console.warn('[supabase] upsert failed — running without cache:', error.code, error.message);
  }
}
