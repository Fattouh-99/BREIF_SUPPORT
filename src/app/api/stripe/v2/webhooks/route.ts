import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe, getPlanByPriceId, PLANS, PlanType } from '@/lib/stripe/config'
import { prisma } from '@/lib/prisma'
import { clerkClient } from '@clerk/nextjs'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Handle CORS preflight requests
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, stripe-signature',
      'Access-Control-Max-Age': '86400'
    }
  })
}

export async function POST(req: NextRequest) {
  console.log('Stripe webhook v2 received')
  
  const body = await req.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    console.error('No Stripe signature in webhook request')
    return new Response(
      JSON.stringify({ error: 'No signature' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    console.log('Webhook signature verified, event type:', event.type)

    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
      }

      case 'customer.subscription.deleted': {
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
      }

      case 'invoice.payment_failed': {
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: 'Webhook handler failed' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// Handle successful checkout session
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Processing checkout session completed:', session.id)

  const userId = session.metadata?.userId
  if (!userId) {
    console.error('No userId in checkout session metadata')
    return
  }

  // Subscription will be handled by subscription.created event
  // Just log for now
  console.log('Checkout completed for user:', userId)
}

// Handle subscription created/updated
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Processing subscription update:', subscription.id)

  const userId = subscription.metadata?.userId
  if (!userId) {
    console.error('No userId in subscription metadata')
    return
  }

  // Get plan from subscription
  const priceId = subscription.items.data[0]?.price.id
  if (!priceId) {
    console.error('No price ID found in subscription')
    return
  }

  const planType = getPlanByPriceId(priceId)
  if (!planType) {
    console.error('Unknown price ID:', priceId)
    return
  }

  const plan = PLANS[planType]
  
  try {
    // Get user to update Clerk metadata
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { clerkId: true }
    })

    // Update database
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscription: {
          upsert: {
            create: {
              plan: planType.toLowerCase(),
              credits: plan.credits,
              stripeSubscriptionId: subscription.id,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              status: subscription.status,
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
            },
            update: {
              plan: planType.toLowerCase(),
              credits: plan.credits,
              stripeSubscriptionId: subscription.id,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              status: subscription.status,
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
            }
          }
        }
      }
    })

    // Update Clerk metadata
    if (user?.clerkId) {
      await clerkClient.users.updateUser(user.clerkId, {
        publicMetadata: {
          hasActiveSubscription: subscription.status === 'active',
          subscriptionPlan: planType,
          subscriptionStart: new Date(subscription.start_date * 1000).toISOString()
        }
      })
    }

    // Create notification
    const message = subscription.cancel_at_period_end
      ? `Your subscription will be cancelled at the end of the billing period (${new Date(subscription.current_period_end * 1000).toLocaleDateString()})`
      : `Your subscription has been updated to ${plan.name} Plan`

    await prisma.notification.create({
      data: {
        type: 'PLAN_UPGRADE',
        message,
        userId,
        read: false
      }
    })

    console.log('Subscription updated successfully for user:', userId)
  } catch (error) {
    console.error('Error updating subscription:', error)
  }
}

// Handle subscription deleted
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Processing subscription deletion:', subscription.id)

  const userId = subscription.metadata?.userId
  if (!userId) {
    console.error('No userId in subscription metadata')
    return
  }

  try {
    // Get user for Clerk update
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { clerkId: true }
    })

    // Update to free plan
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscription: {
          update: {
            plan: 'standard',
            credits: PLANS.STANDARD.credits,
            status: 'canceled',
            cancelAtPeriodEnd: false,
          }
        }
      }
    })

    // Update Clerk metadata
    if (user?.clerkId) {
      await clerkClient.users.updateUser(user.clerkId, {
        publicMetadata: {
          hasActiveSubscription: false,
          subscriptionPlan: 'STANDARD',
        }
      })
    }

    // Create notification
    await prisma.notification.create({
      data: {
        type: 'PLAN_UPGRADE',
        message: 'Your subscription has been canceled. You have been moved to the Standard plan.',
        userId,
        read: false
      }
    })

    console.log('Subscription deleted successfully for user:', userId)
  } catch (error) {
    console.error('Error handling subscription deletion:', error)
  }
}

// Handle successful invoice payment
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Processing successful invoice payment:', invoice.id)

  const customerId = invoice.customer as string
  const user = await prisma.user.findFirst({
    where: { stripeId: customerId },
    select: { id: true }
  })

  if (!user) {
    console.error('No user found for customer:', customerId)
    return
  }

  // Create notification for successful payment
  await prisma.notification.create({
    data: {
      type: 'PLAN_UPGRADE',
      message: `Payment of $${(invoice.amount_paid / 100).toFixed(2)} processed successfully.`,
      userId: user.id,
      read: false
    }
  })
}

// Handle failed invoice payment
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Processing failed invoice payment:', invoice.id)

  const customerId = invoice.customer as string
  const user = await prisma.user.findFirst({
    where: { stripeId: customerId },
    select: { id: true }
  })

  if (!user) {
    console.error('No user found for customer:', customerId)
    return
  }

  // Create notification for failed payment
  await prisma.notification.create({
    data: {
      type: 'PLAN_UPGRADE',
      message: 'Your subscription payment failed. Please update your payment method to avoid service interruption.',
      userId: user.id,
      read: false
    }
  })
} 