import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const updateSchema = z.object({ password: z.string().min(8) });

export async function POST(request: Request) {
  try {
    const parsed = updateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Password must contain at least 8 characters." }, { status: 400 });
    }

    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });

    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error && error.name !== "AbortError" ? error.message : "Authentication service timed out.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
