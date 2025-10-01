import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // 1) Always let API traffic through (prevents HTML redirects on JSON endpoints)
  if (path.startsWith("/api/")) return NextResponse.next();

  // 2) Public, no-login pages
  const isPublicPage =
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/careers") ||
    path.startsWith("/offer/"); // public signing links

  // 3) Static/assets
  if (path.startsWith("/_next") || path === "/favicon.ico") return NextResponse.next();

  const token = req.cookies.get("vrs_token")?.value;

  // 4) Redirect unauthenticated page requests to login
  if (!token && !isPublicPage) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 5) Authenticated users shouldn’t see auth pages
  if (token && (path.startsWith("/login") || path.startsWith("/register"))) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Keep this matcher broad; the early return above handles /api/*
export const config = {
  matcher: ["/((?!public).*)"],
};
