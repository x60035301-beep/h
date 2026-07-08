import { redirect } from "next/navigation";

import { defaultLocale, withLocale } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";
import type { SessionProfile } from "@/lib/permissions";

export async function getCurrentProfile(): Promise<SessionProfile | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("users")
    .select("id,email,full_name,avatar_url,roles(code)")
    .eq("id", user.id)
    .maybeSingle();

  const profileRow = data as
    | {
        email?: string | null;
        full_name?: string | null;
        avatar_url?: string | null;
        roles?: { code?: SessionProfile["role"] } | Array<{ code?: SessionProfile["role"] }>;
      }
    | null;
  const roleRelation = profileRow?.roles;
  const role = Array.isArray(roleRelation) ? roleRelation[0]?.code : roleRelation?.code;

  return {
    id: user.id,
    email: profileRow?.email ?? user.email ?? null,
    full_name: profileRow?.full_name ?? user.user_metadata?.full_name ?? null,
    avatar_url: profileRow?.avatar_url ?? user.user_metadata?.avatar_url ?? null,
    role: role ?? "sales"
  };
}

export async function requireProfile(locale = defaultLocale) {
  const profile = await getCurrentProfile();
  if (!profile) redirect(withLocale("/login", locale));
  return profile;
}
