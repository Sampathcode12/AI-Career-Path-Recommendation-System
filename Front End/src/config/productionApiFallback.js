/**
 * Use when you cannot set VITE_API_BASE_URL on the host (e.g. Vercel dashboard).
 * Set your public .NET API origin here, then redeploy the front end.
 *
 * Examples (no trailing slash):
 *   https://my-api.azurewebsites.net
 * If the app already lives under /api on that host, you may set the full base instead:
 *   https://my-api.azurewebsites.net/api
 *
 * Leave '' to use Vite env / same-origin /api only.
 * Your API must allow CORS for this site’s origin when using a full https URL.
 */
export const PRODUCTION_API_FALLBACK = ''
