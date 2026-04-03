import type { APIRoute } from 'astro';
import {
  getKeywordVolume,
  getKeywordSuggestions,
  getKeywordsForSite,
  getSERPOverview,
} from '../../../lib/dataforseo';

const env = () => ({
  DATAFORSEO_LOGIN: import.meta.env.DATAFORSEO_LOGIN,
  DATAFORSEO_PASSWORD: import.meta.env.DATAFORSEO_PASSWORD,
});

/**
 * Unified keyword research endpoint
 *
 * GET /api/admin/keywords?action=site_keywords        — Keywords heisergroup.com ranks for
 * GET /api/admin/keywords?action=suggestions&seed=...  — Keyword suggestions from seed
 * GET /api/admin/keywords?action=volume&keywords=a,b,c — Volume/difficulty for keywords
 * GET /api/admin/keywords?action=serp&keyword=...      — Live SERP for a keyword
 */
export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  try {
    let data: any;

    switch (action) {
      case 'site_keywords': {
        const domain = url.searchParams.get('domain') ?? 'heisergroup.com';
        const limit = parseInt(url.searchParams.get('limit') ?? '50', 10);
        data = await getKeywordsForSite(env(), domain, limit);
        break;
      }

      case 'suggestions': {
        const seed = url.searchParams.get('seed');
        if (!seed) {
          return new Response(
            JSON.stringify({ error: 'seed parameter required' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
        const limit = parseInt(url.searchParams.get('limit') ?? '20', 10);
        data = await getKeywordSuggestions(env(), seed, limit);
        break;
      }

      case 'volume': {
        const keywords = url.searchParams.get('keywords')?.split(',').map(k => k.trim());
        if (!keywords?.length) {
          return new Response(
            JSON.stringify({ error: 'keywords parameter required (comma-separated)' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
        data = await getKeywordVolume(env(), keywords);
        break;
      }

      case 'serp': {
        const keyword = url.searchParams.get('keyword');
        if (!keyword) {
          return new Response(
            JSON.stringify({ error: 'keyword parameter required' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
        data = await getSERPOverview(env(), keyword);
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: 'action required: site_keywords | suggestions | volume | serp' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=604800', // 7 days
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
