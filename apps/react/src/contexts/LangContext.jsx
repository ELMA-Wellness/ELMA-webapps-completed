import { createContext, useContext, useState } from 'react'
import translations from '../i18n/translations.js'

const SUPPORTED = ['en', 'fr', 'ja', 'hi', 'es']
const STORAGE_KEY = 'elma_lang'

function detectLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && SUPPORTED.includes(saved)) return saved
    const code = (navigator.language || 'en').slice(0, 2).toLowerCase()
    return SUPPORTED.includes(code) ? code : 'en'
  } catch {
    return 'en'
  }
}

const LangContext = createContext({ lang: 'en', setLang: () => {}, t: (k) => k })

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(detectLang)

  const setLang = (l) => {
    if (!SUPPORTED.includes(l)) return
    setLangState(l)
    try { localStorage.setItem(STORAGE_KEY, l) } catch {}
  }

  const t = (key) => {
    const dict = translations[lang]
    if (dict && dict[key] !== undefined) return dict[key]
    const en = translations.en
    return (en && en[key] !== undefined) ? en[key] : key
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
