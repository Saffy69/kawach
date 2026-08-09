import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Language = 'en' | 'ne';

const KEY = 'kawach.language';

const translations = {
  en: {
    nav: { home: 'Home', response: 'Response', evidence: 'Evidence', report: 'Report', resources: 'Resources', privacy: 'Privacy' },
    language: 'नेपाली',
    languageLabel: 'Switch to Nepali',
    erase: 'Erase',
    eraseTitle: 'Erase everything?',
    eraseDescription: 'This deletes your saved answers, evidence fingerprints, saved screenshots, and any drafted report from this device. It cannot be undone.',
    eraseEverything: 'Erase everything',
    cancel: 'Cancel',
    back: 'Back',
    startOver: 'Start over',
    continue: 'Continue',
    next: 'Next',
    takingYouThere: 'Taking you there…',
  },
  ne: {
    nav: { home: 'गृहपृष्ठ', response: 'प्रतिक्रिया', evidence: 'प्रमाण', report: 'प्रतिवेदन', resources: 'स्रोतहरू', privacy: 'गोपनीयता' },
    language: 'English',
    languageLabel: 'Switch to English',
    erase: 'मेटाउनुहोस्',
    eraseTitle: 'सबै मेटाउने?',
    eraseDescription: 'यसले तपाईंका सुरक्षित जवाफ, प्रमाणका फिंगरप्रिन्ट, सुरक्षित स्क्रिनसट र यस उपकरणमा तयार गरिएको प्रतिवेदन मेटाउनेछ। यो पूर्ववत गर्न सकिँदैन।',
    eraseEverything: 'सबै मेटाउनुहोस्',
    cancel: 'रद्द गर्नुहोस्',
    back: 'पछाडि',
    startOver: 'फेरि सुरु गर्नुहोस्',
    continue: 'जारी राख्नुहोस्',
    next: 'अर्को',
    takingYouThere: 'तपाईंलाई त्यहाँ लैजाँदै…',
  },
} as const;

type Translation = (typeof translations)[Language];

interface LanguageContextValue {
  language: Language;
  toggleLanguage: () => void;
  t: Translation;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readLanguage(): Language {
  try {
    return localStorage.getItem(KEY) === 'ne' ? 'ne' : 'en';
  } catch {
    return 'en';
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(readLanguage);

  useEffect(() => {
    document.documentElement.lang = language === 'ne' ? 'ne' : 'en';
  }, [language]);

  const value = useMemo(() => ({
    language,
    t: translations[language],
    toggleLanguage: () => setLanguage((current) => {
      const next = current === 'en' ? 'ne' : 'en';
      try { localStorage.setItem(KEY, next); } catch { }
      return next;
    }),
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
