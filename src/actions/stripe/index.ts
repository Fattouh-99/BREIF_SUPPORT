'use server'

import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import Stripe from 'stripe'
import nodemailer from 'nodemailer'
import { pusherServer } from '@/lib/pusher'

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
  typescript: true,
  apiVersion: '2024-04-10',
})

const createUpgradeNotification = async (userId: string, plan: string) => {
  try {
    // Create notification with proper type
    const notification = await client.$queryRaw`
      INSERT INTO "Notification" (
        id,
        type,
        message,
        "userId",
        read,
        "createdAt",
        "updatedAt"
      ) VALUES (
        gen_random_uuid(),
        'PLAN_UPGRADE',
        ${`Your subscription has been upgraded to ${plan} Plan`},
        ${userId},
        false,
        NOW(),
        NOW()
      )
    `;

    // Trigger Pusher event for real-time notification
    if (pusherServer) {
      await pusherServer.trigger(`user-${userId}`, 'notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

const sendUpgradeEmail = async (userEmail: string, plan: string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.NODE_MAILER_EMAIL,
      pass: process.env.NODE_MAILER_GMAIL_APP_PASSWORD,
    },
  })

  const planDetails = {
    PRO: {
      features: [
        '1,000 chatbot requests included',
        'Advanced chat features',
        'Priority support',
        'Custom branding',
        'Analytics dashboard'
      ]
    }
  }

  const features = planDetails[plan as keyof typeof planDetails]?.features || []
  const featuresList = features.map(f => `  • ${f}`).join('\n')

  const mailOptions = {
    from: process.env.NODE_MAILER_EMAIL,
    to: userEmail,
    subject: `Welcome to Brief Support ${plan} Plan!`,
    text: `Thank you for upgrading to the ${plan} Plan!\n\nYour new features include:\n${featuresList}\n\nIf you have any questions, our support team is here to help.\n\nBest regards,\nThe Brief Support Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5; text-align: center;">Welcome to Brief Support ${plan} Plan!</h1>
        
        <p style="font-size: 16px; line-height: 1.5;">Thank you for upgrading your Brief Support subscription! We're excited to offer you enhanced features and capabilities.</p>
        
        <h2 style="color: #4F46E5; margin-top: 20px;">Your New Features:</h2>
        <ul style="list-style: none; padding-left: 0;">
          ${features.map(feature => `
            <li style="margin-bottom: 10px; padding-left: 24px; position: relative;">
              <span style="color: #4F46E5; position: absolute; left: 0;">•</span>
              ${feature}
            </li>
          `).join('')}
        </ul>

        <p style="font-size: 16px; line-height: 1.5; margin-top: 20px;">
          If you have any questions about your new features, our support team is here to help!
        </p>

        <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #F3F4F6;">
          <p style="margin: 0; color: #6B7280; font-size: 14px;">
            Best regards,<br>
            The Brief Support Team
          </p>
        </div>
      </div>
    `
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error('Error sending upgrade email:', error)
  }
}

export const onCreatePaymentIntent = async (payment: 'STANDARD' | 'PRO') => {
  try {
    const user = await currentUser()
    if (!user) {
      return { error: 'Unauthorized' }
    }

    // Get user from database
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true }
    })

    if (!dbUser) {
      return { error: 'User not found' }
    }

    const amount = setPlanAmount(payment)
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      description: `Subscription upgrade to ${payment} Plan`,
      statement_descriptor: 'TALKPOINT SUB',
      statement_descriptor_suffix: payment,
      metadata: {
        type: 'subscription',
        plan: payment,
        userId: dbUser.id
      }
    })

    // Create notification for the upgrade
    await createUpgradeNotification(dbUser.id, payment)

    return { clientSecret: paymentIntent.client_secret }
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return { error: 'Failed to create payment intent' }
  }
}

const setPlanAmount = (item: 'STANDARD' | 'PRO') => {
  if (item == 'PRO') {
    return 1500 // $15.00
  }
  return 50 // Minimum amount for test mode ($0.50)
}

