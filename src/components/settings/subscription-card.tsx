'use client'

import React from 'react'
import { Label } from '../ui/label'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardTitle } from '../ui/card'
import { CheckCircle2 } from 'lucide-react'
import { useMounted } from '@/hooks/use-mounted'

type Props = {
  title: string
  description: string
  price: string
  onPayment(payment: string): void
  payment: string
  id: string
  features: string[]
  currentPlan?: boolean
}

const SubscriptionCard = ({
  title,
  description,
  price,
  onPayment,
  payment,
  id,
  features,
  currentPlan = false,
}: Props) => {
  const mounted = useMounted()
  
  // Determine if this card is selected (only after mount to prevent hydration mismatch)
  const isSelected = mounted && payment === id && !currentPlan

  return (
    <Label htmlFor={id}>
      <Card
        className={cn(
          'rounded-2xl overflow-hidden cursor-pointer border-4 w-full max-w-[300px] mx-auto',
          // Base border that's consistent between server and client
          'border-transparent',
          // Conditional styling only after mount to prevent hydration mismatch
          mounted && currentPlan && 'opacity-70 cursor-not-allowed',
          mounted && !currentPlan && 'cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700',
          mounted && isSelected && 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 dark:border-indigo-700'
        )}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-3">
              <Card className={cn('flex justify-center p-3 border-none bg-transparent')}>
                <div className="flex items-baseline gap-1">
                  <CardTitle className="text-2xl dark:text-gray-200">${price}</CardTitle>
                  <span className="text-sm text-gray-500 dark:text-gray-400">/month</span>
                </div>
              </Card>
              <div className="space-y-1">
                <CardDescription className="font-bold text-lg dark:text-gray-200">{title}</CardDescription>
                <CardDescription className="font-light text-sm dark:text-gray-400">
                  {description}
                </CardDescription>
              </div>
            </div>

            {currentPlan && (
              <span className="px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded-full">
                Current Plan
              </span>
            )}
          </div>

          <div className="mt-4 space-y-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                {feature}
              </div>
            ))}
          </div>

          {!currentPlan && (
            <input
              type="radio"
              name="subscription"
              id={id}
              checked={mounted && payment === id}
              onChange={() => onPayment(id)}
              className="hidden"
            />
          )}
        </CardContent>
      </Card>
    </Label>
  )
}

export default SubscriptionCard
