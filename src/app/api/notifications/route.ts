import { prisma } from '@/lib/prisma'
import { pusherServer } from '@/lib/pusher'
import { currentUser } from '@clerk/nextjs/server'
import { successResponse, ApiError } from '@/lib/api-response'

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

export async function GET() {
  try {
    const user = await currentUser()
    if (!user) {
      return ApiError.Unauthorized()
    }

    // First get the user's ID from our database using their Clerk ID
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true }
    })

    if (!dbUser) {
      return ApiError.NotFound('User not found')
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: dbUser.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return successResponse(notifications)
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
    return ApiError.InternalError('Failed to fetch notifications')
  }
}

export async function POST(req: Request) {
  try {
    const user = await currentUser()
    if (!user) {
      return ApiError.Unauthorized()
    }

    const { type, message } = await req.json()

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { 
        id: true,
        domains: {
          take: 1,
          select: { id: true }
        }
      }
    })

    if (!dbUser) {
      return ApiError.NotFound('User not found')
    }

    const notification = await prisma.notification.create({
      data: {
        type,
        message,
        userId: dbUser.id,
        domainId: dbUser.domains[0]?.id,
      },
    })

    // Trigger Pusher event for real-time notification
    await pusherServer.trigger(`user-${dbUser.id}`, 'notification', notification)

    return successResponse(notification)
  } catch (error) {
    console.error('Failed to create notification:', error)
    return ApiError.InternalError('Failed to create notification')
  }
} 