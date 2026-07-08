import { createClient } from "@supabase/supabase-js";

import { getSupabaseAdminEnv, hasSupabaseAdminEnv } from "@/lib/env";

export function createAdminClient() {
  if (!hasSupabaseAdminEnv()) return null;

  const { url, serviceRoleKey } = getSupabaseAdminEnv();
  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
