/**
 * Browser detection utilities
 */

/**
 * Check if code is running in browser environment
 */
export const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
};

/**
 * Check if code is running on server (SSR)
 */
export const isServer = (): boolean => {
  return !isBrowser();
};

/**
 * Check if device is mobile based on viewport width
 */
export const isMobile = (): boolean => {
  if (!isBrowser()) return false;
  return window.innerWidth < 768;
};

/**
 * Get window dimensions safely
 */
export const getWindowDimensions = (): { width: number; height: number } | null => {
  if (!isBrowser()) return null;
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
};

/**
 * Check if crypto API is available for UUID generation
 */
export const hasCryptoAPI = (): boolean => {
  if (!isBrowser()) return false;
  return !!(window.crypto && window.crypto.getRandomValues);
};