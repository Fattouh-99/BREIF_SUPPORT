import { ApiError, successResponse } from '@/lib/api-response'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

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
  const user = await prisma.user.findUnique({
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

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return ApiError.Unauthorized();
    }

    const body = await request.json();
    const { plan } = body;

    if (!plan) {
      return ApiError.BadRequest('Plan is required');
    }

    // Get user's database ID and current plan
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { 
        id: true,
        subscription: {
          select: { plan: true }
        }
      }
    });

    if (!dbUser) {
      return ApiError.NotFound('User not found');
    }

    const currentPlan = (dbUser.subscription?.plan || 'STANDARD') as 'STANDARD' | 'PRO';
    const newPlan = plan as 'STANDARD' | 'PRO';
    
    // Calculate prorated amount if upgrading
    const daysRemaining = await getDaysRemainingInCycle(dbUser.id);
    const amount = calculateProratedAmount(currentPlan, newPlan, daysRemaining);

    return successResponse({ 
      amount,
      daysRemaining,
      currentPlan,
      newPlan
    });
  } catch (error) {
    console.error('Error calculating prorated amount:', error);
    return ApiError.InternalError('Failed to calculate prorated amount');
  }
} 