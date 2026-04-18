import { motion } from 'framer-motion'
import { useLang } from '../contexts/LangContext.jsx'

// ── Animation helpers ────────────────────────────────────────────────────────
const ease = [0.22, 1, 0.36, 1]

const STATS = [
  { value: '4.9★',    label: 'App Store Rating'  },
  { value: '50K+',    label: 'Downloads'          },
  { value: '500+',    label: 'Research Papers'    },
  { value: '98%',     label: 'Evidence-Based'     },
  { value: 'GDPR',    label: 'Compliant'          },
  { value: 'DPDP',    label: '2023 Ready'         },
  { value: 'Harvard', label: 'Research Backed'    },
  { value: 'Oxford',  label: 'Inspired Methods'   },
]

export function HeroSection() {
  const { t } = useLang()
  return (
    <section className="hero-section">

      {/* ── Elma full-bleed backdrop — WebP with PNG fallback ───────── */}
      <picture>
        <source srcSet="/images/elma-hero-section.webp" type="image/webp" />
        <img
          src="/images/elma-hero-section.png"
          alt=""
          className="hero-elma-backdrop"
          aria-hidden="true"
          loading="eager"
          fetchpriority="high"
          decoding="async"
        />
      </picture>

      {/* ── Left-to-right dark gradient overlay (text readability) ───── */}
      <div className="hero-overlay" aria-hidden="true" />

      {/* ── Mesh blobs ─────────────────────────────────────────────── */}
      <div className="blob blob-purple" aria-hidden="true" />
      <div className="blob blob-cyan"   aria-hidden="true" />

      {/* ── Dot-grid ───────────────────────────────────────────────── */}
      <div className="hero-dotgrid" aria-hidden="true" />

      {/* ── Main content ───────────────────────────────────────────── */}
      <div className="hero-container">
        <div className="hero-left">

          {/* Badge */}
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease }}
          >
            <span className="badge-pulse" />
            {t('hero_badge')}
          </motion.div>

          {/* Headline — ALL gradient, each word on its own line */}
          <motion.h1
            className="hero-headline"
            aria-label={`${t('hero_line1')} ${t('hero_line2')} ${t('hero_line3')} ${t('hero_line4')}`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease }}
          >
            <span className="h-line">{t('hero_line1')}</span>
            <span className="h-line grad-text">{t('hero_line2')}</span>
            <span className="h-line grad-text">{t('hero_line3')}</span>
            <span className="h-line grad-text">{t('hero_line4')}</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            className="hero-sub"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.7, ease }}
          >
            {t('hero_sub')}
          </motion.p>

          {/* Store buttons */}
          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.52, duration: 0.65, ease }}
          >
            <motion.a
              href="https://play.google.com/store/apps/details?id=com.elmadevs.ElMAAPP&hl=en_IN"
              target="_blank" rel="noopener noreferrer"
              className="store-pill"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.18 }}
            >
              <img src="/images/google-play.png" alt={t('hero_google_alt')} className="store-badge-img" onError={(e) => { e.currentTarget.style.display = 'none' }} />
            </motion.a>
            <motion.a
              href="https://apps.apple.com/in/app/elma-emotional-companion/id6756991672"
              target="_blank" rel="noopener noreferrer"
              className="store-pill"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.18 }}
            >
              <img src="/images/app-store.png" alt={t('hero_apple_alt')} className="store-badge-img" onError={(e) => { e.currentTarget.style.display = 'none' }} />
            </motion.a>
          </motion.div>

          {/* India badge */}
          <motion.p
            className="hero-india"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65, duration: 0.6, ease }}
          >
            🇮🇳 Made in Visionary India for the World
          </motion.p>
        </div>
      </div>

      {/* ── Stats marquee strip ─────────────────────────────────────── */}
      <div className="stats-strip" aria-hidden="true">
        <div className="stats-track">
          {[...STATS, ...STATS].map((s, i) => (
            <div key={i} className="stat-item">
              <span className="stat-value">{s.value}</span>
              <span className="stat-sep">·</span>
              <span className="stat-label">{s.label}</span>
              <span className="stat-divider" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>

    </section>
  )
}
