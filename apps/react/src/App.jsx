import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import AOS from 'aos'
import 'aos/dist/aos.css'

import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import MobileMenu from './components/MobileMenu.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import Contact from './pages/Contact.jsx'
import Home from './pages/HomePage.jsx'
import Privacy from './pages/Privacy.jsx'
import Terms from './pages/Terms.jsx'
import Cancellation from './pages/Cancellation.jsx'
import AppLanding from './pages/LandingPage.tsx'
import AnalyticsDashboard from './pages/DashBoard.tsx'

// Home now imported from pages/Home.jsx

function App() {
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    AOS.init({ duration: 700, once: true })
  }, [])

  return (
    <>
      <Navbar onToggleMenu={() => setMobileOpen(true)} />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/cancellation" element={<Cancellation />} />
        <Route path="/qr" element={<AppLanding />} />
        <Route path="/dashboard" element={<AnalyticsDashboard/>} />
      </Routes>
      <Footer />
      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  )
}

export default App
