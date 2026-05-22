import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// GitHub Pages: VITE_BASE_PATH=/Logintec-cloud/  |  Render y preview local: /
function viteBase() {
  const raw = process.env.VITE_BASE_PATH?.trim()
  if (!raw || raw === '/') return '/'
  const withLeading = raw.startsWith('/') ? raw : `/${raw}`
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`
}

const base = process.env.VITE_BASE_PATH != null && process.env.VITE_BASE_PATH !== ''
  ? viteBase()
  : process.env.GITHUB_PAGES === 'true'
    ? '/Logintec-cloud/'
    : '/'

export default defineConfig({
  plugins: [react()],
  base,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})