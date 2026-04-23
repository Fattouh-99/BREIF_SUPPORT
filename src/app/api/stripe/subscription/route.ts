import { prisma } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { successResponse, ApiError } from '@/lib/api-response'
import Stripe from 'stripe'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
  typescript: true,
  apiVersion: '2024-04-10',
})

// ----- PLAN CONFIG (match .env naming) -----
// Price IDs (preferred for paid plans)
const PLAN_PRICE_IDS = {
  STANDARD: process.env.STRIPE_STARTER_PRICE_ID, // optional $0 recurring price
  PRO: process.env.STRIPE_PRO_PRICE_ID,
} as const;

// Product IDs (needed when a plan only has a product and we must discover a price)
const PLAN_PRODUCT_IDS = {
  STANDARD: process.env.STRIPE_STARTER_PRODUCT_ID!, // Required for free plan
  PRO: process.env.STRIPE_PRO_PRODUCT_ID,          // Optional fallback
} as const;

// CORS headers helper function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// Helper to resolve an active recurring price for a product
const getActiveRecurringPriceId = async (productId: string): Promise<string> => {
  const product = await stripe.products.retrieve(productId, { expand: ['default_price'] });
  const defaultPrice = product.default_price as Stripe.Price | null;
  if (defaultPrice && defaultPrice.active && defaultPrice.recurring) {
    return defaultPrice.id;
  }
  const priceList = await stripe.prices.list({ product: productId, active: true, limit: 10 });
  const recurring = priceList.data.find((p) => !!p.recurring);
  if (!recurring) throw new Error(`No recurring price found for product ${productId}`);
  return recurring.id;
};

// Helper to get a usable price for a given plan
const resolvePriceId = async (
  planKey: 'STANDARD' | 'PRO'
): Promise<string> => {
  if (PLAN_PRICE_IDS[planKey]) {
    return PLAN_PRICE_IDS[planKey]!;
  }
  const productId = PLAN_PRODUCT_IDS[planKey];
  if (!productId) {
    throw new Error(`No price or product configured for plan ${planKey}`);
  }
  return await getActiveRecurringPriceId(productId);
};

