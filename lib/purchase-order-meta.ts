export type PurchaseOrderMeta = {
  note: string | null;
  deliveryAddress: string | null;
  paymentTerms: string | null;
};

const prefix = "__HOMY_PURCHASE_ORDER_META__:";

export function parsePurchaseOrderNotes(notes: string | null | undefined): PurchaseOrderMeta {
  if (!notes) return emptyMeta();
  if (!notes.startsWith(prefix)) return { ...emptyMeta(), note: notes };

  try {
    const value = JSON.parse(notes.slice(prefix.length)) as Partial<PurchaseOrderMeta>;
    return {
      note: clean(value.note),
      deliveryAddress: clean(value.deliveryAddress),
      paymentTerms: clean(value.paymentTerms)
    };
  } catch {
    return { ...emptyMeta(), note: notes };
  }
}

export function serializePurchaseOrderNotes(meta: Partial<PurchaseOrderMeta>) {
  return `${prefix}${JSON.stringify({
    note: clean(meta.note),
    deliveryAddress: clean(meta.deliveryAddress),
    paymentTerms: clean(meta.paymentTerms)
  })}`;
}

function emptyMeta(): PurchaseOrderMeta {
  return { note: null, deliveryAddress: null, paymentTerms: null };
}

function clean(value: string | null | undefined) {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text || null;
}
