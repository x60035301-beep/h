import { NextResponse } from "next/server";

import { getApiContext, handleApiError, isApiError } from "@/lib/api";
import { serializePurchaseOrderNotes } from "@/lib/purchase-order-meta";
import { getPurchaseOrderUnitPrice } from "@/lib/purchase-order-pricing";
import { serializeQuotationItemNotes } from "@/lib/quotation-item-meta";
import { calculateFoamLineAmount } from "@/lib/quotation-pricing";
import { makePurchaseOrderNo } from "@/lib/utils";
import { purchaseOrderSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const payload = purchaseOrderSchema.parse(await request.json());
    const total = payload.items.reduce((sum, item) => sum + getLineAmount(item), 0);
    const context = await getApiContext();
    if (isApiError(context)) return context;

    const { data: order, error } = await context.supabase
      .from("quotations")
      .insert({
        quotation_no: makePurchaseOrderNo(),
        customer_id: payload.customer_id,
        created_by: context.profile.id,
        status: payload.status,
        currency: payload.currency,
        total_amount: total,
        notes: serializePurchaseOrderNotes({
          note: payload.notes,
          deliveryAddress: payload.delivery_address,
          paymentTerms: payload.payment_terms
        }),
        valid_until: payload.valid_until || null
      })
      .select()
      .single();
    if (error) throw error;

    const { error: itemError } = await context.supabase.from("quotation_items").insert(
      payload.items.map((item) => ({
        quotation_id: order.id,
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

    await context.supabase.from("activities").insert({
      actor_id: context.profile.id,
      customer_id: payload.customer_id,
      type: "quotation_created",
      title: "新建采购单",
      description: `${order.quotation_no} ${payload.currency} ${total.toFixed(2)}`
    });

    return NextResponse.json(
      { data: { ...order, document_url: `/api/purchase-orders/${order.id}/pdf` } },
      { status: 201 }
    );
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
