'use client'

import React from 'react'
import { useFormContext } from 'react-hook-form'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PLANS, type PlanType } from '@/lib/stripe/config'

type PlanSelectionStepProps = {
  selectedPlan: string
  onPlanSelect: (planId: string) => void
  onContinue: () => void
  onBack: () => void
}

const PlanSelectionStep = ({ 
  selectedPlan, 
  onPlanSelect, 
  onContinue, 
  onBack 
}: PlanSelectionStepProps) => {
  const { register } = useFormContext()

  const handlePlanSelect = (planId: string) => {
    onPlanSelect(planId)
  }

  const isStepValid = !!selectedPlan

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Choose Your Plan
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Select the plan that best fits your business needs. You can change your plan anytime.
        </p>
      </div>

      <div className="grid gap-4 max-w-2xl mx-auto">
        {Object.entries(PLANS).map(([planKey, plan]) => {
          const planId = planKey.toLowerCase()
          const isSelected = selectedPlan === planId
          
          return (
            <div key={planKey} className="w-full">
              <Label 
                htmlFor={planId} 
                className="cursor-pointer block w-full"
              >
                <Card 
                  className={cn(
                    "p-6 transition-all cursor-pointer hover:shadow-lg border-2",
                    isSelected 
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  )}
                  onClick={() => handlePlanSelect(planId)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                          isSelected 
                            ? "border-indigo-500 bg-indigo-500" 
                            : "border-gray-300 dark:border-gray-600"
                        )}>
                          {isSelected && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {plan.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {plan.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {plan.price === 0 ? 'Free' : `$${plan.price / 100}`}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-gray-600 dark:text-gray-400">
                            /{plan.interval}
                          </span>
                        )}
                      </div>
                      
                      <ul className="space-y-2">
                        {plan.features.slice(0, 4).map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300">
                              {feature}
                            </span>
                          </li>
                        ))}
                        {plan.features.length > 4 && (
                          <li className="text-sm text-gray-600 dark:text-gray-400">
                            +{plan.features.length - 4} more features
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </Card>
              </Label>
              
              <Input
                type="radio"
                id={planId}
                className="hidden"
                {...register('selectedPlan')}
                value={planId}
                checked={isSelected}
                onChange={() => {}}
              />
            </div>
          )
        })}
      </div>

      <div className="flex flex-col items-center gap-3 mt-8 w-full max-w-[220px] mx-auto">
        <Button
          type="button"
          onClick={onContinue}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
          disabled={!isStepValid}
        >
          Continue
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="w-full"
        >
          Back
        </Button>
      </div>
    </div>
  )
}

export default PlanSelectionStep 