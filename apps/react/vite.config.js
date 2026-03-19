import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import prerender from 'vite-plugin-prerender'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Routes to prerender — crawlers get full static HTML, users get the SPA
const PRERENDER_ROUTES = ['/', '/contact', '/privacy', '/terms', '/cancellation']

export default defineConfig({
  plugins: [
    react(),
    prerender({
      staticDir: path.join(__dirname, 'dist'),
      routes: PRERENDER_ROUTES,
      renderer: new prerender.BrowserRenderer({ headless: true }),
    }),
  ],
})
