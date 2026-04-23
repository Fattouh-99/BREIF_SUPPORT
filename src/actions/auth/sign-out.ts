'use server'

import { cookies } from 'next/headers'
import { auth } from '@clerk/nextjs'

type SignOutResponse = {
  success: boolean
  error?: string
}

/**
 * Server action to sign out the user
 * This handles revoking the session and clearing cookies
 */
export async function signOutUser(): Promise<SignOutResponse> {
  try {
    // Get session from Clerk
    const { getToken, sessionId } = auth()
    
    // If no session, return success immediately
    if (!sessionId) {
      return { success: true }
    }
    
    // Get auth token for API requests
    const token = await getToken()
    
    // Revoke session with Clerk API if we have a token
    if (token && sessionId) {
      try {
        // Call Clerk API to revoke session
        const response = await fetch(`${process.env.CLERK_API_URL}/sessions/${sessionId}/revoke`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          const error = await response.text()
          console.error('Failed to revoke session with Clerk:', error)
          // Continue execution to clean up cookies anyway
        }
      } catch (error) {
        console.error('Error calling Clerk API:', error)
        // Continue execution to clean up cookies anyway
      }
    }
    
    // Clear cookies
    const cookieStore = cookies()
    
    // Clear Clerk session cookies
    cookieStore.delete('__session')
    cookieStore.delete('__client')
    
    // Clear any application-specific cookies
    cookieStore.delete('auth-token')
    cookieStore.delete('userId')
    
    return { success: true }
  } catch (error) {
    console.error('Error during server-side sign out:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error during sign out'
    }
  }
} 