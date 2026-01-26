import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require €1 starter payment
const PAYMENT_GATED_ROUTES = [
  '/create-bot-dashboard',
  '/create-bot',
  '/configuration-bot',
  '/test-bot',
];

// Routes that require authentication but NOT payment
const AUTH_ONLY_ROUTES = [
  '/pricing-page', // Can view pricing while logged in
];

// Public routes (no auth required)
const PUBLIC_ROUTES = [
  '/',
  '/homepage',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/auth',
  '/payment-success',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes and static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if route is public
  const isPublic = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isPublic) {
    return NextResponse.next();
  }

  // Create Supabase client for middleware
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Not authenticated, redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check if route requires payment
  const requiresPayment = PAYMENT_GATED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (requiresPayment) {
    // Get profile to check starter_paid
    const { data: profile } = await supabase
      .from('profiles')
      .select('starter_paid')
      .eq('id', user.id)
      .single();

    if (!profile?.starter_paid) {
      // Not paid, redirect to pricing page
      const pricingUrl = new URL('/pricing-page', request.url);
      pricingUrl.searchParams.set('gate', 'starter');
      return NextResponse.redirect(pricingUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/stripe/webhook).*)',
  ],
};
