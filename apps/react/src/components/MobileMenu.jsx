import { Link } from 'react-router-dom'
import { useLang } from '../contexts/LangContext.jsx'

function MobileMenu({ isOpen, onClose }) {
  const { t } = useLang()
  return (
    <div className={`mobile-menu ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className="mobile-menu-content" onClick={(e) => e.stopPropagation()}>
        <button className="mobile-menu-close" onClick={onClose} aria-label="Close Menu">
          <i className="fas fa-times"></i>
        </button>
        <a href="/#features" className="mobile-link" onClick={onClose}>{t('nav_features')}</a>
        <Link to="/elma-experts" className="mobile-link" onClick={onClose}>{t('nav_psychologists')}</Link>
        <Link to="/about" className="mobile-link" onClick={onClose}>{t('nav_about')}</Link>
        <Link to="/contact" className="mobile-link" onClick={onClose}>{t('nav_contact')}</Link>
      </div>
    </div>
  )
}

export default MobileMenu
