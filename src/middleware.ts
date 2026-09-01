import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

const protectedPaths = [
  '/account',
  '/admin',
  '/merchant/dashboard',
];

// Public pages that live inside protected prefixes — no auth required
const publicWhitelist = [
  '/merchant/login',
  '/merchant/apply',
];

const adminPaths = ['/admin'];
const merchantPaths = ['/merchant/dashboard'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth for whitelisted public pages
  if (publicWhitelist.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check if path needs auth
  const isProtected = protectedPaths.some(p => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get('fubao_token')?.value;

  if (!token) {
    // Merchant-area pages redirect to the dedicated merchant login
    if (merchantPaths.some(p => pathname.startsWith(p))) {
      const loginUrl = new URL('/merchant/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = await verifyToken(token);
  if (!payload) {
    if (merchantPaths.some(p => pathname.startsWith(p))) {
      const loginUrl = new URL('/merchant/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access
  if (adminPaths.some(p => pathname.startsWith(p)) && payload.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (
    merchantPaths.some(p => pathname.startsWith(p)) &&
    payload.role !== 'merchant' &&
    payload.role !== 'admin'
  ) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Add user info to headers for downstream use
  const response = NextResponse.next();
  response.headers.set('x-user-id', payload.sub);
  response.headers.set('x-user-role', payload.role);

  return response;
}

export const config = {
  matcher: [
    '/account/:path*',
    '/admin/:path*',
    '/merchant/:path*',
    '/checkout/:path*',
  ],
};
