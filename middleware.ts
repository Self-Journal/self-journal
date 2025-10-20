import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const isDemoMode = process.env.DEMO_MODE === 'true';

  // In demo mode, don't enforce authentication at middleware level
  // Let the auto-login on /login page handle it
  if (isDemoMode) {
    // Only redirect to login if accessing root path
    if (request.nextUrl.pathname === '/') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Allow all other requests in demo mode
    return NextResponse.next();
  }

  // Production mode - enforce authentication
  // For now, just allow everything (you can add auth logic here later)
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
