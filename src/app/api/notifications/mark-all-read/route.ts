import { prisma } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { ApiError, successResponse } from '@/lib/api-response'

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

export async function POST() {
  try {
    const user = await currentUser()
    if (!user) {
      return ApiError.Unauthorized()
    }

    // Get the user's ID from our database using their Clerk ID
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true }
    })

    if (!dbUser) {
      return ApiError.NotFound('User not found')
    }

    // Update all unread notifications for the user
    await prisma.notification.updateMany({
      where: {
        userId: dbUser.id,
        read: false,
      },
      data: {
        read: true,
      },
    })

    return successResponse({ message: 'All notifications marked as read' })
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error)
    return ApiError.InternalError('Failed to mark all notifications as read')
  }
} 