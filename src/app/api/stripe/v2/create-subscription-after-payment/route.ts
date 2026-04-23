import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { stripe } from '@/lib/stripe/config'
import { PLANS, type PlanType } from '@/lib/stripe/config'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planId, customerId, paymentMethodId } = await req.json()

    if (!planId || !PLANS[planId as PlanType]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const plan = PLANS[planId as PlanType]

    if (!plan.priceId) {
      return NextResponse.json({ error: 'Plan price ID not configured' }, { status: 400 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { subscription: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Attach payment method to customer for future use
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId
    })

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    })

    // Cancel existing subscription if any
    if (user.subscription?.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(user.subscription.stripeSubscriptionId)
      } catch (error) {
        console.error('Error canceling existing subscription:', error)
        // Continue with creating new subscription
      }
    }

    // Create subscription in Stripe
    const stripeSubscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{
        price: plan.priceId
      }],
      default_payment_method: paymentMethodId,
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId: user.id,
        planId,
        clerkId: userId
      }
    })

    // Calculate period end date
    const currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000)

    // Create or update subscription in database
    const subscriptionData = {
      plan: planId,
      credits: plan.credits,
      stripeSubscriptionId: stripeSubscription.id,
      currentPeriodEnd,
      status: stripeSubscription.status,
      cancelAtPeriodEnd: false
    }

    if (user.subscription) {
      // Update existing subscription
      await prisma.billings.update({
        where: { userId: user.id },
        data: subscriptionData
      })
    } else {
      // Create new subscription
      await prisma.billings.create({
        data: {
          ...subscriptionData,
          userId: user.id
        }
      })
    }

    return NextResponse.json({
      success: true,
      subscription: {
        id: stripeSubscription.id,
        status: stripeSubscription.status,
        currentPeriodEnd,
        plan: planId
      }
    })

  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
} 