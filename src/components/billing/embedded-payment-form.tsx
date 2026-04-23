'use client'

import React, { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CreditCard, Lock, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { PLANS, type PlanType } from '@/lib/stripe/config'

// Initialize Stripe with error handling
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISH_KEY!, {
  // Add options for better compatibility
  locale: 'en'
})

interface PaymentFormProps {
  planId: PlanType
  onSuccess: () => void
  onCancel: () => void
}

const PaymentForm: React.FC<PaymentFormProps> = ({ planId, onSuccess, onCancel }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [stripeError, setStripeError] = useState<string | null>(null)
  const [billingDetails, setBillingDetails] = useState({
    name: '',
    email: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      postal_code: '',
      country: 'US',
      state: ''
    }
  })

  const plan = PLANS[planId]

  // Check for Stripe loading errors
  useEffect(() => {
    stripePromise.catch((error) => {
      console.error('Stripe failed to load:', error)
      setStripeError('Failed to load payment system. Please refresh the page and try again.')
    })
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      setStripeError('Payment system is not ready. Please wait a moment and try again.')
      return
    }

    setLoading(true)
    setStripeError(null)

    try {
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('Card element not found')
      }

      // Create payment intent
      const response = await fetch('/api/stripe/v2/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          planId,
          billingDetails
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create payment intent')
      }

      const { clientSecret, customerId } = await response.json()

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: billingDetails
        }
      })

      if (error) {
        throw new Error(error.message)
      }

      if (paymentIntent?.status === 'succeeded') {
        // Create subscription after successful payment
        const subscriptionResponse = await fetch('/api/stripe/v2/create-subscription-after-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            planId,
            customerId,
            paymentMethodId: paymentIntent.payment_method
          })
        })

        if (!subscriptionResponse.ok) {
          const errorData = await subscriptionResponse.json()
          throw new Error(errorData.error || 'Failed to create subscription')
        }

        toast.success('Subscription created successfully!')
        onSuccess()
      }
    } catch (error) {
      console.error('Payment error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Payment failed'
      setStripeError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4'
        },
        padding: '12px'
      },
      invalid: {
        color: '#9e2146'
      }
    },
    hidePostalCode: false
  }

  // Show error if Stripe failed to load
  if (stripeError) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Payment System Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{stripeError}</AlertDescription>
          </Alert>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              className="flex-1"
            >
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Subscribe to {plan.name}
        </CardTitle>
        <CardDescription>
          {plan.description} - {plan.price === 0 ? 'Free' : `$${plan.price / 100}/month`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Billing Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                required
                value={billingDetails.name}
                onChange={(e) => setBillingDetails(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={billingDetails.email}
                onChange={(e) => setBillingDetails(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="address1">Address Line 1</Label>
              <Input
                id="address1"
                type="text"
                required
                value={billingDetails.address.line1}
                onChange={(e) => setBillingDetails(prev => ({ 
                  ...prev, 
                  address: { ...prev.address, line1: e.target.value }
                }))}
              />
            </div>

            <div>
              <Label htmlFor="address2">Address Line 2 (Optional)</Label>
              <Input
                id="address2"
                type="text"
                value={billingDetails.address.line2}
                onChange={(e) => setBillingDetails(prev => ({ 
                  ...prev, 
                  address: { ...prev.address, line2: e.target.value }
                }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  type="text"
                  required
                  value={billingDetails.address.city}
                  onChange={(e) => setBillingDetails(prev => ({ 
                    ...prev, 
                    address: { ...prev.address, city: e.target.value }
                  }))}
                />
              </div>
              
              <div>
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input
                  id="postal_code"
                  type="text"
                  required
                  value={billingDetails.address.postal_code}
                  onChange={(e) => setBillingDetails(prev => ({ 
                    ...prev, 
                    address: { ...prev.address, postal_code: e.target.value }
                  }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  type="text"
                  required
                  value={billingDetails.address.state}
                  onChange={(e) => setBillingDetails(prev => ({ 
                    ...prev, 
                    address: { ...prev.address, state: e.target.value }
                  }))}
                />
              </div>
              
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  type="text"
                  required
                  value={billingDetails.address.country}
                  onChange={(e) => setBillingDetails(prev => ({ 
                    ...prev, 
                    address: { ...prev.address, country: e.target.value }
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Card Element */}
          <div>
            <Label>Card Details</Label>
            <div className="border rounded-md p-3 mt-1">
              <CardElement options={cardElementOptions} />
            </div>
            {!stripe && (
              <p className="text-sm text-muted-foreground mt-1">
                Loading payment system...
              </p>
            )}
          </div>

          {/* Security Notice */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>Your payment information is secure and encrypted</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!stripe || loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Subscribe {plan.price > 0 && `$${plan.price / 100}/month`}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

interface EmbeddedPaymentFormProps {
  planId: PlanType
  onSuccess: () => void
  onCancel: () => void
}

export const EmbeddedPaymentForm: React.FC<EmbeddedPaymentFormProps> = ({ planId, onSuccess, onCancel }) => {
  const [stripeError, setStripeError] = useState<string | null>(null)

  // Check if Stripe publishable key is available
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISH_KEY) {
      setStripeError('Stripe is not configured. Please contact support.')
    }
  }, [])

  if (stripeError) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Configuration Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{stripeError}</AlertDescription>
          </Alert>
          <Button variant="outline" onClick={onCancel} className="w-full">
            Cancel
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm planId={planId} onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  )
} 