import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { ApiError, successResponse } from '@/lib/api-response'
import Stripe from 'stripe'
import { clerkClient } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
  typescript: true,
  apiVersion: '2024-04-10',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Define plan mapping constants
const planMap = {
  'STANDARD': 'standard',
  'PRO': 'pro'
};

const clerkPlanMap = {
  'standard': 'STANDARD',
  'pro': 'PRO'
};

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
  });
}

export async function POST(req: Request) {
  console.log('Stripe webhook received', {
    url: req.url,
    method: req.method,
    headers: Object.fromEntries(req.headers)
  });
  
  const body = await req.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    console.error('No Stripe signature in webhook request');
    return new Response(JSON.stringify({ error: 'No signature' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, stripe-signature'
      }
    });
  }

  try {
    console.log('Attempting to verify Stripe webhook signature');
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )

    console.log('Webhook signature verified, event type:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        // Handle checkout session completion if needed
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        console.log('Payment intent succeeded:', {
          paymentIntentId: paymentIntent.id,
          metadata: paymentIntent.metadata,
          amount: paymentIntent.amount
        });
        
        // Check if this is part of signup flow by looking at metadata
        if (
          paymentIntent.metadata.signupFlow === 'true' &&
          paymentIntent.metadata.userId &&
          paymentIntent.metadata.userId !== 'unknown'
        ) {
          const userId = paymentIntent.metadata.userId;
          const plan = (paymentIntent.metadata.plan || paymentIntent.metadata.planType) as
            | 'STANDARD'
            | 'PRO';
          
          // Map plan name to database format
          let dbPlan = 'standard'; // Default to standard
          if (plan === 'STANDARD') dbPlan = 'standard';
          if (plan === 'PRO') dbPlan = 'pro';
          
          // Get plan credits
          let credits = 100;
          if (dbPlan === 'pro') credits = 1000;
          
          console.log('Updating user subscription after payment:', {
            userId,
            plan,
            dbPlan,
            credits
          });
          
          // Payment completed - update user's subscription
          await prisma.user.update({
            where: { id: userId },
            data: {
              subscription: {
                upsert: {
                  create: {
                    plan: dbPlan,
                    credits,
                    status: 'active',
                    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                    cancelAtPeriodEnd: false,
                  },
                  update: {
                    plan: dbPlan,
                    credits,
                    status: 'active',
                    cancelAtPeriodEnd: false,
                  }
                }
              }
            }
          });
          
          console.log('Successfully updated user subscription');
        }
        
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        
        console.log('Invoice payment succeeded:', {
          invoiceId: invoice.id,
          subscriptionId: invoice.subscription,
          customerId: invoice.customer
        });
        
        // Handle subscription payment success
        if (invoice.subscription) {
          try {
            const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
            const userId = subscription.metadata?.userId;
            
            if (userId) {
              const plan = subscription.metadata?.plan;
              
              // Map plan name to database format
              let dbPlan = 'standard'; // Default to standard
              if (plan === 'STANDARD') dbPlan = 'standard';
              if (plan === 'PRO') dbPlan = 'pro';
              
              // Get plan credits
              let credits = 100;
              if (dbPlan === 'pro') credits = 1000;
              
              console.log('Updating subscription after invoice payment:', {
                userId,
                plan,
                dbPlan,
                credits
              });
              
              // Update subscription status and plan
              await prisma.user.update({
                where: { id: userId },
                data: {
                  subscription: {
                    upsert: {
                      create: {
                        plan: dbPlan,
                        credits,
                        status: 'active',
                        stripeSubscriptionId: subscription.id,
                        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                        cancelAtPeriodEnd: false,
                      },
                      update: {
                        plan: dbPlan,
                        credits,
                        status: 'active',
                        stripeSubscriptionId: subscription.id,
                        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                        cancelAtPeriodEnd: false,
                      }
                    }
                  }
                }
              });
              
              console.log('Successfully updated subscription after invoice payment');
            }
          } catch (error) {
            console.error('Error processing invoice payment:', error);
          }
        }
        
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata.userId

        if (!userId) {
          console.error('No userId in subscription metadata')
          return ApiError.BadRequest('No userId')
        }

        // Stripe plan may be stored under different metadata keys depending on where the checkout / subscription was created.
        // Prefer `plan` but gracefully fallback to `planType`.
        let stripePlan = (subscription.metadata.plan || subscription.metadata.planType) as
          | 'STANDARD'
          | 'PRO';

        // If no plan (or unsupported) found in metadata, try to infer it from the Price ID.
        if (!stripePlan && subscription.items.data.length > 0) {
          const priceId = subscription.items.data[0].price.id
          // Map price IDs to plan names via env vars
          if (priceId === process.env.STRIPE_PRO_PRICE_ID) stripePlan = 'PRO'
          else stripePlan = 'STANDARD'
        }

        // Map frontend plan names to database plan names
        let plan = 'standard' // Default to standard
        if (stripePlan === 'PRO') plan = 'pro'

        // Calculate credits based on plan
        let credits = 100; // default for STANDARD
        if (plan === 'pro') credits = 1000;

        console.log('Processing subscription event:', {
          type: event.type,
          userId,
          stripePlan,
          mappedPlan: plan,
          credits,
          status: subscription.status
        });

        // Find the user in the database to get their Clerk ID
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { clerkId: true }
        });

        if (dbUser?.clerkId) {
          // Update Clerk user metadata to include subscription information
          await clerkClient.users.updateUser(dbUser.clerkId, {
            publicMetadata: {
              hasActiveSubscription: true,
              subscriptionPlan: clerkPlanMap[plan as keyof typeof clerkPlanMap] || 'STANDARD',
              subscriptionStart: new Date().toISOString()
            }
          });
          console.log('Updated Clerk user metadata for user:', dbUser.clerkId);
        } else {
          console.warn('Could not find Clerk ID for user:', userId);
        }

        // Update user's subscription in database
        await prisma.user.update({
          where: { id: userId },
          data: {
            subscription: {
              upsert: {
                create: {
                  plan,
                  credits,
                  stripeSubscriptionId: subscription.id,
                  currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                  status: subscription.status,
                  cancelAtPeriodEnd: subscription.cancel_at_period_end,
                },
                update: {
                  plan,
                  credits,
                  stripeSubscriptionId: subscription.id,
                  currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                  status: subscription.status,
                  cancelAtPeriodEnd: subscription.cancel_at_period_end,
                },
              },
            },
          },
        })

        // Create notification for subscription changes
        const message = subscription.cancel_at_period_end
          ? `Your subscription will be cancelled at the end of the billing period (${new Date(subscription.current_period_end * 1000).toLocaleDateString()})`
          : `Your subscription has been ${event.type === 'customer.subscription.created' ? 'activated' : 'updated'} to ${plan} Plan`

        await prisma.notification.create({
          data: {
            type: 'PLAN_UPGRADE',
            message,
            userId,
            read: false
          }
        });

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata.userId

        if (!userId) {
          console.error('No userId in subscription metadata')
          return ApiError.BadRequest('No userId')
        }

        // Update user's subscription in database
        await prisma.user.update({
          where: { id: userId },
          data: {
            subscription: {
              update: {
                status: 'canceled',
                cancelAtPeriodEnd: false,
                // Keep the subscription until the end of the period
                // but mark it as canceled
              },
            },
          },
        })

        // Create notification for subscription cancellation
        await prisma.notification.create({
          data: {
            type: 'PLAN_UPGRADE',
            message: 'Your subscription has been canceled. Your access will continue until the end of the current billing period.',
            userId,
            read: false
          }
        });

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        
        // Find user by Stripe customer ID
        const user = await prisma.user.findFirst({
          where: { stripeId: customerId },
          select: { id: true }
        })

        if (!user) {
          console.error('No user found for Stripe customer ID:', customerId)
          return ApiError.BadRequest('No user found')
        }

        // Create notification for failed payment
        await prisma.notification.create({
          data: {
            type: 'PLAN_UPGRADE',
            message: 'Your subscription payment failed. Please update your payment method to avoid service interruption.',
            userId: user.id,
            read: false
          }
        });

        break;
      }
    }

    console.log('Webhook processed successfully');
    return successResponse({ received: true })
  } catch (error) {
    // Check for signature verification error
    if (error instanceof Stripe.errors.StripeSignatureVerificationError) {
      console.error('Webhook signature verification failed:', error.message);
      return ApiError.BadRequest('Webhook signature verification failed');
    }
    
    // Check for other Stripe errors
    if (error instanceof Stripe.errors.StripeError) {
      console.error('Stripe API error:', error.type, error.message);
      return ApiError.BadRequest(`Stripe error: ${error.message}`);
    }
    
    // Handle other errors
    console.error('Webhook error:', error instanceof Error ? error.message : error);
    return ApiError.InternalError('Webhook handler failed');
  }
} 