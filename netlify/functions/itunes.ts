import type { Handler } from '@netlify/functions';

/**
 * Proxies the iTunes API to avoid CORS issues on Netlify.
 * Usage: /.netlify/functions/itunes?id=1407165118
 */
export const handler: Handler = async (event) => {
  const id = event.queryStringParameters?.id ?? '1407165118';

  try {
    const res = await fetch(`https://itunes.apple.com/lookup?id=${id}`);
    const data = await res.text();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
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
