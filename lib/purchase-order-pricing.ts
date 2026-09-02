const basePrices: Record<number, number> = {
  12: 700000,
  14: 785000,
  16: 880000,
  18: 980000,
  20: 1080000,
  22: 1160000,
  24: 1250000
};
const extensionStartDensity = 24;
const extensionStep = 45000;
const maxDensity = 30;

export function getPurchaseOrderDensityPrice(density: string | null | undefined) {
  const value = `${density ?? ""}`.match(/\d+(?:\.\d+)?/)?.[0];
  if (!value) return null;

  const densityValue = Number(value);
  if (!Number.isInteger(densityValue) || densityValue > maxDensity) return null;

  if (basePrices[densityValue] !== undefined) return basePrices[densityValue];
  if (densityValue <= extensionStartDensity) return null;

  return basePrices[extensionStartDensity] + (densityValue - extensionStartDensity) * extensionStep;
}

export function getPurchaseOrderUnitPrice(density: string | null | undefined, manualPrice: number) {
  return getPurchaseOrderDensityPrice(density) ?? Number(manualPrice || 0);
}
