import { NextRequest, NextResponse } from 'next/server';
import { validateSessionToken } from '@/lib/auth-validators';

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

/**
 * API endpoint to validate a session token without requiring a database lookup
 * Useful for client-side validation and for microservices
 */
export async function POST(req: NextRequest) {
  try {
    // Get token from request body
    const { token } = await req.json();
    
    if (!token) {
      return NextResponse.json({
        valid: false,
        error: 'No token provided'
      }, { status: 400 });
    }
    
    // Validate the token
    const validation = await validateSessionToken(token);
    
    if (!validation.isValid) {
      return NextResponse.json({
        valid: false,
        error: 'Invalid token'
      }, { status: 401 });
    }
    
    // During auth migration, we don't have a payload so we return mock values
    return NextResponse.json({
      valid: true,
      userId: 'auth-migration-user',
      userRole: 'user',
      expiresAt: new Date(Date.now() + 3600000),
    });
  } catch (error) {
    console.error('Error validating session token:', error);
    return NextResponse.json({
      valid: false,
      error: 'Error validating token'
    }, { status: 500 });
  }
}

/**
 * Helper endpoint to check if current user session is valid
 * Uses the cookie from the request
 */
export async function GET(req: NextRequest) {
  try {
    // Get session token from clerk cookie
    const sessionCookie = req.cookies.get('__session');
    
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({
        valid: false,
        error: 'No session cookie found'
      }, { status: 401 });
    }
    
    // Validate the token
    const validation = await validateSessionToken(sessionCookie.value);
    
    if (!validation.isValid) {
      return NextResponse.json({
        valid: false,
        error: 'Invalid session'
      }, { status: 401 });
    }
    
    // During auth migration, return mock data
    return NextResponse.json({
      valid: true,
      userId: 'auth-migration-user',
      expiresAt: new Date(Date.now() + 3600000)
    });
  } catch (error) {
    console.error('Error validating session cookie:', error);
    return NextResponse.json({
      valid: false,
      error: 'Error validating session'
    }, { status: 500 });
  }
} 