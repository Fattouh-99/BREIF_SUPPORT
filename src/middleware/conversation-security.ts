import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';

// Initialize Redis client for rate limiting if environment variables are available
let ratelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  // Create rate limiter that allows 20 requests per minute per user or IP
  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 m'),
    analytics: true,
  });
}

// Get the authenticated user ID from Clerk
async function getAuthUser() {
  const { userId } = auth();
  
  if (!userId) {
    return { userId: null };
  }
  
  // Optionally fetch more user data from your database if needed
  const user = await prisma.user.findFirst({
    where: { clerkId: userId },
    select: { id: true, role: true }
  });
  
  return { 
    userId,
    userDbId: user?.id || null,
    userRole: user?.role || null
  };
}

// Sanitize input to prevent XSS attacks
export function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<img[^>]*onerror[^>]*>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

// Function to validate and sanitize JSON body
export function validateAndSanitizeBody(body: any): { valid: boolean; sanitized?: any; error?: string } {
  try {
    if (!body) {
      return { valid: false, error: 'Missing request body' };
    }

    // Clone the body to avoid modifying the original
    const sanitized = { ...body };

    // Sanitize all string fields recursively
    const sanitizeObject = (obj: any) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = sanitizeInput(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      }
    };

    sanitizeObject(sanitized);
    return { valid: true, sanitized };
  } catch (error) {
    console.error('Error validating request body:', error);
    return { valid: false, error: 'Invalid request body' };
  }
}

// Middleware to protect conversation API routes
export async function protectConversationRoute(
  req: NextRequest, 
  handler: (req: NextRequest, authInfo: { userId: string | null, userDbId?: string | null, userRole?: string | null }) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // 1. Check authentication
    const authInfo = await getAuthUser();
    
    // Require authentication for protected routes
    if (!authInfo.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 2. Apply rate limiting if configured
    if (ratelimit) {
      const identifier = authInfo.userId || req.ip || 'anonymous';
      const result = await ratelimit.limit(identifier);
      
      if (!result.success) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': result.limit.toString(),
              'X-RateLimit-Remaining': result.remaining.toString(),
              'X-RateLimit-Reset': result.reset.toString(),
            }
          }
        );
      }
    }
    
    // 3. Check for CSRF protection (validate Origin against Host)
    const origin = req.headers.get('Origin');
    const host = req.headers.get('Host');
    const referer = req.headers.get('Referer');
    
    // Only check CSRF for state-changing methods
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      // If origin header is present, validate it
      if (origin) {
        const originHost = new URL(origin).host;
        if (originHost !== host && !isAllowedCrossSiteOrigin(origin)) {
          console.warn(`CSRF attempt detected. Origin: ${origin}, Host: ${host}`);
          return NextResponse.json({ error: 'Invalid cross-site request' }, { status: 403 });
        }
      }
      
      // If no origin header but referer is present, validate referer as fallback
      else if (referer) {
        try {
          const refererHost = new URL(referer).host;
          if (refererHost !== host && !isAllowedCrossSiteOrigin(referer)) {
            console.warn(`CSRF attempt detected. Referer: ${referer}, Host: ${host}`);
            return NextResponse.json({ error: 'Invalid cross-site request' }, { status: 403 });
          }
        } catch (e) {
          console.warn(`Invalid referer format: ${referer}`);
          return NextResponse.json({ error: 'Invalid request' }, { status: 403 });
        }
      }
      
      // If neither origin nor referer is present for a state-changing request, reject it
      // This prevents CSRF attacks where the attacker strips the headers
      else {
        // Skip this check for API endpoints that might be called programmatically
        if (!req.url.includes('/api/webhook')) {
          console.warn('Missing origin and referer headers for state-changing request');
          return NextResponse.json({ error: 'Missing origin' }, { status: 403 });
        }
      }
    }
    
    // 4. Check Content-Type for POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const contentType = req.headers.get('Content-Type');
      if (!contentType || !contentType.includes('application/json')) {
        return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 400 });
      }
    }

    // 5. Continue to the handler with auth info
    return handler(req, authInfo);
  } catch (error) {
    console.error('Error in conversation security middleware:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Helper to determine if cross-site origin is allowed
function isAllowedCrossSiteOrigin(origin: string): boolean {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
  return allowedOrigins.some(allowed => origin.startsWith(allowed));
}

// Apply security headers to response
export function applySecurityHeaders(response: NextResponse): NextResponse {
  // Removed CSP header to avoid conflicts with Next.js application-wide CSP
  
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  // Add protection against clickjacking
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  // Set strict transport security to enforce HTTPS
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }
  
  return response;
} 