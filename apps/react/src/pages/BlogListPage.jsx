import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO.jsx'

const BASE_URL = 'https://elma.ltd'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function BlogListPage() {
  const [posts, setPosts]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/blog-manifest.json')
      .then(r => r.json())
      .then(data => { setPosts(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    url: `${BASE_URL}/blog`,
    name: 'ELMA Blog — Emotional Wellness & Mental Health',
    description: 'Practical guides on anxiety, burnout, emotional intelligence, and mental health.',
    publisher: { '@type': 'Organization', name: 'ELMA', url: BASE_URL }
  }

  return (
    <>
      <SEO
        title="Blog — Emotional Wellness, Anxiety & Mental Health Guides"
        description="Practical, science-backed guides on anxiety, burnout, emotional intelligence, CBT, and mental health — from India's AI emotional companion."
        canonical="/blog"
        schema={blogSchema}
      />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
        <h1 style={{ fontSize: 'clamp(1.8rem,4vw,2.5rem)', fontWeight: 800, color: '#fff', marginBottom: '0.75rem' }}>
          ELMA Blog
        </h1>
        <p style={{ color: '#8a7fa8', marginBottom: '2.5rem', fontSize: '1.05rem' }}>
          Practical guides on emotional wellness, anxiety, burnout, and mental health.
        </p>

        {loading && (
          <div style={{ color: '#6a608a', textAlign: 'center', padding: '3rem 0' }}>Loading posts…</div>
        )}

        {!loading && posts.length === 0 && (
          <div style={{ color: '#6a608a', textAlign: 'center', padding: '3rem 0' }}>No posts yet.</div>
        )}

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {posts.map(post => (
            <article
              key={post.slug}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(186,146,255,0.12)',
                borderRadius: 14,
                padding: '1.5rem',
              }}
            >
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                <Link
                  to={`/blog/${post.slug}`}
                  style={{ color: '#e0d5f5', textDecoration: 'none' }}
                  onMouseEnter={e => (e.target.style.color = '#ba92ff')}
                  onMouseLeave={e => (e.target.style.color = '#e0d5f5')}
                >
                  {post.title}
                </Link>
              </h2>

              <p style={{ color: '#8a7fa8', fontSize: '0.9rem', margin: '0.4rem 0 0.9rem' }}>
                {post.description}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
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
                <span style={{ color: '#6a608a', fontSize: '0.8rem', marginLeft: 'auto' }}>
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                  {post.readingTime && ` · ${post.readingTime} min read`}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  )
}
