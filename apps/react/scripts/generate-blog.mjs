/**
 * generate-blog.mjs
 * Build-time static blog generator.
 *
 * Reads .md files from src/blog/posts/, then:
 *   1. Writes dist/blog/<slug>/index.html  — fully static SEO page per post
 *   2. Writes dist/blog/index.html         — blog listing page
 *   3. Writes dist/blog-manifest.json      — lightweight JSON for React SPA consumption
 *
 * Run after `vite build`: `node scripts/generate-blog.mjs`
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import matter from 'gray-matter'
import { marked } from 'marked'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT       = join(__dirname, '..')
const POSTS_DIR  = join(ROOT, 'src/blog/posts')
const DIST_DIR   = join(ROOT, 'dist')
const PUBLIC_DIR = join(ROOT, 'public')
const BASE_URL   = 'https://elma.ltd'

// ── Configure marked for clean, accessible output ────────────────────────────
marked.setOptions({ gfm: true, breaks: false })

// ── Load & parse all posts ────────────────────────────────────────────────────
const postFiles = readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'))

const posts = postFiles.map(file => {
  const raw        = readFileSync(join(POSTS_DIR, file), 'utf-8')
  const { data, content } = matter(raw)
  const slug       = data.slug || file.replace(/\.md$/, '')
  const contentHtml = marked(content)
  return { ...data, slug, contentHtml }
}).sort((a, b) => new Date(b.date) - new Date(a.date))

// ── Helpers ───────────────────────────────────────────────────────────────────
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
}

function tagBadges(tags = []) {
  return tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')
}

// ── Shared <head> block ───────────────────────────────────────────────────────
function sharedHead({ title, description, canonical, image, schemaBlocks = [] }) {
  const fullImage = image || `${BASE_URL}/images/elma-og-cover.png`
  const schemas   = schemaBlocks.map(s => `<script type="application/ld+json">${JSON.stringify(s, null, 2)}</script>`).join('\n  ')
  return `
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
  <link rel="canonical" href="${esc(canonical)}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${esc(canonical)}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:image" content="${esc(fullImage)}" />
  <meta property="og:site_name" content="ELMA" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@elmaai_official" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="${esc(fullImage)}" />
  <link rel="icon" type="image/png" href="/images/elma-logo.png" />
  <meta name="theme-color" content="#0D0D0D" />
  ${schemas}
`.trim()
}

// ── Shared inline CSS ─────────────────────────────────────────────────────────
const SHARED_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    background: #0a0613;
    color: #e2dff0;
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    font-size: 17px;
    line-height: 1.75;
    min-height: 100vh;
  }
  a { color: #ba92ff; text-decoration: none; }
  a:hover { text-decoration: underline; }

  /* Navbar */
  .nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(10,6,19,0.85);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(186,146,255,0.12);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 2rem; height: 64px;
  }
  .nav-logo { display: flex; align-items: center; gap: 0.5rem; font-weight: 700; font-size: 1.2rem; color: #fff; }
  .nav-logo img { height: 32px; }
  .nav-links { display: flex; gap: 1.5rem; list-style: none; }
  .nav-links a { color: #c8bfdf; font-size: 0.95rem; }
  .nav-links a:hover { color: #ba92ff; text-decoration: none; }
  .nav-cta {
    background: linear-gradient(135deg, #ba92ff, #90e0ef);
    color: #0a0613 !important; font-weight: 700;
    padding: 0.45rem 1.1rem; border-radius: 999px; font-size: 0.9rem;
  }
  .nav-cta:hover { opacity: 0.9; text-decoration: none !important; }
  @media (max-width: 640px) { .nav-links { display: none; } }

  /* Page shell */
  .page-wrap { max-width: 760px; margin: 0 auto; padding: 2.5rem 1.5rem 5rem; }

  /* Breadcrumb */
  .breadcrumb { font-size: 0.85rem; color: #8a7fa8; margin-bottom: 2rem; }
  .breadcrumb a { color: #8a7fa8; }
  .breadcrumb a:hover { color: #ba92ff; }
  .breadcrumb span { margin: 0 0.4rem; }

  /* Article */
  .post-meta { margin-bottom: 2rem; }
  .post-date { font-size: 0.85rem; color: #8a7fa8; margin-bottom: 0.75rem; }
  .tags { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1.25rem; }
  .tag {
    background: rgba(186,146,255,0.12); color: #ba92ff;
    font-size: 0.78rem; padding: 0.2rem 0.65rem; border-radius: 999px;
    border: 1px solid rgba(186,146,255,0.25);
  }
  .reading-time { font-size: 0.85rem; color: #8a7fa8; }

  h1 { font-size: clamp(1.7rem, 4vw, 2.3rem); font-weight: 800; line-height: 1.25; color: #fff; margin-bottom: 1.5rem; }
  h2 { font-size: 1.35rem; font-weight: 700; color: #e0d5f5; margin: 2.5rem 0 0.9rem; border-bottom: 1px solid rgba(186,146,255,0.15); padding-bottom: 0.4rem; }
  h3 { font-size: 1.1rem; font-weight: 600; color: #c8bfdf; margin: 1.75rem 0 0.6rem; }
  p  { margin-bottom: 1.25rem; color: #cdc5e4; }
  ul, ol { margin: 0 0 1.25rem 1.5rem; }
  li { margin-bottom: 0.5rem; color: #cdc5e4; }
  strong { color: #e2dff0; font-weight: 600; }
  em { font-style: italic; }
  hr { border: none; border-top: 1px solid rgba(186,146,255,0.15); margin: 2.5rem 0; }
  blockquote {
    border-left: 3px solid #ba92ff;
    padding: 0.75rem 1.25rem;
    background: rgba(186,146,255,0.07);
    border-radius: 0 8px 8px 0;
    margin: 1.5rem 0;
    font-style: italic;
    color: #c8bfdf;
  }
  table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.9rem; }
  th { background: rgba(186,146,255,0.12); color: #ba92ff; padding: 0.6rem 0.75rem; text-align: left; }
  td { padding: 0.5rem 0.75rem; border-bottom: 1px solid rgba(186,146,255,0.1); color: #cdc5e4; }

  /* CTA banner */
  .cta-banner {
    margin-top: 3.5rem;
    background: linear-gradient(135deg, rgba(186,146,255,0.1), rgba(144,224,239,0.08));
    border: 1px solid rgba(186,146,255,0.25);
    border-radius: 16px;
    padding: 2rem;
    text-align: center;
  }
  .cta-banner h3 { color: #ba92ff; margin: 0 0 0.5rem; border: none; font-size: 1.2rem; }
  .cta-banner p  { color: #b0a8cc; margin-bottom: 1.25rem; font-size: 0.95rem; }
  .cta-btn {
    display: inline-block;
    background: linear-gradient(135deg, #ba92ff, #90e0ef);
    color: #0a0613; font-weight: 700; padding: 0.75rem 2rem;
    border-radius: 999px; font-size: 1rem;
  }
  .cta-btn:hover { opacity: 0.9; text-decoration: none; }

  /* Blog listing */
  .blog-grid { display: grid; gap: 1.5rem; margin-top: 2rem; }
  .post-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(186,146,255,0.12);
    border-radius: 14px; padding: 1.5rem;
    transition: border-color 0.2s;
  }
  .post-card:hover { border-color: rgba(186,146,255,0.4); }
  .post-card h2 { font-size: 1.15rem; margin: 0 0 0.5rem; border: none; padding: 0; }
  .post-card h2 a { color: #e0d5f5; }
  .post-card h2 a:hover { color: #ba92ff; }
  .post-card .excerpt { font-size: 0.9rem; color: #8a7fa8; margin: 0.5rem 0 1rem; }
  .post-card .card-meta { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }
  .post-card .card-date { font-size: 0.8rem; color: #6a608a; }

  /* Footer */
  .site-footer {
    margin-top: 5rem; padding: 2rem;
    border-top: 1px solid rgba(186,146,255,0.1);
    text-align: center; color: #5a5070; font-size: 0.85rem;
  }
  .site-footer a { color: #7a6a9a; }
  .site-footer a:hover { color: #ba92ff; }
`.trim()

// ── Shared Navbar HTML ────────────────────────────────────────────────────────
const NAVBAR_HTML = `
<nav class="nav" aria-label="Main navigation">
  <a href="/" class="nav-logo">
    <img src="/images/elma-logo.png" alt="ELMA logo" width="32" height="32" loading="lazy" />
    ELMA
  </a>
  <ul class="nav-links">
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
    <li><a href="/blog">Blog</a></li>
    <li><a href="/elma-experts">Experts</a></li>
    <li><a href="/contact">Contact</a></li>
    <li><a href="/" class="nav-cta">Download App</a></li>
  </ul>
</nav>
`.trim()

const FOOTER_HTML = `
<footer class="site-footer">
  <p>&copy; ${new Date().getFullYear()} ELMA. All rights reserved. &nbsp;|&nbsp;
    <a href="/privacy">Privacy Policy</a> &nbsp;|&nbsp;
    <a href="/terms">Terms</a> &nbsp;|&nbsp;
    <a href="/contact">Contact</a>
  </p>
</footer>
`.trim()

// ── Generate individual post pages ────────────────────────────────────────────
for (const post of posts) {
  const canonical = `${BASE_URL}/blog/${post.slug}`

  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated || post.date,
    author: { '@type': 'Organization', name: 'ELMA', url: BASE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'ELMA',
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/images/elma-logo.png` }
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    url: canonical,
    image: post.image || `${BASE_URL}/images/elma-og-cover.png`,
    keywords: (post.tags || []).join(', '),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',  item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog',  item: `${BASE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: canonical },
    ]
  }

  const html = `<!doctype html>
<html lang="en">
<head>
  ${sharedHead({ title: post.title, description: post.description, canonical, image: post.image, schemaBlocks: [blogPostingSchema, breadcrumbSchema] })}
  <style>${SHARED_CSS}</style>
</head>
<body>
${NAVBAR_HTML}
<main class="page-wrap">
  <nav class="breadcrumb" aria-label="Breadcrumb">
    <a href="/">Home</a>
    <span aria-hidden="true">›</span>
    <a href="/blog">Blog</a>
    <span aria-hidden="true">›</span>
    <span>${esc(post.title)}</span>
  </nav>

  <article>
    <header class="post-meta">
      <div class="post-date">
        <time datetime="${esc(post.date)}">${formatDate(post.date)}</time>
      </div>
      <div class="tags">${tagBadges(post.tags)}</div>
      ${post.readingTime ? `<p class="reading-time">${post.readingTime} min read</p>` : ''}
    </header>

    <h1>${esc(post.title)}</h1>

    <div class="post-body">
      ${post.contentHtml}
    </div>
  </article>

  <aside class="cta-banner" aria-label="Download ELMA">
    <h3>Try ELMA — Your AI Emotional Companion</h3>
    <p>Voice your thoughts, track your emotional patterns, and get CBT-based support — 24/7, stigma-free.</p>
    <a href="/" class="cta-btn">Download Free on Android &amp; iOS</a>
  </aside>
</main>
${FOOTER_HTML}
</body>
</html>`

  const dir = join(DIST_DIR, 'blog', post.slug)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'index.html'), html.trim())
}

// ── Generate blog listing page ────────────────────────────────────────────────
const listCanonical = `${BASE_URL}/blog`

const blogSchema = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  url: listCanonical,
  name: 'ELMA Blog — Emotional Wellness & Mental Health',
  description: "Practical guides on anxiety, burnout, emotional intelligence, and mental health — from India's AI emotional companion app.",
  publisher: { '@type': 'Organization', name: 'ELMA', url: BASE_URL }
}

const postCards = posts.map(p => `
  <article class="post-card">
    <h2><a href="/blog/${p.slug}">${esc(p.title)}</a></h2>
    <p class="excerpt">${esc(p.description)}</p>
    <div class="card-meta">
      <div class="tags">${tagBadges(p.tags)}</div>
      <span class="card-date"><time datetime="${esc(p.date)}">${formatDate(p.date)}</time></span>
      ${p.readingTime ? `<span class="reading-time">${p.readingTime} min read</span>` : ''}
    </div>
  </article>`).join('\n')

const listHtml = `<!doctype html>
<html lang="en">
<head>
  ${sharedHead({
    title: 'ELMA Blog — Emotional Wellness, Anxiety & Mental Health Guides',
    description: 'Practical, science-backed guides on anxiety, burnout, emotional intelligence, CBT, and mental health — from India\'s AI emotional companion.',
    canonical: listCanonical,
    schemaBlocks: [blogSchema],
  })}
  <style>${SHARED_CSS}</style>
</head>
<body>
${NAVBAR_HTML}
<main class="page-wrap">
  <h1>ELMA Blog</h1>
  <p style="color:#8a7fa8; margin-bottom:0.5rem;">
    Practical guides on emotional wellness, anxiety, burnout, and mental health — written for real life in India.
  </p>

  <section class="blog-grid" aria-label="Blog posts">
    ${postCards}
  </section>
</main>
${FOOTER_HTML}
</body>
</html>`

mkdirSync(join(DIST_DIR, 'blog'), { recursive: true })
writeFileSync(join(DIST_DIR, 'blog', 'index.html'), listHtml.trim())

// ── Write blog manifest for React SPA ────────────────────────────────────────
const manifest = posts.map(({ contentHtml, ...rest }) => ({ ...rest, contentHtml }))
const manifestJson = JSON.stringify(manifest, null, 2)
writeFileSync(join(DIST_DIR, 'blog-manifest.json'), manifestJson)
writeFileSync(join(PUBLIC_DIR, 'blog-manifest.json'), manifestJson)

// ── Update sitemap.xml ────────────────────────────────────────────────────────
const sitemapPath    = join(DIST_DIR, 'sitemap.xml')
let sitemapContent = ''
try { sitemapContent = readFileSync(sitemapPath, 'utf-8') } catch (_) {
  // If no sitemap in dist yet, seed from public
  try { sitemapContent = readFileSync(join(ROOT, 'public/sitemap.xml'), 'utf-8') } catch (_) {}
}

const blogEntries = [
  // Blog index
  `  <url>\n    <loc>${BASE_URL}/blog</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`,
  // Individual posts
  ...posts.map(p =>
    `  <url>\n    <loc>${BASE_URL}/blog/${p.slug}</loc>\n    <lastmod>${p.date}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`
  )
].join('\n')

const updatedSitemap = sitemapContent.includes('/blog')
  ? sitemapContent // already has blog entries — don't duplicate
  : sitemapContent.replace('</urlset>', `\n  <!-- Blog -->\n${blogEntries}\n\n</urlset>`)

writeFileSync(sitemapPath, updatedSitemap)

// ── Keep markdown mirrors in public/content/blog/ in sync ────────────────────
const mirrorDir = join(PUBLIC_DIR, 'content', 'blog')
mkdirSync(mirrorDir, { recursive: true })
for (const file of postFiles) {
  const src = join(POSTS_DIR, file)
  writeFileSync(join(mirrorDir, file), readFileSync(src))
}

console.log(`✓ Blog: ${posts.length} posts generated`)
console.log(`  → dist/blog/index.html`)
posts.forEach(p => console.log(`  → dist/blog/${p.slug}/index.html`))
console.log(`  → dist/blog-manifest.json + public/blog-manifest.json`)
console.log(`  → public/content/blog/ markdown mirrors synced`)
console.log(`  → dist/sitemap.xml updated`)
