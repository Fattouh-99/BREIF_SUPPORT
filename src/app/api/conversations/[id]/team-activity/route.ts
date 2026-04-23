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
      select: {
        id: true,
        fullname: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if chatRoom exists
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
      select: { id: true }
    })

    if (!chatRoom) {
      return NextResponse.json(
        { error: 'Chat room not found' },
        { status: 404 }
      )
    }

    // Send activity notification via Pusher
    await pusherServer.trigger(`${chatRoomId}-presence`, 'team-member-active', {
      memberId: user.id,
      memberName: user.fullname || 'Support Agent',
      timestamp: new Date()
    })

    return NextResponse.json({
      success: true,
      message: 'Activity notification sent'
    })
  } catch (error) {
    console.error('Error sending team activity notification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 