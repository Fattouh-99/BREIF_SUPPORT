'use client'
import { UserRole } from '@prisma/client'
import { useToast } from '@/components/ui/use-toast'
import {
  UserRegistrationProps,
  UserRegistrationSchema,
} from '@/schemas/auth.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSignUp as useClerkSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuthContextHook } from '@/context/use-auth-context'

// Improved helper function to process array fields with better validation
export const processArrayField = (value: any): string[] => {
  // Handle null, undefined or empty values
  if (value === null || value === undefined) return [];
  
  // If it's already an array, filter out invalid items
  if (Array.isArray(value)) {
    return value
      .map(item => item?.toString()?.trim())
      .filter(item => item !== null && item !== undefined && item !== '');
  }
  
  // If it's a string, split by commas and trim each item
  if (typeof value === 'string') {
    return value
      .split(',')
      .map(item => item.trim())
      .filter(item => item !== '');
  }
  
  // For any other type that can be reasonably converted to string
  const strValue = String(value).trim();
  return strValue ? [strValue] : [];
}

// Type for the SignUp object from Clerk
type ClerkSignUpType = ReturnType<typeof useClerkSignUp>['signUp'];

// Always use the real Clerk hook
const useSignUp = useClerkSignUp;

// Type for the server action response
type ServerActionResponse = {
  status: number;
  user?: any;
  error?: string;
};

