import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get chat room ID from params
    const chatRoomId = params.id;
    
    console.log(`[API] Getting conversation details for chat room: ${chatRoomId}`);
    
    // Auth check
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { team: true }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get chat room with ALL messages and no filtering
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
      include: {
        message: {
          orderBy: {
            createdAt: 'asc'
          }
          // No 'select' to avoid fields that don't exist in schema
          // No 'take' limit to ensure ALL messages are included
        },
        Customer: {
          select: {
            id: true,
            email: true,
            domainId: true,
            Domain: {
              select: {
                id: true,
                name: true,
                userId: true,
                teamId: true
              }
            }
          }
        },
        sharedWith: {
          select: {
            id: true,
            fullname: true
          }
        },
        sharedBy: {
          select: {
            id: true,
            fullname: true
          }
        }
      }
    });
    
    if (!chatRoom) {
      console.log(`[API] Chat room not found: ${chatRoomId}`);
      return NextResponse.json({ error: 'Chat room not found' }, { status: 404 });
    }
    
    // Safe access with type assertion for logging
    const messages = chatRoom.message as any[] || [];
    console.log(`[API] Found chat room with ${messages.length} messages`);
    
    // Check if user has access to this chat room
    const isOwner = chatRoom.Customer?.Domain?.userId === user.id;
    const isTeamMember = chatRoom.Customer?.Domain?.teamId === user.teamId;
    const isSharedWith = chatRoom.sharedWith.some(member => member.id === user.id);
    const isSharer = chatRoom.sharedById === user.id;
    
    if (!isOwner && !isTeamMember && !isSharedWith && !isSharer) {
      console.log(`[API] User does not have access to chat room: ${chatRoomId}`);
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    // Return the full chat room data with all messages
    return NextResponse.json(chatRoom);
  } catch (error) {
    console.error('[API] Error getting chat room:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 