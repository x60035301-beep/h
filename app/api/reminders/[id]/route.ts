import { NextResponse } from "next/server";
import { z } from "zod";

import { getApiContext, handleApiError, isApiError } from "@/lib/api";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, contextParams: Context) {
  try {
    const { id } = await contextParams.params;
    const payload = z.object({ is_done: z.boolean() }).parse(await request.json());
    const context = await getApiContext();
    if (isApiError(context)) return context;

    const { data, error } = await context.supabase.from("reminders").update(payload).eq("id", id).select().single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}
