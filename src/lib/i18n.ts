import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    detection: {
      caches: [], // Disable localStorage caching
    },
    resources: {
      en: {
        translation: {
          // English translations go here
          welcome: "Welcome to RJ WORLD BD",
        }
      },
      bn: {
        translation: {
          // Bengali translations go here
          welcome: "RJ WORLD BD এ স্বাগতম",
        }
      }
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    }
  });

export default i18n;
