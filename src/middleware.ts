
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const p = req.nextUrl.pathname;

  // Bypass APIs and assets
  if (p.startsWith("/api/")) return NextResponse.next();
  if (
    p.startsWith("/_next/") || p.startsWith("/static/") || p.startsWith("/images/") ||
    p.startsWith("/assets/") || p === "/favicon.ico" || p === "/robots.txt" || p === "/sitemap.xml"
  ) return NextResponse.next();

  const publicPage =
    p.startsWith("/login") || p.startsWith("/register") ||
    p.startsWith("/careers") || p.startsWith("/offer/");

  const token = req.cookies.get("vrs_token")?.value;

  if (!token && !publicPage) {
    const url = req.nextUrl.clone(); url.pathname = "/login"; return NextResponse.redirect(url);
  }
  if (token && (p.startsWith("/login") || p.startsWith("/register"))) {
    const url = req.nextUrl.clone(); url.pathname = "/dashboard"; return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

// IMPORTANT: exclude assets at the matcher level too
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|_next/webpack-hmr|static|images|assets|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
