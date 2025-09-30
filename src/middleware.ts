import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("vrs_token")?.value;
  const path = req.nextUrl.pathname;

  const isPublicApi = path.startsWith('/api/auth/');
  const isPublicPage = path.startsWith('/login') || path.startsWith('/register');
  
  // Allow public API routes and pages to be accessed without a token
  if (isPublicApi || isPublicPage) {
    // If user is logged in and tries to access login/register, redirect to dashboard
    if (token && isPublicPage) {
      const url = req.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // If no token and not a public route, redirect to login
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // If user is logged in, let them proceed. The setup check will be handled client-side.
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next|api/public|public|favicon.ico).*)"] };
