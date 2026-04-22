import { useEffect, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import SEO from '../components/SEO.jsx'

const BASE_URL = 'https://elma.ltd'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function BlogPostPage() {
  const { slug }             = useParams()
  const [post, setPost]      = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch('/blog-manifest.json')
      .then(r => r.json())
      .then(data => {
        const found = data.find(p => p.slug === slug)
        if (found) setPost(found)
        else setNotFound(true)
        setLoading(false)
      })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [slug])

  if (!loading && notFound) return <Navigate to="/blog" replace />

  if (loading) {
    return (
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '4rem 1.5rem', color: '#6a608a', textAlign: 'center' }}>
        Loading…
      </div>
    )
  }

  if (!post) return null

  const canonical = `/blog/${post.slug}`

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
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE_URL}${canonical}` },
    url: `${BASE_URL}${canonical}`,
    image: post.image || `${BASE_URL}/images/elma-og-cover.png`,
    keywords: (post.tags || []).join(', '),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: `${BASE_URL}${canonical}` },
    ]
  }

  return (
    <>
      <SEO
        title={post.title}
        description={post.description}
        canonical={canonical}
        image={post.image}
        type="article"
        schema={[blogPostingSchema, breadcrumbSchema]}
      />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '2.5rem 1.5rem 5rem' }}>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ fontSize: '0.85rem', color: '#8a7fa8', marginBottom: '2rem' }}>
          <Link to="/" style={{ color: '#8a7fa8' }}>Home</Link>
          <span style={{ margin: '0 0.4rem' }}>›</span>
          <Link to="/blog" style={{ color: '#8a7fa8' }}>Blog</Link>
          <span style={{ margin: '0 0.4rem' }}>›</span>
          <span style={{ color: '#c8bfdf' }}>{post.title}</span>
        </nav>

        <article>
          {/* Post meta */}
          <header style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', color: '#8a7fa8', marginBottom: '0.75rem' }}>
              <time dateTime={post.date}>{formatDate(post.date)}</time>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
              {(post.tags || []).map(tag => (
                <span
                  key={tag}
                  style={{
                    background: 'rgba(186,146,255,0.1)',
                    color: '#ba92ff',
                    fontSize: '0.78rem',
                    padding: '0.2rem 0.65rem',
                    borderRadius: 999,
                    border: '1px solid rgba(186,146,255,0.25)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            {post.readingTime && (
              <p style={{ fontSize: '0.85rem', color: '#8a7fa8' }}>{post.readingTime} min read</p>
            )}
          </header>

          <h1 style={{ fontSize: 'clamp(1.6rem,4vw,2.25rem)', fontWeight: 800, color: '#fff', marginBottom: '2rem', lineHeight: 1.25 }}>
            {post.title}
          </h1>

          {/* Rendered markdown content */}
          <div
            className="post-body"
            style={{ color: '#cdc5e4' }}
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />
        </article>

        {/* CTA */}
        <aside
          style={{
            marginTop: '3.5rem',
            background: 'linear-gradient(135deg, rgba(186,146,255,0.1), rgba(144,224,239,0.08))',
            border: '1px solid rgba(186,146,255,0.25)',
            borderRadius: 16,
            padding: '2rem',
            textAlign: 'center',
          }}
          aria-label="Download ELMA"
        >
          <h3 style={{ color: '#ba92ff', marginBottom: '0.5rem', fontSize: '1.2rem', fontWeight: 700 }}>
            Try ELMA — Your AI Emotional Companion
          </h3>
          <p style={{ color: '#b0a8cc', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
            Voice your thoughts, track your emotional patterns, and get CBT-based support — 24/7, stigma-free.
          </p>
          <Link
            to="/"
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #ba92ff, #90e0ef)',
              color: '#0a0613',
              fontWeight: 700,
              padding: '0.75rem 2rem',
              borderRadius: 999,
              fontSize: '1rem',
              textDecoration: 'none',
            }}
          >
            Download Free on Android &amp; iOS
          </Link>
        </aside>
      </div>

      {/* Post body typography styles */}
      <style>{`
        .post-body h2 {
          font-size: 1.35rem; font-weight: 700; color: #e0d5f5;
          margin: 2.5rem 0 0.9rem;
          border-bottom: 1px solid rgba(186,146,255,0.15);
          padding-bottom: 0.4rem;
        }
        .post-body h3 { font-size: 1.1rem; font-weight: 600; color: #c8bfdf; margin: 1.75rem 0 0.6rem; }
        .post-body p  { margin-bottom: 1.25rem; line-height: 1.75; }
        .post-body ul, .post-body ol { margin: 0 0 1.25rem 1.5rem; }
        .post-body li { margin-bottom: 0.5rem; }
        .post-body strong { color: #e2dff0; font-weight: 600; }
        .post-body a  { color: #ba92ff; }
        .post-body a:hover { text-decoration: underline; }
        .post-body hr { border: none; border-top: 1px solid rgba(186,146,255,0.15); margin: 2.5rem 0; }
        .post-body blockquote {
          border-left: 3px solid #ba92ff;
          padding: 0.75rem 1.25rem;
          background: rgba(186,146,255,0.07);
          border-radius: 0 8px 8px 0;
          margin: 1.5rem 0; font-style: italic;
        }
        .post-body table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.9rem; overflow-x: auto; display: block; }
        .post-body th { background: rgba(186,146,255,0.12); color: #ba92ff; padding: 0.6rem 0.75rem; text-align: left; }
        .post-body td { padding: 0.5rem 0.75rem; border-bottom: 1px solid rgba(186,146,255,0.1); }
      `}</style>
    </>
  )
}
