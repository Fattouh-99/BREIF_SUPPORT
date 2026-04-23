'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useToast } from '@/components/ui/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Loader2, Settings } from 'lucide-react'
import { useCSRF } from '@/hooks/use-csrf'

// Form schema for system settings
const systemSettingsSchema = z.object({
  registrationEnabled: z.boolean().default(true),
  loginEnabled: z.boolean().default(true),
  maintenanceMode: z.boolean().default(false),
  maintenanceMessage: z.string().nullable().optional(),
  forceLogoutAllUsers: z.boolean().default(false),
})

export type SystemSettingsValues = z.infer<typeof systemSettingsSchema>

export function SystemSettings() {
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { getCSRFHeader, getCSRFInputProps } = useCSRF()

  const form = useForm<SystemSettingsValues>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: {
      registrationEnabled: true,
      loginEnabled: true,
      maintenanceMode: false,
      maintenanceMessage: '',
      forceLogoutAllUsers: false,
    }
  })

  // Create a reusable function to fetch settings
  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/system-settings', {
        cache: 'no-store' // Ensure we get fresh data
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch system settings')
      }
      
      const result = await response.json()
      
      if (result.success && result.data) {
        // Update form with the latest values from server
        form.reset({
          registrationEnabled: Boolean(result.data.registrationEnabled),
          loginEnabled: Boolean(result.data.loginEnabled),
          maintenanceMode: Boolean(result.data.maintenanceMode),
          maintenanceMessage: result.data.maintenanceMessage || '',
          forceLogoutAllUsers: Boolean(result.data.forceLogoutAllUsers),
        }, { keepDefaultValues: false })
      }
      
      return result
    } catch (error) {
      console.error('Failed to fetch system settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to load system settings',
        variant: 'destructive'
      })
      return null
    }
  }, [form, toast])

  // Initial fetch on component mount
  useEffect(() => {
    const loadInitialSettings = async () => {
      setLoading(true)
      await fetchSettings()
      setLoading(false)
    }
    
    loadInitialSettings()
  }, [fetchSettings])

  const onSubmit = async (values: SystemSettingsValues) => {
    setLoading(true)
    try {
      const response = await fetch('/api/system-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getCSRFHeader()
        },
        body: JSON.stringify({
          registrationEnabled: Boolean(values.registrationEnabled),
          loginEnabled: Boolean(values.loginEnabled),
          maintenanceMode: Boolean(values.maintenanceMode),
          maintenanceMessage: values.maintenanceMessage || null,
          forceLogoutAllUsers: Boolean(values.forceLogoutAllUsers)
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update settings')
      }

      // Fetch the latest settings to ensure UI is in sync
      await fetchSettings()

      toast({
        title: 'Success',
        description: 'System settings updated successfully'
      })
    } catch (error) {
      console.error('Error updating system settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to update system settings',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-indigo-500" />
          <CardTitle>System Settings</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4">
          Control access to your website and set maintenance mode.
        </CardDescription>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* CSRF hidden field */}
            <input {...getCSRFInputProps()} />
            
            {/* User Registration */}
            <FormField
              control={form.control}
              name="registrationEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>User Registration</FormLabel>
                    <FormDescription>
                      Allow new users to sign up for an account
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value === true}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* User Login */}
            <FormField
              control={form.control}
              name="loginEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>User Login</FormLabel>
                    <FormDescription>
                      Allow existing users to sign in to their accounts
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value === true}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Force Logout */}
            <FormField
              control={form.control}
              name="forceLogoutAllUsers"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950 p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="font-bold text-red-600 dark:text-red-400">Force Logout All Users</FormLabel>
                    <FormDescription>
                      Log out all users immediately (except super admins). Users will need to sign in again.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value === true}
                      onCheckedChange={(checked) => {
                        // Optionally show a confirmation dialog here if needed
                        if (checked) {
                          const confirm = window.confirm("This will force all users to log out immediately. Continue?");
                          if (confirm) {
                            field.onChange(checked);
                          }
                        } else {
                          field.onChange(checked);
                        }
                      }}
                      className="data-[state=checked]:bg-red-500 data-[state=checked]:text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Maintenance Mode */}
            <FormField
              control={form.control}
              name="maintenanceMode"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Maintenance Mode</FormLabel>
                    <FormDescription>
                      Put the site in maintenance mode (only admins can access)
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value === true}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Maintenance Message */}
            {form.watch('maintenanceMode') && (
              <FormField
                control={form.control}
                name="maintenanceMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maintenance Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter a message to display during maintenance"
                        className="resize-none"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      This message will be shown to users during maintenance
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 