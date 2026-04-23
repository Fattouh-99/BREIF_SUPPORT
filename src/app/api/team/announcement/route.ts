import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { isTeamLeader } from '@/actions/team';
import { ApiError, successResponse } from '@/lib/api-response';
import { NotificationType } from '@/types/notification';
import { pusherServer } from '@/lib/pusher';

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

// Process team announcements from team leaders
export async function POST(req: NextRequest) {
  try {
    // Verify that the user is logged in
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to post team announcements' },
        { status: 401 }
      );
    }

    // Check if the user is a team leader
    const isLeader = await isTeamLeader();
    if (!isLeader) {
      return NextResponse.json(
        { error: 'Only team leaders can post team announcements' },
        { status: 403 }
      );
    }

    // Get the user's team ID from the database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true, teamId: true, fullname: true }
    });

    if (!dbUser?.teamId) {
      return NextResponse.json(
        { error: 'You are not associated with a team' },
        { status: 404 }
      );
    }

    // Parse the request form data
    const formData = await req.formData();
    const announcement = formData.get('announcement') as string;
    
    if (!announcement || announcement.trim() === '') {
      return NextResponse.json(
        { error: 'Announcement message cannot be empty' },
        { status: 400 }
      );
    }

    // Store the team announcement
    // First check if a team settings record exists
    const teamId = dbUser.teamId;
    const now = new Date();
    
    // Use raw SQL query to handle the upsert operation for teamAnnouncement table
    await prisma.$executeRaw`
      INSERT INTO "TeamAnnouncement" ("teamId", "message", "createdAt", "updatedAt", "createdBy")
      VALUES (${teamId}, ${announcement}, ${now}, ${now}, ${dbUser.fullname || user.firstName || 'Team Leader'})
      ON CONFLICT ("teamId") 
      DO UPDATE SET 
        "message" = ${announcement}, 
        "updatedAt" = ${now}, 
        "createdBy" = ${dbUser.fullname || user.firstName || 'Team Leader'}
    `;

    // Get all team members to send notifications to (except the team leader who is posting)
    const teamMembers = await prisma.user.findMany({
      where: {
        teamId: dbUser.teamId,
        id: { not: dbUser.id } // Exclude the team leader
      },
      select: {
        id: true
      }
    });

    // Create notifications for all team members
    if (teamMembers.length > 0) {
      const notificationMessage = `New team announcement from ${dbUser.fullname || 'Team Leader'}`;
      const notificationData = {
        createdAt: now.toISOString(),
        announcement: announcement
      };

      // Create notifications for each team member
      const notificationPromises = teamMembers.map(async (member) => {
        // Create a notification record
        const notification = await prisma.notification.create({
          data: {
            type: NotificationType.TEAM_MESSAGE,
            message: notificationMessage,
            userId: member.id,
            read: false,
            data: notificationData
          }
        });

        // Trigger real-time notification via Pusher
        await pusherServer.trigger(`user-${member.id}`, 'notification', {
          id: notification.id,
          type: NotificationType.TEAM_MESSAGE,
          message: notificationMessage,
          read: false,
          createdAt: notification.createdAt,
          data: notificationData
        });

        return notification;
      });

      await Promise.all(notificationPromises);
    }

    return successResponse({
      message: 'Team announcement posted successfully',
      announcement: {
        message: announcement,
        createdAt: now.toISOString(),
        createdBy: dbUser.fullname || user.firstName || 'Team Leader'
      }
    });
  } catch (error) {
    console.error('Error posting team announcement:', error);
    return NextResponse.json(
      { error: 'Failed to post team announcement' },
      { status: 500 }
    );
  }
}

// Get current team announcement
export async function GET(req: NextRequest) {
  try {
    // Verify that the user is logged in
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to view team announcements' },
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

    // Get the team announcement using raw query
    const announcements: any[] = await prisma.$queryRaw`
      SELECT "teamId", "message", "createdAt", "updatedAt", "createdBy" 
      FROM "TeamAnnouncement" 
      WHERE "teamId" = ${dbUser.teamId}
      LIMIT 1
    `;
    
    const announcement = announcements.length > 0 ? announcements[0] : null;

    if (!announcement) {
      return successResponse({
        announcement: null
      });
    }

    return successResponse({
      announcement: {
        message: announcement.message,
        createdAt: announcement.createdAt.toISOString(),
        updatedAt: announcement.updatedAt.toISOString(),
        createdBy: announcement.createdBy
      }
    });
  } catch (error) {
    console.error('Error fetching team announcement:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team announcement' },
      { status: 500 }
    );
  }
} 