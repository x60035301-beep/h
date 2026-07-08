import { NextResponse } from "next/server";
import { z } from "zod";

import { getApiContext, handleApiError, isApiError } from "@/lib/api";
import { makeOrderId } from "@/lib/order-records";

const createOrderSchema = z.object({
  quotation_id: z.string().uuid()
});

export async function POST(request: Request) {
  try {
    const payload = createOrderSchema.parse(await request.json());
    const context = await getApiContext();
    if (isApiError(context)) return context;

    const { data: quotation, error } = await context.supabase
      .from("quotations")
      .select("id,quotation_no,customer_id,status,currency,total_amount")
      .eq("id", payload.quotation_id)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw error;
    if (!quotation) return NextResponse.json({ error: "Quotation not found." }, { status: 404 });
    if (quotation.status === "rejected" || quotation.status === "expired") {
      return NextResponse.json({ error: "Rejected or expired quotations cannot be converted to orders." }, { status: 400 });
    }

    const now = new Date().toISOString();
    const { data: updatedQuotation, error: updateError } = await context.supabase
      .from("quotations")
      .update({ status: "accepted", updated_at: now })
      .eq("id", quotation.id)
      .is("deleted_at", null)
      .select("id,quotation_no,customer_id,status,currency,total_amount")
      .maybeSingle();
    if (updateError) throw updateError;
    if (!updatedQuotation) return NextResponse.json({ error: "Quotation could not be converted." }, { status: 500 });

    const { error: customerError } = await context.supabase
      .from("customers")
      .update({ stage: "won", updated_at: now })
      .eq("id", quotation.customer_id)
      .is("deleted_at", null);
    if (customerError) throw customerError;

    const orderId = makeOrderId(updatedQuotation.quotation_no);
    const { error: activityError } = await context.supabase.from("activities").insert({
      actor_id: context.profile.id,
      customer_id: quotation.customer_id,
      type: "workflow_run",
      title: "创建订单",
      description: `${orderId} from ${updatedQuotation.quotation_no}`
    });
    if (activityError) throw activityError;

    return NextResponse.json({
      data: {
        order_id: orderId,
        quotation_id: updatedQuotation.id,
        quotation_no: updatedQuotation.quotation_no
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
