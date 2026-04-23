'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Shield, ShieldAlert, ShieldOff, Loader2 } from 'lucide-react'
import { useCSRF } from '@/hooks/use-csrf'

export default function MaintenanceControls() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { getCSRFHeader } = useCSRF()

  // Function to enable bypass cookie
  const enableBypass = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/maintenance-bypass', {
        method: 'GET',
        headers: {
          ...getCSRFHeader()
        }
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: 'Bypass Enabled',
          description: 'You can now access the site while in maintenance mode',
        })
      } else {
        throw new Error(data.message || 'Failed to enable bypass')
      }
    } catch (error) {
      console.error('Error enabling bypass:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to enable bypass',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Function to disable bypass cookie
  const disableBypass = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/maintenance-bypass', {
        method: 'DELETE',
        headers: {
          ...getCSRFHeader()
        }
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: 'Bypass Disabled',
          description: 'Maintenance mode restrictions will apply to you now.',
        })
      } else {
        throw new Error(data.message || 'Failed to disable bypass')
      }
    } catch (error) {
      console.error('Error disabling bypass:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to disable bypass',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Function to disable maintenance mode entirely
  const disableMaintenance = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/system-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getCSRFHeader()
        },
        body: JSON.stringify({
          maintenanceMode: false
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: 'Maintenance Mode Disabled',
          description: 'Your site is now accessible to all users.',
        })
        
        // Force reload to apply changes
        window.location.reload()
      } else {
        throw new Error(data.error || 'Failed to disable maintenance mode')
      }
    } catch (error) {
      console.error('Error disabling maintenance mode:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to disable maintenance mode',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-amber-800 dark:text-amber-500 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" />
          Maintenance Mode Controls
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mb-4">
          These controls allow you to bypass or disable maintenance mode to continue your development work.
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={enableBypass} 
            variant="outline" 
            size="sm"
            className="bg-white dark:bg-background"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Shield className="mr-2 h-4 w-4" />
            )}
            Enable Bypass
          </Button>
          
          <Button 
            onClick={disableBypass} 
            variant="outline" 
            size="sm"
            className="bg-white dark:bg-background"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ShieldOff className="mr-2 h-4 w-4" />
            )}
            Disable Bypass
          </Button>
          
          <Button 
            onClick={disableMaintenance} 
            variant="secondary"
            size="sm"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ShieldAlert className="mr-2 h-4 w-4" />
            )}
            Turn Off Maintenance Mode
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 