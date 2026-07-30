import type { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  const NOTION_TOKEN = process.env.NOTION_TOKEN;

  if (!NOTION_TOKEN) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'NOTION_TOKEN is not configured in Netlify environment variables.' }),
    };
  }

  // Extract the original request path from rawUrl (event.path is rewritten by the redirect)
  // rawUrl looks like: https://yoursite.netlify.app/api/notion/databases/xxx/query
  let notionPath = '';
  try {
    const url = new URL(event.rawUrl);
    // Strip the /api/notion prefix to get the Notion API sub-path
    notionPath = url.pathname.replace(/^\/api\/notion/, '');
  } catch {
    // Fallback: strip from event.path if rawUrl parsing fails
    notionPath = event.path.replace(/^\/.netlify\/functions\/notion/, '');
  }

  const queryString = event.rawQuery ? `?${event.rawQuery}` : '';
  const targetUrl = `https://api.notion.com/v1${notionPath}${queryString}`;

  try {
    const res = await fetch(targetUrl, {
      method: event.httpMethod,
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: event.body ? event.body : undefined,
    });

    const data = await res.text();
    return {
      statusCode: res.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: data,
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: String(err) }),
    };
  }
};
