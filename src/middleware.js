import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { verifyRefreshToken } from '@/lib/auth';

// Initialize Upstash Redis Rate Limiter
// Limit: 10 requests per 10-second sliding window per IP
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
});

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // ================= 1. RATE LIMITING FOR API ROUTES =================
  if (pathname.startsWith('/api')) {
    // Extract real client IP (compatible with Vercel Edge / Cloudflare)
    const ip = request.ip ?? request.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';

    try {
      const { success, limit, reset, remaining } = await ratelimit.limit(ip);

      if (!success) {
        return new NextResponse(
          JSON.stringify({ error: 'Too many requests. Please slow down.' }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': remaining.toString(),
              'X-RateLimit-Reset': reset.toString(),
            },
          }
        );
      }
    } catch (error) {
      // Fail-Open Strategy: Log error but allow request if Redis fails or hits free quota limits
      console.error('Rate limiting error:', error);
    }
  }

  // ================= 2. AUTHENTICATION & ROUTE GUARDS =================
  const refreshToken = request.cookies.get('refreshToken')?.value;

  const protectedRoutes = ['/sell', '/my-listings', '/profile'];
  const authRoutes = ['/login', '/register'];

  // Case A: Unauthenticated user accessing protected pages
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!refreshToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Case B: Authenticated user accessing /login or /register
  if (authRoutes.includes(pathname) && refreshToken) {
    const decoded = verifyRefreshToken(refreshToken);
    if (decoded) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

// ================= 3. MATCHER CONFIGURATION =================
export const config = {
  matcher: [
    '/api/:path*',
    '/sell/:path*',
    '/my-listings/:path*',
    '/profile/:path*',
    '/login',
    '/register',
  ],
};