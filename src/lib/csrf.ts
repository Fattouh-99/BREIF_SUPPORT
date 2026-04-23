import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';
import { ApiError } from './api-response';

// Configuration
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';
const CSRF_FORM_FIELD = '_csrf';
const TOKEN_LENGTH = 32;
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours in seconds

/**
 * Generate a CSRF token and store it in a secure cookie
 * @returns The generated CSRF token
 */
export function generateCsrfToken(): string {
  // Create a random token
  const token = nanoid(TOKEN_LENGTH);
  
  // Store the token in a cookie
  cookies().set({
    name: CSRF_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
  
  return token;
}

/**
 * Get the current CSRF token or generate a new one
 * @returns The current or newly generated CSRF token
 */
export function getCsrfToken(): string {
  const existingToken = cookies().get(CSRF_COOKIE_NAME)?.value;
  
  if (existingToken) {
    return existingToken;
  }
  
  return generateCsrfToken();
}

/**
 * Validate a CSRF token from a request
 * @param req NextRequest object
 * @returns true if valid, throws an error if invalid
 */
export function validateCsrfToken(req: NextRequest): boolean {
  const storedToken = req.cookies.get(CSRF_COOKIE_NAME)?.value;
  
  if (!storedToken) {
    throw ApiError.BadRequest('CSRF token missing');
  }
  
  // Check for token in headers (for AJAX requests)
  const headerToken = req.headers.get(CSRF_HEADER_NAME);
  
  // For form submissions and JSON requests, check the header
  if (!headerToken) {
    throw ApiError.BadRequest('CSRF token not provided');
  }
  
  if (headerToken !== storedToken) {
    throw ApiError.BadRequest('Invalid CSRF token');
  }
  
  return true;
}

/**
 * A middleware to protect routes against CSRF attacks
 */
export function withCsrfProtection() {
  return (handler: (req: NextRequest) => Promise<NextResponse> | NextResponse) => {
    return async (req: NextRequest) => {
      // Skip CSRF validation for GET, HEAD, OPTIONS requests
      const safeMethod = ['GET', 'HEAD', 'OPTIONS'].includes(req.method);
      
      if (!safeMethod) {
        try {
          validateCsrfToken(req);
        } catch (error) {
          if (error instanceof Response) {
            return error;
          }
          return ApiError.BadRequest('CSRF validation failed').response();
        }
      }
      
      return handler(req);
    };
  };
}

/**
 * Get the CSRF token to be included in fetch requests
 * @returns An object with the CSRF header
 */
export function getCsrfHeader(): HeadersInit {
  return {
    [CSRF_HEADER_NAME]: getCsrfToken()
  };
}

// React hook for CSRF
export function useCsrf() {
  return {
    getCsrfToken,
    getCsrfHeader,
    CSRF_HEADER_NAME,
    CSRF_FORM_FIELD
  };
} 