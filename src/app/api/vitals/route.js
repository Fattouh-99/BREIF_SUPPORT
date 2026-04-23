import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Get the web vitals data from the request
    const body = await request.json();
    
    // Log vitals to server logs
    console.log('[Web Vitals]', JSON.stringify(body));
    
    // In a production environment, you would store this data
    // in a database or send to an analytics service
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving web vitals:', error);
    return NextResponse.json({ error: 'Failed to save web vitals' }, { status: 500 });
  }
}

// Specify the runtime
export const runtime = 'edge'; 