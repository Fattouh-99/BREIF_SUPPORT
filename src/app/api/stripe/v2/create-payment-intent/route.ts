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

    const { planId, billingDetails } = await req.json()

    if (!planId || !PLANS[planId as PlanType]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const plan = PLANS[planId as PlanType]

    if (plan.price === 0) {
      return NextResponse.json({ error: 'Cannot create payment intent for free plan' }, { status: 400 })
    }

    // Get or create user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create or get Stripe customer
    let stripeCustomer

    if (user.stripeId) {
      stripeCustomer = await stripe.customers.retrieve(user.stripeId)
    } else {
      stripeCustomer = await stripe.customers.create({
        email: billingDetails.email || user.email,
        name: billingDetails.name || user.fullname,
        address: billingDetails.address,
        metadata: {
          userId: user.id,
          clerkId: userId
        }
      })

      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeId: stripeCustomer.id }
      })
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: plan.price,
      currency: 'usd',
      customer: stripeCustomer.id,
      setup_future_usage: 'off_session', // For future subscription payments
      metadata: {
        userId: user.id,
        planId,
        clerkId: userId
      }
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      customerId: stripeCustomer.id
    })

  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
} 