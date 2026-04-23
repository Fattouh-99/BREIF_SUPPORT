'use client'

import React, { useState, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check, Loader2, AlertCircle } from 'lucide-react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { PLANS } from '@/lib/stripe/config'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISH_KEY || '')

type PaymentStepProps = {
  selectedPlan: string
  onSuccess: () => void
  onBack: () => void
}

const PaymentForm = ({ selectedPlan, onSuccess, onBack }: PaymentStepProps) => {
  const stripe = useStripe()
  const elements = useElements()
  const { setValue } = useFormContext()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const planKey = selectedPlan.toUpperCase() as keyof typeof PLANS
  const plan = PLANS[planKey]

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('=== PAYMENT FORM SUBMITTED ===');
    console.log('Selected plan:', selectedPlan);
    console.log('Plan details:', plan);
    
    if (!stripe || !elements) {
      console.error('Stripe or Elements not initialized');
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    try {
      // For free plans, just mark as paid and continue
      if (plan?.price === 0) {
        console.log('Processing free plan - no payment needed');
        setValue('hasPaid', true)
        toast.success('Free plan activated successfully!')
        console.log('Calling onSuccess callback for free plan');
        onSuccess()
        return
      }

      console.log('Processing payment for paid plan:', selectedPlan);
      // For paid plans, process the payment
      const { error } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      })

      if (error) {
        console.error('Payment confirmation error:', error);
        throw new Error(error.message || 'Payment failed')
      }

      console.log('Payment successful for plan:', selectedPlan);
      // Mark as paid in the form context
      console.log('Setting hasPaid=true in form context');
      setValue('hasPaid', true);
      
      // Successful payment notification
      toast.success('Payment successful! Creating your account...');
      
      // Call the success callback which will complete registration
      console.log('Calling onSuccess callback to complete registration');
      await onSuccess();

    } catch (err: any) {
      console.error('Payment error:', err)
      setErrorMessage(err.message || 'Payment failed. Please try again.')
      toast.error(err.message || 'Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!plan) {
    return (
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Invalid Plan
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          The selected plan is not valid. Please go back and select a valid plan.
        </p>
        <Button onClick={onBack} variant="outline">
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Complete Your Payment
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          {plan.price === 0 
            ? 'Your free plan is ready to be activated'
            : 'Enter your payment details to continue'
          }
        </p>
      </div>

      {/* Plan Summary */}
      <Card className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium text-gray-900 dark:text-white">
            {plan.name} Plan
          </span>
          <span className="font-bold text-gray-900 dark:text-white">
            {plan.price === 0 ? 'Free' : `$${plan.price / 100}/${plan.interval}`}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {plan.description}
        </p>
        <div className="space-y-1">
          {plan.features.slice(0, 3).map((feature, index) => (
            <div key={index} className="flex items-center text-xs text-gray-600 dark:text-gray-400">
              <Check className="w-3 h-3 text-green-500 mr-2" />
              {feature}
            </div>
          ))}
        </div>
      </Card>

      <form onSubmit={handlePayment} className="space-y-6">
        {/* Payment Element for paid plans */}
        {plan.price > 0 && (
          <div className="space-y-4">
            <PaymentElement 
              options={{
                layout: 'tabs'
              }}
            />
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="flex items-start text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Payment Error</p>
                <p className="text-sm mt-1">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3"
            disabled={!stripe || isProcessing}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {plan.price === 0 ? 'Activating...' : 'Processing Payment...'}
              </div>
            ) : (
              plan.price === 0 ? 'Activate Free Plan' : `Pay $${plan.price / 100}`
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="w-full"
            disabled={isProcessing}
          >
            Back
          </Button>
        </div>
      </form>

      {plan.price === 0 && (
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No payment required for the free plan
          </p>
        </div>
      )}
    </div>
  )
}

const PaymentStep = (props: PaymentStepProps) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const planKey = props.selectedPlan.toUpperCase() as keyof typeof PLANS
  const plan = PLANS[planKey]

  useEffect(() => {
    const initializePayment = async () => {
      try {
        // For free plans, no need to create payment intent
        if (plan?.price === 0) {
          setIsLoading(false)
          return
        }

        // Create payment intent for paid plans
        // Map our plan names to API plan names
        const planMapping: Record<string, string> = {
          'standard': 'standard',
          'pro': 'business', 
          'ultimate': 'enterprise'
        }
        
        const apiPlanName = planMapping[props.selectedPlan.toLowerCase()] || 'standard'
        console.log('Creating payment intent for:', props.selectedPlan, '->', apiPlanName)
        
        const response = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            plan: apiPlanName,
          }),
        })

        console.log('API response status:', response.status)
        console.log('API response headers:', response.headers.get('content-type'))

        if (!response.ok) {
          const errorText = await response.text()
          console.error('API error response:', errorText)
          throw new Error(`API error ${response.status}: ${errorText.substring(0, 200)}`)
        }

        // Check if response is JSON
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          const textResponse = await response.text()
          console.error('Non-JSON response:', textResponse.substring(0, 500))
          throw new Error('Server returned non-JSON response. Check API endpoint.')
        }

        const responseData = await response.json()
        console.log('Payment intent response:', responseData)
        setClientSecret(responseData.clientSecret)
      } catch (err: any) {
        console.error('Payment initialization error:', err)
        setError(err.message || 'Failed to initialize payment')
      } finally {
        setIsLoading(false)
      }
    }

    initializePayment()
  }, [props.selectedPlan, plan?.price])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Preparing payment...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Payment Setup Failed
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <Button onClick={props.onBack} variant="outline">
          Go Back
        </Button>
      </div>
    )
  }

  // For free plans or when we have a client secret
  if (plan?.price === 0 || clientSecret) {
    return (
      <Elements 
        stripe={stripePromise} 
        options={clientSecret ? { clientSecret } : undefined}
      >
        <PaymentForm {...props} />
      </Elements>
    )
  }

  return (
    <div className="text-center">
      <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Payment Not Ready
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Unable to prepare payment for this plan. Please try again.
      </p>
      <Button onClick={props.onBack} variant="outline">
        Go Back
      </Button>
    </div>
  )
}

export default PaymentStep 