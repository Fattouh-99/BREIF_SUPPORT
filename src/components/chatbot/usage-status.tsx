'use client'

import React from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, Info } from 'lucide-react'
import { useSubscription } from '@/hooks/stripe/use-subscription'
import { cn } from '@/lib/utils'

interface UsageStatusProps {
  className?: string
  compact?: boolean
}

export const UsageStatus = ({ className, compact = false }: UsageStatusProps) => {
  const { subscriptionDetails, loading } = useSubscription()

  if (loading || !subscriptionDetails) return null

  const { requestsUsed = 0, requestLimit = 100, currentPlan } = subscriptionDetails
  const usagePercentage = (requestsUsed / requestLimit) * 100
  const isAtLimit = requestsUsed >= requestLimit
  const isNearLimit = usagePercentage >= 80

  // Show status if above 50% for awareness, with different styling for warnings
  if (usagePercentage < 50) return null

  return (
    <Alert className={cn(
      "border-l-4 text-xs",
      isAtLimit 
        ? "border-l-red-500 bg-red-50 dark:bg-red-950/20" 
        : isNearLimit
        ? "border-l-orange-500 bg-orange-50 dark:bg-orange-950/20"
        : "border-l-blue-500 bg-blue-50 dark:bg-blue-950/20",
      compact ? "p-3" : "p-4",
      className
    )}>
      <div className="flex items-start gap-2">
        {isAtLimit ? (
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        ) : (
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        )}
        
        <div className="flex-1 space-y-2">
          <AlertDescription>
            <div className={cn("font-medium", compact ? "text-xs" : "text-sm")}>
              {isAtLimit 
                ? 'Chatbot Limit Reached' 
                : isNearLimit 
                ? 'Approaching Limit'
                : 'Usage Status'}
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Monthly Usage</span>
                <span className="font-medium">
                  {requestsUsed} / {requestLimit}
                </span>
              </div>
              <Progress 
                value={Math.min(100, usagePercentage)} 
                className="h-1.5"
              />
            </div>

            {!compact && (
              <p className="text-xs text-muted-foreground mt-2">
                {isAtLimit 
                  ? "Your chatbot has stopped responding to customers until you upgrade."
                  : isNearLimit
                  ? `${Math.round(100 - usagePercentage)}% remaining this month.`
                  : `${Math.round(usagePercentage)}% used this month.`}
              </p>
            )}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  )
} 