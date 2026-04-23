import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'
import { PaymentType, PaymentStatus } from '@prisma/client'

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
  apiVersion: '2024-04-10',
  typescript: true,
})

export interface PaymentRecord {
  id: string
  userId: string
  stripePaymentId: string
  stripeCustomerId?: string
  type: PaymentType
  amount: number
  currency: string
  status: PaymentStatus
  description?: string
  receiptUrl?: string
  paymentMethod?: string
  metadata?: any
  periodStart?: Date
  periodEnd?: Date
  processedAt?: Date
}

export class PaymentService {
  /**
   * Store a payment record in the database
   */
  static async storePayment(payment: Omit<PaymentRecord, 'id'>): Promise<PaymentRecord> {
    try {
      const stored = await prisma.payment.create({
        data: {
          userId: payment.userId,
          stripePaymentId: payment.stripePaymentId,
          stripeCustomerId: payment.stripeCustomerId,
          type: payment.type,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          description: payment.description,
          receiptUrl: payment.receiptUrl,
          paymentMethod: payment.paymentMethod,
          metadata: payment.metadata,
          periodStart: payment.periodStart,
          periodEnd: payment.periodEnd,
          processedAt: payment.processedAt || new Date(),
        },
      })

      return {
        id: stored.id,
        userId: stored.userId,
        stripePaymentId: stored.stripePaymentId,
        stripeCustomerId: stored.stripeCustomerId || undefined,
        type: stored.type,
        amount: parseFloat(stored.amount.toString()),
        currency: stored.currency,
        status: stored.status,
        description: stored.description || undefined,
        receiptUrl: stored.receiptUrl || undefined,
        paymentMethod: stored.paymentMethod || undefined,
        metadata: stored.metadata,
        periodStart: stored.periodStart || undefined,
        periodEnd: stored.periodEnd || undefined,
        processedAt: stored.processedAt || undefined,
      }
    } catch (error) {
      console.error('Error storing payment:', error)
      throw new Error('Failed to store payment record')
    }
  }

  /**
   * Update a payment record status
   */
  static async updatePaymentStatus(
    stripePaymentId: string,
    status: PaymentStatus,
    processedAt?: Date
  ): Promise<PaymentRecord | null> {
    try {
      const updated = await prisma.payment.update({
        where: { stripePaymentId },
        data: {
          status,
          processedAt: processedAt || new Date(),
        },
      })

      return {
        id: updated.id,
        userId: updated.userId,
        stripePaymentId: updated.stripePaymentId,
        stripeCustomerId: updated.stripeCustomerId || undefined,
        type: updated.type,
        amount: parseFloat(updated.amount.toString()),
        currency: updated.currency,
        status: updated.status,
        description: updated.description || undefined,
        receiptUrl: updated.receiptUrl || undefined,
        paymentMethod: updated.paymentMethod || undefined,
        metadata: updated.metadata,
        periodStart: updated.periodStart || undefined,
        periodEnd: updated.periodEnd || undefined,
        processedAt: updated.processedAt || undefined,
      }
    } catch (error) {
      console.error('Error updating payment status:', error)
      return null
    }
  }

