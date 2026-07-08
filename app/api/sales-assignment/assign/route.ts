import { NextResponse } from "next/server";
import { z } from "zod";

import { getApiContext, handleApiError, isApiError } from "@/lib/api";

const assignmentSchema = z.object({
  assignments: z
    .array(
      z.object({
        customer_id: z.string().uuid(),
        sales_id: z.string().uuid(),
        sales_name: z.string().min(1)
      })
    )
    .min(1)
    .max(200)
});

export async function POST(request: Request) {
  try {
    const payload = assignmentSchema.parse(await request.json());
    const context = await getApiContext();
    if (isApiError(context)) return context;

    const saved: Array<{ customer_id: string; sales_id: string; sales_name: string }> = [];

    for (const assignment of payload.assignments) {
      const { error } = await context.supabase
        .from("customers")
        .update({ owner_id: assignment.sales_id })
        .eq("id", assignment.customer_id)
        .is("deleted_at", null);
      if (error) throw error;

      const { error: activityError } = await context.supabase.from("activities").insert({
        actor_id: context.profile.id,
        customer_id: assignment.customer_id,
        type: "sales_assigned",
        title: "分配销售",
        description: `已分配给 ${assignment.sales_name}`,
        metadata: {
          sales_id: assignment.sales_id,
          sales_name: assignment.sales_name
        }
      });
      if (activityError) throw activityError;

      saved.push(assignment);
    }

    return NextResponse.json({
      data: {
        saved: saved.length,
        assignments: saved,
        saved_at: new Date().toISOString()
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
