'use client'

import React, { useState, useEffect } from 'react'
import Modal from '../mondal'
import SubscriptionForm from '../forms/settings/subscription-form'
import { Button } from '../ui/button'

export const PlanUpgradeModal = ({ 
  plan, 
  planData 
}: { 
  plan: string
  planData: any 
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleSuccess = () => {
    setIsOpen(false)
  }

  // Listen for payment success events to close the modal
  useEffect(() => {
    const handlePaymentSuccess = (event: CustomEvent) => {
      handleSuccess()
    }

    window.addEventListener('paymentSuccess', handlePaymentSuccess as any)
    return () => window.removeEventListener('paymentSuccess', handlePaymentSuccess as any)
  }, [])

  return (
    <Modal
      title="Choose A Plan"
      description="Select a plan that best suits your needs. You can upgrade or downgrade at any time."
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <Button variant={plan !== 'STANDARD' ? "outline" : "default"} className="w-full">
          {plan === 'STANDARD' ? 'Upgrade Plan' : 'Change Plan'}
        </Button>
      }
    >
      <SubscriptionForm plan={plan as 'STANDARD' | 'PRO'} />
    </Modal>
  )
} 