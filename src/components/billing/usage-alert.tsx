'use client'

import React from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, Zap, TrendingUp } from 'lucide-react'
import { useSubscription } from '@/hooks/stripe/use-subscription'
import { cn } from '@/lib/utils'

export const UsageAlert = () => {
  const { subscriptionDetails, loading, upgradeSubscription } = useSubscription()

  if (loading || !subscriptionDetails) return null

  const { requestsUsed = 0, requestLimit = 100, currentPlan } = subscriptionDetails
  const usagePercentage = (requestsUsed / requestLimit) * 100
  const isAtLimit = requestsUsed >= requestLimit
  const isNearLimit = usagePercentage >= 80

  // Don't show if usage is below 80%
  if (!isNearLimit) return null

  const handleUpgrade = async () => {
    if (currentPlan === 'STANDARD') {
      await upgradeSubscription('PRO', true) // Use checkout flow
    }
  }

  return (
    <Alert className={cn(
      "mb-6 border-l-4",
      isAtLimit 
        ? "border-l-red-500 bg-red-50 dark:bg-red-950/20" 
        : "border-l-orange-500 bg-orange-50 dark:bg-orange-950/20"
    )}>
      <div className="flex items-start gap-3">
        {isAtLimit ? (
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        ) : (
          <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
        )}
        
        <div className="flex-1 space-y-3">
          <AlertDescription className="text-base">
            <div className="font-semibold mb-2">
              {isAtLimit 
                ? '🚨 Chatbot Request Limit Reached' 
                : '⚠️ Approaching Request Limit'}
            </div>
            
            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between text-sm">
                <span>Monthly Usage</span>
                <span className="font-medium">
                  {requestsUsed.toLocaleString()} / {requestLimit.toLocaleString()} requests
                </span>
              </div>
              <Progress 
                value={Math.min(100, usagePercentage)} 
                className={cn(
                  "h-2",
                  isAtLimit ? "bg-red-100 dark:bg-red-900/20" : "bg-orange-100 dark:bg-orange-900/20"
                )}
              />
            </div>

            <p className="text-sm text-muted-foreground mb-3">
              {isAtLimit 
                ? "Your chatbot has stopped responding to customers. Upgrade now to continue providing support."
                : `You're using ${Math.round(usagePercentage)}% of your monthly allowance. Consider upgrading to avoid interruption.`}
            </p>

            {currentPlan === 'STANDARD' && (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={handleUpgrade}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Upgrade to Pro (1,000 requests/month)
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open('/dashboard/settings', '_blank')}
                >
                  View Details
                </Button>
              </div>
            )}

            {currentPlan === 'PRO' && (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open('mailto:support@briefsupport.com?subject=Usage-based billing inquiry', '_blank')}
                >
                  Contact Support for Usage-based Pricing
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open('/dashboard/settings', '_blank')}
                >
                  View Details
                </Button>
              </div>
            )}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  )
} 