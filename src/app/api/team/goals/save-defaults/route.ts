import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { isTeamLeader } from '@/actions/team';
import { ApiError, successResponse } from '@/lib/api-response';

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // Verify that the user is logged in
    const user = await currentUser();
    if (!user) {
      throw ApiError.Unauthorized('You must be logged in to save default goals');
    }

    // Check if the user is a team leader
    const isLeader = await isTeamLeader();
    if (!isLeader) {
      throw ApiError.Forbidden('Only team leaders can save default goals');
    }

    // Get the user's team ID from the database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { teamId: true }
    });

    if (!dbUser?.teamId) {
      throw ApiError.NotFound('You are not associated with a team');
    }

    // Get the team's current goals from the TeamSettings table
    const teamSettingsResults = await prisma.$queryRaw<Array<{
      id: string;
      teamId: string;
      goalSettings?: string;
    }>>`
      SELECT "id", "teamId", "goalSettings" 
      FROM "TeamSettings"
      WHERE "teamId" = ${dbUser.teamId}::uuid
      LIMIT 1
    `;

    const teamSettings = teamSettingsResults[0];
    
    // If no settings exist yet, return an error
    if (!teamSettings?.goalSettings) {
      throw ApiError.BadRequest('No goals exist to save as defaults');
    }

    // Goals already saved in the database, just confirm success
    return successResponse({
      message: 'Current goals have been saved as defaults successfully',
    });
  } catch (error) {
    console.error('Error saving default goals:', error);
    
    // Handle ApiError instances
    if (error && typeof error === 'object' && 'response' in error && typeof error.response === 'function') {
      return error.response();
    }
    
    return ApiError.InternalError('Failed to save default goals').response();
  }
} 