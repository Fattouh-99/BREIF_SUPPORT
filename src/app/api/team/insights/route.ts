import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getTeamMemberInsights } from '@/actions/team';
import { ApiError, successResponse } from '@/lib/api-response';

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

// Get team insights for a specific user
export async function GET(req: NextRequest) {
  try {
    // Verify that the user is logged in
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to view team insights' },
        { status: 401 }
      );
    }

    // Get the query parameters
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required parameter: userId' },
        { status: 400 }
      );
    }

    // Get the user from the database to check authentication
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true, teamId: true, role: true }
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found in the database' },
        { status: 404 }
      );
    }

    // Only allow users to get insights for themselves or team leaders to get insights for team members
    const isTeamLeader = dbUser.role === 'OWNER';
    const isForCurrentUser = dbUser.id === userId;

    if (!isForCurrentUser && !isTeamLeader) {
      return NextResponse.json(
        { error: 'You are not authorized to view insights for this user' },
        { status: 403 }
      );
    }

    // Check if the target user is on the same team (if not requesting for self)
    if (!isForCurrentUser) {
      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { teamId: true }
      });

      if (!targetUser || targetUser.teamId !== dbUser.teamId) {
        return NextResponse.json(
          { error: 'You can only view insights for members of your team' },
          { status: 403 }
        );
      }
    }

    // Get the insights
    const insights = await getTeamMemberInsights(userId);

    if (!insights) {
      return NextResponse.json(
        { error: 'Failed to retrieve team insights' },
        { status: 500 }
      );
    }

    return successResponse({
      insights
    });
  } catch (error) {
    console.error('Error fetching team insights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team insights' },
      { status: 500 }
    );
  }
} 