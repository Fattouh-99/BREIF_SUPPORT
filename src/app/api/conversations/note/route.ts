import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { NextRequest } from 'next/server'
import { validateChatRoomAccess, addSystemMessage } from '@/lib/conversation-sharing'
import { validateBody } from '@/lib/validation'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, ApiError } from '@/lib/api-response'
import { pusherServer } from '@/lib/pusher'

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

// Validate request body schema
const NoteSchema = z.object({
  chatRoomId: z.string().uuid(),
  note: z.string().min(1).max(2000),
  type: z.enum(['transfer', 'internal']).default('internal')
})

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return ApiError.Unauthorized()
    }

    // Validate request body
    const { chatRoomId, note, type } = await validateBody(req, NoteSchema)

    try {
      // Validate chat room access
      const { currentUser, chatRoom } = await validateChatRoomAccess(userId, chatRoomId)
      
      // Create a special message for the note - we'll prefix the message to indicate it's a note
      const notePrefix = type === 'transfer' 
        ? `[Internal Note from ${currentUser.fullname}]: `
        : `[Internal Note from ${currentUser.fullname}]: `;
        
      const noteMessage = await prisma.chatMessage.create({
        data: {
          chatRoomId,
          message: notePrefix + note,
          role: 'assistant',
          seen: false
        }
      })

      // Format message for pusher broadcast
      const formattedMessage = {
        id: noteMessage.id,
        message: noteMessage.message,
        role: noteMessage.role,
        createdAt: noteMessage.createdAt.toISOString(),
        seen: noteMessage.seen,
        // Add these properties for frontend compatibility
        teamMemberId: currentUser.id,
        teamMemberName: currentUser.fullname,
        isNote: true,
        noteType: type
      }

      // Notify all users in the chat
      await pusherServer.trigger(chatRoomId, 'chat-message', {
        chat: formattedMessage
      })
      
      // If this is a transfer note, add a system message
      if (type === 'transfer') {
        await addSystemMessage(
          chatRoomId,
          `${currentUser.fullname} left a transfer note for the next agent handling this conversation`
        )
      }

      return successResponse({ 
        success: true,
        note: formattedMessage 
      })
      
    } catch (error) {
      if (error instanceof Response) {
        return error
      }
      
      console.error('Error adding note:', error)
      return errorResponse(
        'Failed to add note',
        500, 
        error instanceof Error ? error.message : 'Unknown error'
      )
    }
  } catch (error) {
    console.error('Error in note API:', error)
    return errorResponse(
      'Internal Server Error',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
} 