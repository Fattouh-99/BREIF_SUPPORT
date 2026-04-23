'use client'
import React, { useState, useEffect } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '../ui/button'
import { useCompletePayment } from '@/hooks/billing/use-billing'
import { Loader2 } from 'lucide-react'
import { toast } from "sonner"

// Plan pricing information
const planPrices = {
  STANDARD: "$0/month",
  PRO: "$15/month",
}

type PaymentFormProps = {
  selectedPlan?: 'STANDARD' | 'PRO'
  onSuccess?: () => void
}

export function PaymentForm({ selectedPlan = 'STANDARD', onSuccess }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cardError, setCardError] = useState<string | null>(null)
  const { onCompletePayment, loading: paymentLoading, error: paymentError } = useCompletePayment()

  // Display any error that comes back from the API
  useEffect(() => {
    if (paymentError) {
      setCardError(paymentError);
      toast.error(paymentError);
    }
  }, [paymentError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!stripe || !elements) {
      return
    }

    setIsSubmitting(true)
    setCardError(null)

    try {
      // Use CardElement to handle payment method
      const cardElement = elements.getElement(CardElement)
      
      if (!cardElement) {
        throw new Error("Card element not found")
      }
      
      // Create payment method
      const { error } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      })

      if (error) {
        throw new Error(error.message)
      }
      
      // Now create the subscription with the selected plan
      const result = await onCompletePayment(selectedPlan)
      
      if (result) {
        // Call success callback to close modal and refresh data
        if (onSuccess) {
          onSuccess()
        }
      }
      
    } catch (error) {
      if (error instanceof Error) {
        setCardError(error.message)
        toast.error(error.message)
      } else {
        setCardError('An unknown error occurred')
        toast.error('An unknown error occurred')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const price = planPrices[selectedPlan]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Subscribe to {selectedPlan}</h3>
        <p className="text-sm text-muted-foreground">
          You will be charged {price}. You can cancel anytime.
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Card Details
        </label>
        <div className="border p-3 rounded-md">
          <CardElement 
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
        {cardError && (
          <p className="text-sm text-red-500">{cardError}</p>
        )}
        {paymentError && (
          <p className="text-sm text-red-500">{paymentError}</p>
        )}
      </div>

      <Button 
        type="submit"
        disabled={!stripe || isSubmitting || paymentLoading}
        className="w-full"
      >
        {(isSubmitting || paymentLoading) ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Subscribe for ${price}`
        )}
      </Button>
    </form>
  )
}
