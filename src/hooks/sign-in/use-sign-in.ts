'use client'
import { useToast } from '@/components/ui/use-toast'
import { UserLoginProps, UserLoginSchema } from '@/schemas/auth.schema'
import { useSignIn, useClerk } from '@clerk/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { 
  createSecureStorage, 
  handleFailedAttempt, 
  applyThrottling, 
  checkLockoutStatus 
} from '@/lib/auth-security'

const MAX_ATTEMPTS = 5
const LOCKOUT_TIME = 15 * 60 * 1000 // 15 minutes in milliseconds
const IP_BASED_THROTTLING = true // Enable IP-based throttling

// NOTE: Remove the mock hooks - they prevent proper auth flow
// Always use the real hooks from Clerk

export const useSignInForm = () => {
  const { isLoaded, setActive, signIn } = useSignIn()
  const clerk = useClerk()
  const [loading, setLoading] = useState<boolean>(false)
  const [attempts, setAttempts] = useState<number>(0)
  const [lockoutTime, setLockoutTime] = useState<number | null>(null)
  const [throttleDelay, setThrottleDelay] = useState<number>(0)
  const [isLocked, setIsLocked] = useState<boolean>(false)
  const [remainingAttempts, setRemainingAttempts] = useState<number>(5)
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  
  // Get redirect URL from query params if available
  const redirectUrl = searchParams?.get('redirect_url') || '/conversation'
  
  // Memoize the form setup to avoid re-creating on every render
  const methods = useForm<UserLoginProps>({
    resolver: zodResolver(UserLoginSchema),
    mode: 'onChange',
    defaultValues: useMemo(() => ({ email: '', password: '' }), []),
  })

  // Create secure storage instance
  const secureStorage = useMemo(() => createSecureStorage(), [])

  // Check for existing lockout - only run once on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const storedAttempts = secureStorage.getItem('signin_attempts')
      const storedThrottle = secureStorage.getItem('signin_throttle')
      
      // Check lockout status
      const lockoutStatus = checkLockoutStatus(secureStorage)
      setIsLocked(lockoutStatus.isLocked)
      
      if (lockoutStatus.isLocked) {
        setLockoutTime(Date.now() + (lockoutStatus.remainingSeconds * 1000))
      }
      
      if (storedAttempts) {
        const attemptCount = parseInt(storedAttempts)
        setAttempts(attemptCount)
        setRemainingAttempts(Math.max(5 - attemptCount, 0))
      }
      
      if (storedThrottle) {
        setThrottleDelay(parseInt(storedThrottle))
      }
    } catch (e) {
      console.error('Error loading security data:', e)
      // Reset if there's an issue
      secureStorage.removeItem('signin_lockout')
      secureStorage.removeItem('signin_attempts')
      secureStorage.removeItem('signin_throttle')
    }
  }, [secureStorage])

  // Reset attempts after lockout period
  useEffect(() => {
    if (lockoutTime && lockoutTime < Date.now()) {
      setLockoutTime(null)
      setAttempts(0)
      setThrottleDelay(0)
      setIsLocked(false)
      setRemainingAttempts(5)
      secureStorage.removeItem('signin_lockout')
      secureStorage.removeItem('signin_attempts')
      secureStorage.removeItem('signin_throttle')
    }
  }, [lockoutTime, secureStorage])

  // Check for existing session on component mount
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    
    const checkActiveSession = async () => {
      try {
        // If there's an active session but we're on the sign-in page,
        // redirect to dashboard
        if (clerk.session) {
          window.location.href = redirectUrl;
        }
      } catch (error) {
        console.error("Error checking session:", error);
        // If there's an error checking the session, we'll try to sign out
        // to get a clean slate
        try {
          await clerk.signOut();
        } catch (signOutError) {
          console.error("Error signing out:", signOutError);
        }
      }
    };
    
    checkActiveSession();
  }, [isLoaded, clerk, redirectUrl]);

  // Handle failed login attempt
  const handleLoginFailure = useCallback((errorMessage: string) => {
    const isNowLocked = handleFailedAttempt(
      attempts, 
      secureStorage,
      (message) => toast({
        title: 'Account Locked',
        description: message,
        variant: 'destructive',
      })
    );
    
    setAttempts(prev => prev + 1);
    setRemainingAttempts(prev => Math.max(prev - 1, 0));
    setIsLocked(isNowLocked);
    
    if (!isNowLocked) {
      toast({
        title: 'Sign in failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [attempts, secureStorage, toast]);

  // Safely validate email format without over-sanitization
  const validateEmail = useCallback((email: string): boolean => {
    // Use a proper email regex that doesn't strip valid characters
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }, [])

  // Clear session data
  const clearSessionData = useCallback(async () => {
    // Clear only necessary clerk data without risking deletion of other session data
    try {
      if (clerk.session) {
        await clerk.signOut();
      }
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, [clerk]);

  const onHandleSubmit = methods.handleSubmit(async (values: UserLoginProps) => {
    if (!isLoaded) {
      toast({
        title: 'Error',
        description: 'Authentication system is not ready yet. Please try again.',
      })
      return
    }

    // Check for lockout
    const lockoutStatus = checkLockoutStatus(secureStorage);
    if (lockoutStatus.isLocked) {
      toast({
        title: 'Account Locked',
        description: `Please try again in ${lockoutStatus.remainingMinutes} minutes.`,
        variant: 'destructive',
      })
      return
    }
    
    // Apply throttling delay if needed
    await applyThrottling(secureStorage, (message) => 
      toast({
        title: 'Security Delay',
        description: message,
      })
    );

    // Check if login is enabled in system settings
    try {
      const response = await fetch('/api/system-settings', {
        headers: {
          // Add CSRF token header if available
          ...(document.querySelector('meta[name="csrf-token"]') && {
            'X-CSRF-Token': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement).content
          })
        }
      });
      
      const settings = await response.json();
      
      if (settings.login_disabled) {
        toast({
          title: 'Login Disabled',
          description: settings.login_disabled_message || 'Login is currently disabled by the administrator.',
          variant: 'destructive',
        });
        return;
      }
    } catch (e) {
      // If we can't fetch settings, we'll assume login is enabled
      console.error('Error fetching system settings:', e);
    }

    setLoading(true)
    
    try {
      // Basic email validation
      if (!validateEmail(values.email)) {
        setLoading(false);
        handleLoginFailure('Please enter a valid email address.');
        return;
      }
      
      // Attempt first-factor authentication
      const firstFactor = await signIn.create({
        identifier: values.email,
        password: values.password,
      });

      if (firstFactor.status === 'complete') {
        // If complete, set session as active
        await setActive({ session: firstFactor.createdSessionId });
        
        // Reset security counters
        setAttempts(0);
        secureStorage.removeItem('signin_attempts');
        secureStorage.removeItem('signin_throttle');
        
        // Redirect to dashboard or specified URL
        router.push(redirectUrl);
      } else {
        // This shouldn't happen, but handle just in case
        console.error('Unexpected auth state:', firstFactor);
        handleLoginFailure('Authentication failed. Please try again.');
      }
    } catch (err) {
      console.error('Auth error:', err);

      // Handle the login error
      if (err instanceof Error) {
        // Clerk errors typically expose clear messages
        handleLoginFailure(err.message || 'Authentication failed. Please try again.');
      } else {
        handleLoginFailure('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  });

  return {
    methods,
    onHandleSubmit,
    loading,
    isLocked,
    remainingAttempts,
    clearSessionData
  };
}
