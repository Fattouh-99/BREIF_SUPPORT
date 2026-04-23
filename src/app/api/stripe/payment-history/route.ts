import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { ApiError, successResponse } from '@/lib/api-response'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

/**
 * Map frontend status strings to Prisma enum values
 */
function mapStatusStringToEnum(status: string): string | null {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'PENDING'
    case 'processing':
      return 'PROCESSING'
    case 'succeeded':
      return 'SUCCEEDED'
    case 'failed':
      return 'FAILED'
    case 'canceled':
      return 'CANCELED'
    case 'refunded':
      return 'REFUNDED'
    case 'requires_action':
      return 'REQUIRES_ACTION'
    case 'requires_confirmation':
      return 'REQUIRES_CONFIRMATION'
    case 'requires_payment_method':
      return 'REQUIRES_PAYMENT_METHOD'
    default:
      return null
  }
}

/**
 * Fetches the user's payment history from database
 * GET /api/stripe/payment-history
 */
export async function GET(req: NextRequest) {
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

    // Parse URL params for pagination and filtering
    const searchParams = req.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    
    // Map status strings to enum values
    const statusStrings = searchParams.get('status')?.split(',').filter(Boolean) || []
    const statusFilter = statusStrings
      .map(mapStatusStringToEnum)
      .filter(Boolean)

    console.log('Status filter received:', statusStrings, 'mapped to:', statusFilter)

    // Build where clause
    const where: any = {
      userId: user.id,
      ...(statusFilter.length > 0 && {
        status: { in: statusFilter }
      })
    }

    // Get payments directly from database
    const [payments, total] = await Promise.all([
      (prisma as any).payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      (prisma as any).payment.count({ where })
    ])

    // Format the payments
    const formattedPayments = payments.map((payment: any) => ({
      id: payment.stripePaymentId,
      type: payment.type.toLowerCase(),
      amount: parseFloat(payment.amount.toString()),
      currency: payment.currency,
      status: payment.status.toLowerCase(),
      date: payment.processedAt?.toISOString() || payment.periodStart?.toISOString() || payment.createdAt.toISOString(),
      receiptUrl: payment.receiptUrl,
      description: payment.description || 'Payment',
      periodStart: payment.periodStart?.toISOString(),
      periodEnd: payment.periodEnd?.toISOString(),
      paymentMethod: payment.paymentMethod,
    }))

    return successResponse({
      payments: formattedPayments,
      has_more: (offset + limit) < total,
      next_cursor: formattedPayments.length > 0 ? formattedPayments[formattedPayments.length - 1].id : null,
      total,
      source: 'database'
    })

  } catch (error) {
    console.error('Error fetching payment history:', error)
    return ApiError.InternalError('Failed to fetch payment history')
  }
} 