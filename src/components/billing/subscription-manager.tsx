'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Crown, Check, CreditCard, Settings, X, ExternalLink, AlertTriangle, RefreshCw } from 'lucide-react'
import { useSubscription, useCustomerPortal } from '@/hooks/stripe/use-subscription'
import { EmbeddedPaymentForm } from './embedded-payment-form'
import { type PlanType } from '@/lib/stripe/config'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

export const SubscriptionManager = () => {
  const { subscriptionDetails, loading, cancelSubscription, refetch } = useSubscription()
  const { openCustomerPortal, loading: portalLoading } = useCustomerPortal()
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null)
  const [showPortalConfigAlert, setShowPortalConfigAlert] = useState(false)

  // Auto-refresh subscription details every 30 seconds to show updated usage
  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [refetch])

  const handleUpgradeClick = (planId: PlanType) => {
    setSelectedPlan(planId)
    setShowPaymentForm(true)
  }

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false)
    setSelectedPlan(null)
    refetch() // Refresh subscription details
  }

  const handlePaymentCancel = () => {
    setShowPaymentForm(false)
    setSelectedPlan(null)
  }

  const handleManageBilling = async () => {
    try {
      await openCustomerPortal()
    } catch (error) {
      // If the error is about portal configuration, show the alert
      if (error instanceof Error && error.message.includes('Customer portal is not configured')) {
        setShowPortalConfigAlert(true)
      }
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading subscription details...</span>
        </CardContent>
      </Card>
    )
  }

  if (!subscriptionDetails) {
    return (
      <Card>
        <CardContent className="p-8">
          <p className="text-center text-muted-foreground">
            Failed to load subscription details. Please try again.
          </p>
        </CardContent>
      </Card>
    )
  }

  const { currentPlan, planDetails, subscription, stripeSubscription, canUpgrade, canDowngrade } = subscriptionDetails

  const isActive = subscription?.status === 'active'
  const isCancelled = subscription?.cancelAtPeriodEnd
  const currentPeriodEnd = subscription?.currentPeriodEnd

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {planDetails.name} Plan
                {!planDetails.isFree && <Crown className="h-5 w-5 text-yellow-500" />}
              </CardTitle>
              <CardDescription>{planDetails.description}</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{planDetails.priceFormatted}</div>
              {!planDetails.isFree && (
                <div className="text-sm text-muted-foreground">/{planDetails.interval}</div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge 
              variant={isActive ? 'default' : 'secondary'}
              className={cn(
                isActive && !isCancelled && 'bg-green-500 hover:bg-green-600',
                isCancelled && 'bg-orange-500 hover:bg-orange-600'
              )}
            >
              {isCancelled ? 'Cancelled' : isActive ? 'Active' : subscription?.status || 'Free'}
            </Badge>
            {isCancelled && currentPeriodEnd && (
              <span className="text-sm text-muted-foreground">
                Ends {new Date(currentPeriodEnd).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Plan Features */}
          <div>
            <h4 className="font-medium mb-2">Plan Features</h4>
            <ul className="space-y-1 text-sm">
              {planDetails.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Plan Limits */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <div className="text-sm font-medium">Credits</div>
              <div className="text-2xl font-bold">{planDetails.credits}</div>
            </div>
            <div>
              <div className="text-sm font-medium">Domains</div>
              <div className="text-2xl font-bold">
                {planDetails.maxDomains === -1 ? '∞' : planDetails.maxDomains}
              </div>
            </div>
            {/* Requests Usage */}
            {subscriptionDetails.requestLimit && (
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Chatbot Requests</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={refetch}
                      disabled={loading}
                      className="h-5 w-5 p-0 hover:bg-muted"
                    >
                      <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-muted-foreground">
                      {subscriptionDetails.requestsUsed ?? 0} / {subscriptionDetails.requestLimit}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {subscriptionDetails.requestsRemaining ?? subscriptionDetails.requestLimit} remaining
                    </span>
                  </div>
                </div>
                <Progress 
                  value={Math.min(100, ((subscriptionDetails.requestsUsed ?? 0) / subscriptionDetails.requestLimit) * 100)} 
                  className="h-2"
                />
                {(subscriptionDetails.requestsUsed ?? 0) >= subscriptionDetails.requestLimit * 0.8 && (
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    {(subscriptionDetails.requestsUsed ?? 0) >= subscriptionDetails.requestLimit 
                      ? 'Request limit reached' 
                      : 'Approaching request limit'}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {canUpgrade && (
          <Button 
            onClick={() => handleUpgradeClick('PRO')}
            disabled={loading}
            className="bg-gradient-to-r text-white from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Crown className="h-4 w-4 mr-2" />
            Upgrade to Pro
          </Button>
        )}

        {!planDetails.isFree && (
          <Button
            variant="outline"
            onClick={handleManageBilling}
            disabled={portalLoading}
          >
            {portalLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4 mr-2" />
            )}
            Manage Billing
          </Button>
        )}

        {!planDetails.isFree && !isCancelled && (
          <Button
            variant="outline"
            onClick={cancelSubscription}
            disabled={loading}
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            Cancel Subscription
          </Button>
        )}
      </div>

      {/* Billing Info */}
      {stripeSubscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Billing Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current Period</span>
              <span>
                {new Date(stripeSubscription.current_period_start * 1000).toLocaleDateString()} - {' '}
                {new Date(stripeSubscription.current_period_end * 1000).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Next Billing Date</span>
              <span>
                {isCancelled 
                  ? 'Subscription will end' 
                  : 'Next payment'
                } on {new Date(stripeSubscription.current_period_end * 1000).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Embedded Payment Form Dialog */}
      <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Upgrade Your Subscription
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePaymentCancel}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedPlan && (
            <EmbeddedPaymentForm
              planId={selectedPlan}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Portal Configuration Alert */}
      {showPortalConfigAlert && (
        <Alert className="mt-4 border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <div className="space-y-2">
              <p className="font-medium">Customer portal is not configured</p>
              <p className="text-sm">
                The billing portal needs to be set up in your Stripe dashboard before customers can manage their subscriptions.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 mt-3">
                <a
                  href="https://dashboard.stripe.com/test/settings/billing/portal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Configure in Stripe Dashboard
                  <ExternalLink className="h-3 w-3" />
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPortalConfigAlert(false)}
                  className="w-fit text-xs text-amber-700 hover:text-amber-900"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
} 