'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Loader } from '@/components/loader'
import PaymentSuccess from '@/components/ui/payment-success'
import { UseFormSetValue } from 'react-hook-form'
import { useAuthContextHook } from '@/context/use-auth-context'

// Initialize Stripe just once, outside the component
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISH_KEY || '')

export type StripePaymentFormProps = {
  selectedPlan: string
  onSuccess: () => void
  setValue: UseFormSetValue<any>
  onBack: () => void
}

const StripePaymentForm = ({ selectedPlan, onSuccess, setValue, onBack }: StripePaymentFormProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [paymentCompleted, setPaymentCompleted] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntent, setPaymentIntent] = useState<any>(null)
  const { currentStep, setCurrentStep } = useAuthContextHook()
  
  // Function to continue to the next registration step
  const continueToNextStep = () => {
    // Don't reset - just move to the next step
    setCurrentStep(currentStep + 1)
  }
  
  // Fetch client secret when component mounts
  useEffect(() => {
    const getClientSecret = async () => {
      setIsLoading(true)
      try {
        // Create a payment intent for the selected plan
        const response = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ plan: selectedPlan }),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Server response error:', errorData);
          throw new Error(errorData.error || `Failed to create payment intent: ${response.statusText}`);
        }
        
        const data = await response.json();
        setClientSecret(data.clientSecret);
        setPaymentIntent(data);
        
        // If it's a free plan, we don't need to collect payment info
        if (data.isFree) {
          // Don't complete payment yet, let user confirm first
          // We'll handle this in the UI with a special button
        }
        
      } catch (error) {
        console.error('Error getting client secret:', error)
        setErrorMessage(error instanceof Error ? error.message : 'Unable to initialize payment. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }
    
    getClientSecret()
  }, [selectedPlan, setValue, onSuccess])
  
  const InnerPaymentForm = () => {
    const stripe = useStripe()
    const elements = useElements()
    const [isProcessing, setIsProcessing] = useState(false)
    
    const handlePayment = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!stripe || !elements) {
        return;
      }
      
      setIsProcessing(true);
      setErrorMessage(null);
      
      try {
        let result;
        console.log('Processing payment for plan:', selectedPlan);
        
        // Check if we're using a SetupIntent or PaymentIntent
        if (paymentIntent?.isSetupIntent) {
          // For SetupIntent (free plans)
          console.log('Using SetupIntent for free plan');
          result = await stripe.confirmSetup({
            elements,
            confirmParams: {
              // Remove return_url to prevent redirect
            },
            redirect: 'if_required',
          });
          
          if (result.error) {
            throw new Error(result.error.message || 'Setup failed');
          }
          
          console.log('Setup confirmation successful:', result);
          
          // Store the setup intent info
          localStorage.setItem('setup_confirmed', selectedPlan);
          localStorage.setItem('setup_intent_id', paymentIntent.setupIntentId);
          
          // Create subscription for the free plan
          try {
            console.log('Creating subscription via API for free plan');
            // Create a subscription through our API
            const response = await fetch('/api/stripe/subscription', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                plan: selectedPlan.toUpperCase(),
                signupFlow: true, // Add signal that this is part of signup flow
              }),
            });
            
            if (!response.ok) {
              console.error('Failed to create subscription for setup intent');
              // Continue anyway, we'll create it later
            } else {
              const data = await response.json();
              console.log('Successfully created subscription for setup intent:', data);
            }
          } catch (subscriptionError) {
            console.error('Error creating subscription after setup:', subscriptionError);
            // Continue anyway, we'll create it later
          }
          
        } else {
          // For PaymentIntent (paid plans)
          console.log('Using PaymentIntent for paid plan:', selectedPlan);
          result = await stripe.confirmPayment({
            elements,
            confirmParams: {
              // Remove return_url to prevent redirect
            },
            redirect: 'if_required',
          });
          
          if (result.error) {
            throw new Error(result.error.message || 'Payment failed');
          }
          
          console.log('Payment confirmed successfully:', result);
          
          // Store the payment intent info
          localStorage.setItem('payment_confirmed', selectedPlan);
          localStorage.setItem('payment_intent_id', result.paymentIntent?.id || '');
          
          // Create subscription for the paid plan
          try {
            console.log('Creating subscription via API for paid plan');
            // Create a subscription through our API
            const response = await fetch('/api/stripe/subscription', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                plan: selectedPlan.toUpperCase(),
                signupFlow: true, // Add signal that this is part of signup flow
                paymentIntentId: result.paymentIntent?.id,
              }),
            });
            
            if (!response.ok) {
              console.error('Failed to create subscription after payment');
              // Continue anyway, we'll create it later
            } else {
              const data = await response.json();
              console.log('Successfully created subscription after payment:', data);
            }
          } catch (subscriptionError) {
            console.error('Error creating subscription after payment:', subscriptionError);
            // Continue anyway, we'll create it later
          }
        }
        
        // Set as paid in the form state
        setValue('hasPaid', true);
        setPaymentCompleted(true);
        // Don't automatically advance to next step
        // Let the PaymentSuccess component handle it with manual continue
      } catch (err: any) {
        console.error('Payment error:', err);
        setErrorMessage(err.message || 'Payment failed. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    };
    
    return (
      <form onSubmit={handlePayment} className="space-y-6">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">
              {selectedPlan === 'standard' && 'Standard Plan (Free)'}
              {selectedPlan === 'pro' && 'Pro Plan'}
            </span>
            <span className="font-medium">
              {selectedPlan === 'standard' && 'Free'}
              {selectedPlan === 'pro' && '£15/month'}
            </span>
          </div>
        </div>
        
        <PaymentElement />
        
        {errorMessage && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm">
            {errorMessage}
          </div>
        )}
        
        <div className="space-y-4">
          <Button 
            type="submit" 
            disabled={!stripe || isProcessing}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-colors"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (
              "Complete Payment"
            )}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              // Clear paid status when going back
              setValue('hasPaid', false);
              onBack();
            }}
            disabled={isProcessing}
          >
            Back
          </Button>
          
          <p className="text-xs text-center text-gray-500">
            Your card won't be charged until after you create your account.
          </p>
        </div>
      </form>
    );
  };
  
  // Handle activation of the free standard plan
  const handleActivateFree = () => {
    setIsLoading(true);
    
    // Create subscription for the standard plan
    (async () => {
      try {
        console.log('Creating subscription via API for free standard plan');
        // Create a subscription through our API
        const response = await fetch('/api/stripe/subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            plan: 'STANDARD',
            signupFlow: true, // Add signal that this is part of signup flow
          }),
        });
        
        if (!response.ok) {
          console.error('Failed to create subscription for free plan');
          // Continue anyway, we'll create it later
        } else {
          const data = await response.json();
          console.log('Successfully created subscription for free plan:', data);
        }
      } catch (subscriptionError) {
        console.error('Error creating subscription for free plan:', subscriptionError);
        // Continue anyway with the rest of the flow
      }
      
      // Mark as paid and continue to next step
      setValue('hasPaid', true);
      setPaymentCompleted(true);
      
      // Store info in localStorage for consistency
      localStorage.setItem('free_plan_activated', 'true');
      localStorage.setItem('selected_plan', selectedPlan);
      
      // Don't automatically advance to next step
      // Let the PaymentSuccess component handle it
    })();
  };
  
  if (paymentCompleted) {
    return <PaymentSuccess 
      selectedPlan={selectedPlan} 
      verified={true} 
      isSignup={true} 
      onChangePlan={() => {
        setPaymentCompleted(false);
        setValue('hasPaid', false);
        onBack();
      }}
      onContinue={() => {
        // Only advance when user manually clicks continue
        onSuccess();
      }}
    />
  }
  
  if (isLoading || !clientSecret) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12">
        {isLoading ? (
          <Loader loading={true}>
            <div className="text-center">
              <p className="mt-2 text-sm text-gray-500">Preparing payment form...</p>
            </div>
          </Loader>
        ) : (
          <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg max-w-md">
            <div className="text-red-600 dark:text-red-400 mb-4">
              <h3 className="font-medium text-lg mb-2">Payment initialization failed</h3>
              <p className="text-sm">{errorMessage || 'Unable to initialize payment form. Please try again.'}</p>
            </div>
            <div className="flex flex-col space-y-3">
              <Button 
                onClick={() => window.location.reload()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Try Again
              </Button>
              <Button 
                variant="outline"
                onClick={onBack}
                className="w-full"
              >
                Go Back
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }
  
  // Use real Stripe Elements for payment processing
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Complete Payment</h2>
        <p className="text-gray-600 mt-2">Enter your payment details to continue setup.</p>
      </div>
      
      {/* Display info for standard (free) plan */}
      {selectedPlan === 'standard' && (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 my-4">
          <div className="flex items-center mb-4">
            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 13L9 17L19 7" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">No Payment Required</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Your Standard Plan is ready to activate</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            You've selected our free Standard Plan. Click the button below to continue setting up your account.
          </p>
          
          <div className="space-y-4">
            <Button 
              type="button"
              onClick={handleActivateFree}
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Activating...</span>
                </div>
              ) : (
                "Activate Free Plan"
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setValue('hasPaid', false);
                onBack();
              }}
              disabled={isLoading}
            >
              Back
            </Button>
          </div>
        </div>
      )}
      
      {/* Only show Stripe Elements for paid plans */}
      {selectedPlan !== 'standard' && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <InnerPaymentForm />
        </Elements>
      )}
    </div>
  )
}

export default StripePaymentForm 