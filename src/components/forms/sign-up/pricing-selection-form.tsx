import React, { useState, useCallback } from 'react'
import { Check, ArrowRight, AlertCircle } from 'lucide-react'
import { FieldValues, UseFormRegister, UseFormSetValue } from 'react-hook-form'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useAuthContextHook } from '@/context/use-auth-context'

type Plan = {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  priceInCents: number;
};

const plans: Plan[] = [
  {
    id: 'standard',
    name: 'Standard',
    price: 'Free',
    priceInCents: 0,
    description: 'Perfect for getting started with basic features',
    features: [
      "Up to 100 chatbot requests/month",
      "Basic chatbot functionality",
      "Email support",
      "1 domain",
      "Basic analytics"
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '£12',
    priceInCents: 1200,
    description: 'Ideal for growing businesses with moderate traffic',
    features: [
      "Up to 1,000 chatbot requests/month",
      "Advanced chatbot features",
      "Priority email support",
      "5 domains",
      "Advanced analytics",
      "Custom branding",
      "API access"
    ]
  }
];

// Make the Props type exported so it can be imported elsewhere
export type PricingSelectionFormProps = {
  register: UseFormRegister<FieldValues>;
  selectedPlan: string;
  hasPaid: boolean;
  setValue: UseFormSetValue<FieldValues>;
  onContinue?: () => void;
};

const PricingSelectionForm = ({ register, selectedPlan, hasPaid, setValue, onContinue }: PricingSelectionFormProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { currentStep, setCurrentStep } = useAuthContextHook();
  
  // Updated process payment to call the onContinue callback
  const handleProcessPayment = useCallback(async () => {
    try {
      setIsProcessing(true);
      setErrorMessage(null);
      
      // For all plans, proceed to next step
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Call the continue callback to move to next step
      if (onContinue) {
        onContinue();
      }
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage('An error occurred while processing. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [onContinue]);
  
  // Set business as default plan if none selected
  React.useEffect(() => {
    if (!selectedPlan) {
      setValue('selectedPlan', 'business');
    }
  }, [selectedPlan, setValue]);

  const handleSelectPlan = (planId: string) => {
    setValue('selectedPlan', planId);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Choose Your Plan</h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Select the plan that best fits your business needs. All plans include our AI assistant, lead generation, and essential features.
        </p>
        <div className="flex items-center justify-center mt-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
            30-day money-back guarantee
          </span>
        </div>
      </div>

      <div className="flex flex-col space-y-6 max-w-lg mx-auto">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            onClick={() => handleSelectPlan(plan.id)}
            className={cn(
              "transform transition-all duration-300 hover:scale-105",
              selectedPlan === plan.id && "scale-105"
            )}
          >
            <Label htmlFor={plan.id} className="cursor-pointer block w-full">
              <Card className={cn(
                "overflow-hidden transition-all cursor-pointer hover:shadow-xl relative",
                selectedPlan === plan.id 
                  ? "border-2 border-indigo-500 dark:border-indigo-400 shadow-lg shadow-indigo-100 dark:shadow-none" 
                  : "dark:bg-gray-800 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              )}>
                {plan.id === 'business' && (
                  <div className="absolute top-0 inset-x-0 bg-indigo-600 text-white text-xs font-semibold py-1 text-center">
                    MOST POPULAR
                  </div>
                )}
                <div className={cn(
                  "p-6 border-b border-gray-200 dark:border-gray-700",
                  selectedPlan === plan.id && "bg-indigo-50 dark:bg-indigo-900/30",
                  plan.id === 'business' && "pt-8"
                )}>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                    <span className="ml-1 text-gray-600 dark:text-gray-300">/month</span>
                  </div>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">{plan.description}</p>
                </div>

                <div className={cn(
                  "p-6", 
                  selectedPlan === plan.id && "bg-white/50 dark:bg-gray-800/50"
                )}>
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="h-5 w-5 text-indigo-500 dark:text-indigo-400 mr-2 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-200 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Input
                  type="radio"
                  id={plan.id}
                  className="hidden"
                  {...register('selectedPlan')}
                  value={plan.id}
                  checked={selectedPlan === plan.id}
                  onChange={() => {}}
                />
              </Card>
            </Label>
          </div>
        ))}
      </div>

      {/* Payment button - only show if a plan is selected and not paid */}
      {selectedPlan && !hasPaid && (
        <div className="mt-8 space-y-4">
          <Button 
            onClick={handleProcessPayment}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-colors"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : (
              <>Continue</>
            )}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setCurrentStep(currentStep - 1)}
          >
            Back
          </Button>
          
          {errorMessage && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <div className="flex items-start text-red-600 dark:text-red-400">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Payment error</p>
                  <p className="text-sm mt-1">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PricingSelectionForm 