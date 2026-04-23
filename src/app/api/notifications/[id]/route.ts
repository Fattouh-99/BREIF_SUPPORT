import { prisma } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { ApiError, successResponse } from '@/lib/api-response'

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    const notification = await prisma.notification.update({
      where: {
        id: params.id,
        userId: dbUser.id,
      },
      data: {
        read: true,
      },
    })

    return successResponse(notification)
  } catch (error) {
    console.error('Failed to update notification:', error)
    return ApiError.InternalError('Failed to update notification')
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    await prisma.notification.delete({
      where: {
        id: params.id,
        userId: dbUser.id,
      },
    })

    return successResponse(null, 204)
  } catch (error) {
    console.error('Failed to delete notification:', error)
    return ApiError.InternalError('Failed to delete notification')
  }
}