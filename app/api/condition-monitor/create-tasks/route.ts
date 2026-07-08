import { NextResponse } from "next/server";
import { z } from "zod";

import { getApiContext, handleApiError, isApiError } from "@/lib/api";

const conditionTaskSchema = z.object({
  rule: z.enum(["no-contact-3d", "no-quote-7d"]),
  customers: z
    .array(
      z.object({
        customer_id: z.string().uuid(),
        title: z.string().min(1)
      })
    )
    .min(1)
    .max(200)
});

export async function POST(request: Request) {
  try {
    const payload = conditionTaskSchema.parse(await request.json());
    const context = await getApiContext();
    if (isApiError(context)) return context;

    const dueAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await context.supabase
      .from("reminders")
      .insert(
        payload.customers.map((customer) => ({
          customer_id: customer.customer_id,
          assigned_to: context.profile.id,
          title: customer.title,
          type: payload.rule === "no-quote-7d" ? ("quotation" as const) : ("followup" as const),
          due_at: dueAt
        }))
      )
      .select("id");
    if (error) throw error;

    const { error: activityError } = await context.supabase.from("activities").insert(
      payload.customers.map((customer) => ({
        actor_id: context.profile.id,
        customer_id: customer.customer_id,
        type: "task_created" as const,
        title: "条件监控创建提醒",
        description: customer.title,
        metadata: {
          rule: payload.rule
        }
      }))
    );
    if (activityError) throw activityError;

    return NextResponse.json({
      data: {
        rule: payload.rule,
        created: payload.customers.length,
        reminder_ids: (data ?? []).map((item) => item.id),
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
