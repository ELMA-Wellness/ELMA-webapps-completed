import { motion } from 'framer-motion'
import { ElmaGlobe } from './ElmaGlobe.jsx'
import HoloCard from './HoloCard.jsx'
import { useLang } from '../contexts/LangContext.jsx'
import { getAll } from '../firebase/firestore.ts'
import { useEffect, useState } from 'react'

const ease = [0.22, 1, 0.36, 1]

// ── Languages ELMA speaks ─────────────────────────────────────────────────────
const LANGUAGES = [
  { label: 'Hindi',    flag: '🇮🇳' },
  { label: 'English',  flag: '🇬🇧' },
  { label: 'Nepali',   flag: '🇳🇵' },
  { label: 'Japanese', flag: '🇯🇵' },
  { label: 'French',   flag: '🇫🇷' },
  { label: 'Spanish',  flag: '🇪🇸' },
  { label: 'Italian',  flag: '🇮🇹' },
  { label: 'Marathi',  flag: '🇮🇳' },
]

// ── Capabilities (built at render time via t()) ───────────────────────────────
const CAP_ICONS = ['🧠', '📊', '🎙️', '💜']
const CAP_KEYS  = [
  { title: 'cap1_title', body: 'cap1_body' },
  { title: 'cap2_title', body: 'cap2_body' },
  { title: 'cap3_title', body: 'cap3_body' },
  { title: 'cap4_title', body: 'cap4_body' },
]

// ── Therapist data ────────────────────────────────────────────────────────────
const THERAPISTS = [
  { id: 1,  name: 'Dr. Priya Sharma',  spec: 'Anxiety & Stress',        lang: 'Hindi · English',            rating: 4.9, reviews: 124, exp: '8 yrs',  img: 'https://i.pravatar.cc/120?img=47' },
  { id: 2,  name: 'Dr. Rahul Mehta',   spec: 'Depression · CBT',        lang: 'Hindi · English · Marathi',  rating: 4.8, reviews: 98,  exp: '12 yrs', img: 'https://i.pravatar.cc/120?img=12' },
  { id: 3,  name: 'Dr. Aisha Khan',    spec: 'Relationships',            lang: 'Hindi · Urdu · English',     rating: 5.0, reviews: 67,  exp: '6 yrs',  img: 'https://i.pravatar.cc/120?img=44' },
  { id: 4,  name: 'Dr. Arjun Nair',    spec: 'Trauma & PTSD',           lang: 'Malayalam · English',        rating: 4.9, reviews: 145, exp: '15 yrs', img: 'https://i.pravatar.cc/120?img=15' },
  { id: 5,  name: 'Dr. Kavya Reddy',   spec: 'Youth & Adolescents',     lang: 'Telugu · Hindi · English',   rating: 4.7, reviews: 83,  exp: '5 yrs',  img: 'https://i.pravatar.cc/120?img=48' },
  { id: 6,  name: 'Dr. Amit Joshi',    spec: 'Mindfulness & Well-being', lang: 'Hindi · English · Gujarati', rating: 4.8, reviews: 201, exp: '10 yrs', img: 'https://i.pravatar.cc/120?img=33' },
  { id: 7,  name: 'Dr. Sneha Patel',   spec: 'Eating Disorders',        lang: 'Gujarati · Hindi · English', rating: 4.9, reviews: 56,  exp: '7 yrs',  img: 'https://i.pravatar.cc/120?img=49' },
  { id: 8,  name: 'Dr. Rohan Desai',   spec: 'OCD & Phobias',           lang: 'Marathi · Hindi · English',  rating: 4.7, reviews: 112, exp: '9 yrs',  img: 'https://i.pravatar.cc/120?img=18' },
  { id: 9,  name: 'Dr. Meera Iyer',    spec: 'Grief & Loss',            lang: 'Tamil · English · Hindi',    rating: 5.0, reviews: 74,  exp: '11 yrs', img: 'https://i.pravatar.cc/120?img=45' },
  { id: 10, name: 'Dr. Sameer Gupta',  spec: 'Anger Management',        lang: 'Hindi · English',            rating: 4.8, reviews: 160, exp: '13 yrs', img: 'https://i.pravatar.cc/120?img=20' },
]

// ── Network benefits (built at render time via t()) ───────────────────────────
const BEN_ICONS = ['🌐', '📋', '💳', '🔬']
const BEN_KEYS  = [
  { title: 'ben1_title', body: 'ben1_body' },
  { title: 'ben2_title', body: 'ben2_body' },
  { title: 'ben3_title', body: 'ben3_body' },
  { title: 'ben4_title', body: 'ben4_body' },
]

