import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware allows all requests to pass through, effectively disabling authentication.
export function middleware(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - careers (public careers page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|careers).*)',
  ],
};
