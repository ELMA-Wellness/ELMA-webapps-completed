import { useRef, useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './Home.css'

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

function PsychologistModal({ isOpen, onClose }) {
  const nameRef = useRef(null)
  const emailRef = useRef(null)
  const licenseRef = useRef(null)
  const consentRef = useRef(null)
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const name = nameRef.current?.value.trim() || ''
    const email = emailRef.current?.value.trim() || ''
    const license = licenseRef.current?.value.trim() || ''
    const consent = !!consentRef.current?.checked
    if (!name || !email || !license || !consent) return
    setSending(true)
    setError('')
    const timestamp = new Date().toISOString()
    const data = {
      access_key: WEB3FORMS_ACCESS_KEY,
      type: 'psychologist_application',
      name,
      email,
      license,
      consent,
      timestamp,
      from_name: 'ELMA Website',
      subject: `New Psychologist Application — ${name}`,
      message: `Form: ELMA Psychologist Application\nName: ${name}\nEmail: ${email}\nLicense: ${license}\nConsent: ${consent ? 'Yes' : 'No'}\nSubmitted At: ${timestamp}`,
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
          <h2>Join ELMA's Expert Network</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
        </div>
        <div className="modal-body">
          {!success ? (
            <>
              <p>Help us make emotional wellness accessible to millions.</p>
              <form className="modal-form" onSubmit={onSubmit}>
                <input type="hidden" name="form_name" value="ELMA Psychologist Application" />
                <input type="text" name="name" placeholder="Full Name" required ref={nameRef} />
                <input type="email" name="email" placeholder="Professional Email" required ref={emailRef} />
                <input type="text" name="license" placeholder="License Number" required ref={licenseRef} />
                <div className="consent-wrapper">
                  <input type="checkbox" id="psychologistConsent" name="consent" ref={consentRef} required />
                  <label htmlFor="psychologistConsent">I consent to ELMA processing my data.</label>
                </div>
                <button type="submit" className="cta-button primary modal-submit" disabled={sending}>
                  {sending ? 'Submitting...' : 'Submit Application'}
                </button>
                {error && (<p style={{ color: '#ff6b6b', marginTop: '0.75rem' }} aria-live="polite">{error}</p>)}
              </form>
            </>
          ) : (
            <div className="success-state">
              <span className="heart-confirmation" aria-hidden="true">♥</span>
              <h3>Application submitted! ELMA is excited to grow with you.</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function HomePage() {
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

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section" style={{ paddingTop: '6rem' }}>
        <div className="container">
          <div className="hero-content">
            <div className="hero-elma-wide" data-aos="zoom-in">
              <img src="/images/elma-avatar.png" alt="ELMA - Your AI Powered Emotional Companion" loading="eager" onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/800x450/BA92FF/FFFFFF?text=ELMA+Avatar' }} />
            </div>
            <h1 className="hero-headline" data-aos="fade-up" data-aos-delay="200">
               <span className="line">Your AI powered</span>{" "}
               <span className="line">emotional</span>{" "}
               <span className="line">companion.</span>
             </h1>
            <p className="hero-subheadline" data-aos="fade-up" data-aos-delay="300">ELMA helps you understand your moods, reframe your thoughts, and grow stronger every day. Stigma-free, science-backed, and always by your side.</p>
            <div className="hero-cta-buttons" data-aos="fade-up" data-aos-delay="400">
              <button className="cta-button primary large" id="heroUserCTA" onClick={() => setWaitlistOpen(true)}><span>✨</span> Start your journey with ELMA</button>
              <button className="cta-button secondary large" id="heroPsychologistCTA" onClick={() => setPsychOpen(true)}><span>👩‍⚕️</span> Join ELMA's trusted expert network</button>
            </div>
            <p className="made-in-india" data-aos="fade-up" data-aos-delay="500">🇮🇳 Made in Visionary India for the World</p>
          </div>
        </div>
      </section>

      {/* Why ELMA Section */}
      <section className="why-elma-section" id="why-elma">
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
      </section>

      {/* App Showcase Section */}
      <section id="app-showcase" className="elma-showcase-section" aria-label="ELMA App Screens">
        <div className="elma-showcase-container">
          <div className="elma-showcase-header" data-aos="fade-up">
            <h2 className="elma-showcase-title">Experience ELMA in Action</h2>
            <p className="elma-showcase-subtitle">Four powerful screens, one seamless emotional journey</p>
          </div>
          <div className="elma-showcase-stage" data-aos="fade-up" data-aos-delay="200">
            <div
              className="elma-showcase-devices-wrapper"
              role="region"
              aria-label="App screens carousel"
              style={{ ['--slide-index']: showcaseIndex }}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              onKeyDown={onKeyDown}
              tabIndex={0}
            >
              <div className="elma-showcase-device is-hero" data-device="1">
                <div className="elma-showcase-phone">
                  <img src="/images/elma-splash.png" alt="ELMA welcome screen with logo and tagline" className="elma-screen" loading="lazy" />
                  <div className="elma-phone-glow" aria-hidden="true"></div>
                </div>
                <div className="elma-screen-caption">
                  <h3>Welcome to ELMA</h3>
                  <p>Your journey begins here</p>
                </div>
              </div>
              <div className="elma-showcase-device is-left" data-device="2">
                <div className="elma-showcase-phone">
                  <img src="/images/elma-dashboard.png" alt="ELMA dashboard showing mood tracking and streaks" className="elma-screen" loading="lazy" onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/390x844/90E0EF/FFFFFF?text=Dashboard' }} />
                  <div className="elma-phone-glow" aria-hidden="true"></div>
                </div>
                <div className="elma-screen-caption">
                  <h3>Emotional Dashboard</h3>
                  <p>Track moods, streaks & growth</p>
                </div>
              </div>
              <div className="elma-showcase-device is-right" data-device="3">
                <div className="elma-showcase-phone">
                  <div className="elma-phone-frame">
                    <div className="elma-phone-notch" aria-hidden="true"></div>
                    <div className="elma-phone-screen">
                      <img src="/images/elma-journal.png" alt="ELMA private journal with lock icon" className="elma-screen" loading="lazy" onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/390x844/FFBBD8/FFFFFF?text=Journal' }} />
                    </div>
                    <div className="elma-phone-homebar" aria-hidden="true"></div>
                  </div>
                  <div className="elma-phone-glow" aria-hidden="true"></div>
                </div>
                <div className="elma-screen-caption">
                  <h3>Private Journal</h3>
                  <p>Your thoughts—encrypted & safe</p>
                </div>
              </div>
              <div className="elma-showcase-device is-bottom" data-device="4">
                <div className="elma-showcase-phone">
                  <div className="elma-phone-frame">
                    <div className="elma-phone-notch" aria-hidden="true"></div>
                    <div className="elma-phone-screen">
                      <img src="/images/elma-moodflower.png" alt="ELMA mood flower selection wheel" className="elma-screen" loading="lazy" onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/390x844/90E0EF/FFFFFF?text=Mood+Flower' }} />
                    </div>
                    <div className="elma-phone-homebar" aria-hidden="true"></div>
                  </div>
                  <div className="elma-phone-glow" aria-hidden="true"></div>
                </div>
                <div className="elma-screen-caption">
                  <h3>Mood Flower</h3>
                  <p>Name feelings & see patterns</p>
                </div>
              </div>
            </div>
            <div className="elma-showcase-dots" role="tablist" aria-label="Screen navigation">
              <button
                className={`elma-dot ${showcaseIndex === 0 ? 'is-active' : ''}`}
                role="tab"
                aria-selected={showcaseIndex === 0}
                aria-label="Screen 1"
                onClick={() => goToSlide(0)}
              ></button>
              <button
                className={`elma-dot ${showcaseIndex === 1 ? 'is-active' : ''}`}
                role="tab"
                aria-selected={showcaseIndex === 1}
                aria-label="Screen 2"
                onClick={() => goToSlide(1)}
              ></button>
              <button
                className={`elma-dot ${showcaseIndex === 2 ? 'is-active' : ''}`}
                role="tab"
                aria-selected={showcaseIndex === 2}
                aria-label="Screen 3"
                onClick={() => goToSlide(2)}
              ></button>
              <button
                className={`elma-dot ${showcaseIndex === 3 ? 'is-active' : ''}`}
                role="tab"
                aria-selected={showcaseIndex === 3}
                aria-label="Screen 4"
                onClick={() => goToSlide(3)}
              ></button>
            </div>
            <div className="elma-carousel-nav" aria-label="Carousel controls">
              <button className="elma-carousel-button prev" onClick={prevSlide} aria-label="Previous">
                ‹
              </button>
              <button className="elma-carousel-button next" onClick={nextSlide} aria-label="Next">
                ›
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-header" data-aos="fade-up">
            <h2>What You Can Do With ELMA</h2>
            <p>Your growth, your pace, your companion.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card" data-aos="flip-left" data-aos-delay="100">
              <div className="feature-icon">🌸</div>
              <h3>Know your emotions better</h3>
              <p>Feel and name your emotions come alive in color, intensity, and triggers.</p>
            </div>
            <div className="feature-card" data-aos="flip-left" data-aos-delay="200">
              <div className="feature-icon">🎮</div>
              <h3>Playable Emotional Skills</h3>
              <p>Flip negative thoughts, calm in 60s, or spot thinking traps and get a better, alternate perspective on your emotions — through science-backed games.</p>
            </div>
            <div className="feature-card" data-aos="flip-left" data-aos-delay="300">
              <div className="feature-icon">🪄</div>
              <h3>AI Companion Chat</h3>
              <p>Talk to ELMA anytime — she listens, guides, celebrates your growth and most importantly doesn't fuel your delusions instead guides you better.</p>
            </div>
            <div className="feature-card" data-aos="flip-left" data-aos-delay="400">
              <div className="feature-icon">👩‍⚕️</div>
              <h3>Psychologist Directory</h3>
              <p>Book verified experts and share your insights (only if you choose) for more meaningful sessions.</p>
            </div>
            <div className="feature-card" data-aos="flip-left" data-aos-delay="500">
              <div className="feature-icon">📊</div>
              <h3>My Growth Dashboard</h3>
              <p>Track moods, strengths, and rewards in a stigma-free way.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Psychologist Partner Section */}
      <section className="psychologist-partner-section" id="for-psychologists">
        <div className="container">
          <div className="partner-pitch">
            <h2 data-aos="fade-up">👨‍⚕️ Partner With ELMA: Expand Your Impact</h2>
            <h4 data-aos="fade-up" data-aos-delay="100">ELMA empowers certified psychologists to reach more clients, save time in intake, and provide deeper therapy with AI-powered insights.</h4>
            <div className="benefit-cards-grid">
              <div className="partner-benefit-card" data-aos="zoom-in" data-aos-delay="200">
                <div className="benefit-icon">🧑‍⚕️</div>
                <h3>Expand Your Reach</h3>
                <p>Serve clients nationwide and across the global Indian diaspora.</p>
                <p className="benefit-highlight">Go beyond your city → ELMA connects you with a larger pool of clients.</p>
                <div className="benefit-animation">
                  <span className="pulse-dot"></span>
                  <span className="pulse-dot" style={{ ['--delay']: '0.5s' }}></span>
                  <span className="pulse-dot" style={{ ['--delay']: '1s' }}></span>
                </div>
              </div>
              <div className="partner-benefit-card" data-aos="zoom-in" data-aos-delay="300">
                <div className="benefit-icon">📊</div>
                <h3>Work Smarter, Not Harder</h3>
                <p>Patients arrive with mood logs, journaling, and AI insights.</p>
                <p className="benefit-highlight">Sessions begin deeper and faster — skipping 2–3 typical intake sessions.</p>
                <div className="benefit-stat"><span className="stat-number">60</span>%<span className="stat-label">Time Saved</span></div>
              </div>
              <div className="partner-benefit-card" data-aos="zoom-in" data-aos-delay="400">
                <div className="benefit-icon">💼</div>
                <h3>Practice on Your Terms</h3>
                <p>Choose your hours, set your own fees.</p>
                <p className="benefit-highlight">Weekly payouts → no billing hassle.</p>
                <div className="benefit-features">
                  <span className="feature-tag">Flexible Hours</span>
                  <span className="feature-tag">Your Rates</span>
                  <span className="feature-tag">Weekly Pay</span>
                </div>
              </div>
              <div className="partner-benefit-card" data-aos="zoom-in" data-aos-delay="500">
                <div className="benefit-icon">🌍</div>
                <h3>Grow With ELMA</h3>
                <p>Be part of a trusted national network.</p>
                <p className="benefit-highlight">Future expansion: serve diaspora in UK, US, Canada, and Australia.</p>
                <div className="country-flags">
                  <span title="India">🇮🇳</span>
                  <span title="UK">🇬🇧</span>
                  <span title="USA">🇺🇸</span>
                  <span title="Canada">🇨🇦</span>
                  <span title="Australia">🇦🇺</span>
                </div>
              </div>
            </div>
          </div>

          <div className="privacy-security-section">
            <h2 data-aos="fade-up">🔒 Privacy You Can Trust. Security That's Global Standard.</h2>
            <div className="security-features" data-aos="fade-up" data-aos-delay="100">
              <div className="security-item"><i className="fas fa-lock"></i><span>End-to-end encrypted sessions</span></div>
              <div className="security-item"><i className="fas fa-ban"></i><span>No session recordings stored</span></div>
              <div className="security-item"><i className="fas fa-check-circle"></i><span>Explicit user consent for every data share</span></div>
              <div className="security-item"><i className="fas fa-scroll"></i><span>Compliant with: India DPDP 2023, MHCA 2017, UK GDPR, EU GDPR</span></div>
            </div>
            <div className="compliance-badges" data-aos="zoom-in" data-aos-delay="200">
              <div className="badge-item" title="All data is encrypted using industry-standard protocols">
                <div className="badge-circle">
                  <svg viewBox="0 0 24 24" width="32" height="32">
                    <path d="M12 2L4 7V12C4 16.5 6.8 20.7 11 21.9C11.3 22 11.7 22 12 21.9C16.2 20.7 20 16.5 20 12V7L12 2Z" fill="url(#shield-gradient)" stroke="none" />
                    <path d="M12 11V15M12 15L10 13M12 15L14 13" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="badge-label">End-to-End Encryption</span>
              </div>
              <div className="badge-item" title="Compliant with European data protection standards">
                <div className="badge-circle"><div className="eu-flag"><span className="star">⭐</span><span className="star">⭐</span><span className="star">⭐</span><span className="star">⭐</span><span className="star">⭐</span></div></div>
                <span className="badge-label">GDPR Compliant</span>
              </div>
              <div className="badge-item" title="India's Digital Personal Data Protection Act 2023">
                <div className="badge-circle">
                  <div className="india-flag">
                    <div className="saffron"></div>
                    <div className="white"><div className="chakra">☸</div></div>
                    <div className="green"></div>
                  </div>
                </div>
                <span className="badge-label">DPDP 2023 Ready</span>
              </div>
              <div className="badge-item" title="Mental Healthcare Act 2017 Compliant">
                <div className="badge-circle">
                  <svg viewBox="0 0 24 24" width="32" height="32">
                    <path d="M19 3H5C3.89 3 3 3.89 3 5V19C3 20.11 3.89 21 5 21H19C20.11 21 21 20.11 21 19V5C21 3.89 20.11 3 19 3Z" fill="none" stroke="url(#law-gradient)" strokeWidth="2" />
                    <path d="M7 7H17M7 12H17M7 17H13" stroke="url(#law-gradient)" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="badge-label">MHCA 2017 Compliance</span>
              </div>
              <div className="badge-item" title="Your privacy is our priority">
                <div className="badge-circle">
                  <svg viewBox="0 0 24 24" width="32" height="32">
                    <circle cx="12" cy="12" r="10" fill="url(#check-gradient)" />
                    <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="badge-label">User-First Privacy</span>
              </div>
            </div>
            {/* Inline SVG gradients used above */}
            <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
              <defs>
                <linearGradient id="shield-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#BA92FF', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#90E0EF', stopOpacity: 1 }} />
                </linearGradient>
                <linearGradient id="law-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#FFBBD8', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#BA92FF', stopOpacity: 1 }} />
                </linearGradient>
                <linearGradient id="check-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#90E0EF', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#FFBBD8', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Academic Trust */}
          <div className="academic-trust-section">
            <h2 data-aos="fade-up">🎓 Grounded in Science. Inspired by Global Research.</h2>
            <p className="trust-description" data-aos="fade-up" data-aos-delay="100">Our methods draw on decades of evidence from the world's best universities in psychology and neuroscience.</p>
            <div className="university-logos" data-aos="zoom-in" data-aos-delay="200">
              <div className="uni-logo"><div className="logo-placeholder harvard">HARVARD</div></div>
              <div className="uni-logo"><div className="logo-placeholder stanford">STANFORD</div></div>
              <div className="uni-logo"><div className="logo-placeholder yale">YALE</div></div>
              <div className="uni-logo"><div className="logo-placeholder oxford">OXFORD</div></div>
            </div>
            <p className="research-caption" data-aos="fade-up" data-aos-delay="300">Research-inspired frameworks from global leaders</p>
            <div className="trust-stats" data-aos="fade-up" data-aos-delay="400">
              <div className="trust-stat"><span className="trust-number">500+</span><span className="trust-label">Research Papers Analyzed</span></div>
              <div className="trust-stat"><span className="trust-number">15+</span><span className="trust-label">Years of Combined Research</span></div>
              <div className="trust-stat"><span className="trust-number">98%</span><span className="trust-label">Evidence-Based Methods</span></div>
            </div>
          </div>

          {/* CTA for partners */}
          <div className="partner-cta-section" data-aos="zoom-in">
            <div className="cta-content">
              <h2>Ready to Transform Mental Healthcare?</h2>
              <p>Join a growing network of forward-thinking psychologists</p>
              <button className="cta-button primary large" id="partnerCTA" onClick={() => setPsychOpen(true)}>Apply to Join ELMA's Expert Network</button>
              <div className="cta-features">
                <span><i className="fas fa-check"></i> Quick 5-minute application</span>
                <span><i className="fas fa-check"></i> Verification within 48 hours</span>
                <span><i className="fas fa-check"></i> Start earning immediately</span>
              </div>
            </div>
            <div className="cta-visual">
              <div className="floating-badges">
                <span className="float-badge" style={{ ['--delay']: '0s' }}>🎯</span>
                <span className="float-badge" style={{ ['--delay']: '0.5s' }}>💡</span>
                <span className="float-badge" style={{ ['--delay']: '1s' }}>🚀</span>
                <span className="float-badge" style={{ ['--delay']: '1.5s' }}>🌟</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How We're Different Section */}
      <section className="different-section" id="how-different">
        <div className="container">
          <div className="section-header" data-aos="fade-up">
            <h2>How We're Different</h2>
            <p>"Most apps stop at tracking. ELMA goes further."</p>
          </div>
          <div className="comparison-grid">
            <div className="comparison-column traditional" data-aos="fade-right">
              <h3>Traditional Apps</h3>
              <div className="comparison-items">
                <div className="benefit-item"><i className="fas fa-times-circle"></i><span>Just mood logs</span></div>
                <div className="benefit-item"><i className="fas fa-times-circle"></i><span>Generic tips</span></div>
                <div className="benefit-item"><i className="fas fa-times-circle"></i><span>Faceless interface</span></div>
                <div className="benefit-item"><i className="fas fa-times-circle"></i><span>Intrusive notifications</span></div>
                <div className="benefit-item"><i className="fas fa-times-circle"></i><span>Clinical and boring UI</span></div>
              </div>
            </div>
            <div className="comparison-column elma" data-aos="fade-left">
              <h3>ELMA</h3>
              <div className="comparison-items">
                <div className="benefit-item"><i className="fas fa-check-circle"></i><span>Stress trigger Detection</span></div>
                <div className="benefit-item"><i className="fas fa-check-circle"></i><span>Interactive, science-backed games</span></div>
                <div className="benefit-item"><i className="fas fa-check-circle"></i><span>ELMA herself, your companion & mascot</span></div>
                <div className="benefit-item"><i className="fas fa-check-circle"></i><span>Your privacy, always in your control</span></div>
                <div className="benefit-item"><i className="fas fa-check-circle"></i><span>Mood Flower, Ribbon, Avatar</span></div>
              </div>
            </div>
          </div>
          {/* Mobile paired comparison for horizontal alignment */}
          <div className="comparison-mobile-header" aria-hidden="true">
            <div className="header-title traditional">Traditional Apps</div>
            <div className="header-title elma">ELMA</div>
          </div>
          <div className="comparison-pairs" aria-label="Traditional vs ELMA comparison (mobile)">
            <div className="comparison-pair">
              <div className="benefit-item"><i className="fas fa-times-circle"></i><span>Just mood logs</span></div>
              <div className="benefit-item"><i className="fas fa-check-circle"></i><span>Stress trigger Detection</span></div>
            </div>
            <div className="comparison-pair">
              <div className="benefit-item"><i className="fas fa-times-circle"></i><span>Generic tips</span></div>
              <div className="benefit-item"><i className="fas fa-check-circle"></i><span>Interactive, science-backed games</span></div>
            </div>
            <div className="comparison-pair">
              <div className="benefit-item"><i className="fas fa-times-circle"></i><span>Faceless interface</span></div>
              <div className="benefit-item"><i className="fas fa-check-circle"></i><span>ELMA herself, your companion & mascot</span></div>
            </div>
            <div className="comparison-pair">
              <div className="benefit-item"><i className="fas fa-times-circle"></i><span>Intrusive notifications</span></div>
              <div className="benefit-item"><i className="fas fa-check-circle"></i><span>Your privacy, always in your control</span></div>
            </div>
            <div className="comparison-pair">
              <div className="benefit-item"><i className="fas fa-times-circle"></i><span>Clinical and boring UI</span></div>
              <div className="benefit-item"><i className="fas fa-check-circle"></i><span>Mood Flower, Ribbon, Avatar</span></div>
            </div>
          </div>
          <div className="brand-statement" data-aos="zoom-in" data-aos-delay="300">
            <p>"Cool enough for Gen Z. Serious enough for experts. Futuristic enough for investors."</p>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta-section">
        <div className="container">
          <div className="cta-content" data-aos="zoom-in">
            <div className="confetti-container">
              <div className="confetti"></div>
              <div className="confetti"></div>
              <div className="confetti"></div>
              <div className="confetti"></div>
              <div className="confetti"></div>
            </div>
            <h2>Life, made easy. One mood, one moment at a time.</h2>
            <p>"Emotions aren't problems. They're signals. ELMA helps you identify and deal with them."</p>
            <div className="final-cta-buttons">
              <button className="cta-button primary large" id="finalUserCTA" onClick={() => setWaitlistOpen(true)}><span>✨</span> Begin your ELMA journey today</button>
              <button className="cta-button secondary large" id="finalPsychologistCTA" onClick={() => setPsychOpen(true)}><span>👩‍⚕️</span> Be part of ELMA's expert network</button>
            </div>
            <p className="tagline">"Designed to make your life easy, powered by science."</p>
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