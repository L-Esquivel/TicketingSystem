import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET_STR = process.env.JWT_SECRET || 'propdesk_it_super_secret_jwt_key_real_estate_2026';
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STR);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Exclude static assets and public routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/auth/logout') ||
    pathname.startsWith('/api/tickets') || // Allow client incident submissions from /submit
    pathname.startsWith('/api/companies') || // Allow public company dropdown in /submit
    pathname === '/login' ||
    pathname === '/submit' ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth_session')?.value;

  // 2. Unauthenticated check
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Verify JWT session token and check mandatory password change flag
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const mustChangePassword = (payload as any)?.mustChangePassword;

    if (mustChangePassword) {
      const isChangePasswordRoute =
        pathname === '/change-password' ||
        pathname.startsWith('/api/auth/change-password') ||
        pathname.startsWith('/api/auth/logout');

      if (!isChangePasswordRoute) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { success: false, error: 'Mandatory password change required', mustChangePassword: true },
            { status: 403 }
          );
        }
        return NextResponse.redirect(new URL('/change-password', request.url));
      }
    } else if (pathname === '/change-password') {
      // If user already changed password, redirect back to dashboard
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  } catch (err) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth_session');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets:
     * - _next/static
     * - _next/image
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
