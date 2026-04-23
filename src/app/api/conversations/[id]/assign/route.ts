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

    // Get request body
    const body = await request.json()
    const { agentId } = body

    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      )
    }

    // Check if the agent is the current user or if they have permission to assign
    if (agentId !== user.id) {
      return NextResponse.json(
        { error: 'You can only assign conversations to yourself' },
        { status: 403 }
      )
    }

    // Check if user has access to the chat room
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
      include: {
        Customer: {
          include: {
            Domain: true
          }
        },
        sharedWith: true,
        sharedBy: true,
        assignedTo: true
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
        { error: 'You do not have permission to access this chat' },
        { status: 403 }
      )
    }

    // Check if the conversation is already assigned to someone else
    if (chatRoom.assignedTo && chatRoom.assignedTo.id !== user.id) {
      return NextResponse.json({
        error: `This conversation is already assigned to ${chatRoom.assignedTo.fullname}`,
        currentAssignee: {
          id: chatRoom.assignedTo.id,
          name: chatRoom.assignedTo.fullname
        }
      }, { status: 409 }) // Conflict
    }

    // Update the assignment using the new relation
    const now = new Date()
    
    try {
      // Use Prisma's update method instead of raw SQL
      await prisma.chatRoom.update({
        where: { id: chatRoomId },
        data: {
          assignedToId: user.id,
          assignedAt: now
        }
      });
    } catch (error) {
      console.error('Error updating assignment:', error)
      return NextResponse.json(
        { error: 'Failed to update assignment' },
        { status: 500 }
      )
    }

    // Create a system message about the assignment
    const systemMessage = await prisma.chatMessage.create({
      data: {
        message: `${user.fullname} is now handling this conversation.`,
        role: 'assistant',
        seen: false,
        chatRoomId,
      },
    })

    // Notify about the assignment
    await pusherServer.trigger('chat-global', 'agent-assignment', {
      chatRoomId,
      agent: {
        id: user.id,
        name: user.fullname
      },
      timestamp: now.toISOString(),
      messageId: systemMessage.id
    })

    // Also trigger a message event for the system message
    await pusherServer.trigger(chatRoomId, 'chat-message', {
      id: systemMessage.id,
      message: systemMessage.message,
      role: systemMessage.role,
      createdAt: systemMessage.createdAt,
      seen: systemMessage.seen
    })

    return NextResponse.json({
      success: true,
      message: 'Conversation assigned successfully',
      assignedTo: {
        id: user.id,
        name: user.fullname
      },
      assignedAt: now
    })
  } catch (error) {
    console.error('Error assigning conversation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 