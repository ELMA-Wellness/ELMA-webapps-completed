import { Link } from 'react-router-dom'
import { useLang } from '../contexts/LangContext.jsx'

function Navbar({ onToggleMenu }) {
  const { t, lang } = useLang()

  const handleLogoError = (e) => {
    e.currentTarget.src = 'https://via.placeholder.com/120x40/BA92FF/FFFFFF?text=ELMA'
  }

  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-content">
          <div className="logo">
            <Link to={`/${lang}`}>
              <img src="/images/elma-logo.png" alt="ELMA Logo" className="logo-img" onError={handleLogoError} />
            </Link>
            <span className="brand-tagline">{t('nav_tagline')}</span>
          </div>
          <div className="nav-links">
            <a href={`/${lang}#features`} className="nav-link">{t('nav_features')}</a>
            <Link to={`/${lang}/elma-experts`} className="nav-link">{t('nav_psychologists')}</Link>
            <Link to={`/${lang}/about`} className="nav-link">{t('nav_about')}</Link>
            <Link to={`/${lang}/contact`} className="nav-link">{t('nav_contact')}</Link>
          </div>
          <a href={`/${lang}#final-cta`} className="nav-cta" aria-label="Get Started">{t('nav_download')}</a>
          <button className="mobile-menu-toggle" onClick={onToggleMenu} aria-label="Open Menu">
            <i className="fas fa-bars"></i>
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
