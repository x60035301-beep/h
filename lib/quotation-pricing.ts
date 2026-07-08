import type { CurrencyCode } from "@/lib/currencies";

export const densityPriceIdrPerCubic: Record<number, number> = {
  10: 595000,
  12: 673000,
  14: 773000,
  16: 862000,
  18: 963000,
  19: 1007000,
  20: 1061000,
  22: 1139000,
  23: 1181000,
  24: 1216000,
  26: 1277000,
  30: 1507000,
  32: 1606000
};

export const densityProcessingFactor = 1.2;

const idrPerCurrency: Record<CurrencyCode, number> = {
  IDR: 1,
  USD: 16200,
  CNY: 2230,
  SGD: 12600,
  MYR: 3450,
  VND: 0.62,
  THB: 500,
  EUR: 17500,
  GBP: 20200,
  AUD: 10600,
  JPY: 110,
  HKD: 2070
};

export type ParsedFoamSize = {
  lengthCm: number;
  widthCm: number;
  thicknessCm: number;
  cubicMeters: number;
};

export type DensityPriceResult = {
  source: "density";
  density: number;
  size: ParsedFoamSize;
  basePriceIdrPerCubic: number;
  processingFactor: number;
  unitPrice: number;
  unitPriceIdr: number;
};

export function parseDensityValue(value: string | null | undefined) {
  const match = `${value ?? ""}`.match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : null;
}

export function parseFoamSize(value: string | null | undefined): ParsedFoamSize | null {
  const numbers = `${value ?? ""}`
    .replace(/,/g, ".")
    .match(/\d+(?:\.\d+)?/g)
    ?.map(Number)
    .filter((item) => Number.isFinite(item) && item > 0);

  if (!numbers || numbers.length < 3) return null;

  const [lengthCm, widthCm, thicknessCm] = numbers;
  const cubicMeters = (lengthCm * widthCm * thicknessCm) / 1_000_000;

  return { lengthCm, widthCm, thicknessCm, cubicMeters };
}

export function calculateDensityUnitPrice({
  density,
  size,
  currency
}: {
  density: string | null | undefined;
  size: string | null | undefined;
  currency: string;
}): DensityPriceResult | null {
  const densityNumber = parseDensityValue(density);
  if (!densityNumber) return null;

  const basePriceIdrPerCubic = densityPriceIdrPerCubic[densityNumber];
  if (!basePriceIdrPerCubic) return null;

  const parsedSize = parseFoamSize(size);
  if (!parsedSize) return null;

  const normalizedCurrency = normalizeCurrency(currency);
  const unitPriceIdr = basePriceIdrPerCubic * parsedSize.cubicMeters * densityProcessingFactor;
  const unitPrice = unitPriceIdr / idrPerCurrency[normalizedCurrency];

  return {
    source: "density",
    density: densityNumber,
    size: parsedSize,
    basePriceIdrPerCubic,
    processingFactor: densityProcessingFactor,
    unitPrice: roundMoney(unitPrice),
    unitPriceIdr: roundMoney(unitPriceIdr)
  };
}

export function convertIdrToCurrency(amountIdr: number, currency: string) {
  return amountIdr / idrPerCurrency[normalizeCurrency(currency)];
}

function normalizeCurrency(currency: string): CurrencyCode {
  const normalized = currency.toUpperCase() as CurrencyCode;
  return normalized in idrPerCurrency ? normalized : "USD";
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
