import { NextResponse } from 'next/server';

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

/**
 * Heartbeat API endpoint for client-side health checking
 * Used by the Clerk auth network heartbeat to confirm
 * connectivity and session validity
 */
export async function GET() {
  return NextResponse.json(
    { 
      status: 'healthy', 
      timestamp: new Date().toISOString() 
    },
    { 
      status: 200,
      headers: {
        // Ensure response isn't cached
        'Cache-Control': 'no-store, max-age=0',
        // Add CORS headers to allow checks from any origin
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS'
      }
    }
  );
}

/**
 * HEAD method support for lighter network checks
 */
export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      // Ensure response isn't cached
      'Cache-Control': 'no-store, max-age=0',
      // Add CORS headers
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS'
    }
  });
}

/**
 * OPTIONS method for CORS preflight requests
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    }
  });
}

export const dynamic = 'force-dynamic'; 