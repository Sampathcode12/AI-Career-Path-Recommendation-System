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
  const vercelApiProxy =
    env.VITE_VERCEL_API_PROXY === '1' ||
    process.env.VITE_VERCEL_API_PROXY === '1' ||
    (buildingOnVercel && mode === 'production')

  // Vercel sets VERCEL_URL on every build; VERCEL=1 is not always visible in nested npm scripts on some setups.
  const buildingOnVercel =
    (typeof process.env.VERCEL_URL === 'string' && process.env.VERCEL_URL.trim() !== '') ||
    process.env.VERCEL === '1'

  if (
    mode === 'production' &&
    buildingOnVercel &&
    !buildApiBase &&
    !vercelApiProxy &&
    process.env.VERCEL_SKIP_API_ENV_CHECK !== '1'
  ) {
    console.warn(
      '[vite] Vercel production build: BACKEND_API_BASE_URL / VITE_API_BASE_URL is not set. ' +
        'Add BACKEND_API_BASE_URL in Vercel env vars (Railway/Azure API URL) and redeploy, ' +
        'or set VITE_API_BASE_URL to call the API directly. ' +
        'To silence this warning only: VERCEL_SKIP_API_ENV_CHECK=1.'
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
      __VERCEL_API_PROXY__: JSON.stringify(vercelApiProxy),
      __VERCEL_NATIVE_API__: JSON.stringify(buildingOnVercel && mode === 'production'),
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
