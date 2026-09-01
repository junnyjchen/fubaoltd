// i18n configuration
export const i18nConfig = {
  defaultLocale: "en",
  locales: ["en", "zh"],
} as const;

export type Locale = (typeof i18nConfig)["locales"][number];

export function getLocaleFromPath(pathname: string): Locale {
  const segments = pathname.split("/");
  const possibleLocale = segments[1];
  
  if (possibleLocale && i18nConfig.locales.includes(possibleLocale as Locale)) {
    return possibleLocale as Locale;
  }
  
  return i18nConfig.defaultLocale;
}

export function getLocalizedPath(path: string, locale: Locale): string {
  if (locale === i18nConfig.defaultLocale) {
    return path;
  }
  return `/${locale}${path}`;
}
