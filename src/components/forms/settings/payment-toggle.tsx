import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import Section from '@/components/section-label'
import { useToast } from '@/components/ui/use-toast'
import { onUpdatePaymentEnabled } from '@/actions/settings'
import React, { useState } from 'react'
import { FieldValues, UseFormRegister } from 'react-hook-form'

type Props = {
  register: UseFormRegister<FieldValues>
  chatBot: {
    id: string
    paymentEnabled?: boolean
  } | null
  domainId: string
}

const PaymentToggle = ({ register, chatBot, domainId }: Props) => {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [enabled, setEnabled] = useState(chatBot?.paymentEnabled || false)

  const handleToggle = async (checked: boolean) => {
    try {
      setIsLoading(true)
      const response = await onUpdatePaymentEnabled(domainId, checked)
      
      if (response?.status === 200) {
        setEnabled(checked)
        toast({
          title: 'Success',
          description: response.message
        })
      } else {
        // Revert the toggle if update failed
        setEnabled(!checked)
        toast({
          title: 'Error',
          description: response?.message || 'Failed to update payment setting',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error updating payment setting:', error)
      // Revert the toggle if update failed
      setEnabled(!checked)
      toast({
        title: 'Error',
        description: 'Failed to update payment setting',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="w-full">
        <Section
          label="Payment Settings"
          message="Enable or disable payment processing in your chatbot"
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="payment-mode"
          checked={enabled}
          onCheckedChange={handleToggle}
          disabled={isLoading}
        />
        <Label htmlFor="payment-mode">
          {isLoading ? 'Updating...' : 'Allow chatbot to process payments'}
        </Label>
      </div>
    </div>
  )
}

export default PaymentToggle 