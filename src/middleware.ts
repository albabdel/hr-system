
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("vrs_token")?.value;
  const path = req.nextUrl.pathname;

  const isPublicApi = path.startsWith('/api/auth/') || path.startsWith('/api/public/');
  const isPublicPage = path.startsWith('/login') || path.startsWith('/register') || path.startsWith('/careers');
  
  // Allow public API routes and pages to be accessed without a token
  if (isPublicApi || isPublicPage) {
    // If user is logged in and tries to access login/register, redirect to dashboard
    if (token && (path.startsWith('/login') || path.startsWith('/register'))) {
      const url = req.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // If no token and not a public route, redirect to login
  if (!token) {
    // Allow the /api/tenant/status call for the theme loader on the login page
    if (path === '/api/tenant/status') {
      return NextResponse.next();
    }
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // If user is logged in, let them proceed. The setup check will be handled client-side.
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next|public|favicon.ico).*)"] };
