import { NextResponse } from "next/server";

import { getApiContext, handleApiError, isApiError } from "@/lib/api";
import { makeQuotationNo } from "@/lib/utils";
import { quotationSchema } from "@/lib/validations";

export async function GET() {
  const context = await getApiContext();
  if (isApiError(context)) return context;

  try {
    const { data, error } = await context.supabase.from("quotations").select("*").is("deleted_at", null).order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = quotationSchema.parse(await request.json());
    const total = payload.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const context = await getApiContext();
    if (isApiError(context)) return context;

    const { data: quotation, error } = await context.supabase
      .from("quotations")
      .insert({
        quotation_no: makeQuotationNo(),
        customer_id: payload.customer_id,
        created_by: context.profile.id,
        status: payload.status,
        currency: payload.currency,
        total_amount: total,
        notes: payload.notes,
        valid_until: payload.valid_until || null
      })
      .select()
      .single();
    if (error) throw error;

    const items = payload.items.map((item) => ({
      quotation_id: quotation.id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      amount: item.quantity * item.unit_price,
      notes: item.notes
    }));
    const { error: itemError } = await context.supabase.from("quotation_items").insert(items);
    if (itemError) throw itemError;

    const { error: customerError } = await context.supabase.from("customers").update({ stage: "quoted" }).eq("id", payload.customer_id);
    if (customerError) throw customerError;

    const { error: activityError } = await context.supabase.from("activities").insert({
      actor_id: context.profile.id,
      customer_id: payload.customer_id,
      type: "quotation_created",
      title: "新建报价",
      description: `${quotation.quotation_no} ${payload.currency} ${total.toFixed(2)}`
    });
    if (activityError) throw activityError;

    return NextResponse.json({ data: { ...quotation, document_url: `/api/quotations/${quotation.id}/pdf` } }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
