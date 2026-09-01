'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { i18nConfig, type Locale } from '@/lib/i18n/config';

const LOCALES: Locale[] = [...i18nConfig.locales];
const DEFAULT_LOCALE: Locale = i18nConfig.defaultLocale;

// Lazy-load translation dictionaries to keep client bundle small
const dictionaries: Record<Locale, () => Record<string, string>> = {
  en: () => require('@/lib/i18n/en').default,
  zh: () => require('@/lib/i18n/zh').default,
};

interface LocaleContextValue {
  locale: Locale;
  locales: readonly Locale[];
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

const STORAGE_KEY = 'fubao-locale';

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // Restore persisted locale on mount (client only, avoids hydration mismatch)
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && LOCALES.includes(saved as Locale)) {
        setLocaleState(saved as Locale);
      }
    } catch {
      // localStorage unavailable — keep default
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.lang = next;
    } catch {
      // ignore persistence errors
    }
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    let text = dictionaries[locale]()[key] ?? dictionaries[DEFAULT_LOCALE]()[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return text;
  }, [locale]);

  const value = useMemo(
    () => ({ locale, locales: LOCALES, setLocale, t }),
    [locale, setLocale, t],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return ctx;
}
