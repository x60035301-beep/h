import { NextResponse } from "next/server";
import { z } from "zod";

import { getApiContext, handleApiError, isApiError, toOptionalUuid, type ApiContext } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const ATTACHMENTS_BUCKET = "attachments";
const MAX_ATTACHMENT_SIZE_BYTES = 100 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/quicktime",
  "video/webm"
];

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
    const context = await getApiContext();
    if (isApiError(context)) return context;

    if (request.headers.get("content-type")?.includes("multipart/form-data")) {
      return uploadAndCreateAttachment(request, context);
    }

    const body = await request.json();
    const payload = attachmentSchema.parse({
      ...body,
      customer_id: toOptionalUuid(body.customer_id),
      product_id: toOptionalUuid(body.product_id),
      file_type: normalizeAttachmentType(body.file_type),
      size_bytes: body.size_bytes ?? body.file_size ?? null
    });

    return createAttachmentRecord(context, payload);
  } catch (error) {
    return handleApiError(error);
  }
}

async function uploadAndCreateAttachment(request: Request, context: ApiContext) {
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required." }, { status: 400 });
  }

  const payload = await uploadAttachmentFile({
    file,
    customerId: toOptionalUuid(formData.get("customer_id")),
    productId: toOptionalUuid(formData.get("product_id")),
    uploaderId: context.profile.id
  });

  return createAttachmentRecord(context, payload);
}

async function uploadAttachmentFile({
  file,
  customerId,
  productId,
  uploaderId
}: {
  file: File;
  customerId: string | null;
  productId: string | null;
  uploaderId: string;
}) {
  validateAttachmentFile(file);

  const admin = createAdminClient();
  if (!admin) throw new Error("Supabase service key is required for file uploads.");

  await ensureAttachmentBucket();

  const storagePath = buildStoragePath({
    customerId,
    productId,
    uploaderId,
    fileName: sanitizeFileName(file.name)
  });
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const contentType = resolveContentType(file);
  const { error: uploadError } = await admin.storage.from(ATTACHMENTS_BUCKET).upload(storagePath, fileBuffer, {
    contentType,
    upsert: false
  });

  if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

  const { data } = admin.storage.from(ATTACHMENTS_BUCKET).getPublicUrl(storagePath);

  return attachmentSchema.parse({
    customer_id: customerId,
    product_id: productId,
    file_name: file.name,
    file_type: normalizeAttachmentType(contentType || file.name),
    file_url: data.publicUrl,
    storage_path: storagePath,
    size_bytes: file.size
  });
}

async function createAttachmentRecord(context: ApiContext, payload: z.infer<typeof attachmentSchema>) {
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
    title: "附件已上传",
    description: payload.file_name
  });
  if (activityError) throw activityError;

  return NextResponse.json({ data }, { status: 201 });
}

let bucketReady = false;

async function ensureAttachmentBucket() {
  if (bucketReady) return;

  const admin = createAdminClient();
  if (!admin) throw new Error("Supabase service key is required for file uploads.");

  const { data: buckets, error: listError } = await admin.storage.listBuckets();
  if (listError) throw listError;

  const bucketExists = buckets.some((bucket) => bucket.id === ATTACHMENTS_BUCKET);
  if (!bucketExists) {
    const { error } = await admin.storage.createBucket(ATTACHMENTS_BUCKET, {
      public: true,
      fileSizeLimit: MAX_ATTACHMENT_SIZE_BYTES,
      allowedMimeTypes: ALLOWED_MIME_TYPES
    });
    if (error) throw error;
  } else {
    const { error } = await admin.storage.updateBucket(ATTACHMENTS_BUCKET, {
      public: true,
      fileSizeLimit: MAX_ATTACHMENT_SIZE_BYTES,
      allowedMimeTypes: ALLOWED_MIME_TYPES
    });
    if (error) throw error;
  }

  bucketReady = true;
}

function validateAttachmentFile(file: File) {
  if (file.size <= 0) throw new Error("The uploaded file is empty.");
  if (file.size > MAX_ATTACHMENT_SIZE_BYTES) throw new Error("The uploaded file must be 100 MB or smaller.");

  const type = resolveContentType(file);
  const isAllowed =
    ALLOWED_MIME_TYPES.includes(type) ||
    type.startsWith("image/") ||
    type.startsWith("video/") ||
    file.name.toLowerCase().endsWith(".pdf");

  if (!isAllowed) throw new Error("Only PDF, image, and video files are supported.");
}

function resolveContentType(file: File) {
  if (file.type) return file.type.toLowerCase();
  if (file.name.toLowerCase().endsWith(".pdf")) return "application/pdf";
  return "application/octet-stream";
}

function sanitizeFileName(value: string) {
  const parts = value.split(".");
  const extension = parts.length > 1 ? `.${parts.pop()?.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12)}` : "";
  const base = parts
    .join(".")
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

  return `${base || "attachment"}${extension}`;
}

function buildStoragePath({
  customerId,
  productId,
  uploaderId,
  fileName
}: {
  customerId: string | null;
  productId: string | null;
  uploaderId: string;
  fileName: string;
}) {
  const folder = customerId ? `customers/${customerId}` : productId ? `products/${productId}` : `general/${uploaderId}`;
  return `${folder}/${Date.now()}-${crypto.randomUUID()}-${fileName}`;
}

function normalizeAttachmentType(value: unknown): "pdf" | "image" | "video" | "other" {
  const text = String(value ?? "").toLowerCase();
  if (text === "pdf" || text.includes("pdf")) return "pdf";
  if (text === "image" || text.startsWith("image/")) return "image";
  if (text === "video" || text.startsWith("video/")) return "video";
  return "other";
}