export async function POST(request: Request) {
  try {
    // Try both auth() and currentUser() to handle different auth contexts
    const { userId: clerkUserId } = auth();
    const userFromCurrentUser = await currentUser();
    
    // For debugging only
    console.log('Auth state:', { 
      clerkUserId, 
      userFromCurrentUserExists: !!userFromCurrentUser,
      headers: Object.fromEntries(request.headers),
    });
    
    // If we don't have a user from either method, return unauthorized
    if (!clerkUserId && !userFromCurrentUser) {
      console.error('Auth failed: No user from auth() or currentUser()');
      
      // Return response with CORS headers for better debugging
      return new Response(
        JSON.stringify({ 
          error: 'Not authenticated', 
          status: 401,
          message: 'Please sign in to upgrade your subscription'
        }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    const body = await request.json()
    const { plan } = body

    // Map frontend plan names to backend plan names for price ID lookup
    const planMapping = {
      'STANDARD': 'STANDARD',
      'PRO': 'PRO'
    }
    
    const backendPlan = planMapping[plan as keyof typeof planMapping] || plan

    if (!backendPlan || !PLAN_PRODUCT_IDS[backendPlan as keyof typeof PLAN_PRODUCT_IDS]) {
      return ApiError.BadRequest('Invalid plan')
    }

    // Resolve the Stripe price ID we will subscribe the user to
    let priceId: string;
    try {
      priceId = await resolvePriceId(backendPlan as 'STANDARD' | 'PRO');
    } catch (err) {
      console.error('Failed to resolve price for plan', backendPlan, err);
      return ApiError.InternalError('Subscription configuration error. Please contact support.');
    }

    // Get or create Stripe customer
    let dbUser;
    
    if (userFromCurrentUser) {
      dbUser = await prisma.user.findUnique({
        where: { clerkId: userFromCurrentUser.id },
        select: { id: true, stripeId: true, email: true }
      });
    } else if (clerkUserId) {
      dbUser = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
        select: { id: true, stripeId: true, email: true }
      });
    }

    if (!dbUser) {
      console.error('User not found in database', { clerkUserId, userFromCurrentUser: userFromCurrentUser?.id });
      return ApiError.NotFound('User not found in database')
    }

    let stripeCustomerId = dbUser.stripeId

    if (!stripeCustomerId) {
      // Get email from user record or from clerk user
      const userEmail = dbUser.email || userFromCurrentUser?.emailAddresses[0]?.emailAddress;
      
      if (!userEmail) {
        return ApiError.BadRequest('No email found for user')
      }
      
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId: dbUser.id,
          clerkId: userFromCurrentUser?.id || clerkUserId
        }
      })
      stripeCustomerId = customer.id

      // Save Stripe customer ID
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { stripeId: stripeCustomerId }
      })
    }

    console.log('Processing subscription for user:', { userId: dbUser.id, plan, stripeCustomerId });

    // Check for an existing active subscription to avoid duplicates
    const existingSubs = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'all',
      limit: 10,
    });

    const activeSub = existingSubs.data.find((s) => ['trialing', 'active', 'incomplete'].includes(s.status));

    if (activeSub) {
      console.log('Found existing subscription, not creating new one:', activeSub.id);
      return successResponse({ subscriptionId: activeSub.id, message: 'Subscription already exists.' });
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      trial_period_days: 0,
      metadata: {
        userId: dbUser.id,
        plan, // Keep original plan name for webhook processing
        signupFlow: 'true',
      },
    });

    // Extract client secret if available (paid plans)
    let clientSecret: string | null = null;
    const invoice = subscription.latest_invoice as Stripe.Invoice | undefined;
    if (invoice && invoice.payment_intent) {
      const pi = invoice.payment_intent as Stripe.PaymentIntent;
      clientSecret = pi?.client_secret || null;
    }

    console.log('Subscription processed successfully:', {
      subscriptionId: subscription.id,
      clientSecretAvailable: !!clientSecret,
    });

    return successResponse({
      subscriptionId: subscription.id,
      clientSecret,
    })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return ApiError.InternalError(`Failed to create subscription: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function PUT(request: Request) {
  try {
    const user = await currentUser()
    if (!user) {
      return ApiError.Unauthorized()
    }

    const body = await request.json()
    const { plan } = body

    // Map frontend plan names to backend plan names for price ID lookup
    const planMapping = {
      'STANDARD': 'STANDARD',
      'PRO': 'PRO'
    }
    
    const backendPlan = planMapping[plan as keyof typeof planMapping] || plan

    if (!backendPlan || !PLAN_PRODUCT_IDS[backendPlan as keyof typeof PLAN_PRODUCT_IDS]) {
      return ApiError.BadRequest('Invalid plan')
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true, stripeId: true }
    })

    if (!dbUser?.stripeId) {
      return ApiError.NotFound('No active subscription')
    }

    // Get current subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: dbUser.stripeId,
      status: 'active',
      limit: 1
    })

    if (subscriptions.data.length === 0) {
      return ApiError.NotFound('No active subscription')
    }

    const subscription = subscriptions.data[0]

    // Compute target price for upgrade
    const upgradePriceId = await resolvePriceId(backendPlan as 'STANDARD' | 'PRO');

    // Update subscription
    const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: upgradePriceId,
        }
      ],
      proration_behavior: 'always_invoice',
      metadata: {
        userId: dbUser.id,
        plan // Keep original plan name for webhook processing
      }
    })

    return successResponse({ subscription: updatedSubscription })
  } catch (error) {
    console.error('Error updating subscription:', error)
    return ApiError.InternalError('Failed to update subscription')
  }
}

export async function DELETE(request: Request) {
  try {
    console.log('DELETE request received for subscription cancellation');
    
    const user = await currentUser()
    if (!user) {
      console.log('No authenticated user found');
      return ApiError.Unauthorized('Not authenticated');
    }

    console.log('User authenticated:', user.id);
    
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true, stripeId: true, subscription: true }
    })

    console.log('Database user found:', !!dbUser, 'Has stripeId:', !!dbUser?.stripeId);
    
    // If user doesn't have a stripeId, but wants to downgrade from paid plan
    if (!dbUser?.stripeId) {
      // If they have a subscription record but no Stripe ID, just update their plan to STANDARD
      if (dbUser?.subscription) {
        await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            subscription: {
              update: {
                plan: 'standard', // Use lowercase for database
                status: 'canceled',
                cancelAtPeriodEnd: true,
              }
            }
          }
        });
        
        console.log('No Stripe ID found but subscription exists in DB. Updated plan to STANDARD.');
        return successResponse({ 
          message: 'Subscription downgraded to Standard plan',
          plan: 'STANDARD'
        });
      }
      
      // If they have neither, just return success since there's nothing to cancel
      console.log('No subscription to cancel');
      return successResponse({ 
        message: 'No active subscription to cancel',
        plan: 'STANDARD'
      });
    }

    // Get current subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: dbUser.stripeId,
      status: 'active',
      limit: 1
    })

    console.log('Active subscriptions found:', subscriptions.data.length);
    
    if (subscriptions.data.length === 0) {
      // If no active Stripe subscription but user has a stripeId, update the DB record
      if (dbUser?.subscription) {
        await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            subscription: {
              update: {
                plan: 'standard', // Use lowercase for database
                status: 'canceled',
                cancelAtPeriodEnd: false,
              }
            }
          }
        });
        
        console.log('No active Stripe subscription but subscription exists in DB. Updated to STANDARD.');
      }
      
      return successResponse({ 
        message: 'No active subscription found to cancel',
        plan: 'STANDARD'
      });
    }

    // Cancel subscription at period end
    await stripe.subscriptions.update(subscriptions.data[0].id, {
      cancel_at_period_end: true
    });

    // Also update our database
    if (dbUser?.id) {
      await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          subscription: {
            update: {
              cancelAtPeriodEnd: true,
            }
          }
        }
      });
    }

    console.log('Subscription cancelled successfully:', subscriptions.data[0].id);
    
    return successResponse({ message: 'Subscription cancelled' })
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return ApiError.InternalError(error instanceof Error ? error.message : 'Failed to cancel subscription')
  }
} 