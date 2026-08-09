import type { Handler } from '@netlify/functions';

/**
 * Proxies Notion image URLs so they don't expire for the end user.
 * Usage: /.netlify/functions/notion-image?url=<encoded_notion_image_url>
 */
export const handler: Handler = async (event) => {
  const url = event.queryStringParameters?.url;

  if (!url) {
    return { statusCode: 400, body: 'Missing ?url parameter' };
  }

  // Only proxy known Notion/AWS image hosts for security
  let decoded: string;
  try {
    decoded = decodeURIComponent(url);
  } catch {
    return { statusCode: 400, body: 'Invalid URL encoding' };
  }

  const allowed = [
    'prod-files-secure.s3.us-west-2.amazonaws.com',
    'www.notion.so',
    'notion.so',
    's3.us-west-2.amazonaws.com',
    'file.notion.so',
  ];

  let hostname: string;
  try {
    hostname = new URL(decoded).hostname;
  } catch {
    return { statusCode: 400, body: 'Invalid URL' };
  }

  if (!allowed.some((h) => hostname === h || hostname.endsWith('.' + h))) {
    return { statusCode: 403, body: 'Host not allowed' };
  }

  try {
    const res = await fetch(decoded);
    if (!res.ok) {
      return { statusCode: res.status, body: `Upstream error: ${res.status}` };
    }

    const contentType = res.headers.get('content-type') ?? 'image/jpeg';
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // cache 24h in browser
        'Access-Control-Allow-Origin': '*',
      },
      body: base64,
      isBase64Encoded: true,
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: `Proxy error: ${String(err)}`,
    };
  }
};
