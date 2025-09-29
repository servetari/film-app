import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const FALLBACK_LANGUAGE = 'tr';

const getInitialLanguage = () => {
  if (typeof window === 'undefined') {
    return FALLBACK_LANGUAGE;
  }

  const stored = localStorage.getItem('language');
  if (stored) {
    return stored;
  }

  const browserLang = window.navigator.language?.slice(0, 2).toLowerCase();
  return browserLang === 'en' ? 'en' : FALLBACK_LANGUAGE;
};

const LanguageContext = createContext({
  language: FALLBACK_LANGUAGE,
  setLanguage: () => {},
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(getInitialLanguage);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', language);
    }

    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);
