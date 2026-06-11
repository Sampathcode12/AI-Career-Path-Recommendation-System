import { verifyBearerToken } from './jwt.js';
import { sendJson } from './http.js';

export function requireUser(req, res) {
  const claims = verifyBearerToken(req.headers.authorization || req.headers.Authorization);
  if (!claims) {
    sendJson(res, 401, { detail: 'Unauthorized.' });
    return null;
  }
  return claims;
}
