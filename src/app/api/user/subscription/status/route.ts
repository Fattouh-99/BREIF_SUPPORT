import { clerkClient } from '@clerk/nextjs'
import { getAuth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

// Plan mapping from database to UI
const planMapping = {
  'standard': 'STANDARD',
  'pro': 'PRO',
  // Fallback mappings for legacy plans
  'starter': 'STANDARD',
  'business': 'PRO',
}

export async function GET(req: NextRequest) {
  try {
    // Get the authenticated user
    const { userId } = getAuth(req)
    
    if (!userId) {
      return NextResponse.json(
        { hasActiveSubscription: false },
        { status: 200 }
      )
    }
    
    // Get the user's data from Clerk
    const user = await clerkClient.users.getUser(userId)
    
    if (!user) {
      return NextResponse.json(
        { hasActiveSubscription: false },
        { status: 200 }
      )
    }
    
    // Check if the user has an active subscription in their metadata
    const hasActiveSubscription = user.publicMetadata?.hasActiveSubscription === true
    const subscriptionPlan = user.publicMetadata?.subscriptionPlan || null
    const subscriptionStart = user.publicMetadata?.subscriptionStart || null
    
    // Also get subscription data from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { 
        id: true,
        subscription: {
          select: {
            plan: true,
            status: true,
            currentPeriodEnd: true,
            stripeSubscriptionId: true,
            credits: true
          }
        }
      }
    });

    // If we have subscription data in the database, but not in Clerk,
    // update Clerk metadata with the database values
    if (dbUser?.subscription?.plan && !hasActiveSubscription) {
      const dbPlan = dbUser.subscription.plan.toLowerCase();
      const uiPlan = planMapping[dbPlan as keyof typeof planMapping] || 'STANDARD';
      
      console.log('Updating Clerk metadata from database:', {
        dbPlan,
        mappedToPlan: uiPlan,
        subscription: dbUser.subscription
      });
      
      // Update Clerk metadata
      await clerkClient.users.updateUser(userId, {
        publicMetadata: {
          hasActiveSubscription: true,
          subscriptionPlan: uiPlan,
          subscriptionStart: dbUser.subscription.currentPeriodEnd 
            ? new Date(dbUser.subscription.currentPeriodEnd.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString() 
            : new Date().toISOString()
        }
      });
      
      // Use the database values instead of Clerk values
      return NextResponse.json({
        hasActiveSubscription: true,
        subscriptionPlan: uiPlan,
        subscriptionStart: dbUser.subscription.currentPeriodEnd
          ? new Date(dbUser.subscription.currentPeriodEnd.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
          : new Date().toISOString(),
        dbPlan: dbUser.subscription.plan,
        dbStatus: dbUser.subscription.status,
        dbCredits: dbUser.subscription.credits,
        dbSubscriptionId: dbUser.subscription.stripeSubscriptionId,
        chatRequests: (dbUser.subscription as any)?.chatRequests ?? 0,
        lastChatReset: (dbUser.subscription as any)?.lastChatReset,
        role: user.publicMetadata?.role || 'USER'
      });
    }
    
    return NextResponse.json({
      hasActiveSubscription,
      subscriptionPlan,
      subscriptionStart,
      dbPlan: dbUser?.subscription?.plan,
      dbStatus: dbUser?.subscription?.status,
      dbCredits: dbUser?.subscription?.credits,
      dbSubscriptionId: dbUser?.subscription?.stripeSubscriptionId,
      chatRequests: (dbUser?.subscription as any)?.chatRequests ?? 0,
      lastChatReset: (dbUser?.subscription as any)?.lastChatReset,
      role: user.publicMetadata?.role || 'USER'
    })
  } catch (error) {
    console.error('Error checking subscription status:', error)
    return NextResponse.json(
      { 
        hasActiveSubscription: false,
        error: 'Failed to check subscription status'
      }, 
      { status: 500 }
    )
  }
} 