import { Link } from 'react-router-dom'
import { useLang } from '../contexts/LangContext.jsx'

function Footer() {
  const { t } = useLang()

  const handleLogoError = (e) => {
    e.currentTarget.src = 'https://via.placeholder.com/150x40/BA92FF/FFFFFF?text=ELMA'
  }

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-logo">
            <img src="/images/elma-logo.png" alt="ELMA Logo" className="footer-logo-img" onError={handleLogoError} />
          </div>
          <div className="footer-links">
            <Link to="/privacy">{t('footer_privacy')}</Link>
            <Link to="/terms">{t('footer_terms')}</Link>
            <Link to="/contact">{t('footer_contact')}</Link>
            <Link to="/cancellation">{t('footer_cancel')}</Link>
          </div>
          <div className="footer-social">
            <a href="https://www.linkedin.com/company/elma-emotional-life-management-assistant" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin"></i></a>
            <a href="https://www.instagram.com/elma.ai_official/" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>{t('footer_copy')}</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
