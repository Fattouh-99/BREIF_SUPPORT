import { pusherServer } from '@/lib/pusher';
import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    // Get the current user session
    const session = await auth();
    const user = await currentUser();
    
    // Get the socket_id and channel_name from the request
    // Pusher sends data as application/x-www-form-urlencoded, not JSON
    const contentType = request.headers.get('content-type') || '';
    
    let socket_id: string | null = null;
    let channel_name: string | null = null;
    
    if (contentType.includes('application/json')) {
      // Handle JSON format (for testing/future compatibility)
      const data = await request.json();
      socket_id = data.socket_id;
      channel_name = data.channel_name;
    } else {
      // Handle form data format (what Pusher actually sends)
      const formData = await request.formData();
      socket_id = formData.get('socket_id') as string;
      channel_name = formData.get('channel_name') as string;
      
      // If formData is empty, try with text body (URL-encoded)
      if (!socket_id || !channel_name) {
        const text = await request.text();
        const params = new URLSearchParams(text);
        socket_id = params.get('socket_id');
        channel_name = params.get('channel_name');
      }
    }
    
    // Make sure we have the required data
    if (!socket_id || !channel_name) {
      console.error('Missing socket_id or channel_name', { socket_id, channel_name });
      return new NextResponse(JSON.stringify({
        error: 'Missing socket_id or channel_name'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }
    
    // Determine which user data to include in the authentication
    const userData = {
      user_id: user?.id || session?.userId || 'anonymous',
      user_info: {
        name: user?.firstName || 'Guest',
        email: user?.emailAddresses?.[0]?.emailAddress || 'guest@example.com',
      }
    };
    
    if (!pusherServer) {
      return new NextResponse(JSON.stringify({ error: 'Pusher not configured' }), {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }

    // Authenticate the user for this channel
    const authResponse = pusherServer.authorizeChannel(socket_id, channel_name, userData);
    
    // Return the auth response with CORS headers
    return new NextResponse(JSON.stringify(authResponse), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  } catch (error) {
    console.error('Error in Pusher auth endpoint:', error);
    return new NextResponse(JSON.stringify({ error: 'Pusher authentication failed', details: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }
}

// Handle preflight OPTIONS requests for CORS
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
} 