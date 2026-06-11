export function sendJson(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

export function readJsonBody(req) {
  if (req.body == null) return null;
  if (typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.trim()) {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }
  return null;
}

export function routeKey(method, subPath) {
  const normalized = String(subPath || '')
    .replace(/^\/+|\/+$/g, '')
    .toLowerCase();
  return `${String(method || 'GET').toUpperCase()} ${normalized}`;
}
