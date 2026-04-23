import { prisma } from '@/lib/prisma'
import { ApiError, successResponse } from '@/lib/api-response'
import { headers } from 'next/headers'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { helpDeskId, domainId, isHelpful, sessionId } = body

    // Validate required fields
    if (!helpDeskId || !domainId || typeof isHelpful !== 'boolean') {
      return ApiError.BadRequest('Missing required fields: helpDeskId, domainId, isHelpful')
    }

    // Get request headers for tracking
    const headersList = headers()
    const userAgent = headersList.get('user-agent') || undefined
    const forwarded = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const ipAddress = forwarded?.split(',')[0] || realIp || undefined

    // Check if feedback already exists for this session/article combination
    if (sessionId) {
      const existingFeedback = await prisma.helpDeskFeedback.findFirst({
        where: {
          helpDeskId,
          sessionId,
        },
      })

      if (existingFeedback) {
        // Update existing feedback instead of creating duplicate
        const updatedFeedback = await prisma.helpDeskFeedback.update({
          where: { id: existingFeedback.id },
          data: {
            isHelpful,
            userAgent,
            ipAddress,
          },
        })

        return successResponse({
          id: updatedFeedback.id,
          message: 'Feedback updated successfully',
        })
      }
    }

    // Create new feedback entry
    const feedback = await prisma.helpDeskFeedback.create({
      data: {
        helpDeskId,
        domainId,
        isHelpful,
        sessionId,
        userAgent,
        ipAddress,
      },
    })

    return successResponse({
      id: feedback.id,
      message: 'Feedback submitted successfully',
    })
  } catch (error) {
    console.error('Failed to submit helpdesk feedback:', error)
    return ApiError.InternalError('Failed to submit feedback')
  }
} 