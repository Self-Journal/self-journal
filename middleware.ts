import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const isDemoMode = process.env.DEMO_MODE === 'true';

  // If not in demo mode, let NextAuth handle authentication normally
  if (!isDemoMode) {
    return NextResponse.next();
  }

  // In demo mode, check if user is already authenticated
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  // If user is authenticated, allow request to continue
  if (token) {
    return NextResponse.next();
  }

  // If accessing login or setup pages, allow it (they handle auto-login)
  if (request.nextUrl.pathname.startsWith('/login') ||
      request.nextUrl.pathname.startsWith('/setup') ||
      request.nextUrl.pathname.startsWith('/api/auth') ||
      request.nextUrl.pathname.startsWith('/api/setup')) {
    return NextResponse.next();
  }

  // For all other pages, redirect to login (which will auto-login in demo mode)
  return NextResponse.redirect(new URL('/login', request.url));
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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
