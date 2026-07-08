import { NextResponse } from "next/server";

import { getApiContext, handleApiError, isApiError } from "@/lib/api";
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
    const { error } = await context.supabase.from("customers").update({ deleted_at: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
