import { useCallback } from 'react';
import translations from './translations';
import { useLanguage } from '../context/language/LanguageContext';

const interpolate = (template, replacements = {}) => {
  if (!template) return template;
  return Object.keys(replacements).reduce((acc, key) => (
    acc.replace(new RegExp(`{{${key}}}`, 'g'), replacements[key])
  ), template);
};

export const useTranslation = () => {
  const { language } = useLanguage();

  const t = useCallback((key, replacements = {}) => {
    const lang = language || 'tr';
    const fallback = translations.tr[key] || key;
    const value = translations[lang]?.[key] ?? fallback;
    return interpolate(value, replacements);
  }, [language]);

  return { t, language };
};
