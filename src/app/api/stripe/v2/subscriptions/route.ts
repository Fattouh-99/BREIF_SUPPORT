import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { SubscriptionService } from '@/lib/stripe/subscription'
import { CheckoutService } from '@/lib/stripe/checkout'
import { PlanType, isValidPlan } from '@/lib/stripe/config'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

// GET - Get current subscription details
export async function GET() {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const subscriptionDetails = await SubscriptionService.getSubscriptionDetails(dbUser.id)

    return NextResponse.json({
      success: true,
      data: subscriptionDetails
    })
  } catch (error) {
    console.error('Error getting subscription details:', error)
    return NextResponse.json(
      { error: 'Failed to get subscription details' },
      { status: 500 }
    )
  }
}

// POST - Create new subscription or upgrade existing one
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { plan, useCheckout = true } = body

    if (!plan || !isValidPlan(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true, email: true }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const email = dbUser.email || user.emailAddresses[0]?.emailAddress
    if (!email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 })
    }

    // For free plan, activate immediately
    if (plan === 'STANDARD') {
      const result = await SubscriptionService.activateFreePlan(dbUser.id, user.id)
      return NextResponse.json({
        success: true,
        data: result
      })
    }

    // Use Stripe Checkout for paid plans
    if (useCheckout) {
      const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL
      const successUrl = `${baseUrl}/settings?success=true&session_id={CHECKOUT_SESSION_ID}`
      const cancelUrl = `${baseUrl}/settings?canceled=true`

      const checkout = await CheckoutService.createSubscriptionCheckout(
        dbUser.id,
        email,
        plan as PlanType,
        successUrl,
        cancelUrl
      )

      // Check if it's a free plan response or checkout response
      if ('sessionUrl' in checkout && 'sessionId' in checkout) {
        return NextResponse.json({
          success: true,
          data: {
            checkoutUrl: checkout.sessionUrl,
            sessionId: checkout.sessionId
          }
        })
      } else {
        // Free plan was activated
        return NextResponse.json({
          success: true,
          data: checkout
        })
      }
    }

    // Fallback to subscription with payment intent (for embedded forms)
    const subscription = await SubscriptionService.createSubscription(
      dbUser.id,
      email,
      plan as PlanType,
      user.id
    )

    return NextResponse.json({
      success: true,
      data: subscription
    })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create subscription' },
      { status: 500 }
    )
  }
}

// PUT - Upgrade/downgrade subscription
export async function PUT(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { plan, useCheckout = true } = body

    if (!plan || !isValidPlan(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // For upgrades to paid plans, use checkout
    if (useCheckout && plan !== 'STANDARD') {
      const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL
      const successUrl = `${baseUrl}/settings?success=true&session_id={CHECKOUT_SESSION_ID}`
      const cancelUrl = `${baseUrl}/settings?canceled=true`

      const checkout = await CheckoutService.createUpgradeCheckout(
        dbUser.id,
        plan as PlanType,
        successUrl,
        cancelUrl
      )

      return NextResponse.json({
        success: true,
        data: {
          checkoutUrl: checkout.sessionUrl,
          sessionId: checkout.sessionId
        }
      })
    }

    // Direct upgrade/downgrade
    const result = await SubscriptionService.upgradeSubscription(dbUser.id, plan as PlanType)

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update subscription' },
      { status: 500 }
    )
  }
}

// DELETE - Cancel subscription
export async function DELETE() {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const result = await SubscriptionService.cancelSubscription(dbUser.id)

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Error canceling subscription:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
} 