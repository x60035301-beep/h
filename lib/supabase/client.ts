"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/env";

export function createClient() {
  if (!hasSupabaseEnv()) return null;

  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient(url, anonKey);
}
