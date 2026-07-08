import { NextResponse } from "next/server";
import { z } from "zod";

import { getApiContext, handleApiError, isApiError } from "@/lib/api";

const taskSchema = z.object({
  customer_id: z.string().uuid(),
  customer_name: z.string().min(1),
  title: z.string().trim().min(2),
  assignee_id: z.string().uuid().optional().nullable(),
  assignee: z.string().trim().min(1),
  priority: z.enum(["low", "medium", "high"]),
  channel: z.enum(["whatsapp", "phone", "email", "meeting"]),
  due_at: z.string().min(1),
  next_step: z.string().trim().min(2),
  status: z.enum(["todo", "in_progress", "done"]).default("todo")
});

export async function POST(request: Request) {
  try {
    const payload = taskSchema.parse(await request.json());
    const context = await getApiContext();
    if (isApiError(context)) return context;

    const assignedTo = payload.assignee_id ?? context.profile.id;
    const { data, error } = await context.supabase
      .from("reminders")
      .insert({
        customer_id: payload.customer_id,
        assigned_to: assignedTo,
        title: payload.title,
        type: "followup",
        due_at: new Date(payload.due_at).toISOString(),
        is_done: payload.status === "done"
      })
      .select()
      .single();
    if (error) throw error;

    const { error: followupError } = await context.supabase.from("followups").insert({
      customer_id: payload.customer_id,
      created_by: context.profile.id,
      method: payload.channel,
      followed_at: new Date().toISOString(),
      content: payload.title,
      next_step: payload.next_step
    });
    if (followupError) throw followupError;

    const { error: activityError } = await context.supabase.from("activities").insert({
      actor_id: context.profile.id,
      customer_id: payload.customer_id,
      type: "task_created",
      title: "创建跟进任务",
      description: `${payload.assignee}: ${payload.title}`,
      metadata: {
        assignee_id: assignedTo,
        assignee: payload.assignee,
        priority: payload.priority,
        channel: payload.channel,
        next_step: payload.next_step
      }
    });
    if (activityError) throw activityError;

    return NextResponse.json(
      {
        data: {
          id: data.id,
          ...payload,
          assignee_id: assignedTo,
          created_at: data.created_at
        }
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
