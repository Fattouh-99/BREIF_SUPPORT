'use server';

import { 
  getOrCreateUser as getOrCreateUserUtil,
  updateUserInDatabase,
  requireAuth as requireAuthUtil,
  createUserInDatabase
} from '@/lib/auth-utils';
import { UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

/**
 * Gets or creates a user in the database based on Clerk authentication
 * 
 * @returns User data with domains or null if not authenticated
 */
export async function getOrCreateUser() {
  return await getOrCreateUserUtil();
}

/**
 * Authentication check function for dashboard layout
 * Verifies the user is logged in and retrieves their data
 * 
 * @returns User data with domains or a redirect object
 */
export async function onLoginUser() {
  try {
    const userData = await getOrCreateUserUtil();
    
    if (!userData || !userData.user) {
      return redirect('/auth/sign-in');
    }
    
    // Update the last activity timestamp
    await updateUserInDatabase(userData.user.id, { updatedAt: new Date() });
    
    return userData;
  } catch (error) {
    console.error('Error in onLoginUser:', error);
    return redirect('/auth/sign-in');
  }
}

/**
 * Ensures a user exists in the database based on Clerk authentication
 * Similar to getOrCreateUser but always redirects to sign-in if no user
 */
export async function ensureUserExists() {
  const userData = await getOrCreateUserUtil();
  
  if (!userData || !userData.user) {
    return redirect('/auth/sign-in');
  }
  
  return userData;
}

/**
 * Require authentication and return user ID
 */
export async function requireAuth() {
  return await requireAuthUtil();
}

/**
 * Complete user registration with additional data
 */
export async function onCompleteUserRegistration(
  fullname: string,
  clerkId: string,
  role: UserRole,
  products: string[],
  categories: string[],
  targetAudience: string | null,
  imageUrl: string,
  email: string,
  selectedPlan: string,
  stripeId?: string,
  teamId?: string | null
) {
  try {
    // 1. Create user in DB (default subscription will be created inside util with STANDARD plan)
    const user = await createUserInDatabase({
      clerkId,
      email,
      fullname,
      role,
      products,
      categories,
      imageUrl,
      teamId,
      stripeId
    });

    // 2. If the signup flow contained a paid plan, immediately update the billing record.
    try {
      const planMap: Record<string, { plan: 'standard' | 'pro'; credits: number }> = {
        // lowercase & canonical
        standard: { plan: 'standard', credits: 100 },
        pro: { plan: 'pro', credits: 1000 },

        // legacy API plan ids
        starter: { plan: 'standard', credits: 100 },
        business: { plan: 'pro', credits: 1000 },

        // uppercase variants
        STANDARD: { plan: 'standard', credits: 100 },
        PRO: { plan: 'pro', credits: 1000 },
      }

      const mapped = planMap[selectedPlan] || planMap[selectedPlan.toLowerCase()] || planMap['standard']

      await prisma.billings.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          plan: mapped.plan,
          credits: mapped.credits,
          status: 'active',
        },
        update: {
          plan: mapped.plan,
          credits: mapped.credits,
          status: 'active',
        },
      })
    } catch (billingError) {
      console.error('Failed to set user subscription during registration:', billingError)
      // Non-fatal – continue
    }

    return {
      status: 200,
      user,
      message: 'User registration completed successfully'
    };
  } catch (error) {
    console.error('Error completing user registration:', error);
    return {
      status: 500,
      error: error instanceof Error ? error.message : 'Failed to complete registration'
    };
  }
} 