import { client } from '@/lib/prisma'
import { pusherServer } from '@/lib/pusher'
import { NotificationType, Prisma } from '@prisma/client'
import { ApiError, successResponse } from '@/lib/api-response'

/**
 * Validates if a user has permission to perform actions on a chat room
 * 
 * @param userId - Clerk user ID of the current user
 * @param chatRoomId - ID of the chat room to validate
 * @returns Object containing the current user, chat room, and any validation errors
 */
export async function validateChatRoomAccess(userId: string, chatRoomId: string) {
  // Get current user
  const currentUser = await client.user.findUnique({
    where: { clerkId: userId },
    include: {
      team: true
    }
  })

  if (!currentUser) {
    throw ApiError.NotFound('User not found')
  }

  // Get chat room with necessary details
  const chatRoom = await client.chatRoom.findUnique({
    where: { id: chatRoomId },
    include: {
      Customer: true,
      sharedWith: true,
      sharedBy: {
        select: {
          id: true,
          fullname: true
        }
      }
    }
  })

  if (!chatRoom) {
    throw ApiError.NotFound('Chat room not found')
  }

  return { currentUser, chatRoom }
}

/**
 * Validates if two users are in the same team
 * 
 * @param currentUser - Current user object
 * @param teamMemberId - ID of the team member to check
 * @returns The team member object if valid
 */
export async function validateTeamMembership(currentUser: any, teamMemberId: string) {
  // Get team member
  const teamMember = await client.user.findUnique({
    where: { id: teamMemberId },
    select: {
      id: true,
      fullname: true,
      teamId: true
    }
  })

  if (!teamMember) {
    throw ApiError.NotFound('Team member not found')
  }

  // Verify they're in the same team
  if (teamMember.teamId !== currentUser.teamId) {
    throw ApiError.Forbidden('Cannot share with users outside your team')
  }
  
  return teamMember
}

/**
 * Creates a system message in a chat room
 * 
 * @param chatRoomId - ID of the chat room
 * @param message - Message content
 */
export async function addSystemMessage(chatRoomId: string, message: string) {
  await client.chatMessage.create({
    data: {
      chatRoomId,
      message,
      role: 'assistant',
      seen: false
    }
  })
}

/**
 * Notifies a user through Pusher
 * 
 * @param userId - ID of the user to notify
 * @param event - Event name
 * @param data - Event data
 */
export async function notifyUser(userId: string, event: string, data: any) {
  await pusherServer.trigger(`user-${userId}`, event, data)
}

/**
 * Creates a notification for a user
 * 
 * @param type - Notification type
 * @param message - Notification message
 * @param userId - ID of the user to notify
 * @param data - Additional notification data
 */
export async function createNotification(
  type: NotificationType,
  message: string,
  userId: string,
  data: any
) {
  await client.notification.create({
    data: {
      type,
      message,
      userId,
      read: false,
      data: data as Prisma.InputJsonValue
    }
  })
}

/**
 * Broadcasts a chat room event to all users
 * 
 * @param chatRoomId - ID of the chat room
 * @param event - Event name
 * @param data - Event data
 */
export async function broadcastToChatRoom(chatRoomId: string, event: string, data: any) {
  await pusherServer.trigger(`chatroom-${chatRoomId}`, event, data)
} 