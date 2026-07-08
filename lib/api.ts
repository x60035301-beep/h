import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ZodError } from "zod";

import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { SessionProfile } from "@/lib/permissions";

export type ApiContext = {
  supabase: SupabaseClient;
  profile: SessionProfile;
};

export async function getApiContext(): Promise<ApiContext | NextResponse> {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured. Add .env values first." }, { status: 503 });
  }

  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return { supabase, profile };
}

export function isApiError(value: ApiContext | NextResponse): value is NextResponse {
  return value instanceof NextResponse;
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function toOptionalUuid(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  return uuidPattern.test(value) ? value : null;
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json({ error: "Validation failed", details: error.flatten() }, { status: 400 });
  }

  const message = error instanceof Error ? error.message : "Unexpected server error";
  return NextResponse.json({ error: message }, { status: 500 });
}
