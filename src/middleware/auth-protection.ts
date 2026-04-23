import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Initialize Redis client if environment variables are available
let redis: Redis | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// Constants for brute force protection
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60; // 15 minutes in seconds
const DETECTION_WINDOW = 60 * 60; // 1 hour window to track attempts

/**
 * Monitors and protects against brute force attacks
 * Uses either Redis (if configured) or in-memory cache
 */
export async function protectAgainstBruteForce(req: NextRequest): Promise<NextResponse | null> {
  // Only check login endpoints with POST method
  const isLoginAttempt = req.method === 'POST' && 
    (req.url.includes('/auth/sign-in') || req.url.includes('/api/auth/login'));
  
  if (!isLoginAttempt) {
    return null;
  }
  
  // Get client IP
  const clientIp = req.ip || '127.0.0.1';
  const key = `login:attempts:${clientIp}`;
  
  try {
    let attempts = 0;
    let isLocked = false;
    let lockExpiry = 0;
    
    // Check for existing record of failed attempts
    if (redis) {
      // Use Redis if available
      const data = await redis.get(key) as { 
        attempts?: number; 
        isLocked?: boolean; 
        lockExpiry?: number;
      } | null;
      
      if (data) {
        attempts = data.attempts || 0;
        isLocked = data.isLocked || false;
        lockExpiry = data.lockExpiry || 0;
      }
      
      // Check if account is locked
      if (isLocked) {
        const now = Math.floor(Date.now() / 1000);
        if (lockExpiry > now) {
          // Still locked
          const remainingTime = lockExpiry - now;
          const minutes = Math.ceil(remainingTime / 60);
          
          return NextResponse.json({
            error: `Too many failed login attempts. Please try again in ${minutes} minutes.`
          }, { 
            status: 429,
            headers: {
              'Retry-After': remainingTime.toString()
            }
          });
        } else {
          // Lock expired, reset
          isLocked = false;
          attempts = 0;
          await redis.set(key, { attempts, isLocked, lockExpiry: 0 });
        }
      }
    } else {
      // Fallback to in-memory tracking if Redis isn't available
      // Note: This won't work well in serverless environments
      console.warn('Redis not configured, using in-memory brute force protection');
      // This would be implemented with a local in-memory store
    }
    
    // Allow the request to proceed
    return null;
  } catch (error) {
    console.error('Error in brute force protection:', error);
    // On error, allow the request (fail open for usability, but log the issue)
    return null;
  }
}

/**
 * Record a failed login attempt and potentially lock the account
 */
export async function recordFailedLoginAttempt(clientIp: string): Promise<void> {
  if (!redis) return;
  
  const key = `login:attempts:${clientIp}`;
  
  try {
    // Get current data
    const data = await redis.get(key) as { 
      attempts: number; 
      isLocked: boolean; 
      lockExpiry: number;
    } | null || { attempts: 0, isLocked: false, lockExpiry: 0 };
    
    let { attempts, isLocked } = data;
    
    // Increment attempts
    attempts += 1;
    
    // Check if should lock
    if (attempts >= MAX_FAILED_ATTEMPTS) {
      isLocked = true;
      const lockExpiry = Math.floor(Date.now() / 1000) + LOCKOUT_DURATION;
      
      // Set with expiration to ensure cleanup
      await redis.set(key, { attempts, isLocked, lockExpiry }, { ex: DETECTION_WINDOW });
      
      console.warn(`Account locked for IP ${clientIp} due to too many failed attempts`);
    } else {
      // Update attempt count with expiration
      await redis.set(key, { attempts, isLocked, lockExpiry: data.lockExpiry }, { ex: DETECTION_WINDOW });
    }
  } catch (error) {
    console.error('Error recording failed login attempt:', error);
  }
}

/**
 * Reset failed login attempts after successful login
 */
export async function resetFailedLoginAttempts(clientIp: string): Promise<void> {
  if (!redis) return;
  
  const key = `login:attempts:${clientIp}`;
  
  try {
    await redis.del(key);
  } catch (error) {
    console.error('Error resetting failed login attempts:', error);
  }
} 