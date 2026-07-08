export type ParsedFoamSize = {
  lengthCm: number;
  widthCm: number;
  thicknessCm: number;
  cubicMeters: number;
};

export type FoamLineCalculation = {
  size: ParsedFoamSize;
  unitPrice: number;
  quantity: number;
  amount: number;
};

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

export function calculateFoamLineAmount({
  unitPrice,
  size,
  quantity
}: {
  unitPrice: number;
  size: string | null | undefined;
  quantity: number;
}): FoamLineCalculation | null {
  const parsedSize = parseFoamSize(size);
  if (!parsedSize) return null;

  const normalizedUnitPrice = Number(unitPrice || 0);
  const normalizedQuantity = Number(quantity || 0);

  return {
    size: parsedSize,
    unitPrice: normalizedUnitPrice,
    quantity: normalizedQuantity,
    amount: roundMoney(normalizedUnitPrice * parsedSize.cubicMeters * normalizedQuantity)
  };
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
