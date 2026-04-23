import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // Extract the chatRoomId from query parameters
    const url = new URL(req.url);
    const chatRoomId = url.searchParams.get('chatRoomId');
    
    if (!chatRoomId) {
      return NextResponse.json({ error: 'Chat room ID is required' }, { status: 400 });
    }
    
    console.log(`[API] Fetching messages for chat room: ${chatRoomId}`);
    
    // Auth check
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the chat room with ALL messages
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
      include: {
        message: {
          orderBy: {
            createdAt: 'asc' // Sort chronologically
          }
          // No 'select' to ensure we get all fields that exist in the database
          // No 'take' parameter to ensure ALL messages are fetched
        },
        Customer: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });
    
    if (!chatRoom) {
      console.log(`[API] Chat room not found: ${chatRoomId}`);
      return NextResponse.json({ error: 'Chat room not found' }, { status: 404 });
    }
    
    // Safe access with type assertion
    const messages = chatRoom.message as any[] || [];
    console.log(`[API] Found ${messages.length} messages for chat room: ${chatRoomId}`);
    
    // Log first and last message for debugging
    if (messages.length > 0) {
      const firstMsg = messages[0];
      const lastMsg = messages[messages.length-1];
      
      console.log(`[API] First message: ${new Date(firstMsg.createdAt).toISOString()} | ${firstMsg.role || 'unknown'} | ${firstMsg.message.substring(0, 30)}...`);
      console.log(`[API] Last message: ${new Date(lastMsg.createdAt).toISOString()} | ${lastMsg.role || 'unknown'} | ${lastMsg.message.substring(0, 30)}...`);
    }
    
    // Return the messages
    return NextResponse.json({
      chatRoomId: chatRoom.id,
      customerEmail: chatRoom.Customer?.email,
      live: chatRoom.live,
      paused: chatRoom.paused,
      messages: messages,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[API] Error fetching chat messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 