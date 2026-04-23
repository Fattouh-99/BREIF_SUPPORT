'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()
  const [clerkReady, setClerkReady] = useState(false)
  const [clerkError, setClerkError] = useState<string | null>(null)

  useEffect(() => {
    // Add error handling for Clerk initialization
    const handleClerkError = (event: ErrorEvent) => {
      if (event.error?.message?.includes('clerk') || event.error?.message?.includes('Failed to fetch')) {
        console.warn('Clerk network error detected:', event.error)
        setClerkError('Network connectivity issue with authentication service')
        
        // Try to recover after a delay
        setTimeout(() => {
          setClerkError(null)
          setClerkReady(true)
        }, 3000)
      }
    }

    window.addEventListener('error', handleClerkError)
    
    // Set ready state after a short delay to allow Clerk to initialize
    const timer = setTimeout(() => {
      setClerkReady(true)
    }, 1000)

    return () => {
      window.removeEventListener('error', handleClerkError)
      clearTimeout(timer)
    }
  }, [])

  if (clerkError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6">
          <div className="text-yellow-600 mb-2">⚠️ Authentication Service Issue</div>
          <div className="text-sm text-gray-600">{clerkError}</div>
          <div className="text-xs text-gray-500 mt-2">Retrying automatically...</div>
        </div>
      </div>
    )
  }

  return (
    <ClerkProvider
      appearance={{
        baseTheme: theme === 'dark' ? dark : undefined,
        elements: {
          formButtonPrimary: "hidden",
          card: "hidden",
          headerTitle: "hidden",
          headerSubtitle: "hidden",
          socialButtonsBlockButton: "hidden",
          formFieldInput: "hidden",
          footerActionLink: "hidden",
          rootBox: "hidden",
          navbar: "hidden",
          main: "hidden",
          footer: "hidden",
          socialButtons: "hidden",
          dividerRow: "hidden",
          dividerText: "hidden",
        },
        layout: {
          helpPageUrl: "",
          privacyPageUrl: "",
          termsPageUrl: "",
        },
      }}
    >
      {children}
    </ClerkProvider>
  )
} 