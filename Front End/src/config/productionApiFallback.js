/**
 * Easiest way to point the deployed React app at your .NET API without Vercel env vars:
 *
 * 1) Publish your Back-End to a public HTTPS URL (e.g. Azure App Service — free tier is enough).
 * 2) On that API, enable CORS for your Vercel site origin (e.g. https://your-project.vercel.app).
 * 3) Put the API host below (no trailing slash). Routes are expected under /api like locally.
 *
 * Examples:
 *   https://my-api.azurewebsites.net
 * Or if everything is already under /api on that host:
 *   https://my-api.azurewebsites.net/api
 *
 * Leave '' while developing locally with Vite proxy only.
 */
export const PRODUCTION_API_FALLBACK = ''
