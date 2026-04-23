import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

// Set a cookie that will bypass maintenance mode
export async function GET(req: NextRequest) {
  try {
    // Get the current user from Clerk
    const user = await currentUser();
    
    // If no user is logged in, return unauthorized
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is a super admin
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { role: true }
    });
    
    // Only allow super admins to bypass maintenance mode
    if (!dbUser || dbUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }
    
    // Create the response with a success message
    const response = NextResponse.json({ 
      success: true, 
      message: 'Maintenance mode bypass enabled'
    });
    
    // Set the cookie to bypass maintenance mode
    // Secure cookie that lasts for 24 hours
    response.cookies.set({
      name: 'maintenance_bypass',
      value: 'true',
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });
    
    return response;
  } catch (error) {
    console.error('Error setting maintenance bypass:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// Remove the bypass cookie
export async function DELETE(req: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Maintenance mode bypass disabled'
    });
    
    // Clear the bypass cookie
    response.cookies.set({
      name: 'maintenance_bypass',
      value: '',
      path: '/',
      maxAge: 0, // Expires immediately
    });
    
    return response;
  } catch (error) {
    console.error('Error removing maintenance bypass:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
} 