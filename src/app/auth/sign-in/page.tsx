'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSystemSettings } from '@/hooks/use-system-settings'
import { SearchParamsProvider } from '@/components/search-params-wrapper'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import SignInFormProvider from '@/components/forms/sign-in/form-provider'
import LoginForm from '@/components/forms/sign-in/login-form'
import { useTheme } from "next-themes";
import { Button } from '@/components/ui/button'
import { fixRedirectLoop } from '@/lib/cookie-cleaner'

// Dynamically import SessionExpiredHandler with no SSR for faster initial load
const SessionExpiredHandler = dynamic(
  () => import('@/components/auth/session-expired-handler'),
  { ssr: false }
)

// Dynamically import Image with no SSR for faster initial load
const OptimizedImage = dynamic(() => import('next/image'), { ssr: false })

// Memoize the alert component to prevent re-renders
const ForceLogoutAlert = React.memo(() => (
  <Alert variant="destructive" className="mb-4">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>You've been logged out</AlertTitle>
    <AlertDescription>
      An administrator has logged out all users. Please sign in again to continue.
    </AlertDescription>
  </Alert>
))
ForceLogoutAlert.displayName = 'ForceLogoutAlert'

const SignInPageContent = () => {
  const { settings, loading, error, enforceAccessControl } = useSystemSettings();
  const { resolvedTheme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect mobile device on client side
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = window.navigator.userAgent;
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      setIsMobile(mobile);
      console.log(`Client-side mobile detection: ${mobile ? 'mobile' : 'desktop'}`);
    };
    
    checkMobile();
    
    // Fix potential redirect loops
    fixRedirectLoop();
  }, []);

  // If still loading settings or checking auth, show a loading indicator
  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8">
        {/* Custom login form to ensure UI is consistent across devices */}
        <SignInFormProvider>
          <LoginForm />
        </SignInFormProvider>
      </div>
    </div>
  );
};

const SignInPage = () => {
  return <SignInPageContent />;
};

export default SignInPage
