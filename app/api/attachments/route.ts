import { NextResponse } from "next/server";
import { z } from "zod";

import { getApiContext, handleApiError, isApiError, toOptionalUuid } from "@/lib/api";

const attachmentSchema = z.object({
  customer_id: z.string().uuid().optional().nullable(),
  product_id: z.string().uuid().optional().nullable(),
  file_name: z.string().min(1),
  file_type: z.enum(["pdf", "image", "video", "other"]),
  file_url: z.string().min(1),
  storage_path: z.string().optional().nullable(),
  size_bytes: z.number().optional().nullable()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = attachmentSchema.parse({
      ...body,
      customer_id: toOptionalUuid(body.customer_id),
      product_id: toOptionalUuid(body.product_id),
      file_type: normalizeAttachmentType(body.file_type),
      size_bytes: body.size_bytes ?? body.file_size ?? null
    });
    const context = await getApiContext();
    if (isApiError(context)) return context;

    const { data, error } = await context.supabase
      .from("attachments")
      .insert({ ...payload, uploaded_by: context.profile.id })
      .select()
      .single();
    if (error) throw error;

    const { error: activityError } = await context.supabase.from("activities").insert({
      actor_id: context.profile.id,
      customer_id: payload.customer_id,
      type: "attachment_uploaded",
      title: "上传附件",
      description: payload.file_name
    });
    if (activityError) throw activityError;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

function normalizeAttachmentType(value: unknown) {
  const text = String(value ?? "").toLowerCase();
  if (text === "pdf" || text.includes("pdf")) return "pdf";
  if (text === "image" || text.startsWith("image/")) return "image";
  if (text === "video" || text.startsWith("video/")) return "video";
  return "other";
}
