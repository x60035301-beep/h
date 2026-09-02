import { NextResponse } from "next/server";

import { getApiContext, handleApiError, isApiError } from "@/lib/api";
import { canManageSettings } from "@/lib/permissions";
import { getPurchaseOrderSupplier } from "@/lib/purchase-order-supplier";
import { settingsSchema } from "@/lib/validations";

export async function PATCH(request: Request) {
  try {
    const parsed = settingsSchema.parse(await request.json());
    const { purchase_order_supplier_name, purchase_order_supplier_location, ...payload } = parsed;
    const context = await getApiContext();
    if (isApiError(context)) return context;
    if (!canManageSettings(context.profile.role)) {
      return NextResponse.json({ error: "Only Admin can manage settings." }, { status: 403 });
    }

    const { data: existing } = await context.supabase.from("settings").select("id,metadata").is("deleted_at", null).limit(1).maybeSingle();
    const currentSupplier = getPurchaseOrderSupplier(existing?.metadata);
    const metadata = isRecord(existing?.metadata) ? existing.metadata : {};
    const settingsPayload = {
      ...payload,
      metadata: {
        ...metadata,
        purchase_order_supplier_name: purchase_order_supplier_name?.trim() || currentSupplier.name,
        purchase_order_supplier_location: purchase_order_supplier_location?.trim() || currentSupplier.location
      }
    };
    const query = existing
      ? context.supabase.from("settings").update(settingsPayload).eq("id", existing.id)
      : context.supabase.from("settings").insert(settingsPayload);
    const { data, error } = await query.select().single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
