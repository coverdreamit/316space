import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 로컬: localhost:8080 / Docker(FE 컨테이너): compose에서 VITE_API_PROXY_TARGET=http://be:8080
const apiProxyTarget =
  process.env.VITE_API_PROXY_TARGET || 'http://localhost:8080'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: apiProxyTarget,
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 3000,
    strictPort: true,
    host: true,
    proxy: {
      '/api': {
        target: apiProxyTarget,
        changeOrigin: true,
      },
    },
  },
})
