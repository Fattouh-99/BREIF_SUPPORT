'use client'

import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import React from 'react'
import { Loader } from '../loader'
import { useStripeElements } from '@/hooks/billing/use-billing'
import { PaymentForm } from './payment-form'

// Initialize Stripe outside component to prevent multiple initializations
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISH_KEY!, {
  locale: 'en'
})

type StripeElementsProps = {
  payment: 'STANDARD' | 'PRO'
}

export const StripeElements = ({ payment }: StripeElementsProps) => {
  const { stripeSecret, loadForm } = useStripeElements(payment)
  console.log('StripeElements rendering with stripeSecret:', !!stripeSecret);

  // Don't show payment form for free plan
  if (payment === 'STANDARD') {
    return null;
  }

  // Show loading state while fetching stripe secret
  if (!stripeSecret || !stripePromise) {
    return <Loader loading={true}>Loading payment form...</Loader>;
  }

  return (
    <Loader loading={loadForm}>
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret: stripeSecret,
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#6366f1', // indigo-500
              colorBackground: '#ffffff',
              colorText: '#1f2937', // gray-800
              colorDanger: '#ef4444', // red-500
              fontFamily: 'system-ui, sans-serif',
              borderRadius: '6px',
            }
          },
          loader: 'auto'
        }}
      >
        <PaymentForm selectedPlan={payment} />
      </Elements>
    </Loader>
  )
}
