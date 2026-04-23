import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

/**
 * API endpoint for accessing gateway routes information
 * Protected by Clerk authentication
 */
export async function GET(req: NextRequest) {
  try {
    // Get authentication state using Clerk's auth() helper
    const { userId } = auth();
    
    // Log auth attempt for debugging
    console.log('Auth attempt at /api/actuator/gateway/routes', {
      userId,
      host: req.headers.get('host'),
      forwarded: req.headers.get('x-forwarded-host')
    });
    
    // If no user is authenticated, return 401 Unauthorized
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // If authenticated, return the routes information
    return NextResponse.json({
      status: 'ok',
      routes: [
        {
          id: 'dashboard',
          path: '/dashboard',
          description: 'Main dashboard route'
        },
        {
          id: 'settings',
          path: '/settings',
          description: 'User settings route'
        },
        // Add more routes as needed
      ]
    });
  } catch (error) {
    console.error('Error in gateway routes API:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 