// Calculate prorated amount for plan upgrade
const calculateProratedAmount = (currentPlan: 'STANDARD' | 'PRO', newPlan: 'STANDARD' | 'PRO', daysRemaining: number) => {
  const planPrices = {
    STANDARD: 0,
    PRO: 1500 // $15.00
  };

  // Calculate daily rate for both plans
  const currentPlanDaily = planPrices[currentPlan] / 30;
  const newPlanDaily = planPrices[newPlan] / 30;

  // Calculate prorated difference
  const proratedAmount = Math.round((newPlanDaily - currentPlanDaily) * daysRemaining);
  return Math.max(0, proratedAmount); // Ensure amount is not negative
};

// Get days remaining in current billing cycle
const getDaysRemainingInCycle = async (userId: string) => {
  const user = await client.user.findUnique({
    where: { id: userId },
    select: { updatedAt: true }
  });

  if (!user) return 30; // Default to full month if no user found

  const lastUpdate = user.updatedAt;
  const now = new Date();
  const cycleEnd = new Date(lastUpdate);
  cycleEnd.setMonth(cycleEnd.getMonth() + 1);

  const daysRemaining = Math.ceil((cycleEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, Math.min(30, daysRemaining));
};

export const onGetStripeClientSecret = async (
  item: 'STANDARD' | 'PRO'
) => {
  try {
    // Skip payment intent for free plan
    if (item === 'STANDARD') {
      return null;
    }

    const user = await currentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get user's database ID and current plan
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { 
        id: true,
        subscription: {
          select: { plan: true }
        }
      }
    });

    if (!dbUser) {
      throw new Error('User not found in database');
    }

    const currentPlan = (dbUser.subscription?.plan || 'STANDARD') as 'STANDARD' | 'PRO';
    
    // Calculate prorated amount if upgrading
    const daysRemaining = await getDaysRemainingInCycle(dbUser.id);
    const amount = calculateProratedAmount(currentPlan, item, daysRemaining);

    const paymentIntent = await stripe.paymentIntents.create({
        currency: 'usd',
      amount: amount,
      automatic_payment_methods: {
        enabled: true,
        },
      description: `Prorated upgrade to ${item} Plan (${daysRemaining} days remaining)`,
      statement_descriptor: 'TALKPOINT SUB',
      statement_descriptor_suffix: item,
          metadata: {
        type: 'plan_upgrade',
        from_plan: currentPlan,
        to_plan: item,
        days_remaining: daysRemaining,
        userId: dbUser.id,
        userEmail: user.emailAddresses[0]?.emailAddress
        }
      });

    if (paymentIntent) {
      console.log('Created prorated payment intent:', {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        metadata: paymentIntent.metadata
    });
      return { secret: paymentIntent.client_secret }
    }
  } catch (error) {
    console.error('Error creating payment intent:', error)
    throw error;
  }
}

export const onUpdateSubscription = async (
  plan: 'STANDARD' | 'PRO'
) => {
  try {
    const user = await currentUser()
    if (!user) return

    const update = await client.user.update({
      where: {
        clerkId: user.id,
      },
      data: {
        subscription: {
          update: {
            data: {
              plan,
              credits: plan === 'PRO' ? 50 : 10,
            },
          },
        },
      },
      select: {
        id: true,
        subscription: {
          select: {
            plan: true,
          },
        },
      },
    })

    if (update) {
      // Create notification for plan changes
      await createUpgradeNotification(update.id, plan)

      // Send welcome email for paid plans
      if (plan !== 'STANDARD' && user.emailAddresses?.[0]?.emailAddress) {
        await sendUpgradeEmail(user.emailAddresses[0].emailAddress, plan)
      }

      return {
        status: 200,
        message: 'subscription updated',
        plan: update.subscription?.plan,
      }
    }
  } catch (error) {
    console.error('Error updating subscription:', error)
    return {
      status: 500,
      message: 'Failed to update subscription',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export const onCreateCustomerPaymentIntentSecret = async (
  amount: number,
  stripeId: string
) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create(
      {
        currency: 'usd',
        amount: amount * 100,
        automatic_payment_methods: {
          enabled: true,
        },
      },
      { stripeAccount: stripeId }
    )

    if (paymentIntent) {
      return { secret: paymentIntent.client_secret }
    }
  } catch (error) {
    console.error('Error creating customer payment intent:', error)
    return { error: 'Failed to create payment intent' }
  }
}
