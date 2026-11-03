export const locales = ["pt-BR", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "pt-BR";

export const LOCALE_COOKIE = "locale";

export const localeLabels: Record<Locale, string> = {
  "pt-BR": "PT",
  en: "EN",
};

export function resolveLocale(value: string | null | undefined): Locale {
  return locales.find((locale) => locale === value) ?? defaultLocale;
}

export function getLocaleFromCookieHeader(cookieHeader: string | null): Locale {
  const match = cookieHeader?.match(new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]+)`));
  return resolveLocale(match?.[1]);
}
