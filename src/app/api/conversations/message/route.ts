import { NextRequest, NextResponse } from 'next/server';
import { onOwnerSendMessage, onRealTimeChat } from '@/actions/conversation';
import { protectConversationRoute, validateAndSanitizeBody, applySecurityHeaders } from '@/middleware/conversation-security';

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

// Validate message content
function validateMessageContent(content: string): boolean {
  // Check for empty message
  if (!content || content.trim() === '') {
    return false;
  }
  
  // Check for messages that are too long (e.g., > 4000 characters)
  if (content.length > 4000) {
    return false;
  }
  
  return true;
}

async function handler(req: NextRequest, authInfo: { userId: string | null }): Promise<NextResponse> {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    // Get and validate request body
    const body = await req.json();
    const validation = validateAndSanitizeBody(body);
    
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    
    const { chatRoomId, message, role = 'assistant' } = validation.sanitized;
    
    // Validate required fields
    if (!chatRoomId || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Validate message content
    if (!validateMessageContent(message)) {
      return NextResponse.json({ error: 'Invalid message content' }, { status: 400 });
    }
    
    // Send the message
    const result = await onOwnerSendMessage(chatRoomId, message, role);
    
    if (!result) {
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
    
    // Broadcast the message in real-time
    await onRealTimeChat(
      chatRoomId,
      result.message[0].message,
      result.message[0].id,
      role
    );
    
    // Return success response
    const response = NextResponse.json({ 
      success: true,
      messageId: result.message[0].id,
      timestamp: result.message[0].createdAt
    }, { status: 200 });
    
    // Apply security headers
    return applySecurityHeaders(response);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Export the route handler with security middleware
export async function POST(req: NextRequest): Promise<NextResponse> {
  return protectConversationRoute(req, handler);
} 