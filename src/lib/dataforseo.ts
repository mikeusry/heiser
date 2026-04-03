/**
 * DataforSEO API client
 *
 * Direct API calls with HTTP Basic auth.
 * Mirrors the MCP server's tool set but runs in Cloudflare Workers.
 * Cost: ~$2-5/month with responsible caching.
 */

const API_BASE = 'https://api.dataforseo.com/v3';
const DEFAULT_LOCATION = 2840; // USA
const DEFAULT_LANGUAGE = 'en';

interface DataForSEOCredentials {
  login: string;
  password: string;
}

interface DataForSEOResponse {
  version: string;
  status_code: number;
  status_message: string;
  tasks: Array<{
    id: string;
    status_code: number;
    status_message: string;
    result: any[];
    cost: number;
  }>;
}

// --- Public interfaces ---

export interface KeywordVolume {
  keyword: string;
  search_volume: number;
  cpc: number;
  competition: number;
  keyword_difficulty: number;
  monthly_searches: Array<{ year: number; month: number; search_volume: number }>;
}

export interface KeywordSuggestion {
  keyword: string;
  search_volume: number;
  cpc: number;
  competition: number;
  keyword_difficulty: number;
}

export interface SERPResult {
  position: number;
  title: string;
  url: string;
  description: string;
  domain: string;
}

export interface SERPOverview {
  keyword: string;
  total_results: number;
  items: SERPResult[];
  related_searches: string[];
}

export interface SiteKeyword {
  keyword: string;
  search_volume: number;
  keyword_difficulty: number;
  position: number;
  url: string;
  cpc: number;
  competition: number;
}

// --- Internal helpers ---

function getCredentials(env: Record<string, string | undefined>): DataForSEOCredentials {
  const login = env.DATAFORSEO_LOGIN;
  const password = env.DATAFORSEO_PASSWORD;
  if (!login || !password) {
    throw new Error('Missing DATAFORSEO_LOGIN or DATAFORSEO_PASSWORD');
  }
  return { login, password };
}

function authHeader(creds: DataForSEOCredentials): string {
  return 'Basic ' + btoa(`${creds.login}:${creds.password}`);
}

async function callAPI(
  endpoint: string,
  body: object,
  creds: DataForSEOCredentials
): Promise<DataForSEOResponse> {
  const resp = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: authHeader(creds),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([body]),
  });

  if (!resp.ok) {
    throw new Error(`DataforSEO API error: ${resp.status} ${resp.statusText}`);
  }

  const data = await resp.json() as DataForSEOResponse;

  if (data.status_code !== 20000) {
    throw new Error(`DataforSEO: ${data.status_message}`);
  }

  const task = data.tasks?.[0];
  if (task && task.status_code !== 20000) {
    throw new Error(`DataforSEO task: ${task.status_message}`);
  }

  return data;
}

// --- Public API ---

/**
 * Get keyword volume, CPC, difficulty for a list of keywords
 */
export async function getKeywordVolume(
  env: Record<string, string | undefined>,
  keywords: string[],
  location = DEFAULT_LOCATION
): Promise<KeywordVolume[]> {
  const creds = getCredentials(env);
  const data = await callAPI(
    '/dataforseo_labs/google/bulk_keyword_difficulty/live',
    { keywords, location_code: location, language_code: DEFAULT_LANGUAGE },
    creds
  );

  const items = data.tasks?.[0]?.result ?? [];
  return items.map((item: any) => ({
    keyword: item.keyword,
    search_volume: item.search_volume ?? 0,
    cpc: item.cpc ?? 0,
    competition: item.competition ?? 0,
    keyword_difficulty: item.keyword_difficulty ?? 0,
    monthly_searches: item.monthly_searches ?? [],
  }));
}

/**
 * Get keyword suggestions from a seed keyword
 */
export async function getKeywordSuggestions(
  env: Record<string, string | undefined>,
  seed: string,
  limit = 20,
  location = DEFAULT_LOCATION
): Promise<KeywordSuggestion[]> {
  const creds = getCredentials(env);
  const data = await callAPI(
    '/dataforseo_labs/google/keyword_suggestions/live',
    {
      keyword: seed,
      location_code: location,
      language_code: DEFAULT_LANGUAGE,
      limit,
      include_seed_keyword: true,
      include_serp_info: false,
    },
    creds
  );

  const items = data.tasks?.[0]?.result?.[0]?.items ?? [];
  return items.map((item: any) => ({
    keyword: item.keyword ?? '',
    search_volume: item.keyword_info?.search_volume ?? 0,
    cpc: item.keyword_info?.cpc ?? 0,
    competition: item.keyword_info?.competition ?? 0,
    keyword_difficulty: item.keyword_properties?.keyword_difficulty ?? 0,
  }));
}

/**
 * Get live SERP results for a keyword
 */
export async function getSERPOverview(
  env: Record<string, string | undefined>,
  keyword: string,
  location = DEFAULT_LOCATION
): Promise<SERPOverview> {
  const creds = getCredentials(env);
  const data = await callAPI(
    '/serp/google/organic/live/regular',
    {
      keyword,
      location_code: location,
      language_code: DEFAULT_LANGUAGE,
      device: 'desktop',
      depth: 10,
    },
    creds
  );

  const result = data.tasks?.[0]?.result?.[0] ?? {};
  const organicItems = (result.items ?? []).filter((i: any) => i.type === 'organic');

  return {
    keyword,
    total_results: result.se_results_count ?? 0,
    items: organicItems.map((item: any) => ({
      position: item.rank_absolute ?? 0,
      title: item.title ?? '',
      url: item.url ?? '',
      description: item.description ?? '',
      domain: item.domain ?? '',
    })),
    related_searches: (result.items ?? [])
      .filter((i: any) => i.type === 'related_searches')
      .flatMap((i: any) => (i.items ?? []).map((s: any) => s.title ?? '')),
  };
}

/**
 * Get keywords a domain ranks for
 */
export async function getKeywordsForSite(
  env: Record<string, string | undefined>,
  domain: string,
  limit = 50,
  location = DEFAULT_LOCATION
): Promise<SiteKeyword[]> {
  const creds = getCredentials(env);
  const data = await callAPI(
    '/dataforseo_labs/google/keywords_for_site/live',
    {
      target: domain,
      location_code: location,
      language_code: DEFAULT_LANGUAGE,
      limit,
      include_serp_info: false,
    },
    creds
  );

  const items = data.tasks?.[0]?.result?.[0]?.items ?? [];
  return items.map((item: any) => ({
    keyword: item.keyword ?? '',
    search_volume: item.keyword_info?.search_volume ?? 0,
    keyword_difficulty: item.keyword_properties?.keyword_difficulty ?? 0,
    position: item.serp_info?.serp_item?.rank_absolute ?? 0,
    url: item.serp_info?.serp_item?.relative_url ?? '',
    cpc: item.keyword_info?.cpc ?? 0,
    competition: item.keyword_info?.competition ?? 0,
  }));
}
