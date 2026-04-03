import type { APIRoute } from 'astro';
import { fetchMothershipStatus } from '../../../lib/mothership';

export const GET: APIRoute = async () => {
  try {
    const data = await fetchMothershipStatus();

    return new Response(JSON.stringify({
      brand: data.brand,
      site: data.site,
      cdp: data.cdp,
      connected: !!data.brand,
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(
      JSON.stringify({ connected: false, error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
