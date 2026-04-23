'use client'
import { Button } from '@/components/ui/button'
import { useAuthContextHook } from '@/context/use-auth-context'
import { useSignUpForm } from '@/hooks/sign-up/use-sign-up'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useToast } from '@/components/ui/use-toast'
import Image from 'next/image'
import { UserRole } from '@prisma/client'
// Remove direct imports at top level
// import { useSignUp, useClerk } from '@clerk/nextjs'

// Add TypeScript declaration for window functions
declare global {
  interface Window {
    sendClerkOTP?: (email: string, password: string) => Promise<boolean>;
    validateClerkEmail?: (email: string, password: string) => Promise<boolean | { error: string, message: string }>;
  }
}

// Log when file is loaded - important for debugging
console.log('[ButtonHandlers] File loaded, starting initialization');

// Function to safely get Clerk
const getClerk = () => {
  try {
    if (typeof window !== 'undefined') {
      // Check if Clerk global is available
      if ((window as any).Clerk) {
        console.log('[getClerk] Clerk global object found in window');
        return true;
      }
      
      // Check if Clerk environment variables are available
      if (typeof process !== 'undefined' && 
          process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
        console.log('[getClerk] Clerk env variables found');
        return true;
      }
      
      // Try to find a ClerkProvider in the DOM as a fallback check
      const clerkProviders = document.querySelectorAll('[data-clerk-provider]');
      console.log('[getClerk] ClerkProvider DOM check:', { found: clerkProviders.length > 0 });
      return clerkProviders.length > 0;
    }
    console.log('[getClerk] Window not available (server-side render)');
    return false;
  } catch (e) {
    console.error('[getClerk] Error checking for Clerk:', e);
    return false;
  }
};

// Create a helper function to get credentials that can be used in both places
const useSavedCredentials = () => {
  const { tempSignupEmail, tempSignupPassword, setTempSignupEmail, setTempSignupPassword } = useAuthContextHook();
  const { getValues } = useFormContext();
  
  const getCredentials = () => {
    const values = getValues();
    // Try context first, then form values
    const email = tempSignupEmail || values.email;
    const password = tempSignupPassword || values.password;
    
    // If we have form values but no context values, update context
    if (!tempSignupEmail && values.email) {
      setTempSignupEmail(values.email);
    }
    if (!tempSignupPassword && values.password) {
      setTempSignupPassword(values.password);
    }
    
    return { email, password };
  };
  
  return { getCredentials, setTempSignupEmail, setTempSignupPassword };
};

// Function to check if email exists in Clerk
const checkEmailExists = async (email: string) => {
  try {
    const response = await fetch('/api/auth/check-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to check email');
    }
    
    const data = await response.json();
    return data.exists;
  } catch (error) {
    console.error('Error checking email:', error);
    // If we can't check, assume it doesn't exist to allow registration attempt
    return false;
  }
};

