import { defineMiddleware } from 'astro:middleware';

/**
 * Admin auth middleware
 *
 * Protects /admin/* and /api/admin/* routes with cookie-based auth.
 * Login via /admin/login with ADMIN_PASSWORD env var.
 * Cookie: heiser_admin_token (HttpOnly, SameSite=Lax)
 */
export const onRequest = defineMiddleware(async ({ request, url, cookies, redirect }, next) => {
  const isAdmin = url.pathname.startsWith('/admin');
  const isAdminAPI = url.pathname.startsWith('/api/admin');

  if (!isAdmin && !isAdminAPI) {
    return next();
  }

  // Allow login page through
  if (url.pathname === '/admin/login') {
    return next();
  }

  const adminPassword = import.meta.env.ADMIN_PASSWORD;

  // If no password is set, allow access (dev mode)
  if (!adminPassword) {
    return next();
  }

  // Check cookie
  const token = cookies.get('heiser_admin_token')?.value;
  if (token === adminPassword) {
    return next();
  }

  // Check Authorization header (for API routes)
  const authHeader = request.headers.get('Authorization');
  if (isAdminAPI && authHeader === `Bearer ${adminPassword}`) {
    return next();
  }

  // Redirect to login for admin pages, 401 for API
  if (isAdminAPI) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return redirect('/admin/login');
});
