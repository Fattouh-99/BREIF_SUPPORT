'use client'

import { useState } from 'react'
import { usePaymentHistory, Payment, PaymentStatus } from '@/hooks/billing/use-payment-history'
import { 
  Calendar, 
  Download, 
  ChevronDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  RefreshCw,
  X, 
  DollarSign,
  Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  format,
  parseISO
} from 'date-fns'

// Format currency string based on locale and currency
const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase()
  }).format(amount)
}

// Status badge with appropriate colors
const StatusBadge = ({ status }: { status: PaymentStatus }) => {
  // Define styling based on status
  const getStatusStyle = () => {
    switch(status) {
      case 'succeeded':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'failed':
      case 'canceled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'refunded':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
      case 'requires_action':
      case 'requires_confirmation':
      case 'requires_payment_method':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
    }
  }

  // Status icon
  const StatusIcon = () => {
    switch(status) {
      case 'succeeded':
        return <CheckCircle className="h-3 w-3 mr-1" />
      case 'pending':
        return <Clock className="h-3 w-3 mr-1" />
      case 'processing':
        return <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
      case 'failed':
      case 'canceled':
        return <X className="h-3 w-3 mr-1" />
      case 'refunded':
        return <RefreshCw className="h-3 w-3 mr-1" />
      case 'requires_action':
      case 'requires_confirmation':
      case 'requires_payment_method':
        return <AlertTriangle className="h-3 w-3 mr-1" />
      default:
        return <AlertTriangle className="h-3 w-3 mr-1" />
    }
  }

  return (
    <Badge className={`${getStatusStyle()} flex items-center font-medium py-1`}>
      <StatusIcon />
      <span className="capitalize">{status.replace('_', ' ')}</span>
    </Badge>
  )
}

// Payment history loading skeleton
const PaymentHistorySkeleton = () => {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 bg-gray-200 dark:bg-gray-700" />
              <Skeleton className="h-3 w-24 bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-6 w-20 bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Individual payment history item
const PaymentHistoryItem = ({ payment }: { payment: Payment }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <div className="flex items-start sm:items-center mb-3 sm:mb-0">
        <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mr-4">
          <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {payment.description}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-col sm:flex-row sm:items-center mt-1">
            <span>{format(parseISO(payment.date), 'MMM d, yyyy')}</span>
            {payment.paymentMethod && (
              <>
                <span className="hidden sm:inline mx-2">•</span>
                <span className="capitalize">{payment.paymentMethod}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        <div className="text-right">
          <div className="font-semibold text-gray-900 dark:text-white">
            {formatCurrency(payment.amount, payment.currency)}
          </div>
          <StatusBadge status={payment.status} />
        </div>
        
        {payment.receiptUrl && (
          <Button 
            size="icon" 
            variant="outline"
            className="h-8 w-8 p-0 ml-auto sm:ml-0"
            asChild
          >
            <a href={payment.receiptUrl} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" />
              <span className="sr-only">Download receipt</span>
            </a>
          </Button>
        )}
      </div>
    </div>
  )
}

// Empty state when no payments are found
const EmptyState = () => (
  <div className="py-8 flex flex-col items-center justify-center text-center">
    <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
      <DollarSign className="h-8 w-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No payment history</h3>
    <p className="text-gray-500 dark:text-gray-400 max-w-sm">
      You haven't made any payments yet. Your payment history will appear here once you make a purchase.
    </p>
  </div>
)

// Error state
const ErrorState = ({ message, onRetry }: { message: string, onRetry: () => void }) => (
  <div className="py-8 flex flex-col items-center justify-center text-center">
    <div className="h-16 w-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
      <AlertTriangle className="h-8 w-8 text-red-500" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Couldn't load payment history</h3>
    <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-4">
      {message || "There was an error loading your payment history. Please try again."}
    </p>
    <Button onClick={onRetry} variant="outline">
      <RefreshCw className="h-4 w-4 mr-2" />
      Try Again
    </Button>
  </div>
)

// Main component
export function PaymentHistory() {
  const { 
    payments, 
    loading, 
    error, 
    hasMore, 
    total,
    loadMore, 
    refresh,
    filterByStatus
  } = usePaymentHistory()
  
  const [statusFilter, setStatusFilter] = useState<PaymentStatus[]>([])
  
  // Status filter options - updated with new statuses
  const statusOptions: PaymentStatus[] = [
    'succeeded',
    'pending', 
    'processing', 
    'failed', 
    'canceled', 
    'refunded',
    'requires_action',
    'requires_confirmation'
  ]
  
  // Apply filters
  const filteredPayments = statusFilter.length > 0
    ? payments.filter(payment => statusFilter.includes(payment.status))
    : payments
  
  const toggleStatus = (status: PaymentStatus) => {
    const newFilter = statusFilter.includes(status)
      ? statusFilter.filter(s => s !== status)
      : [...statusFilter, status]
    
    setStatusFilter(newFilter)
    filterByStatus(newFilter)
  }

  return (
    <Card className="border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-slate-800">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-indigo-500" />
            Payment History
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            {total > 0 ? `${total} total transactions` : 'Recent transactions and invoices'}
          </CardDescription>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="h-4 w-4 mr-2" />
                <span>Filter</span>
                {statusFilter.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded">
                    {statusFilter.length}
                  </span>
                )}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {statusOptions.map(status => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={statusFilter.includes(status)}
                  onCheckedChange={() => toggleStatus(status)}
                >
                  <span className="capitalize">{status.replace('_', ' ')}</span>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="ghost" size="icon" onClick={() => refresh()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-2">
        {loading && payments.length === 0 ? (
          <PaymentHistorySkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={() => refresh()} />
        ) : filteredPayments.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {filteredPayments.map(payment => (
              <PaymentHistoryItem key={payment.id} payment={payment} />
            ))}
            
            {hasMore && (
              <div className="pt-4 text-center">
                <Button 
                  variant="outline" 
                  onClick={loadMore} 
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 