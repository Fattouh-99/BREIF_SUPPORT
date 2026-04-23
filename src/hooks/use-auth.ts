'use client';

import { useAuth as useClerkAuth } from '@clerk/nextjs';

/**
 * Custom hook for authentication that wraps Clerk's useAuth hook
 * and provides additional functionality.
 */
export function useAuth() {
  const { getToken, isLoaded, isSignedIn, userId } = useClerkAuth();

  /**
   * Gets the authentication token for API requests
   * @returns A promise that resolves to the auth token or null if not authenticated
   */
  const getAuthToken = async (): Promise<string | null> => {
    if (!isSignedIn) return null;
    try {
      return await getToken();
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  return {
    getAuthToken,
    isLoaded,
    isSignedIn,
    userId
  };
} 