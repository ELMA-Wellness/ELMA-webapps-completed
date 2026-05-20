import { Helmet } from 'react-helmet-async'

const BASE_URL = 'https://elma.ltd'
const DEFAULT_IMAGE = `${BASE_URL}/images/elma-og-cover.png`
const SITE_NAME = 'ELMA'
const SUPPORTED_LANGS = ['en', 'hi', 'fr', 'es', 'ja']

export default function SEO({
  title,
  description,
  canonical,
  hreflangBase = null,
  image = DEFAULT_IMAGE,
  type = 'website',
  schema = null,
}) {
  const fullTitle = title ? `${title} | ELMA` : 'ELMA — Your AI Emotional Companion | Be Cool. Be In Control.'
  const fullCanonical = canonical ? `${BASE_URL}${canonical}` : BASE_URL

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullCanonical} />

      {/* hreflang — generated when hreflangBase is provided (path without lang prefix, e.g. '/about') */}
      {hreflangBase !== null && SUPPORTED_LANGS.map(l => (
        <link key={l} rel="alternate" hrefLang={l} href={`${BASE_URL}/${l}${hreflangBase}`} />
      ))}
      {hreflangBase !== null && (
        <link rel="alternate" hrefLang="x-default" href={`${BASE_URL}/en${hreflangBase}`} />
      )}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@elmaai_official" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={fullTitle} />

      {/* Per-page JSON-LD — accepts a single object or an array of schema blocks */}
      {schema && (Array.isArray(schema) ? schema : [schema]).map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  )
}
