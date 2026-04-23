import { useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { PaymentService } from '@/lib/services/payment-service'
import { PaymentType, PaymentStatus } from '@prisma/client'

export interface PaymentTrackingData {
  stripePaymentId: string
  stripeCustomerId?: string
  type: 'invoice' | 'charge' | 'payment_intent' | 'subscription' | 'one_time'
  amount: number
  currency: string
  description?: string
  paymentMethod?: string
  metadata?: any
}

export function usePaymentTracking() {
  const { user } = useUser()

  /**
   * Track a new payment when it's initiated
   */
  const trackPayment = useCallback(async (paymentData: PaymentTrackingData) => {
    if (!user?.id) {
      console.error('No user ID available for payment tracking')
      return null
    }

    try {
      // Get user from database to get internal ID
      const response = await fetch('/api/user/profile')
      if (!response.ok) {
        throw new Error('Failed to get user profile')
      }
      
      const userProfile = await response.json()
      const userId = userProfile.user?.id

      if (!userId) {
        throw new Error('User ID not found in profile')
      }

      // Map string type to enum
      const mapPaymentType = (type: string): PaymentType => {
        switch (type) {
          case 'invoice':
            return PaymentType.INVOICE
          case 'charge':
            return PaymentType.CHARGE
          case 'payment_intent':
            return PaymentType.PAYMENT_INTENT
          case 'subscription':
            return PaymentType.SUBSCRIPTION
          case 'one_time':
            return PaymentType.ONE_TIME
          default:
            return PaymentType.PAYMENT_INTENT
        }
      }

      // Store the payment with pending status initially
      const payment = await PaymentService.storePayment({
        userId,
        stripePaymentId: paymentData.stripePaymentId,
        stripeCustomerId: paymentData.stripeCustomerId,
        type: mapPaymentType(paymentData.type),
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: PaymentStatus.PENDING,
        description: paymentData.description,
        paymentMethod: paymentData.paymentMethod,
        metadata: {
          ...paymentData.metadata,
          tracked_at: new Date().toISOString(),
          clerk_user_id: user.id
        },
        processedAt: new Date(),
      })

      console.log('Payment tracked successfully:', payment.id)
      return payment

    } catch (error) {
      console.error('Error tracking payment:', error)
      return null
    }
  }, [user?.id])

  /**
   * Update payment status
   */
  const updatePaymentStatus = useCallback(async (
    stripePaymentId: string, 
    status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled' | 'refunded'
  ) => {
    try {
      // Map string status to enum
      const mapPaymentStatus = (status: string): PaymentStatus => {
        switch (status) {
          case 'pending':
            return PaymentStatus.PENDING
          case 'processing':
            return PaymentStatus.PROCESSING
          case 'succeeded':
            return PaymentStatus.SUCCEEDED
          case 'failed':
            return PaymentStatus.FAILED
          case 'canceled':
            return PaymentStatus.CANCELED
          case 'refunded':
            return PaymentStatus.REFUNDED
          default:
            return PaymentStatus.PENDING
        }
      }

      const updatedPayment = await PaymentService.updatePaymentStatus(
        stripePaymentId,
        mapPaymentStatus(status),
        new Date()
      )

      if (updatedPayment) {
        console.log('Payment status updated:', updatedPayment.id, status)
      }

      return updatedPayment
    } catch (error) {
      console.error('Error updating payment status:', error)
      return null
    }
  }, [])

  /**
   * Sync a specific payment from Stripe
   */
  const syncPayment = useCallback(async (
    stripePaymentId: string,
    type: 'invoice' | 'charge' | 'payment_intent' = 'payment_intent'
  ) => {
    if (!user?.id) {
      console.error('No user ID available for payment sync')
      return null
    }

    try {
      // Get user from database to get internal ID
      const response = await fetch('/api/user/profile')
      if (!response.ok) {
        throw new Error('Failed to get user profile')
      }
      
      const userProfile = await response.json()
      const userId = userProfile.user?.id

      if (!userId) {
        throw new Error('User ID not found in profile')
      }

      const syncedPayment = await PaymentService.syncStripePayment(
        stripePaymentId,
        userId,
        type
      )

      if (syncedPayment) {
        console.log('Payment synced successfully:', syncedPayment.id)
      }

      return syncedPayment
    } catch (error) {
      console.error('Error syncing payment:', error)
      return null
    }
  }, [user?.id])

  return {
    trackPayment,
    updatePaymentStatus,
    syncPayment,
    isReady: !!user?.id
  }
} 