export const useSignUpForm = () => {
  const { toast } = useToast()
  const [loading, setLoading] = useState<boolean>(false)
  const { signUp, isLoaded, setActive } = useSignUp()
  const { tempSignupEmail, setTempSignupEmail, tempSignupPassword, setTempSignupPassword } = useAuthContextHook()
  const router = useRouter()
  const methods = useForm<UserRegistrationProps>({
    resolver: zodResolver(UserRegistrationSchema),
    defaultValues: {
      role: UserRole.OWNER,
      selectedPlan: 'starter',
      hasPaid: true,
      products: '',
      categories: '',
      targetAudience: ''
    },
    mode: 'onChange',
  })

  const onGenerateOTP = async (
    email: string,
    password: string,
    onNext: React.Dispatch<React.SetStateAction<number>>
  ) => {
    console.log('onGenerateOTP called with:', { email });
    
    if (!isLoaded || !signUp) {
      toast({
        title: 'Error',
        description: 'Authentication service not available',
        variant: 'destructive'
      })
      return
    }

    // Validate email and password
    if (!email || !email.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please provide a valid email address',
        variant: 'destructive'
      })
      return
    }

    if (!password || password.length < 6) {
      toast({
        title: 'Invalid Password',
        description: 'Password must be at least 6 characters',
        variant: 'destructive'
      })
      return
    }

    try {
      // Show loading state
      setLoading(true)
      
      // Store email and password in context state
      setTempSignupEmail(email)
      setTempSignupPassword(password)

      // Create the Clerk user first
      const clerkSignUp = await signUp.create({
        emailAddress: email,
        password,
      })

      if (clerkSignUp.status !== 'complete') {
        // Send the verification code
        await signUp.prepareEmailAddressVerification({
          strategy: "email_code"
        })
        
        toast({
          title: 'Verification Code Sent',
          description: 'Please check your email for the verification code',
        })
        
        // Move to OTP step (step 4 now since dashboard step was removed)
        onNext(4);
      } else {
        // This would be unusual, but handle the case where signup was instantly complete
        toast({
          title: 'Success',
          description: 'Account created successfully',
        })
        onNext(4);
      }
    } catch (error: any) {
      console.error('Clerk signup error:', error)
      
      // Improved error handling with specific messages
      if (error.errors && error.errors.length > 0) {
        const clerError = error.errors[0];
        
        // Handle known Clerk error codes
        if (clerError.code === 'form_identifier_exists') {
          toast({
            title: 'Email Already Registered',
            description: 'This email address is already in use. Please sign in instead.',
            variant: 'destructive'
          })
        } else if (clerError.code === 'form_password_pwned') {
          toast({
            title: 'Insecure Password',
            description: 'This password has been exposed in a data breach. Please choose a more secure password.',
            variant: 'destructive'
          }) 
        } else {
          toast({
            title: 'Error',
            description: clerError.longMessage || clerError.message || "An error occurred",
            variant: 'destructive'
          })
        }
      } else {
        toast({
          title: 'Error',
          description: error.message || "An error occurred",
          variant: 'destructive'
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const onHandleSubmit = methods.handleSubmit(
    async (values: UserRegistrationProps) => {
      try {
        setLoading(true)
        
        // Check if registration is enabled in system settings
        try {
          const response = await fetch('/api/system-settings')
          if (response.ok) {
            const data = await response.json()
            if (data.success && data.data) {
              // If registration is disabled, show error and return
              if (!data.data.registrationEnabled) {
                toast({
                  title: 'Registration Disabled',
                  description: 'New user registration is currently disabled by the administrator.',
                  variant: 'destructive',
                })
                router.push('/auth/registration-disabled')
                return
              }

              // If maintenance mode is on, redirect to maintenance page
              if (data.data.maintenanceMode) {
                router.push('/maintenance')
                return
              }
            }
          }
        } catch (error) {
          console.error('Error checking system settings:', error)
        }
        
        // Get email/password from either context or form values
        const emailToUse = tempSignupEmail || values.email;
        const passwordToUse = tempSignupPassword || values.password;
        
        if (!emailToUse || !passwordToUse) {
          toast({
            title: 'Error',
            description: 'Missing email or password. Please try again.',
          })
          setLoading(false);
          return;
        }

        // Check if Clerk is loaded and signUp is available
        if (!isLoaded || !signUp) {
          setLoading(false);
          toast({
            title: 'Error',
            description: 'Authentication service not loaded.',
          });
          return;
        }
        
        // Ensure all users have a plan selected
        if (!values.selectedPlan) {
          values.selectedPlan = 'starter';
        }
        
        // Mark as paid - no payment required
        values.hasPaid = true;
        
        try {
          // Get the signUp object (we've already checked it exists)
          const signUpObj = signUp as NonNullable<ClerkSignUpType>;
          
          // Verify the OTP code
          const completeSignUp = await signUpObj.attemptEmailAddressVerification({
            code: values.otp,
          })
          
          if (completeSignUp.status !== 'complete') {
            toast({
              title: 'Error',
              description: 'Invalid verification code. Please try again.',
            })
            setLoading(false)
            return
          }

          // Now that Clerk registration is complete, update the user in our database with form data
          if (completeSignUp.createdUserId) {
            console.log('Calling API to complete registration');
            
            try {
              console.log('Making API call to complete registration with:', {
                fullname: values.fullname,
                clerkId: completeSignUp.createdUserId,
                role: values.role,
                products: values.products?.length || 0,
                categories: values.categories?.length || 0,
                targetAudience: !!values.targetAudience,
                // dashboard preference removed
                email: emailToUse,
                selectedPlan: values.selectedPlan,
              });
              
              // Call the API endpoint to complete registration
              const formData = {
                fullname: values.fullname,
                clerkId: completeSignUp.createdUserId,
                role: values.role,
                // Process products and categories to ensure they're proper arrays
                products: processArrayField(values.products || ''),
                categories: processArrayField(values.categories || ''),
                targetAudience: values.targetAudience || null,
                // dashboard preference removed
                email: emailToUse,
                selectedPlan: values.selectedPlan || 'starter',
              };
              
              console.log('Registration payload:', formData);
              
              const response = await fetch('/api/auth/complete-registration', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
              });
              
              // Check if response is JSON
              const contentType = response.headers.get('content-type');
              if (!contentType || !contentType.includes('application/json')) {
                const textResponse = await response.text();
                console.error('Non-JSON response received:', textResponse);
                
                // Extract possible error message from HTML
                let errorMessage = 'Server returned non-JSON response';
                try {
                  // Try to extract error message from Next.js error page
                  if (textResponse.includes('Error:')) {
                    const errorStart = textResponse.indexOf('Error:');
                    const errorEnd = textResponse.indexOf('</div>', errorStart);
                    if (errorStart > 0 && errorEnd > errorStart) {
                      errorMessage = textResponse.substring(errorStart, errorEnd).trim();
                    }
                  }
                } catch (e) {
                  console.error('Failed to extract error message from HTML:', e);
                }
                
                throw new Error(`${errorMessage}. Check server logs.`);
              }
              
              const result = await response.json();
              
              if (!response.ok) {
                throw new Error(result.error || 'Failed to complete registration');
              }
              
              console.log('Registration completed via API:', result);
              
              // Set the user as active in Clerk
              try {
                console.log('Setting active session with sessionId:', completeSignUp.createdSessionId);
                
                // Set the active session
                if (completeSignUp.createdSessionId) {
                  await setActive({ session: completeSignUp.createdSessionId });
                  console.log('Successfully set active session');
                } else {
                  console.error('No session ID was created during signup');
                }
                
                // Clear form data
                setTempSignupEmail('');
                setTempSignupPassword('');
                
                // Show success message
                toast({
                  title: 'Registration successful',
                  description: 'Your account has been created successfully.'
                });
                
                // No longer redirect to dashboard here, let the registration-step component
                // handle next steps (show payment step for paid plans or redirect for free plans)
                console.log('Registration complete, letting component handle the next step');
                
                // Success at this point but don't redirect - registration-step will handle next steps
              } catch (error) {
                console.error('Failed to set active session:', error);
                setLoading(false);
                toast({
                  title: 'Session Error',
                  description: 'Unable to initialize your session. Please try signing in again.',
                  variant: 'destructive'
                });
              }
              
            } catch (error: any) {
              console.error('API error during registration:', error);
              setLoading(false);
              toast({
                title: 'Registration Error',
                description: error.message || 'Failed to complete registration. Please try again.',
                variant: 'destructive'
              });
            }
          } else {
            setLoading(false);
            toast({
              title: 'Authentication Error',
              description: 'Failed to complete Clerk authentication',
              variant: 'destructive'
            });
          }
        } catch (error: any) {
          setLoading(false);
          console.error('OTP verification error:', error);
          toast({
            title: 'Verification Error',
            description: error.message || 'Something went wrong during verification. Please try again.',
            variant: 'destructive'
          });
        }
      } catch (error: any) {
        setLoading(false);
        console.error('Form submission error:', error);
        toast({
          title: 'Form Error',
          description: error.message || 'Something went wrong with the form submission. Please try again.',
          variant: 'destructive'
        });
      }
    }
  );

  return {
    methods,
    onHandleSubmit,
    onGenerateOTP,
    loading,
  }
}
