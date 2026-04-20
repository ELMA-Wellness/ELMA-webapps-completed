import { Helmet } from 'react-helmet-async'

const BASE_URL = 'https://elma.ltd'
const DEFAULT_IMAGE = `${BASE_URL}/images/elma-og-cover.png`
const SITE_NAME = 'ELMA'

/**
 * Drop-in SEO component for every page.
 * Overrides the index.html defaults with page-specific values.
 */
export default function SEO({
  title,
  description,
  canonical,
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

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter */}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Per-page JSON-LD (in addition to the base schema in index.html) */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  )
}
