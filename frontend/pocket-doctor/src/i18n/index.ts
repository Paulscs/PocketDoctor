import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

import en from '../locales/en/translation.json';
import es from '../locales/es/translation.json';

const RESOURCES = {
  en: { translation: en },
  es: { translation: es },
};

const LANGUAGE_DETECTOR = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lang: string) => void) => {
    try {
      // 1. Check AsyncStorage
      const storedLanguage = await AsyncStorage.getItem('lang');
      if (storedLanguage) {
        return callback(storedLanguage);
      }

      // 2. Fallback to Device Language
      const locales = Localization.getLocales();
      const deviceLanguage = locales[0]?.languageCode; // e.g., "en", "es"
      
      if (deviceLanguage && ['en', 'es'].includes(deviceLanguage)) {
        return callback(deviceLanguage);
      }
      
      // Default to Spanish if unknown
      return callback('es');
    } catch (error) {
      console.log('Error reading language', error);
      callback('es');
    }
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem('lang', language);
    } catch (error) {
      console.log('Error saving language', error);
    }
  },
};

i18n
  .use(LANGUAGE_DETECTOR)
  .use(initReactI18next)
  // @ts-ignore
  .init({
    resources: RESOURCES,
    fallbackLng: 'en', // Fallback to English if key missing
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v3',
    react: {
        useSuspense: false // important for reacting native sometimes
    }
  });

export default i18n;
