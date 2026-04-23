export const dynamic = 'force-dynamic'

import InfoBar from '@/components/infobar'
import BillingSettings from '@/components/settings/billing-settings'
import DarkModetoggle from '@/components/settings/dark-mode'
import React, { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { UnifiedProfileForm } from '@/components/settings/unified-profile-form'
import { PaymentHistory } from '@/components/settings/payment-history'
import { SubscriptionManager } from '@/components/billing/subscription-manager'
import { UsageAlert } from '@/components/billing/usage-alert'

// Loading components
const SettingsSkeleton = () => (
  <div className="space-y-8">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="space-y-4">
        <Skeleton className="h-8 w-[200px] bg-gray-200 dark:bg-gray-700" />
        <div className="space-y-3">
          <Skeleton className="h-10 w-full bg-gray-200 dark:bg-gray-700" />
          <Skeleton className="h-10 w-full bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    ))}
  </div>
)

const SubscriptionManagerSkeleton = () => (
  <Card className="shadow-sm dark:bg-slate-800 border-gray-200 dark:border-gray-700">
    <CardHeader>
      <Skeleton className="h-8 w-[250px] mb-2 bg-gray-200 dark:bg-gray-700" />
      <Skeleton className="h-4 w-[350px] bg-gray-200 dark:bg-gray-700" />
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-[200px] bg-gray-200 dark:bg-gray-700" />
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700" />
                <Skeleton className="h-4 w-[250px] bg-gray-200 dark:bg-gray-700" />
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-16 w-full bg-gray-200 dark:bg-gray-700" />
          <Skeleton className="h-16 w-full bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-[140px] bg-gray-200 dark:bg-gray-700" />
          <Skeleton className="h-10 w-[120px] bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </CardContent>
  </Card>
)

const PaymentHistorySkeleton = () => (
  <Card className="shadow-sm dark:bg-slate-800 border-gray-200 dark:border-gray-700">
    <CardHeader>
      <Skeleton className="h-8 w-[200px] mb-2 bg-gray-200 dark:bg-gray-700" />
      <Skeleton className="h-4 w-[300px] bg-gray-200 dark:bg-gray-700" />
    </CardHeader>
    <CardContent>
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
    </CardContent>
  </Card>
)

type Props = {}

const Page = (props: Props) => {
  return (
    <div className="flex flex-col flex-1 mr-5 ml-1">
      <InfoBar />
      <div 
        className="w-full chat-window rounded-xl shadow-lg flex-1 h-0 bg-slate-50 dark:bg-slate-900 overflow-y-auto"
        style={{ overscrollBehavior: 'none' }}
      >
        <div className="max-w-5xl mx-auto space-y-8 p-8">
          <UsageAlert />
          {/* <div className="rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800">
            <Suspense fallback={<BillingSettingsSkeleton />}>
              <BillingSettings />
            </Suspense>
          </div> */}
          
          <div className="rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Subscription Management</h2>
            <Suspense fallback={<SubscriptionManagerSkeleton />}>
              <SubscriptionManager />
            </Suspense>
          </div>
          
          <div className="rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Account Settings</h2>
            <Suspense fallback={<SettingsSkeleton />}>
              <div className="space-y-10">
                <DarkModetoggle />
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <UnifiedProfileForm />
                </div>
              </div>
            </Suspense>
          </div>
          
          <Suspense fallback={<PaymentHistorySkeleton />}>
            <PaymentHistory />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default Page
