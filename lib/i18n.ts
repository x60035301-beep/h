import type { Locale } from "@/types/crm";

export const locales = ["en", "zh", "id"] as const;
export const defaultLocale = (process.env.NEXT_PUBLIC_DEFAULT_LOCALE as Locale) || "zh";

export function isLocale(value: string | undefined): value is Locale {
  return !!value && locales.includes(value as Locale);
}

export function withLocale(path: string, locale: Locale) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${normalized}`;
}

export function stripLocale(pathname: string) {
  const [, possibleLocale, ...rest] = pathname.split("/");
  if (isLocale(possibleLocale)) {
    return `/${rest.join("/")}`;
  }
  return pathname;
}
