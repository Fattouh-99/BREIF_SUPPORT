'use client'
import { Loader } from '@/components/loader'
import { Button } from '@/components/ui/button'
import { useCompleteCustomerPayment } from '@/hooks/billing/use-billing'
import { PaymentElement } from '@stripe/react-stripe-js'
import React from 'react'

type CustomerPaymentFormProps = {
  onNext(): void
}

export const CustomerPaymentForm = ({ onNext }: CustomerPaymentFormProps) => {
  const { processing, onMakePayment } = useCompleteCustomerPayment(onNext)
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await onMakePayment(e as any)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 rounded-xl p-4">
        <PaymentElement className="payment-element" />
      </div>
      <Button
        type="submit"
        className="w-full h-12 text-white font-medium bg-gray-900 hover:bg-gray-800 transition-colors"
        disabled={processing}
      >
        <Loader loading={processing}>
          {processing ? 'Processing...' : 'Complete Purchase'}
        </Loader>
      </Button>
      <div className="space-y-2">
        <p className="text-center text-sm text-gray-500">
          Your payment is processed securely through <span className="font-bold text-indigo-500">Stripe</span>
        </p>
        <div className="flex items-center justify-center gap-2">
          <div className="w-1 h-1 rounded-full bg-gray-300" />
          <p className="text-center text-xs text-gray-400">
            256-bit encryption
          </p>
          <div className="w-1 h-1 rounded-full bg-gray-300" />
          <p className="text-center text-xs text-gray-400">
            SSL Secure
          </p>
        </div>
      </div>
    </form>
  )
}
