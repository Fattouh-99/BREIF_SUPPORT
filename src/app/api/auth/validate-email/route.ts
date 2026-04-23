import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    
    console.log('[API] validate-email: Received request to validate email', { email });
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
    
    try {
      // Check if a user with this email exists in Clerk
      const existingUsers = await clerkClient.users.getUserList({
        emailAddress: [email],
      });
      
      if (existingUsers.length > 0) {
        console.log('[API] validate-email: Email already exists');
        return NextResponse.json(
          { error: 'Email already exists', code: 'form_identifier_exists' }, 
          { status: 409 }
        );
      }
      
      console.log('[API] validate-email: Email is available');
      return NextResponse.json({ success: true });
    } catch (error: any) {
      console.error('[API] validate-email: Clerk error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to validate email' }, 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[API] validate-email: Request error:', error);
    return NextResponse.json(
      { error: 'Invalid request' }, 
      { status: 400 }
    );
  }
} 