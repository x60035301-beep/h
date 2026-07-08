import { NextResponse } from "next/server";

import { getApiContext, handleApiError, isApiError, toOptionalUuid } from "@/lib/api";
import { productSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = productSchema.parse({ ...body, category_id: toOptionalUuid(body.category_id) });
    const context = await getApiContext();
    if (isApiError(context)) return context;

    const { data, error } = await context.supabase.from("products").insert(payload).select().single();
    if (error) throw error;
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
