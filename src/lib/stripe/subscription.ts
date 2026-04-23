import Stripe from 'stripe'
import { stripe, PLANS, PlanType, isValidPlan } from './config'
import { prisma } from '@/lib/prisma'
import { clerkClient } from '@clerk/nextjs'

export class SubscriptionService {
  // Create a Stripe customer if one doesn't exist
  static async createOrGetCustomer(userId: string, email: string): Promise<string> {
    // Check if user already has a Stripe customer ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeId: true }
    })

    if (user?.stripeId) {
      return user.stripeId
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email,
      metadata: {
        userId,
      }
    })

    // Save Stripe customer ID to database
    await prisma.user.update({
      where: { id: userId },
      data: { stripeId: customer.id }
    })

    return customer.id
  }

  // Create a subscription for a user
  static async createSubscription(
    userId: string, 
    email: string, 
    planType: PlanType,
    clerkId?: string
  ) {
    if (!isValidPlan(planType)) {
      throw new Error('Invalid plan type')
    }

    const plan = PLANS[planType]
    
    // For free plan, just update the database
    if (planType === 'STANDARD') {
      return this.activateFreePlan(userId, clerkId)
    }

    // Get or create Stripe customer
    const customerId = await this.createOrGetCustomer(userId, email)

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: plan.priceId! }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId,
        planType,
        plan: planType,
      }
    })

    const invoice = subscription.latest_invoice as Stripe.Invoice
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent

    return {
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret,
      subscription
    }
  }

  // Activate free plan
  static async activateFreePlan(userId: string, clerkId?: string) {
    const plan = PLANS.STANDARD

    // Update database
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscription: {
          upsert: {
            create: {
              plan: 'STANDARD',
              credits: plan.credits,
              status: 'active',
            },
            update: {
              plan: 'STANDARD',
              credits: plan.credits,
              status: 'active',
              cancelAtPeriodEnd: false,
            }
          }
        }
      }
    })

    // Update Clerk metadata
    if (clerkId) {
      await clerkClient.users.updateUser(clerkId, {
        publicMetadata: {
          hasActiveSubscription: true,
          subscriptionPlan: 'STANDARD',
          subscriptionStart: new Date().toISOString()
        }
      })
    }

    return { success: true, plan: 'STANDARD' }
  }

  // Upgrade subscription
  static async upgradeSubscription(
    userId: string,
    newPlanType: PlanType
  ) {
    if (!isValidPlan(newPlanType)) {
      throw new Error('Invalid plan type')
    }

    // Get user's current subscription
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const newPlan = PLANS[newPlanType]

    // If upgrading to a paid plan from free plan
    if (!user.subscription?.stripeSubscriptionId && newPlanType !== 'STANDARD') {
      if (!user.stripeId) {
        throw new Error('User must have a Stripe customer ID to upgrade to paid plan')
      }

      // Create new subscription
      const subscription = await stripe.subscriptions.create({
        customer: user.stripeId,
        items: [{ price: newPlan.priceId! }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          userId,
          planType: newPlanType,
          plan: newPlanType,
        }
      })

      const invoice = subscription.latest_invoice as Stripe.Invoice
      const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent

      return {
        subscriptionId: subscription.id,
        clientSecret: paymentIntent.client_secret,
      }
    }

    // If user has existing subscription, update it
    if (user.subscription?.stripeSubscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(
        user.subscription.stripeSubscriptionId
      )

      const updatedSubscription = await stripe.subscriptions.update(
        subscription.id,
        {
          items: [
            {
              id: subscription.items.data[0].id,
              price: newPlan.priceId!,
            }
          ],
          proration_behavior: 'always_invoice',
          metadata: {
            userId,
            planType: newPlanType,
            plan: newPlanType,
          }
        }
      )

      return { subscription: updatedSubscription }
    }

    throw new Error('Unable to upgrade subscription')
  }

  // Cancel subscription
  static async cancelSubscription(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true }
    })

    if (!user?.subscription?.stripeSubscriptionId) {
      // If no Stripe subscription, just update to free plan
      await this.activateFreePlan(userId, user?.clerkId)
      return { success: true, message: 'Downgraded to free plan' }
    }

    // Cancel Stripe subscription at period end
    await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
      cancel_at_period_end: true
    })

    // Update database
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscription: {
          update: {
            cancelAtPeriodEnd: true
          }
        }
      }
    })

    return { success: true, message: 'Subscription will be cancelled at the end of the billing period' }
  }

  // Reactivate cancelled subscription
  static async reactivateSubscription(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true }
    })

    if (!user?.subscription?.stripeSubscriptionId) {
      throw new Error('No subscription to reactivate')
    }

    // Reactivate Stripe subscription
    await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
      cancel_at_period_end: false
    })

    // Update database
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscription: {
          update: {
            cancelAtPeriodEnd: false
          }
        }
      }
    })

    return { success: true, message: 'Subscription reactivated' }
  }

  // Get subscription details
  static async getSubscriptionDetails(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const currentPlanRaw = user.subscription?.plan || 'STANDARD'
    const currentPlan = currentPlanRaw.toUpperCase() as PlanType
    const planDetails = PLANS[currentPlan]

    let stripeSubscription = null
    if (user.subscription?.stripeSubscriptionId) {
      try {
        stripeSubscription = await stripe.subscriptions.retrieve(
          user.subscription.stripeSubscriptionId
        )
      } catch (error) {
        console.error('Error retrieving Stripe subscription:', error)
      }
    }

    // Calculate chatbot request usage
    const usedRequests: number = (user.subscription as any)?.chatRequests ?? 0
    const requestLimit = planDetails.credits // credits now represent request limit

    return {
      currentPlan,
      planDetails,
      subscription: user.subscription,
      stripeSubscription,
      canUpgrade: currentPlan !== 'PRO', // Can only upgrade if not already on highest tier
      canDowngrade: currentPlan !== 'STANDARD',
      requestsUsed: usedRequests,
      requestLimit,
      requestsRemaining: requestLimit - usedRequests,
    }
  }
} 