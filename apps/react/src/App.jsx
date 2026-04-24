import { lazy, Suspense, useEffect, useState, Component } from 'react'
import { Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HelmetProvider } from 'react-helmet-async'

import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import MobileMenu from './components/MobileMenu.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import Home from './pages/HomePage.jsx'
import { LangProvider } from './contexts/LangContext.jsx'
import LanguageSwitcher from './components/LanguageSwitcher.jsx'

const BG_GRADIENTS = [
  'linear-gradient(135deg, #07050f 0%, #1a0a38 45%, #050d1a 100%)',
  'linear-gradient(135deg, #0d0520 0%, #060f28 45%, #110520 100%)',
  'linear-gradient(135deg, #060a1e 0%, #1c0830 45%, #060e1c 100%)',
  'linear-gradient(135deg, #08060f 0%, #0e0628 45%, #04101e 100%)',
  'linear-gradient(135deg, #120828 0%, #060e1c 45%, #0a080f 100%)',
]

// Lazy-load all non-critical routes — defers Firebase + recharts bundles
const Contact = lazy(() => import('./pages/Contact.jsx'))
const Privacy = lazy(() => import('./pages/Privacy.jsx'))
const Terms = lazy(() => import('./pages/Terms.jsx'))
const Cancellation = lazy(() => import('./pages/Cancellation.jsx'))
const AppLanding = lazy(() => import('./pages/LandingPage.tsx'))
const AnalyticsDashboard = lazy(() => import('./pages/DashBoard.tsx'))
const SessionPage = lazy(() => import('./pages/SessionPage.jsx'))
const ElmaExperts = lazy(() => import('./pages/ElmaExperts.jsx'))
const About = lazy(() => import('./pages/About.jsx'))
const BlogListPage = lazy(() => import('./pages/BlogListPage.jsx'))
const BlogPostPage = lazy(() => import('./pages/BlogPostPage.jsx'))
const FAQPage = lazy(() => import('./pages/FAQ.jsx'))

// Global error boundary — prevents any single component crash from blanking the whole app
class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
          color: '#fff',
          padding: '2rem',
          fontFamily: 'sans-serif',
          textAlign: 'center',
        }}>
          <h2 style={{ color: '#BA92FF', marginBottom: '1rem' }}>Something went wrong</h2>
          <pre style={{
            background: '#1a1a1a',
            padding: '1rem',
            borderRadius: '8px',
            color: '#ff6b6b',
            fontSize: '0.85rem',
            maxWidth: '600px',
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
          }}>
            {this.state.error?.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1.5rem',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #BA92FF, #90E0EF)',
              border: 'none',
              borderRadius: '8px',
              color: '#000',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function App() {
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    // Defer AOS init so it doesn't block first paint
    const timer = setTimeout(async () => {
      try {
        const AOS = (await import('aos')).default
        await import('aos/dist/aos.css')
        AOS.init({ duration: 700, once: true })
      } catch (_) {
        // AOS failure is non-fatal
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <HelmetProvider>
    <LangProvider>
    <AppErrorBoundary>
      {/* Global animated gradient — sits behind everything on every page */}
      <motion.div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          background: BG_GRADIENTS[0],
          pointerEvents: 'none',
        }}
        animate={{ background: BG_GRADIENTS }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
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
          <Route path="/elma-experts" element={<ElmaExperts />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/faq" element={<FAQPage />} />
        </Routes>
      </Suspense>
      <Footer />
      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <LanguageSwitcher />
    </AppErrorBoundary>
    </LangProvider>
    </HelmetProvider>
  )
}

export default App
