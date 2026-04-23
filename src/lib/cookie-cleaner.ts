/**
 * Utility to help clear problematic cookies that might be causing redirect loops
 * This is especially helpful when users encounter issues with authentication
 */

/**
 * Clears problematic cookies that could cause authentication redirect loops
 * 
 * @param domainLevels How many domain levels to try (1 = current domain, 2 = current + parent domain)
 */
export function clearAuthCookies(domainLevels = 2): void {
  if (typeof document === 'undefined') return; // Server-side safety check
  
  // Get the current hostname
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost';
  
  // List of Clerk and related auth cookies to clear
  const cookiesToClear = [
    '__session',
    '__clerk_db_jwt',
    'clerk_session',
    'clerk_request_id',
    'clerk_session_id',
    'clerk_jwt',
    'auth_error',
    'auth_token',
    'auth_redirect'
  ];
  
  // Common paths where cookies might be set
  const paths = ['/', '/auth', '/dashboard', '/auth/sign-in', '/auth/sign-up'];
  
  // Generate domain levels (e.g., example.com, .example.com)
  const domains = [];
  
  if (isLocalhost) {
    domains.push('localhost');
  } else {
    // Split hostname into parts (e.g., "www.example.com" -> ["www", "example", "com"])
    const parts = hostname.split('.');
    
    // Generate domain levels based on specified depth
    for (let i = 0; i < Math.min(domainLevels, parts.length - 1); i++) {
      const domain = parts.slice(parts.length - 2 - i).join('.');
      domains.push(domain);
      domains.push(`.${domain}`); // Add with leading dot for cross-subdomain cookies
    }
  }
  
  // Clear cookies for all combinations of domains and paths
  for (const cookie of cookiesToClear) {
    // First try with no specific domain/path
    document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax;`;
    
    for (const domain of domains) {
      for (const path of paths) {
        document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}; SameSite=Lax;`;
      }
    }
  }
  
  console.log('Attempted to clear authentication cookies to fix redirect issues');
}

/**
 * Detects if the page is in a potential redirect loop
 * 
 * @returns true if a redirect loop is detected
 */
export function detectRedirectLoop(): boolean {
  if (typeof window === 'undefined') return false; // Server-side safety check
  
  // Check localStorage for previous redirects
  const redirectKey = 'auth_redirect_count';
  const currentPath = window.location.pathname;
  const currentTimestamp = Date.now();
  const redirectTimeout = 30 * 1000; // 30 seconds
  
  try {
    // Get previous redirect info
    const redirectInfo = JSON.parse(localStorage.getItem(redirectKey) || '{}');
    
    // Check if this is the same path and within the timeout period
    if (
      redirectInfo.path === currentPath && 
      currentTimestamp - redirectInfo.timestamp < redirectTimeout
    ) {
      // Increment count
      const newCount = (redirectInfo.count || 0) + 1;
      
      // Save updated count
      localStorage.setItem(redirectKey, JSON.stringify({
        path: currentPath,
        timestamp: currentTimestamp,
        count: newCount
      }));
      
      // If redirected to the same path 3+ times in a short period, likely a loop
      return newCount >= 3;
    } else {
      // Reset counter for new path or after timeout
      localStorage.setItem(redirectKey, JSON.stringify({
        path: currentPath,
        timestamp: currentTimestamp,
        count: 1
      }));
      return false;
    }
  } catch (e) {
    // In case of localStorage errors
    console.error('Error accessing localStorage:', e);
    return false;
  }
}

/**
 * Helper function to auto-detect and fix redirect loops
 * Call this on pages that might experience redirect loops
 */
export function fixRedirectLoop(): void {
  if (typeof window === 'undefined') return; // Server-side safety check
  
  if (detectRedirectLoop()) {
    console.warn('Redirect loop detected, clearing authentication cookies');
    clearAuthCookies();
    
    // Refresh the page one time after clearing cookies
    const hasRefreshed = sessionStorage.getItem('auth_page_refreshed');
    if (!hasRefreshed) {
      sessionStorage.setItem('auth_page_refreshed', 'true');
      window.location.reload();
    }
  }
} 