'use client'

import React, { useEffect, useState } from 'react'
import { AlertTriangle, Construction, Wrench, Info } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

// Define the type for the maintenance settings
interface MaintenanceSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  registrationEnabled?: boolean;
  loginEnabled?: boolean;
  forceLogoutAllUsers?: boolean;
  lastForceLogoutAt?: string | null;
}

// Global cache to prevent duplicate API calls from multiple components
let GLOBAL_MAINTENANCE_CACHE: MaintenanceSettings | null = null;
let LAST_CACHE_UPDATE = 0;
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

export const MaintenanceBanner = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [maintenanceMessage, setMaintenanceMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  // Don't render in chatbot contexts
  const isChatbot = 
    typeof window !== 'undefined' && 
    (window.location.pathname?.includes('/chatbot') || 
    window.self !== window.top); // Check if in iframe
    
  // Check if the current page is a private page (dashboard, admin, etc.)
  // Based on the project's routing structure and middleware configuration
  const isPrivatePage = 
    pathname?.includes('/dashboard') || 
    pathname?.includes('/team') || 
    pathname?.includes('/settings') || 
    pathname?.includes('/admin') || 
    pathname?.includes('/appointment') || 
    pathname?.includes('/conversation') || 
    pathname?.includes('/email-marketing') || 
    pathname?.includes('/integration');
    
  // List of public routes from middleware.ts
  const isPublicPage = 
    pathname === '/' ||
    pathname?.startsWith('/features') ||
    pathname?.startsWith('/resources') ||
    pathname?.startsWith('/blogs') ||
    pathname?.startsWith('/careers') ||
    pathname?.startsWith('/contact') ||
    pathname?.startsWith('/chatbot') ||
    pathname?.startsWith('/demo') ||
    pathname?.startsWith('/products') ||
    pathname?.startsWith('/upload') ||
    pathname?.startsWith('/portal') ||
    pathname?.startsWith('/auth') ||
    pathname?.startsWith('/maintenance');
    
  // Don't even attempt to load for auth pages, API routes, chatbot context, or private pages
  const shouldSkipFetching = 
    pathname?.startsWith('/auth/') || 
    pathname?.startsWith('/api/') ||
    pathname?.startsWith('/chatbot') ||
    !isPublicPage ||
    isChatbot;

  useEffect(() => {
    // Skip API calls for auth, API pages, and private pages completely
    if (shouldSkipFetching) {
      setIsLoading(false)
      return
    }
    
    let isMounted = true
    
    const checkMaintenanceStatus = async () => {
      // Guard against unmounted component
      if (!isMounted) return
      
      try {
        // Check if we can use cached data
        const now = Date.now();
        if (GLOBAL_MAINTENANCE_CACHE && (now - LAST_CACHE_UPDATE < CACHE_TTL)) {
          // Use cached data
          if (isMounted) {
            setMaintenanceMode(GLOBAL_MAINTENANCE_CACHE.maintenanceMode || false);
            setMaintenanceMessage(GLOBAL_MAINTENANCE_CACHE.maintenanceMessage || '');
            setIsLoading(false);
          }
          return;
        }
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000) // 3s timeout
        
        const response = await fetch('/api/system-settings', {
          signal: controller.signal,
          // Prevent caching to avoid stale data
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        
        clearTimeout(timeoutId)
        
        if (isMounted && response.ok) {
          const responseJson = await response.json()
          const data = responseJson.data || responseJson;
          
          // Update global cache
          GLOBAL_MAINTENANCE_CACHE = data;
          LAST_CACHE_UPDATE = now;
          
          setMaintenanceMode(data.maintenanceMode || false)
          setMaintenanceMessage(data.maintenanceMessage || 'The site is currently under maintenance. Some features may be unavailable.')
        }
      } catch (error: any) {
        // Only log if not an abort error (expected when timing out)
        if (error.name !== 'AbortError' && isMounted) {
          console.error('Failed to check maintenance status:', error)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    // Only run API call if we're on a public page
    if (!shouldSkipFetching) {
      checkMaintenanceStatus()
      
      // Set up polling with a reasonable interval (every 5 minutes)
      const intervalId = setInterval(checkMaintenanceStatus, 5 * 60 * 1000)
      
      // Clean up function
      return () => {
        isMounted = false
        clearInterval(intervalId)
      }
    }
  }, [pathname, shouldSkipFetching])

  if (isLoading || !maintenanceMode || isChatbot || !isPublicPage) {
    return null
  }

  return (
    <>
      {/* Spacer div to account for fixed navbar height */}
      <div className="h-14 md:h-16 lg:h-20" aria-hidden="true"></div>
      
      {/* Modern Maintenance banner */}
      <motion.div 
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-900 dark:to-purple-900 shadow-lg maintenance-banner"
        data-maintenance-banner
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="container mx-auto py-3 px-4">
          <div className="flex items-center justify-center">
            <div className="flex flex-wrap items-center gap-3 text-white max-w-4xl">
              <div className="rounded-full bg-white/20 p-1.5 backdrop-blur-sm">
                <Wrench className="h-5 w-5 flex-shrink-0 text-white" />
              </div>
              
              <div className="flex-1">
                <p className="text-sm md:text-base font-medium leading-tight">
                  <span className="font-semibold text-white/90">Maintenance:</span>{' '}
                  <span className="text-white/90">{maintenanceMessage}</span>
                </p>
              </div>
              
              <motion.div 
                className="hidden sm:block" 
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                <span className="inline-flex items-center rounded-full bg-white/10 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-white ring-1 ring-inset ring-white/30">
                  <span className="mr-1">•</span> Active
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default MaintenanceBanner 