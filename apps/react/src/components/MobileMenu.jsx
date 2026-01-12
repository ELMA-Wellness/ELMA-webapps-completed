import { Link } from 'react-router-dom'

function MobileMenu({ isOpen, onClose }) {
  return (
    <div className={`mobile-menu ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className="mobile-menu-content" onClick={(e) => e.stopPropagation()}>
        <button className="mobile-menu-close" onClick={onClose} aria-label="Close Menu">
          <i className="fas fa-times"></i>
        </button>
        <a href="/#app-showcase" className="mobile-link" onClick={onClose}>App Preview</a>
        <a href="/#features" className="mobile-link" onClick={onClose}>Features</a>
        <a href="/#for-psychologists" className="mobile-link" onClick={onClose}>For Psychologists</a>
        <Link to="/contact" className="mobile-link" onClick={onClose}>Contact</Link>
      </div>
    </div>
  )
}

export default MobileMenu