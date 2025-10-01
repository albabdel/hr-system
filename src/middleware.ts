import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // 1) Always bypass APIs (avoid HTML on JSON)
  if (path.startsWith("/api/")) return NextResponse.next();

  // 2) Always bypass Next.js static assets and public files
  if (
    path.startsWith("/_next/") ||
    path.startsWith("/static/") ||
    path.startsWith("/images/") ||
    path.startsWith("/assets/") ||
    path === "/favicon.ico" ||
    path === "/robots.txt" ||
    path === "/sitemap.xml"
  ) return NextResponse.next();

  // 3) Public pages
  const isPublicPage =
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/careers") ||
    path.startsWith("/offer/");

  const token = req.cookies.get("vrs_token")?.value;

  if (!token && !isPublicPage) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (token && (path.startsWith("/login") || path.startsWith("/register"))) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// IMPORTANT: exclude assets at the matcher level too
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|_next/webpack-hmr|static|images|assets|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
