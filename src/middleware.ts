import { authMiddleware } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

// Optimized route configuration
const ROUTE_CONFIG = {
  // Public routes that don't require authentication
  PUBLIC_ROUTES: [
    '/',
    '/features',
    '/resources',
    '/blogs',
    '/careers',
    '/contact',
    '/chatbot',
    '/chatbot-test',
    '/test-chatbot',
    '/test-inquiry',
    '/demo',
    '/products',
    '/upload',
    '/portal',
    '/auth',
    '/auth/sign-in',
    '/auth/sign-up',
    '/auth/verify-email',
    '/auth/registration-disabled',
    '/auth/login-disabled',
    '/maintenance',
  ],
  
  // Public API routes
  PUBLIC_API_ROUTES: [
    '/api/webhooks/clerk',
    '/api/system-settings',
    '/api/auth/complete-registration',
    '/api/auth/send-otp',
    '/api/auth/validate-email',
    '/api/auth/check-email',
    '/api/auth/test',
    '/api/stripe/create-payment-intent',
    '/api/stripe/v2/create-payment-intent',
    '/api/contact',
    '/api/inquiries/test',
    '/api/landing-chat',
    '/api/notify/real-time',
  ],
  
  // Auth pages that authenticated users should be redirected from
  AUTH_PAGES: [
    '/auth/sign-in',
    '/auth/sign-up'
  ],
  
  // Protected routes that always require authentication
  PROTECTED_ROUTES: [
    '/conversation',
    '/team',
    '/settings',
    '/admin',
    '/appointment',
    '/email-marketing',
    '/integration'
  ]
} as const;

// Helper functions for route checking
const isPublicRoute = (pathname: string): boolean => {
  return ROUTE_CONFIG.PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  ) || ROUTE_CONFIG.PUBLIC_API_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
};

const isAuthPage = (pathname: string): boolean => {
  return ROUTE_CONFIG.AUTH_PAGES.some(page => pathname.startsWith(page));
};

const isProtectedRoute = (pathname: string): boolean => {
  return ROUTE_CONFIG.PROTECTED_ROUTES.some(route => 
    pathname.startsWith(`/${route}`) || pathname === `/${route}`
  );
};

// Clear any problematic cookie domain env variable that might cause redirect loops
if (typeof process !== 'undefined' && process.env) {
  // Unset any cookie domain settings that might cause issues
  delete process.env.NEXT_PUBLIC_CLERK_DOMAIN;
}

// Export the optimized Clerk middleware
export default authMiddleware({
  publicRoutes: [...ROUTE_CONFIG.PUBLIC_ROUTES, ...ROUTE_CONFIG.PUBLIC_API_ROUTES],
  
  // Optimized configuration
  clockSkewInMs: 300000, // 5 minutes tolerance for clock skew
  
  // Enhanced auth state handling
  afterAuth(auth, req) {
    const { pathname } = req.nextUrl;
    const { userId } = auth;
    
    // Performance optimization: Early return for static assets
    if (pathname.startsWith('/_next') || 
        pathname.startsWith('/static') || 
        pathname.includes('.')) {
      return NextResponse.next();
    }
    
    // Redirect legacy dashboard route to conversations
    if (pathname === '/dashboard') {
      return NextResponse.redirect(new URL('/conversation', req.url), 301);
    }

    // Handle authenticated users on auth pages - Fix for redirect loop
    if (userId && isAuthPage(pathname)) {
      console.log(`Authenticated user attempting to access auth page: ${pathname}`);
      // Don't redirect if coming from a previous redirect, prevent loop
      if (req.headers.get('referer')?.includes('/conversation')) {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL('/conversation', req.url));
    }
    
    // Handle 404 errors more explicitly to prevent soft 404s
    // Check for routes that might exist in old site structure but have been moved
    const oldToNewRouteMap: Record<string, string> = {
      '/blog': '/blogs',
      '/about': '/features',
      '/faq': '/features#faq',
      '/pricing': '/products',
      '/help': '/contact',
    };
    
    // Implement permanent redirects for old routes
    if (pathname in oldToNewRouteMap) {
      console.log(`Redirecting from old route ${pathname} to ${oldToNewRouteMap[pathname]}`);
      return NextResponse.redirect(new URL(oldToNewRouteMap[pathname], req.url), 301);
    }
    
    // Ensure conversation route is properly handled for authenticated users
    if (userId && pathname === '/conversation') {
      // Allow direct access to conversation page without redirects
      return NextResponse.next();
    }
    
    // Allow public routes without further checks
    if (auth.isPublicRoute) {
      return NextResponse.next();
    }
    
    // Enhanced protection for private routes
    if (!userId && (isProtectedRoute(pathname) || !auth.isPublicRoute)) {
      console.log(`Unauthenticated access attempt to protected route: ${pathname}`);
      
      // Fix: Don't set redirect_url if we're already on an auth page
      const signInUrl = new URL('/auth/sign-in', req.url);
      
      // Only set redirect_url if the current path is not an auth page
      if (!isAuthPage(pathname)) {
        signInUrl.searchParams.set('redirect_url', pathname);
      }
      
      const response = NextResponse.redirect(signInUrl);
      
      // Set secure authentication error cookie with no domain to avoid cross-domain issues
      response.cookies.set('auth_error', 'authentication_required', { 
        maxAge: 60,
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      return response;
    }
    
    // Allow authenticated access to protected routes
    return NextResponse.next();
  }
});

// Optimized matcher configuration
export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - public folder files
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
    // Always run for API routes
    '/api/(.*)',
  ],
};