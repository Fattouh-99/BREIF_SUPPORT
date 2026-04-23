import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { ApiError, successResponse } from '@/lib/api-response';

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

// Get team settings for the current user's team
export async function GET(req: NextRequest) {
  try {
    // Verify that the user is logged in
    const user = await currentUser();
    if (!user) {
      throw ApiError.Unauthorized('You must be logged in to view team settings');
    }

    // Get the user's team ID from the database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { teamId: true }
    });

    if (!dbUser?.teamId) {
      throw ApiError.NotFound('You are not associated with a team');
    }

    // Fetch team settings from the database
    let teamSettings = null;
    let teamAnnouncement = null;
    
    try {
      // Use raw query to avoid type issues with Prisma client for TeamSettings
      const settingsResults = await prisma.$queryRaw<Array<{
        id: string;
        teamId: string;
        recognitionMessage?: string;
        goalSettings?: string;
        createdAt: Date;
        updatedAt: Date;
      }>>`
        SELECT "id", "teamId", "recognitionMessage", "goalSettings", "createdAt", "updatedAt" 
        FROM "TeamSettings"
        WHERE "teamId" = ${dbUser.teamId}::uuid
        LIMIT 1
      `;
      
      // Fetch announcement from separate TeamAnnouncement table
      const announcementResults = await prisma.$queryRaw<Array<{
        id: string;
        teamId: string;
        message?: string;
        createdBy?: string;
        createdAt: Date;
        updatedAt: Date;
      }>>`
        SELECT "id", "teamId", "message", "createdBy", "createdAt", "updatedAt" 
        FROM "TeamAnnouncement"
        WHERE "teamId" = ${dbUser.teamId}::uuid
        LIMIT 1
      `;
      
      if (settingsResults.length > 0) {
        teamSettings = settingsResults[0];
        
        // Parse JSON fields
        if (teamSettings.recognitionMessage) {
          try {
            teamSettings.recognitionMessage = JSON.parse(teamSettings.recognitionMessage);
          } catch (e) {
            console.error('Error parsing recognition message:', e);
          }
        }
        
        if (teamSettings.goalSettings) {
          try {
            teamSettings.goalSettings = JSON.parse(teamSettings.goalSettings);
          } catch (e) {
            console.error('Error parsing goal settings:', e);
          }
        }
      }
      
      if (announcementResults.length > 0) {
        teamAnnouncement = announcementResults[0];
      }
    } catch (error) {
      console.error('Error fetching team settings:', error);
      throw ApiError.InternalError('Failed to fetch team settings');
    }

    return successResponse({
      teamSettings: teamSettings || {
        teamId: dbUser.teamId,
        recognitionMessage: null,
        goalSettings: null
      },
      teamAnnouncement: teamAnnouncement || {
        teamId: dbUser.teamId,
        message: null
      }
    });
  } catch (error: unknown) {
    console.error('Error in team settings API:', error);
    
    // Use improved error handling with ApiError
    if (error && typeof error === 'object' && 'response' in error && typeof error.response === 'function') {
      return error.response();
    }
    
    // Default error response
    return ApiError.InternalError('Failed to fetch team settings').response();
  }
} 