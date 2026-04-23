import { prisma } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { ApiError, successResponse } from '@/lib/api-response'

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser()
    if (!user) {
      return ApiError.Unauthorized()
    }

    // Get the user's database ID
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true }
    })

    if (!dbUser) {
      return ApiError.NotFound('User not found')
    }

    // Delete the question
    await prisma.filterQuestions.delete({
      where: {
        id: params.id,
      },
    })

    return successResponse(null, 204)
  } catch (error) {
    console.error('Failed to delete question:', error)
    return ApiError.InternalError('Failed to delete question')
  }
} 