'use server'

import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
// Replace direct import with type definition
type UserRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'SUPER_ADMIN'
import { revalidatePath } from 'next/cache'
import { auth } from '@clerk/nextjs'

// Check if any super admin exists in the system
const checkIfSuperAdminExists = async () => {
  const superAdmin = await client.user.findFirst({
    where: {
      role: 'SUPER_ADMIN' as UserRole
    }
  })
  return !!superAdmin
}

// Check if the current user is a super admin
export const isCurrentUserSuperAdmin = async () => {
  try {
    const user = await currentUser()
    if (!user) {
      return false
    }

    const dbUser = await client.user.findUnique({
      where: {
        clerkId: user.id
      },
      select: {
        role: true
      }
    })

    // Use string comparison instead of enum
    return dbUser?.role === 'SUPER_ADMIN'
  } catch (error) {
    console.error('Error checking super admin status:', error)
    return false
  }
}

// Check admin access and fetch users
export const checkAdminAccess = async () => {
  try {
    // Get the current user
    const user = await currentUser()
    if (!user) {
      return { authorized: false, error: 'Not authenticated' }
    }

    // Get the user from the database
    const dbUser = await client.user.findUnique({
      where: {
        clerkId: user.id
      },
      select: {
        role: true
      }
    })

    // If the user is not a super admin, return unauthorized
    if (!dbUser || dbUser.role !== 'SUPER_ADMIN') {
      return { authorized: false, error: 'Not authorized' }
    }

    // Fetch users for the admin
    const users = await client.user.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        fullname: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    return { authorized: true, users }
  } catch (error) {
    console.error('Error checking admin access:', error)
    return { authorized: false, error: 'Failed to check access' }
  }
}

// Create a new super admin using an invitation code
export const createSuperAdmin = async (userId: string, invitationCode: string) => {
  try {
    console.log('Creating super admin with:', { userId, invitationCode })
    
    // First, check if this is the initial admin setup
    const superAdminExists = await checkIfSuperAdminExists()
    const initialSetupCode = process.env.INITIAL_ADMIN_CODE

    console.log('Setup check:', { superAdminExists, hasInitialCode: !!initialSetupCode })

    // For initial setup, use the INITIAL_ADMIN_CODE
    if (!superAdminExists && initialSetupCode && invitationCode === initialSetupCode) {
      console.log('Performing initial setup...')
      const updatedUser = await client.user.update({
        where: { id: userId },
        data: { role: 'SUPER_ADMIN' as UserRole }
      })
      console.log('User updated:', updatedUser)
      return { success: true, user: updatedUser, isInitialSetup: true }
    }

    // If not initial setup, verify the regular invitation code
    const validCode = process.env.ADMIN_INVITATION_CODE
    if (!validCode || invitationCode !== validCode) {
      console.log('Invalid invitation code')
      throw new Error('Invalid invitation code')
    }

    // Update the user's role to super admin
    const updatedUser = await client.user.update({
      where: {
        id: userId
      },
      data: {
        role: 'SUPER_ADMIN' as UserRole
      }
    })

    console.log('User updated (non-initial setup):', updatedUser)
    return { success: true, user: updatedUser }
  } catch (error) {
    console.error('Error creating super admin:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create super admin' }
  }
}

// Get all users in the system
export const getAllUsers = async () => {
  try {
    // First check if current user is super admin
    const isAdmin = await isCurrentUserSuperAdmin()
    if (!isAdmin) {
      throw new Error('Unauthorized. Only super admins can access this data.')
    }

    const users = await client.user.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        fullname: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    return users
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

// Update a user's role
export const updateUserRole = async (userId: string, newRole: UserRole) => {
  try {
    // First check if current user is super admin
    const isAdmin = await isCurrentUserSuperAdmin()
    if (!isAdmin) {
      throw new Error('Unauthorized. Only super admins can update user roles.')
    }

    // Update the user's role
    const updatedUser = await client.user.update({
      where: {
        id: userId
      },
      data: {
        role: newRole
      }
    })

    // Revalidate the admin page to refresh data
    revalidatePath('/admin')

    return updatedUser
  } catch (error) {
    console.error('Error updating user role:', error)
    throw error
  }
}

// Generate a new admin invitation code
export const generateAdminInvitationCode = async () => {
  try {
    // Check if the current user is a super admin
    const isAdmin = await isCurrentUserSuperAdmin()
    if (!isAdmin) {
      throw new Error('Unauthorized. Only super admins can generate invitation codes.')
    }

    // Generate a random code (you might want to store this in a database)
    const code = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    
    // In a real application, you would:
    // 1. Store the code in the database with an expiration date
    // 2. Send the code via email to the invited admin
    // 3. Track usage of the code
    
    return { success: true, code }
  } catch (error) {
    console.error('Error generating invitation code:', error)
    return { success: false, error: 'Failed to generate invitation code' }
  }
}

/**
 * Get user account statistics
 * - Total users count
 * - New users in last 7 days, 30 days
 * - User distribution by plan
 * - User distribution by role
 */
export const getUserStatistics = async () => {
  try {
    const { userId } = auth();
    
    // Check if user has admin access
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }
    
    const user = await client.user.findUnique({
      where: { clerkId: userId },
      select: { role: true }
    });
    
    if (!user || user.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Admin access required' };
    }
    
    // Get total users count
    const totalUsers = await client.user.count();
    
    // Get new users in last 7 days
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    const newUsersLast7Days = await client.user.count({
      where: {
        createdAt: {
          gte: last7Days
        }
      }
    });
    
    // Get new users in last 30 days
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    
    const newUsersLast30Days = await client.user.count({
      where: {
        createdAt: {
          gte: last30Days
        }
      }
    });
    
    // Get user distribution by role
    const usersByRole = await client.user.groupBy({
      by: ['role'],
      _count: {
        id: true
      }
    });
    
    // Get user distribution by plan (from Billings table)
    const usersByPlan = await client.billings.groupBy({
      by: ['plan'],
      _count: {
        id: true
      }
    });
    
    // Create a properly formatted result
    const roleDistribution = usersByRole.map((item: { role: string; _count: { id: number } }) => ({
      role: item.role,
      count: item._count.id
    }));
    
    const planDistribution = usersByPlan.map((item: { plan: string; _count: { id: number } }) => ({
      plan: item.plan,
      count: item._count.id
    }));
    
    return {
      success: true,
      stats: {
        totalUsers,
        newUsersLast7Days,
        newUsersLast30Days,
        roleDistribution,
        planDistribution
      }
    };
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    return { success: false, error: 'Failed to fetch user statistics' };
  }
}

/**
 * Submit customer feedback to the database
 */
export const submitCustomerFeedback = async (data: {
  name: string;
  email: string;
  featureType: string;
  description: string;
}) => {
  try {
    const feedback = await client.customerFeedback.create({
      data: {
        name: data.name,
        email: data.email,
        featureType: data.featureType,
        description: data.description,
        status: 'NEW',
        createdAt: new Date()
      }
    });
    
    // Revalidate admin page to show new feedback
    revalidatePath('/admin');
    
    return { success: true, feedback };
  } catch (error) {
    console.error('Error submitting customer feedback:', error);
    return { success: false, error: 'Failed to submit feedback' };
  }
}

/**
 * Subscribe email to newsletter
 */
export const subscribeToNewsletter = async (email: string) => {
  try {
    // Check if the email is already subscribed
    const existing = await client.newsletterSubscriber.findUnique({
      where: { email }
    });
    
    if (existing) {
      return { success: true, message: 'Already subscribed' };
    }
    
    // Create new subscription
    const subscription = await client.newsletterSubscriber.create({
      data: {
        email,
        status: 'ACTIVE',
        subscribedAt: new Date()
      }
    });
    
    // Revalidate admin page to show new subscriber
    revalidatePath('/admin');
    
    return { success: true, subscription };
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    return { success: false, error: 'Failed to subscribe' };
  }
}

/**
 * Get all customer feedback
 */
export const getAllCustomerFeedback = async () => {
  try {
    // First check if current user is super admin
    const isAdmin = await isCurrentUserSuperAdmin();
    if (!isAdmin) {
      throw new Error('Unauthorized. Only super admins can access this data.');
    }

    const feedback = await client.customerFeedback.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return feedback;
  } catch (error) {
    console.error('Error fetching customer feedback:', error);
    throw error;
  }
}

/**
 * Get all newsletter subscribers
 */
export const getAllNewsletterSubscribers = async () => {
  try {
    // First check if current user is super admin
    const isAdmin = await isCurrentUserSuperAdmin();
    if (!isAdmin) {
      throw new Error('Unauthorized. Only super admins can access this data.');
    }

    const subscribers = await client.newsletterSubscriber.findMany({
      orderBy: {
        subscribedAt: 'desc'
      }
    });

    return subscribers;
  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error);
    throw error;
  }
} 