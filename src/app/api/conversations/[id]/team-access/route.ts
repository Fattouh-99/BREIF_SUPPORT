import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { applySecurityHeaders } from '@/middleware/conversation-security'

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication 
    const { userId } = auth()
    if (!userId) {
      console.warn('Unauthorized access attempt to chat room access check');
      return NextResponse.json(
        { error: 'Unauthorized', hasAccess: false },
        { status: 401 }
      )
    }

    const chatRoomId = params.id
    if (!chatRoomId) {
      console.warn(`Invalid request: Missing chat room ID from ${userId}`);
      return NextResponse.json(
        { error: 'Chat room ID is required', hasAccess: false },
        { status: 400 }
      )
    }

    // Find the current user with role information
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        team: true
      }
    })

    if (!user) {
      console.warn(`User not found in database: ${userId}`);
      return NextResponse.json(
        { error: 'User not found', hasAccess: false },
        { status: 404 }
      )
    }

    // Log the access check for audit purposes
    console.info(`User ${user.id} (${user.email}) checking access to chat room ${chatRoomId}`);

    // Check if user has direct access to the chat room
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
      include: {
        Customer: {
          include: {
            Domain: true
          }
        },
        sharedWith: true,
        sharedBy: true
      }
    })

    if (!chatRoom) {
      console.warn(`Chat room not found: ${chatRoomId}, requested by user ${user.id}`);
      return NextResponse.json(
        { error: 'Chat room not found', hasAccess: false },
        { status: 404 }
      )
    }

    // Check different access scenarios:
    // 1. User is the domain owner
    const isDomainOwner = chatRoom.Customer?.Domain?.userId === user.id

    // 2. User is in the same team as the domain owner
    const isTeamMember = 
      user.teamId && 
      chatRoom.Customer?.Domain?.teamId === user.teamId

    // 3. Chat is shared directly with the user
    const isSharedDirectly = chatRoom.sharedWith.some((member) => member.id === user.id)

    // 4. User is the one who shared the chat
    const isSharer = chatRoom.sharedBy?.id === user.id
    
    // 5. User is a super admin (has access to everything)
    const isSuperAdmin = user.role === 'SUPER_ADMIN'
    
    // 6. User is a team admin and the chat belongs to their team
    const isTeamAdmin = 
      user.role === 'ADMIN' && 
      user.teamId && 
      chatRoom.Customer?.Domain?.teamId === user.teamId

    // Determine access - add admin access overrides
    const hasAccess = 
      isDomainOwner || 
      isTeamMember || 
      isSharedDirectly || 
      isSharer || 
      isSuperAdmin || 
      isTeamAdmin

    // Log the access determination for security auditing
    console.info(`Access determined for user ${user.id} to chat ${chatRoomId}: ${hasAccess ? 'Granted' : 'Denied'}`);
    if (hasAccess) {
      console.info(`Access reason: ${
        isDomainOwner ? 'Domain Owner' : 
        isTeamMember ? 'Team Member' : 
        isSharedDirectly ? 'Shared With User' : 
        isSharer ? 'Chat Sharer' :
        isSuperAdmin ? 'Super Admin' :
        isTeamAdmin ? 'Team Admin' : 'Unknown'
      }`);
    }

    // Create the response with security headers
    const response = NextResponse.json({
      hasAccess,
      accessType: {
        isDomainOwner,
        isTeamMember,
        isSharedDirectly,
        isSharer,
        isAdmin: isSuperAdmin || isTeamAdmin
      }
    });

    // Apply security headers to the response
    return applySecurityHeaders(response);
  } catch (error) {
    console.error('Error checking team access:', error);
    
    const response = NextResponse.json(
      { error: 'Internal server error', hasAccess: false },
      { status: 500 }
    );
    
    return applySecurityHeaders(response);
  }
} 