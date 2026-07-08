import type { Locale } from "@/types/crm";

export const currencies = [
  { code: "USD", name: "US Dollar", names: { zh: "美元", en: "US Dollar", id: "Dolar AS" }, symbol: "$", region: "United States / Export" },
  { code: "IDR", name: "Indonesian Rupiah", names: { zh: "印尼盾", en: "Indonesian Rupiah", id: "Rupiah Indonesia" }, symbol: "Rp", region: "Indonesia" },
  { code: "CNY", name: "Chinese Yuan", names: { zh: "人民币", en: "Chinese Yuan", id: "Yuan Tiongkok" }, symbol: "¥", region: "China" },
  { code: "SGD", name: "Singapore Dollar", names: { zh: "新加坡元", en: "Singapore Dollar", id: "Dolar Singapura" }, symbol: "S$", region: "Singapore" },
  { code: "MYR", name: "Malaysian Ringgit", names: { zh: "马来西亚林吉特", en: "Malaysian Ringgit", id: "Ringgit Malaysia" }, symbol: "RM", region: "Malaysia" },
  { code: "VND", name: "Vietnamese Dong", names: { zh: "越南盾", en: "Vietnamese Dong", id: "Dong Vietnam" }, symbol: "₫", region: "Vietnam" },
  { code: "THB", name: "Thai Baht", names: { zh: "泰铢", en: "Thai Baht", id: "Baht Thailand" }, symbol: "฿", region: "Thailand" },
  { code: "EUR", name: "Euro", names: { zh: "欧元", en: "Euro", id: "Euro" }, symbol: "€", region: "Europe" },
  { code: "GBP", name: "British Pound", names: { zh: "英镑", en: "British Pound", id: "Pound Inggris" }, symbol: "£", region: "United Kingdom" },
  { code: "AUD", name: "Australian Dollar", names: { zh: "澳大利亚元", en: "Australian Dollar", id: "Dolar Australia" }, symbol: "A$", region: "Australia" },
  { code: "JPY", name: "Japanese Yen", names: { zh: "日元", en: "Japanese Yen", id: "Yen Jepang" }, symbol: "¥", region: "Japan" },
  { code: "HKD", name: "Hong Kong Dollar", names: { zh: "港币", en: "Hong Kong Dollar", id: "Dolar Hong Kong" }, symbol: "HK$", region: "Hong Kong" }
] as const;

export type CurrencyCode = (typeof currencies)[number]["code"];

export const currencyCodes = currencies.map((currency) => currency.code) as [CurrencyCode, ...CurrencyCode[]];

export function isCurrencyCode(value: string): value is CurrencyCode {
  return currencyCodes.includes(value as CurrencyCode);
}

export function getCurrencyName(code: string, locale: Locale = "en") {
  const normalized = code.toUpperCase();
  const currency = currencies.find((item) => item.code === normalized);
  return currency?.names[locale] ?? currency?.name ?? normalized;
}

export function getCurrencyLabel(code: string, locale: Locale = "en") {
  const normalized = code.toUpperCase();
  const currency = currencies.find((item) => item.code === normalized);
  return currency ? `${currency.code} · ${getCurrencyName(currency.code, locale)}` : normalized;
}
