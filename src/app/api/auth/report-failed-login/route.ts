import { NextRequest, NextResponse } from 'next/server';

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

// In-memory store for rate limiting (would use Redis in production)
const failedAttempts = new Map<string, {
  count: number,
  timestamp: number,
  blocked: boolean,
  blockExpiry?: number
}>();

// Constants
const BLOCK_THRESHOLD = 10; // Block IP after 10 failed attempts
const BLOCK_DURATION = 60 * 60 * 1000; // 1 hour blocking period
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minute window for counting
const CLEANUP_INTERVAL = 30 * 60 * 1000; // Clean up entries every 30 minutes

// Clean up old entries
setInterval(() => {
  const now = Date.now();
  
  failedAttempts.forEach((data, ip) => {
    // Remove entries that are older than the rate limit window
    if (now - data.timestamp > RATE_LIMIT_WINDOW && !data.blocked) {
      failedAttempts.delete(ip);
    }
    
    // Remove blocks that have expired
    if (data.blocked && data.blockExpiry && now > data.blockExpiry) {
      failedAttempts.set(ip, {
        count: 0,
        timestamp: now,
        blocked: false
      });
    }
  });
}, CLEANUP_INTERVAL);

export async function POST(req: NextRequest) {
  try {
    // Get client IP
    let ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
    
    // If comma-separated list (common with proxies), get first one
    if (ip.includes(',')) {
      ip = ip.split(',')[0].trim();
    }
    
    // Get request data
    const data = await req.json();
    const attempts = data.attempts || 1;
    
    const now = Date.now();
    
    // Get current data for this IP
    const currentData = failedAttempts.get(ip) || {
      count: 0,
      timestamp: now,
      blocked: false
    };
    
    // If already blocked, return immediately
    if (currentData.blocked) {
      return NextResponse.json({
        success: false,
        message: 'IP address is blocked due to multiple failed attempts',
        blocked: true,
        remainingTime: currentData.blockExpiry 
          ? Math.ceil((currentData.blockExpiry - now) / 1000) 
          : undefined
      }, { status: 403 });
    }
    
    // Update attempts count
    const newCount = currentData.count + attempts;
    
    // Check if we need to block this IP
    let blocked = false;
    let blockExpiry = undefined;
    
    if (newCount >= BLOCK_THRESHOLD) {
      blocked = true;
      blockExpiry = now + BLOCK_DURATION;
    }
    
    // Update the record
    failedAttempts.set(ip, {
      count: newCount,
      timestamp: now,
      blocked,
      blockExpiry
    });
    
    // Log for security monitoring (would go to security monitoring system in production)
    console.log(`[Security] ${blocked ? 'BLOCKED' : 'WARNING'}: IP ${ip} has ${newCount} failed login attempts`);
    
    // Return status
    return NextResponse.json({
      success: true,
      attempts: newCount,
      blocked,
      blockExpiry
    });
  } catch (error) {
    console.error('Error processing failed login report:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Check if Admin (would validate properly in production)
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({
      success: false,
      message: 'Unauthorized'
    }, { status: 401 });
  }
  
  // Extract stats for monitoring
  const stats = {
    totalTrackedIPs: failedAttempts.size,
    blockedIPs: 0,
    recentFailures: 0
  };
  
  const now = Date.now();
  failedAttempts.forEach(data => {
    if (data.blocked) stats.blockedIPs++;
    if (now - data.timestamp < 15 * 60 * 1000) stats.recentFailures++; // Last 15 minutes
  });
  
  return NextResponse.json({
    success: true,
    stats
  });
} 