import { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import HoloCard from '../components/HoloCard.jsx'
import { useLang } from '../contexts/LangContext.jsx'

/* ─── ambient orb ───────────────────────────────────────────── */
function Orb({ style }) {
  return (
    <div aria-hidden="true" style={{
      position: 'absolute', borderRadius: '50%',
      filter: 'blur(90px)', pointerEvents: 'none', ...style,
    }} />
  )
}

/* ─── animated counter ──────────────────────────────────────── */
function NumberCard({ number, label, desc, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <HoloCard style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(145deg, rgba(186,146,255,0.07) 0%, rgba(144,224,239,0.03) 100%)',
        border: '1px solid rgba(186,146,255,0.14)',
        borderRadius: '20px', padding: '2.25rem 2rem',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(186,146,255,0.5), transparent)' }} />
        <div style={{
          fontSize: 'clamp(2.4rem, 4vw, 3rem)', fontWeight: 900, lineHeight: 1,
          background: 'linear-gradient(135deg, #BA92FF, #90E0EF)', WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '0.4rem',
        }}>{number}</div>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', marginBottom: '0.3rem' }}>{label}</div>
        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', lineHeight: 1.6 }}>{desc}</div>
      </HoloCard>
    </motion.div>
  )
}

/* ─── pillar card ───────────────────────────────────────────── */
function PillarCard({ icon, title, desc, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <HoloCard style={{
        background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '20px', padding: '2rem 1.75rem', cursor: 'default',
      }}>
        <div style={{
          width: 50, height: 50, borderRadius: '14px', marginBottom: '1.25rem',
          background: `${color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
        }}>{icon}</div>
        <h3 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.6rem' }}>{title}</h3>
        <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>{desc}</p>
      </HoloCard>
    </motion.div>
  )
}

/* ─── main page ─────────────────────────────────────────────── */
export default function About() {
  const { t } = useLang()

  useEffect(() => {
    document.title = 'About ELMA — AI Emotional Companion Built for Human Connection'
    const meta = document.querySelector('meta[name="description"]')
    if (meta) {
      meta.setAttribute('content', "ELMA is India's first AI-powered emotional companion — combining cutting-edge voice AI, emotion detection, and cognitive behavioural science to make emotional wellness accessible for everyone.")
    }
    return () => { document.title = 'ELMA — Your AI Emotional Companion' }
  }, [])

  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 0.6], [0, -60])

  const pillars = [
    { icon: '🧬', title: t('about_p1_title'), desc: t('about_p1_desc'), color: '#BA92FF' },
    { icon: '🔒', title: t('about_p2_title'), desc: t('about_p2_desc'), color: '#90E0EF' },
    { icon: '🌏', title: t('about_p3_title'), desc: t('about_p3_desc'), color: '#FFBBD8' },
    { icon: '🤝', title: t('about_p4_title'), desc: t('about_p4_desc'), color: '#BA92FF' },
    { icon: '🎮', title: t('about_p5_title'), desc: t('about_p5_desc'), color: '#90E0EF' },
    { icon: '✦',  title: t('about_p6_title'), desc: t('about_p6_desc'), color: '#FFBBD8' },
  ]

  const techStack = [
    { label: t('about_t1_label'), detail: t('about_t1_detail'), icon: '🧠' },
    { label: t('about_t2_label'), detail: t('about_t2_detail'), icon: '⚡' },
    { label: t('about_t3_label'), detail: t('about_t3_detail'), icon: '🎙️' },
    { label: t('about_t4_label'), detail: t('about_t4_detail'), icon: '📈' },
    { label: t('about_t5_label'), detail: t('about_t5_detail'), icon: '🩺' },
    { label: t('about_t6_label'), detail: t('about_t6_detail'), icon: '🔐' },
  ]

  return (
    <main style={{ background: 'transparent', color: '#fff', overflowX: 'hidden' }}>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section ref={heroRef} style={{ position: 'relative', minHeight: '95vh', display: 'flex', alignItems: 'center', overflow: 'hidden', padding: 'clamp(6rem, 10vw, 9rem) 0 clamp(4rem, 7vw, 6rem)' }}>
        <Orb style={{ width: 700, height: 700, top: '-15%', right: '-10%', background: 'radial-gradient(circle, rgba(186,146,255,0.14) 0%, transparent 70%)' }} />
        <Orb style={{ width: 500, height: 500, bottom: '-5%', left: '-8%', background: 'radial-gradient(circle, rgba(144,224,239,0.1) 0%, transparent 70%)' }} />
        <Orb style={{ width: 300, height: 300, top: '40%', left: '35%', background: 'radial-gradient(circle, rgba(255,187,216,0.06) 0%, transparent 70%)' }} />

        {/* Dot grid pattern */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.12,
          backgroundImage: 'radial-gradient(rgba(186,146,255,0.8) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, black 0%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, black 0%, transparent 100%)',
        }} />

        <motion.div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(1.5rem, 5vw, 4rem)', width: '100%', opacity: heroOpacity, y: heroY }}>
          {/* Label */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(144,224,239,0.08)', border: '1px solid rgba(144,224,239,0.2)',
              borderRadius: '999px', padding: '0.45rem 1.1rem', marginBottom: '2.5rem' }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#90E0EF', display: 'inline-block' }} />
            <span style={{ color: '#90E0EF', fontSize: '0.76rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{t('about_hero_label')}</span>
          </motion.div>

          <div style={{ maxWidth: 820 }}>
            <motion.h1
              initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.04em', marginBottom: '2rem', fontFamily: '"Plus Jakarta Sans", sans-serif' }}
            >
              {t('about_hero_h1a')}{' '}
              <span style={{
                background: 'linear-gradient(135deg, #BA92FF 0%, #FFBBD8 50%, #90E0EF 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>ELMA</span>
              {' '}{t('about_hero_h1b')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
              style={{ color: 'rgba(255,255,255,0.58)', fontSize: 'clamp(1rem, 1.8vw, 1.2rem)', lineHeight: 1.8, maxWidth: 640 }}
            >
              {t('about_hero_sub')}
            </motion.p>
          </div>

          {/* Scroll cue */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            style={{ position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}
          >
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{t('about_scroll')}</span>
            <motion.div
              animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
              style={{ width: 1, height: 32, background: 'linear-gradient(to bottom, rgba(186,146,255,0.5), transparent)' }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Origin Story ───────────────────────────────────────── */}
      <section style={{ padding: 'clamp(4rem, 8vw, 7rem) 0', position: 'relative' }}>
        <Orb style={{ width: 450, height: 450, top: '0', right: '0', background: 'radial-gradient(circle, rgba(186,146,255,0.07) 0%, transparent 70%)' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(1.5rem, 5vw, 4rem)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))', gap: '5rem', alignItems: 'center' }}>

            {/* Visual */}
            <motion.div
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}
            >
              <HoloCard style={{
                width: 'min(380px, 90vw)', height: 'min(380px, 90vw)',
                borderRadius: '30px',
                background: 'linear-gradient(145deg, rgba(186,146,255,0.1), rgba(144,224,239,0.05))',
                border: '1px solid rgba(186,146,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(186,146,255,0.3) 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.2 }} />
                <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, padding: '2rem' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🇮🇳</div>
                  <div style={{ color: '#BA92FF', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.01em' }}>{t('about_bharat_title')}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: '0.4rem', lineHeight: 1.6 }}>{t('about_bharat_desc')}</div>
                  <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {[t('about_val1'), t('about_val2'), t('about_val3'), t('about_val4')].map(v => (
                      <span key={v} style={{
                        background: 'rgba(186,146,255,0.1)', border: '1px solid rgba(186,146,255,0.2)',
                        borderRadius: '999px', padding: '0.25rem 0.7rem',
                        fontSize: '0.7rem', color: '#BA92FF', fontWeight: 600,
                      }}>{v}</span>
                    ))}
                  </div>
                </div>
              </HoloCard>
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            >
              <span style={{ color: '#90E0EF', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: '1.25rem' }}>{t('about_origin_label')}</span>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: '1.5rem' }}>
                {t('about_origin_h2')}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[t('about_origin_p1'), t('about_origin_p2'), t('about_origin_p3')].map((para, i) => (
                  <p key={i} style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.97rem', lineHeight: 1.8, margin: 0 }}>{para}</p>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Numbers ────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(4rem, 7vw, 6rem) 0', position: 'relative' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(1.5rem, 5vw, 4rem)' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ textAlign: 'center', marginBottom: '3rem' }}
          >
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, letterSpacing: '-0.025em' }}>{t('about_numbers_h2')}</h2>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1.25rem' }}>
            <NumberCard number="8+"  label={t('about_n1_label')} desc={t('about_n1_desc')} delay={0} />
            <NumberCard number="24/7" label={t('about_n2_label')} desc={t('about_n2_desc')} delay={0.08} />
            <NumberCard number="∞"   label={t('about_n3_label')} desc={t('about_n3_desc')} delay={0.16} />
            <NumberCard number="1M+" label={t('about_n4_label')} desc={t('about_n4_desc')} delay={0.24} />
          </div>
        </div>
      </section>

      {/* ── Pillars / Values ───────────────────────────────────── */}
      <section style={{ padding: 'clamp(4rem, 8vw, 7rem) 0', position: 'relative' }}>
        <Orb style={{ width: 500, height: 500, bottom: '10%', right: '-5%', background: 'radial-gradient(circle, rgba(255,187,216,0.07) 0%, transparent 70%)' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(1.5rem, 5vw, 4rem)' }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ textAlign: 'center', marginBottom: '3.5rem' }}
          >
            <span style={{ color: '#FFBBD8', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: '1rem' }}>{t('about_pillars_label')}</span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
              {t('about_pillars_h2')}
            </h2>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.25rem' }}>
            {pillars.map((p, i) => <PillarCard key={i} {...p} delay={i * 0.07} />)}
          </div>
        </div>
      </section>

      {/* ── Technology ─────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(4rem, 8vw, 7rem) 0', position: 'relative' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(1.5rem, 5vw, 4rem)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))', gap: '5rem', alignItems: 'center' }}>
            <motion.div
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <span style={{ color: '#BA92FF', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: '1.25rem' }}>{t('about_tech_label')}</span>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: '1.5rem' }}>
                {t('about_tech_h2')}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: '1rem', lineHeight: 1.8, marginBottom: '2rem' }}>
                {t('about_tech_desc')}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {techStack.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: '10px', flexShrink: 0,
                      background: 'rgba(186,146,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                    }}>{item.icon}</div>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{item.label}</div>
                      <div style={{ color: 'rgba(255,255,255,0.42)', fontSize: '0.82rem', lineHeight: 1.6 }}>{item.detail}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right — abstract tech visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              <div style={{
                width: 'min(380px, 90vw)', height: 'min(380px, 90vw)',
                position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {/* Concentric rings */}
                {[1, 0.75, 0.5, 0.3].map((scale, i) => (
                  <motion.div
                    key={i}
                    animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                    transition={{ duration: 15 + i * 8, repeat: Infinity, ease: 'linear' }}
                    style={{
                      position: 'absolute',
                      width: `${scale * 100}%`, height: `${scale * 100}%`,
                      borderRadius: '50%',
                      border: `1px ${i === 0 ? 'solid' : 'dashed'} rgba(186,146,255,${0.1 + i * 0.05})`,
                    }}
                  />
                ))}

                {/* Center */}
                <div style={{
                  position: 'relative', zIndex: 2,
                  background: 'linear-gradient(135deg, rgba(186,146,255,0.15), rgba(144,224,239,0.08))',
                  border: '1px solid rgba(186,146,255,0.3)',
                  borderRadius: '24px', padding: '1.5rem 1.75rem', textAlign: 'center',
                  backdropFilter: 'blur(20px)',
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✦</div>
                  <div style={{ color: '#BA92FF', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.01em' }}>{t('about_core')}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', marginTop: '0.3rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{t('about_core_sub')}</div>
                </div>

                {/* Orbit labels */}
                {[
                  { label: 'Voice AI', angle: 0, color: '#BA92FF' },
                  { label: 'LLM', angle: 72, color: '#90E0EF' },
                  { label: 'CBT', angle: 144, color: '#FFBBD8' },
                  { label: 'Profile', angle: 216, color: '#BA92FF' },
                  { label: 'Expert', angle: 288, color: '#90E0EF' },
                ].map((node, i) => {
                  const rad = (node.angle - 90) * (Math.PI / 180)
                  const r = 155
                  const x = 50 + r * Math.cos(rad) * 0.5
                  const y = 50 + r * Math.sin(rad) * 0.5
                  return (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
                      style={{
                        position: 'absolute', left: `${x}%`, top: `${y}%`,
                        transform: 'translate(-50%, -50%)',
                        background: `rgba(${node.color === '#BA92FF' ? '186,146,255' : node.color === '#90E0EF' ? '144,224,239' : '255,187,216'},0.12)`,
                        border: `1px solid ${node.color}33`,
                        borderRadius: '999px', padding: '0.25rem 0.6rem',
                        fontSize: '0.65rem', color: node.color, fontWeight: 700, whiteSpace: 'nowrap',
                      }}
                    >{node.label}</motion.div>
                  )
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Mission statement ──────────────────────────────────── */}
      <section style={{ padding: 'clamp(5rem, 10vw, 8rem) 0', position: 'relative' }}>
        <Orb style={{ width: 600, height: 600, top: '-10%', left: '20%', background: 'radial-gradient(circle, rgba(186,146,255,0.08) 0%, transparent 70%)' }} />
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 clamp(1.5rem, 5vw, 4rem)', textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <div style={{
              display: 'inline-block', fontSize: '2rem', marginBottom: '2rem',
              background: 'linear-gradient(135deg, #BA92FF, #90E0EF)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>✦</div>
            <blockquote style={{
              fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', fontWeight: 700, lineHeight: 1.45,
              letterSpacing: '-0.02em', color: 'rgba(255,255,255,0.92)', margin: '0 0 2rem',
              fontStyle: 'italic',
            }}>
              {t('about_mission_quote')}
            </blockquote>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>{t('about_mission_label')}</p>
          </motion.div>
        </div>
      </section>

      {/* ── The ELMA Difference ────────────────────────────────── */}
      <section className="different-section" id="how-different">
        <div className="container">
          <motion.div className="section-header"
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="section-label">{t('diff_label')}</span>
            <h2>{t('diff_heading1')}<br />{t('diff_heading2')}</h2>
          </motion.div>

          <div className="upgrade-table">
            <div className="upgrade-header">
              <div className="uh-feature" />
              <div className="uh-col uh-old">{t('diff_others')}</div>
              <div className="uh-col uh-new">{t('diff_elma')}</div>
            </div>

            {[
              { feature: t('row1_feature'), icon: '📊', old: t('row1_old'), elma: t('row1_elma') },
              { feature: t('row2_feature'), icon: '🎯', old: t('row2_old'), elma: t('row2_elma') },
              { feature: t('row3_feature'), icon: '💜', old: t('row3_old'), elma: t('row3_elma') },
              { feature: t('row4_feature'), icon: '🔒', old: t('row4_old'), elma: t('row4_elma') },
              { feature: t('row5_feature'), icon: '🩺', old: t('row5_old'), elma: t('row5_elma') },
            ].map((row, i) => (
              <motion.div
                key={row.feature}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.07 * i, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <HoloCard className="upgrade-row" style={{ borderRadius: '12px' }}>
                  <div className="ur-feature">
                    <span className="ur-icon">{row.icon}</span>
                    <span className="ur-label">{row.feature}</span>
                  </div>
                  <div className="ur-old">
                    <span className="ur-x">✕</span>
                    {row.old}
                  </div>
                  <div className="ur-elma">
                    <span className="ur-check">✓</span>
                    {row.elma}
                  </div>
                </HoloCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(4rem, 8vw, 6rem) 0 clamp(6rem, 12vw, 9rem)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 clamp(1.5rem, 5vw, 4rem)', textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
          <HoloCard style={{
              background: 'linear-gradient(145deg, rgba(186,146,255,0.08) 0%, rgba(144,224,239,0.04) 100%)',
              border: '1px solid rgba(186,146,255,0.15)',
              borderRadius: '28px', padding: 'clamp(2.5rem, 6vw, 4rem)',
              position: 'relative', overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(186,146,255,0.5), transparent)' }} />
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '1rem' }}>
              {t('about_cta_h2')}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: '1rem', lineHeight: 1.75, marginBottom: '2rem', maxWidth: 480, margin: '0 auto 2rem' }}>
              {t('about_cta_sub')}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href="https://apps.apple.com/in/app/elma-emotional-companion/id6756991672"
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  background: 'linear-gradient(135deg, #BA92FF, #90E0EF)',
                  color: '#0a0a0a', fontWeight: 700, fontSize: '1rem',
                  padding: '0.85rem 2rem', borderRadius: '12px',
                  textDecoration: 'none', letterSpacing: '0.02em',
                  transition: 'opacity 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.opacity = '0.88'}
                onMouseOut={e => e.currentTarget.style.opacity = '1'}
              >
                {t('about_cta_download')}
              </a>
              <a
                href="/elma-experts"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  border: '1px solid rgba(186,146,255,0.3)',
                  color: 'rgba(255,255,255,0.75)', fontWeight: 600, fontSize: '0.95rem',
                  padding: '0.85rem 1.75rem', borderRadius: '12px',
                  textDecoration: 'none', background: 'transparent',
                  transition: 'border-color 0.2s, color 0.2s',
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(186,146,255,0.6)'; e.currentTarget.style.color = '#fff' }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(186,146,255,0.3)'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)' }}
              >
                {t('about_cta_expert')}
              </a>
            </div>
          </HoloCard>
          </motion.div>
        </div>
      </section>

    </main>
  )
}