  /**
   * Get user's payment history from database
   */
  static async getUserPayments(
    userId: string,
    limit = 10,
    offset = 0,
    statusFilter?: any[]
  ): Promise<{ payments: PaymentRecord[], total: number }> {
    try {
      const where = {
        userId,
        ...(statusFilter && statusFilter.length > 0 && {
          status: { in: statusFilter }
        })
      }

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit,
        }),
        prisma.payment.count({ where })
      ])

      const formattedPayments = payments.map(payment => ({
        id: payment.id,
        userId: payment.userId,
        stripePaymentId: payment.stripePaymentId,
        stripeCustomerId: payment.stripeCustomerId || undefined,
        type: payment.type,
        amount: parseFloat(payment.amount.toString()),
        currency: payment.currency,
        status: payment.status,
        description: payment.description || undefined,
        receiptUrl: payment.receiptUrl || undefined,
        paymentMethod: payment.paymentMethod || undefined,
        metadata: payment.metadata,
        periodStart: payment.periodStart || undefined,
        periodEnd: payment.periodEnd || undefined,
        processedAt: payment.processedAt || undefined,
      }))

      return { payments: formattedPayments, total }
    } catch (error) {
      console.error('Error fetching user payments:', error)
      throw new Error('Failed to fetch payment history')
    }
  }

  /**
   * Sync Stripe payment to database
   */
  static async syncStripePayment(
    stripePaymentId: string,
    userId: string,
    type: 'invoice' | 'charge' | 'payment_intent' = 'payment_intent'
  ): Promise<PaymentRecord | null> {
    try {
      let stripeData: any = null
      let paymentType: PaymentType = PaymentType.PAYMENT_INTENT

      // Fetch from Stripe based on type
      switch (type) {
        case 'invoice':
          stripeData = await stripe.invoices.retrieve(stripePaymentId, {
            expand: ['charge', 'payment_intent']
          })
          paymentType = PaymentType.INVOICE
          break
        case 'charge':
          stripeData = await stripe.charges.retrieve(stripePaymentId)
          paymentType = PaymentType.CHARGE
          break
        case 'payment_intent':
          stripeData = await stripe.paymentIntents.retrieve(stripePaymentId)
          paymentType = PaymentType.PAYMENT_INTENT
          break
        default:
          throw new Error(`Unknown payment type: ${type}`)
      }

      if (!stripeData) {
        throw new Error('Payment not found in Stripe')
      }

      // Map Stripe status to our enum
      const mapStripeStatus = (status: string): PaymentStatus => {
        switch (status) {
          case 'succeeded':
          case 'paid':
            return PaymentStatus.SUCCEEDED
          case 'pending':
            return PaymentStatus.PENDING
          case 'processing':
            return PaymentStatus.PROCESSING
          case 'failed':
            return PaymentStatus.FAILED
          case 'canceled':
          case 'cancelled':
            return PaymentStatus.CANCELED
          case 'refunded':
            return PaymentStatus.REFUNDED
          case 'requires_action':
            return PaymentStatus.REQUIRES_ACTION
          case 'requires_confirmation':
            return PaymentStatus.REQUIRES_CONFIRMATION
          case 'requires_payment_method':
            return PaymentStatus.REQUIRES_PAYMENT_METHOD
          default:
            return PaymentStatus.PENDING
        }
      }

      // Check if payment already exists
      const existingPayment = await prisma.payment.findUnique({
        where: { stripePaymentId }
      })

      const paymentData = {
        userId,
        stripePaymentId,
        stripeCustomerId: stripeData.customer,
        type: paymentType,
        amount: (stripeData.amount || stripeData.amount_paid || 0) / 100,
        currency: stripeData.currency,
        status: mapStripeStatus(stripeData.status),
        description: stripeData.description || 
                    (type === 'invoice' ? `Invoice ${stripeData.number}` : 'Payment'),
        receiptUrl: stripeData.receipt_url || stripeData.hosted_invoice_url,
        paymentMethod: stripeData.payment_method_details?.type || 
                      stripeData.payment_method_types?.[0] || 
                      'card',
        metadata: {
          stripeMetadata: stripeData.metadata,
          type: type,
          ...(type === 'invoice' && {
            invoiceNumber: stripeData.number,
            subscription: stripeData.subscription
          })
        },
        periodStart: type === 'invoice' ? 
                    new Date(stripeData.period_start * 1000) : undefined,
        periodEnd: type === 'invoice' ? 
                  new Date(stripeData.period_end * 1000) : undefined,
        processedAt: new Date(stripeData.created * 1000),
      }

      if (existingPayment) {
        // Update existing payment
        const updated = await prisma.payment.update({
          where: { stripePaymentId },
          data: paymentData,
        })

        return {
          id: updated.id,
          userId: updated.userId,
          stripePaymentId: updated.stripePaymentId,
          stripeCustomerId: updated.stripeCustomerId || undefined,
          type: updated.type,
          amount: parseFloat(updated.amount.toString()),
          currency: updated.currency,
          status: updated.status,
          description: updated.description || undefined,
          receiptUrl: updated.receiptUrl || undefined,
          paymentMethod: updated.paymentMethod || undefined,
          metadata: updated.metadata,
          periodStart: updated.periodStart || undefined,
          periodEnd: updated.periodEnd || undefined,
          processedAt: updated.processedAt || undefined,
        }
      } else {
        // Create new payment
        return await this.storePayment(paymentData)
      }
    } catch (error) {
      console.error('Error syncing Stripe payment:', error)
      return null
    }
  }

  /**
   * Sync all user payments from Stripe
   */
  static async syncUserPaymentsFromStripe(userId: string, stripeCustomerId: string): Promise<{
    synced: number;
    errors: string[];
  }> {
    const errors: string[] = []
    let synced = 0

    try {
      // Get all payment types from Stripe
      const [invoices, charges, paymentIntents] = await Promise.all([
        stripe.invoices.list({
          customer: stripeCustomerId,
          limit: 100,
          expand: ['data.charge', 'data.payment_intent']
        }),
        stripe.charges.list({
          customer: stripeCustomerId,
          limit: 100
        }),
        stripe.paymentIntents.list({
          customer: stripeCustomerId,
          limit: 100
        })
      ])

      // Sync invoices
      for (const invoice of invoices.data) {
        try {
          await this.syncStripePayment(invoice.id, userId, 'invoice')
          synced++
        } catch (error) {
          errors.push(`Failed to sync invoice ${invoice.id}: ${error}`)
        }
      }

      // Sync charges (avoiding duplicates from invoices)
      for (const charge of charges.data) {
        try {
          // Skip if this charge is already part of an invoice
          if (!charge.invoice) {
            await this.syncStripePayment(charge.id, userId, 'charge')
            synced++
          }
        } catch (error) {
          errors.push(`Failed to sync charge ${charge.id}: ${error}`)
        }
      }

      // Sync payment intents (avoiding duplicates)
      for (const pi of paymentIntents.data) {
        try {
          // Skip if this payment intent is already part of an invoice
          if (!pi.invoice) {
            await this.syncStripePayment(pi.id, userId, 'payment_intent')
            synced++
          }
        } catch (error) {
          errors.push(`Failed to sync payment intent ${pi.id}: ${error}`)
        }
      }

      return { synced, errors }
    } catch (error) {
      console.error('Error during Stripe sync:', error)
      return { 
        synced, 
        errors: [...errors, `General sync error: ${error}`] 
      }
    }
  }
} 