// ── Voice wave bars ───────────────────────────────────────────────────────────
function VoiceWave() {
  const bars = [0.4, 0.7, 1, 0.85, 0.6, 0.95, 0.75, 0.5, 0.88, 0.65, 0.45, 0.9]
  return (
    <div className="voice-wave" aria-hidden="true">
      {bars.map((h, i) => (
        <div
          key={i}
          className="voice-bar"
          style={{ '--bar-h': h, '--bar-delay': `${i * 0.08}s` }}
        />
      ))}
    </div>
  )
}

// ── Single therapist card ─────────────────────────────────────────────────────
function TherapistCard({ therapist, tFn }) {
  return (
    <HoloCard className="therapist-card">
      <div className="tc-avatar-wrap">
        <img src={therapist.img} alt={therapist.name} className="tc-avatar" loading="lazy"
          onError={e => { e.currentTarget.style.display = 'none' }} />
        <span className="tc-verified" title="Verified">✓</span>
      </div>
      <div className="tc-body">
        <p className="tc-name">{therapist.name}</p>
        <p className="tc-spec">{therapist.spec}</p>
        <p className="tc-lang">{therapist.lang}</p>
      </div>
    </HoloCard>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export function ElmaShowcaseSection({ onJoinTherapist }) {
  const { t } = useLang()

  const [therapists, setTherapists] = useState([])

  const loadAllTherapists = async () => {
    try {
      const res = await getAll('therapists')
      const formatted = res?.map((item) => ({
        ...item,
        id: item.id,
        name: item.name,
        spec: item.professtional_title,
        lang: item.languages.join(' · '),
        rating: item?.rating || 5,
        reviews: 0,
        exp: item?.experience,
        img: item?.photo,
      }))
      const filtered = formatted.filter((item) => item.email !== 'rahulbhuse2019@gmail.com')
      setTherapists(filtered)
    } catch (err) {
      // silently fall back to empty list
    }
  }

  useEffect(() => {
    loadAllTherapists()
  }, [])

  const displayTherapists = therapists.length > 0 ? therapists : THERAPISTS

  const capabilities = CAP_KEYS.map((k, i) => ({
    icon: CAP_ICONS[i],
    title: t(k.title),
    body: t(k.body),
  }))

  const benefits = BEN_KEYS.map((k, i) => ({
    icon: BEN_ICONS[i],
    title: t(k.title),
    body: t(k.body),
  }))

  const stats = [
    { v: '50+',  l: t('showcase_stat1') },
    { v: '8+',   l: t('showcase_stat2') },
    { v: '24/7', l: t('showcase_stat3') },
    { v: '100%', l: t('showcase_stat4') },
  ]

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════
          PART 1 — ELMA AS EMOTIONAL COMPANION
          ═══════════════════════════════════════════════════════════ */}
      <section className="elma-companion-section" id="elma-companion">
        <div className="container">

          {/* Header */}
          <motion.div className="section-header"
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, ease }}
          >
            <span className="section-label">{t('showcase_label')}</span>
            <h2>{t('showcase_heading')}<br />{t('showcase_heading2')}</h2>
            <p className="section-sub">{t('showcase_sub')}</p>
          </motion.div>

          {/* Two-column layout */}
          <div className="companion-grid">

            {/* LEFT — Elma visual */}
            <motion.div className="companion-visual"
              initial={{ opacity: 0, x: -32 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.8, ease }}
            >
              <div className="companion-avatar-ring">
                <div className="companion-ring ring-1" />
                <div className="companion-ring ring-2" />
                <div className="companion-ring ring-3" />
                <img
                  src="/images/elma-avatar.webp"
                  alt="ELMA AI Emotional Companion"
                  className="companion-avatar-img"
                  loading="lazy"
                  decoding="async"
                />
                {/* Floating data badges */}
                <div className="data-badge badge-tl">
                  <span className="db-icon">📊</span>
                  <span className="db-text">{t('showcase_badge_ep')}<br /><strong>{t('showcase_badge_ep_sub')}</strong></span>
                </div>
                <div className="data-badge badge-br">
                  <span className="db-icon">🧬</span>
                  <span className="db-text">{t('showcase_badge_papers')}<br /><strong>{t('showcase_badge_papers_sub')}</strong></span>
                </div>
              </div>

              {/* Voice bar */}
              <div className="companion-voice-box">
                <span className="cvb-label">{t('showcase_voice')}</span>
                <VoiceWave />
                <span className="cvb-listening">{t('showcase_listening')}</span>
              </div>

              {/* Language pills */}
              <div className="lang-strip">
                {LANGUAGES.map((l, i) => (
                  <motion.span
                    key={l.label}
                    className="lang-pill"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.04 * i, duration: 0.4, ease }}
                  >
                    {l.flag} {l.label}
                  </motion.span>
                ))}
                <span className="lang-pill lang-pill-more">{t('showcase_more')}</span>
              </div>
            </motion.div>

            {/* RIGHT — Capabilities */}
            <div className="companion-caps">
              {capabilities.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 28 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i, duration: 0.6, ease }}
                >
                  <HoloCard className="cap-item" style={{ height: '100%' }}>
                    <div className="cap-icon">{c.icon}</div>
                    <div className="cap-text">
                      <h4 className="cap-title">{c.title}</h4>
                      <p className="cap-body">{c.body}</p>
                    </div>
                  </HoloCard>
                </motion.div>
              ))}

              {/* Stat row */}
              <motion.div
                className="companion-stat-row"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.45, duration: 0.6, ease }}
              >
                {stats.map(s => (
                  <div key={s.l} className="csr-item">
                    <span className="csr-val gradient-text">{s.v}</span>
                    <span className="csr-lbl">{s.l}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PART 2 — THERAPIST CAROUSEL
          ═══════════════════════════════════════════════════════════ */}
      <section className="therapist-carousel-section" id="therapists">
        <div className="container">
          <motion.div className="section-header"
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, ease }}
          >
            <span className="section-label">{t('therapist_label')}</span>
            <h2>{t('therapist_heading')}</h2>
            <p className="section-sub">{t('showcase_therapist_sub')}</p>
          </motion.div>
        </div>

        {/* Full-bleed scrolling carousel */}
        <div className="tc-scroll-outer">
          <div className="tc-scroll-track">
            {[...displayTherapists, ...displayTherapists].map((therapist, i) => (
              <TherapistCard key={`${therapist.id}-${i}`} therapist={therapist} tFn={t} />
            ))}
          </div>
        </div>

        <div className="container">
          <motion.p className="tc-footnote"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.6 }}
          >
            {t('showcase_therapist_note')}
          </motion.p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PART 3 — GLOBAL WELLNESS NETWORK + GLOBE
          ═══════════════════════════════════════════════════════════ */}
      <section className="join-network-section" id="join-therapists">
        <div className="container">

          {/* Top label */}
          <motion.div
            className="globe-badge"
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
          >
            {t('showcase_globe_badge')}
          </motion.div>

          {/* Split: Globe left · Copy right */}
          <div className="globe-split">

            {/* Globe */}
            <motion.div
              className="globe-col"
              initial={{ opacity: 0, scale: 0.88 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease }}
            >
              <ElmaGlobe size={400} />
            </motion.div>

            {/* Right copy */}
            <div className="globe-copy">
              <motion.h2
                className="globe-headline"
                initial={{ opacity: 0, x: 28 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15, duration: 0.7, ease }}
              >
                {t('showcase_globe_h2a')}<br />
                <span className="gradient-text">{t('showcase_globe_h2b')}</span>
              </motion.h2>

              <motion.p
                className="globe-sub"
                initial={{ opacity: 0, x: 28 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25, duration: 0.7, ease }}
              >
                {t('showcase_globe_sub1')}
              </motion.p>

              <motion.p
                className="globe-sub"
                initial={{ opacity: 0, x: 28 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.32, duration: 0.7, ease }}
              >
                {t('showcase_globe_sub2')}
              </motion.p>

              {/* Country pills */}
              <motion.div
                className="network-countries"
                style={{ justifyContent: 'flex-start', marginBottom: '1.75rem' }}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.38, duration: 0.6, ease }}
              >
                <span className="nc-label">{t('showcase_live_in')}</span>
                {['🇮🇳 India', '🇬🇧 UK', '🇺🇸 USA', '🇨🇦 Canada', '🇦🇺 Australia', '🇦🇪 UAE'].map(c => (
                  <span key={c} className="nc-country">{c}</span>
                ))}
              </motion.div>

              <motion.div
                className="join-cta-wrap"
                style={{ alignItems: 'flex-start' }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.44, duration: 0.65, ease }}
              >
                <button className="join-cta-btn" onClick={onJoinTherapist}>
                  {t('showcase_join_cta')}
                </button>
                <div className="join-cta-reassure">
                  <span>{t('showcase_quick')}</span>
                  <span>{t('showcase_verified')}</span>
                  <span>{t('showcase_earning')}</span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Benefits grid — full width below */}
          <div className="benefits-grid" style={{ marginTop: '4rem' }}>
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 * i, duration: 0.6, ease }}
              >
                <HoloCard className="benefit-card-new" style={{ height: '100%' }}>
                  <div className="bcn-icon">{b.icon}</div>
                  <h4 className="bcn-title">{b.title}</h4>
                  <p className="bcn-body">{b.body}</p>
                </HoloCard>
              </motion.div>
            ))}
          </div>

        </div>
      </section>
    </>
  )
}
