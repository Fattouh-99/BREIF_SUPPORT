import { prisma } from '@/lib/prisma'
import { pusherServer } from '@/lib/pusher'
import { ApiError, successResponse } from '@/lib/api-response'

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    // Extract data from the request
    const { chatRoomId, customerEmail, message, domainId, sessionId } = await req.json()
    
    console.log('[API DEBUG] 🚨 Received real-time notification request:', {
      chatRoomId,
      customerEmail,
      message: message.substring(0, 30) + '...',
      domainId,
      sessionId: sessionId ? 'present' : 'missing'
    })
    
    if (!chatRoomId || !customerEmail || !message) {
      console.error('[API ERROR] Missing required fields in real-time notification')
      return ApiError.BadRequest('Missing required fields')
    }
    
    // Verify the chat room exists first
    const existingChatRoom = await prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
      include: {
        Customer: true
      }
    })
    
    if (!existingChatRoom) {
      console.error(`[API ERROR] Chat room not found: ${chatRoomId}`)
      return ApiError.NotFound('Chat room not found')
    }
    
    // Ensure the customer email matches the one associated with the chat room
    if (existingChatRoom.Customer?.email && existingChatRoom.Customer?.email !== customerEmail) {
      console.error(`[API ERROR] Email mismatch: Chat room belongs to ${existingChatRoom.Customer?.email} but request is for ${customerEmail}`)
      
      // Store the session ID with the email to help track incorrect sessions
      await prisma.chatMessage.create({
        data: {
          message: `⚠️ Session verification failed. Chat requested for ${customerEmail} but room belongs to ${existingChatRoom.Customer?.email}. SessionID: ${sessionId || 'unknown'}`,
          role: 'assistant',
          seen: true,
          chatRoomId
        }
      })
      
      return ApiError.BadRequest('Email mismatch with chat room')
    }
    
    console.log(`[API DEBUG] Found chat room: ${chatRoomId}, current live status: ${existingChatRoom.live}`)
    
    // Store the session ID with the chat room metadata for future reference
    const metadata = existingChatRoom.metadata ? 
      (typeof existingChatRoom.metadata === 'string' ? 
        JSON.parse(existingChatRoom.metadata as string) : existingChatRoom.metadata) : {};
      
    const updatedMetadata = {
      ...metadata,
      sessionId: sessionId || 'unknown',
      lastVerified: new Date().toISOString(),
      customerEmail
    }
    
    // Update the chat room to set it as live
    const updatedChatRoom = await prisma.chatRoom.update({
      where: { id: chatRoomId },
      data: { 
        live: true,
        updatedAt: new Date(), // Update timestamp to bring to top of list
        metadata: updatedMetadata
      }
    })
    
    console.log(`[API DEBUG] ✅ Updated chat room live status: ${updatedChatRoom.live} with session tracking`)
    
    // Add a system message about live support being enabled
    const systemMessage = await prisma.chatMessage.create({
      data: {
        message: 'Live support mode has been enabled.',
        role: 'assistant',
        seen: false,
        chatRoomId
      }
    })
    
    console.log(`[API DEBUG] ✅ Added system message: ${systemMessage.id}`)
    
    // Trigger multiple redundant notifications to ensure delivery
    
    // 1. Trigger real-time notification via Pusher global channel
    await pusherServer.trigger('chat-global', 'new-conversation', {
      chatRoomId,
      customerEmail,
      message,
      domainId,
      sessionId, // Include session ID in the notification
      timestamp: new Date().toISOString()
    })
    
    console.log('[API DEBUG] ✅ Sent notification to chat-global channel')
    
    // 2. Attempt to trigger a user-specific channel notification if possible
    try {
      // Find the domain to get basic info
      const domain = await prisma.domain.findUnique({
        where: { id: domainId }
      });
      
      if (domain) {
        // Trigger a notification on a general channel
        await pusherServer.trigger(`domain-${domain.id}`, 'notification', {
          type: 'LIVE_SUPPORT',
          message: `Live support requested by ${customerEmail}`,
          timestamp: new Date().toISOString(),
          sessionId
        });
        console.log(`[API DEBUG] ✅ Sent notification to domain channel: domain-${domain.id}`);
      }
    } catch (userNotifyError) {
      console.error('[API ERROR] Error sending domain notifications:', userNotifyError);
      // Continue even if domain notifications fail
    }
    
    // 3. Also notify the specific chat room about the mode change
    await pusherServer.trigger(`${chatRoomId}-mode`, 'mode-change', {
      live: true,
      supportAgent: {
        name: 'Support Agent',
        role: 'support'
      },
      sessionId // Include session ID
    })
    
    console.log(`[API DEBUG] ✅ Sent mode-change notification to ${chatRoomId}-mode channel`)
    
    // Return success response
    return successResponse({
      success: true,
      message: 'Real-time notification sent successfully',
      sessionId // Return session ID for confirmation
    })
  } catch (error) {
    console.error('[API ERROR] Error sending real-time notification:', error)
    return ApiError.InternalError('Failed to send real-time notification')
  }
} 