import { NextRequest } from 'next/server';
import { generateCsrfToken, getCsrfToken } from '@/lib/csrf';
import { successResponse } from '@/lib/api-response';

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

/**
 * API endpoint for generating CSRF tokens
 * 
 * GET: Generate a new CSRF token and set it in a cookie
 * Returns the token to be used in forms and requests
 */
export async function GET(_req: NextRequest) {
  // Get existing token or generate a new one
  const token = getCsrfToken();
  
  // Return the token to the client
  return successResponse({ token });
} 