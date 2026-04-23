import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { isTeamLeader } from '@/actions/team';
import { ApiError, successResponse } from '@/lib/api-response';

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

// Process recognition messages from team leaders
export async function POST(req: NextRequest) {
  try {
    // Verify that the user is logged in
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to post recognition messages' },
        { status: 401 }
      );
    }

    // Check if the user is a team leader
    const isLeader = await isTeamLeader();
    if (!isLeader) {
      return NextResponse.json(
        { error: 'Only team leaders can post recognition messages' },
        { status: 403 }
      );
    }

    // Get the user's team ID from the database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { teamId: true, fullname: true }
    });

    if (!dbUser?.teamId) {
      return NextResponse.json(
        { error: 'You are not associated with a team' },
        { status: 404 }
      );
    }

    // Parse the request form data
    const formData = await req.formData();
    const recognitionMessage = formData.get('recognition_message') as string;
    
    if (!recognitionMessage || recognitionMessage.trim() === '') {
      return NextResponse.json(
        { error: 'Recognition message cannot be empty' },
        { status: 400 }
      );
    }

    // Store the team recognition message
    // First check if a team settings record exists
    let teamSettings = await prisma.teamSettings.findUnique({
      where: { teamId: dbUser.teamId }
    });

    const now = new Date();
    const recognitionData = {
      message: recognitionMessage,
      createdAt: now.toISOString(),
      createdBy: dbUser.fullname || user.firstName || 'Team Leader'
    };

    if (teamSettings) {
      // Update existing team settings
      await prisma.teamSettings.update({
        where: { id: teamSettings.id },
        data: { 
          recognitionMessage: JSON.stringify(recognitionData),
          updatedAt: now
        }
      });
    } else {
      // Create new team settings
      await prisma.teamSettings.create({
        data: {
          teamId: dbUser.teamId,
          recognitionMessage: JSON.stringify(recognitionData),
          createdAt: now,
          updatedAt: now
        }
      });
    }

    return successResponse({
      message: 'Team recognition message posted successfully',
      recognition: recognitionData
    });
  } catch (error) {
    console.error('Error posting team recognition:', error);
    return NextResponse.json(
      { error: 'Failed to post team recognition message' },
      { status: 500 }
    );
  }
}

// Get current team recognition message
export async function GET(req: NextRequest) {
  try {
    // Verify that the user is logged in
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to view team recognition' },
        { status: 401 }
      );
    }

    // Get the user's team ID from the database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { teamId: true }
    });

    if (!dbUser?.teamId) {
      return NextResponse.json(
        { error: 'You are not associated with a team' },
        { status: 404 }
      );
    }

    // Get the team settings which contains the recognition message
    const teamSettings = await prisma.teamSettings.findUnique({
      where: { teamId: dbUser.teamId }
    });

    if (!teamSettings?.recognitionMessage) {
      return successResponse({
        recognition: null
      });
    }

    // Parse the recognition message
    try {
      const recognitionData = JSON.parse(teamSettings.recognitionMessage);
      return successResponse({
        recognition: recognitionData
      });
    } catch (error) {
      console.error('Error parsing recognition message:', error);
      return successResponse({
        recognition: null
      });
    }
  } catch (error) {
    console.error('Error fetching team recognition:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team recognition' },
      { status: 500 }
    );
  }
} 