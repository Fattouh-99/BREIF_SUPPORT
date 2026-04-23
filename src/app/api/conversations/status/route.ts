import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    
    console.log(`[API DEBUG] Checking status for chat room: ${chatRoomId}`);
    
    // Get the chat room with detailed info
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
      include: {
        Customer: {
          select: {
            id: true,
            email: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            fullname: true,
            email: true
          }
        },
        message: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });
    
    if (!chatRoom) {
      console.log(`[API DEBUG] Chat room not found: ${chatRoomId}`);
      return NextResponse.json({ error: 'Chat room not found' }, { status: 404 });
    }
    
    // Format the response to include essential information
    const response = {
      id: chatRoom.id,
      live: chatRoom.live,
      paused: chatRoom.paused,
      customer: chatRoom.Customer ? {
        id: chatRoom.Customer.id,
        email: chatRoom.Customer.email
      } : null,
      assignedAgent: chatRoom.assignedTo ? {
        id: chatRoom.assignedTo.id,
        name: chatRoom.assignedTo.fullname,
        email: chatRoom.assignedTo.email
      } : null,
      // Convert agent info to supportAgent format if available
      supportAgent: chatRoom.assignedTo ? {
        name: chatRoom.assignedTo.fullname,
        role: 'support'
      } : {
        name: 'Support Agent',
        role: 'support'
      },
      lastMessage: chatRoom.message.length > 0 ? {
        id: chatRoom.message[0].id,
        content: chatRoom.message[0].message,
        role: chatRoom.message[0].role,
        timestamp: chatRoom.message[0].createdAt
      } : null,
      lastActivity: chatRoom.updatedAt
    };
    
    console.log(`[API DEBUG] ✅ Retrieved status for chat room: ${chatRoomId}, live: ${response.live}`);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('[API ERROR] Error checking chat room status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 