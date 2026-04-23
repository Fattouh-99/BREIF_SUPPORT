import { useState, useEffect } from 'react'

export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled' | 'refunded' | 'requires_action' | 'requires_confirmation' | 'requires_payment_method' | string

export interface Payment {
  id: string
  type: 'invoice' | 'charge' | 'payment_intent' | 'subscription' | 'one_time'
  amount: number
  currency: string
  status: PaymentStatus
  date: string
  receiptUrl?: string | null
  description: string
  periodStart?: string
  periodEnd?: string
  paymentMethod?: string | null
}

interface PaymentHistoryResponse {
  payments: Payment[]
  has_more: boolean
  next_cursor: string | null
  total?: number
  source?: string
}

export function usePaymentHistory(initialLimit = 10) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [total, setTotal] = useState(0)
  
  const fetchPayments = async (page = 0, limit = initialLimit, statusFilter?: PaymentStatus[]) => {
    setLoading(true)
    setError(null)
    
    try {
      // Build URL with query parameters
      const offset = page * limit
      let url = `/api/stripe/payment-history?limit=${limit}&offset=${offset}`
      
      if (statusFilter && statusFilter.length > 0) {
        url += `&status=${statusFilter.join(',')}`
      }
      
      const response = await fetch(url)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch payment history')
      }
      
      const data = await response.json() as PaymentHistoryResponse
      
      if (page === 0) {
        // Replace existing payments for first page
        setPayments(data.payments)
      } else {
        // Append new payments for subsequent pages
        setPayments(prev => [...prev, ...data.payments])
      }
      
      setHasMore(data.has_more)
      setTotal(data.total || data.payments.length)
      setCurrentPage(page)
      
      console.log(`Loaded ${data.payments.length} payments from ${data.source || 'unknown'}`)
    } catch (err) {
      console.error('Error fetching payment history:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }
  
  // Initial fetch
  useEffect(() => {
    fetchPayments(0)
  }, [])
  
  // Function to load more payments
  const loadMore = () => {
    if (hasMore && !loading) {
      fetchPayments(currentPage + 1)
    }
  }
  
  // Function to refresh payments
  const refresh = async () => {
    setCurrentPage(0)
    await fetchPayments(0, initialLimit)
  }
  
  // Function to filter by status
  const filterByStatus = (statusFilter: PaymentStatus[]) => {
    setCurrentPage(0)
    fetchPayments(0, initialLimit, statusFilter)
  }
  
  return {
    payments,
    loading,
    error,
    hasMore,
    total,
    currentPage,
    loadMore,
    refresh,
    filterByStatus
  }
} 