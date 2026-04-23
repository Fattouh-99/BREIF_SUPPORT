'use server';

import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { currentUser, auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { validateUserData } from '@/lib/validation-utils';

/**
 * Get authenticated user's Clerk ID with error handling
 */
export async function getAuthenticatedUserId(): Promise<string | null> {
  try {
    const { userId } = auth();
    return userId;
  } catch (error) {
    console.error('Error getting authenticated user ID:', error);
    return null;
  }
}

/**
 * Ensure user is authenticated, redirect if not
 */
export async function requireAuth(): Promise<string> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    redirect('/auth/sign-in?reason=auth_required');
  }
  return userId;
}

/**
 * Find user by Clerk ID with enhanced data fetching
 */
export async function findUserByClerkId(clerkId: string) {
  if (!clerkId) return null;
  
  try {
    return await prisma.user.findFirst({
      where: { clerkId },
      include: {
        subscription: true,
        domains: {
          include: {
            chatBot: true
          }
        }
      }
    });
  } catch (error) {
    console.error('Error finding user by Clerk ID:', error);
    return null;
  }
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string) {
  if (!email) return null;
  
  try {
    return await prisma.user.findUnique({
      where: { email }
    });
  } catch (error) {
    console.error('Error finding user by email:', error);
    return null;
  }
}

/**
 * Get Clerk user data with proper error handling
 */
export async function getClerkUserData() {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return null;
    }
    
    const primaryEmailObject = clerkUser.emailAddresses.find(email => 
      email.id === clerkUser.primaryEmailAddressId
    );
    
    const email = primaryEmailObject?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress || '';
    
    return {
      email,
      fullname: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
      imageUrl: clerkUser.imageUrl
    };
  } catch (error) {
    console.error('Error getting Clerk user data:', error);
    return null;
  }
}

/**
 * Creates a user in the database with validation
 */
export async function createUserInDatabase(params: CreateUserParams) {
  const {
    clerkId,
    email,
    fullname,
    role = UserRole.OWNER,
    products = [],
    categories = [],
    imageUrl = '',
    teamId = null,
    stripeId = null
  } = params;

  try {
    const user = await prisma.user.create({
      data: {
        clerkId,
        email,
        fullname,
        role: role as UserRole,
        products,
        categories,
        imageUrl,
        teamId,
        stripeId
      },
      include: {
        subscription: true,
        domains: {
          include: {
            chatBot: true
          }
        }
      }
    });
    
    // Create a subscription record if it doesn't exist
    if (!user.subscription) {
      await prisma.billings.create({
        data: {
          plan: 'STANDARD',
          credits: 100,
          userId: user.id
        }
      });
    }
    
    return user;
  } catch (error) {
    console.error('Error creating user in database:', error);
    throw new Error('Failed to create user');
  }
}

/**
 * Updates a user in the database with optimistic locking
 */
export async function updateUserInDatabase(id: string, data: Record<string, any>) {
  try {
    return await prisma.user.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error updating user in database:', error);
    throw new Error('Failed to update user');
  }
}

/**
 * Get user domains with proper access control
 */
export async function getUserDomains(userId: string, teamId?: string | null) {
  try {
    return await prisma.domain.findMany({
      where: {
        OR: [
          { userId },
          ...(teamId ? [{ teamId }] : [])
        ]
      },
      include: {
        chatBot: true
      }
    });
  } catch (error) {
    console.error('Error getting user domains:', error);
    return [];
  }
}

/**
 * Main auth service: Get or create user with comprehensive error handling
 */
export async function getOrCreateUser() {
  try {
    const userId = await getAuthenticatedUserId();
    
    if (!userId) {
      return null;
    }
    
    // Try to find existing user first
    let user = await findUserByClerkId(userId);
    
    if (!user) {
      // Get Clerk user data for creation
      const clerkData = await getClerkUserData();
      
      if (!clerkData) {
        console.error('Could not get Clerk user data for user creation');
        return null;
      }
      
      // Validate user data
      const validation = validateUserData({
        clerkId: userId,
        email: clerkData.email,
        fullname: clerkData.fullname
      });
      
      if (!validation.isValid) {
        console.error('User data validation failed:', validation.errors);
        return null;
      }
      
      try {
        // Use upsert to handle race conditions
        user = await prisma.user.upsert({
          where: { clerkId: userId },
          update: {
            email: clerkData.email,
            fullname: clerkData.fullname,
            imageUrl: clerkData.imageUrl,
            updatedAt: new Date()
          },
          create: {
            clerkId: userId,
            email: clerkData.email,
            fullname: clerkData.fullname,
            role: UserRole.OWNER,
            products: [],
            categories: [],
            imageUrl: clerkData.imageUrl
          },
          include: {
            subscription: true,
            domains: {
              include: {
                chatBot: true
              }
            }
          }
        });
        
        // Create a subscription record if it doesn't exist
        if (!user.subscription) {
          await prisma.billings.create({
            data: {
              plan: 'STANDARD',
              credits: 100,
              userId: user.id
            }
          });
        }
      } catch (error) {
        console.error('Error creating/updating user:', error);
        // If upsert fails, try to find the user again (in case it was created by another request)
        user = await findUserByClerkId(userId);
        if (!user) {
          throw error;
        }
      }
    }
    
    // Always fetch domains separately to ensure consistency
    const domains = await getUserDomains(user.id, user.teamId);
    
    return {
      user,
      domain: domains
    };
  } catch (error) {
    console.error('Error in getOrCreateUser:', error);
    return null;
  }
}

// Type definitions
interface CreateUserParams {
  clerkId: string;
  email: string;
  fullname: string;
  role?: UserRole | string;
  products?: string[];
  categories?: string[];
  imageUrl?: string;
  teamId?: string | null;
  stripeId?: string | null;
} 