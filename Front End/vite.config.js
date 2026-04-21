import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/** Production API base from env (Vercel injects process.env before `vite build`). */
function resolveBuildApiBaseUrl(envFromFiles) {
  const pick =
    process.env.VITE_API_BASE_URL ||
    process.env.BACKEND_API_BASE_URL ||
    envFromFiles.VITE_API_BASE_URL ||
    envFromFiles.BACKEND_API_BASE_URL ||
    ''
  return String(pick).trim().replace(/\/$/, '')
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const buildApiBase = resolveBuildApiBaseUrl(env)

  // Vercel sets VERCEL_URL on every build; VERCEL=1 is not always visible in nested npm scripts on some setups.
  const buildingOnVercel =
    (typeof process.env.VERCEL_URL === 'string' && process.env.VERCEL_URL.trim() !== '') ||
    process.env.VERCEL === '1'

  if (
    mode === 'production' &&
    buildingOnVercel &&
    !buildApiBase &&
    process.env.VERCEL_SKIP_API_ENV_CHECK !== '1'
  ) {
    throw new Error(
      'Vercel build: set VITE_API_BASE_URL or BACKEND_API_BASE_URL to your live .NET API base (include /api), ' +
        'e.g. https://my-api.azurewebsites.net/api — Vercel → Project → Settings → Environment Variables → Production & Preview, then redeploy. ' +
        'Optional: VERCEL_SKIP_API_ENV_CHECK=1 only if you proxy /api to the API via vercel.json rewrites.'
    )
  }

  // Must match the URL where the .NET API listens (see Back-End/Properties/launchSettings.json — http profile uses 8000).
  // If you run IIS Express on another port, set VITE_DEV_API_PROXY_TARGET in Front End/.env.development
  const apiProxyTarget = env.VITE_DEV_API_PROXY_TARGET || 'http://localhost:8000'
  // Kestrel https profile uses a dev certificate; allow proxying to https://localhost:7189 without cert verification errors.
  const proxyToHttps = /^https:\/\//i.test(apiProxyTarget)

  return {
    define: {
      __BUILD_API_BASE__: JSON.stringify(buildApiBase),
    },
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: proxyToHttps ? false : true,
        },
      },
    },
  }
})
