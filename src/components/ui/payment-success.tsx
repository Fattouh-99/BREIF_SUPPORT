'use client'

import React from 'react';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

type PaymentSuccessProps = {
  selectedPlan: string;
  verified: boolean;
  isSignup?: boolean;
  onChangePlan?: () => void;
  onContinue: () => void;
};

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  selectedPlan,
  verified,
  isSignup = false,
  onChangePlan,
  onContinue,
}) => {
  const getPlanName = () => {
    switch (selectedPlan) {
      case 'standard':
        return 'Standard Plan';
      case 'pro':
        return 'Pro Plan';
      default:
        return 'Your Plan';
    }
  };

  const getPlanPrice = () => {
    switch (selectedPlan) {
      case 'standard':
        return 'Free';
      case 'pro':
        return '£15/month';
      default:
        return '';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto py-8 px-4">
      <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="h-16 w-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          
          <h2 className="text-xl font-semibold mb-1">Payment Successful!</h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {isSignup
              ? `Your ${getPlanName()} has been activated.`
              : `Your payment for ${getPlanName()} has been processed successfully.`}
          </p>
          
          <div className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md mb-6">
            <div className="flex justify-between">
              <span className="font-medium">{getPlanName()}</span>
              <span className="font-medium">{getPlanPrice()}</span>
            </div>
            {verified && (
              <div className="flex items-center mt-2 text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span className="text-xs">Payment verified</span>
              </div>
            )}
          </div>
          
          <div className="w-full space-y-3">
            <Button 
              onClick={onContinue}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {isSignup ? 'Continue Setup' : 'Continue to Conversations'}
            </Button>
            
            {onChangePlan && (
              <Button
                variant="outline"
                onClick={onChangePlan}
                className="w-full"
              >
                {isSignup ? 'Change Plan' : 'Manage Subscription'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess; 