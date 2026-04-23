import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { pusherServer } from '@/lib/pusher'

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const chatRoomId = params.id
    if (!chatRoomId) {
      return NextResponse.json(
        { error: 'Chat room ID is required' },
        { status: 400 }
      )
    }

    // Find the current user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        team: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has direct access to the chat room
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
      include: {
        Customer: {
          include: {
            Domain: true
          }
        },
        sharedWith: true,
        sharedBy: true
      }
    })

    if (!chatRoom) {
      return NextResponse.json(
        { error: 'Chat room not found' },
        { status: 404 }
      )
    }

    // Check access permissions
    const isDomainOwner = chatRoom.Customer?.Domain?.userId === user.id
    const isTeamMember = user.teamId && chatRoom.Customer?.Domain?.teamId === user.teamId
    const isSharedDirectly = chatRoom.sharedWith.some((member) => member.id === user.id)
    const isSharer = chatRoom.sharedBy?.id === user.id
    const hasAccess = isDomainOwner || isTeamMember || isSharedDirectly || isSharer

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'You do not have permission to send messages to this chat' },
        { status: 403 }
      )
    }

    // Parse the request body
    const body = await request.json()
    const { message } = body

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      )
    }

    // Create the new message
    const newMessage = await prisma.chatMessage.create({
      data: {
        message,
        role: 'user',
        ChatRoom: {
          connect: { id: chatRoomId }
        }
      }
    })

    try {
      // Use a raw SQL query to update the assignedToId directly
      await prisma.$executeRaw`
        UPDATE "ChatRoom"
        SET "assignedToId" = ${user.id}::uuid, "assignedAt" = NOW()
        WHERE id = ${chatRoomId}::uuid
      `;
      
      // Also trigger an agent assignment event
      await pusherServer.trigger('chat-global', 'agent-assignment', {
        chatRoomId,
        agentId: user.id,
        agentName: user.fullname,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error assigning chat to agent:', error);
      // Continue even if this fails
    }

    // Format message for Pusher
    const messageToSend = {
      id: newMessage.id,
      message: newMessage.message,
      role: newMessage.role,
      createdAt: newMessage.createdAt,
      teamMemberId: user.id,
      teamMemberName: user.fullname,
      seen: false
    }

    // Trigger Pusher events
    // 1. Send to the specific chat room so the customer receives it
    await pusherServer.trigger(chatRoomId, 'chat-message', {
      chat: messageToSend
    })
    
    // 2. Send to the global channel for other agents
    await pusherServer.trigger('chat-global', 'chat-update', {
      timestamp: new Date().toISOString(),
      chatRoomId,
      eventType: 'team-message-sent',
      userId: user.id,
    })
    
    // 3. Send customer message format to ensure compatibility with agent listeners
    await pusherServer.trigger('chat-global', 'customer-message', {
      chatRoomId,
      timestamp: new Date().toISOString(),
      messageId: newMessage.id,
      message: newMessage.message,
      role: newMessage.role
    })

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      data: messageToSend
    })
  } catch (error) {
    console.error('Error sending team message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 