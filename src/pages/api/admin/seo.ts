import type { APIRoute } from 'astro';
import { fetchSEODashboard } from '../../../lib/gsc';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const days = parseInt(url.searchParams.get('days') ?? '28', 10);

  try {
    const data = await fetchSEODashboard(
      {
        GSC_CLIENT_EMAIL: import.meta.env.GSC_CLIENT_EMAIL,
        GSC_PRIVATE_KEY: import.meta.env.GSC_PRIVATE_KEY,
        GSC_SITE_URL: import.meta.env.GSC_SITE_URL,
      },
      days
    );

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=3600', // Cache 1 hour
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
