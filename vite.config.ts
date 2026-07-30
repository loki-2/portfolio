import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss(),
      // ── /api/sync — bulk-syncs all Notion projects to Supabase ──────────────
      {
        name: 'notion-sync-api',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url !== '/api/sync') return next();

            res.setHeader('Content-Type', 'application/json');

            const NOTION_TOKEN   = env.NOTION_TOKEN;
            const DB_ID          = env.VITE_NOTION_DB_ID;
            const SUPABASE_URL   = env.VITE_SUPABASE_URL;
            const SUPABASE_KEY   = env.VITE_SUPABASE_ANON_KEY;
            const NOTION_VERSION = '2022-06-28';

            const notionHeaders = {
              Authorization: `Bearer ${NOTION_TOKEN}`,
              'Notion-Version': NOTION_VERSION,
              'Content-Type': 'application/json',
            };

            try {
              // 1. Fetch all pages in the DB
              const dbRes = await fetch(
                `https://api.notion.com/v1/databases/${DB_ID}/query`,
                { method: 'POST', headers: notionHeaders, body: JSON.stringify({}) }
              );
              if (!dbRes.ok) throw new Error(`Notion DB query failed: ${dbRes.status}`);
              const dbData = await dbRes.json() as { results: Record<string, unknown>[] };

              const results: { id: string; title: string; status: string; error?: string }[] = [];

              // 2. For each page, fetch blocks + upsert to Supabase
              for (const page of dbData.results) {
                const p = page as {
                  id: string;
                  properties: Record<string, {
                    title?: { plain_text: string }[];
                    rich_text?: { plain_text: string }[];
                    multi_select?: { name: string }[];
                  }>;
                };
                const props = p.properties;
                const richText = (arr: { plain_text: string }[] | undefined) =>
                  (arr ?? []).map(r => r.plain_text).join('');

                const notionPageId = p.id.replace(/-/g, '');
                const title = richText(props.Title?.title);

                try {
                  // Fetch all block children (paginated)
                  const blocks: unknown[] = [];
                  let cursor: string | null = null;
                  do {
                    const url = new URL(`https://api.notion.com/v1/blocks/${notionPageId}/children`);
                    url.searchParams.set('page_size', '100');
                    if (cursor) url.searchParams.set('start_cursor', cursor);
                    const bRes = await fetch(url.toString(), { headers: notionHeaders });
                    if (!bRes.ok) throw new Error(`Blocks fetch failed: ${bRes.status}`);
                    const bData = await bRes.json() as { results: unknown[]; has_more: boolean; next_cursor: string | null };
                    blocks.push(...bData.results);
                    cursor = bData.has_more ? bData.next_cursor : null;
                  } while (cursor);

                  // Upsert to Supabase
                  const upsertRes = await fetch(`${SUPABASE_URL}/rest/v1/projects`, {
                    method: 'POST',
                    headers: {
                      apikey: SUPABASE_KEY,
                      Authorization: `Bearer ${SUPABASE_KEY}`,
                      'Content-Type': 'application/json',
                      Prefer: 'resolution=merge-duplicates',
                    },
                    body: JSON.stringify({
                      notion_page_id: notionPageId,
                      title,
                      subtext:   richText(props.Subtext?.rich_text),
                      role:      richText(props.Role?.rich_text),
                      team:      richText(props.Team?.rich_text),
                      duration:  richText(props.Duration?.rich_text),
                      methods:   richText(props.Methods?.rich_text),
                      tags:      (props.Tags?.multi_select ?? []).map(t => t.name),
                      blocks,
                      updated_at: new Date().toISOString(),
                    }),
                  });

                  if (!upsertRes.ok) {
                    const errText = await upsertRes.text();
                    throw new Error(`Supabase upsert failed ${upsertRes.status}: ${errText}`);
                  }

                  results.push({ id: notionPageId, title, status: 'ok' });
                } catch (pageErr) {
                  results.push({ id: notionPageId, title, status: 'error', error: String(pageErr) });
                }
              }

              res.statusCode = 200;
              res.end(JSON.stringify({ synced: results.length, results }, null, 2));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: String(err) }));
            }
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        // Proxy all /api/notion/* requests → https://api.notion.com/v1/*
        // Auth headers injected server-side so token never reaches the browser
        '/api/notion': {
          target: 'https://api.notion.com',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/notion/, '/v1'),
          headers: {
            Authorization: `Bearer ${env.NOTION_TOKEN}`,
            'Notion-Version': '2022-06-28',
          },
        },
      },
    },
  }
})
