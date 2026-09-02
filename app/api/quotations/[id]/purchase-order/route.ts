import { NextResponse } from "next/server";

import { getApiContext, handleApiError, isApiError } from "@/lib/api";
import { serializePurchaseOrderNotes } from "@/lib/purchase-order-meta";
import { getPurchaseOrderUnitPrice } from "@/lib/purchase-order-pricing";
import { parseQuotationItemNotes } from "@/lib/quotation-item-meta";
import { calculateFoamLineAmount } from "@/lib/quotation-pricing";
import { makePurchaseOrderNo } from "@/lib/utils";

type Context = { params: Promise<{ id: string }> };

export async function POST(_: Request, contextParams: Context) {
  try {
    const { id } = await contextParams.params;
    const context = await getApiContext();
    if (isApiError(context)) return context;

    const { data: quotation, error } = await context.supabase
      .from("quotations")
      .select("*")
      .eq("id", id)
      .not("quotation_no", "like", "PO-%")
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw error;
    if (!quotation) return NextResponse.json({ error: "Quotation not found." }, { status: 404 });

    const { data: items, error: itemsError } = await context.supabase
      .from("quotation_items")
      .select("product_id,product_name,quantity,unit_price,amount,notes")
      .eq("quotation_id", id)
      .is("deleted_at", null)
      .order("created_at", { ascending: true });
    if (itemsError) throw itemsError;
    if (!items?.length) return NextResponse.json({ error: "Quotation has no items." }, { status: 400 });

    const pricedItems = items.map((item) => {
      const meta = parseQuotationItemNotes(item.notes);
      const unitPrice = getPurchaseOrderUnitPrice(meta.density, item.unit_price);
      const amount = calculateFoamLineAmount({ unitPrice, size: meta.size, quantity: item.quantity })?.amount ?? 0;
      return { ...item, unit_price: unitPrice, amount };
    });
    const total = pricedItems.reduce((sum, item) => sum + item.amount, 0);

    const { data: order, error: orderError } = await context.supabase
      .from("quotations")
      .insert({
        quotation_no: makePurchaseOrderNo(),
        customer_id: quotation.customer_id,
        created_by: context.profile.id,
        status: "draft",
        currency: quotation.currency,
        total_amount: total,
        notes: serializePurchaseOrderNotes({ note: quotation.notes }),
        valid_until: quotation.valid_until
      })
      .select()
      .single();
    if (orderError) throw orderError;

    const { error: itemInsertError } = await context.supabase.from("quotation_items").insert(
      pricedItems.map((item) => ({ ...item, quotation_id: order.id }))
    );
    if (itemInsertError) throw itemInsertError;

    await context.supabase.from("activities").insert({
      actor_id: context.profile.id,
      customer_id: quotation.customer_id,
      type: "quotation_created",
      title: "生成采购单",
      description: `${order.quotation_no} from ${quotation.quotation_no}`
    });

    return NextResponse.json(
      { data: { ...order, document_url: `/api/purchase-orders/${order.id}/pdf` } },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
