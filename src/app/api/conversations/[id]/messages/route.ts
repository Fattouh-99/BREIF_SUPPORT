import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the chatRoomId from the URL params
    const chatRoomId = params.id;
    
    // Check if we should include bot messages
    const url = new URL(req.url);
    const includeBotMessages = url.searchParams.get('include_bot') === 'true';
    
    // Auth check
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log(`[API] Fetching COMPLETE message history for room ${chatRoomId}, explicit include_bot=${includeBotMessages}`);
    
    // Find the chat room with ALL messages - no filtering of any kind
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
      include: {
        message: {
          orderBy: {
            createdAt: 'asc'
          },
          // NO where clause here - we want ALL messages
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
      console.error(`[API] Chat room ${chatRoomId} not found`);
      return NextResponse.json({ error: 'Chat room not found' }, { status: 404 });
    }
    
    // Get all messages - only include properties that exist in the schema
    const allMessages = chatRoom.message.map(msg => ({
      id: msg.id,
      message: msg.message,
      role: msg.role || (msg.message.includes('bot') ? 'assistant' : 'user'),
      createdAt: msg.createdAt,
      seen: msg.seen,
      teamMemberId: msg.teamMemberId,
      teamMemberName: msg.teamMemberName
    }));
    
    console.log(`[API] Found ${allMessages.length} total messages for chat room ${chatRoomId}`);
    
    // Log ALL messages for debugging
    if (allMessages.length > 0) {
      console.log(`[API] Message history for ${chatRoomId}:`);
      allMessages.forEach((msg, index) => {
        console.log(`[API] Message ${index+1}/${allMessages.length}: ${msg.role} | ${new Date(msg.createdAt).toISOString()} | ${msg.message.substring(0, 50)}${msg.message.length > 50 ? '...' : ''}`);
      });
    }
    
    return NextResponse.json({
      chatRoomId: chatRoom.id,
      customerEmail: chatRoom.Customer?.email,
      live: chatRoom.live,
      paused: chatRoom.paused,
      messages: allMessages,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[API] Error fetching complete message history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 