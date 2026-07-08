import { NextResponse } from "next/server";

import { getApiContext, handleApiError, isApiError, type ApiContext } from "@/lib/api";
import { canDelete } from "@/lib/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { customerSchema } from "@/lib/validations";

type Context = { params: Promise<{ id: string }> };

export async function GET(_: Request, contextParams: Context) {
  const context = await getApiContext();
  if (isApiError(context)) return context;

  try {
    const { id } = await contextParams.params;
    const { data, error } = await context.supabase.from("customers").select("*").eq("id", id).is("deleted_at", null).single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, contextParams: Context) {
  try {
    const { id } = await contextParams.params;
    const payload = customerSchema.partial().parse(await request.json());
    const context = await getApiContext();
    if (isApiError(context)) return context;

    const { data, error } = await context.supabase.from("customers").update(payload).eq("id", id).select().single();
    if (error) throw error;

    const { error: activityError } = await context.supabase.from("activities").insert({
      actor_id: context.profile.id,
      customer_id: id,
      type: "customer_updated",
      title: "修改客户资料",
      description: data.company_name
    });
    if (activityError) throw activityError;

    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_: Request, contextParams: Context) {
  const context = await getApiContext();
  if (isApiError(context)) return context;

  try {
    const { id } = await contextParams.params;
    if (!canDelete(context.profile.role)) {
      return NextResponse.json({ error: "Only Admin, Boss, or Manager can delete customers." }, { status: 403 });
    }

    const { data: customer, error: customerError } = await context.supabase
      .from("customers")
      .select("id,company_name")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();
    if (customerError) throw customerError;
    if (!customer) return NextResponse.json({ error: "Customer not found or already deleted." }, { status: 404 });

    const supabase = createAdminClient() ?? context.supabase;
    const deleted = await softDeleteCustomerGraph(supabase, id);
    return NextResponse.json({ ok: true, data: { customer_id: id, company_name: customer.company_name, deleted } });
  } catch (error) {
    return handleApiError(error);
  }
}

async function softDeleteCustomerGraph(supabase: ApiContext["supabase"], customerId: string) {
  const deletedAt = new Date().toISOString();
  const { data: quotations, error: quotationsError } = await supabase
    .from("quotations")
    .select("id")
    .eq("customer_id", customerId)
    .is("deleted_at", null);
  if (quotationsError) throw quotationsError;

  const quotationIds = (quotations ?? []).map((quotation) => quotation.id).filter(Boolean);
  const deleted: Record<string, number> = {};

  if (quotationIds.length) {
    const { error, count } = await supabase
      .from("quotation_items")
      .update({ deleted_at: deletedAt }, { count: "exact" })
      .in("quotation_id", quotationIds)
      .is("deleted_at", null);
    if (error) throw error;
    deleted.quotation_items = count ?? 0;
  } else {
    deleted.quotation_items = 0;
  }

  for (const table of ["contacts", "followups", "quotations", "attachments", "reminders", "activities"] as const) {
    const { error, count } = await supabase
      .from(table)
      .update({ deleted_at: deletedAt }, { count: "exact" })
      .eq("customer_id", customerId)
      .is("deleted_at", null);
    if (error) throw error;
    deleted[table] = count ?? 0;
  }

  const { data: deletedCustomer, error: deleteError } = await supabase
    .from("customers")
    .update({ deleted_at: deletedAt })
    .eq("id", customerId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();
  if (deleteError) throw deleteError;
  if (!deletedCustomer) throw new Error("Customer delete did not update any row.");

  deleted.customers = 1;
  return deleted;
}
