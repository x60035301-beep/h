import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { isLocale, withLocale } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";

const resetSchema = z.object({ email: z.string().email(), locale: z.string() });

export async function POST(request: NextRequest) {
  try {
    const parsed = resetSchema.safeParse(await request.json());
    if (!parsed.success || !isLocale(parsed.data.locale)) {
      return NextResponse.json({ error: "Invalid password reset request." }, { status: 400 });
    }

    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });

    const redirectTo = new URL(withLocale("/update-password", parsed.data.locale), request.nextUrl.origin).toString();
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, { redirectTo });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error && error.name !== "AbortError" ? error.message : "Authentication service timed out.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
