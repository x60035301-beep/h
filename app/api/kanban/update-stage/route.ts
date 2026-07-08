import { NextResponse } from "next/server";

import { customerStages } from "@/config/crm";
import { getApiContext, handleApiError, isApiError } from "@/lib/api";
import { stageUpdateSchema } from "@/lib/validations";
import type { CustomerStage } from "@/types/crm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = stageUpdateSchema.parse({
      customer_id: body.customer_id ?? body.id,
      stage: normalizeStage(body.stage)
    });
    const context = await getApiContext();
    if (isApiError(context)) return context;

    const { data, error } = await context.supabase
      .from("customers")
      .update({ stage: payload.stage })
      .eq("id", payload.customer_id)
      .select("id,company_name,stage")
      .single();
    if (error) throw error;

    const stageLabel = customerStages.find((stage) => stage.value === payload.stage)?.label ?? payload.stage;
    const { error: activityError } = await context.supabase.from("activities").insert({
      actor_id: context.profile.id,
      customer_id: payload.customer_id,
      type: "stage_changed",
      title: "客户阶段更新",
      description: `${data.company_name} -> ${stageLabel}`
    });
    if (activityError) throw activityError;

    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

function normalizeStage(value: unknown): CustomerStage | unknown {
  const stage = String(value ?? "").trim().toLowerCase().replace(/\s+/g, "_");
  const aliases: Partial<Record<string, CustomerStage>> = {
    lead: "new_inquiry",
    inquiry: "new_inquiry",
    new: "new_inquiry",
    quotation: "quoted",
    quote: "quoted",
    sample: "sampling",
    completed: "won",
    complete: "won",
    closed: "won"
  };

  return aliases[stage] ?? stage;
}