// Function to delete an existing Clerk user by email
const deleteExistingUser = async (email: string) => {
  try {
    const response = await fetch('/api/auth/delete-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
};

// Separate component for Clerk functionality
// This component will only be rendered when we're ready to use Clerk
const ClerkFunctions = React.memo(({ 
  onClerkStatusChange,
  onSendOTP,
  onEmailValidation
}: { 
  onClerkStatusChange: (available: boolean, signUp: any, isLoaded: boolean) => void,
  onSendOTP: (email: string, password: string) => Promise<boolean>,
  onEmailValidation: (email: string, password: string) => Promise<boolean>
}) => {
  console.log('[ClerkFunctions] Component rendering - safe to use Clerk hooks here');
  
  // Use state to track if we've loaded Clerk
  const [clerkHooks, setClerkHooks] = useState<{
    signUp: any;
    isLoaded: boolean;
    clerk: any;
  } | null>(null);
  
  // First, load Clerk dynamically in an effect to avoid render-time issues
  useEffect(() => {
    const loadClerkHooks = async () => {
      try {
        // Dynamically import Clerk
        const clerkModule = await import('@clerk/nextjs');
        
        // Get the hooks, but don't call them yet
        console.log('[ClerkFunctions] Successfully imported Clerk module');
        
        // Now use the hooks after dynamic import
        const signUpHook = clerkModule.useSignUp();
        const clerkHook = clerkModule.useClerk();
        
        // Store the result - this will trigger a re-render
        setClerkHooks({
          signUp: signUpHook.signUp,
          isLoaded: signUpHook.isLoaded,
          clerk: clerkHook
        });
        
        console.log('[ClerkFunctions] Clerk hooks initialized:', {
          hasSignUp: !!signUpHook.signUp,
          isLoaded: signUpHook.isLoaded,
          hasClerk: !!clerkHook
        });
      } catch (error) {
        console.error('[ClerkFunctions] Error loading Clerk hooks:', error);
        setClerkHooks(null);
      }
    };
    
    // Execute the async function
    loadClerkHooks();
  }, []);
  
  // Notify parent of clerk status when hooks change
  useEffect(() => {
    if (clerkHooks) {
      const { signUp, isLoaded, clerk } = clerkHooks;
      
      console.log('[ClerkFunctions] Sending clerk status update:', {
        hasSignUp: !!signUp,
        isLoaded,
        hasClerk: !!clerk
      });
      
      const isAvailable = !!(signUp && isLoaded) || !!(clerk && clerk.client);
      onClerkStatusChange(isAvailable, signUp, isLoaded);
      
      // Expose methods on window only after hooks are available
      if (signUp && isLoaded) {
        // Set up OTP function
        window.sendClerkOTP = async (email: string, password: string) => {
          try {
            console.log('[ClerkFunctions] Sending OTP via Clerk');
            await signUp.create({
              emailAddress: email,
              password: password,
            });
            
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
            return true;
          } catch (error) {
            console.error('[ClerkFunctions] Error sending OTP:', error);
            return false;
          }
        };
        
        // Set up email validation function
        window.validateClerkEmail = async (email: string, password: string) => {
          try {
            console.log('[ClerkFunctions] Validating email via Clerk');
            await signUp.create({
              emailAddress: email,
              password: password,
            });
            return true;
          } catch (error: any) {
            if (error.errors?.[0]?.code === "form_identifier_exists") {
              console.log('[ClerkFunctions] Email already exists:', email);
              return { error: 'exists', message: 'Email already exists' };
            }
            return { error: 'unknown', message: error.errors?.[0]?.longMessage || 'Unknown error' };
          }
        };
      }
    }
    
    return () => {
      // Clean up window methods on unmount
      if (typeof window !== 'undefined') {
        delete window.sendClerkOTP;
        delete window.validateClerkEmail;
      }
    };
  }, [clerkHooks, onClerkStatusChange]);
  
  return null; // This is a non-visual component
});

ClerkFunctions.displayName = 'ClerkFunctions';

const ButtonHandler = () => {
  console.log('[ButtonHandler] Component rendering start');
  
  const { setCurrentStep, currentStep, tempSignupEmail, tempSignupPassword } = useAuthContextHook();
  const { formState, getFieldState, getValues, watch, setValue } = useFormContext();
  const { onGenerateOTP } = useSignUpForm();
  const { toast } = useToast();
  
  // States
  const [emailInUse, setEmailInUse] = useState('');
  const [isClearing, setIsClearing] = useState(false);
  const [isClerkAvailable, setIsClerkAvailable] = useState(false);
  
  // Call the hook at the top level of the component
  const { getCredentials, setTempSignupEmail, setTempSignupPassword } = useSavedCredentials();
  
  // Simplified Clerk status check
  useEffect(() => {
    const checkClerkAvailability = () => {
      // Check if Clerk appears to be available
      const maybeCan = typeof window !== 'undefined' && !!(window as any).Clerk;
      console.log('[ButtonHandler] Clerk availability check:', maybeCan);
      setIsClerkAvailable(maybeCan);
    };
    
    checkClerkAvailability();
    
    // Set up interval to recheck (to handle dynamic loading)
    const intervalId = setInterval(checkClerkAvailability, 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Debug logging
  useEffect(() => {
    console.log('[ButtonHandler] Context values updated:', { 
      tempSignupEmail, 
      tempSignupPassword, 
      currentStep,
      isClerkAvailable
    });
  }, [tempSignupEmail, tempSignupPassword, currentStep, isClerkAvailable]);
  
  // Helper function to send OTP
  const sendOTP = async () => {
    console.log('[sendOTP] Starting OTP send process');
    
    try {
      if (!isClerkAvailable) {
        console.log('[sendOTP] Clerk not available, skipping verification');
        toast({
          title: "Warning",
          description: "Email verification is not available. Your account will be created without verification.",
          variant: "default",
        });
        // Return true to allow continuing to the next step even without verification
        return true;
      }

      const { email, password } = getCredentials();
      console.log('[sendOTP] Sending OTP with credentials:', { email, hasPassword: !!password });

      if (!email || !password) {
        console.log('[sendOTP] Missing credentials');
        toast({
          title: "Error",
          description: "Email or password information is missing. Please go back to the account details step.",
          variant: "destructive",
        });
        return false;
      }

      try {
        // Use API endpoint instead of direct Clerk calls
        const response = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to send verification code');
        }
        
        console.log('[sendOTP] OTP sent successfully');
        return true;
      } catch (error: any) {
        console.error('[sendOTP] Error in sending OTP:', error);
        toast({
          title: "Authentication Error",
          description: error.message || "Failed to initialize verification. Please try again.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      console.error('[sendOTP] Error in sendOTP function:', error);
      toast({
        title: "Error",
        description: "Failed to send verification code. We'll continue without verification.",
        variant: "default",
      });
      return true; // Allow continuation even on error
    }
  };

  // Reset error state when going back to email step
  useEffect(() => {
    if (currentStep === 2) {
      setEmailInUse('')
    }
  }, [currentStep]);

  // Handle clearing an existing email 
  const handleClearEmail = async () => {
    if (!emailInUse) return
    
    setIsClearing(true)
    try {
      const success = await deleteExistingUser(emailInUse)
      if (success) {
        toast({
          title: "Success",
          description: "Email has been cleared. You can now try signing up again.",
        })
        setEmailInUse('')
      } else {
        toast({
          title: "Error",
          description: "Failed to clear email. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error clearing email:', error)
      toast({
        title: "Error",
        description: "Failed to clear email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsClearing(false)
    }
  }

  // Get field states for validation
  const { isDirty: isProducts } = getFieldState('products', formState)
  const { isDirty: isCategories } = getFieldState('categories', formState)
  const { isDirty: isTargetAudience } = getFieldState('targetAudience', formState)

  // Validation function for account details
  const validateAndContinue = async () => {
    console.log('[validateAndContinue] Starting validation');
    const values = getValues()
    const validationMessages = []

    if (!getFieldState('fullname', formState).isDirty) validationMessages.push("Please enter your full name")
    if (!getFieldState('email', formState).isDirty) validationMessages.push("Please enter your email")
    if (!getFieldState('confirmEmail', formState).isDirty) validationMessages.push("Please confirm your email")
    if (!getFieldState('password', formState).isDirty) validationMessages.push("Please enter your password")
    if (!getFieldState('confirmPassword', formState).isDirty) validationMessages.push("Please confirm your password")
    
    if (values.password !== values.confirmPassword) {
      validationMessages.push("Passwords do not match")
    }
    if (values.email !== values.confirmEmail) {
      validationMessages.push("Emails do not match")
    }

    if (formState.errors.password?.message) {
      validationMessages.push(formState.errors.password.message as string)
    }
    if (formState.errors.email?.message) {
      validationMessages.push(formState.errors.email.message as string)
    }

    if (validationMessages.length > 0) {
      console.log('[validateAndContinue] Validation errors:', validationMessages);
      toast({
        title: "Validation Error",
        description: (
          <ul className="list-disc pl-4">
            {validationMessages.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        ),
        variant: "destructive",
      })
      return
    }

    try {
      // Store credentials to use later
      const nextEmail = values.email;
      const nextPassword = values.password;
      
      console.log('[validateAndContinue] Starting email validation check');
      
      try {
        // Use API endpoint instead of direct Clerk calls
        const response = await fetch('/api/auth/validate-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: nextEmail, password: nextPassword }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          if (data.code === "form_identifier_exists") {
            console.log('[validateAndContinue] Email already in use:', nextEmail);
            setTimeout(() => {
              setEmailInUse(nextEmail)
            }, 0);
            
            toast({
              title: "Email already in use",
              description: "This email address is already registered. Please sign in or use a different email.",
              variant: "destructive",
            });
            return;
          } else {
            throw new Error(data.error || 'Failed to validate email');
          }
        }
        
        console.log('[validateAndContinue] Email validation successful');
        // Email is available
        setTimeout(() => {
          setTempSignupEmail(nextEmail);
          setTempSignupPassword(nextPassword);
          console.log('[validateAndContinue] Storing in context:', { email: nextEmail, password: '***' });
          
          // Move to next step after saving credentials
          setCurrentStep((prev: number) => prev + 1);
        }, 0);
      } catch (error: any) {
        console.error('[validateAndContinue] Error in email validation:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to validate email. Please try again.",
          variant: "destructive",
        });
        
        // Allow continuation even if validation fails
        setTimeout(() => {
          setTempSignupEmail(nextEmail);
          setTempSignupPassword(nextPassword);
          setCurrentStep((prev: number) => prev + 1);
        }, 0);
      }
    } catch (error: any) {
      console.error('[validateAndContinue] Error in overall validation process:', error);
      toast({
        title: "Error",
        description: "Failed to validate email. Please try again.",
        variant: "destructive",
      });
    }
  }

  // Type selection step (Step 1)
  if (currentStep === 1) {
    const userRole = watch('role')
    const canContinue = !!userRole
    
    return (
      <div className="w-full flex flex-col gap-3 items-center">
        <Button
          type="button"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors"
          disabled={!canContinue}
          onClick={() => {
            // Set default plan values
            setValue('selectedPlan', 'starter')
            setValue('hasPaid', true)
            // Move to account details step - defer state update
            setTimeout(() => {
              setCurrentStep(2)
            }, 0);
          }}
        >
          Continue
        </Button>
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link
            href="/auth/sign-in"
            className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Sign In
          </Link>
        </p>
      </div>
    )
  }

  // Account details step (Step 2)
  if (currentStep === 2) {
    const { isDirty: isName } = getFieldState('fullname', formState)
    const { isDirty: isEmail } = getFieldState('email', formState)
    const { isDirty: isConfirmEmail } = getFieldState('confirmEmail', formState)
    const { isDirty: isPassword } = getFieldState('password', formState)
    const { isDirty: isConfirmPassword } = getFieldState('confirmPassword', formState)
    const { errors } = formState

    const hasErrors = Object.keys(errors).length > 0
    const canContinue = isName && isEmail && isConfirmEmail && isPassword && isConfirmPassword && !hasErrors

    return (
      <div className="w-full flex flex-col gap-3 items-center">
        <Button
          type="button"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={validateAndContinue}
        >
          Continue
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            // Defer state update to avoid React errors
            setTimeout(() => {
              setCurrentStep((prev: number) => prev - 1);
            }, 0);
          }}
        >
          Back
        </Button>
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link
            href="/auth/sign-in"
            className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Sign In
          </Link>
        </p>
      </div>
    )
  }

  // Business questions step (Step 3)
  if (currentStep === 3) {
    const canContinue = isProducts && isCategories && isTargetAudience
    return (
      <div className="w-full flex flex-col gap-3 items-center">
        <Button
          type="button"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors"
          disabled={!canContinue}
          onClick={() => {
            // Defer state update
            setTimeout(() => {
              setCurrentStep((prev: number) => prev + 1)
            }, 0);
          }}
        >
          Continue
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            // Defer state update
            setTimeout(() => {
              setCurrentStep((prev: number) => prev - 1)
            }, 0);
          }}
        >
          Back
        </Button>
      </div>
    )
  }

  // Dashboard preferences step (Step 4)
  if (currentStep === 4) {
    const dashboard = watch('dashboard')
    const canContinue = !!dashboard
    return (
      <div className="w-full flex flex-col gap-3 items-center">
        <Button
          type="button"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors"
          disabled={!canContinue}
          onClick={async () => {
            // Attempt to send OTP
            const success = await sendOTP();
            if (success) {
              // Defer state update to avoid React errors
              setTimeout(() => {
                setCurrentStep((prev: number) => prev + 1);
              }, 0);
            }
          }}
        >
          Continue
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            // Defer state update to avoid React errors
            setTimeout(() => {
              setCurrentStep((prev: number) => prev - 1);
            }, 0);
          }}
        >
          Back
        </Button>
      </div>
    )
  }

  // OTP verification step (Step 5)
  if (currentStep === 5) {
    const otp = watch('otp')
    const canContinue = otp && otp.length === 6
    return (
      <div className="w-full flex flex-col gap-3 items-center">
        <Button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors"
          disabled={!canContinue}
        >
          Complete Sign Up
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            // Defer state update
            setTimeout(() => {
              setCurrentStep((prev: number) => prev - 1)
            }, 0);
          }}
        >
          Back
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={async () => {
            // Resend OTP code
            await sendOTP();
            toast({
              title: "Code Sent",
              description: "A new verification code has been sent to your email.",
            });
          }}
        >
          Resend Code
        </Button>
      </div>
    )
  }

  // Default case
  return (
    <div className="w-full flex flex-col gap-3 items-center">
      <p className="text-gray-600">
        Already have an account?{' '}
        <Link
          href="/auth/sign-in"
          className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          Sign In
        </Link>
      </p>
    </div>
  )
}

export default ButtonHandler
