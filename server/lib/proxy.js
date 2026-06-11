/**
 * Forward unported routes to legacy .NET API when BACKEND_API_BASE_URL is set.
 */
function resolveBackendOrigin() {
  const raw = (
    process.env.BACKEND_API_BASE_URL ||
    process.env.VITE_API_BASE_URL ||
    ''
  ).trim();
  if (!raw) return '';
  return raw.replace(/\/+$/, '').replace(/\/api$/i, '');
}

function buildTargetUrl(base, subPath, req) {
  const path = String(subPath || '').replace(/^\/+/, '');
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  url.searchParams.delete('path');
  const qs = url.searchParams.toString();
  return `${base}/api/${path}${qs ? `?${qs}` : ''}`;
}

function forwardHeaders(req) {
  const headers = {};
  for (const [key, value] of Object.entries(req.headers || {})) {
    const lower = key.toLowerCase();
    if (lower === 'host' || lower === 'connection') continue;
    if (value == null) continue;
    headers[key] = Array.isArray(value) ? value.join(', ') : String(value);
  }
  return headers;
}

function requestBody(req) {
  const method = (req.method || 'GET').toUpperCase();
  if (method === 'GET' || method === 'HEAD') return undefined;
  if (req.body == null) return undefined;
  if (typeof req.body === 'string') return req.body;
  if (Buffer.isBuffer(req.body)) return req.body;
  return JSON.stringify(req.body);
}

export function isLegacyProxyConfigured() {
  return resolveBackendOrigin().length > 0;
}

export async function proxyToLegacy(req, res, subPath) {
  const base = resolveBackendOrigin();
  if (!base) {
    res.status(503).json({
      detail:
        'This API route is not implemented on Vercel yet. Set MONGODB_URI for native API, or BACKEND_API_BASE_URL for legacy .NET proxy.',
    });
    return;
  }

  const target = buildTargetUrl(base, subPath, req);

  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers: forwardHeaders(req),
      body: requestBody(req),
    });

    res.status(upstream.status);
    upstream.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (lower === 'transfer-encoding' || lower === 'content-encoding') return;
      res.setHeader(key, value);
    });

    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.send(buffer);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(502).json({
      detail: `Could not reach legacy backend at ${base}. ${message}`,
    });
  }
}
