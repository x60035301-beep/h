import { NextResponse } from "next/server";

import { getApiContext, handleApiError, isApiError, toOptionalUuid } from "@/lib/api";
import { scriptSchema } from "@/lib/validations";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, contextParams: Context) {
  try {
    const { id } = await contextParams.params;
    const body = await request.json();
    const payload = scriptSchema.partial().parse({
      ...body,
      ...(body.category_id !== undefined ? { category_id: toOptionalUuid(body.category_id) } : {}),
      ...(body.content_id === undefined && body.content_en ? { content_id: body.content_en } : {})
    });
    const context = await getApiContext();
    if (isApiError(context)) return context;

    const { data, error } = await context.supabase.from("scripts").update(payload).eq("id", id).select().single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_: Request, contextParams: Context) {
  const context = await getApiContext();
  if (isApiError(context)) return context;
  try {
    const { id } = await contextParams.params;
    const { error } = await context.supabase.from("scripts").update({ deleted_at: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
