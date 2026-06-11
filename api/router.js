/**
 * Vercel-native API router (MongoDB). Routes are ported one-by-one from .NET.
 *
 * Done:  health/db, auth/signup, auth/login-json, auth/me
 * Next:  profile, assessment, recommendations, jobs, skill-gap, market-trends, intake, ml
 */
import { routeKey } from './lib/http.js';
import { isMongoConfigured } from './lib/mongodb.js';
import { isLegacyProxyConfigured, proxyToLegacy } from './lib/proxy.js';
import { handleHealthDb } from './handlers/health.js';
import {
  handleAuthSignup,
  handleAuthLoginJson,
  handleAuthMe,
} from './handlers/auth.js';

const nativeHandlers = {
  'GET health/db': handleHealthDb,
  'POST auth/signup': handleAuthSignup,
  'POST auth/login-json': handleAuthLoginJson,
  'GET auth/me': handleAuthMe,
};

export async function dispatch(req, res, subPath) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(204).end();
  }

  const key = routeKey(req.method, subPath);
  const handler = nativeHandlers[key];

  if (handler && isMongoConfigured()) {
    return handler(req, res);
  }

  if (isLegacyProxyConfigured()) {
    return proxyToLegacy(req, res, subPath);
  }

  if (handler && !isMongoConfigured()) {
    return res.status(503).json({
      detail:
        'MONGODB_URI is not configured. Add MongoDB Atlas connection string in Vercel Environment Variables to use the native API.',
    });
  }

  return res.status(501).json({
    detail: `Not implemented on Vercel yet: ${key}. Migration in progress.`,
  });
}

export function listNativeRoutes() {
  return Object.keys(nativeHandlers);
}
