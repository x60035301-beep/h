import { NextResponse } from "next/server";

import { getApiContext, handleApiError, isApiError } from "@/lib/api";
import { reminderSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const payload = reminderSchema.parse(await request.json());
    const context = await getApiContext();
    if (isApiError(context)) return context;

    const { data, error } = await context.supabase
      .from("reminders")
      .insert({ ...payload, assigned_to: payload.assigned_to ?? context.profile.id })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
