import { prisma } from '@/lib/prisma'
import { ApiError, successResponse } from '@/lib/api-response'

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

export async function DELETE() {
  try {
    // Calculate the date 15 days ago
    const fifteenDaysAgo = new Date()
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15)

    // Delete notifications older than 15 days
    const result = await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: fifteenDaysAgo
        }
      }
    })

    return successResponse({
      message: `Successfully deleted ${result.count} old notifications`,
      count: result.count
    })
  } catch (error) {
    console.error('Failed to cleanup old notifications:', error)
    return ApiError.InternalError('Failed to cleanup old notifications')
  }
} 