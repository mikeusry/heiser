import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      status: 'ok',
      site: 'heiser',
      timestamp: new Date().toISOString(),
      modules: {
        seo: false,
        brand: false,
        siteReview: true,
      },
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
