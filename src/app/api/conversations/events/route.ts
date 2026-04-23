import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { pusherServer } from '@/lib/pusher';

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

/**
 * API endpoint to trigger Pusher events for real-time conversation updates
 * This allows us to completely eliminate polling and rely on event-driven updates
 */
export async function POST(req: Request) {
  try {
    // Auth check
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const body = await req.json();
    const { event, data = {} } = body;

    if (!event) {
      return NextResponse.json({ error: 'Event name is required' }, { status: 400 });
    }

    console.log(`[API] Triggering event ${event}`, data);

    // Validate event name
    const allowedEvents = ['chat-list-update', 'customer-message', 'new-conversation', 'agent-assignment'];
    if (!allowedEvents.includes(event)) {
      return NextResponse.json({ 
        error: `Invalid event name. Allowed events: ${allowedEvents.join(', ')}` 
      }, { status: 400 });
    }

    // Add timestamp to data
    const eventData = {
      ...data,
      timestamp: new Date().toISOString()
    };

    // Trigger Pusher event
    await pusherServer.trigger('chat-global', event, eventData);

    return NextResponse.json({
      success: true,
      event,
      timestamp: eventData.timestamp
    });
  } catch (error) {
    console.error('[API] Error triggering event:', error);
    
    return NextResponse.json({ 
      error: 'Failed to trigger event',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 