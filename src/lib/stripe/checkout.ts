import Stripe from 'stripe'
import { stripe, PLANS, PlanType, isValidPlan } from './config'
import { SubscriptionService } from './subscription'
import { prisma } from '@/lib/prisma'

export class CheckoutService {
  // Create a checkout session for subscription
  static async createSubscriptionCheckout(
    userId: string,
    email: string, 
    planType: PlanType,
    successUrl: string,
    cancelUrl: string
  ) {
    if (!isValidPlan(planType)) {
      throw new Error('Invalid plan type')
    }

    // For free plan, no checkout needed
    if (planType === 'STANDARD') {
      return SubscriptionService.activateFreePlan(userId)
    }

    const plan = PLANS[planType]
    
    // Get or create Stripe customer
    const customerId = await SubscriptionService.createOrGetCustomer(userId, email)

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [
        {
          price: plan.priceId!,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        planType,
        plan: planType,
      },
      subscription_data: {
        metadata: {
          userId,
          planType,
          plan: planType,
        },
      },
      allow_promotion_codes: true,
      automatic_tax: {
        enabled: true,
      },
    })

    return {
      sessionId: session.id,
      sessionUrl: session.url,
    }
  }

  // Create a checkout session for plan upgrade
  static async createUpgradeCheckout(
    userId: string,
    newPlanType: PlanType,
    successUrl: string,
    cancelUrl: string
  ) {
    if (!isValidPlan(newPlanType)) {
      throw new Error('Invalid plan type')
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const newPlan = PLANS[newPlanType]

    // If user doesn't have a Stripe customer, we need to create one
    if (!user.stripeId) {
      throw new Error('User must have a Stripe customer to upgrade')
    }

    // Create checkout session for upgrade
    const session = await stripe.checkout.sessions.create({
      customer: user.stripeId,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [
        {
          price: newPlan.priceId!,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        planType: newPlanType,
        isUpgrade: 'true',
        plan: newPlanType,
      },
      subscription_data: {
        metadata: {
          userId,
          planType: newPlanType,
          isUpgrade: 'true',
          plan: newPlanType,
        },
      },
      allow_promotion_codes: true,
      automatic_tax: {
        enabled: true,
      },
    })

    return {
      sessionId: session.id,
      sessionUrl: session.url,
    }
  }

  // Create customer portal session for self-service billing
  static async createCustomerPortalSession(
    userId: string,
    returnUrl: string
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeId: true }
    })

    if (!user?.stripeId) {
      throw new Error('User does not have a Stripe customer ID')
    }

    try {
      console.log('Creating customer portal session for:', {
        customerId: user.stripeId,
        returnUrl,
        timestamp: new Date().toISOString()
      })

      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeId,
        return_url: returnUrl,
      })

      console.log('Customer portal session created successfully:', {
        sessionId: session.id,
        url: session.url,
        customerId: user.stripeId
      })

      return {
        sessionUrl: session.url,
      }
    } catch (error) {
      console.error('Stripe API error creating customer portal session:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        customerId: user.stripeId,
        returnUrl,
        timestamp: new Date().toISOString()
      })

      if (error instanceof Error && error.message.includes('No configuration provided')) {
        throw new Error(
          'Customer portal is not configured. Please set up your customer portal configuration in your Stripe dashboard at https://dashboard.stripe.com/test/settings/billing/portal'
        )
      }
      // Re-throw the original error for other cases
      throw error
    }
  }

  // Verify checkout session
  static async verifyCheckoutSession(sessionId: string) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['subscription', 'customer']
      })

      return {
        session,
        isValid: session.payment_status === 'paid',
      }
    } catch (error) {
      console.error('Error verifying checkout session:', error)
      return {
        session: null,
        isValid: false,
      }
    }
  }
} 