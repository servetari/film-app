const SUPPORTED_LANGUAGES = ['tr', 'en'];
const FALLBACK_LANGUAGE = 'tr';

let translatorPromise = null;

const loadTranslator = async () => {
  if (!translatorPromise) {
    translatorPromise = import('@vitalets/google-translate-api')
      .then((module) => {
        const translateFn = module.default?.translate || module.translate;
        return typeof translateFn === 'function' ? translateFn : null;
      })
      .catch((error) => {
        console.error('Çeviri modülü yüklenemedi:', error.message);
        return null;
      });
  }
  return translatorPromise;
};

const normalizeLang = (lang = FALLBACK_LANGUAGE) => {
  const lower = (lang || FALLBACK_LANGUAGE).toLowerCase();
  return SUPPORTED_LANGUAGES.includes(lower) ? lower : FALLBACK_LANGUAGE;
};

const translateText = async (text, toLanguage) => {
  const target = normalizeLang(toLanguage);
  if (!text || target === 'en') {
    return text;
  }

  const translate = await loadTranslator();
  if (!translate) {
    return text;
  }

  try {
    const { text: translated } = await translate(text, { to: target });
    return translated;
  } catch (error) {
    console.error('Çeviri yapılamadı:', error.message);
    return text;
  }
};

module.exports = {
  translateText,
  normalizeLang,
  SUPPORTED_LANGUAGES,
};
