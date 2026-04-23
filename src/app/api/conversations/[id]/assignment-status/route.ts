import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

// Common headers for all responses
const getResponseHeaders = () => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  // Cache control headers to reduce polling frequency
  'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
});

export async function OPTIONS() {
  return NextResponse.json({}, { 
    headers: getResponseHeaders()
  });
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { 
          status: 401,
          headers: getResponseHeaders()
        }
      )
    }

    const chatRoomId = params.id
    if (!chatRoomId) {
      return NextResponse.json(
        { error: 'Chat room ID is required' },
        { 
          status: 400,
          headers: getResponseHeaders()
        }
      )
    }

    // Find the current user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        team: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { 
          status: 404,
          headers: getResponseHeaders()
        }
      )
    }

    // Check if user has access to the chat room
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
      include: {
        Customer: {
          include: {
            Domain: true
          }
        },
        sharedWith: true,
        sharedBy: true,
        assignedTo: {
          select: {
            id: true,
            fullname: true,
            email: true
          }
        }
      }
    })

    if (!chatRoom) {
      return NextResponse.json(
        { error: 'Chat room not found' },
        { 
          status: 404,
          headers: getResponseHeaders()
        }
      )
    }

    // Check access permissions
    const isDomainOwner = chatRoom.Customer?.Domain?.userId === user.id
    const isTeamMember = user.teamId && chatRoom.Customer?.Domain?.teamId === user.teamId
    const isSharedDirectly = chatRoom.sharedWith.some((member) => member.id === user.id)
    const isSharer = chatRoom.sharedBy?.id === user.id
    const hasAccess = isDomainOwner || isTeamMember || isSharedDirectly || isSharer

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'You do not have permission to access this chat' },
        { 
          status: 403,
          headers: getResponseHeaders()
        }
      )
    }

    // Check if there's a direct assignment via the new assignedTo field
    let assignedUser = null;
    if (chatRoom.assignedTo) {
      // If there's a direct assignment, use that
      assignedUser = {
        id: chatRoom.assignedTo.id,
        name: chatRoom.assignedTo.fullname,
        email: chatRoom.assignedTo.email
      };
    } else {
      // If no direct assignment, fall back to checking transfers
      const transferRequest = await prisma.transferRequest.findFirst({
        where: {
          chatRoomId,
          status: 'ACCEPTED'
        },
        orderBy: {
          updatedAt: 'desc'
        },
        include: {
          toUser: {
            select: {
              id: true,
              fullname: true,
              email: true
            }
          }
        }
      });
      
      if (transferRequest?.toUser) {
        // If we found a transfer, use it and update the assignedTo field for future use
        assignedUser = {
          id: transferRequest.toUser.id,
          name: transferRequest.toUser.fullname,
          email: transferRequest.toUser.email
        };
        
        // Update the ChatRoom to use the new field
        await prisma.chatRoom.update({
          where: { id: chatRoomId },
          data: {
            assignedToId: transferRequest.toUser.id,
            assignedAt: transferRequest.updatedAt
          }
        });
      } else if (chatRoom.Customer?.Domain?.userId) {
        // If no transfer requests, try the domain owner
        const domainOwner = await prisma.user.findUnique({
          where: { id: chatRoom.Customer.Domain.userId },
          select: {
            id: true,
            fullname: true,
            email: true
          }
        });
        
        if (domainOwner) {
          assignedUser = {
            id: domainOwner.id,
            name: domainOwner.fullname,
            email: domainOwner.email
          };
          
          // Update the ChatRoom to use the new field
          await prisma.chatRoom.update({
            where: { id: chatRoomId },
            data: {
              assignedToId: domainOwner.id,
              assignedAt: new Date()
            }
          });
        }
      }
    }

    // Return assignment information
    return NextResponse.json({
      assignedTo: assignedUser,
      assignedAt: chatRoom.assignedAt || new Date(),
      isCurrentUserAssigned: assignedUser?.id === user.id
    }, {
      headers: getResponseHeaders()
    })
  } catch (error) {
    console.error('Error getting assignment status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: getResponseHeaders()
      }
    )
  }
} 