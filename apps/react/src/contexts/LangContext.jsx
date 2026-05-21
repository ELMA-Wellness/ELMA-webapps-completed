import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import translations from '../i18n/translations.js'

export const SUPPORTED_LANGS = ['en', 'fr', 'ja', 'hi', 'es']
const STORAGE_KEY = 'elma_lang'

function getLangFromPath(pathname) {
  const segment = pathname.split('/')[1]
  return SUPPORTED_LANGS.includes(segment) ? segment : null
}

function getFallbackLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && SUPPORTED_LANGS.includes(saved)) return saved
    const code = (navigator.language || 'en').slice(0, 2).toLowerCase()
    return SUPPORTED_LANGS.includes(code) ? code : 'en'
  } catch {
    return 'en'
  }
}

const LangContext = createContext({ lang: 'en', setLang: () => {}, t: (k) => k })

export function LangProvider({ children }) {
  const location = useLocation()
  const navigate = useNavigate()

  const urlLang = getLangFromPath(location.pathname)
  const [lang, setLangState] = useState(() => urlLang || getFallbackLang())

  // Keep lang in sync when the URL lang segment changes
  useEffect(() => {
    const fromUrl = getLangFromPath(location.pathname)
    if (fromUrl && fromUrl !== lang) {
      setLangState(fromUrl)
      try { localStorage.setItem(STORAGE_KEY, fromUrl) } catch {}
    }
  }, [location.pathname])

  const setLang = useCallback((l) => {
    if (!SUPPORTED_LANGS.includes(l)) return
    const segments = location.pathname.split('/')
    // segments = ['', 'en', 'about', ...] or ['', 'about', ...]
    if (SUPPORTED_LANGS.includes(segments[1])) {
      segments[1] = l
    } else {
      segments.splice(1, 0, l)
    }
    const newPath = segments.join('/') || `/${l}`
    setLangState(l)
    try { localStorage.setItem(STORAGE_KEY, l) } catch {}
    navigate(newPath, { replace: true })
  }, [location.pathname, navigate])

  const t = useCallback((key) => {
    const dict = translations[lang]
    if (dict && dict[key] !== undefined) return dict[key]
    const en = translations.en
    return (en && en[key] !== undefined) ? en[key] : key
  }, [lang])

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
