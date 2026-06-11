/**
 * Runs before Vite build on Vercel.
 * Native API mode: MONGODB_URI → same-origin /api (serverless handlers).
 * Legacy mode: BACKEND_API_BASE_URL → proxy to .NET on Render/Railway.
 */
import fs from 'node:fs';
import path from 'node:path';

const onVercel = !!(process.env.VERCEL === '1' || process.env.VERCEL_URL);
const mongo = (process.env.MONGODB_URI || process.env.DATABASE_URL || '').trim();
const backend = (
  process.env.BACKEND_API_BASE_URL ||
  process.env.VITE_API_BASE_URL ||
  ''
).trim();

const envPath = path.join('Front End', '.env.production.local');

if (onVercel || mongo || backend) {
  fs.writeFileSync(envPath, 'VITE_VERCEL_API_PROXY=1\n', 'utf8');
  if (onVercel) {
    console.log('[prepare-vercel] Vercel build — same-origin /api serverless handlers enabled.');
  }
  if (mongo) {
    console.log('[prepare-vercel] MongoDB configured — full native API.');
  }
  if (backend) {
    const display = backend.replace(/\/api\/?$/i, '').replace(/\/+$/, '');
    console.log(`[prepare-vercel] Legacy proxy fallback → ${display}`);
  }
} else {
  try {
    fs.unlinkSync(envPath);
  } catch {
    /* file may not exist */
  }
  console.warn(
    '[prepare-vercel] Set MONGODB_URI (Vercel-native API) or BACKEND_API_BASE_URL (legacy .NET proxy), then redeploy.',
  );
}
