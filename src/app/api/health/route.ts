import { NextRequest, NextResponse } from 'next/server';

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

/**
 * Simple health check endpoint
 * This route should be publicly accessible
 */
export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    nodejs: process.version,
    hostname: req.headers.get('host'),
    forwarded: req.headers.get('x-forwarded-host'),
    env: process.env.NODE_ENV
  });
} 