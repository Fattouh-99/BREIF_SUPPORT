import { NextRequest, NextResponse } from 'next/server';
import { getSystemSettings, updateSystemSettings, checkSystemAccess } from '@/actions/admin/system-settings';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Force Node.js runtime to avoid Edge issues
export const runtime = 'nodejs';

/**
 * System settings API endpoint
 */
export async function GET() {
  try {
    // Try to get system settings using the server action
    const settings = await checkSystemAccess();
    return NextResponse.json({ 
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching system settings:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to load system settings'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get request body
    const body = await request.json();
    
    // Get current user
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 });
    }
    
    // Check if user is a super admin
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { role: true }
    });
    
    if (!dbUser || dbUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ 
        success: false,
        error: 'Only super admins can update system settings'
      }, { status: 403 });
    }
    
    // Update settings using server action
    const updatedSettings = await updateSystemSettings({
      registrationEnabled: body.registrationEnabled,
      loginEnabled: body.loginEnabled,
      maintenanceMode: body.maintenanceMode,
      maintenanceMessage: body.maintenanceMessage,
      forceLogoutAllUsers: body.forceLogoutAllUsers
    });
    
    return NextResponse.json({ 
      success: true,
      data: updatedSettings
    });
  } catch (error) {
    console.error('Error updating system settings:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to update system settings'
    }, { status: 500 });
  }
}
