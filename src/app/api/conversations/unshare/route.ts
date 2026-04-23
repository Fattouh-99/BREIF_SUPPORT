import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { 
  validateChatRoomAccess, 
  addSystemMessage, 
  notifyUser,
  broadcastToChatRoom
} from '@/lib/conversation-sharing'
import { validateBody } from '@/lib/validation'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, ApiError } from '@/lib/api-response'

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

// Validate request body schema
const UnshareSchema = z.object({
  chatRoomId: z.string().uuid()
})

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return ApiError.Unauthorized()
    }

    // Validate request body
    const { chatRoomId } = await validateBody(req, UnshareSchema)

    try {
      // Validate chat room access
      const { currentUser, chatRoom } = await validateChatRoomAccess(userId, chatRoomId)
      
      // Update chat room to remove the user from sharedWith
      const updatedChatRoom = await prisma.chatRoom.update({
        where: { id: chatRoomId },
        data: {
          sharedWith: {
            disconnect: { id: currentUser.id }
          }
        },
        include: {
          sharedWith: true
        }
      })

      // If no more shared users, set shared to false and clear sharedById
      if (updatedChatRoom.sharedWith.length === 0) {
        await prisma.chatRoom.update({
          where: { id: chatRoomId },
          data: { 
            shared: false,
            sharedById: null
          }
        })
      }

      // Add system message about unsharing
      await addSystemMessage(
        chatRoomId,
        `${currentUser.fullname} has stopped viewing this shared conversation`
      )

      // Notify the original sharer
      if (chatRoom.sharedBy) {
        await notifyUser(
          chatRoom.sharedBy.id, 
          'notification', 
          {
            type: 'SHARED_CONVERSATION',
            message: `${currentUser.fullname} has stopped viewing the shared conversation`,
            chatRoomId: chatRoomId
          }
        )
      }

      // Notify all remaining shared users
      for (const user of updatedChatRoom.sharedWith) {
        if (user.id !== currentUser.id) {
          await notifyUser(
            user.id, 
            'notification', 
            {
              type: 'SHARED_CONVERSATION',
              message: `${currentUser.fullname} has stopped viewing the shared conversation`,
              chatRoomId: chatRoomId
            }
          )
        }
      }

      // Broadcast to all users to update their UI
      await broadcastToChatRoom(
        chatRoomId,
        'share-status-changed',
        {
          unshared: true,
          userId: currentUser.id,
          remainingSharedUsers: updatedChatRoom.sharedWith.length
        }
      )

      return successResponse({ success: true })
      
    } catch (error) {
      if (error instanceof Response) {
        return error
      }
      
      console.error('Error in unshare operation:', error)
      return errorResponse(
        'Unshare operation failed',
        500, 
        error instanceof Error ? error.message : 'Unknown error'
      )
    }
  } catch (error) {
    console.error('Error unsharing conversation:', error)
    return errorResponse(
      'Internal Server Error',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
} 