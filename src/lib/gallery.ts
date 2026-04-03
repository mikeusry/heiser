/**
 * Gallery types, KV helpers, and constants for the before/after photo upload system.
 *
 * Storage: Cloudflare KV with per-entry keys
 *   - gallery:index        → string[] (array of entry IDs)
 *   - gallery:entry:{id}   → GalleryEntry (full entry object)
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PhotoAsset {
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export interface GalleryPhoto {
  id: string;
  label: string;
  type: 'pair' | 'single';
  before: PhotoAsset;
  after?: PhotoAsset;
}

export interface GalleryEntry {
  id: string;
  title: string;
  description: string;
  serviceType: string;
  location: string;
  jobDate: string;
  photos: GalleryPhoto[];
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const CLOUDINARY_CLOUD_NAME = 'southland-organics';
export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
export const CLOUDINARY_UPLOAD_PRESET = 'heiser_gallery';

export const SERVICE_TYPES = [
  { value: 'residential', label: 'Residential Cleaning' },
  { value: 'commercial', label: 'Commercial Cleaning' },
  { value: 'realty', label: 'Realty Cleaning' },
  { value: 'specialty', label: 'Specialty Cleaning' },
] as const;

// ---------------------------------------------------------------------------
// KV helpers
// ---------------------------------------------------------------------------

const INDEX_KEY = 'gallery:index';
const entryKey = (id: string) => `gallery:entry:${id}`;

/** In-memory fallback for local dev when KV binding is unavailable */
const memoryStore = new Map<string, string>();

interface KVLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}

const memoryKV: KVLike = {
  async get(key: string) { return memoryStore.get(key) ?? null; },
  async put(key: string, value: string) { memoryStore.set(key, value); },
  async delete(key: string) { memoryStore.delete(key); },
};

/**
 * Extract the GALLERY KV binding from Astro locals.
 * Falls back to an in-memory Map for local dev without Cloudflare bindings.
 */
export function getGalleryKV(locals: App.Locals): KVLike {
  try {
    const runtime = (locals as any).runtime;
    if (runtime?.env?.GALLERY) {
      return runtime.env.GALLERY as KVLike;
    }
  } catch {
    // KV not available
  }
  return memoryKV;
}

/** Read the index (array of entry IDs). */
async function readIndex(kv: KVLike): Promise<string[]> {
  const raw = await kv.get(INDEX_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as string[];
}

/** Write the index. */
async function writeIndex(kv: KVLike, ids: string[]): Promise<void> {
  await kv.put(INDEX_KEY, JSON.stringify(ids));
}

/** List all gallery entries. */
export async function listGalleryEntries(kv: KVLike): Promise<GalleryEntry[]> {
  const ids = await readIndex(kv);
  const entries: GalleryEntry[] = [];

  for (const id of ids) {
    const raw = await kv.get(entryKey(id));
    if (raw) {
      entries.push(JSON.parse(raw) as GalleryEntry);
    }
  }

  return entries;
}

/** Get a single entry by ID. */
export async function getGalleryEntry(kv: KVLike, id: string): Promise<GalleryEntry | null> {
  const raw = await kv.get(entryKey(id));
  if (!raw) return null;
  return JSON.parse(raw) as GalleryEntry;
}

/** Create or update an entry. Adds to index if new. */
export async function saveGalleryEntry(kv: KVLike, entry: GalleryEntry): Promise<void> {
  await kv.put(entryKey(entry.id), JSON.stringify(entry));

  const ids = await readIndex(kv);
  if (!ids.includes(entry.id)) {
    ids.unshift(entry.id); // newest first
    await writeIndex(kv, ids);
  }
}

/** Delete an entry and remove from index. */
export async function deleteGalleryEntry(kv: KVLike, id: string): Promise<void> {
  await kv.delete(entryKey(id));

  const ids = await readIndex(kv);
  const filtered = ids.filter(i => i !== id);
  await writeIndex(kv, filtered);
}

/** Build the Cloudinary folder path for an upload. */
export function buildCloudinaryFolder(serviceType: string, entryId: string, phase: 'before' | 'after'): string {
  return `Heiser/gallery/${serviceType}/${entryId}/${phase}`;
}
