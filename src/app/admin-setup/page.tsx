'use client'

import { createSuperAdmin } from '@/actions/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { currentUser } from '@clerk/nextjs/server'
import { ShieldAlert } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { client } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

const adminSetupSchema = z.object({
  invitationCode: z.string().min(1, 'Invitation code is required')
})

export default function AdminSetupPage() {
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [isInitialSetup, setIsInitialSetup] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  
  const form = useForm<z.infer<typeof adminSetupSchema>>({
    resolver: zodResolver(adminSetupSchema),
    defaultValues: {
      invitationCode: ''
    }
  })

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const user = await currentUser()
        if (!user) {
          router.push('/auth/sign-in')
          return
        }

        // Get or create the user in our database
        let dbUser = await client.user.findUnique({
          where: {
            clerkId: user.id
          },
          select: {
            id: true
          }
        })

        if (!dbUser) {
          // Create the user if they don't exist
          const primaryEmailAddress = user.emailAddresses.find(
            email => email.id === user.primaryEmailAddressId
          )

          if (!primaryEmailAddress) {
            toast({
              title: 'Error',
              description: 'No primary email found',
              variant: 'destructive'
            })
            return
          }

          dbUser = await client.user.create({
            data: {
              clerkId: user.id,
              email: primaryEmailAddress.emailAddress,
              fullname: user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}`
                : 'Unknown User',
              role: 'MEMBER' as const,
              // dashboard preference removed
              products: [],
              categories: [],
              subscription: {
                create: {}
              }
            },
            select: {
              id: true
            }
          })

          console.log('Created new user:', dbUser)
        }

        setUserId(dbUser.id)

        // Check if any super admin exists
        const superAdmin = await client.user.findFirst({
          where: {
            role: 'SUPER_ADMIN' as const
          }
        })
        setIsInitialSetup(!superAdmin)
      } catch (error) {
        console.error('Error checking setup:', error)
        toast({
          title: 'Error',
          description: 'Failed to check setup status',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    checkSetup()
  }, [router, toast])

  const onSubmit = async (values: z.infer<typeof adminSetupSchema>) => {
    if (!userId) {
      toast({
        title: 'Error',
        description: 'User ID not found',
        variant: 'destructive'
      })
      return
    }

    try {
      console.log('Submitting with:', { userId, invitationCode: values.invitationCode })
      const result = await createSuperAdmin(userId, values.invitationCode)
      
      if (result.success) {
        toast({
          title: 'Success',
          description: result.isInitialSetup 
            ? 'You are now the first Super Admin of the system' 
            : 'Your account has been upgraded to Super Admin'
        })
        router.push('/admin')
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to upgrade account',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error upgrading account:', error)
      toast({
        title: 'Error',
        description: 'Failed to upgrade account',
        variant: 'destructive'
      })
    }
  }

  if (loading) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            <CardTitle>Admin Setup</CardTitle>
          </div>
          <CardDescription>
            {isInitialSetup ? (
              <>
                Welcome to the initial admin setup! As the first administrator,
                you'll need to use the initial setup code from your environment variables.
                Check your .env file for the INITIAL_ADMIN_CODE.
              </>
            ) : (
              <>
                Enter your admin invitation code to set up your administrator account.
                This code should have been provided to you by an existing administrator.
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="invitationCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {isInitialSetup ? 'Initial Setup Code' : 'Invitation Code'}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="password"
                        placeholder={isInitialSetup 
                          ? "Enter the initial setup code" 
                          : "Enter your invitation code"
                        } 
                      />
                    </FormControl>
                    <FormDescription>
                      {isInitialSetup 
                        ? "This code is used only for the first admin setup"
                        : "This is a one-time use code for setting up admin access"
                      }
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full">
                {isInitialSetup ? 'Complete Initial Setup' : 'Verify and Setup Admin Access'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
} 