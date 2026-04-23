'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { WrenchIcon, RotateCw, HomeIcon, ShieldCheck, Lock } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'
import { useSignIn, useUser } from '@clerk/nextjs'

export default function MaintenancePage() {
  const [message, setMessage] = useState<string | null>('System maintenance is in progress.')
  const [showAdminButton, setShowAdminButton] = useState(false)
  const [bypassLoading, setBypassLoading] = useState(false)
  const { isLoaded, isSignedIn, user } = useUser()
  const { toast } = useToast()
  
  // Fetch the maintenance message
  useEffect(() => {
    const fetchMaintenanceMessage = async () => {
      try {
        const response = await fetch('/api/system-settings')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data && data.data.maintenanceMessage) {
            setMessage(data.data.maintenanceMessage)
          }
        }
      } catch (error) {
        console.error('Error fetching maintenance message:', error)
      }
    }
    
    fetchMaintenanceMessage()
  }, [])

  // Check if the current user is an admin
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      // Check if the user's public metadata contains role information
      const role = user.publicMetadata?.role as string
      if (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'OWNER') {
        setShowAdminButton(true)
      }
    }
  }, [isLoaded, isSignedIn, user])

  // Function to check if maintenance is over
  const checkMaintenanceStatus = async () => {
    try {
      const response = await fetch('/api/system-settings', {
        cache: 'no-store'
      })
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data && !data.data.maintenanceMode) {
          window.location.href = '/'
        } else {
          toast({
            title: 'Still in Maintenance',
            description: 'The system is still in maintenance mode. Please check back later.',
          })
        }
      }
    } catch (error) {
      console.error('Error checking maintenance status:', error)
    }
  }
  
  // Function to enable admin bypass
  const enableBypass = async () => {
    try {
      setBypassLoading(true)
      const response = await fetch('/api/maintenance-bypass', {
        method: 'GET',
        cache: 'no-store'
      })
      
      if (response.ok) {
        toast({
          title: 'Bypass Enabled',
          description: 'You can now access the site while in maintenance mode.',
        })
        // Redirect to home page after a short delay
        setTimeout(() => {
          window.location.href = '/'
        }, 1000)
      } else {
        const data = await response.json()
        toast({
          title: 'Error',
          description: data.message || 'Failed to enable bypass. You may not have sufficient permissions.',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error enabling bypass:', error)
      toast({
        title: 'Error',
        description: 'Failed to enable bypass mode.',
        variant: 'destructive'
      })
    } finally {
      setBypassLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-background/80 p-4">
      <Card className="w-full max-w-md shadow-lg border-amber-200 dark:border-amber-900">
        <CardHeader className="space-y-1 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-2">
            <WrenchIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Maintenance Mode</CardTitle>
          <CardDescription className="text-base">
            Our site is currently undergoing maintenance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            {message}
          </p>
          <div className="flex justify-center pt-4 space-x-4">
            <Button variant="outline" onClick={checkMaintenanceStatus}>
              <RotateCw className="mr-2 h-4 w-4" />
              Check Status
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">
                <HomeIcon className="mr-2 h-4 w-4" />
                Try Home Page
              </Link>
            </Button>
          </div>
          
          {/* Admin bypass section */}
          {showAdminButton && (
            <div className="pt-6 mt-4 border-t border-amber-200 dark:border-amber-800">
              <p className="text-sm text-muted-foreground mb-3">
                Admin/Developer Access
              </p>
              <Button 
                onClick={enableBypass} 
                disabled={bypassLoading}
                variant="secondary"
              >
                {bypassLoading ? (
                  <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="mr-2 h-4 w-4" />
                )}
                {bypassLoading ? 'Enabling...' : 'Enable Bypass Mode'}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Only admins and developers can bypass maintenance mode.
              </p>
            </div>
          )}
          
          {/* Sign in link for admins */}
          {!isSignedIn && (
            <div className="pt-6 mt-4 border-t border-amber-200 dark:border-amber-800">
              <p className="text-xs text-muted-foreground mb-3">
                Admin? Sign in to access the site
              </p>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin">
                  <Lock className="mr-2 h-3 w-3" />
                  Admin Sign In
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 