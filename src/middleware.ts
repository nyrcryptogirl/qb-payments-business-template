import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes - check for session cookie
  if (pathname.startsWith('/admin')) {
    const session = request.cookies.get('session');
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Protect settings POST (only allow authenticated users)
  if (pathname === '/api/settings' && request.method === 'POST') {
    const session = request.cookies.get('session');
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Protect QB admin API routes
  if (pathname.startsWith('/api/quickbooks/disconnect')) {
    const session = request.cookies.get('session');
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Protect admin API routes
  if (pathname.startsWith('/api/admin/') || pathname.startsWith('/api/debug')) {
    const session = request.cookies.get('session');
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/settings', '/api/quickbooks/disconnect', '/api/admin/:path*', '/api/debug-payment', '/api/debug'],
};
