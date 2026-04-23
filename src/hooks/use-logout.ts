'use client'

import { useState, useCallback } from 'react'
import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { signOutUser } from '@/actions/auth/sign-out'

export const useLogout = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const clerk = useClerk()
  const router = useRouter()
  const { toast } = useToast()

  const logout = useCallback(async () => {
    try {
      setIsLoggingOut(true)
      
      // First, try our server action which handles both Clerk and cookie cleanup
      const result = await signOutUser()
      
      if (result.success) {
        // Always try client-side signOut too, for complete cleanup
        // Even if it fails, we've already revoked the session on the server
        try {
          // The signOut method will remove the session from client-side storage
          await clerk.signOut()
        } catch (clientError) {
          console.error('Error during client-side signOut:', clientError)
          // Don't fail here - we can still redirect the user as the server-side logout worked
        }
        
        // Show success toast
        toast({
          title: 'Signed out',
          description: 'You have been successfully signed out',
        })
        
        // Redirect to sign-in page
        router.push('/auth/sign-in')
      } else {
        throw new Error(result.error || 'Unknown error during logout')
      }
    } catch (error) {
      console.error('Error during logout process:', error)
      
      // Show error toast
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      })
      
      // As a last resort, try the client-side method directly
      try {
        await clerk.signOut()
        router.push('/auth/sign-in')
      } catch (finalError) {
        console.error('Final fallback logout failed:', finalError)
        
        // Force a reload to clear session state
        window.location.href = '/auth/sign-in'
      }
    } finally {
      setIsLoggingOut(false)
    }
  }, [clerk, router, toast])

  return {
    logout,
    isLoggingOut
  }
} 