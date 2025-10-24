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

  // Production mode - check authentication and setup
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/setup', '/api/auth', '/api/setup', '/api/register'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // If not authenticated, check if setup is needed
  if (!token) {
    // Check if any users exist by calling the setup API
    try {
      const setupCheck = await fetch(new URL('/api/setup', request.url).toString());
      const { needsSetup } = await setupCheck.json();

      if (needsSetup) {
        // No users exist, redirect to setup
        return NextResponse.redirect(new URL('/setup', request.url));
      } else {
        // Users exist but not logged in, redirect to login
        return NextResponse.redirect(new URL('/login', request.url));
      }
    } catch (error) {
      console.error('Middleware: Error checking setup:', error);
      // On error, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // User is authenticated, allow access
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
