import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  const runtime = (locals as any).runtime;
  const gallery = runtime?.env?.GALLERY;
  const kvBound = Boolean(gallery && typeof gallery.get === 'function');

  let kvWriteOk: boolean | null = null;
  if (kvBound) {
    const probeKey = 'gallery:health-probe';
    try {
      await gallery.put(probeKey, new Date().toISOString());
      const readBack = await gallery.get(probeKey);
      kvWriteOk = readBack !== null;
      await gallery.delete(probeKey);
    } catch {
      kvWriteOk = false;
    }
  }

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
      kv: {
        galleryBound: kvBound,
        galleryWriteOk: kvWriteOk,
      },
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
