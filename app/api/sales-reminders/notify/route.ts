import { NextResponse } from "next/server";
import { z } from "zod";

import { getApiContext, handleApiError, isApiError } from "@/lib/api";

const salesReminderSchema = z.object({
  reminders: z
    .array(
      z.object({
        customer_id: z.string().uuid(),
        customer_name: z.string().min(1),
        sales_id: z.string().uuid(),
        sales_name: z.string().min(1),
        message: z.string().min(5)
      })
    )
    .min(1)
    .max(200)
});

export async function POST(request: Request) {
  try {
    const payload = salesReminderSchema.parse(await request.json());
    const context = await getApiContext();
    if (isApiError(context)) return context;

    const now = new Date().toISOString();
    const reminderRows = payload.reminders.map((reminder) => ({
      customer_id: reminder.customer_id,
      assigned_to: reminder.sales_id,
      title: reminder.message,
      type: "followup" as const,
      due_at: now
    }));

    const { data, error } = await context.supabase.from("reminders").insert(reminderRows).select("id");
    if (error) throw error;

    const activities = payload.reminders.map((reminder) => ({
      actor_id: context.profile.id,
      customer_id: reminder.customer_id,
      type: "reminder_sent" as const,
      title: "提醒销售",
      description: `已发送给 ${reminder.sales_name}: ${reminder.message}`,
      metadata: {
        sales_id: reminder.sales_id,
        sales_name: reminder.sales_name
      }
    }));
    const { error: activityError } = await context.supabase.from("activities").insert(activities);
    if (activityError) throw activityError;

    return NextResponse.json({
      data: {
        notified: payload.reminders.length,
        reminder_ids: (data ?? []).map((item) => item.id),
        recipients: Array.from(new Set(payload.reminders.map((reminder) => reminder.sales_name))),
        customers: payload.reminders.map((reminder) => reminder.customer_name),
        notified_at: now
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
