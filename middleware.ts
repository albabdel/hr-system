import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("vrs_token")?.value;
  const isAuthPage = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register");

  if (!token && !isAuthPage) {
    const url = req.nextUrl.clone(); url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  if (token && isAuthPage) {
    const url = req.nextUrl.clone(); url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
export const config = { matcher: ["/((?!_next|api/public|public|favicon.ico).*)"] };
