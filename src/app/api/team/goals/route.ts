import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { isTeamLeader } from '@/actions/team';
import { ApiError, successResponse, ErrorDetails } from '@/lib/api-response';

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

// Custom JSON-based storage for team goal targets, keyed by team ID
interface GoalSettings {
  clientsTarget: number;
  interactionsTarget: number;
  ticketsTarget: number;
}

// Default values for goal settings
const defaultGoalSettings: GoalSettings = { 
  clientsTarget: 10, 
  interactionsTarget: 50, 
  ticketsTarget: 20
};

export async function GET(req: NextRequest) {
  try {
    // Verify that the user is logged in
    const user = await currentUser();
    if (!user) {
      throw ApiError.Unauthorized('You must be logged in to view team goals');
    }

    // Check if the user is a team leader
    const isLeader = await isTeamLeader();
    if (!isLeader) {
      throw ApiError.Forbidden('Only team leaders can view custom team goals');
    }

    // Get the user's team ID from the database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { teamId: true }
    });

    if (!dbUser?.teamId) {
      throw ApiError.NotFound('You are not associated with a team');
    }

    // Fetch team settings - Use prisma.$queryRaw to avoid type errors
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

    // Return default goals if no custom settings exist
    if (!teamSettings?.goalSettings) {
      return successResponse({
        goals: {
          clients: defaultGoalSettings.clientsTarget,
          interactions: defaultGoalSettings.interactionsTarget,
          tickets: defaultGoalSettings.ticketsTarget
        }
      });
    }

    // Parse stored goal settings
    let goalSettings: GoalSettings;
    try {
      goalSettings = JSON.parse(teamSettings.goalSettings);
    } catch (error) {
      console.error('Error parsing goal settings:', error);
      // Return default goals if parsing fails
      return successResponse({
        goals: {
          clients: defaultGoalSettings.clientsTarget,
          interactions: defaultGoalSettings.interactionsTarget,
          tickets: defaultGoalSettings.ticketsTarget
        }
      });
    }

    return successResponse({
      goals: {
        clients: goalSettings.clientsTarget || defaultGoalSettings.clientsTarget,
        interactions: goalSettings.interactionsTarget || defaultGoalSettings.interactionsTarget,
        tickets: goalSettings.ticketsTarget || defaultGoalSettings.ticketsTarget
      }
    });
  } catch (error) {
    console.error('Error fetching team goals:', error);
    
    // Handle ApiError instances
    if (error && typeof error === 'object' && 'response' in error && typeof error.response === 'function') {
      return error.response();
    }
    
    return ApiError.InternalError('Failed to fetch team goals').response();
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify that the user is logged in
    const user = await currentUser();
    if (!user) {
      throw ApiError.Unauthorized('You must be logged in to update team goals');
    }

    // Check if the user is a team leader
    const isLeader = await isTeamLeader();
    if (!isLeader) {
      throw ApiError.Forbidden('Only team leaders can update team goals');
    }

    // Get the user's team ID from the database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { teamId: true }
    });

    if (!dbUser?.teamId) {
      throw ApiError.NotFound('You are not associated with a team');
    }

    // Parse request body
    const formData = await req.formData();
    const goalType = formData.get('goal_type') as string;
    const targetStr = formData.get('target') as string;
    
    // Validate input
    if (!goalType || !targetStr) {
      throw ApiError.BadRequest('Missing required fields: goal_type or target');
    }
    
    const target = parseInt(targetStr, 10);
    if (isNaN(target) || target <= 0) {
      throw ApiError.BadRequest('Target must be a positive number');
    }

    // Get existing team settings or create new ones using raw query
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

    // Parse existing goal settings or create new ones
    let goalSettings: GoalSettings = { ...defaultGoalSettings };
    
    if (teamSettings?.goalSettings) {
      try {
        goalSettings = JSON.parse(teamSettings.goalSettings);
      } catch (error) {
        console.error('Error parsing existing goal settings, starting fresh:', error);
      }
    }

    // Update the appropriate goal target
    switch (goalType) {
      case 'clients':
        goalSettings.clientsTarget = target;
        break;
      case 'interactions':
        goalSettings.interactionsTarget = target;
        break;
      case 'tickets':
        goalSettings.ticketsTarget = target;
        break;
      default:
        throw ApiError.BadRequest(`Invalid goal type: ${goalType}`);
    }

    // Store updated settings
    if (teamSettings) {
      // Update existing team settings
      await prisma.$executeRaw`
        UPDATE "TeamSettings"
        SET "goalSettings" = ${JSON.stringify(goalSettings)}
        WHERE "id" = ${teamSettings.id}::uuid
      `;
    } else {
      // Create new team settings
      await prisma.$executeRaw`
        INSERT INTO "TeamSettings" ("teamId", "goalSettings")
        VALUES (${dbUser.teamId}::uuid, ${JSON.stringify(goalSettings)})
      `;
    }

    return successResponse({
      message: `Successfully updated ${goalType} goal target to ${target}`,
      updatedGoals: {
        clients: goalSettings.clientsTarget,
        interactions: goalSettings.interactionsTarget,
        tickets: goalSettings.ticketsTarget
      }
    });
  } catch (error) {
    console.error('Error updating team goals:', error);
    
    // Handle ApiError instances
    if (error && typeof error === 'object' && 'response' in error && typeof error.response === 'function') {
      return error.response();
    }
    
    return ApiError.InternalError('Failed to update team goals').response();
  }
} 