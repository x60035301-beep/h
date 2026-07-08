import { type NextRequest, NextResponse } from "next/server";

import { defaultLocale, isLocale } from "@/lib/i18n";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const ignored =
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico";

  if (!ignored) {
    const firstSegment = pathname.split("/")[1];
    if (!isLocale(firstSegment)) {
      const url = request.nextUrl.clone();
      url.pathname = `/${defaultLocale}${pathname === "/" ? "/dashboard" : pathname}`;
      return NextResponse.redirect(url);
    }
  }

  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
