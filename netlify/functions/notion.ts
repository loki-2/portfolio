import type { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  // Extract path following /api/notion (e.g. /databases/xxx/query or /pages/xxx)
  const path = event.path.replace(/^\/api\/notion/, '');
  const NOTION_TOKEN = process.env.NOTION_TOKEN;

  if (!NOTION_TOKEN) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'NOTION_TOKEN is not configured in Netlify environment variables.' }),
    };
  }

  // Build target Notion API URL
  const targetUrl = `https://api.notion.com/v1${path}${event.rawQuery ? '?' + event.rawQuery : ''}`;

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
