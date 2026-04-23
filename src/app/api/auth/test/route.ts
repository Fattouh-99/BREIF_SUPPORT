import { NextRequest, NextResponse } from 'next/server';

// Simple test endpoint to check if middleware is correctly bypassing auth API routes
export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Auth API test endpoint is working correctly',
    requestUrl: req.url,
    timestamp: new Date().toISOString()
  });
}

export async function POST(req: NextRequest) {
  // Parse request body with error handling
  let requestBody;
  try {
    requestBody = await req.json();
  } catch (error) {
    requestBody = { error: 'No JSON body' };
  }
  
  return NextResponse.json({
    success: true,
    message: 'Auth API POST test endpoint is working correctly',
    receivedData: requestBody,
    timestamp: new Date().toISOString()
  });
} 