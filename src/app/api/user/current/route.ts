import { NextRequest, NextResponse } from 'next/server'

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

/**
 * Legacy API endpoint that redirects to the new consolidated endpoint
 * This maintains backward compatibility for existing clients
 */
export async function GET(request: NextRequest) {
  // Get the origin for building the redirect URL
  const origin = new URL(request.url).origin
  
  // Create the new URL with includeTeam parameter
  const redirectUrl = new URL('/api/user/me?includeTeam=true', origin)
  
  // 308 Permanent Redirect maintains the HTTP method and body
  return NextResponse.redirect(redirectUrl, { status: 308 })
}

// Support OPTIONS method for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  })
} 