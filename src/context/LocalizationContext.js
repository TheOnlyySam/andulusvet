import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from '../i18n/translations';

const STORAGE_KEY = 'andulusvet_language_v1';

const LocalizationContext = createContext(null);

function getValue(object, path) {
  return path.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), object);
}

export function LocalizationProvider({ children }) {
  const [language, setLanguage] = useState('ar');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored === 'ar' || stored === 'en') {
          setLanguage(stored);
        }
      })
      .finally(() => setIsHydrated(true));
  }, []);

  const changeLanguage = async (nextLanguage) => {
    setLanguage(nextLanguage);
    await AsyncStorage.setItem(STORAGE_KEY, nextLanguage);
  };

  const value = useMemo(() => {
    const locale = translations[language] || translations.ar;
    const fallback = translations.ar;

    const t = (key) => getValue(locale, key) ?? getValue(fallback, key) ?? key;

    return {
      language,
      isRTL: language === 'ar',
      isHydrated,
      t,
      setLanguage: changeLanguage
    };
  }, [isHydrated, language]);

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}

export function useLocalization() {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within LocalizationProvider');
  }

  return context;
}
