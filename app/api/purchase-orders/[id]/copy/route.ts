import { NextResponse } from "next/server";

import { getApiContext, handleApiError, isApiError } from "@/lib/api";
import { makePurchaseOrderNo } from "@/lib/utils";

type Context = { params: Promise<{ id: string }> };

export async function POST(_: Request, contextParams: Context) {
  const context = await getApiContext();
  if (isApiError(context)) return context;

  try {
    const { id } = await contextParams.params;
    const { data: order, error } = await context.supabase
      .from("quotations")
      .select("*")
      .eq("id", id)
      .like("quotation_no", "PO-%")
      .single();
    if (error) throw error;

    const { data: items, error: itemsError } = await context.supabase
      .from("quotation_items")
      .select("*")
      .eq("quotation_id", id)
      .is("deleted_at", null);
    if (itemsError) throw itemsError;

    const { data: copy, error: copyError } = await context.supabase
      .from("quotations")
      .insert({
        quotation_no: makePurchaseOrderNo(),
        customer_id: order.customer_id,
        created_by: context.profile.id,
        status: "draft",
        currency: order.currency,
        total_amount: order.total_amount,
        notes: order.notes,
        valid_until: order.valid_until
      })
      .select()
      .single();
    if (copyError) throw copyError;

    if (items?.length) {
      const { error: itemCopyError } = await context.supabase.from("quotation_items").insert(
        items.map((item) => ({
          quotation_id: copy.id,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          amount: item.amount,
          notes: item.notes
        }))
      );
      if (itemCopyError) throw itemCopyError;
    }

    return NextResponse.json({ data: copy }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
