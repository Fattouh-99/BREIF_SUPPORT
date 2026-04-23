'use server'

import { client } from '@/lib/prisma'
import { pusherServer } from '@/lib/pusher'
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
// Define Role type locally
type Role = 'user' | 'assistant'
import crypto from 'crypto'
import { generateUUID, isValidUUID } from '@/lib/uuid'

// Add a type definition for ChatMessage to fix linter errors
type ChatMessage = {
  id: string;
  message: string;
  role: Role | null;
  createdAt: Date;
  seen: boolean;
  teamMemberId?: string;
  teamMemberName?: string;
};

// Helper function to safely extract team member fields
const formatChatMessage = (message: any): ChatMessage => {
  return {
    id: message.id,
    message: message.message,
    role: message.role,
    createdAt: message.createdAt,
    seen: message.seen,
    teamMemberId: message.teamMemberId,
    teamMemberName: message.teamMemberName
  };
};

export const onGetChatRoomStatus = async (chatRoomId: string) => {
  try {
    const chatRoom = await client.chatRoom.findUnique({
      where: {
        id: chatRoomId,
      },
      select: {
        live: true,
      },
    })
    return chatRoom?.live;
  } catch (error) {
    console.error('Error getting chat room status:', error);
    return false;
  }
}

// Helper function to ensure valid UUID - centralize UUID validation and generation
function ensureValidUUID(messageId?: string): string {
  if (!messageId || !isValidUUID(messageId)) {
    return generateUUID();
  }
  return messageId;
}

// Helper function to sanitize input for security
const sanitizeUserInput = (input: string | any): string => {
  // Return empty string if input is null/undefined
  if (!input) return '';
  
  // Make sure input is a string
  const inputStr = typeof input === 'string' ? input : String(input);
  
  // Basic sanitization to prevent script injection and other malicious content
  return inputStr
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim();
};

// Centralized function to send messages via Pusher
const sendPusherMessage = async (
  chatRoomId: string,
  messageData: any,
  eventType: 'chat-message' | 'customer-message' | 'mode-change' | 'agent-connect' | 'typing-status' | 'pause-status' = 'chat-message',
  channelName?: string
): Promise<boolean> => {
  try {
    if (!pusherServer) {
      console.warn(`[AGENT DEBUG] Pusher server not configured, skipping event (${eventType})`);
      return false;
    }
    
    const channel = channelName || (
      eventType === 'customer-message' ? 'chat-global' : chatRoomId
    );
    
    await pusherServer.trigger(channel, eventType, messageData);
    return true;
  } catch (error) {
    console.error(`[AGENT DEBUG] Error sending Pusher event (${eventType}):`, error);
    return false;
  }
};

