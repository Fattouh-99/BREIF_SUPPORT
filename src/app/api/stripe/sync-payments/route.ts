import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { ApiError, successResponse } from '@/lib/api-response'
import { prisma } from '@/lib/prisma'
import { PaymentService } from '@/lib/services/payment-service'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * Manually sync user payments from Stripe
 * POST /api/stripe/sync-payments
 */
export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = auth()
    if (!userId) {
      return ApiError.Unauthorized('Not authenticated')
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, stripeId: true }
    })

    if (!user) {
      return ApiError.NotFound('User not found')
    }

    if (!user.stripeId) {
      return ApiError.BadRequest('User has no Stripe customer ID')
    }

    console.log(`Manual sync requested for user ${user.id} with Stripe customer ${user.stripeId}`)

    // Sync payments from Stripe
    const syncResult = await PaymentService.syncUserPaymentsFromStripe(
      user.id,
      user.stripeId
    )

    console.log(`Sync completed: ${syncResult.synced} payments synced, ${syncResult.errors.length} errors`)

    return successResponse({
      synced: syncResult.synced,
      errors: syncResult.errors,
      message: `Successfully synced ${syncResult.synced} payments`
    })

  } catch (error) {
    console.error('Error during manual payment sync:', error)
    return ApiError.InternalError('Failed to sync payments')
  }
} 