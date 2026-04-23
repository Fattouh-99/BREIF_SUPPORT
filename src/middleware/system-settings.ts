import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs';

// Paths that should always be accessible regardless of system settings
const ALWAYS_ACCESSIBLE_PATHS = [
  '/auth/login-disabled',
  '/auth/registration-disabled',
  '/maintenance',
  '/api/system-settings', // The API endpoint itself must always be accessible
  '/admin', // Admin section should always be accessible (admins can override restrictions)
  '/api/maintenance-bypass', // Endpoint to set bypass cookie
  '/auth/sign-in', // Allow access to sign-in page for admins to log in
  // Chatbot related paths - always accessible even during maintenance
  '/chatbot',
  '/api/conversations/customer-message',
  '/api/conversations/realtime',
  '/api/conversations/status',
  '/api/notify/real-time',
  '/api/conversations',
];

// Name of the cookie used to bypass maintenance mode
const MAINTENANCE_BYPASS_COOKIE = 'maintenance_bypass';

// Check if a path should bypass the system settings checks
const shouldBypassCheck = (path: string): boolean => {
  // Always allow chatbot-related paths, static assets, and API endpoints needed for chatbot functionality
  if (path.startsWith('/chatbot') || 
      path.startsWith('/chatbot-test') || 
      path.includes('/api/conversations/') ||
      path.includes('/api/notify/') ||
      path.includes('/api/inquiries/test')) {
    return true;
  }
  
  return ALWAYS_ACCESSIBLE_PATHS.some((allowedPath) => path.startsWith(allowedPath));
};

export async function checkSystemAccess(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // Allow access to static files and specific paths without checking
  if (
    path.startsWith('/_next') ||
    path.startsWith('/static') ||
    path.startsWith('/favicon') ||
    path.startsWith('/icons') ||
    path.startsWith('/images') ||
    shouldBypassCheck(path)
  ) {
    return NextResponse.next();
  }

  try {
    // Get the system settings
    const settings = await prisma.systemSettings.findFirst();
    
    // If no settings exist, allow access by default
    if (!settings) {
      return NextResponse.next();
    }

    // Check if user has the maintenance bypass cookie
    const bypassCookie = req.cookies.get(MAINTENANCE_BYPASS_COOKIE);
    const hasBypassAccess = bypassCookie?.value === 'true';
    
    // Get auth status to check if user is a super admin
    const { userId } = auth();
    
    // Check if user is a super admin if they're authenticated
    let isSuperAdmin = false;
    if (userId) {
      const user = await prisma.user.findFirst({
        where: { clerkId: userId, role: 'SUPER_ADMIN' }
      });
      isSuperAdmin = !!user;
    }
    
    // Handle maintenance mode - skip redirect if user is super admin or has bypass cookie
    if (settings.maintenanceMode && !path.startsWith('/admin') && !hasBypassAccess && !isSuperAdmin) {
      // Only redirect if not already on the maintenance page
      if (path !== '/maintenance') {
        const url = new URL('/maintenance', req.url);
        return NextResponse.redirect(url);
      }
    }

    // Handle login restrictions
    if (!settings.loginEnabled && path.startsWith('/auth/sign-in') && !isSuperAdmin) {
      const url = new URL('/auth/login-disabled', req.url);
      return NextResponse.redirect(url);
    }

    // Handle registration restrictions
    if (!settings.registrationEnabled && path.startsWith('/auth/sign-up') && !isSuperAdmin) {
      const url = new URL('/auth/registration-disabled', req.url);
      return NextResponse.redirect(url);
    }

    // Allow all other requests
    return NextResponse.next();
  } catch (error) {
    console.error('Error checking system access:', error);
    // On error, allow access by default to prevent locking users out
    return NextResponse.next();
  }
} 