import { NextResponse } from "next/server";

import { getApiContext, handleApiError, isApiError } from "@/lib/api";
import { serializePurchaseOrderNotes } from "@/lib/purchase-order-meta";
import { getPurchaseOrderUnitPrice } from "@/lib/purchase-order-pricing";
import { serializeQuotationItemNotes } from "@/lib/quotation-item-meta";
import { calculateFoamLineAmount } from "@/lib/quotation-pricing";
import { purchaseOrderSchema } from "@/lib/validations";

type Context = { params: Promise<{ id: string }> };

export async function GET(_: Request, contextParams: Context) {
  const context = await getApiContext();
  if (isApiError(context)) return context;

  try {
    const { id } = await contextParams.params;
    const { data: order, error } = await context.supabase
      .from("quotations")
      .select("*")
      .eq("id", id)
      .like("quotation_no", "PO-%")
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw error;
    if (!order) return NextResponse.json({ error: "Purchase order not found." }, { status: 404 });

    const { data: items, error: itemsError } = await context.supabase
      .from("quotation_items")
      .select("*")
      .eq("quotation_id", id)
      .is("deleted_at", null)
      .order("created_at", { ascending: true });
    if (itemsError) throw itemsError;
    return NextResponse.json({ data: { order, items: items ?? [] } });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, contextParams: Context) {
  try {
    const { id } = await contextParams.params;
    const payload = purchaseOrderSchema.parse(await request.json());
    const total = payload.items.reduce((sum, item) => sum + getLineAmount(item), 0);
    const context = await getApiContext();
    if (isApiError(context)) return context;

    const now = new Date().toISOString();
    const { data: order, error } = await context.supabase
      .from("quotations")
      .update({
        customer_id: payload.customer_id,
        status: payload.status,
        currency: payload.currency,
        total_amount: total,
        notes: serializePurchaseOrderNotes({
          note: payload.notes,
          deliveryAddress: payload.delivery_address,
          paymentTerms: payload.payment_terms
        }),
        valid_until: payload.valid_until || null,
        updated_at: now
      })
      .eq("id", id)
      .like("quotation_no", "PO-%")
      .is("deleted_at", null)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!order) return NextResponse.json({ error: "Purchase order not found." }, { status: 404 });

    const { error: deleteItemsError } = await context.supabase
      .from("quotation_items")
      .update({ deleted_at: now, updated_at: now })
      .eq("quotation_id", id)
      .is("deleted_at", null);
    if (deleteItemsError) throw deleteItemsError;

    const { error: itemError } = await context.supabase.from("quotation_items").insert(
      payload.items.map((item) => ({
        quotation_id: id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: getPurchaseOrderUnitPrice(item.density, item.unit_price),
        amount: getLineAmount(item),
        notes: serializeQuotationItemNotes({
          density: item.density,
          specification: item.specification,
          size: item.size,
          note: item.notes
        })
      }))
    );
    if (itemError) throw itemError;
    return NextResponse.json({ data: order });
  } catch (error) {
    return handleApiError(error);
  }
}

function getLineAmount(item: { unit_price: number; density?: string | null; size?: string | null; quantity: number }) {
  return calculateFoamLineAmount({
    unitPrice: getPurchaseOrderUnitPrice(item.density, item.unit_price),
    size: item.size,
    quantity: item.quantity
  })?.amount ?? 0;
}
