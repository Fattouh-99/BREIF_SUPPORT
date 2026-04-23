import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pusherServer } from '@/lib/pusher';
import { generateUUID, isValidUUID } from '@/lib/uuid';

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    let { chatRoomId, message, messageId, email } = data;
    
    if (!chatRoomId || !message) {
      return NextResponse.json({ error: 'Chat room ID and message are required' }, { status: 400 });
    }
    
    console.log(`Customer message API: Received message for chat room ${chatRoomId}`);
    
    // Validate messageId is a proper UUID
    if (!messageId || !isValidUUID(messageId)) {
      console.log(`Customer message API: Invalid messageId format, generating a new UUID`);
      
      // Generate a proper UUID
      try {
        messageId = generateUUID();
        console.log(`Customer message API: Generated new UUID: ${messageId}`);
      } catch (uuidError) {
        console.error(`Customer message API: Error generating UUID:`, uuidError);
        return NextResponse.json({ error: 'Failed to generate valid message ID' }, { status: 500 });
      }
    }
    
    // Get the chat room
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
      include: {
        Customer: true
      }
    });
    
    if (!chatRoom) {
      console.log(`Customer message API: Chat room ${chatRoomId} not found`);
      return NextResponse.json({ error: 'Chat room not found' }, { status: 404 });
    }
    
    // Store the message in the database
    try {
      const newMessage = await prisma.chatMessage.create({
        data: {
          id: messageId,
          chatRoomId,
          message,
          role: 'user',
          seen: false
        }
      });
      
      console.log(`Customer message API: Message stored with ID ${newMessage.id}`);
      
      // Update chat room lastActivity
      await prisma.chatRoom.update({
        where: { id: chatRoomId },
        data: { updatedAt: new Date() }
      });
      
      // If we have an email but the customer doesn't, update it
      if (email && (!chatRoom.Customer || !chatRoom.Customer.email)) {
        console.log(`Customer message API: Updating customer email to ${email}`);
        await prisma.customer.update({
          where: { id: chatRoom.customerId! },
          data: { email }
        });
      }
      
      // Send to real-time channel
      await pusherServer.trigger(chatRoomId, 'chat-message', {
        chat: {
          id: newMessage.id,
          message: newMessage.message,
          role: newMessage.role,
          createdAt: newMessage.createdAt,
          seen: newMessage.seen
        }
      });
      
      console.log(`Customer message API: Message pushed to real-time channel ${chatRoomId}`);
      
      // Send to global channel for agent awareness
      await pusherServer.trigger('chat-global', 'customer-message', {
        chatRoomId,
        message,
        customerEmail: chatRoom.Customer?.email || email || 'Unknown customer',
        timestamp: new Date().toISOString()
      });
      
      console.log(`Customer message API: Notification sent to global channel`);
      
      return NextResponse.json({ 
        success: true,
        message: newMessage
      });
    } catch (dbError) {
      console.error('Error in customer message API:', dbError);
      return NextResponse.json({ error: 'Database error: ' + (dbError as Error).message }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error in customer message API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 