/**
 * Static pre-render script — Priority 1 SEO fix.
 *
 * After `vite build`, this script:
 *   1. Starts the built app via `vite preview`
 *   2. Uses puppeteer to visit every public marketing route
 *   3. Saves the fully-rendered HTML into dist/<route>/index.html
 *
 * Result: Google (and other crawlers) receive real HTML instead of an empty
 * <div id="root"></div>, making all content indexable without a CDN/prerender SaaS.
 *
 * Run: node scripts/prerender.mjs
 * Called automatically by the "build" npm script via postbuild hook.
 */

import puppeteer from 'puppeteer'
import { createServer } from 'vite'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs/promises'
import { preview } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DIST = join(ROOT, 'dist')

// All public marketing routes (skip /dashboard, /session — authenticated)
const ROUTES = [
  '/',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/cancellation',
  '/elma-experts',
  '/qr',
]

const PORT = 4173

/**
 * Strip ALL duplicate title/meta/canonical tags from the raw HTML, then
 * inject a single clean set of the live values captured directly from the DOM.
 *
 * This avoids insertion-order ambiguity with react-helmet-async and always
 * produces exactly one of each tag with the correct page-specific value.
 */
function injectMeta(html, title, meta) {
  // 1. Strip every existing <title>, <link rel="canonical">, and all the
  //    meta tags we manage (description, og:*, twitter:*).
  let result = html
    .replace(/<title>[^<]*<\/title>/g, '')
    .replace(/<link\s+rel="canonical"[^>]*>/g, '')
    .replace(/<meta\s+name="description"[^>]*>/g, '')
    .replace(/<meta\s+property="og:[^"]*"[^>]*>/g, '')
    .replace(/<meta\s+name="twitter:[^"]*"[^>]*>/g, '')

  // 2. Build the canonical URL (puppeteer returns absolute href)
  const canonicalHref = meta.canonical || ''

  // 3. Compose the replacement block
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
  const block = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}">`,
    `<link rel="canonical" href="${esc(canonicalHref)}">`,
    `<meta property="og:title" content="${esc(meta.ogTitle || title)}">`,
    `<meta property="og:description" content="${esc(meta.ogDesc || meta.description)}">`,
    `<meta property="og:url" content="${esc(meta.ogUrl || canonicalHref)}">`,
    `<meta name="twitter:title" content="${esc(meta.twTitle || title)}">`,
    `<meta name="twitter:description" content="${esc(meta.twDesc || meta.description)}">`,
  ].join('\n  ')

  // 4. Insert right after <head> (or <head ...>)
  return result.replace(/<head[^>]*>/, (m) => `${m}\n  ${block}`)
}

async function run() {
  // Remove any previously pre-rendered subdirectory index.html files so Vite
  // preview always serves the SPA root (dist/index.html) for every route.
  // Without this, Vite's static file server short-circuits to the old HTML and
  // React never boots, so react-helmet-async never fires.
  for (const route of ROUTES) {
    if (route === '/') continue
    const file = join(DIST, route.slice(1), 'index.html')
    await fs.rm(file, { force: true })
  }

  console.log('[prerender] Starting preview server…')

  const server = await preview({
    root: ROOT,
    preview: { port: PORT, open: false },
  })

  // On Netlify/CI, use the system Chrome if puppeteer's bundled one isn't present
  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH
    || process.env.CHROME_BIN
    || undefined

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--single-process',
    ],
  })

  try {
    for (const route of ROUTES) {
      const url = `http://localhost:${PORT}${route}`
      console.log(`[prerender] Rendering ${route}…`)

      const page = await browser.newPage()
      await page.setUserAgent('googlebot') // Simulate crawler

      // Navigate and wait for React to mount (networkidle0 hangs on Firebase connections)
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })

      // Wait for React to hydrate and animations to settle
      await new Promise(r => setTimeout(r, 3000))

      // Grab the live, fully-resolved meta values directly from the DOM.
      // Use querySelectorAll + .at(-1) because react-helmet-async appends tags;
      // the LAST occurrence is always the page-specific (correct) value.
      const liveTitle = await page.title()
      const liveMeta = await page.evaluate(() => {
        const getLast = (sel) => {
          const els = [...document.querySelectorAll(sel)]
          return els.at(-1)?.getAttribute('content') || ''
        }
        return {
          description: getLast('meta[name="description"]'),
          ogTitle:     getLast('meta[property="og:title"]'),
          ogDesc:      getLast('meta[property="og:description"]'),
          ogUrl:       getLast('meta[property="og:url"]'),
          twTitle:     getLast('meta[name="twitter:title"]'),
          twDesc:      getLast('meta[name="twitter:description"]'),
          canonical:   [...document.querySelectorAll('link[rel="canonical"]')].at(-1)?.href || '',
        }
      })

      const rawHtml = await page.content()
      await page.close()

      // Strip ALL duplicates then re-inject the live values once
      const cleaned = injectMeta(rawHtml, liveTitle, liveMeta)

      // Work out the output path: / → dist/index.html, /about → dist/about/index.html
      const outDir = route === '/' ? DIST : join(DIST, route.slice(1))
      await fs.mkdir(outDir, { recursive: true })
      await fs.writeFile(join(outDir, 'index.html'), cleaned, 'utf8')
      console.log(`[prerender] ✓ ${route}`)
    }
  } finally {
    await browser.close()
    server.httpServer.close()
    console.log('[prerender] Done.')
  }
}

run().catch(err => {
  console.error('[prerender] FAILED:', err)
  process.exit(1)
})
