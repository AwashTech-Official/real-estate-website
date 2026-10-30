import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'am';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  /**
   * Helper to resolve localized text with fallback to English
   */
  t: (en: string, am?: string | null) => string;
  /**
   * Helper for database entities with `_am` fields (e.g. title/title_am, description/description_am)
   */
  getLocalized: <T extends Record<string, any>>(
    entity: T | null | undefined,
    field: string,
    fallback?: string
  ) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app_language') as Language;
      if (saved === 'en' || saved === 'am') return saved;
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_language', lang);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'am' : 'en');
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      if (language === 'am') {
        document.documentElement.setAttribute('data-lang', 'am');
        document.body.classList.add('lang-am');
      } else {
        document.documentElement.removeAttribute('data-lang');
        document.body.classList.remove('lang-am');
      }
    }
  }, [language]);

  const t = (en: string, am?: string | null): string => {
    if (language === 'am' && am && am.trim().length > 0) {
      return am;
    }
    return en;
  };

  const getLocalized = <T extends Record<string, any>>(
    entity: T | null | undefined,
    field: string,
    fallback = ''
  ): string => {
    if (!entity) return fallback;
    if (language === 'am') {
      const amValue = entity[`${field}_am`];
      if (amValue && typeof amValue === 'string' && amValue.trim().length > 0) {
        return amValue;
      }
    }
    const enValue = entity[field];
    return typeof enValue === 'string' && enValue.trim().length > 0 ? enValue : fallback;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, getLocalized }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
