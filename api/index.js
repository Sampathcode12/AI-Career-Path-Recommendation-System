import { dispatch } from '../server/router.js';

/**
 * Single Vercel serverless entry (Hobby plan: 1 function).
 * vercel.json rewrites /api/* → /api?path=...
 */
export default async function handler(req, res) {
  let subPath = req.query.path;
  if (Array.isArray(subPath)) subPath = subPath.join('/');
  subPath = String(subPath ?? '').replace(/^\/+|\/+$/g, '');

  if (!subPath && req.url) {
    try {
      const url = new URL(req.url, 'http://localhost');
      const fromQuery = url.searchParams.get('path');
      if (fromQuery) subPath = fromQuery.replace(/^\/+|\/+$/g, '');
    } catch {
      /* ignore */
    }
  }

  return dispatch(req, res, subPath);
}
