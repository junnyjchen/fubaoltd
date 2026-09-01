import en from "./en";
import zh from "./zh";
import type { Locale } from "./config";

const translations: Record<Locale, Record<string, string>> = {
  en,
  zh,
};

export function t(key: string, locale: Locale = "en"): string {
  return translations[locale]?.[key] || translations.en[key] || key;
}

export function getTranslations(locale: Locale = "en") {
  return {
    t: (key: string) => t(key, locale),
    locale,
  };
}
