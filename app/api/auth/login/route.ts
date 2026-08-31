import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const parsed = loginSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });

    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });

    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) return NextResponse.json({ error: error.message }, { status: 401 });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error && error.name !== "AbortError" ? error.message : "Authentication service timed out.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
