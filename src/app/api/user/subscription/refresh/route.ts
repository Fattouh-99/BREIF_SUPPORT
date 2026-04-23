import { clerkClient } from '@clerk/nextjs'
import { getAuth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

// Plan mapping from database to UI
const planMapping = {
  'standard': 'STANDARD',
  'pro': 'PRO',
  // Fallback mappings for legacy plans
  'starter': 'STANDARD',
  'business': 'PRO',
}

export async function POST(req: NextRequest) {
  try {
    // Get the authenticated user
    const { userId } = getAuth(req)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' }, 
        { status: 401 }
      )
    }
    
    // Get the user data from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { 
        id: true,
        email: true,
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

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      )
    }

    // If user has subscription in database
    if (dbUser.subscription) {
      // Convert database plan to UI plan name
      const dbPlan = dbUser.subscription.plan.toLowerCase();
      const uiPlan = planMapping[dbPlan as keyof typeof planMapping] || 'STANDARD';
      
      console.log('Forcing update of Clerk metadata:', {
        userId,
        dbPlan,
        mappedToPlan: uiPlan,
        subscription: dbUser.subscription
      });
      
      // Update Clerk metadata with subscription info
      await clerkClient.users.updateUser(userId, {
        publicMetadata: {
          hasActiveSubscription: true,
          subscriptionPlan: uiPlan,
          subscriptionStart: dbUser.subscription.currentPeriodEnd 
            ? new Date(dbUser.subscription.currentPeriodEnd.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString() 
            : new Date().toISOString()
        }
      });
      
      return NextResponse.json({
        success: true,
        message: 'Subscription data refreshed successfully',
        plan: uiPlan,
        dbPlan: dbUser.subscription.plan,
        hasActiveSubscription: true,
        status: dbUser.subscription.status
      });
    } else {
      // No subscription in database, set to STANDARD
      await clerkClient.users.updateUser(userId, {
        publicMetadata: {
          hasActiveSubscription: false,
          subscriptionPlan: 'STANDARD',
        }
      });
      
      return NextResponse.json({
        success: true,
        message: 'User has no subscription, set to STANDARD',
        plan: 'STANDARD',
        hasActiveSubscription: false
      });
    }
  } catch (error) {
    console.error('Error refreshing subscription:', error)
    return NextResponse.json(
      { error: 'Failed to refresh subscription' }, 
      { status: 500 }
    )
  }
} 