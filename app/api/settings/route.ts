import { NextResponse } from "next/server";

import { getApiContext, handleApiError, isApiError } from "@/lib/api";
import { canManageSettings } from "@/lib/permissions";
import { settingsSchema } from "@/lib/validations";

export async function PATCH(request: Request) {
  try {
    const payload = settingsSchema.parse(await request.json());
    const context = await getApiContext();
    if (isApiError(context)) return context;
    if (!canManageSettings(context.profile.role)) {
      return NextResponse.json({ error: "Only Admin can manage settings." }, { status: 403 });
    }

    const { data: existing } = await context.supabase.from("settings").select("id").is("deleted_at", null).limit(1).maybeSingle();
    const query = existing
      ? context.supabase.from("settings").update(payload).eq("id", existing.id)
      : context.supabase.from("settings").insert(payload);
    const { data, error } = await query.select().single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}
