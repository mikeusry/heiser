/**
 * Google Search Console API client
 *
 * Uses service account JWT auth to fetch GSC data.
 * Credentials come from environment variables (Cloudflare-compatible).
 */

interface GSCCredentials {
  client_email: string;
  private_key: string;
}

interface GSCRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface GSCResponse {
  rows?: GSCRow[];
  responseAggregationType?: string;
}

export interface QueryData {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface PageData {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GSCMetrics {
  totalClicks: number;
  totalImpressions: number;
  avgCtr: number;
  avgPosition: number;
}

export interface SEODashboardData {
  metrics: GSCMetrics;
  topQueries: QueryData[];
  topPages: PageData[];
  period: { start: string; end: string };
  fetchedAt: string;
}

function base64url(data: Uint8Array | string): string {
  const input = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  let binary = '';
  for (const byte of input) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Sign a message with RSA-SHA256 using the Web Crypto API
 */
async function signRS256(message: string, privateKeyPem: string): Promise<string> {
  // Extract the base64 key data from PEM
  const pemBody = privateKeyPem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');

  const binaryKey = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(message)
  );

  return base64url(new Uint8Array(signature));
}

/**
 * Get an access token using service account JWT
 */
async function getAccessToken(creds: GSCCredentials): Promise<string> {
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);

  const claims = base64url(JSON.stringify({
    iss: creds.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));

  const signature = await signRS256(`${header}.${claims}`, creds.private_key);
  const jwt = `${header}.${claims}.${signature}`;

  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!resp.ok) {
    throw new Error(`Token exchange failed: ${resp.status} ${await resp.text()}`);
  }

  const data = await resp.json() as { access_token: string };
  return data.access_token;
}

/**
 * Query GSC Search Analytics API
 */
async function queryGSC(
  token: string,
  siteUrl: string,
  params: {
    startDate: string;
    endDate: string;
    dimensions: string[];
    rowLimit?: number;
  }
): Promise<GSCRow[]> {
  const encoded = encodeURIComponent(siteUrl);
  const resp = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encoded}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate: params.startDate,
        endDate: params.endDate,
        dimensions: params.dimensions,
        rowLimit: params.rowLimit ?? 25000,
        startRow: 0,
      }),
    }
  );

  if (!resp.ok) {
    throw new Error(`GSC API error: ${resp.status} ${await resp.text()}`);
  }

  const data = await resp.json() as GSCResponse;
  return data.rows ?? [];
}

/**
 * Get credentials from environment
 */
function getCredentials(env: Record<string, string | undefined>): GSCCredentials {
  const email = env.GSC_CLIENT_EMAIL;
  const key = env.GSC_PRIVATE_KEY;

  if (!email || !key) {
    throw new Error('Missing GSC_CLIENT_EMAIL or GSC_PRIVATE_KEY environment variables');
  }

  return {
    client_email: email,
    // Handle escaped newlines from env vars
    private_key: key.replace(/\\n/g, '\n'),
  };
}

/**
 * Fetch full SEO dashboard data from GSC
 */
export async function fetchSEODashboard(
  env: Record<string, string | undefined>,
  days = 28
): Promise<SEODashboardData> {
  const creds = getCredentials(env);
  const siteUrl = env.GSC_SITE_URL ?? 'sc-domain:heisergroup.com';

  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 3); // GSC has 2-3 day lag
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - days);

  const fmt = (d: Date) => d.toISOString().split('T')[0];
  const token = await getAccessToken(creds);

  // Fetch queries and pages in parallel
  const [queryRows, pageRows] = await Promise.all([
    queryGSC(token, siteUrl, {
      startDate: fmt(startDate),
      endDate: fmt(endDate),
      dimensions: ['query'],
      rowLimit: 100,
    }),
    queryGSC(token, siteUrl, {
      startDate: fmt(startDate),
      endDate: fmt(endDate),
      dimensions: ['page'],
      rowLimit: 50,
    }),
  ]);

  // Compute aggregate metrics
  const totalClicks = queryRows.reduce((s, r) => s + r.clicks, 0);
  const totalImpressions = queryRows.reduce((s, r) => s + r.impressions, 0);

  const topQueries: QueryData[] = queryRows
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 25)
    .map(r => ({
      query: r.keys[0],
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: r.ctr,
      position: r.position,
    }));

  const topPages: PageData[] = pageRows
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 20)
    .map(r => ({
      page: r.keys[0],
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: r.ctr,
      position: r.position,
    }));

  return {
    metrics: {
      totalClicks,
      totalImpressions,
      avgCtr: totalImpressions > 0 ? totalClicks / totalImpressions : 0,
      avgPosition:
        queryRows.length > 0
          ? queryRows.reduce((s, r) => s + r.position, 0) / queryRows.length
          : 0,
    },
    topQueries,
    topPages,
    period: { start: fmt(startDate), end: fmt(endDate) },
    fetchedAt: new Date().toISOString(),
  };
}
