import type { APIRoute } from 'astro';
import {
  getGalleryKV,
  listGalleryEntries,
  getGalleryEntry,
  saveGalleryEntry,
  deleteGalleryEntry,
  type GalleryEntry,
} from '../../../lib/gallery';

/**
 * Gallery CRUD endpoint
 *
 * GET    /api/admin/photos              — List all entries
 * GET    /api/admin/photos?id={id}      — Get single entry
 * POST   /api/admin/photos              — Create or update entry
 * PATCH  /api/admin/photos?id={id}      — Toggle draft/published
 * DELETE /api/admin/photos?id={id}      — Remove entry
 *
 * Auth: Middleware-protected (cookie or Bearer token)
 */

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const kv = getGalleryKV(locals);
    const id = url.searchParams.get('id');

    if (id) {
      const entry = await getGalleryEntry(kv, id);
      if (!entry) return json({ error: 'Entry not found' }, 404);
      return json({ entry });
    }

    const entries = await listGalleryEntries(kv);
    const status = url.searchParams.get('status');
    const filtered = status
      ? entries.filter(e => e.status === status)
      : entries;

    return json({ entries: filtered, count: filtered.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch gallery entries';
    return json({ error: message }, 500);
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const kv = getGalleryKV(locals);
    const body = await request.json() as Partial<GalleryEntry>;

    if (!body.title || !body.serviceType || !body.photos?.length) {
      return json({ error: 'Missing required fields: title, serviceType, photos' }, 400);
    }

    const now = new Date().toISOString();
    const entry: GalleryEntry = {
      id: body.id || crypto.randomUUID(),
      title: body.title,
      description: body.description || '',
      serviceType: body.serviceType,
      location: body.location || '',
      jobDate: body.jobDate || now.split('T')[0],
      photos: body.photos,
      status: body.status || 'draft',
      createdAt: body.createdAt || now,
      updatedAt: now,
    };

    await saveGalleryEntry(kv, entry);
    return json({ success: true, entry });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to save gallery entry';
    return json({ error: message }, 500);
  }
};

export const PATCH: APIRoute = async ({ url, request, locals }) => {
  try {
    const kv = getGalleryKV(locals);
    const id = url.searchParams.get('id');
    if (!id) return json({ error: 'Missing id parameter' }, 400);

    const entry = await getGalleryEntry(kv, id);
    if (!entry) return json({ error: 'Entry not found' }, 404);

    const body = await request.json() as { status?: 'draft' | 'published' };
    if (body.status) {
      entry.status = body.status;
    }
    entry.updatedAt = new Date().toISOString();

    await saveGalleryEntry(kv, entry);
    return json({ success: true, entry });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update gallery entry';
    return json({ error: message }, 500);
  }
};

export const DELETE: APIRoute = async ({ url, locals }) => {
  try {
    const kv = getGalleryKV(locals);
    const id = url.searchParams.get('id');
    if (!id) return json({ error: 'Missing id parameter' }, 400);

    const entry = await getGalleryEntry(kv, id);
    if (!entry) return json({ error: 'Entry not found' }, 404);

    await deleteGalleryEntry(kv, id);
    return json({ success: true, deleted: id });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete gallery entry';
    return json({ error: message }, 500);
  }
};
