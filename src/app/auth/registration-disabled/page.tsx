'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserX, HomeIcon, LogIn } from 'lucide-react'
import Link from 'next/link'

export default function RegistrationDisabledPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-background/80 p-4">
      <Card className="w-full max-w-md shadow-lg border-red-200 dark:border-red-900">
        <CardHeader className="space-y-1 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-2">
            <UserX className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Registration Disabled</CardTitle>
          <CardDescription className="text-base">
            New user registration is currently disabled by the administrator.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            We apologize for the inconvenience. If you already have an account, you can try logging in instead.
          </p>
          <div className="flex justify-center pt-4 space-x-4">
            <Button variant="outline" asChild>
              <Link href="/">
                <HomeIcon className="mr-2 h-4 w-4" />
                Return to Home
              </Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-in">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 