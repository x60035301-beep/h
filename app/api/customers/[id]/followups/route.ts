import { NextResponse } from "next/server";

import { getApiContext, handleApiError, isApiError } from "@/lib/api";
import { followupSchema } from "@/lib/validations";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, contextParams: Context) {
  try {
    const { id } = await contextParams.params;
    const body = await request.json();
    const payload = followupSchema.parse({
      ...body,
      customer_id: id,
      followed_at: body.followed_at ?? new Date().toISOString(),
      next_step: body.next_step ?? body.next_plan ?? null
    });
    const context = await getApiContext();
    if (isApiError(context)) return context;

    const { data, error } = await context.supabase
      .from("followups")
      .insert({ ...payload, created_by: context.profile.id })
      .select()
      .single();
    if (error) throw error;

    const { error: customerError } = await context.supabase.from("customers").update({ last_contacted_at: payload.followed_at }).eq("id", id);
    if (customerError) throw customerError;

    const { error: activityError } = await context.supabase.from("activities").insert({
      actor_id: context.profile.id,
      customer_id: id,
      type: "followup_created",
      title: "新增跟进记录",
      description: payload.content.slice(0, 120)
    });
    if (activityError) throw activityError;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
