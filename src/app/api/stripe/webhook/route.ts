import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { PaymentService } from '@/lib/services/payment-service'


const stripe = new Stripe(process.env.STRIPE_SECRET!, {
  apiVersion: '2024-04-10',
  typescript: true,
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log(`Processing webhook event: ${event.type}`)

  try {
    switch (event.type) {
      // Payment Intent events
      case 'payment_intent.succeeded':
      case 'payment_intent.payment_failed':
      case 'payment_intent.canceled':
      case 'payment_intent.requires_action':
        await handlePaymentIntentEvent(event)
        break

      // Invoice events
      case 'invoice.paid':
      case 'invoice.payment_failed':
      case 'invoice.payment_action_required':
        await handleInvoiceEvent(event)
        break

      // Charge events
      case 'charge.succeeded':
      case 'charge.failed':
      case 'charge.dispute.created':
        await handleChargeEvent(event)
        break

      // Subscription events that might affect payments
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionEvent(event)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentIntentEvent(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent

  if (!paymentIntent.customer) {
    console.log('Payment intent has no customer, skipping sync')
    return
  }

  // Find user by Stripe customer ID
  const user = await prisma.user.findFirst({
    where: { stripeId: paymentIntent.customer as string },
    select: { id: true }
  })

  if (!user) {
    console.log(`User not found for Stripe customer: ${paymentIntent.customer}`)
    return
  }

  console.log(`Syncing payment intent ${paymentIntent.id} for user ${user.id}`)
  
  // Sync the payment
  await PaymentService.syncStripePayment(
    paymentIntent.id,
    user.id,
    'payment_intent'
  )
}

async function handleInvoiceEvent(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice

  if (!invoice.customer) {
    console.log('Invoice has no customer, skipping sync')
    return
  }

  // Find user by Stripe customer ID
  const user = await prisma.user.findFirst({
    where: { stripeId: invoice.customer as string },
    select: { id: true }
  })

  if (!user) {
    console.log(`User not found for Stripe customer: ${invoice.customer}`)
    return
  }

  console.log(`Syncing invoice ${invoice.id} for user ${user.id}`)
  
  // Sync the invoice payment
  await PaymentService.syncStripePayment(
    invoice.id,
    user.id,
    'invoice'
  )
}

async function handleChargeEvent(event: Stripe.Event) {
  const charge = event.data.object as Stripe.Charge

  if (!charge.customer) {
    console.log('Charge has no customer, skipping sync')
    return
  }

  // Find user by Stripe customer ID
  const user = await prisma.user.findFirst({
    where: { stripeId: charge.customer as string },
    select: { id: true }
  })

  if (!user) {
    console.log(`User not found for Stripe customer: ${charge.customer}`)
    return
  }

  // Don't sync charges that are part of invoices to avoid duplicates
  if (charge.invoice) {
    console.log(`Charge ${charge.id} is part of invoice, skipping to avoid duplicate`)
    return
  }

  console.log(`Syncing charge ${charge.id} for user ${user.id}`)
  
  // Sync the charge
  await PaymentService.syncStripePayment(
    charge.id,
    user.id,
    'charge'
  )
}

async function handleSubscriptionEvent(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription

  if (!subscription.customer) {
    console.log('Subscription has no customer, skipping')
    return
  }

  // Find user by Stripe customer ID
  const user = await prisma.user.findFirst({
    where: { stripeId: subscription.customer as string },
    select: { id: true, stripeId: true }
  })

  if (!user) {
    console.log(`User not found for Stripe customer: ${subscription.customer}`)
    return
  }

  console.log(`Subscription event for user ${user.id}, triggering payment sync`)
  
  // Trigger a full sync for this user to catch any new subscription-related payments
  try {
    const syncResult = await PaymentService.syncUserPaymentsFromStripe(
      user.id,
      user.stripeId!
    )
    console.log(`Synced ${syncResult.synced} payments for subscription event`)
  } catch (error) {
    console.error('Error syncing payments for subscription event:', error)
  }
} 