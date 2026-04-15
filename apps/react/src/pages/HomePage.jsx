import { useRef, useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import './Home.css'
import { HeroSection } from '../components/HeroSection.jsx'
import { HowElmaWorks } from '../components/HowElmaWorks.jsx'
import { ElmaShowcaseSection } from '../components/ElmaShowcaseSection.jsx'
import HoloCard from '../components/HoloCard.jsx'
import { useLang } from '../contexts/LangContext.jsx'

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'
const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || '81727855-9c6b-4474-abd0-9fb03150fe7f'

function WaitlistModal({ isOpen, onClose }) {
  const emailRef = useRef(null)
  const consentRef = useRef(null)
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const email = emailRef.current?.value.trim() || ''
    const consent = !!consentRef.current?.checked
    if (!email || !consent) return
    setSending(true)
    setError('')
    const timestamp = new Date().toISOString()
    const data = {
      access_key: WEB3FORMS_ACCESS_KEY,
      type: 'waitlist',
      email,
      consent,
      timestamp,
      from_name: 'ELMA Website',
      subject: `New Waitlist Signup — ${email}`,
      message: `Form: ELMA Waitlist\nEmail: ${email}\nConsent: ${consent ? 'Yes' : 'No'}\nSubmitted At: ${timestamp}`,
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

  return (
    <div className={`modal ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Join ELMA's Waitlist</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
        </div>
        <div className="modal-body">
          {!success ? (
            <>
              <p>Be the first to experience emotional wellness reimagined!</p>
              <form className="modal-form" onSubmit={onSubmit}>
                <input type="hidden" name="form_name" value="ELMA Waitlist" />
                <input type="email" name="email" placeholder="Enter your email" required ref={emailRef} />
                <div className="consent-wrapper">
                  <input type="checkbox" id="waitlistConsent" name="consent" ref={consentRef} required />
                  <label htmlFor="waitlistConsent">I agree to receive early-access updates from ELMA.</label>
                </div>
                <button type="submit" className="cta-button primary modal-submit" disabled={sending}>
                  {sending ? 'Joining...' : 'Join Waitlist'}
                </button>
                {error && (<p style={{ color: '#ff6b6b', marginTop: '0.75rem' }} aria-live="polite">{error}</p>)}
              </form>
            </>
          ) : (
            <div className="success-state">
              <span className="heart-confirmation" aria-hidden="true">♥</span>
              <h3>You're in! ELMA is excited to grow with you.</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Country codes for psychologist modal ───────────────────── */
const PM_COUNTRY_CODES = [
  { code: '+1',   flag: '🇺🇸', name: 'US' },
  { code: '+44',  flag: '🇬🇧', name: 'UK' },
  { code: '+91',  flag: '🇮🇳', name: 'IN' },
  { code: '+81',  flag: '🇯🇵', name: 'JP' },
  { code: '+33',  flag: '🇫🇷', name: 'FR' },
  { code: '+49',  flag: '🇩🇪', name: 'DE' },
  { code: '+34',  flag: '🇪🇸', name: 'ES' },
  { code: '+55',  flag: '🇧🇷', name: 'BR' },
  { code: '+86',  flag: '🇨🇳', name: 'CN' },
  { code: '+82',  flag: '🇰🇷', name: 'KR' },
  { code: '+61',  flag: '🇦🇺', name: 'AU' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+65',  flag: '🇸🇬', name: 'SG' },
  { code: '+27',  flag: '🇿🇦', name: 'ZA' },
]

const PM_SPECIALITIES = [
  'Clinical Psychology',
  'Cognitive Behavioral Therapy (CBT)',
  'Counseling Psychology',
  'Child & Adolescent Psychology',
  'Anxiety & Depression',
  'Trauma & PTSD',
  'Relationship Counseling',
  'Grief & Loss',
  'Addiction & Recovery',
  'Mindfulness & Meditation',
  'Psychiatry',
  'Occupational Therapy',
  'Other',
]

/* ─── Input style helper ─────────────────────────────────────── */
const pmInput = {
  width: '100%',
  padding: '0.85rem 1rem',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(186,146,255,0.2)',
  borderRadius: '12px',
  color: '#fff',
  fontSize: '0.93rem',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s',
}
const pmFocus = (e) => { e.target.style.borderColor = 'rgba(186,146,255,0.6)' }
const pmBlur  = (e) => { e.target.style.borderColor = 'rgba(186,146,255,0.2)' }

function PsychologistModal({ isOpen, onClose }) {
  const { t } = useLang()
  const nameRef     = useRef(null)
  const emailRef    = useRef(null)
  const phoneRef    = useRef(null)
  const licenseRef  = useRef(null)
  const consentRef  = useRef(null)
  const [countryCode, setCountryCode] = useState('+91')
  const [speciality, setSpeciality]   = useState('')
  const [sending, setSending]         = useState(false)
  const [success, setSuccess]         = useState(false)
  const [error, setError]             = useState('')

  // Reset state when modal reopens
  useEffect(() => {
    if (isOpen) { setSuccess(false); setError('') }
  }, [isOpen])

  const onSubmit = async (e) => {
    e.preventDefault()
    const form  = e.currentTarget
    const name  = nameRef.current?.value.trim() || ''
    const email = emailRef.current?.value.trim() || ''
    const phone = phoneRef.current?.value.trim() || ''
    const license = licenseRef.current?.value.trim() || ''
    const consent = !!consentRef.current?.checked
    if (!name || !email || !license || !consent) return
    setSending(true)
    setError('')
    const timestamp = new Date().toISOString()
    const data = {
      access_key: WEB3FORMS_ACCESS_KEY,
      to: 'ydk@elma.ltd',
      type: 'expert_application',
      name, email,
      phone: phone ? `${countryCode} ${phone}` : '',
      license, speciality, timestamp,
      from_name: 'ELMA Website',
      subject: `New Expert Application — ${name} → ydk@elma.ltd`,
      message: `Form: ELMA Expert Application\nTo: ydk@elma.ltd\nName: ${name}\nEmail: ${email}\nPhone: ${countryCode} ${phone}\nLicense: ${license}\nSpeciality: ${speciality || 'Not specified'}\nConsent: Yes\nSubmitted At: ${timestamp}`,
      reply_to: 'ydk@elma.ltd',
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
      setSpeciality('')
      setSuccess(true)
    } catch (err) {
      console.error('Error:', err)
      setError(t('modal_error'))
    } finally {
      setSending(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        /* ── Overlay ── */
        <motion.div
          key="psych-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 9000,
            background: 'rgba(0,0,0,0.78)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
            overflowY: 'auto',
          }}
        >
          {/* ── Glowing border wrapper ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 560,
              borderRadius: '26px',
              padding: '2px',
              background: 'linear-gradient(135deg, rgba(186,146,255,0.55) 0%, rgba(144,224,239,0.35) 50%, rgba(255,187,216,0.45) 100%)',
              boxShadow: '0 32px 80px rgba(186,146,255,0.22), 0 8px 32px rgba(0,0,0,0.6)',
              flexShrink: 0,
            }}
          >
            {/* ── Inner modal ── */}
            <div style={{
              borderRadius: '24px',
              background: '#09061a',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Subtle ambient orbs in background */}
              <div aria-hidden="true" style={{ position: 'absolute', width: 260, height: 260, top: -80, right: -60, borderRadius: '50%', background: 'radial-gradient(circle, rgba(186,146,255,0.18) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />
              <div aria-hidden="true" style={{ position: 'absolute', width: 200, height: 200, bottom: -40, left: -40, borderRadius: '50%', background: 'radial-gradient(circle, rgba(144,224,239,0.13) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

              {/* ── FORM PANEL ── */}
              <div style={{
                overflowY: 'auto',
                maxHeight: '90vh',
                padding: 'clamp(28px, 5vw, 44px) clamp(24px, 5vw, 40px)',
                position: 'relative',
              }}>
                {/* Close button */}
                <button
                  onClick={onClose}
                  aria-label="Close"
                  style={{
                    position: 'absolute', top: 16, right: 16,
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
                    fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(186,146,255,0.15)'; e.currentTarget.style.color = '#BA92FF' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
                >
                  ×
                </button>

                {success ? (
                  /* ── Success state ── */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ textAlign: 'center', padding: '3rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
                  >
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 18 }}
                      style={{
                        width: 72, height: 72, borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(186,146,255,0.2), rgba(144,224,239,0.15))',
                        border: '1px solid rgba(186,146,255,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2rem',
                      }}
                    >✦</motion.div>
                    <h3 style={{ color: '#BA92FF', fontSize: '1.4rem', fontWeight: 700 }}>{t('modal_success_title')}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 340 }}>{t('modal_success_msg')}</p>
                  </motion.div>
                ) : (
                  /* ── Form ── */
                  <>
                    <div style={{ marginBottom: '1.75rem', paddingRight: '2rem' }}>
                      <h2 style={{
                        fontSize: 'clamp(1.3rem, 2.5vw, 1.65rem)', fontWeight: 800,
                        background: 'linear-gradient(135deg, #fff 0%, rgba(186,146,255,0.9) 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        marginBottom: '0.4rem', lineHeight: 1.2,
                      }}>{t('modal_title')}</h2>
                      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.87rem', lineHeight: 1.6 }}>{t('modal_sub')}</p>
                    </div>

                    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <input type="hidden" name="form_name" value="ELMA Expert Application" />

                      {/* Name */}
                      <input
                        ref={nameRef} type="text" name="name"
                        placeholder={t('modal_name')} required
                        style={pmInput} onFocus={pmFocus} onBlur={pmBlur}
                      />

                      {/* Email */}
                      <input
                        ref={emailRef} type="email" name="email"
                        placeholder={t('modal_email')} required
                        style={pmInput} onFocus={pmFocus} onBlur={pmBlur}
                      />

                      {/* Phone + country code */}
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <select
                          value={countryCode}
                          onChange={e => setCountryCode(e.target.value)}
                          style={{
                            ...pmInput,
                            width: 'auto',
                            minWidth: 90,
                            flexShrink: 0,
                            cursor: 'pointer',
                          }}
                          onFocus={pmFocus} onBlur={pmBlur}
                        >
                          {PM_COUNTRY_CODES.map(c => (
                            <option key={c.code} value={c.code} style={{ background: '#0d0a28' }}>
                              {c.flag} {c.code}
                            </option>
                          ))}
                        </select>
                        <input
                          ref={phoneRef} type="tel" name="phone"
                          placeholder={t('modal_phone')}
                          style={{ ...pmInput, flex: 1 }}
                          onFocus={pmFocus} onBlur={pmBlur}
                        />
                      </div>

                      {/* License */}
                      <input
                        ref={licenseRef} type="text" name="license"
                        placeholder={t('modal_license')} required
                        style={pmInput} onFocus={pmFocus} onBlur={pmBlur}
                      />

                      {/* Speciality */}
                      <select
                        name="speciality"
                        value={speciality}
                        onChange={e => setSpeciality(e.target.value)}
                        style={{ ...pmInput, cursor: 'pointer', color: speciality ? '#fff' : 'rgba(255,255,255,0.4)' }}
                        onFocus={pmFocus} onBlur={pmBlur}
                      >
                        <option value="" style={{ background: '#0d0a28', color: 'rgba(255,255,255,0.4)' }}>
                          {t('modal_select_speciality')}
                        </option>
                        {PM_SPECIALITIES.map(s => (
                          <option key={s} value={s} style={{ background: '#0d0a28', color: '#fff' }}>{s}</option>
                        ))}
                      </select>

                      {/* Consent */}
                      <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer', marginTop: '4px' }}>
                        <input
                          ref={consentRef} type="checkbox" name="consent" required
                          style={{ marginTop: '3px', accentColor: '#BA92FF', flexShrink: 0 }}
                        />
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', lineHeight: 1.6 }}>
                          {t('modal_consent')}
                        </span>
                      </label>

                      {/* Error */}
                      {error && (
                        <p style={{ color: '#ff6b6b', fontSize: '0.85rem', margin: 0 }} aria-live="polite">{error}</p>
                      )}

                      {/* Submit */}
                      <motion.button
                        type="submit"
                        disabled={sending}
                        whileHover={!sending ? { scale: 1.02 } : {}}
                        whileTap={!sending ? { scale: 0.98 } : {}}
                        style={{
                          marginTop: '4px',
                          padding: '0.95rem',
                          background: sending
                            ? 'rgba(186,146,255,0.3)'
                            : 'linear-gradient(135deg, #BA92FF 0%, #90E0EF 100%)',
                          border: 'none',
                          borderRadius: '14px',
                          color: sending ? 'rgba(255,255,255,0.6)' : '#09061a',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          cursor: sending ? 'not-allowed' : 'pointer',
                          fontFamily: 'inherit',
                          letterSpacing: '0.02em',
                          transition: 'background 0.2s',
                        }}
                      >
                        {sending ? t('modal_submitting') : t('modal_submit')}
                      </motion.button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function HomePage() {
  const { t } = useLang()
  const [waitlistOpen, setWaitlistOpen] = useState(false)
  const [psychOpen, setPsychOpen] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()

  // Mobile carousel state for App Showcase
  const [showcaseIndex, setShowcaseIndex] = useState(0)
  const touchStartXRef = useRef(null)
  const touchDeltaXRef = useRef(0)
  const totalShowcaseSlides = 4

  // Prevent background scroll when any modal is open
  useEffect(() => {
    const anyOpen = waitlistOpen || psychOpen
    if (typeof document !== 'undefined') {
      document.body.style.overflow = anyOpen ? 'hidden' : ''
    }
    return () => { if (typeof document !== 'undefined') document.body.style.overflow = '' }
  }, [waitlistOpen, psychOpen])

  // Open waitlist modal when URL contains ?waitlist=1 or true
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const trigger = params.get('waitlist')
    if (trigger === '1' || trigger === 'true') {
      setWaitlistOpen(true)
    }
  }, [location.search])

  const closeWaitlist = () => {
    setWaitlistOpen(false)
    const params = new URLSearchParams(location.search)
    if (params.has('waitlist')) {
      navigate('/', { replace: true })
    }
  }

  const goToSlide = (idx) => {
    const normalized = ((idx % totalShowcaseSlides) + totalShowcaseSlides) % totalShowcaseSlides
    setShowcaseIndex(normalized)
  }
  const nextSlide = () => goToSlide(showcaseIndex + 1)
  const prevSlide = () => goToSlide(showcaseIndex - 1)

  const onTouchStart = (e) => {
    const touch = e.touches?.[0]
    touchStartXRef.current = touch ? touch.clientX : null
    touchDeltaXRef.current = 0
  }
  const onTouchMove = (e) => {
    if (touchStartXRef.current == null) return
    const touch = e.touches?.[0]
    const curX = touch ? touch.clientX : touchStartXRef.current
    touchDeltaXRef.current = curX - touchStartXRef.current
  }
  const onTouchEnd = () => {
    const threshold = 50 // px
    if (touchDeltaXRef.current > threshold) {
      prevSlide()
    } else if (touchDeltaXRef.current < -threshold) {
      nextSlide()
    }
    touchStartXRef.current = null
    touchDeltaXRef.current = 0
  }
  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') prevSlide()
    if (e.key === 'ArrowRight') nextSlide()
  }

  const android_package_name = 'com.elma.app'
  const ios_app_name = 'elma-emotional-companion'
  const ios_app_id = '6756991672'

  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      {/* Why ELMA Section */}
      {/* <section className="why-elma-section" id="why-elma">
        <div className="container">
          <div className="section-header" data-aos="fade-up">
            <h2>Why ELMA?</h2>
            <div className="floating-words">
              <span className="floating-word" style={{ ['--delay']: '0s' }}>Empathetic</span>
              <span className="floating-word" style={{ ['--delay']: '0.5s' }}>Playful</span>
              <span className="floating-word" style={{ ['--delay']: '1s' }}>Science-backed</span>
            </div>
          </div>
          <p className="why-text" data-aos="fade-up" data-aos-delay="100">Not just pushing emotions away, but equipping you with the mindset and skills to make life easier. ELMA doesn't replace you, she grows with you.</p>
          <div className="highlights-grid">
            <div className="highlight-card" data-aos="zoom-in" data-aos-delay="200">
              <div className="highlight-icon">🎨</div>
              <h3>Playful, stigma-free design</h3>
              <p>Making emotional wellness approachable and fun</p>
            </div>
            <div className="highlight-card" data-aos="zoom-in" data-aos-delay="300">
              <div className="highlight-icon">📚</div>
              <h3>Research-backed</h3>
              <p>Backed by Harvard, Oxford, Stanford research</p>
            </div>
            <div className="highlight-card" data-aos="zoom-in" data-aos-delay="400">
              <div className="highlight-icon">🌍</div>
              <h3>Global Impact</h3>
              <p>Made in Visionary India for the whole world</p>
            </div>
          </div>
          <div className="brand-quote" data-aos="fade-up" data-aos-delay="500">
            <p>"Every mood has a story. ELMA helps you understand yours."</p>
          </div>
        </div>
      </section> */}

      {/* How ELMA Works */}
      <HowElmaWorks />

      {/* ELMA Companion + Therapist Carousel + Join Network */}
      <ElmaShowcaseSection onJoinTherapist={() => setPsychOpen(true)} />




      <section className="download-section" id="final-cta">

        <div className="download-container">
          {/* LEFT CONTENT */}
          <div className="download-left">
            <h2>{t('dl_heading')}</h2>
            <p>
              {t('dl_sub')} <br />
            </p>

            <div className="store-buttons">
              {/* <a href={`https://play.google.com/store/apps/details?id=com.elmadevs.ElMAAPP&hl=en_IN`} target="_blank" rel="noopener noreferrer"></a>
              <img
                src="/images/google-play.png"
                alt="Get it on Google Play"
                className="store-btn"
              />
              <a /> */}

              <a href={`https://play.google.com/store/apps/details?id=com.elmadevs.ElMAAPP&hl=en_IN`} target="_blank" rel="noopener noreferrer">
                <img src="/images/google-play.png" alt="Get it on Google Play" className="store-button" loading="lazy" decoding="async" onError={(e) => e.currentTarget.style.display = 'none'} />
              </a>

























              {/* <img
                src="/images/apple-download-bottom.png"
                alt="Download on the App Store"
                className="store-btn"
              /> */}

              <a href={`https://apps.apple.com/in/app/elma-emotional-companion/id6756991672`} target="_blank" rel="noopener noreferrer">
                <img src="/images/apple-download-bottom.png" alt="Get it on Apple App Store" className="store-btn" loading="lazy" decoding="async" onError={(e) => e.currentTarget.style.display = 'none'} />
              </a>
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="download-right">
            <div className="phone-wrapper">
              <img
                src="/images/phone-mock.jpeg"
                alt="ELMA emotional wellness app interface on Android"
                className="phone-img"
                loading="lazy"
                decoding="async"
              />

              {/* Mobile Image */}
              <picture>
                <source srcSet="/images/phone-mock-mobile.webp" type="image/webp" />
                <img
                  src="/images/phone-mock-mobile.png"
                  alt="ELMA app on mobile — emotional companion interface"
                  className="phone-img mobile-phone"
                  loading="lazy"
                  decoding="async"
                />
              </picture>

            </div>
          </div>
        </div>

      </section>

      {/* Modals */}
      <WaitlistModal isOpen={waitlistOpen} onClose={() => setWaitlistOpen(false)} />
      <PsychologistModal isOpen={psychOpen} onClose={() => setPsychOpen(false)} />
    </>
  )
}

export default HomePage
