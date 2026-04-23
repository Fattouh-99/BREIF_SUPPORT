'use client';

/**
 * Auth Security Utilities
 * Centralizes security features like rate limiting and session management
 */

// Constants
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds
export const IP_BASED_THROTTLING = true; // Flag for IP-based throttling

/**
 * Creates a secure storage wrapper with domain-specific prefixes
 */
export function createSecureStorage() {
  if (typeof window === 'undefined') {
    // Server-side fallback
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
  
  // Use domain-specific prefixing for better security
  const securePrefix = `auth_${window.location.hostname.replace(/\./g, '_')}_`;
  
  return {
    getItem: (key: string) => {
      try {
        return sessionStorage.getItem(`${securePrefix}${key}`);
      } catch (e) {
        console.error('Error accessing secure storage:', e);
        return null;
      }
    },
    setItem: (key: string, value: string) => {
      try {
        sessionStorage.setItem(`${securePrefix}${key}`, value);
      } catch (e) {
        console.error('Error setting secure storage:', e);
      }
    },
    removeItem: (key: string) => {
      try {
        sessionStorage.removeItem(`${securePrefix}${key}`);
      } catch (e) {
        console.error('Error removing from secure storage:', e);
      }
    }
  };
}

/**
 * Calculates a progressive throttling delay based on failed attempts
 */
export function calculateThrottleDelay(attempts: number): number {
  // Exponential backoff: 2^(attempts-1) seconds, capped at 30 seconds
  return Math.min(1000 * Math.pow(2, attempts - 1), 30000);
}

/**
 * Reports a failed login attempt to the server for IP-based throttling
 */
export async function reportFailedLogin(attempts: number) {
  if (!IP_BASED_THROTTLING) return;
  
  try {
    const csrfToken = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
    
    await fetch('/api/auth/report-failed-login', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(csrfToken && { 'X-CSRF-Token': csrfToken.content })
      },
      body: JSON.stringify({ attempts })
    });
  } catch (error) {
    console.error('Error reporting failed login:', error);
  }
}

/**
 * Checks if the user is currently locked out
 */
export function checkLockoutStatus(secureStorage: ReturnType<typeof createSecureStorage>) {
  const storedLockout = secureStorage.getItem('signin_lockout');
  
  if (storedLockout) {
    const lockoutEnd = parseInt(storedLockout);
    if (lockoutEnd > Date.now()) {
      // Still locked out
      return {
        isLocked: true,
        remainingSeconds: Math.ceil((lockoutEnd - Date.now()) / 1000),
        remainingMinutes: Math.ceil((lockoutEnd - Date.now()) / (60 * 1000))
      };
    } else {
      // Lockout expired
      secureStorage.removeItem('signin_lockout');
      secureStorage.removeItem('signin_attempts');
      secureStorage.removeItem('signin_throttle');
      return { isLocked: false, remainingSeconds: 0, remainingMinutes: 0 };
    }
  }
  
  return { isLocked: false, remainingSeconds: 0, remainingMinutes: 0 };
}

/**
 * Handles a failed login attempt
 * Returns whether the account is now locked
 */
export function handleFailedAttempt(
  currentAttempts: number,
  secureStorage: ReturnType<typeof createSecureStorage>,
  notifyUser?: (message: string) => void
): boolean {
  const newAttempts = currentAttempts + 1;
  secureStorage.setItem('signin_attempts', newAttempts.toString());
  
  // Calculate and save throttling delay
  const newDelay = calculateThrottleDelay(newAttempts);
  secureStorage.setItem('signin_throttle', newDelay.toString());
  
  if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
    // Lock the account
    const lockoutEnd = Date.now() + LOCKOUT_TIME;
    secureStorage.setItem('signin_lockout', lockoutEnd.toString());
    
    // Report to backend for IP-based throttling
    reportFailedLogin(newAttempts);
    
    // Notify the user if callback provided
    if (notifyUser) {
      notifyUser(`Too many failed attempts. Please try again in ${Math.ceil(LOCKOUT_TIME / (60 * 1000))} minutes.`);
    }
    
    return true; // Account is now locked
  }
  
  return false; // Not locked yet
}

/**
 * Applies progressive throttling delay
 */
export async function applyThrottling(
  secureStorage: ReturnType<typeof createSecureStorage>,
  notifyUser?: (message: string) => void
): Promise<void> {
  const storedThrottle = secureStorage.getItem('signin_throttle');
  
  if (storedThrottle) {
    const throttleDelay = parseInt(storedThrottle);
    
    if (throttleDelay > 0) {
      if (notifyUser) {
        notifyUser(`For security reasons, please wait ${Math.round(throttleDelay/1000)} seconds...`);
      }
      
      return new Promise(resolve => setTimeout(resolve, throttleDelay));
    }
  }
  
  return Promise.resolve();
} 