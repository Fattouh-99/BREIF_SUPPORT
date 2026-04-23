import { ApiError, successResponse } from '@/lib/api-response'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser()
    if (!user) {
      return ApiError.Unauthorized()
    }

    const domain = await prisma.domain.findUnique({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        chatBot: true,
      },
    })

    if (!domain) {
      return ApiError.NotFound('Domain not found')
    }

    return successResponse(domain)
  } catch (error) {
    console.error('Error fetching bot configuration:', error)
    return ApiError.InternalError('Error fetching bot configuration')
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser()
    if (!user) {
      return ApiError.Unauthorized()
    }

    const config = await req.json()

    // First get the user's database ID
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true }
    })

    if (!dbUser) {
      return ApiError.NotFound('User not found')
    }

    // Get the domain
    const domain = await prisma.domain.findUnique({
      where: {
        id: params.id,
        userId: dbUser.id,
      },
      include: {
        chatBot: true,
      },
    })

    if (!domain) {
      return ApiError.NotFound('Domain not found')
    }

    // Update or create chatbot configuration
    const updatedDomain = await prisma.domain.update({
      where: {
        id: domain.id,
      },
      data: {
        chatBot: {
          upsert: {
            create: {
              personality: config.personality,
              tone: config.tone,
              businessDescription: config.businessDescription,
              industry: config.industry,
              responseStyle: config.responseStyle,
              handoffPreference: config.handoffPreference,
              shippingEnabled: config.shippingEnabled,
              shippingTime: config.shippingTime,
              shippingRegions: config.shippingRegions,
              shippingCosts: config.shippingCosts,
              freeShippingThreshold: config.freeShippingThreshold ? parseFloat(config.freeShippingThreshold) : null,
              welcomeMessage: domain.chatBot?.welcomeMessage || 'Hey there, have a question? Text us here',
              iconColor: domain.chatBot?.iconColor || '#6366F1',
              iconStyle: domain.chatBot?.iconStyle || 'Default',
            },
            update: {
              personality: config.personality,
              tone: config.tone,
              businessDescription: config.businessDescription,
              industry: config.industry,
              responseStyle: config.responseStyle,
              handoffPreference: config.handoffPreference,
              shippingEnabled: config.shippingEnabled,
              shippingTime: config.shippingTime,
              shippingRegions: config.shippingRegions,
              shippingCosts: config.shippingCosts,
              freeShippingThreshold: config.freeShippingThreshold ? parseFloat(config.freeShippingThreshold) : null,
            },
          },
        },
      },
      include: {
        chatBot: true,
      },
    })

    return successResponse(updatedDomain)
  } catch (err) {
    const error = err as Error
    console.error('Error configuring domain:', error)
    return ApiError.InternalError(`Error configuring domain: ${error.message}`)
  }
} 