import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/env";
import { fetchWithTimeout } from "@/lib/supabase/fetch-with-timeout";

const AUTH_TIMEOUT_MS = 2_500;

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request
  });

  if (!hasSupabaseEnv()) return response;

  const { url, anonKey } = getSupabaseEnv();
  const supabase = createServerClient(url, anonKey, {
    global: {
      fetch: (input, init) => fetchWithTimeout(input, init, AUTH_TIMEOUT_MS)
    },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  const hasAuthCookie = request.cookies
    .getAll()
    .some(({ name }) => name.startsWith("sb-") && name.includes("-auth-token"));

  if (!hasAuthCookie) return response;

  try {
    await supabase.auth.getUser();
  } catch {
    // A slow auth provider must not take down every route at the middleware layer.
  }
  return response;
}
