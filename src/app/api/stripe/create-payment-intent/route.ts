import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET as string, {
  apiVersion: '2024-04-10',
  typescript: true,
});

// Plan prices in cents - aligned with our PLANS config
const PLAN_PRICES = {
  standard: 0,      // Free plan
  pro: 1500,        // £15/month
} as const;

// Map the low-level API plan names to canonical plan identifiers used throughout the backend/webhooks.
const CANONICAL_PLAN_MAP: Record<string, 'STANDARD' | 'PRO'> = {
  standard: 'STANDARD',
  pro: 'PRO',
};

export async function POST(req: NextRequest) {
  try {
    console.log('Payment intent API called with request body');
    const { plan } = await req.json();
    console.log('Received plan:', plan);
    
    // Validate plan
    if (!plan || !Object.keys(PLAN_PRICES).includes(plan)) {
      console.error('Invalid plan:', plan, 'Available plans:', Object.keys(PLAN_PRICES));
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }
    
    const amount = PLAN_PRICES[plan as keyof typeof PLAN_PRICES];
    console.log('Plan amount:', amount);
    
    // Resolve canonical plan name for webhook/meta usage
    const canonicalPlan = CANONICAL_PLAN_MAP[plan];

    // Fetch currently-signed-in user (if any) so we can embed their DB id in metadata for webhooks
    const { userId: clerkUserId } = getAuth(req);
    let dbUserId: string | undefined;
    if (clerkUserId) {
      const dbUser = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
        select: { id: true },
      });
      dbUserId = dbUser?.id;
    }
    
    // For free plans, use a SetupIntent instead of PaymentIntent
    if (amount === 0) {
      // Create a SetupIntent which doesn't require an amount
      const setupIntent = await stripe.setupIntents.create({
        usage: 'off_session',
        metadata: {
          plan,
          flow: 'signup',
          free_plan: 'true',
        },
      });
      
      return NextResponse.json({
        clientSecret: setupIntent.client_secret,
        setupIntentId: setupIntent.id,
        isFree: true,
        isSetupIntent: true,
      });
    }
    
    // For paid plans, ensure the amount meets minimum requirements (50 cents minimum in USD)
    // Amount is already defined above
    
    /*
     ** NEW SUBSCRIPTION FLOW **
     The purchase should register as a subscription, not a one-time payment.
     We therefore create a Stripe subscription whose first invoice contains
     the PaymentIntent we will confirm on the client.  We only need the
     subscription's latest invoice.payment_intent client secret.
    */

    // ---------------- HELPER ----------------
    const getActiveRecurringPriceId = async (productId: string): Promise<string> => {
      // First, attempt to use the product's default_price if present and recurring
      try {
        const product = await stripe.products.retrieve(productId, {
          expand: ['default_price'],
        });

        const defaultPrice = product.default_price as Stripe.Price | null;
        if (defaultPrice && defaultPrice.recurring && defaultPrice.active) {
          return defaultPrice.id;
        }
      } catch (err) {
        console.warn('Failed to read product.default_price', { productId, err });
      }

      // Fallback: list prices on the product and take the first active recurring one
      const priceList = await stripe.prices.list({
        product: productId,
        active: true,
        limit: 10,
      });
      const recurring = priceList.data.find((p) => !!p.recurring);
      if (!recurring) {
        throw new Error(`No active recurring price found for product ${productId}`);
      }
      return recurring.id;
    };

    // ---------------- PLAN CONFIG ----------------
    const PLAN_PRICE_IDS: Record<'STANDARD' | 'PRO', string | undefined> = {
      STANDARD: process.env.STRIPE_STARTER_PRICE_ID, // optional (free plan)
      PRO: process.env.STRIPE_PRO_PRICE_ID,
    };

    const PLAN_PRODUCT_IDS: Record<'STANDARD' | 'PRO', string | undefined> = {
      STANDARD: process.env.STRIPE_STARTER_PRODUCT_ID,
      PRO: process.env.STRIPE_PRO_PRODUCT_ID,
    };

    // Helper to resolve the correct recurring price for the chosen plan
    const resolvePriceId = async (planKey: 'STANDARD' | 'PRO'): Promise<string> => {
      if (PLAN_PRICE_IDS[planKey]) {
        return PLAN_PRICE_IDS[planKey]!;
      }
      const productId = PLAN_PRODUCT_IDS[planKey];
      if (!productId) {
        throw new Error(`No price or product configured for plan ${planKey}`);
      }
      return await getActiveRecurringPriceId(productId);
    };

    const priceId = await resolvePriceId(canonicalPlan);

    // Ensure we have (or create) a Stripe customer so the subscription can bill it
    let stripeCustomerId: string;
    if (dbUserId) {
      const dbUser = await prisma.user.findUnique({ where: { id: dbUserId }, select: { stripeId: true, email: true } });
      if (dbUser?.stripeId) {
        stripeCustomerId = dbUser.stripeId;
      } else {
        // Create a new customer with the email we have on file
        const email = dbUser?.email || undefined;
        const customer = await stripe.customers.create({
          email,
          metadata: { userId: dbUserId },
        });
        stripeCustomerId = customer.id;

        // store it back
        await prisma.user.update({ where: { id: dbUserId }, data: { stripeId: stripeCustomerId } });
      }
    } else {
      // For safety; this should never happen because signup flow always has db user at this point
      const customer = await stripe.customers.create({ metadata: { temp: 'true' } });
      stripeCustomerId = customer.id;
    }

    // Create the subscription in "default_incomplete" mode so we can collect payment
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId: dbUserId ?? 'unknown',
        plan: canonicalPlan,
        planType: canonicalPlan,
        signupFlow: 'true',
      },
    });

    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent | null;

    if (!paymentIntent?.client_secret) {
      console.error('Subscription created but no payment_intent.client_secret', {
        subscriptionId: subscription.id,
      });
      return NextResponse.json({ error: 'Could not initiate payment. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      subscriptionId: subscription.id,
      isFree: false,
      isSetupIntent: false,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    
    // Handle specific Stripe errors
    if (error instanceof Stripe.errors.StripeError) {
      console.error('Stripe error:', error.type, error.message);
      return NextResponse.json(
        { error: `Stripe error: ${error.message}` },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error creating payment intent' },
      { status: 500 }
    );
  }
} 