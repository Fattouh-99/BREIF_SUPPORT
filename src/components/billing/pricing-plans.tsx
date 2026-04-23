'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Check, Star, Zap } from 'lucide-react'
import { usePlans, useSubscription } from '@/hooks/stripe/use-subscription'
import { cn } from '@/lib/utils'

interface PricingPlansProps {
  showCurrentPlan?: boolean
  onSelectPlan?: (planId: string) => void
}

export const PricingPlans = ({ showCurrentPlan = true, onSelectPlan }: PricingPlansProps) => {
  const { plans, loading: plansLoading } = usePlans()
  const { subscriptionDetails, createSubscription, upgradeSubscription, loading: subscriptionLoading } = useSubscription()

  if (plansLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading plans...</span>
      </div>
    )
  }

  const currentPlan = subscriptionDetails?.currentPlan || 'STANDARD'
  const isCurrentPlan = (planId: string) => planId === currentPlan

  const handleSelectPlan = async (planId: string) => {
    if (onSelectPlan) {
      onSelectPlan(planId)
      return
    }

    if (isCurrentPlan(planId)) {
      return // Already on this plan
    }

    // Check if it's an upgrade or new subscription
    if (currentPlan === 'STANDARD') {
      await createSubscription(planId)
    } else {
      await upgradeSubscription(planId)
    }
  }

  const getButtonText = (planId: string) => {
    if (isCurrentPlan(planId)) {
      return 'Current Plan'
    }
    
    if (planId === 'STANDARD') {
      return 'Get Started Free'
    }
    
    if (currentPlan === 'STANDARD') {
      return 'Upgrade Now'
    }
    
    return 'Switch Plan'
  }

  const getButtonVariant = (planId: string) => {
    if (isCurrentPlan(planId)) {
      return 'outline' as const
    }
    
    return 'default' as const
  }

  return (
    <div className="space-y-6">
      {showCurrentPlan && subscriptionDetails && (
        <div className="text-center">
          <Badge variant="secondary" className="mb-2">
            Currently on {subscriptionDetails.planDetails.name} Plan
          </Badge>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={cn(
              'relative transition-all duration-200 hover:shadow-lg',
              plan.isPopular && 'border-blue-500 shadow-md',
              isCurrentPlan(plan.id) && 'ring-2 ring-green-500'
            )}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 hover:bg-blue-600">
                  <Star className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}

            {isCurrentPlan(plan.id) && (
              <div className="absolute -top-3 right-4">
                <Badge className="bg-green-500 hover:bg-green-600">
                  <Check className="h-3 w-3 mr-1" />
                  Current
                </Badge>
              </div>
            )}

            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                {plan.name}
                {!plan.isFree && <Zap className="h-5 w-5 text-yellow-500" />}
              </CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="pt-4">
                <div className="text-4xl font-bold">{plan.priceFormatted}</div>
                {!plan.isFree && (
                  <div className="text-sm text-muted-foreground">
                    per {plan.interval}
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Features */}
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Plan Limits */}
              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Credits</span>
                  <span className="font-medium">{plan.credits}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Domains</span>
                  <span className="font-medium">
                    {plan.maxDomains === -1 ? 'Unlimited' : plan.maxDomains}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Contacts</span>
                  <span className="font-medium">
                    {plan.maxContacts === -1 ? 'Unlimited' : plan.maxContacts.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <Button
                className={cn(
                  'w-full mt-6',
                  plan.isPopular && !isCurrentPlan(plan.id) && 'bg-blue-500 hover:bg-blue-600',
                  isCurrentPlan(plan.id) && 'cursor-default'
                )}
                variant={getButtonVariant(plan.id)}
                onClick={() => handleSelectPlan(plan.id)}
                disabled={subscriptionLoading || isCurrentPlan(plan.id)}
              >
                {subscriptionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {getButtonText(plan.id)}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>All plans include a 30-day money-back guarantee.</p>
        <p>Cancel anytime. No questions asked.</p>
      </div>
    </div>
  )
} 