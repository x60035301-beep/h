const baseDensity = 12;
const basePrice = 700000;
const priceStep = 45000;
const maxDensity = 30;

export function getPurchaseOrderDensityPrice(density: string | null | undefined) {
  const value = `${density ?? ""}`.match(/\d+(?:\.\d+)?/)?.[0];
  if (!value) return null;

  const densityValue = Number(value);
  if (!Number.isInteger(densityValue) || densityValue < baseDensity || densityValue > maxDensity) return null;

  return basePrice + (densityValue - baseDensity) * priceStep;
}

export function getPurchaseOrderUnitPrice(density: string | null | undefined, manualPrice: number) {
  return getPurchaseOrderDensityPrice(density) ?? Number(manualPrice || 0);
}
