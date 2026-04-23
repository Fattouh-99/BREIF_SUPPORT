import { NextResponse } from 'next/server';

// Force Node.js runtime to avoid Edge issues
export const runtime = 'nodejs';

/**
 * Simplified API endpoint for Vercel deployment
 */
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Service operational'
  });
}

export async function POST() {
  return NextResponse.json({ 
    success: true,
    status: 'ok'
  });
}
