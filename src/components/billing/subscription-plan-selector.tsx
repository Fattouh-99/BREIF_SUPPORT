'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Crown, Check, Star, X } from 'lucide-react'
import { useSubscription } from '@/hooks/stripe/use-subscription'
import { EmbeddedPaymentForm } from './embedded-payment-form'
import { PLANS, type PlanType } from '@/lib/stripe/config'
import { cn } from '@/lib/utils'

export const SubscriptionPlanSelector = () => {
  const { subscriptionDetails, loading, refetch } = useSubscription()
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null)

  const handleUpgradeClick = (planId: PlanType) => {
    setSelectedPlan(planId)
    setShowPaymentForm(true)
  }

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false)
    setSelectedPlan(null)
    refetch()
  }

  const handlePaymentCancel = () => {
    setShowPaymentForm(false)
    setSelectedPlan(null)
  }

  if (loading || !subscriptionDetails) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="relative animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-2">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const { currentPlan } = subscriptionDetails

  const planOrder: PlanType[] = ['STANDARD', 'PRO']
  const getButtonText = (planId: PlanType) => {
    if (currentPlan === planId) return 'Current Plan'
    const currentIndex = planOrder.indexOf(currentPlan as PlanType)
    const targetIndex = planOrder.indexOf(planId)
    return targetIndex > currentIndex ? 'Upgrade' : 'Downgrade'
  }

  const canSelectPlan = (planId: PlanType) => {
    if (currentPlan === planId) return false
    const currentIndex = planOrder.indexOf(currentPlan as PlanType)
    const targetIndex = planOrder.indexOf(planId)
    return targetIndex > currentIndex // Only allow upgrades
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Choose Your Plan</h2>
        <p className="text-muted-foreground">
          Upgrade your subscription to unlock more features
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(PLANS).map(([planId, plan]) => {
          const isCurrentPlan = currentPlan === planId
          const isPopular = planId === 'PRO'
          const canSelect = canSelectPlan(planId as PlanType)

          return (
            <Card 
              key={planId} 
              className={cn(
                "relative transition-all duration-200",
                isCurrentPlan && "ring-2 ring-blue-500 shadow-lg",
                isPopular && "border-purple-200 shadow-lg",
                canSelect && "hover:shadow-lg cursor-pointer"
              )}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-4 py-1">
                    <Crown className="h-3 w-3 mr-1" />
                    Current Plan
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  {plan.name}
                  {!plan.isFree && <Crown className="h-5 w-5 text-yellow-500" />}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="pt-4">
                  <div className="text-4xl font-bold">
                    {plan.price === 0 ? 'Free' : `$${plan.price / 100}`}
                  </div>
                  {plan.price > 0 && (
                    <div className="text-sm text-muted-foreground">per month</div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Limits */}
                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Credits</span>
                    <span className="font-medium">{plan.credits}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Domains</span>
                    <span className="font-medium">
                      {plan.maxDomains}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Contacts</span>
                    <span className="font-medium">
                      {plan.maxContacts.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => canSelect && handleUpgradeClick(planId as PlanType)}
                  disabled={!canSelect}
                  className={cn(
                    "w-full",
                    isCurrentPlan && "bg-gray-100 text-gray-600 cursor-not-allowed",
                    isPopular && canSelect && "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
                    !isPopular && canSelect && "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  )}
                  variant={isCurrentPlan ? "secondary" : "default"}
                >
                  {getButtonText(planId as PlanType)}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Embedded Payment Form Dialog */}
      <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Complete Your Upgrade
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
    </div>
  )
} 