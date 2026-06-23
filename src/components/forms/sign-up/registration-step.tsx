'use client'

import { UserRole } from '@prisma/client'
import { useAuthContextHook } from '@/context/use-auth-context'
import React, { useState, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import TypeSelectionForm from './type-selection-form'
import dynamic from 'next/dynamic'
import { Spinner } from '@/components/spinner'
import { Button } from '@/components/ui/button'
import { useSignUpForm, processArrayField } from '@/hooks/sign-up/use-sign-up'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { useSignUp } from '@clerk/nextjs'

// Import all form components using dynamic imports
const DetailForm = dynamic(() => import('./account-details-form'), {
  ssr: false,
  loading: () => <Spinner noPadding />,
})

const PlanSelectionStep = dynamic(() => import('./plan-selection-step'), {
  ssr: false,
  loading: () => <Spinner noPadding />,
})

const PaymentStep = dynamic(() => import('./payment-step'), {
  ssr: false,
  loading: () => <Spinner noPadding />,
})

const OTPForm = dynamic(() => import('./otp-form'), {
  ssr: false,
  loading: () => <Spinner noPadding />,
})

const BusinessQuestions = dynamic(() => import('./business-questions-form'), {
  ssr: false,
  loading: () => <Spinner noPadding />,
})

const CompanyCodeForm = dynamic(() => import('./company-code-form'), {
  ssr: false,
  loading: () => <Spinner noPadding />,
})

const RegistrationFormStep = () => {
  const { toast } = useToast()
  const {
    register,
    formState: { errors },
    setValue,
    watch,
    handleSubmit,
    getValues,
  } = useFormContext()
  const { currentStep, setCurrentStep } = useAuthContextHook()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { onGenerateOTP } = useSignUpForm()
  
  // Form values
  const userRole = watch('role')
  const email = watch('email')
  const password = watch('password')
  const confirmPassword = watch('confirmPassword')
  const fullname = watch('fullname')
  const products = watch('products')
  const categories = watch('categories')
  const otp = watch('otp')
  const selectedPlan = watch('selectedPlan')
  
  // Company code state
  const [companyCode, setCompanyCode] = useState('')
  const [validTeamId, setValidTeamId] = useState<string | null>(null)
  const [isCodeValid, setIsCodeValid] = useState(false)
  
  // OTP timer state
  const [resendTimer, setResendTimer] = useState(0)
  const [canResendOTP, setCanResendOTP] = useState(true)
  
  // Step validation state
  const [isStepValid, setIsStepValid] = useState(true)
  const [hasShownMismatchToast, setHasShownMismatchToast] = useState(false)
  
  const router = useRouter()
  const { signUp, setActive } = useSignUp()

  // Initialize form defaults
  useEffect(() => {
    const currentValues = getValues();
    if (!currentValues.role) setValue('role', UserRole.OWNER);
    
    if (!currentValues.selectedPlan) {
      setValue('selectedPlan', '');
    } else {
      // If a plan is already selected (from URL), update the current step
      // to skip plan selection step later
      console.log('Plan already selected:', currentValues.selectedPlan);
    }
    if (currentValues.hasPaid === undefined) {
      setValue('hasPaid', currentValues.selectedPlan ? false : true);
    }
  }, [setValue, getValues]);
  
  // Set initial step based on preselected plan
  useEffect(() => {
    if (currentStep === 1 && selectedPlan) {
      console.log('Setting initial step with preselected plan:', selectedPlan);
      // We'll still let the user go through the normal flow, but the plan selection
      // step will be skipped when they reach that point
    }
  }, [currentStep, selectedPlan]);

  // Password match check
  useEffect(() => {
    if (currentStep === 2 && password && confirmPassword) {
      if (password !== confirmPassword && !hasShownMismatchToast) {
        toast({
          title: "Passwords Don't Match",
          description: "Please make sure your passwords match.",
          variant: "destructive"
        });
        setHasShownMismatchToast(true);
      } else if (password === confirmPassword && hasShownMismatchToast) {
        setHasShownMismatchToast(false);
      }
    }
  }, [password, confirmPassword, currentStep, toast, hasShownMismatchToast]);

  // OTP timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prevTimer) => {
          if (prevTimer <= 1) {
            setCanResendOTP(true);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [resendTimer]);

  // Resend OTP function
  const handleResendOTP = async () => {
    if (!canResendOTP || resendTimer > 0) return;
    
    try {
      const values = getValues();
      const email = values.email || '';
      const password = values.password || '';
      
      if (!email || !password) {
        toast({
          title: "Error",
          description: "Email and password are required to resend verification code.",
          variant: "destructive"
        });
        return;
      }

      setCanResendOTP(false);
      setResendTimer(60);
      
      if (signUp) {
        await signUp.prepareEmailAddressVerification({
          strategy: "email_code"
        });
        
        toast({
          title: "Verification Code Sent",
          description: "A new verification code has been sent to your email",
        });
      } else {
        throw new Error("Authentication service not available");
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      setCanResendOTP(true);
      setResendTimer(0);
      
      toast({
        title: "Error",
        description: "Failed to send new verification code. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Debug helper
  const logFormSubmission = () => {
    try {
      console.log('===== FORM SUBMISSION DEBUG =====');
      const values = getValues();
      console.log('Email:', values.email || 'undefined');
      console.log('Full Name:', values.fullname || 'undefined');
      console.log('OTP:', values.otp || 'undefined');
      console.log('Role:', values.role || 'undefined');
      console.log('Products:', values.products || 'undefined');
      console.log('Categories:', values.categories || 'undefined');
      console.log('Target Audience:', values.targetAudience || 'undefined');
      console.log('Plan:', values.selectedPlan || 'undefined');
      console.log('================================');
    } catch (error) {
      console.error('Error logging form values:', error);
    }
  }

  // 1. Verify OTP only - don't create user yet
  const verifyOTP = handleSubmit(async (data) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      console.log('====== OTP VERIFICATION STARTED =====');
      
      if (!data.otp || data.otp.length !== 6) {
        toast({
          title: "Verification Error",
          description: "Please enter the 6-digit verification code from your email",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      if (!signUp) {
        console.error('Clerk signUp is not available');
        toast({
          title: "Error",
          description: "Authentication service not loaded properly",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      console.log('Verifying OTP code:', data.otp);
      
      try {
        const completeSignUp = await signUp.attemptEmailAddressVerification({
          code: data.otp,
        });
        
        console.log('OTP verification response:', completeSignUp.status);

        if (completeSignUp.status !== 'complete') {
          console.error('OTP verification failed. Status:', completeSignUp.status);
          toast({
            title: 'Error',
            description: 'Invalid verification code. Please try again.',
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }

        console.log('OTP verification successful. User ID:', completeSignUp.createdUserId);
        
        // Store clerk user ID and session ID for later use after payment
        setValue('clerkUserId', completeSignUp.createdUserId);
        setValue('clerkSessionId', completeSignUp.createdSessionId);
        
        // Get current plan value directly from form
        const currentPlan = getValues().selectedPlan || '';
        const isPaidPlan = currentPlan.toUpperCase() !== 'STANDARD';
        
        console.log('=== OTP VERIFICATION SUCCESSFUL ===');
        console.log('Selected plan:', currentPlan);
        console.log('Is paid plan:', isPaidPlan);
        
        if (isPaidPlan) {
          // PAID PLAN - Go to payment step
          console.log('Proceeding to payment step (step 6)');
          toast({
            title: "Almost done!",
            description: "Please complete your payment to finish setup.",
          });
          
          // Force to step 6 (payment)
          setCurrentStep(6);
        } else {
          // FREE PLAN - Complete registration directly
          console.log('Free plan - completing registration without payment');
          toast({
            title: "Creating your account",
            description: "Setting up your account...",
          });
          
          // Complete registration for free plan
          await completeRegistration();
        }
      } catch (otpError) {
        console.error('OTP verification error:', otpError);
        toast({
          title: "Verification Error",
          description: otpError instanceof Error ? otpError.message : "Failed to verify code",
          variant: "destructive"
        });
      } finally {
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast({
        title: "Verification Error",
        description: error instanceof Error ? error.message : "Failed to verify code",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  });
  
  // 2. Complete registration - create user in database
  const completeRegistration = async () => {
    try {
      setIsSubmitting(true);
      console.log('====== COMPLETING REGISTRATION =====');
      logFormSubmission();
      
      const data = getValues();
      const processedProducts = processArrayField(data.products);
      const processedCategories = processArrayField(data.categories);
      
      // Get clerk IDs stored from OTP verification
      const clerkUserId = data.clerkUserId;
      const clerkSessionId = data.clerkSessionId;
      
      if (!clerkUserId) {
        throw new Error('Missing Clerk user ID. Please try again.');
      }

      console.log('Starting API call to /api/auth/complete-registration');
      const response = await fetch('/api/auth/complete-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullname: data.fullname,
          clerkId: clerkUserId,
          role: data.role,
          products: processedProducts,
          categories: processedCategories,
          targetAudience: data.targetAudience || null,
          email: data.email,
          selectedPlan: data.selectedPlan || 'starter',
          teamId: data.role === 'MEMBER' ? data.teamId : null,
        }),
      });

      console.log('API response received with status:', response.status);
      
      if (!response.ok) {
        let errorDetail = '';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorDetail = errorData.error || 'Unknown server error';
            console.error('API error details:', errorData);
          } else {
            errorDetail = await response.text().then(text => 
              text.length > 100 ? `${text.substring(0, 100)}...` : text
            );
            console.error('API non-JSON error response type:', contentType);
            console.error('API non-JSON error preview:', errorDetail);
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorDetail = `HTTP ${response.status} - Failed to parse error details`;
        }

        throw new Error(`Registration failed: ${errorDetail}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('API returned non-JSON content type:', contentType);
        const textPreview = await response.text().then(text => 
          text.length > 100 ? `${text.substring(0, 100)}...` : text
        );
        console.error('Non-JSON response preview:', textPreview);
        throw new Error('Server returned HTML instead of JSON. This is usually caused by middleware redirects.');
      }
      
      const result = await response.json();
      console.log('API response parsed successfully:', result);
      
      if (!result.user) {
        console.error('API response missing user data:', result);
        throw new Error(result.error || 'Registration failed: No user data returned');
      }
      
      console.log('User created successfully:', result.user.id);
      
      // Set the Clerk session active
      try {
        console.log('Attempting to activate session:', clerkSessionId);
        if (setActive && clerkSessionId) {
          await setActive({
            session: clerkSessionId,
          });
          console.log('Session activated successfully');
        } else {
          if (!setActive) console.warn('setActive function is undefined');
          if (!clerkSessionId) console.warn('No session ID was created during registration');
        }
      } catch (sessionError) {
        console.error('Failed to activate session:', sessionError);
        toast({
          title: "Session Warning",
          description: "Session could not be activated, you may need to sign in after registration.",
          variant: "destructive"
        });
      }

      console.log('Registration completed successfully');
      toast({
        title: "Success!",
        description: "Account created successfully. Redirecting to conversations...",
      });
      
      // Redirect to dashboard after successful registration
      router.push('/conversation');
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Error",
        description: error instanceof Error ? error.message : "Failed to complete registration",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigation helpers
  const moveToNextStep = () => {
    if (validateStep()) {
      const nextStep = currentStep + 1
      console.log(`Moving from step ${currentStep} to step ${nextStep}`)
      setCurrentStep(nextStep)
    }
  }

  const moveToPreviousStep = () => {
    let prevStep = currentStep - 1;
    
    if (currentStep === 6) {
      // From payment back to OTP verification
      prevStep = 5;
    } else if (currentStep === 5) {
      // From OTP back to business questions / company code
      prevStep = 4;
    } else if (currentStep === 4) {
      // From business questions step considering skipped steps
      if (shouldSkipPlanSelection()) {
        // If plan selection was skipped, go back to account details
        prevStep = 2;
      } else {
        // Otherwise, go back to plan selection
        prevStep = 3;
      }
    }
    
    if (prevStep >= 1) {
      console.log(`Moving from step ${currentStep} to step ${prevStep}`);
      setCurrentStep(prevStep);
    }
  }

  // Validation logic
  const validateStep = () => {
    let validationResult = true;
    let validationMessage = '';
    
    switch (currentStep) {
      case 1:
        // User type selection
        validationResult = true;
        break;
        
      case 2:
        // Account details
        const emailValid = !!email && email.includes('@');
        const passwordValid = !!password && password.length >= 6;
        const nameValid = !!fullname && fullname.trim().length > 0;
        const passwordsMatchValid = password === confirmPassword;
        
        const missingFields = [];
        if (!emailValid) missingFields.push('valid email');
        if (!passwordValid) missingFields.push('password (min 6 characters)');
        if (!nameValid) missingFields.push('full name');
        
        validationResult = emailValid && passwordValid && nameValid && passwordsMatchValid;
        
        if (!passwordsMatchValid) {
          validationMessage = 'Passwords do not match';
        } else if (missingFields.length > 0) {
          validationMessage = `Please provide: ${missingFields.join(', ')}`;
        }
        break;
        
      case 3:
        // Plan selection
        const planValid = !!selectedPlan;
        validationResult = planValid;
        
        if (!planValid) {
          validationMessage = 'Please select a plan';
        }
        break;
        
      case 4:
        // Business questions or Company Code
        if (userRole === UserRole.OWNER) {
          const processedProducts = processArrayField(products);
          const processedCategories = processArrayField(categories);
          
          const productsValid = processedProducts.length > 0;
          const categoriesValid = processedCategories.length > 0;
          
          validationResult = productsValid && categoriesValid;
          
          const missingBusinessFields = [];
          if (!productsValid) missingBusinessFields.push('products');
          if (!categoriesValid) missingBusinessFields.push('categories');
          
          if (missingBusinessFields.length > 0) {
            validationMessage = `Please add: ${missingBusinessFields.join(', ')}`;
          }
        } else {
          const companyCodeValid = !!companyCode && companyCode.trim().length > 0 && isCodeValid && !!validTeamId;
          validationResult = companyCodeValid;
          
          if (!companyCodeValid) {
            validationMessage = 'Please enter the company code';
          }
        }
        break;
        
      case 5:
        // OTP verification
        const otpValid = !!otp && otp.length === 6;
        validationResult = otpValid;
        
        if (!otpValid) {
          validationMessage = 'Please enter the 6-digit verification code';
        }
        break;
        
      case 6:
        // Payment step
        validationResult = true;
        break;
        
      default:
        validationResult = true;
    }
    
    if (!validationResult && validationMessage) {
      toast({
        title: 'Required Fields',
        description: validationMessage,
        variant: 'destructive',
      });
    }
    
    return validationResult;
  };

  // Update step validation
  useEffect(() => {
    let valid = true;
    
    switch (currentStep) {
      case 1:
        valid = true;
        break;
      case 2:
        valid = !!email && email.includes('@') && 
                !!password && password.length >= 6 && 
                !!fullname && fullname.trim().length > 0 &&
                (password === confirmPassword);
        break;
      case 3:
        valid = !!selectedPlan;
        break;
      case 4:
        if (userRole === UserRole.OWNER) {
          const processedProducts = processArrayField(products);
          const processedCategories = processArrayField(categories);
          valid = processedProducts.length > 0 && processedCategories.length > 0;
        } else {
          valid = !!companyCode && companyCode.trim().length > 0 && isCodeValid && !!validTeamId;
        }
        break;
      case 5:
        valid = !!otp && otp.length === 6;
        break;
      case 6:
        valid = true;
        break;
    }
    
    setIsStepValid(valid);
  }, [currentStep, email, password, confirmPassword, fullname, products, categories, userRole, otp, companyCode, isCodeValid, validTeamId]);

  // Step transitions
  const handleBusinessQuestionsNext = async () => {
    if (validateStep()) {
      const values = getValues();
      await onGenerateOTP(values.email, values.password, () => {});
      setCurrentStep(5);
    }
  };

  const handleCompanyCodeNext = async () => {
    if (!isCodeValid || !validTeamId) {
      toast({
        title: "Invalid Company Code",
        description: "Please enter a valid company code to continue",
        variant: "destructive"
      });
      return;
    }

    if (validateStep()) {
      setValue('teamId', validTeamId);
      const values = getValues();
      await onGenerateOTP(values.email, values.password, () => {});
      setCurrentStep(5);
    }
  };

  // Helper functions
  const shouldSkipPlanSelection = () => {
    return !!selectedPlan && selectedPlan !== '';
  };

  const shouldSkipPayment = () => {
    if (!selectedPlan) {
      console.log('shouldSkipPayment: No plan selected, returning true');
      return true;
    }
    
    const normalizedPlan = selectedPlan.trim().toUpperCase();
    const isFreePlan = normalizedPlan === 'STANDARD';
    
    console.log('shouldSkipPayment check:', {
      originalPlan: selectedPlan,
      normalizedPlan,
      isFreePlan
    });
    
    return isFreePlan;
  };

  const getNextStepAfterAccountDetails = () => {
    if (userRole === UserRole.MEMBER) {
      return 4;
    }

    if (shouldSkipPlanSelection()) {
      return 4;
    }

    return 3;
  };

  const getNextStepAfterPlanSelection = () => {
    return 4;
  };

  // Step content
  let stepContent = null;

  switch (currentStep) {
    case 1:
      stepContent = (
        <div className="flex flex-col items-center w-full">
          <TypeSelectionForm
            register={register}
            userType={userRole}
            setUserType={(role) => setValue('role', role)}
            setValue={setValue}
          />
          <div className="flex flex-col items-center gap-3 mt-6 w-full max-w-[220px]">
            <Button
              type="button"
              onClick={moveToNextStep}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={!isStepValid}
            >
              Continue
            </Button>
          </div>
        </div>
      )
      break
      
    case 2:
      stepContent = (
        <div className="flex flex-col items-center w-full">
          <DetailForm errors={errors} />
          <div className="flex flex-col items-center gap-3 mt-6 w-full max-w-[220px]">
            <Button
              type="button"
              onClick={() => {
                if (validateStep()) {
                  const nextStep = getNextStepAfterAccountDetails();
                  setCurrentStep(nextStep);
                }
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={!isStepValid}
            >
              Continue
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={moveToPreviousStep}
              className="w-full"
            >
              Back
            </Button>
          </div>
        </div>
      )
      break
      
    case 3:
      stepContent = (
        <div className="flex flex-col items-center w-full">
          <PlanSelectionStep
            selectedPlan={selectedPlan}
            onPlanSelect={(planId) => setValue('selectedPlan', planId)}
            onContinue={() => {
              if (validateStep()) {
                const nextStep = getNextStepAfterPlanSelection();
                setCurrentStep(nextStep);
              }
            }}
            onBack={moveToPreviousStep}
          />
        </div>
      )
      break
      
    case 4:
      if (userRole === UserRole.OWNER) {
        stepContent = (
          <div className="flex flex-col items-center w-full">
            <BusinessQuestions
              errors={errors}
              register={register}
              setValue={setValue}
            />
            <div className="flex flex-col items-center gap-3 mt-6 w-full max-w-[220px]">
              <Button
                type="button"
                onClick={() => {
                  const values = getValues();
                  setValue('products', processArrayField(values.products));
                  setValue('categories', processArrayField(values.categories));
                  handleBusinessQuestionsNext();
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={!isStepValid}
              >
                Continue
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={moveToPreviousStep}
                className="w-full"
              >
                Back
              </Button>
            </div>
          </div>
        )
      } else {
        stepContent = (
          <div className="flex flex-col items-center w-full">
            <CompanyCodeForm
              errors={errors}
              companyCode={companyCode}
              setCompanyCode={setCompanyCode}
              setTeamId={setValidTeamId}
              onValidCodeFound={setIsCodeValid}
            />
            <div className="flex flex-col items-center gap-3 mt-6 w-full max-w-[220px]">
              <Button
                type="button"
                onClick={handleCompanyCodeNext}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={!isStepValid || !isCodeValid}
              >
                Continue
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={moveToPreviousStep}
                className="w-full"
              >
                Back
              </Button>
            </div>
          </div>
        )
      }
      break
      
    case 5:
      stepContent = (
        <div className="flex flex-col items-center w-full">
          <OTPForm
            onOTP={typeof otp === 'string' ? otp : ''}
            setOTP={(value) => {
              if (typeof value === 'string') {
                setValue('otp', value);
              }
            }}
          />
          <div className="flex flex-col items-center gap-3 mt-6 w-full max-w-[220px]">
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                console.log("Submit OTP button clicked");
                if (validateStep()) {
                  verifyOTP();
                }
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={!isStepValid || isSubmitting}
            >
              {isSubmitting ? <div className="mr-2"><Spinner /></div> : (shouldSkipPayment() ? "Complete Sign Up" : "Continue to Payment")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleResendOTP}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || !canResendOTP || resendTimer > 0}
            >
              {resendTimer > 0 ? `Resend Code (${resendTimer}s)` : "Resend Code"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={moveToPreviousStep}
              className="w-full"
              disabled={isSubmitting}
            >
              Back
            </Button>
          </div>
        </div>
      )
      break
      
    case 6:
      console.log('=== RENDERING PAYMENT STEP ===');
      console.log('Current selected plan:', selectedPlan);
      
      // Check if we have a valid plan
      if (!selectedPlan || selectedPlan.trim() === '') {
        console.error('No plan selected when reaching payment step!');
        stepContent = (
          <div className="flex flex-col items-center w-full">
            <div className="text-center p-4">
              <h3 className="text-lg font-semibold text-red-600 mb-2">
                Payment Error
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No plan selected. Please go back and select a plan.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={moveToPreviousStep}
                className="w-full max-w-[220px]"
              >
                Go Back
              </Button>
            </div>
          </div>
        );
      } else {
        stepContent = (
          <div className="flex flex-col items-center w-full">
            <PaymentStep
              selectedPlan={selectedPlan}
              onSuccess={async () => {
                console.log('=== PAYMENT SUCCESSFUL ===');
                console.log('Payment completed, now completing registration');
                
                // Mark as paid in the form
                setValue('hasPaid', true);
                
                // Complete the registration process after successful payment
                await completeRegistration();
              }}
              onBack={moveToPreviousStep}
            />
          </div>
        )
      }
      break
      
    default:
      stepContent = (
        <div className="flex flex-col items-center w-full">
          <p>Unknown step</p>
        </div>
      )
  }

  return (
    <div className="w-full min-h-[450px] flex flex-col">
      <div className="flex-1 flex flex-col justify-center">
        {stepContent}
      </div>
    </div>
  )
}

export default RegistrationFormStep