import { NextResponse } from "next/server";
import { z } from "zod";

import { getApiContext, handleApiError, isApiError } from "@/lib/api";

const escalationSchema = z.object({
  escalations: z
    .array(
      z.object({
        customer_id: z.string().uuid(),
        manager_id: z.string().uuid(),
        manager_name: z.string().min(1),
        reason: z.string().min(1)
      })
    )
    .min(1)
    .max(100)
});

export async function POST(request: Request) {
  try {
    const payload = escalationSchema.parse(await request.json());
    const context = await getApiContext();
    if (isApiError(context)) return context;

    const dueAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const { data, error } = await context.supabase
      .from("reminders")
      .insert(
        payload.escalations.map((item) => ({
          customer_id: item.customer_id,
          assigned_to: item.manager_id,
          title: `Manager escalation: ${item.reason}`,
          type: "followup" as const,
          due_at: dueAt
        }))
      )
      .select("id");
    if (error) throw error;

    const { error: activityError } = await context.supabase.from("activities").insert(
      payload.escalations.map((item) => ({
        actor_id: context.profile.id,
        customer_id: item.customer_id,
        type: "manager_escalated" as const,
        title: "经理升级提醒",
        description: `已通知 ${item.manager_name}: ${item.reason}`,
        metadata: {
          manager_id: item.manager_id,
          manager_name: item.manager_name,
          reason: item.reason
        }
      }))
    );
    if (activityError) throw activityError;

    return NextResponse.json({
      data: {
        notified: payload.escalations.length,
        reminder_ids: (data ?? []).map((item) => item.id),
        notified_at: new Date().toISOString()
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
