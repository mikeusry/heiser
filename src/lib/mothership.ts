/**
 * Mothership (point.dog Supabase) connection
 *
 * Shared database for brand config, personas, knowledge base, and SEO data.
 * All queries are scoped by brand_id.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { adminConfig } from '../admin.config';

let _client: SupabaseClient | null = null;

export function getMothershipClient(): SupabaseClient {
  if (_client) return _client;

  const url = import.meta.env.POINTDOG_SUPABASE_URL;
  const key = import.meta.env.POINTDOG_SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    throw new Error('Missing POINTDOG_SUPABASE_URL or POINTDOG_SUPABASE_SERVICE_KEY');
  }

  _client = createClient(url, key);
  return _client;
}

export const BRAND_ID = adminConfig.brandId;
export const BRAND_SLUG = adminConfig.siteSlug;

/** Brand record from Supabase */
export interface Brand {
  id: string;
  name: string;
  slug: string;
  ownership_type: 'internal' | 'client';
  status: string;
}

/** Site record from Supabase */
export interface Site {
  id: string;
  domain: string;
  name: string;
  platform: string;
  status: string;
  brand_id: string;
  ga4_property_id: string | null;
  gsc_property: string | null;
}

/** CDP connection record */
export interface CDPConnection {
  id: string;
  brand_id: string;
  gcp_project_id: string;
  dataset_name: string;
  is_active: boolean;
  last_sync_at: string | null;
  sync_frequency_hours: number;
}

/** Fetch brand + site + CDP status for admin dashboard */
export async function fetchMothershipStatus() {
  const supabase = getMothershipClient();

  const [brandResult, siteResult, cdpResult] = await Promise.all([
    supabase
      .from('brands')
      .select('id, name, slug, ownership_type, status')
      .eq('id', BRAND_ID)
      .single(),
    supabase
      .from('sites')
      .select('id, domain, name, platform, status, ga4_property_id, gsc_property')
      .eq('brand_id', BRAND_ID)
      .single(),
    supabase
      .from('brand_cdp_connections')
      .select('id, gcp_project_id, dataset_name, is_active, last_sync_at, sync_frequency_hours')
      .eq('brand_id', BRAND_ID)
      .eq('is_active', true)
      .maybeSingle(),
  ]);

  return {
    brand: brandResult.data as Brand | null,
    site: siteResult.data as Site | null,
    cdp: cdpResult.data as CDPConnection | null,
    errors: [brandResult.error, siteResult.error, cdpResult.error].filter(Boolean),
  };
}
