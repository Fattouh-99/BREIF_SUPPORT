import { NextRequest, NextResponse } from 'next/server';
import { ApiError } from '@/lib/api-response';

interface RateLimitOptions {
  /**
   * Maximum number of requests allowed within the window (default: 60)
   */
  limit?: number;
  
  /**
   * Time window in seconds (default: 60 = 1 minute)
   */
  windowInSeconds?: number;
  
  /**
   * Custom identifier function (defaults to IP address)
   */
  identifierFn?: (req: NextRequest) => string;
}

// In-memory store for rate limiting
// In production, you should use Redis or similar for distributed rate limiting
const rateLimitStore: Record<string, { count: number; reset: number }> = {};

/**
 * Clean up expired rate limit records (called periodically)
 */
const cleanupRateLimitStore = () => {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach((key) => {
    if (rateLimitStore[key].reset < now) {
      delete rateLimitStore[key];
    }
  });
};

// Set up automatic cleanup every minute
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 60 * 1000);
}

/**
 * Rate limiting middleware for API routes
 * 
 * @param req - Next.js request object
 * @param options - Rate limiting options
 * @returns NextResponse if rate limit exceeded, otherwise undefined
 */
export function rateLimit(
  req: NextRequest,
  options: RateLimitOptions = {}
): NextResponse | undefined {
  const { 
    limit = 60, 
    windowInSeconds = 60,
    identifierFn = (req) => req.ip || '127.0.0.1'
  } = options;
  
  // Get client identifier (IP address by default)
  const identifier = identifierFn(req);
  
  // Current timestamp
  const now = Date.now();
  
  // Initialize or retrieve rate limit data for this identifier
  if (!rateLimitStore[identifier] || rateLimitStore[identifier].reset < now) {
    rateLimitStore[identifier] = {
      count: 0,
      reset: now + windowInSeconds * 1000,
    };
  }
  
  // Increment request count
  const currentCount = ++rateLimitStore[identifier].count;
  
  // Set rate limit headers
  const headers = {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': Math.max(0, limit - currentCount).toString(),
    'X-RateLimit-Reset': Math.ceil(rateLimitStore[identifier].reset / 1000).toString(),
  };
  
  // Check if rate limit exceeded
  if (currentCount > limit) {
    const retryAfter = Math.ceil((rateLimitStore[identifier].reset - now) / 1000);
    
    return ApiError.BadRequest('Too many requests', {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': Math.ceil(rateLimitStore[identifier].reset / 1000).toString(),
      'Retry-After': retryAfter.toString(),
    });
  }
  
  return undefined;
}

/**
 * Apply rate limiting to an API handler
 * 
 * @param handler - The API route handler
 * @param options - Rate limiting options
 * @returns Wrapped handler with rate limiting
 */
export function withRateLimit<T extends any[]>(
  handler: (req: NextRequest, ...args: T) => Promise<NextResponse> | NextResponse,
  options: RateLimitOptions = {}
) {
  return async function rateLimitedHandler(req: NextRequest, ...args: T): Promise<NextResponse> {
    // Apply rate limiting
    const rateLimitResponse = rateLimit(req, options);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    // Continue to handler if within rate limits
    return handler(req, ...args);
  };
} 