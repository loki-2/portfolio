import { createClient } from '@supabase/supabase-js';
import type { NotionProject } from './types';

// ─── Supabase client ─────────────────────────────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
);


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

let memoryProjectsCache: NotionProject[] | null = null;

/**
 * Fetches ALL projects from Supabase (used on the homepage).
 * Selects only metadata — NOT blocks — to keep the payload small and fast.
 * Blocks are only fetched on demand by getCachedProject.
 */
export async function getAllProjectsFromCache(): Promise<NotionProject[]> {
  if (memoryProjectsCache && memoryProjectsCache.length > 0) {
    return memoryProjectsCache;
  }

  const { data, error } = await supabase
    .from('projects')
    // Exclude heavy `blocks` column — we only need list metadata here
    .select('notion_page_id, title, subtext, role, team, duration, methods, tags, updated_at')
    .order('updated_at', { ascending: false });

  if (error) {
    if (memoryProjectsCache) return memoryProjectsCache;
    throw new Error(`Supabase fetch failed: ${error.message}`);
  }

  memoryProjectsCache = (data ?? []).map((row) => rowToProject(row as ProjectRow));
  return memoryProjectsCache;
}

/**
 * Returns the cached project (with blocks) for a given page ID.
 * Fast path: if the in-memory cache already has blocks for this project, return immediately.
 * Otherwise fetch the full row (including blocks) from Supabase and cache it.
 */
export async function getCachedProject(notionPageId: string): Promise<NotionProject | null> {
  const cleanTarget = notionPageId.replace(/-/g, '');

  // Fast path: in memory AND has blocks already
  if (memoryProjectsCache) {
    const hit = memoryProjectsCache.find(
      (p) => p.notionPageId.replace(/-/g, '') === cleanTarget
    );
    // Only return the hit if blocks have been fetched (non-empty array)
    if (hit && hit.blocks && hit.blocks.length > 0) return hit;
  }

  try {
    // Fetch the full row including blocks for this single project
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('notion_page_id', notionPageId)
      .single();

    if (error || !data) return null;

    const project = rowToProject(data as ProjectRow);

    // Merge blocks back into the memory cache so future navigations are instant
    if (memoryProjectsCache) {
      const idx = memoryProjectsCache.findIndex(
        (p) => p.notionPageId.replace(/-/g, '') === cleanTarget
      );
      if (idx >= 0) {
        memoryProjectsCache[idx] = project;
      } else {
        memoryProjectsCache.push(project);
      }
    }

    return project;
  } catch {
    return null;   // table may not exist yet — fail gracefully
  }
}

/**
 * Writes (or updates) a project record in Supabase.
 * Call this after fetching fresh data from Notion.
 */
export async function upsertProject(project: NotionProject): Promise<void> {
  if (memoryProjectsCache) {
    const idx = memoryProjectsCache.findIndex((p) => p.notionPageId === project.notionPageId);
    if (idx >= 0) {
      memoryProjectsCache[idx] = project;
    } else {
      memoryProjectsCache.push(project);
    }
  }

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
