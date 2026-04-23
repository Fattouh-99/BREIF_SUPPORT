'use client'
import { Loader } from '@/components/loader'
import { StripeElements } from '@/components/settings/stripe-elements'
import SubscriptionCard from '@/components/settings/subscription-card'
import { Button } from '@/components/ui/button'
import { useSubscriptions } from '@/hooks/billing/use-billing'
import React from 'react'
import { Card, CardDescription } from '@/components/ui/card'

type Props = {
  plan: 'STANDARD' | 'PRO'
}

const SubscriptionForm = ({ plan }: Props) => {
  const { loading, onSetPayment, payment, onCancelSubscription } =
    useSubscriptions(plan)
  const [showPayment, setShowPayment] = React.useState(false)

  // Clear payment selection if it matches current plan
  React.useEffect(() => {
    if (payment === plan) {
      onSetPayment('' as 'STANDARD' | 'PRO')
      setShowPayment(false)
    }
  }, [payment, plan, onSetPayment])

  // Handle successful payment completion
  const handlePaymentSuccess = () => {
    // Reset form state
    setShowPayment(false)
    onSetPayment('' as 'STANDARD' | 'PRO')
    
    // Dispatch custom event to notify parent components that payment was successful
    window.dispatchEvent(new CustomEvent('paymentSuccess', {
      detail: { plan: payment }
    }))
    
    // The useCompletePayment hook already handles the router refresh
    // so we don't need to do anything else here
  }

  return (
    <Loader loading={loading}>
      <div className="flex flex-col gap-5 min-h-[60vh]">
        {!showPayment ? (
          <>
            <div className="flex-1 flex flex-col gap-3">
              {plan !== 'STANDARD' && (
                <Card className="p-4 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800">
                  <CardDescription className="text-red-700 dark:text-red-300">
                    Want to cancel your subscription?
                  </CardDescription>
                  <Button
                    onClick={onCancelSubscription}
                    variant="destructive"
                    className="mt-2 w-full"
                  >
                    <Loader loading={loading}>Cancel Subscription</Loader>
                  </Button>
                </Card>
              )}

              <SubscriptionCard
                title="STANDARD"
                description="Free tier with basic features. Perfect for getting started."
                price="0"
                payment={payment}
                onPayment={onSetPayment}
                id="STANDARD"
                features={[
                  '10 credits included',
                  'Basic chat features',
                  'Standard support'
                ]}
                currentPlan={plan === 'STANDARD'}
              />

              <SubscriptionCard
                title="PRO"
                description="Enhanced features for growing businesses"
                price="15"
                payment={payment}
                onPayment={onSetPayment}
                id="PRO"
                features={[
                  '50 credits included',
                  'Advanced chat features',
                  'Priority support',
                  'Custom branding',
                  'Analytics dashboard'
                ]}
                currentPlan={plan === 'PRO'}
              />
            </div>

            {payment && payment !== plan && (
              <div className="sticky bottom-0 bg-white dark:bg-gray-900 pt-4 space-y-4 border-t dark:border-gray-800">
                <Button 
                  onClick={() => setShowPayment(true)}
                  className="bg-indigo-500 text-white hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 w-full"
                >
                  Continue to Payment
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-5">
            <Card className="p-4 bg-indigo-50 border-indigo-200 dark:bg-indigo-950 dark:border-indigo-800">
              <CardDescription className="text-indigo-700 dark:text-indigo-300">
                {payment === 'STANDARD' 
                  ? 'Downgrading to Standard Plan' 
                  : `Upgrading to ${payment} Plan`}
              </CardDescription>
            </Card>

            {payment !== 'STANDARD' ? (
              <StripeElements payment={payment} onSuccess={handlePaymentSuccess} />
            ) : (
              <Button 
                onClick={onCancelSubscription}
                className="bg-indigo-500 text-white hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 w-full"
              >
                <Loader loading={loading}>Confirm Downgrade to Standard</Loader>
              </Button>
            )}

            <Button
              onClick={() => setShowPayment(false)}
              variant="outline"
              className="w-full dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Back to Plan Selection
            </Button>
          </div>
        )}
      </div>
    </Loader>
  )
}

export default SubscriptionForm
