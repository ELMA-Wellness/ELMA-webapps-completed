import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import HoloCard from '../components/HoloCard.jsx'
import { useLang } from '../contexts/LangContext.jsx'

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'
const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || '81727855-9c6b-4474-abd0-9fb03150fe7f'

/* ─── ambient orb ───────────────────────────────────────────── */
function Orb({ style }) {
  return (
    <div aria-hidden="true" style={{
      position: 'absolute', borderRadius: '50%',
      filter: 'blur(80px)', pointerEvents: 'none', ...style,
    }} />
  )
}

/* ─── revolving orbit visual ───────────────────────────────── */
function OrbitVisual() {
  useEffect(() => {
    const id = 'ee-orbit-css'
    if (document.getElementById(id)) return
    const el = document.createElement('style')
    el.id = id
    el.textContent = `
      @keyframes ee-orbit  { from { transform: rotate(0deg); }   to { transform: rotate(360deg); } }
      @keyframes ee-contra { from { transform: translate(-50%,-50%) rotate(0deg); } to { transform: translate(-50%,-50%) rotate(-360deg); } }
      .ee-arm  { position: absolute; top: 50%; left: 50%; width: 0; height: 0; animation: ee-orbit 22s linear infinite; }
      .ee-pill { position: absolute; top: max(-155px,-38vw); left: 0; animation: ee-contra 22s linear infinite; white-space: nowrap; }
    `
    document.head.appendChild(el)
    return () => { const s = document.getElementById(id); if (s) s.remove() }
  }, [])

  const tags = [
    { label: 'CBT',                color: '#BA92FF' },
    { label: 'Anxiety',            color: '#90E0EF' },
    { label: 'Relationship Issues',color: '#FFBBD8' },
    { label: 'Grief',              color: '#BA92FF' },
    { label: 'Childhood Trauma',   color: '#90E0EF' },
    { label: 'Insomnia',           color: '#FFBBD8' },
    { label: 'Depression',         color: '#BA92FF' },
    { label: 'Burnout',            color: '#90E0EF' },
    { label: 'Many More…',         color: 'rgba(255,255,255,0.45)' },
  ]

  const colorRgb = (c) => {
    if (c === '#BA92FF') return '186,146,255'
    if (c === '#90E0EF') return '144,224,239'
    if (c === '#FFBBD8') return '255,187,216'
    return '255,255,255'
  }

  return (
    <div style={{
      width: 'min(400px, 86vw)', height: 'min(400px, 86vw)',
      position: 'relative', margin: '0 auto', flexShrink: 0,
    }}>
      {/* Outer glow */}
      <div style={{
        position: 'absolute', inset: -20,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(186,146,255,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      {/* Rings */}
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(186,146,255,0.12)' }} />
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', inset: 18, borderRadius: '50%', border: '1px dashed rgba(186,146,255,0.15)' }} />
      <motion.div animate={{ rotate: -360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', inset: 48, borderRadius: '50%', border: '1px dashed rgba(144,224,239,0.1)' }} />

      {/* Revolving pills */}
      {tags.map((tag, i) => (
        <div
          key={i}
          className="ee-arm"
          style={{ animationDelay: `${-(i / tags.length) * 22}s` }}
        >
          <div
            className="ee-pill"
            style={{
              animationDelay: `${-(i / tags.length) * 22}s`,
              background: `rgba(${colorRgb(tag.color)},0.1)`,
              border: `1px solid rgba(${colorRgb(tag.color)},0.28)`,
              borderRadius: '999px',
              padding: '0.26rem 0.65rem',
              fontSize: 'clamp(0.58rem, 1.2vw, 0.68rem)',
              color: tag.color,
              fontWeight: 600,
            }}
          >
            {tag.label}
          </div>
        </div>
      ))}

      {/* Centre */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '0.6rem', zIndex: 2,
      }}>
        <div style={{ fontSize: 'clamp(2.2rem, 6vw, 3rem)' }}>🩺</div>
        <div style={{
          color: '#BA92FF', fontWeight: 700, fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
          letterSpacing: '0.04em', textAlign: 'center', lineHeight: 1.4,
        }}>
          ELMA<br />
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem', fontWeight: 400 }}>Experts Network</span>
        </div>
      </div>
    </div>
  )
}

/* ─── join form ─────────────────────────────────────────────── */
const COUNTRY_CODES = [
  { code: '+91', flag: '🇮🇳', label: 'IN' },
  { code: '+1',  flag: '🇺🇸', label: 'US' },
  { code: '+44', flag: '🇬🇧', label: 'GB' },
  { code: '+61', flag: '🇦🇺', label: 'AU' },
  { code: '+971',flag: '🇦🇪', label: 'AE' },
  { code: '+65', flag: '🇸🇬', label: 'SG' },
  { code: '+60', flag: '🇲🇾', label: 'MY' },
  { code: '+92', flag: '🇵🇰', label: 'PK' },
  { code: '+880',flag: '🇧🇩', label: 'BD' },
  { code: '+94', flag: '🇱🇰', label: 'LK' },
  { code: '+64', flag: '🇳🇿', label: 'NZ' },
  { code: '+49', flag: '🇩🇪', label: 'DE' },
]

function JoinForm() {
  const nameRef = useRef(null)
  const emailRef = useRef(null)
  const phoneRef = useRef(null)
  const licenseRef = useRef(null)
  const specialityRef = useRef(null)
  const [countryCode, setCountryCode] = useState('+91')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const name = nameRef.current?.value.trim() || ''
    const email = emailRef.current?.value.trim() || ''
    const phone = phoneRef.current?.value.trim() || ''
    const license = licenseRef.current?.value.trim() || ''
    const speciality = specialityRef.current?.value.trim() || ''
    if (!name || !email || !license) return
    setSending(true)
    setError('')
    const timestamp = new Date().toISOString()
    const data = {
      access_key: WEB3FORMS_ACCESS_KEY,
      type: 'elma_expert_application',
      name, email,
      phone: phone ? `${countryCode} ${phone}` : '',
      license, speciality, timestamp,
      from_name: 'ELMA Website',
      subject: `New ELMA Expert Application — ${name}`,
      message: `Form: ELMA Expert Application\nName: ${name}\nEmail: ${email}\nPhone: ${countryCode} ${phone}\nLicense: ${license}\nSpeciality: ${speciality}\nSubmitted At: ${timestamp}`,
      reply_to: email,
    }
    try {
      const resp = await fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await resp.json()
      if (!resp.ok || !result.success) throw new Error(`Request failed: ${resp.status}`)
      if (form && typeof form.reset === 'function') form.reset()
      setSuccess(true)
    } catch (err) {
      console.error('Error:', err)
      setError('Submission failed. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '0.9rem 1.1rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(186,146,255,0.2)',
    borderRadius: '12px', color: '#fff', fontSize: '0.95rem',
    outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit', transition: 'border-color 0.2s',
  }
  const focusBorder = e => { e.target.style.borderColor = 'rgba(186,146,255,0.55)' }
  const blurBorder  = e => { e.target.style.borderColor = 'rgba(186,146,255,0.2)' }

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✦</div>
        <h3 style={{ color: '#BA92FF', fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem' }}>Application Received!</h3>
        <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
          Welcome to the ELMA Expert waitlist. We will reach out with onboarding details as we expand.
        </p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <input ref={nameRef} type="text" placeholder="Full Name" required style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
      <input ref={emailRef} type="email" placeholder="Professional Email" required style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />

      {/* Phone with country code */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <select
          value={countryCode}
          onChange={e => setCountryCode(e.target.value)}
          style={{
            ...inputStyle, width: 'auto', flexShrink: 0, padding: '0.9rem 0.75rem',
            cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none',
            background: 'rgba(186,146,255,0.08)',
          }}
        >
          {COUNTRY_CODES.map(c => (
            <option key={c.code + c.label} value={c.code} style={{ background: '#1a0a38', color: '#fff' }}>
              {c.flag} {c.code}
            </option>
          ))}
        </select>
        <input
          ref={phoneRef}
          type="tel"
          placeholder="Phone Number"
          style={{ ...inputStyle, flex: 1 }}
          onFocus={focusBorder}
          onBlur={blurBorder}
        />
      </div>

      <input ref={licenseRef} type="text" placeholder="License / Registration Number" required style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
      <input ref={specialityRef} type="text" placeholder="Speciality (e.g. CBT, Trauma, Anxiety)" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
      <button
        type="submit"
        disabled={sending}
        style={{
          padding: '1rem 2rem',
          background: sending ? 'rgba(186,146,255,0.3)' : 'linear-gradient(135deg, #BA92FF, #90E0EF)',
          border: 'none', borderRadius: '12px', color: '#0a0a0a',
          fontWeight: 700, fontSize: '1rem', cursor: sending ? 'not-allowed' : 'pointer',
          letterSpacing: '0.02em', fontFamily: 'inherit', transition: 'opacity 0.2s',
        }}
      >
        {sending ? 'Submitting…' : 'Apply to Join'}
      </button>
      {error && <p style={{ color: '#ff6b6b', fontSize: '0.85rem', margin: 0 }} aria-live="polite">{error}</p>}
    </form>
  )
}

/* ─── main page ─────────────────────────────────────────────── */
export default function ElmaExperts() {
  const { t } = useLang()

  useEffect(() => {
    document.title = 'ELMA Experts — Join the AI-Powered Emotional Wellness Network'
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', 'ELMA Experts are certified psychologists and counselling therapists who partner with ELMA AI to deliver personalised, data-informed emotional wellness care at scale.')
    return () => { document.title = 'ELMA — Your AI Emotional Companion' }
  }, [])

  const benefits = [
    { icon: '📊', title: 'Emotional Profile Before Every Session', desc: "Clients arrive with a structured Emotional Profile built by ELMA — so you spend less time on intake and more time on meaningful work." },
    { icon: '🌐', title: 'Reach Beyond Your City', desc: "ELMA's platform connects you to users across India and globally, growing your practice without growing your overhead." },
    { icon: '🤝', title: 'Warm AI Handoffs', desc: 'ELMA intelligently identifies when a user needs human support and refers them to you — generating qualified, ready-to-engage clients.' },
    { icon: '📅', title: 'Flexible Scheduling', desc: 'Set your own availability. Work with as many or as few clients as you choose. ELMA fits your practice, not the other way around.' },
    { icon: '🔒', title: 'Ethical, Privacy-First Data', desc: 'All shared data is explicitly consented by users. You see only what they choose to share, and never without permission.' },
    { icon: '🚀', title: 'Early-Access Revenue Share', desc: "As a founding ELMA Expert, you benefit from priority listing, promotional features, and our early-mover revenue model." },
  ]

  const steps = [
    {
      step: '01', color: '#BA92FF',
      title: 'User Downloads ELMA',
      desc: 'Your future client begins their journey with a quick emotional onboarding — sharing their struggles, goals, and preferences to personalise the experience from day one.',
      points: ['Guided first-session setup', 'Private, anonymous by default', 'Available in 8+ languages'],
    },
    {
      step: '02', color: '#90E0EF',
      title: 'Daily Emotional Check-ins Begin',
      desc: "ELMA becomes part of the user's daily routine — mood logs, journaling, voice check-ins, and emotion-aware conversations that build a living picture of their mental state.",
      points: ['Voice & text emotion detection', 'Trigger + pattern logging', 'Guided mindfulness exercises'],
    },
    {
      step: '03', color: '#FFBBD8',
      title: "ELMA Builds Their Emotional Profile",
      desc: "Over weeks, ELMA maps emotional baselines, recurring triggers, and behavioural patterns — creating a structured Emotional Profile no traditional intake can replicate.",
      points: ['CBT-aligned profiling', 'Severity & frequency scoring', 'Longitudinal trend tracking'],
    },
    {
      step: '04', color: '#BA92FF',
      title: 'Professional Support Detected',
      desc: 'When ELMA identifies signals beyond AI scope — persistent distress, crisis markers, or user-initiated requests — it gently recommends connecting with a professional.',
      points: ['Safety-first escalation logic', 'Crisis detection protocols', 'User consent at every step'],
    },
    {
      step: '05', color: '#90E0EF',
      title: 'Smart Match to the Right Expert',
      desc: "ELMA matches the user to the best-fit ELMA Expert based on speciality, language, availability, and the user's Emotional Profile — maximising therapeutic fit.",
      points: ['Speciality-based matching', 'Language & location filters', 'User-controlled preferences'],
    },
    {
      step: '06', color: '#FFBBD8',
      title: 'You Lead With Full Context',
      desc: "Before Session 1, you review the user's Emotional Profile — entering with weeks of behavioural data, identified triggers, and a clear therapeutic starting point.",
      points: ['Pre-session profile review', 'Deeper work from day one', 'Ongoing ELMA support between sessions'],
    },
  ]

  return (
    <main style={{ background: 'transparent', color: '#fff', overflowX: 'hidden' }}>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section style={{ position: 'relative', padding: 'clamp(6rem, 12vw, 10rem) 0 clamp(4rem, 8vw, 6rem)', minHeight: '90vh', display: 'flex', alignItems: 'center' }}>
        <Orb style={{ width: 600, height: 600, top: '-10%', right: '-5%', background: 'radial-gradient(circle, rgba(186,146,255,0.15) 0%, transparent 70%)' }} />
        <Orb style={{ width: 400, height: 400, bottom: '0%', left: '-5%', background: 'radial-gradient(circle, rgba(144,224,239,0.1) 0%, transparent 70%)' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(1.5rem, 5vw, 4rem)', width: '100%' }}>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(186,146,255,0.1)', border: '1px solid rgba(186,146,255,0.25)',
              borderRadius: '999px', padding: '0.45rem 1.1rem', marginBottom: '2rem' }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#BA92FF', display: 'inline-block' }} />
            <span style={{ color: '#BA92FF', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>ELMA Experts Programme</span>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 500px), 1fr))', gap: '4rem', alignItems: 'center' }}>
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', fontWeight: 900, lineHeight: 1.12,
                  letterSpacing: '-0.03em', marginBottom: '1.5rem', fontFamily: '"Plus Jakarta Sans", sans-serif' }}
              >
                {t('experts_heading_pre')}{' '}
                <span style={{ background: 'linear-gradient(135deg, #BA92FF 0%, #90E0EF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {t('experts_heading_grad')}
                </span>{' '}
                {t('experts_heading_post')}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
                style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'clamp(1rem, 1.8vw, 1.15rem)', lineHeight: 1.75, marginBottom: '2.5rem', maxWidth: 520 }}
              >
                ELMA Experts are certified psychologists and counselling therapists who partner with ELMA's AI to deliver personalised, data-informed care — at scale, without compromise.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.34, ease: [0.22, 1, 0.36, 1] }}
                style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}
              >
                <a href="#apply" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #BA92FF, #90E0EF)', color: '#0a0a0a', fontWeight: 700, fontSize: '1rem', padding: '0.85rem 2rem', borderRadius: '12px', textDecoration: 'none', letterSpacing: '0.02em', transition: 'opacity 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.opacity = '0.88'} onMouseOut={e => e.currentTarget.style.opacity = '1'}>
                  Apply Now →
                </a>
                <a href="#how-it-works" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(186,146,255,0.3)', color: 'rgba(255,255,255,0.75)', fontWeight: 600, fontSize: '0.95rem', padding: '0.85rem 1.75rem', borderRadius: '12px', textDecoration: 'none', background: 'transparent', transition: 'border-color 0.2s, color 0.2s' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(186,146,255,0.6)'; e.currentTarget.style.color = '#fff' }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(186,146,255,0.3)'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)' }}>
                  Learn More
                </a>
              </motion.div>
            </div>

            {/* Revolving orbit */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              <OrbitVisual />
            </motion.div>
          </div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '4rem', borderTop: '1px solid rgba(186,146,255,0.1)', paddingTop: '3rem' }}
          >
            {[
              { n: '8+', label: 'Languages Supported' },
              { n: '1:1', label: 'AI-to-Expert Handoff' },
              { n: '24/7', label: 'AI Support Between Sessions' },
              { n: '100%', label: 'Consent-Driven Data Sharing' },
            ].map(({ n, label }, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.55 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                style={{ flex: '1 1 160px' }}
              >
                <HoloCard style={{ background: 'rgba(186,146,255,0.06)', border: '1px solid rgba(186,146,255,0.18)', borderRadius: '16px', padding: '2rem 1.5rem', textAlign: 'center' }}>
                  <div style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, background: 'linear-gradient(135deg, #BA92FF, #90E0EF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1.1 }}>{n}</div>
                  <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem', marginTop: '0.5rem', letterSpacing: '0.03em' }}>{label}</div>
                </HoloCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: 'clamp(4rem, 8vw, 7rem) 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(1.5rem, 5vw, 4rem)' }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <span style={{ color: '#90E0EF', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: '1rem' }}>How ELMA Works With You</span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.2, margin: '0 auto', maxWidth: 600 }}>
              AI does the groundwork.<br />You do the healing.
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '1.25rem' }}>
            {steps.map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.65, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <HoloCard style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '20px',
                  padding: '2rem 1.75rem',
                  height: '100%',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  position: 'relative',
                }}>
                  {/* top accent line */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${item.color}55, transparent)` }} />
                  {/* step number */}
                  <div style={{ fontSize: '2.6rem', fontWeight: 900, lineHeight: 1, marginBottom: '1rem', color: item.color, opacity: 0.18, fontFamily: '"Plus Jakarta Sans", sans-serif' }}>{item.step}</div>
                  <h3 style={{ color: '#fff', fontSize: '1.02rem', fontWeight: 700, marginBottom: '0.65rem', letterSpacing: '-0.01em' }}>{item.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.86rem', lineHeight: 1.72, margin: '0 0 1rem' }}>{item.desc}</p>
                  {/* bullet points */}
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {item.points.map((pt, j) => (
                      <li key={j} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.38)', fontSize: '0.78rem' }}>
                        <span style={{ color: item.color, fontSize: '0.7rem', fontWeight: 700 }}>›</span> {pt}
                      </li>
                    ))}
                  </ul>
                </HoloCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ───────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(4rem, 8vw, 7rem) 0', position: 'relative' }}>
        <Orb style={{ width: 500, height: 500, top: '20%', left: '-8%', background: 'radial-gradient(circle, rgba(186,146,255,0.08) 0%, transparent 70%)' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(1.5rem, 5vw, 4rem)' }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ textAlign: 'center', marginBottom: '3.5rem' }}
          >
            <span style={{ color: '#BA92FF', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: '1rem' }}>Why Join</span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
              What being an ELMA Expert means for your practice
            </h2>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '1.25rem' }}>
            {benefits.map((b, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.65, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <HoloCard style={{
                  background: 'linear-gradient(145deg, rgba(186,146,255,0.07) 0%, rgba(144,224,239,0.04) 100%)',
                  border: '1px solid rgba(186,146,255,0.15)',
                  borderRadius: '20px', padding: '2rem 1.75rem',
                  position: 'relative', overflow: 'hidden', height: '100%', boxSizing: 'border-box',
                }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, rgba(186,146,255,0.5), transparent)' }} />
                  <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'rgba(186,146,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: '1.25rem' }}>{b.icon}</div>
                  <h3 style={{ color: '#fff', fontSize: '1.02rem', fontWeight: 700, marginBottom: '0.6rem', letterSpacing: '-0.01em' }}>{b.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem', lineHeight: 1.65, margin: 0 }}>{b.desc}</p>
                </HoloCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Apply CTA ──────────────────────────────────────────── */}
      <section id="apply" style={{ padding: 'clamp(4rem, 8vw, 7rem) 0 clamp(6rem, 12vw, 9rem)', position: 'relative' }}>
        <Orb style={{ width: 600, height: 600, top: '0%', right: '-10%', background: 'radial-gradient(circle, rgba(144,224,239,0.09) 0%, transparent 70%)' }} />
        <Orb style={{ width: 400, height: 400, bottom: '10%', left: '-5%', background: 'radial-gradient(circle, rgba(186,146,255,0.09) 0%, transparent 70%)' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(1.5rem, 5vw, 4rem)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))', gap: '4rem', alignItems: 'start' }}>
            {/* Left copy */}
            <motion.div
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <span style={{ color: '#BA92FF', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: '1.25rem' }}>Apply to the Programme</span>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: '1.5rem' }}>
                Ready to shape the future of emotional wellness?
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem', lineHeight: 1.75, marginBottom: '2rem' }}>
                We are onboarding a founding cohort of ELMA Experts — licensed psychologists and counselling therapists who share our vision of accessible, AI-augmented mental health support.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {['RCI/licensed practitioners welcome', 'All therapy specialisations considered', 'Remote & in-person options', 'No exclusivity requirement'].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>
                    <span style={{ color: '#90E0EF', fontWeight: 700, fontSize: '1rem' }}>✓</span> {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Right form */}
            <motion.div
              initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.75, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              <HoloCard style={{
                background: 'rgba(186,146,255,0.04)',
                border: '1px solid rgba(186,146,255,0.15)',
                borderRadius: '24px', padding: 'clamp(1.75rem, 4vw, 2.5rem)',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(186,146,255,0.4), transparent)' }} />
                <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.5rem' }}>Apply Now</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
                  Join the founding cohort of ELMA Experts shaping the future of emotional wellness.
                </p>
                <JoinForm />
              </HoloCard>
            </motion.div>
          </div>
        </div>
      </section>

    </main>
  )
}
