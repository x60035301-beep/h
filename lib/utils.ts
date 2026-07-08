import { clsx, type ClassValue } from "clsx";
import { format, formatDistanceToNow } from "date-fns";
import { enUS, id as idLocale, zhCN, type Locale as DateFnsLocale } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

import type { Locale } from "@/types/crm";

const dateLocales: Record<Locale, DateFnsLocale> = {
  en: enUS,
  zh: zhCN,
  id: idLocale
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = "USD") {
  const normalizedCurrency = currency.toUpperCase();

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: normalizedCurrency,
      maximumFractionDigits: 2
    }).format(value);
  } catch {
    return `${normalizedCurrency} ${Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  }
}

export function formatDate(date: string | Date | null | undefined, pattern = "yyyy-MM-dd HH:mm", locale: Locale = "zh") {
  if (!date) return "-";
  return format(new Date(date), pattern, { locale: dateLocales[locale] });
}

export function timeAgo(date: string | Date | null | undefined, locale: Locale = "zh") {
  if (!date) return "-";
  return formatDistanceToNow(new Date(date), { locale: dateLocales[locale], addSuffix: true });
}

export function getInitials(name?: string | null) {
  if (!name) return "H";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function absoluteUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${baseUrl.replace(/\/$/, "")}${path}`;
}

export function makeQuotationNo(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `HOMY-${y}${m}${d}-${suffix}`;
}
