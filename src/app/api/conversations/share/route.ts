import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { NotificationType } from '@prisma/client'
import { 
  validateChatRoomAccess, 
  validateTeamMembership, 
  addSystemMessage, 
  createNotification, 
  notifyUser,
  broadcastToChatRoom
} from '@/lib/conversation-sharing'
import { validateBody } from '@/lib/validation'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, ApiError } from '@/lib/api-response'

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

// Validate request body schema
const ShareSchema = z.object({
  chatRoomId: z.string().uuid(),
  memberId: z.string().uuid()
})

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return ApiError.Unauthorized()
    }

    // Validate request body
    const { chatRoomId, memberId } = await validateBody(req, ShareSchema)

    try {
      // Validate chat room access
      const { currentUser, chatRoom } = await validateChatRoomAccess(userId, chatRoomId)
      
      // Validate team membership
      const teamMember = await validateTeamMembership(currentUser, memberId)
      
      // Check if already shared with this member
      if (chatRoom.sharedWith.some(user => user.id === teamMember.id)) {
        return ApiError.BadRequest('Chat already shared with this team member')
      }

      // Update chat room
      const updatedChatRoom = await prisma.chatRoom.update({
        where: { id: chatRoomId },
        data: {
          shared: true,
          sharedById: currentUser.id,
          sharedWith: {
            connect: { id: teamMember.id }
          }
        },
        include: {
          Customer: true
        }
      })

      // Add system message about sharing
      await addSystemMessage(
        chatRoom.id, 
        `${currentUser.fullname} shared this conversation with ${teamMember.fullname}`
      )

      // Create notification message
      const notificationMessage = chatRoom.Customer?.email 
        ? `${currentUser.fullname} shared a conversation with customer ${chatRoom.Customer.email} with you`
        : `${currentUser.fullname} shared a conversation with you`

      // Create notification data
      const notificationData = {
        chatRoomId: chatRoom.id,
        sharedBy: currentUser.fullname,
        customerEmail: chatRoom.Customer?.email
      }

      // Create notification for the team member
      await createNotification(
        NotificationType.TEAM_MESSAGE,
        notificationMessage,
        teamMember.id,
        notificationData
      )

      // Notify the team member in real-time
      await notifyUser(
        teamMember.id, 
        'notification', 
        {
          type: NotificationType.TEAM_MESSAGE,
          message: notificationMessage,
          chatRoomId: chatRoom.id,
          customerEmail: chatRoom.Customer?.email,
          sharedBy: currentUser.fullname,
          data: notificationData
        }
      )
      
      // Broadcast to all users in the chat room
      await broadcastToChatRoom(
        chatRoom.id,
        'share-status-changed',
        {
          shared: true,
          sharedBy: currentUser.id,
          sharedWith: teamMember
        }
      )

      return successResponse({ success: true })
      
    } catch (error) {
      if (error instanceof Response) {
        return error
      }
      
      console.error('Error in share operation:', error)
      return errorResponse(
        'Share operation failed',
        500, 
        error instanceof Error ? error.message : 'Unknown error'
      )
    }
  } catch (error) {
    console.error('Error sharing conversation:', error)
    return errorResponse(
      'Internal Server Error',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
} 