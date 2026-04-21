"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { dictionary, Language } from "@/lib/dictionary"

interface LanguageContextType {
  lang: Language
  setLang: (lang: Language) => void
  t: typeof dictionary.it
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("it")

  useEffect(() => {
    const savedLang = localStorage.getItem("language") as Language
    if (savedLang && (savedLang === "it" || savedLang === "en" || savedLang === "es" || savedLang === "jap")) {
      setLang(savedLang)
    }
  }, [])

  const handleSetLang = (newLang: Language) => {
    setLang(newLang)
    localStorage.setItem("language", newLang);
  }

  const t = dictionary[lang]

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage deve essere usato dentro un LanguageProvider")
  }
  return context
}