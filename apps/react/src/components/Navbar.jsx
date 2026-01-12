import { Link } from 'react-router-dom'

function Navbar({ onToggleMenu }) {
  const handleLogoError = (e) => {
    e.currentTarget.src = 'https://via.placeholder.com/120x40/BA92FF/FFFFFF?text=ELMA'
  }

  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-content">
          <div className="logo">
            <Link to="/">
              <img src="/images/elma-logo.png" alt="ELMA Logo" className="logo-img" onError={handleLogoError} />
            </Link>
            <span className="brand-tagline">Emotional Life Management Assistant</span>
          </div>
          <div className="nav-links">
            <a href="/#app-showcase" className="nav-link">App Preview</a>
            <a href="/#features" className="nav-link">Features</a>
            <a href="/#for-psychologists" className="nav-link">For Psychologists</a>
            <Link to="/contact" className="nav-link">Contact</Link>
          </div>
          {/* Header CTA */}
          <Link to="/?waitlist=1" className="nav-cta" aria-label="Get Started">Get Started</Link>
          <button className="mobile-menu-toggle" onClick={onToggleMenu} aria-label="Open Menu">
            <i className="fas fa-bars"></i>
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar