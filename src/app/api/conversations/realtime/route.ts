import { auth } from '@clerk/nextjs/server'
import { pusherServer } from '@/lib/pusher'
import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { generateUUID, isValidUUID } from '@/lib/uuid'

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const requestData = await req.json();
    let { 
      chatRoomId, 
      message, 
      messageId, 
      role, 
      skipAuth,
      eventType,
      agentInfo,
      status 
    } = requestData;

    // Validate chat room ID is required for all requests
    if (!chatRoomId) {
      console.error('Missing chatRoomId in realtime API request');
      return new NextResponse(JSON.stringify({ error: 'Missing chatRoomId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Handle different event types
    const timestamp = new Date().toISOString();
    
    // 1. Handle agent connecting
    if (eventType === 'agent-connect') {
      await pusherServer.trigger(`${chatRoomId}-mode`, 'agent-connect', {
        agentInfo,
        timestamp,
        message: `${agentInfo?.name || 'Support Agent'} has joined the conversation`
      });
      
      // Add system message for agent connecting
      await prisma.chatMessage.create({
        data: {
          id: generateUUID(),
          message: `${agentInfo?.name || 'Support Agent'} has joined the conversation`,
          role: "assistant",
          seen: false,
          chatRoomId,
          teamMemberName: agentInfo?.name
        } as any
      });
      
      return new NextResponse(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 2. Handle agent typing status
    if (eventType === 'typing-status') {
      await pusherServer.trigger(chatRoomId, 'typing-status', {
        isTyping: status === true,
        supportAgent: agentInfo,
        timestamp
      });
      
      return new NextResponse(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 3. Handle agent pausing conversation
    if (eventType === 'pause-status') {
      await pusherServer.trigger(`${chatRoomId}-mode`, 'pause-status', {
        isPaused: status === true,
        supportAgent: agentInfo,
        timestamp,
      });
      
      // Add system message for conversation pause/resume
      const pauseMessage = status 
        ? 'The conversation has been paused. Our team will get back to you soon.'
        : 'The conversation has been resumed.';
        
      const newMessage = await prisma.chatMessage.create({
        data: {
          id: generateUUID(),
          message: pauseMessage,
          role: "assistant",
          seen: false,
          chatRoomId,
          teamMemberName: agentInfo?.name
        } as any
      });
      
      // Notify about the new message
      await pusherServer.trigger(chatRoomId, 'chat-message', {
        chat: {
          id: newMessage.id,
          message: newMessage.message,
          role: newMessage.role,
          createdAt: newMessage.createdAt,
          seen: newMessage.seen,
          teamMemberName: agentInfo?.name
        }
      });
      
      return new NextResponse(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 4. Handle agent ending conversation
    if (eventType === 'end-conversation') {
      // Update the chat room to not be in live mode
      await prisma.chatRoom.update({
        where: { id: chatRoomId },
        data: { live: false }
      });
      
      // Send mode change notification
      await pusherServer.trigger(`${chatRoomId}-mode`, 'mode-change', {
        live: false,
        supportAgent: agentInfo,
        timestamp
      });
      
      // Add system message for ending the conversation
      const endMessage = message || 'The support session has ended.';
      const newMessage = await prisma.chatMessage.create({
        data: {
          id: generateUUID(),
          message: endMessage,
          role: "assistant",
          seen: false,
          chatRoomId,
          teamMemberName: agentInfo?.name
        } as any
      });
      
      // Notify about the new message
      await pusherServer.trigger(chatRoomId, 'chat-message', {
        chat: {
          id: newMessage.id,
          message: newMessage.message,
          role: newMessage.role,
          createdAt: newMessage.createdAt,
          seen: newMessage.seen,
          teamMemberName: agentInfo?.name
        }
      });
      
      return new NextResponse(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 5. Regular chat message handling (default)
    // Validate required fields for chat messages
    if (!message) {
      console.error('Missing message in chat message request');
      return new NextResponse(JSON.stringify({ error: 'Missing message' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validate and fix messageId if needed
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!messageId || !uuidRegex.test(messageId)) {
      console.log(`Realtime API: Invalid messageId format, generating a new UUID`);
      messageId = generateUUID();
      console.log(`Realtime API: Generated new UUID: ${messageId}`);
    }

    // Verify the chat room exists and update it to make it show in the agent dashboard
    try {
      const chatRoom = await prisma.chatRoom.findUnique({
        where: { id: chatRoomId },
        include: { Customer: true }
      });

      if (!chatRoom) {
        console.error(`Realtime API: Chat room ${chatRoomId} not found`);
        return new NextResponse(JSON.stringify({ error: 'Chat room not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Make sure the updatedAt is refreshed so the conversation shows at the top
      await prisma.chatRoom.update({
        where: { id: chatRoomId },
        data: { 
          updatedAt: new Date(),
          // Ensure live flag is set if it's a message from the bot
          live: role === 'assistant' ? true : undefined
        }
      });
      
      // Also make sure there's a global notification for customer messages
      if (role === 'user' && chatRoom.Customer?.email) {
        // Send to global channel for agent awareness
        await pusherServer.trigger('chat-global', 'customer-message', {
          chatRoomId,
          messageId,
          message,
          role,
          timestamp,
          customerEmail: chatRoom.Customer.email
        });
      }
    } catch (dbError) {
      console.error('Realtime API: Database error:', dbError);
      // Continue processing - don't fail the actual message sending
    }

    // Trigger real-time update with complete message data
    await pusherServer.trigger(chatRoomId, 'chat-message', {
      chat: {
        id: messageId,
        message,
        role,
        createdAt: timestamp,
        seen: false,
        teamMemberName: agentInfo?.name
      }
    });

    return new NextResponse(JSON.stringify({ 
      success: true,
      message: {
        id: messageId,
        message,
        role,
        createdAt: timestamp,
        seen: false,
        teamMemberName: agentInfo?.name
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in real-time chat API:', error);
    return new NextResponse(JSON.stringify({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 