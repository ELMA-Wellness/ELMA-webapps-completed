import { Link } from 'react-router-dom'

function Footer() {
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
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div className="footer-social">
            <a href="http://linkedin.com/company/elma-emotional-life-management-assistant" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin"></i></a>
            <a href="https://www.instagram.com/your_friend_elma/?utm_source=ig_web_button_share_sheet" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 ELMA. All rights reserved. Made with ❤️ in Visionary India for the World 🌍</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer