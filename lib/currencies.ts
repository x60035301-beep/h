export const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$", region: "United States / Export" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", region: "Indonesia" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", region: "China" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", region: "Singapore" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", region: "Malaysia" },
  { code: "VND", name: "Vietnamese Dong", symbol: "₫", region: "Vietnam" },
  { code: "THB", name: "Thai Baht", symbol: "฿", region: "Thailand" },
  { code: "EUR", name: "Euro", symbol: "€", region: "Europe" },
  { code: "GBP", name: "British Pound", symbol: "£", region: "United Kingdom" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", region: "Australia" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", region: "Japan" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", region: "Hong Kong" }
] as const;

export type CurrencyCode = (typeof currencies)[number]["code"];

export const currencyCodes = currencies.map((currency) => currency.code) as [CurrencyCode, ...CurrencyCode[]];

export function isCurrencyCode(value: string): value is CurrencyCode {
  return currencyCodes.includes(value as CurrencyCode);
}

export function getCurrencyLabel(code: string) {
  const normalized = code.toUpperCase();
  const currency = currencies.find((item) => item.code === normalized);
  return currency ? `${currency.code} · ${currency.name}` : normalized;
}
