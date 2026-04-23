import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SubscriptionManager } from '@/components/billing/subscription-manager'
import { SubscriptionPlanSelector } from '@/components/billing/subscription-plan-selector'
import { StripeConfigChecker } from '@/components/dev/stripe-config-checker'

export default function BillingPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Billing & Subscription</h1>
          <p className="text-xl text-muted-foreground">
            Manage your subscription and upgrade your plan with embedded payments
          </p>
        </div>

        {/* Development Configuration Checker */}
        <StripeConfigChecker />

        <Tabs defaultValue="manager" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="manager">Current Subscription</TabsTrigger>
            <TabsTrigger value="plans">Choose Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="manager" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold mb-2">Current Subscription</h2>
              <p className="text-muted-foreground">
                View your current plan details and manage your subscription
              </p>
            </div>
            <SubscriptionManager />
          </TabsContent>

          <TabsContent value="plans" className="space-y-6">
            <SubscriptionPlanSelector />
          </TabsContent>
        </Tabs>

        {/* Features Overview */}
        <div className="mt-16 pt-16 border-t">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Upgrade?</h2>
            <p className="text-xl text-muted-foreground">
              Unlock powerful features to grow your business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Processing</h3>
              <p className="text-muted-foreground">
                Secure embedded payments processed instantly without redirects
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
              <p className="text-muted-foreground">
                PCI-compliant payment processing with Stripe's security
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Flexible Billing</h3>
              <p className="text-muted-foreground">
                Monthly subscriptions with easy upgrade and cancellation options
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 