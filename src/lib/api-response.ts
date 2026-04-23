import { NextResponse } from 'next/server'

export type ErrorDetails = string | Record<string, any> | null

/**
 * Standard CORS headers for API responses
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

/**
 * Cache control presets for API responses
 */
export const cachePresets = {
  // No caching
  noStore: {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
  // Short cache for dynamic data that updates frequently
  short: {
    'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=300',
  },
  // Medium cache for data that updates occasionally
  medium: {
    'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=1800',
  }, 
  // Long cache for data that rarely changes
  long: {
    'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
  }
}

/**
 * Creates a standardized success response
 * 
 * @param data - The data to return in the response
 * @param status - HTTP status code (default: 200)
 * @param headers - Additional headers to include
 * @returns NextResponse with standardized success format
 */
export function successResponse(
  data: any, 
  status = 200, 
  headers: HeadersInit = {}
): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: { ...corsHeaders, ...headers },
  })
}

/**
 * Creates a cached success response with appropriate cache headers
 * 
 * @param data - The data to return in the response
 * @param cacheType - Cache preset to use (short, medium, long)
 * @param status - HTTP status code (default: 200)
 * @param headers - Additional headers to include
 * @returns NextResponse with standardized success format and caching
 */
export function cachedSuccessResponse(
  data: any,
  cacheType: keyof typeof cachePresets = 'short',
  status = 200,
  headers: HeadersInit = {}
): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: { 
      ...corsHeaders, 
      ...cachePresets[cacheType], 
      ...headers 
    },
  })
}

/**
 * Creates a standardized error response
 * 
 * @param message - The error message
 * @param status - HTTP status code (default: 500)
 * @param details - Additional error details (optional)
 * @param headers - Additional headers to include
 * @returns NextResponse with standardized error format
 */
export function errorResponse(
  message: string,
  status = 500,
  details: ErrorDetails = null,
  headers: HeadersInit = {}
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      ...(details && { details }),
    },
    {
      status,
      headers: { ...corsHeaders, ...cachePresets.noStore, ...headers },
    }
  )
}

/**
 * Common error responses
 */
export const ApiError = {
  Unauthorized: (details?: ErrorDetails) => {
    const res = errorResponse('Unauthorized', 401, details);
    return Object.assign(res, {
      response: () => res
    });
  },
  
  NotFound: (message = 'Resource not found', details?: ErrorDetails) => {
    const res = errorResponse(message, 404, details);
    return Object.assign(res, {
      response: () => res
    });
  },
  
  BadRequest: (message = 'Bad request', details?: ErrorDetails) => {
    const res = errorResponse(message, 400, details);
    return Object.assign(res, {
      response: () => res
    });
  },

  Forbidden: (message = 'Forbidden', details?: ErrorDetails) => {
    const res = errorResponse(message, 403, details);
    return Object.assign(res, {
      response: () => res
    });
  },
  
  InternalError: (details?: ErrorDetails) => {
    const res = errorResponse('Internal server error', 500, details);
    return Object.assign(res, {
      response: () => res
    });
  },
  
  ServiceUnavailable: (details?: ErrorDetails) => {
    const res = errorResponse('Service temporarily unavailable', 503, details);
    return Object.assign(res, {
      response: () => res
    });
  }
} 