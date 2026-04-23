'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export interface Plan {
  id: string
  name: string
  description: string
  price: number
  priceFormatted: string
  interval: string
  features: string[]
  credits: number
  maxDomains: number
  maxContacts: number
  maxEmailsPerMonth: number
  isFree: boolean
  isPopular: boolean
  priceId: string | null
}

export interface SubscriptionDetails {
  currentPlan: string
  planDetails: Plan
  subscription: any
  stripeSubscription: any
  canUpgrade: boolean
  canDowngrade: boolean
  requestsUsed?: number
  requestLimit?: number
  requestsRemaining?: number
}

// Hook for managing subscriptions
export const useSubscription = () => {
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSubscriptionDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/stripe/v2/subscriptions', {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch subscription details')
      }

      const data = await response.json()
      setSubscriptionDetails(data.data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('Error fetching subscription details:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscriptionDetails()
  }, [])

  const upgradeSubscription = async (planId: string, useCheckout = false) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/stripe/v2/subscriptions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ plan: planId, useCheckout })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upgrade subscription')
      }

      const data = await response.json()

      if (data.data.checkoutUrl && useCheckout) {
        // Redirect to Stripe Checkout
        window.location.href = data.data.checkoutUrl
        return { success: true, redirected: true }
      } else {
        // Refresh subscription details
        await fetchSubscriptionDetails()
        toast.success('Subscription upgraded successfully!')
        return { success: true, redirected: false }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Error upgrading subscription:', err)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const cancelSubscription = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/stripe/v2/subscriptions', {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to cancel subscription')
      }

      const data = await response.json()
      
      // Refresh subscription details
      await fetchSubscriptionDetails()
      toast.success(data.data.message || 'Subscription cancelled successfully!')
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Error canceling subscription:', err)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const createSubscription = async (planId: string, useCheckout = false) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/stripe/v2/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ plan: planId, useCheckout })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create subscription')
      }

      const data = await response.json()

      if (data.data.checkoutUrl && useCheckout) {
        // Redirect to Stripe Checkout
        window.location.href = data.data.checkoutUrl
        return { success: true, redirected: true }
      } else {
        // Refresh subscription details
        await fetchSubscriptionDetails()
        toast.success('Subscription created successfully!')
        return { success: true, redirected: false }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Error creating subscription:', err)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  return {
    subscriptionDetails,
    loading,
    error,
    upgradeSubscription,
    cancelSubscription,
    createSubscription,
    refetch: fetchSubscriptionDetails
  }
}

// Hook for managing plans
export const usePlans = () => {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/stripe/v2/plans', {
          method: 'GET'
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch plans')
        }

        const data = await response.json()
        setPlans(data.data.plans)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred'
        setError(errorMessage)
        console.error('Error fetching plans:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [])

  return { plans, loading, error }
}

// Hook for customer portal
export const useCustomerPortal = () => {
  const [loading, setLoading] = useState(false)

  const openCustomerPortal = async () => {
    try {
      setLoading(true)

      const response = await fetch('/api/stripe/v2/customer-portal', {
        method: 'POST',
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to open customer portal')
      }

      const data = await response.json()
      
      // Open customer portal in same window
      window.location.href = data.data.portalUrl
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      
      // Show more specific error message for portal configuration issues
      if (errorMessage.includes('Customer portal is not configured')) {
        toast.error('Customer portal is not configured. Please contact support or configure your Stripe customer portal settings.')
      } else if (errorMessage.includes('No billing account found')) {
        toast.error('No billing account found. Please subscribe to a plan first.')
      } else {
        toast.error(errorMessage)
      }
      
      console.error('Error opening customer portal:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    openCustomerPortal,
    loading
  }
} 