'use client'

import React, { useEffect, useState } from 'react'
import { useSystemSettings } from '@/hooks/use-system-settings'
import { Loader2 } from 'lucide-react'
import { useSafeSearchParams } from '@/lib/search-params-provider'
import Link from 'next/link'
import { useTheme } from "next-themes"
import { AuthContextProvider } from '@/context/use-auth-context'
import RegistrationFormStep from '@/components/forms/sign-up/registration-step'
import { FormProvider, useForm } from 'react-hook-form'
import { fixRedirectLoop } from '@/lib/cookie-cleaner'

const SignUpPage = () => {
  const searchParams = useSafeSearchParams();
  const { settings, loading, error, enforceAccessControl } = useSystemSettings();
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
    
    // Force the Clerk UI to be hidden for all devices
    const hideClerkUI = () => {
      // Find and hide any Clerk UI elements that might appear
      const clerkElements = document.querySelectorAll('[data-clerk-component]');
      clerkElements.forEach(element => {
        if (element instanceof HTMLElement) {
          element.style.display = 'none';
        }
      });
    };
    
    // Run immediately and also after a short delay to catch elements that load later
    hideClerkUI();
    const timer = setTimeout(hideClerkUI, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Get plan from URL if present
  const planFromUrl = searchParams.get('plan');
  
  // Format the plan name properly (ensure uppercase for internal use)
  const formattedPlanFromUrl = planFromUrl ? planFromUrl.toUpperCase() : '';
  
  // Initialize form context
  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      confirmEmail: '',
      confirmPassword: '',
      fullname: '',
      role: 'OWNER',
      // dashboard preference removed
      otp: '',
      selectedPlan: formattedPlanFromUrl ? formattedPlanFromUrl.toLowerCase() : '',
      hasPaid: formattedPlanFromUrl && formattedPlanFromUrl !== 'STANDARD' ? false : true, // If non-free plan selected, payment is required
      products: [],
      categories: [],
      targetAudience: '',
    }
  });
  
  // Check if registration is enabled
  useEffect(() => {
    if (!loading && settings) {
      enforceAccessControl('registration');
    }
  }, [loading, settings, enforceAccessControl]);
  
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
        {/* Custom registration component that works consistently across all devices */}
        <AuthContextProvider>
          <FormProvider {...methods}>
            <div>
              <RegistrationFormStep />
            </div>
          </FormProvider>
        </AuthContextProvider>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/auth/sign-in" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage
