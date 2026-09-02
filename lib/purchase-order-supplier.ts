export const defaultPurchaseOrderSupplier = {
  name: "PT. GOLD EAGLE FOAM INDUSTRY",
  location: "CIKANDE"
} as const;

export function getPurchaseOrderSupplier(metadata: unknown) {
  const values = isRecord(metadata) ? metadata : {};
  return {
    name: readText(values.purchase_order_supplier_name) || defaultPurchaseOrderSupplier.name,
    location: readText(values.purchase_order_supplier_location) || defaultPurchaseOrderSupplier.location
  };
}

function readText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
