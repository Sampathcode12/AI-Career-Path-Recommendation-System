import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Must match the URL where the .NET API listens (see Back-End/Properties/launchSettings.json — http profile uses 8000).
  // If you run IIS Express on another port, set VITE_DEV_API_PROXY_TARGET in Front End/.env.development
  const apiProxyTarget = env.VITE_DEV_API_PROXY_TARGET || 'http://localhost:8000'

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
