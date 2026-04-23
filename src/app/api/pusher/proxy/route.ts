import { NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher';
import { auth } from '@clerk/nextjs/server';

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get the event details from the request
    const requestData = await request.json();
    const { channel, event, data } = requestData;

    if (!channel || !event) {
      return new NextResponse(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!pusherServer) {
      return new NextResponse(JSON.stringify({ error: 'Pusher not configured' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Trigger the event using the server-side Pusher instance
    const result = await pusherServer.trigger(channel, event, data || {});

    return new NextResponse(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in Pusher proxy:', error);
    return new NextResponse(JSON.stringify({ 
      error: 'Failed to proxy Pusher event',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 