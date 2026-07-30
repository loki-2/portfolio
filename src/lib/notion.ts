import type { NotionRichText, NotionBlock, NotionProject } from './types';

// ─── Constants ────────────────────────────────────────────────────────────────
// In dev, Vite proxies /api/notion → https://api.notion.com/v1 with auth injected.
const NOTION_BASE = '/api/notion';
const DB_ID = import.meta.env.VITE_NOTION_DB_ID as string;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function richText(arr: NotionRichText[]): string {
  return (arr ?? []).map((r) => r.plain_text).join('');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPage(page: any): Omit<NotionProject, 'blocks' | 'updatedAt'> {
  const p = page.properties;
  return {
    notionPageId: page.id.replace(/-/g, ''),
    title:    richText(p.Title?.title ?? []),
    subtext:  richText(p.Subtext?.rich_text ?? []),
    role:     richText(p.Role?.rich_text ?? []),
    team:     richText(p.Team?.rich_text ?? []),
    duration: richText(p.Duration?.rich_text ?? []),
    methods:  richText(p.Methods?.rich_text ?? []),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tags:     (p.Tags?.multi_select ?? []).map((t: any) => t.name as string),
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Fetch all projects from the Notion database. */
export async function getProjects(): Promise<Array<Omit<NotionProject, 'blocks' | 'updatedAt'>>> {
  const res = await fetch(`${NOTION_BASE}/databases/${DB_ID}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error(`Notion query failed: ${res.status}`);
  const data = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data.results ?? []).map((p: any) => mapPage(p));
}

/** Fetch a single page's properties from Notion. */
export async function getProject(
  pageId: string
): Promise<Omit<NotionProject, 'blocks' | 'updatedAt'>> {
  const id = pageId.replace(/-/g, '');
  const res = await fetch(`${NOTION_BASE}/pages/${id}`);
  if (!res.ok) throw new Error(`Notion page fetch failed: ${res.status}`);
  const page = await res.json();
  return mapPage(page);
}

/** Fetch all block children for a page (handles pagination). */
export async function getProjectBlocks(pageId: string): Promise<NotionBlock[]> {
  const id = pageId.replace(/-/g, '');
  const blocks: NotionBlock[] = [];
  let cursor: string | null = null;

  do {
    const url = new URL(`${NOTION_BASE}/blocks/${id}/children`, window.location.origin);
    url.searchParams.set('page_size', '100');
    if (cursor) url.searchParams.set('start_cursor', cursor);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Notion blocks fetch failed: ${res.status}`);
    const data = await res.json();

    blocks.push(...(data.results ?? []));
    cursor = data.has_more ? (data.next_cursor as string) : null;
  } while (cursor);

  return blocks;
}

/** Fetch page properties + all blocks in one call. */
export async function getProjectWithBlocks(pageId: string): Promise<NotionProject> {
  const [project, blocks] = await Promise.all([
    getProject(pageId),
    getProjectBlocks(pageId),
  ]);
  return { ...project, blocks, updatedAt: new Date().toISOString() };
}
