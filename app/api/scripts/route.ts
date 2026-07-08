import { NextResponse } from "next/server";

import { getApiContext, handleApiError, isApiError, toOptionalUuid } from "@/lib/api";
import { scriptSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = scriptSchema.parse({
      ...body,
      category_id: toOptionalUuid(body.category_id),
      content_id: body.content_id ?? body.content_en ?? body.content_zh
    });
    const context = await getApiContext();
    if (isApiError(context)) return context;

    const { data, error } = await context.supabase.from("scripts").insert(payload).select().single();
    if (error) throw error;
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
