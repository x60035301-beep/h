const purchaseOrderDensityPrices: Record<number, number> = {
  12: 700000,
  14: 785000,
  16: 880000,
  18: 980000,
  20: 1080000,
  22: 1160000,
  24: 1250000,
  26: 1295000,
  28: 1340000,
  30: 1385000
};

export function getPurchaseOrderDensityPrice(density: string | null | undefined) {
  const value = `${density ?? ""}`.match(/\d+(?:\.\d+)?/)?.[0];
  if (!value) return null;

  const price = purchaseOrderDensityPrices[Number(value)];
  return price === undefined ? null : price;
}

export function getPurchaseOrderUnitPrice(density: string | null | undefined, manualPrice: number) {
  return getPurchaseOrderDensityPrice(density) ?? Number(manualPrice || 0);
}
