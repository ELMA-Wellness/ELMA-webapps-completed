import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '../contexts/LangContext.jsx'

const LANGS = [
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'ja', label: '日本語',    flag: '🇯🇵' },
  { code: 'hi', label: 'हिन्दी',    flag: '🇮🇳' },
  { code: 'es', label: 'Español',  flag: '🇪🇸' },
]

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang()
  const [open, setOpen] = useState(false)
  const current = LANGS.find(l => l.code === lang) || LANGS[0]

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9998,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '8px',
      }}
    >
      {/* Language list */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="lang-list"
            initial={{ opacity: 0, y: 10, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.94 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: 'rgba(10, 5, 30, 0.97)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(186,146,255,0.25)',
              borderRadius: '18px',
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              boxShadow: '0 8px 40px rgba(186,146,255,0.18), 0 2px 8px rgba(0,0,0,0.5)',
            }}
          >
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => { setLang(l.code); setOpen(false) }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 18px',
                  background: l.code === lang ? 'rgba(186,146,255,0.15)' : 'transparent',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  color: l.code === lang ? '#BA92FF' : 'rgba(255,255,255,0.72)',
                  fontSize: '14px',
                  fontWeight: l.code === lang ? 600 : 400,
                  whiteSpace: 'nowrap',
                  transition: 'background 0.12s, color 0.12s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => { if (l.code !== lang) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                onMouseLeave={e => { if (l.code !== lang) e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: '16px' }}>{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        aria-label="Change language"
        aria-expanded={open}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 18px',
          background: 'rgba(10, 5, 30, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(186,146,255,0.35)',
          borderRadius: '50px',
          cursor: 'pointer',
          color: '#fff',
          fontSize: '13px',
          fontWeight: 500,
          boxShadow: '0 4px 20px rgba(186,146,255,0.12)',
          fontFamily: 'inherit',
        }}
      >
        <span style={{ fontSize: '15px' }}>{current.flag}</span>
        <span style={{ color: '#BA92FF', fontWeight: 700, letterSpacing: '0.05em' }}>
          {current.code.toUpperCase()}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', display: 'inline-block' }}
        >
          ▲
        </motion.span>
      </motion.button>
    </div>
  )
}
