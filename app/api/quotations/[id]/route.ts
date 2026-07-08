import { NextResponse } from "next/server";

import { getApiContext, handleApiError, isApiError } from "@/lib/api";
import { quotationSchema } from "@/lib/validations";

type Context = { params: Promise<{ id: string }> };

export async function GET(_: Request, contextParams: Context) {
  const context = await getApiContext();
  if (isApiError(context)) return context;

  try {
    const { id } = await contextParams.params;
    const { data: quotation, error } = await context.supabase
      .from("quotations")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw error;
    if (!quotation) return NextResponse.json({ error: "Quotation not found." }, { status: 404 });

    const { data: items, error: itemsError } = await context.supabase
      .from("quotation_items")
      .select("*")
      .eq("quotation_id", id)
      .is("deleted_at", null)
      .order("created_at", { ascending: true });
    if (itemsError) throw itemsError;

    return NextResponse.json({ data: { quotation, items: items ?? [] } });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, contextParams: Context) {
  try {
    const { id } = await contextParams.params;
    const payload = quotationSchema.parse(await request.json());
    const total = payload.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const context = await getApiContext();
    if (isApiError(context)) return context;

    const now = new Date().toISOString();
    const { data: quotation, error } = await context.supabase
      .from("quotations")
      .update({
        customer_id: payload.customer_id,
        status: payload.status,
        currency: payload.currency,
        total_amount: total,
        notes: payload.notes,
        valid_until: payload.valid_until || null,
        updated_at: now
      })
      .eq("id", id)
      .is("deleted_at", null)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!quotation) return NextResponse.json({ error: "Quotation not found." }, { status: 404 });

    const { error: deleteItemsError } = await context.supabase
      .from("quotation_items")
      .update({ deleted_at: now, updated_at: now })
      .eq("quotation_id", id)
      .is("deleted_at", null);
    if (deleteItemsError) throw deleteItemsError;

    const items = payload.items.map((item) => ({
      quotation_id: id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      amount: item.quantity * item.unit_price,
      notes: item.notes
    }));

    const { error: itemError } = await context.supabase.from("quotation_items").insert(items);
    if (itemError) throw itemError;

    const { error: activityError } = await context.supabase.from("activities").insert({
      actor_id: context.profile.id,
      customer_id: payload.customer_id,
      type: "quotation_created",
      title: "更新报价",
      description: `${quotation.quotation_no} ${payload.currency} ${total.toFixed(2)}`
    });
    if (activityError) throw activityError;

    return NextResponse.json({ data: quotation });
  } catch (error) {
    return handleApiError(error);
  }
}
