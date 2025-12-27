import { useEffect, useRef, useState } from 'react'

import './Contact.css'

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'
const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || '81727855-9c6b-4474-abd0-9fb03150fe7f'

function Contact() {
  const nameRef = useRef(null)
  const emailRef = useRef(null)
  const subjectRef = useRef(null)
  const messageRef = useRef(null)

  const [sending, setSending] = useState(false)
  const [successVisible, setSuccessVisible] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    const timeout = successVisible ? setTimeout(() => setSuccessVisible(false), 5000) : null
    return () => timeout && clearTimeout(timeout)
  }, [successVisible])

  const validate = () => {
    const newErrors = {}

    const name = nameRef.current?.value.trim() || ''
    const email = emailRef.current?.value.trim() || ''
    const message = messageRef.current?.value.trim() || ''

    if (!name) newErrors.name = 'Name is required'

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) newErrors.email = 'Email is required'
    else if (!emailRegex.test(email)) newErrors.email = 'Please enter a valid email address'

    if (!message) newErrors.message = 'Message is required'
    else if (message.length < 10) newErrors.message = 'Message must be at least 10 characters long'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const clearErrorsFor = (field) => {
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    if (!validate()) return

    setSending(true)
    setSubmitError('')
    const data = {
      access_key: WEB3FORMS_ACCESS_KEY,
      type: 'contact',
      name: nameRef.current?.value || '',
      email: emailRef.current?.value || '',
      subject: subjectRef.current?.value || 'General Inquiry',
      message: messageRef.current?.value || '',
      timestamp: new Date().toISOString(),
      from_name: 'ELMA Website',
      reply_to: emailRef.current?.value || '',
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
      setSuccessVisible(true)
      setErrors({})
    } catch (err) {
      console.error('Error:', err)
      setSubmitError('We couldn\'t send your message. Please try again in a moment.')
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="contact-page">
      <div className="contact-container">
        <div className="contact-header" data-aos="fade-up">
          <h1>Get in Touch</h1>
          <p>We'd love to hear from you. Whether you need support or want to explore partnerships, we're here to help on your emotional wellness journey.</p>
        </div>

        <div className="contact-content">
          {/* Contact Form */}
          <div className="contact-form-section" data-aos="fade-right" data-aos-delay="200">
            <h2>Send us a Message</h2>
            <form onSubmit={onSubmit}>
              <div className="form-group">
                <label htmlFor="name">Your Name *</label>
                <input type="text" id="name" name="name" required placeholder="Enter your full name" ref={nameRef} onInput={() => clearErrorsFor('name')} className={errors.name ? 'error' : ''} />
                {errors.name && <div className="error-message">{errors.name}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="email">Your Email *</label>
                <input type="email" id="email" name="email" required placeholder="Enter your email address" ref={emailRef} onInput={() => clearErrorsFor('email')} className={errors.email ? 'error' : ''} />
                {errors.email && <div className="error-message">{errors.email}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input type="text" id="subject" name="subject" placeholder="How can we help?" ref={subjectRef} onInput={() => clearErrorsFor('subject')} />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea id="message" name="message" required placeholder="Tell us more about your inquiry..." ref={messageRef} onInput={() => clearErrorsFor('message')} className={errors.message ? 'error' : ''}></textarea>
                {errors.message && <div className="error-message">{errors.message}</div>}
              </div>
              <button type="submit" className="contact-submit" disabled={sending}>
                {sending ? (
                  <>
                    <i className="fas fa-spinner fa-spin" style={{ marginRight: '0.5rem' }}></i>
                    Sending...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane" style={{ marginRight: '0.5rem' }}></i>
                    Send Message
                  </>
                )}
              </button>
            </form>
            {submitError && (
              <div className="error-message" style={{ marginTop: '0.75rem' }} aria-live="polite">{submitError}</div>
            )}
            <div id="successMessage" className={`success-message ${successVisible ? 'show' : ''}`}>
              <span className="heart-confirmation" aria-hidden="true">♥</span>
              ✨ Thank you for contacting us! We'll get back to you within 24 hours.
            </div>
          </div>

          {/* Contact Information */}
          <div className="contact-info-section" data-aos="fade-left" data-aos-delay="400">
            {/* General Support */}
            <div className="contact-section">
              <h3><i className="fas fa-life-ring"></i> General Support</h3>
              <div className="contact-item">
                <i className="fas fa-envelope"></i>
                <div className="contact-item-content">
                  <h4>Email Support</h4>
                  <p><a href="mailto:socials@elma.ltd">socials@elma.ltd</a></p>
                </div>
              </div>
              <div className="contact-item">
                <i className="fas fa-clock"></i>
                <div className="contact-item-content">
                  <h4>Response Time</h4>
                  <p>We typically respond within 24 hours</p>
                </div>
              </div>
              <div className="contact-item">
                <i className="fas fa-globe"></i>
                <div className="contact-item-content">
                  <h4>Website</h4>
                  <p><a href="https://www.elma.ltd" target="_blank" rel="noreferrer">www.elma.ltd</a></p>
                </div>
              </div>
            </div>

            {/* Business & Partnerships */}
            <div className="business-card">
              <h3>🤝 Business & Partnerships</h3>
              <p>For business inquiries, partnerships, or collaboration opportunities:</p>
              <div className="business-contacts">
                <div className="business-contact">
                  <i className="fas fa-user-tie"></i>
                  <div>
                    <strong>Chief Executive Officer</strong>
                    <a href="mailto:ydk@elma.ltd">ydk@elma.ltd</a>
                  </div>
                </div>
                <div className="business-contact">
                  <i className="fas fa-handshake"></i>
                  <div>
                    <strong>Chief Marketing Officer</strong>
                    <a href="mailto:anurag_cmo@elma.ltd">anurag_cmo@elma.ltd</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Connect */}
            <div className="contact-section">
              <h3><i className="fas fa-share-alt"></i> Connect With Us</h3>
              <div className="contact-item">
                <i className="fab fa-linkedin"></i>
                <div className="contact-item-content">
                  <h4>LinkedIn</h4>
                  <p><a href="http://linkedin.com/company/elma-emotional-life-management-assistant" target="_blank" rel="noreferrer">Follow us on LinkedIn</a></p>
                </div>
              </div>
              <div className="contact-item">
                <i className="fab fa-instagram"></i>
                <div className="contact-item-content">
                  <h4>Instagram</h4>
                  <p><a href="https://www.instagram.com/your_friend_elma/" target="_blank" rel="noreferrer">@your_friend_elma</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact