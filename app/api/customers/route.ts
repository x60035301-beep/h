import { NextResponse } from "next/server";

import { getApiContext, handleApiError, isApiError } from "@/lib/api";
import { canManageAll } from "@/lib/permissions";
import { customerSchema } from "@/lib/validations";

export async function GET() {
  const context = await getApiContext();
  if (isApiError(context)) return context;

  try {
    let query = context.supabase.from("customers").select("*").is("deleted_at", null).order("updated_at", { ascending: false });
    if (!canManageAll(context.profile.role)) query = query.eq("owner_id", context.profile.id);
    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = customerSchema.parse(await request.json());
    const context = await getApiContext();
    if (isApiError(context)) return context;

    const { data, error } = await context.supabase
      .from("customers")
      .insert({ ...payload, owner_id: context.profile.id })
      .select()
      .single();
    if (error) throw error;

    if (payload.contact_name) {
      const { error: contactError } = await context.supabase.from("contacts").insert({
        customer_id: data.id,
        name: payload.contact_name,
        email: payload.email || null,
        whatsapp: payload.whatsapp || null,
        is_primary: true
      });
      if (contactError) throw contactError;
    }

    const { error: activityError } = await context.supabase.from("activities").insert({
      actor_id: context.profile.id,
      customer_id: data.id,
      type: "customer_created",
      title: "新增客户",
      description: payload.company_name
    });
    if (activityError) throw activityError;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
