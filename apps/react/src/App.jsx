import { lazy, Suspense, useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'

import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import MobileMenu from './components/MobileMenu.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import Home from './pages/HomePage.jsx'

// Lazy-load all non-critical routes — defers Firebase + recharts bundles
const Contact = lazy(() => import('./pages/Contact.jsx'))
const Privacy = lazy(() => import('./pages/Privacy.jsx'))
const Terms = lazy(() => import('./pages/Terms.jsx'))
const Cancellation = lazy(() => import('./pages/Cancellation.jsx'))
const AppLanding = lazy(() => import('./pages/LandingPage.tsx'))
const AnalyticsDashboard = lazy(() => import('./pages/DashBoard.tsx'))
const SessionPage = lazy(() => import('./pages/SessionPage.jsx'))

function App() {
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    // Defer AOS init so it doesn't block first paint
    const timer = setTimeout(async () => {
      const AOS = (await import('aos')).default
      await import('aos/dist/aos.css')
      AOS.init({ duration: 700, once: true })
    }, 200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <Navbar onToggleMenu={() => setMobileOpen(true)} />
      <ScrollToTop />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cancellation" element={<Cancellation />} />
          <Route path="/qr" element={<AppLanding />} />
          <Route path="/dashboard" element={<AnalyticsDashboard/>} />
          <Route path="/session" element={<SessionPage/>} />
        </Routes>
      </Suspense>
      <Footer />
      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  )
}

export default App
