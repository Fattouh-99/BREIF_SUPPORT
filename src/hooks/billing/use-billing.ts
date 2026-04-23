import { useEffect, useState } from 'react'
import {
  onCreateCustomerPaymentIntentSecret,
  onGetStripeClientSecret,
  onUpdateSubscription,
} from '@/actions/stripe'
import { useToast } from '@/components/ui/use-toast'
import axios from 'axios'
import {
  useElements,
  useStripe as useStripeHook,
} from '@stripe/react-stripe-js'
import { useRouter } from 'next/navigation'
import { NotificationType } from '@/types/notification'

export const useStripe = () => {
  const [onStripeAccountPending, setOnStripeAccountPending] =
    useState<boolean>(false)

  const onStripeConnect = async () => {
    try {
      setOnStripeAccountPending(true)
      const account = await axios.get(`/api/stripe/connect`)
      if (account) {
        setOnStripeAccountPending(false)
        if (account) {
          window.location.href = account.data.url
        }
      }
    } catch (error) {
      console.log(error)
    }
  }
  return { onStripeConnect, onStripeAccountPending }
}

export const useStripeCustomer = (amount: number, stripeId: string) => {
  const [stripeSecret, setStripeSecret] = useState<string>('')
  const [loadForm, setLoadForm] = useState<boolean>(false)

  const onGetCustomerIntent = async (amount: number) => {
    try {
      setLoadForm(true)
      const intent = await onCreateCustomerPaymentIntentSecret(amount, stripeId)
      if (intent) {
        setLoadForm(false)
        setStripeSecret(intent.secret!)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    onGetCustomerIntent(amount)
  }, [])

  return { stripeSecret, loadForm }
}

export const useCompleteCustomerPayment = (onNext: () => void) => {
  const [processing, setProcessing] = useState<boolean>(false)
  const { toast } = useToast()
  const stripe = useStripeHook()
  const elements = useElements()

  const onMakePayment = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!stripe || !elements) {
      return null
    }

    try {
      setProcessing(true)

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: 'http://localhost:3000/settings',
        },
        redirect: 'if_required',
      })

      if (error) {
        console.log(error)
      }

      if (paymentIntent?.status === 'succeeded') {
        toast({
          title: 'Success',
          description: 'Payment complete',
        })
        onNext()
      }

      setProcessing(false)
    } catch (error) {
      console.log(error)
    }
  }

  return { processing, onMakePayment }
}

export const useSubscriptions = (plan: 'STANDARD' | 'PRO') => {
  const [loading, setLoading] = useState<boolean>(false)
  const [payment, setPayment] = useState<'STANDARD' | 'PRO'>(plan)
  const { toast } = useToast()
  
  // Function to refresh subscription data
  const refreshSubscription = async () => {
    try {
      setLoading(true);
      // Use the new dedicated endpoint to refresh subscription data
      const response = await fetch('/api/user/subscription/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Don't cache this request
        credentials: 'include', // Include cookies
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh subscription data');
      }
      
      const data = await response.json();
      console.log('Refreshed subscription data:', data);
      
      // Force a reload of the page to update all components
      window.location.href = `${window.location.origin}/settings`;
      
    } catch (error) {
      console.error('Error refreshing subscription:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Call refresh on initial load
  useEffect(() => {
    refreshSubscription();
  }, []);
  
  const onCancelSubscription = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/stripe/subscription', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }

      toast({
        title: 'Success',
        description: 'Your subscription will be cancelled at the end of the billing period',
      })
      
      // Force a hard refresh to ensure server component revalidation
      window.location.href = `${window.location.origin}/settings`
    } catch (error) {
      console.log(error)
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const onSetPayment = (payment: 'STANDARD' | 'PRO') =>
    setPayment(payment)

  return {
    loading,
    onSetPayment,
    payment,
    onCancelSubscription,
    refreshSubscription,
  }
}

export const useStripeElements = (payment: 'STANDARD' | 'PRO') => {
  const [stripeSecret, setStripeSecret] = useState<string>('')
  const [subscriptionId, setSubscriptionId] = useState<string>('')
  const [loadForm, setLoadForm] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  
  // Map frontend plan names to backend plan names
  const planNameMap = {
    'STANDARD': 'STANDARD',
    'PRO': 'PRO'
  }

  const onGetSubscriptionIntent = async (plan: 'STANDARD' | 'PRO') => {
    try {
      setLoadForm(true)
      // Map frontend plan name to backend plan name
      const backendPlan = planNameMap[plan]
      console.log('Fetching subscription intent for plan:', plan, '(mapped to backend plan:', backendPlan, ')');
      
      // Ensure cookies are included with the request
      const response = await fetch('/api/stripe/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: backendPlan }),
        credentials: 'include', // Include cookies for authentication
        cache: 'no-store', // Don't cache this request
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Subscription error:', errorData);
        setError(errorData.message || 'Failed to create subscription');
        setLoadForm(false);
        return;
      }

      const data = await response.json()
      console.log('Subscription intent created:', data?.clientSecret ? 'Has secret' : 'No secret');
      setStripeSecret(data.clientSecret)
      setSubscriptionId(data.subscriptionId)
      setLoadForm(false)
    } catch (error) {
      console.error('Error fetching subscription intent:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setLoadForm(false)
    }
  }

  useEffect(() => {
    if (payment !== 'STANDARD') {
      onGetSubscriptionIntent(payment)
    }
  }, [payment])

  return { stripeSecret, subscriptionId, loadForm, error }
}

export const useCompletePayment = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  
  const onCompletePayment = async (plan: 'STANDARD' | 'PRO') => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('Creating subscription with plan:', plan)
      
      const response = await fetch('/api/stripe/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
        credentials: 'include',
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Payment completion error:', errorData);
        throw new Error(errorData.message || 'Failed to complete payment');
      }
      
      // Refresh the page after successful payment
      window.location.href = '/settings'
      
    } catch (err) {
      console.error('Payment completion error:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }
  
  return { onCompletePayment, loading, error }
}
