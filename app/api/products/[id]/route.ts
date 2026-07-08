import { NextResponse } from "next/server";

import { getApiContext, handleApiError, isApiError, toOptionalUuid } from "@/lib/api";
import { productSchema } from "@/lib/validations";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, contextParams: Context) {
  try {
    const { id } = await contextParams.params;
    const body = await request.json();
    const payload = productSchema.partial().parse({
      ...body,
      ...(body.category_id !== undefined ? { category_id: toOptionalUuid(body.category_id) } : {})
    });
    const context = await getApiContext();
    if (isApiError(context)) return context;

    const { data, error } = await context.supabase.from("products").update(payload).eq("id", id).select().single();
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
    const { error } = await context.supabase.from("products").update({ deleted_at: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