// Method to directly call the API endpoint instead of using server-side code
const callRealTimeAPI = async (
  chatRoomId: string,
  message: string,
  messageId: string,
  role: 'user' | 'assistant',
  skipAuth: boolean = false,
  eventType?: string,
  agentInfo?: {
    name: string;
    role?: string;
  },
  status?: boolean
) => {
  try {
    // In a browser environment, we should use relative URLs to avoid protocol mismatches
    let apiUrl = '';
    
    // Check if we're in a browser or server environment
    if (typeof window !== 'undefined') {
      // Browser environment - use relative URL which will work with the current domain/protocol
      apiUrl = '/api/conversations/realtime';
      
      // Only proceed with fetch in browser environments
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatRoomId,
          message,
          messageId,
          role,
          skipAuth,
          eventType,
          agentInfo,
          status
        }),
      });
      
      if (!response.ok) {
        return false;
      }
      
      return true;
    } else {
      // For server-side execution, use direct Pusher events
      if (eventType) {
        // Handle special event types directly with Pusher
        switch (eventType) {
          case 'agent-connect':
            return await sendPusherMessage(
              `${chatRoomId}-mode`, 
              {
                agentInfo,
                timestamp: new Date().toISOString(),
                message: `${agentInfo?.name || 'Support Agent'} has joined the conversation`
              },
              'agent-connect'
            );
          
          case 'typing-status':
            return await sendPusherMessage(
              chatRoomId,
              {
                isTyping: status === true,
                supportAgent: agentInfo,
                timestamp: new Date().toISOString()
              },
              'typing-status'
            );
            
          case 'pause-status':
            return await sendPusherMessage(
              `${chatRoomId}-mode`,
              {
                isPaused: status === true,
                supportAgent: agentInfo,
                timestamp: new Date().toISOString()
              },
              'pause-status'
            );
            
          case 'end-conversation':
            // Send mode change notification
            await sendPusherMessage(
              `${chatRoomId}-mode`, 
              {
                live: false,
                supportAgent: agentInfo,
                timestamp: new Date().toISOString()
              },
              'mode-change'
            );
            
            // Also send a system message
            const messagePayload = {
              chat: {
                id: messageId,
                message: message || 'The support session has ended.',
                role,
                createdAt: new Date().toISOString(),
                seen: true,
                teamMemberName: agentInfo?.name
              }
            };
            
            return await sendPusherMessage(chatRoomId, messagePayload);
        }
      }
      
      // Default behavior for regular messages
      const messagePayload = {
        chat: {
          id: messageId,
          message,
          role,
          createdAt: new Date().toISOString(),
          seen: role === 'assistant' // Agent messages are seen by default
        }
      };
      
      return await sendPusherMessage(chatRoomId, messagePayload);
    }
  } catch (apiError) {
    console.error(`[AGENT DEBUG] Error in callRealTimeAPI:`, apiError);
    return false;
  }
};

// Centralized function to get user info from auth or passed user object
async function getUserInfo(userParam?: any) {
  if (userParam) return userParam;
  
  try {
    const { userId } = await auth();
    if (!userId) return null;
    
    const user = await client.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        fullname: true,
        role: true
      }
    });
    
    return user;
  } catch (error) {
    console.error('Error getting user info:', error);
    return null;
  }
}

export const notifyRealTimeMode = async (
  chatRoomId: string,
  live: boolean,
  supportAgent?: {
    name: string;
    role?: string;
  }
) => {
  try {
    // First check if the mode is already set to the requested state
    const currentState = await onGetChatRoomStatus(chatRoomId);
    
    // Skip notification if the state hasn't changed (prevents duplicate notifications on refresh)
    if (currentState === live) {
      return true;
    }
    
    // Notify clients about the mode change
    await sendPusherMessage(
      chatRoomId, 
      { live, supportAgent }, 
      'mode-change', 
      `${chatRoomId}-mode`
    );

    // Send system message about mode change
    const systemMessage = live 
      ? 'Live support mode has been enabled.'
      : "The chat has ended";
    
    // Add the message to the chat room
    const newMessage = await client.chatMessage.create({
      data: {
        id: ensureValidUUID(),
        message: systemMessage,
        role: 'assistant',
        seen: false,
        chatRoomId
      }
    });

    // Send the system message notification
    await sendPusherMessage(chatRoomId, { 
      chat: formatChatMessage(newMessage)
    });

    return true;
  } catch (error) {
    console.error('[AGENT DEBUG] Error in notifyRealTimeMode:', error);
    return false;
  }
};

export const onToggleRealtime = async (
  chatRoomId: string,
  state: boolean,
  supportAgent?: {
    name: string;
    role?: string;
  }
) => {
  try {
    // Get agent info if not provided
    if (!supportAgent && state) {
      const userInfo = await getUserInfo();
      supportAgent = {
        name: userInfo?.fullname || 'Support Agent',
        role: 'support'
      };
    }
    
    // Check current state first to avoid unnecessary updates
    const currentState = await onGetChatRoomStatus(chatRoomId);
    
    // If state hasn't changed, return early
    if (currentState === state) {
      return {
        status: 200,
        message: state ? 'Realtime mode already enabled' : 'Realtime mode already disabled',
        chatRoom: {
          id: chatRoomId,
          live: state
        },
        supportAgent
      };
    }
    
    // Update chat room live status
    const chatRoom = await client.chatRoom.update({
      where: {
        id: chatRoomId,
      },
      data: {
        live: state,
      },
      select: {
        id: true,
        live: true
      }
    });

    if (chatRoom) {
      // Notify about mode change
      await notifyRealTimeMode(chatRoomId, state, supportAgent);

      return {
        status: 200,
        message: chatRoom.live
          ? 'Realtime mode enabled'
          : 'Realtime mode disabled',
        chatRoom,
        supportAgent
      };
    }
  } catch (error) {
    console.error('[AGENT DEBUG] Error toggling realtime mode:', error);
    return null;
  }
};

export const onGetChatMessages = async (chatRoomId: string) => {
  try {
    console.log(`[DEBUG] Fetching ALL messages for chat room: ${chatRoomId}`);
    
    // First check if the chat room exists
    const chatRoom = await client.chatRoom.findUnique({
      where: {
        id: chatRoomId,
      },
      include: {
        message: {
          orderBy: {
            createdAt: 'asc',
          },
          // Only include fields that exist in the database schema
          select: {
            id: true,
            message: true,
            role: true,
            createdAt: true,
            seen: true
            // Removed fields that don't exist in the schema
          },
        },
        Customer: {
          select: {
            id: true,
            email: true
          }
        }
      },
    });

    if (!chatRoom) {
      console.error('Chat room not found:', chatRoomId);
      return [];
    }
    
    try {
      // Safe access to message property with type assertion
      const messages = chatRoom.message as any[] || [];
      console.log(`[DEBUG] Retrieved ${messages.length} messages for chat room ${chatRoomId}`);
      
      // Log first and last message for debugging
      if (messages.length > 0) {
        console.log(`[DEBUG] First message: ${messages[0].message.substring(0, 30)}...`);
        console.log(`[DEBUG] Last message: ${messages[messages.length-1].message.substring(0, 30)}...`);
      }
    } catch (logError) {
      console.error('Error logging messages:', logError);
    }
    
    return [chatRoom];
  } catch (error) {
    console.error('Error getting chat messages:', error);
    return [];
  }
}

export const onGetDomainChatRooms = async (domainId: string) => {
  try {
    // Simplified logging
    const { userId } = await auth()
    if (!userId) return { success: false, error: 'Unauthorized' }

    console.log(`[DEBUG] onGetDomainChatRooms called with domainId: ${domainId} for userId: ${userId}`);

    const user = await client.user.findUnique({
      where: { clerkId: userId },
      include: {
        team: true
      }
    })

    if (!user) return { success: false, error: 'User not found' }
    
    console.log(`[DEBUG] Found user: ${user.id}, team: ${user.teamId || 'none'}`);

    // Special case: When domainId is 'all', fetch all chat rooms
    if (domainId === 'all') {
      // Get domains the user has access to
      const accessibleDomains = await client.domain.findMany({
        where: {
          OR: [
            { userId: user.id },
            { teamId: user.teamId }
          ]
        },
        select: { id: true, name: true }
      });
      
      console.log(`[DEBUG] User has access to ${accessibleDomains.length} domains:`, 
        accessibleDomains.map((d: any) => `${d.name} (${d.id})`));
      
      const domainIds = accessibleDomains.map((d: any) => d.id);
      
      // Find all customers with chat rooms - use a more inclusive query
      try {
        // Use the original query that was working before
        const customers = await client.customer.findMany({
          where: {
            OR: [
              { domainId: { in: domainIds } },
              { chatRoom: { some: {} } }
            ]
          },
          include: {
            chatRoom: {
              orderBy: {
                createdAt: 'desc'
              },
              include: {
                message: {
                  orderBy: {
                    createdAt: 'desc'
                  },
                  take: 1
                }
              }
            }
          }
        });
        
        console.log(`[DEBUG] Found ${customers.length} customers with chat rooms`);
        for (const customer of customers) {
          console.log(`[DEBUG] Customer ${customer.id} (${customer.email || 'no email'}) has ${customer.chatRoom.length} chat rooms`);
        }
        
        // Check specifically for live chat rooms
        const liveChats = customers.filter((c: any) => 
          c.chatRoom && c.chatRoom.length > 0 && c.chatRoom[0].live
        );
        console.log(`[DEBUG] Found ${liveChats.length} customers with LIVE chat rooms`);
        
        return { success: true, customer: customers };
      } catch (innerError) {
        console.error('Error with customer query:', innerError);
        return { success: false, error: 'Error fetching chat rooms' };
      }
    }

    // For specific domain - ensure we include all conversations
    const domain = await client.domain.findUnique({
      where: { id: domainId },
      include: {
        team: true
      }
    })

    if (!domain) return { success: false, error: 'Domain not found' }

    // Check if user has access to domain
    const hasAccess = domain.userId === user.id || 
                     (domain.teamId && domain.teamId === user.teamId)

    if (!hasAccess) return { success: false, error: 'Access denied' }
    
    // Find all customers for this domain
    const customer = await client.customer.findMany({
      where: {
        domainId
      },
      include: {
        chatRoom: {
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            message: {
              orderBy: {
                createdAt: 'desc'
              },
              take: 1
            }
          }
        }
      }
    })
    
    return { success: true, customer }
  } catch (error) {
    console.error('Error getting domain chat rooms:', error)
    return { success: false, error: 'Failed to get chat rooms' }
  }
}

export const onGetSharedChatRooms = async () => {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: 'Unauthorized' }

    const user = await client.user.findUnique({
      where: { clerkId: userId },
      include: {
        team: true
      }
    })

    if (!user) return { success: false, error: 'User not found' }
    if (!user.teamId) return { success: true, customer: [] }

    // Get all chat rooms shared with the current user
    const sharedRooms = await client.chatRoom.findMany({
      where: {
        shared: true,
        OR: [
          {
            sharedWith: {
              some: {
                id: user.id
              }
            }
          },
          {
            sharedById: user.id
          }
        ]
      },
      include: {
        Customer: true,
        message: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        },
        sharedBy: {
          select: {
            id: true,
            fullname: true,
            email: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    console.log('Found shared rooms:', sharedRooms) // Debug log

    // Transform the data to match the expected format
    const customer = sharedRooms.map((room: any) => ({
      id: room.customerId || 'shared',
      email: room.Customer?.email || `Shared by ${room.sharedBy?.fullname || 'Unknown'}`,
      chatRoom: [{
        id: room.id,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
        live: room.live,
        mailed: room.mailed,
        shared: room.shared,
        message: room.message
      }]
    }))

    console.log('Transformed customer data:', customer) // Debug log

    return { success: true, customer }
  } catch (error) {
    console.error('Error getting shared chat rooms:', error)
    return { success: false, error: 'Failed to get shared chat rooms' }
  }
}

export const onViewUnReadMessages = async (chatRoomId: string) => {
  try {
    await client.chatMessage.updateMany({
      where: {
        chatRoomId,
        seen: false,
      },
      data: {
        seen: true,
      },
    });
    return true;
  } catch (error) {
    console.error('Error marking messages as seen:', error);
    return false;
  }
}

// Enhanced real-time chat function with improved security and error handling
export const onRealTimeChat = async (
  chatRoomId: string,
  message: string,
  messageId: string,
  role: 'user' | 'assistant',
  user?: any // Make user parameter optional
) => {
  try {
    console.log(`[REALTIME] Starting with chatRoomId: ${chatRoomId}, messageId: ${messageId}, role: ${role}`);
    
    // Validate and normalize inputs
    messageId = ensureValidUUID(messageId);
    const sanitizedMessage = sanitizeUserInput(message);
    
    // Ensure role is always a valid enum value
    // This prevents UUIDs or other invalid values from being used as role
    if (typeof role !== 'string' || (role !== 'user' && role !== 'assistant')) {
      console.error(`Invalid role provided: ${role}, defaulting to 'assistant'`);
      role = 'assistant';
    }
    
    // Check if chat room exists
    const chatRoom = await client.chatRoom.findUnique({
      where: {
        id: chatRoomId,
      },
      select: {
        id: true,
        live: true,
        Customer: {
          select: {
            id: true,
            email: true,
          }
        }
      },
    });
    
    if (!chatRoom) {
      console.error(`[REALTIME] Chat room not found: ${chatRoomId}`);
      return null;
    }

    // Only allow real-time messages if room is in live mode (security measure)
    if (!chatRoom.live && role === 'user') {
      console.error(`[REALTIME] User message rejected: Chat room ${chatRoomId} is not in live mode`);
      return null;
    }

    // Get message if it already exists (idempotent operation for retries)
    const existingMessage = await client.chatMessage.findUnique({
      where: { id: messageId }
    });
    
    // If message already exists, just resend it
    if (existingMessage) {
      console.log(`[REALTIME] Message ${messageId} already exists, resending`);
      
      let success = false;
      
      // Try calling the API directly 
      try {
        const apiSuccess = await callRealTimeAPI(
          chatRoomId,
          existingMessage.message,
          existingMessage.id,
          existingMessage.role as 'user' | 'assistant',
          true
        );
        success = apiSuccess;
      } catch (apiError) {
        console.error(`[REALTIME] API call failed:`, apiError);
        success = false;
      }
      
      // Fall back to direct Pusher if API call fails
      if (!success) {
        try {
          await sendPusherMessage(chatRoomId, {
            chat: formatChatMessage(existingMessage)
          });
          console.log(`[REALTIME] Used Pusher fallback for message ${messageId}`);
          success = true;
        } catch (pusherError) {
          console.error(`[REALTIME] Pusher fallback failed:`, pusherError);
        }
      }
      
      return formatChatMessage(existingMessage);
    }

    // Create new message with auth info if available
    let teamMemberId: string | undefined;
    let teamMemberName: string | undefined;
    
    if (role === 'assistant') {
      // Get user/agent info
      const userInfo = await getUserInfo(user);
      teamMemberId = userInfo?.id;
      teamMemberName = userInfo?.fullname;
    }

    console.log(`Creating new chat message with role: ${role}, id: ${messageId}`);

    // Create new message
    const newMessage = await client.chatMessage.create({
      data: {
        id: messageId,
        message: sanitizedMessage,
        role: role, // Use the validated role
        seen: role === 'assistant', // Agent messages are seen by default, user messages are always unseen
        ...(teamMemberId && { teamMemberId }),
        ...(teamMemberName && { teamMemberName }),
        ChatRoom: {
          connect: { id: chatRoomId }
        }
      },
    });

    if (!newMessage) {
      console.error(`[REALTIME] Failed to create message ${messageId}`);
      return null;
    }
    
    // Format message before sending
    const formattedMessage = formatChatMessage(newMessage);
    
    let success = false;
    
    // Try using API call first
    if (typeof window !== 'undefined') {
      try {
        const apiSuccess = await callRealTimeAPI(
          chatRoomId, 
          sanitizedMessage, 
          messageId, 
          role, 
          true
        );
        success = apiSuccess;
        console.log(`[REALTIME] API broadcast ${success ? 'succeeded' : 'failed'}`);
      } catch (apiError) {
        console.error(`[REALTIME] API broadcast failed:`, apiError);
      }
    }
    
    // If API call failed or we're on the server, use Pusher directly
    if (!success) {
      try {
        await sendPusherMessage(chatRoomId, { chat: formattedMessage });
        console.log(`[REALTIME] Pusher broadcast succeeded for ${messageId}`);
        success = true;
        
        // If this is a customer message, also notify agent dashboard
        if (role === 'user') {
          await sendPusherMessage(
            chatRoomId,
            {
              chatRoomId,
              messageId: newMessage.id,
              message: newMessage.message,
              role: newMessage.role,
              timestamp: new Date().toISOString(),
              customerEmail: chatRoom.Customer?.email || 'unknown'
            },
            'customer-message'
          );
        }
      } catch (pusherError) {
        console.error(`[REALTIME] Pusher broadcast failed:`, pusherError);
      }
    }

    return formattedMessage;
  } catch (error) {
    console.error('[REALTIME] Error in real-time chat:', error);
    return null;
  }
};

// Function for owner/agent to send messages - simplified to use onRealTimeChat
export const onOwnerSendMessage = async (
  chatRoomId: string,
  message: string,
  role: 'user' | 'assistant' = 'assistant'
) => {
  try {
    // Sanitize and generate UUID
    const sanitizedMessage = sanitizeUserInput(message);
    const messageId = generateUUID();
    
    // Get current user info
    const user = await getUserInfo();
    
    // Use the unified message sending function
    const result = await onRealTimeChat(
      chatRoomId,
      sanitizedMessage,
      messageId,
      role,
      user
    );
    
    // Format result as expected by caller
    if (!result) {
      return null;
    }
    
    return {
      message: [result]
    };
  } catch (error) {
    console.error('[AGENT DEBUG] Error in owner send message:', error);
    return null;
  }
};

export const onDeleteChat = async (chatRoomId: string) => {
  try {
    // Check if chat room is in realtime mode
    const chatRoom = await client.chatRoom.findUnique({
      where: {
        id: chatRoomId,
      },
      select: {
        live: true,
      },
    });

    // If chat room is in realtime mode, prevent deletion
    if (chatRoom?.live) {
      return {
        success: false,
        error: 'Cannot delete chat while in realtime mode. Please end the live support session first.'
      };
    }

    // First delete any associated transfer requests
    await client.transferRequest.deleteMany({
      where: {
        chatRoomId,
      },
    });

    // Then delete all messages
    await client.chatMessage.deleteMany({
      where: {
        chatRoomId,
      },
    });

    // Finally delete the chat room
    await client.chatRoom.delete({
      where: {
        id: chatRoomId,
      },
    });

    return {
      success: true
    };
  } catch (error) {
    console.error('Error deleting chat:', error);
    return {
      success: false,
      error: 'Failed to delete chat'
    };
  }
}

export const notifyTypingStatus = async (
  chatRoomId: string,
  isTyping: boolean,
  agent?: {
    name: string;
    role?: string;
  }
) => {
  try {
    if (!pusherServer) {
      console.warn('Pusher server not configured, skipping typing status notification');
      return false;
    }
    
    // Send typing status to the specific chat room
    await pusherServer.trigger(chatRoomId, 'typing-status', {
      isTyping,
      agent,
      timestamp: new Date()
    });
    
    return true;
  } catch (error) {
    console.error('Error notifying typing status:', error);
    return false;
  }
};

export const onPauseConversation = async (
  chatRoomId: string,
  isPaused: boolean,
  supportAgent?: {
    name: string;
    role?: string;
  }
) => {
  try {
    // Create the system message
    const systemMessage = await client.chatMessage.create({
      data: {
        message: isPaused 
          ? 'The conversation has been paused. Our team will get back to you soon.'
          : 'The conversation has been resumed.',
        role: 'assistant',
        seen: false,
        chatRoomId,
      },
    });

    if (pusherServer) {
      // Notify about pause status change
      await pusherServer.trigger(`${chatRoomId}-mode`, 'pause-status', {
        isPaused,
        supportAgent,
        timestamp: new Date(),
        messageId: systemMessage.id // Include message ID for correlation
      });

      // Send the system message in real-time
      await pusherServer.trigger(chatRoomId, 'realtime-mode', {
        chat: {
          id: systemMessage.id,
          message: systemMessage.message,
          role: systemMessage.role,
          createdAt: systemMessage.createdAt,
          seen: systemMessage.seen,
        },
      });
    } else {
      console.warn('Pusher server not configured, skipping pause status notification');
    }

    return {
      status: 200,
      message: isPaused ? 'Conversation paused' : 'Conversation resumed',
    };
  } catch (error) {
    console.error('Error toggling pause status:', error);
    return {
      status: 500,
      error: 'Failed to toggle pause status'
    };
  }
};

export const onGetDomainLiveChatsCount = async (domainId: string) => {
  try {
    const result = await client.customer.findMany({
      where: {
        domainId,
        chatRoom: {
          some: {
            live: true
          }
        }
      },
      select: {
        chatRoom: {
          where: {
            live: true
          }
        }
      }
    });

    return result.reduce((count: number, customer) => count + customer.chatRoom.length, 0);
  } catch (error) {
    console.error('Error getting live chats count:', error);
    return 0;
  }
};

// Helper functions for agent status updates
export const sendAgentConnected = async (chatRoomId: string) => {
  try {
    // Get current user info
    const userInfo = await getUserInfo();
    
    // Prepare the agent info
    const agentInfo = {
      name: userInfo?.fullname || 'Support Agent',
      role: 'support'
    };
    
    // Call the realtime API to notify of agent connecting
    return await callRealTimeAPI(
      chatRoomId,
      '', // No message needed - will be generated on the server
      generateUUID(),
      'assistant',
      false, // Don't skip auth
      'agent-connect',
      agentInfo
    );
  } catch (error) {
    console.error('[AGENT DEBUG] Error sending agent connected status:', error);
    return false;
  }
};

export const sendTypingStatus = async (chatRoomId: string, isTyping: boolean) => {
  try {
    // Get current user info
    const userInfo = await getUserInfo();
    
    // Prepare the agent info
    const agentInfo = {
      name: userInfo?.fullname || 'Support Agent',
      role: 'support'
    };
    
    // Call the realtime API to update typing status
    return await callRealTimeAPI(
      chatRoomId,
      '', // No message needed
      generateUUID(),
      'assistant',
      false, // Don't skip auth
      'typing-status',
      agentInfo,
      isTyping
    );
  } catch (error) {
    console.error('[AGENT DEBUG] Error sending typing status:', error);
    return false;
  }
};

export const sendPauseStatus = async (chatRoomId: string, isPaused: boolean) => {
  try {
    // Get current user info
    const userInfo = await getUserInfo();
    
    // Prepare the agent info
    const agentInfo = {
      name: userInfo?.fullname || 'Support Agent',
      role: 'support'
    };
    
    // Call the realtime API to update pause status
    return await callRealTimeAPI(
      chatRoomId,
      '', // No message needed - will be generated on the server
      generateUUID(),
      'assistant',
      false, // Don't skip auth
      'pause-status',
      agentInfo,
      isPaused
    );
  } catch (error) {
    console.error('[AGENT DEBUG] Error sending pause status:', error);
    return false;
  }
};

export const endConversation = async (chatRoomId: string, endMessage?: string) => {
  try {
    // Get current user info
    const userInfo = await getUserInfo();
    
    // Prepare the agent info
    const agentInfo = {
      name: userInfo?.fullname || 'Support Agent',
      role: 'support'
    };
    
    // Call the realtime API to end the conversation
    return await callRealTimeAPI(
      chatRoomId,
      endMessage || 'The support session has ended.',
      generateUUID(),
      'assistant',
      false, // Don't skip auth
      'end-conversation',
      agentInfo
    );
  } catch (error) {
    console.error('[AGENT DEBUG] Error ending conversation:', error);
    return false;
  }
};
