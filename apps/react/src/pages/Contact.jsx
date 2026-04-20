import { useEffect, useRef, useState } from 'react'
import { useLang } from '../contexts/LangContext.jsx'
import SEO from '../components/SEO.jsx'
import './Contact.css'

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'
const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || '81727855-9c6b-4474-abd0-9fb03150fe7f'

function Contact() {
  const { t } = useLang()
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

    if (!name) newErrors.name = t('contact_err_name')

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) newErrors.email = t('contact_err_email_req')
    else if (!emailRegex.test(email)) newErrors.email = t('contact_err_email_inv')

    if (!message) newErrors.message = t('contact_err_msg_req')
    else if (message.length < 10) newErrors.message = t('contact_err_msg_min')

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
      setSubmitError(t('contact_submit_error'))
    } finally {
      setSending(false)
    }
  }

  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': 'https://elma.ltd/contact#webpage',
    url: 'https://elma.ltd/contact',
    name: 'Contact ELMA — Get in Touch',
    description: 'Reach out to the ELMA team for support, partnerships, or media enquiries.',
    isPartOf: { '@id': 'https://elma.ltd/#website' },
  }

  return (
    <section className="contact-page">
      <SEO
        title="Contact ELMA — Get in Touch"
        description="Reach the ELMA team for support, partnerships, or press. Email socials@elma.ltd. Response within 24 hours. CEO & CMO contacts available for business enquiries."
        canonical="/contact"
        schema={contactSchema}
      />
      <div className="contact-container">
        <div className="contact-header" data-aos="fade-up">
          <h1>{t('contact_h1')}</h1>
          <p>{t('contact_sub')}</p>
        </div>

        <div className="contact-content">
          {/* Contact Form */}
          <div className="contact-form-section" data-aos="fade-right" data-aos-delay="200">
            <h2>{t('contact_form_h2')}</h2>
            <form onSubmit={onSubmit}>
              <div className="form-group">
                <label htmlFor="name">{t('contact_name_label')}</label>
                <input type="text" id="name" name="name" required placeholder={t('contact_name_placeholder')} ref={nameRef} onInput={() => clearErrorsFor('name')} className={errors.name ? 'error' : ''} />
                {errors.name && <div className="error-message">{errors.name}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="email">{t('contact_email_label')}</label>
                <input type="email" id="email" name="email" required placeholder={t('contact_email_placeholder')} ref={emailRef} onInput={() => clearErrorsFor('email')} className={errors.email ? 'error' : ''} />
                {errors.email && <div className="error-message">{errors.email}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="subject">{t('contact_subject_label')}</label>
                <input type="text" id="subject" name="subject" placeholder={t('contact_subject_placeholder')} ref={subjectRef} onInput={() => clearErrorsFor('subject')} />
              </div>
              <div className="form-group">
                <label htmlFor="message">{t('contact_msg_label')}</label>
                <textarea id="message" name="message" required placeholder={t('contact_msg_placeholder')} ref={messageRef} onInput={() => clearErrorsFor('message')} className={errors.message ? 'error' : ''}></textarea>
                {errors.message && <div className="error-message">{errors.message}</div>}
              </div>
              <button type="submit" className="contact-submit" disabled={sending}>
                {sending ? (
                  <>
                    <i className="fas fa-spinner fa-spin" style={{ marginRight: '0.5rem' }}></i>
                    {t('contact_sending')}
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane" style={{ marginRight: '0.5rem' }}></i>
                    {t('contact_send')}
                  </>
                )}
              </button>
            </form>
            {submitError && (
              <div className="error-message" style={{ marginTop: '0.75rem' }} aria-live="polite">{submitError}</div>
            )}
            <div id="successMessage" className={`success-message ${successVisible ? 'show' : ''}`}>
              <span className="heart-confirmation" aria-hidden="true">♥</span>
              {t('contact_success')}
            </div>
          </div>

          {/* Contact Information */}
          <div className="contact-info-section" data-aos="fade-left" data-aos-delay="400">
            {/* General Support */}
            <div className="contact-section">
              <h3><i className="fas fa-life-ring"></i> {t('contact_support_h3')}</h3>
              <div className="contact-item">
                <i className="fas fa-envelope"></i>
                <div className="contact-item-content">
                  <h4>{t('contact_email_h4')}</h4>
                  <p><a href="mailto:socials@elma.ltd">socials@elma.ltd</a></p>
                </div>
              </div>
              <div className="contact-item">
                <i className="fas fa-clock"></i>
                <div className="contact-item-content">
                  <h4>{t('contact_response_h4')}</h4>
                  <p>{t('contact_response_p')}</p>
                </div>
              </div>
              <div className="contact-item">
                <i className="fas fa-globe"></i>
                <div className="contact-item-content">
                  <h4>{t('contact_website_h4')}</h4>
                  <p><a href="https://www.elma.ltd" target="_blank" rel="noreferrer">www.elma.ltd</a></p>
                </div>
              </div>
            </div>

            {/* Business & Partnerships */}
            <div className="business-card">
              <h3>🤝 {t('contact_biz_h3')}</h3>
              <p>{t('contact_biz_p')}</p>
              <div className="business-contacts">
                <div className="business-contact">
                  <i className="fas fa-user-tie"></i>
                  <div>
                    <strong>{t('contact_ceo')}</strong>
                    <a href="mailto:ydk@elma.ltd">ydk@elma.ltd</a>
                  </div>
                </div>
                <div className="business-contact">
                  <i className="fas fa-handshake"></i>
                  <div>
                    <strong>{t('contact_cmo')}</strong>
                    <a href="mailto:anurag_cmo@elma.ltd">anurag_cmo@elma.ltd</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Connect */}
            <div className="contact-section">
              <h3><i className="fas fa-share-alt"></i> {t('contact_connect_h3')}</h3>
              <div className="contact-item">
                <i className="fab fa-linkedin"></i>
                <div className="contact-item-content">
                  <h4>{t('contact_linkedin_h4')}</h4>
                  <p><a href="http://linkedin.com/company/elma-emotional-life-management-assistant" target="_blank" rel="noreferrer">{t('contact_linkedin_p')}</a></p>
                </div>
              </div>
              <div className="contact-item">
                <i className="fab fa-instagram"></i>
                <div className="contact-item-content">
                  <h4>{t('contact_instagram_h4')}</h4>
                  <p><a href="https://www.instagram.com/elma.ai_official/" target="_blank" rel="noreferrer">@elma.ai_official</a></p>
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