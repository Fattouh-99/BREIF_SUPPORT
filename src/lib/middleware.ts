import { NextRequest, NextResponse } from 'next/server';
import { ApiError } from './api-response';
import { withCsrfProtection } from './csrf';

/**
 * Type for Next.js API route handlers
 */
export type RouteHandler = (
  req: NextRequest,
  ...args: any[]
) => Promise<NextResponse> | NextResponse;

/**
 * Type for middleware functions that wrap route handlers
 */
export type Middleware = (handler: RouteHandler) => RouteHandler;

/**
 * Type for CORS headers
 */
interface CorsHeaders {
  'Access-Control-Allow-Origin'?: string;
  'Access-Control-Allow-Methods': string;
  'Access-Control-Allow-Headers': string;
  'Access-Control-Allow-Credentials': string;
  [key: string]: string | undefined;
}

/**
 * Get allowed origins from environment variables or use defaults
 */
const getAllowedOrigins = (): string[] => {
  const configuredOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
  
  // Include localhost and the app's domain in development
  if (process.env.NODE_ENV === 'development') {
    return [...configuredOrigins, 'http://localhost:3000', 'http://localhost'];
  }
  
  // In production, use configured origins or the app's domain
  return configuredOrigins.length > 0 
    ? configuredOrigins 
    : [process.env.NEXT_PUBLIC_APP_URL || 'https://www.briefsupport.com'];
};

/**
 * Default CORS headers with secure configuration (except for Origin which is set dynamically)
 */
export const corsHeaders: CorsHeaders = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
  'Access-Control-Allow-Credentials': 'true',
};

/**
 * Convert CorsHeaders object to HeadersInit for NextResponse
 */
function corsHeadersToHeadersInit(headers: CorsHeaders): HeadersInit {
  const result: Record<string, string> = {};
  
  Object.entries(headers).forEach(([key, value]) => {
    if (value !== undefined) {
      result[key] = value;
    }
  });
  
  return result;
}

/**
 * Composes multiple middleware functions into a single middleware
 * Middleware is applied in the order provided (first in array is applied first)
 * 
 * @param middlewares - Array of middleware functions to compose
 * @returns A single composed middleware function
 */
export function composeMiddleware(middlewares: Middleware[]): Middleware {
  return (handler: RouteHandler): RouteHandler => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
  };
}

/**
 * Applies multiple middleware functions to a route handler
 * Middleware is applied in the order provided (first in array is applied first)
 * 
 * @param handler - The route handler to wrap
 * @param middlewares - Array of middleware functions to apply
 * @returns The wrapped handler with all middleware applied
 */
export function withMiddleware(
  handler: RouteHandler,
  ...middlewares: Middleware[]
): RouteHandler {
  return composeMiddleware(middlewares)(handler);
}

/**
 * Validate if an origin is allowed
 */
const isOriginAllowed = (origin: string | null): boolean => {
  if (!origin) return false;
  
  const allowedOrigins = getAllowedOrigins();
  return allowedOrigins.some(allowed => 
    origin === allowed || origin.startsWith(allowed)
  );
};

/**
 * Creates a middleware that adds CORS headers to the response
 * 
 * @param options - CORS options
 * @returns A middleware function that adds CORS headers
 */
export function withCors(options: {
  allowedOrigins?: string[];
  allowedMethods?: string[];
  allowedHeaders?: string[];
  allowCredentials?: boolean;
} = {}): Middleware {
  // Create new headers object from preset without origin (which will be set dynamically)
  const baseHeaders: CorsHeaders = { ...corsHeaders };
  
  if (options.allowedMethods) {
    baseHeaders['Access-Control-Allow-Methods'] = options.allowedMethods.join(', ');
  }
  
  if (options.allowedHeaders) {
    baseHeaders['Access-Control-Allow-Headers'] = options.allowedHeaders.join(', ');
  }
  
  if (options.allowCredentials !== undefined) {
    baseHeaders['Access-Control-Allow-Credentials'] = options.allowCredentials.toString();
  }
  
  return (handler: RouteHandler): RouteHandler => {
    return async (req: NextRequest, ...args: any[]) => {
      // Get the origin from the request
      const origin = req.headers.get('origin');
      const allowedOrigins = options.allowedOrigins || getAllowedOrigins();
      
      // Process CORS headers based on the origin
      const responseHeaders: CorsHeaders = { ...baseHeaders };
      
      // Only set Access-Control-Allow-Origin if the origin is allowed
      if (origin && isOriginAllowed(origin)) {
        responseHeaders['Access-Control-Allow-Origin'] = origin;
      } else if (process.env.NODE_ENV === 'development') {
        // In development, allow all origins for easier testing
        responseHeaders['Access-Control-Allow-Origin'] = origin || '*';
      }
      
      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        return new NextResponse(null, { 
          headers: corsHeadersToHeadersInit(responseHeaders) 
        });
      }
      
      // For normal requests, process the handler
      const response = await handler(req, ...args);
      
      // Add CORS headers to the response
      Object.entries(responseHeaders).forEach(([key, value]) => {
        if (value !== undefined) {
          response.headers.set(key, value);
        }
      });
      
      return response;
    };
  };
}

/**
 * Creates a middleware that catches errors thrown by the handler
 * 
 * @returns A middleware function that catches errors
 */
export function withErrorHandling(): Middleware {
  return (handler: RouteHandler): RouteHandler => {
    return async (req: NextRequest, ...args: any[]) => {
      try {
        return await handler(req, ...args);
      } catch (error) {
        console.error(`Error in ${req.method} ${req.nextUrl.pathname}:`, error);
        
        // If the error is already a Response, return it
        if (error instanceof Response) {
          return NextResponse.json(
            await error.json(),
            { status: error.status, headers: error.headers }
          );
        }
        
        // Otherwise, return a generic 500 error
        return NextResponse.json(
          { error: 'Internal Server Error' },
          { status: 500 }
        );
      }
    };
  };
}

/**
 * Combines common middleware for API routes
 * 
 * @param options - Configuration options
 * @returns Combined middleware
 */
export function withCommonMiddleware(options: { 
  enableCsrf?: boolean 
} = {}): Middleware {
  const { enableCsrf = true } = options;
  
  const middlewares: Middleware[] = [
    withCors(),
    withErrorHandling()
  ];
  
  if (enableCsrf) {
    // Import dynamically to avoid circular dependency
    const { withCsrfProtection } = require('./csrf');
    middlewares.push(withCsrfProtection());
  }
  
  return composeMiddleware(middlewares);
} 