'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'

type DomainSetupProps = {
  isOpen: boolean
  onClose: () => void
  domainId: string
  domainName: string
}

type ConfigStep = {
  title: string
  description: string
}

const SETUP_STEPS: ConfigStep[] = [
  {
    title: 'Bot Personality',
    description: 'How would you like your chatbot to interact with customers?',
  },
  {
    title: 'Business Details',
    description: 'Tell us about your business to help the bot provide accurate information.',
  },
  {
    title: 'Customer Service Preferences',
    description: 'Configure how your bot should handle customer inquiries.',
  },
  {
    title: 'Shipping Configuration',
    description: 'Set up your shipping preferences and delivery options.',
  },
]

export function DomainSetupDialog({ isOpen, onClose, domainId, domainName }: DomainSetupProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [config, setConfig] = useState({
    personality: '',
    tone: '',
    businessDescription: '',
    industry: '',
    responseStyle: '',
    handoff: '',
    shippingEnabled: false,
    shippingTime: '',
    shippingRegions: [] as string[],
    shippingCosts: {} as Record<string, { cost: number; currency: string }>,
    freeShippingThreshold: 0,
  })
  const { toast } = useToast()

  const handleNext = () => {
    if (currentStep < SETUP_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch(`/api/domains/${domainId}/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Domain configuration saved successfully',
        })
        onClose()
      } else {
        throw new Error('Failed to save configuration')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save domain configuration',
        variant: 'destructive',
      })
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Personality Type</Label>
              <Select
                value={config.personality}
                onValueChange={(value) => setConfig(prev => ({ ...prev, personality: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a personality type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional & Formal</SelectItem>
                  <SelectItem value="friendly">Friendly & Casual</SelectItem>
                  <SelectItem value="humorous">Humorous & Playful</SelectItem>
                  <SelectItem value="empathetic">Empathetic & Understanding</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Communication Tone</Label>
              <Select
                value={config.tone}
                onValueChange={(value) => setConfig(prev => ({ ...prev, tone: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                  <SelectItem value="supportive">Supportive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )
      case 1:
        return (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Business Description</Label>
              <Textarea
                placeholder="Describe your business and what you offer..."
                value={config.businessDescription}
                onChange={(e) => setConfig(prev => ({ ...prev, businessDescription: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Industry</Label>
              <Select
                value={config.industry}
                onValueChange={(value) => setConfig(prev => ({ ...prev, industry: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Response Style</Label>
              <Select
                value={config.responseStyle}
                onValueChange={(value) => setConfig(prev => ({ ...prev, responseStyle: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select response style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="concise">Concise & Direct</SelectItem>
                  <SelectItem value="detailed">Detailed & Thorough</SelectItem>
                  <SelectItem value="conversational">Conversational</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Human Handoff Preference</Label>
              <Select
                value={config.handoff}
                onValueChange={(value) => setConfig(prev => ({ ...prev, handoff: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select when to hand off to humans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quick">Quick Handoff (After 2-3 Messages)</SelectItem>
                  <SelectItem value="moderate">Moderate (After Basic Troubleshooting)</SelectItem>
                  <SelectItem value="extensive">Extensive Bot Handling</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Label>Enable Shipping</Label>
                <input
                  type="checkbox"
                  checked={config.shippingEnabled}
                  onChange={(e) => setConfig(prev => ({ ...prev, shippingEnabled: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </div>
            </div>

            {config.shippingEnabled && (
              <>
                <div className="space-y-2">
                  <Label>Estimated Shipping Time</Label>
                  <Select
                    value={config.shippingTime}
                    onValueChange={(value) => setConfig(prev => ({ ...prev, shippingTime: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select shipping time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-2">1-2 Business Days</SelectItem>
                      <SelectItem value="3-5">3-5 Business Days</SelectItem>
                      <SelectItem value="5-7">5-7 Business Days</SelectItem>
                      <SelectItem value="7-14">7-14 Business Days</SelectItem>
                      <SelectItem value="custom">Custom (Specify in Description)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Shipping Regions</Label>
                  <Select
                    value={config.shippingRegions.join(',')}
                    onValueChange={(value) => setConfig(prev => ({ 
                      ...prev, 
                      shippingRegions: value.split(',').filter(Boolean)
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select shipping regions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="domestic">Domestic Only</SelectItem>
                      <SelectItem value="domestic,international">Domestic & International</SelectItem>
                      <SelectItem value="worldwide">Worldwide</SelectItem>
                      <SelectItem value="custom">Custom Regions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Free Shipping Threshold (Optional)</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount for free shipping"
                    value={config.freeShippingThreshold || ''}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      freeShippingThreshold: parseFloat(e.target.value) || 0 
                    }))}
                  />
                </div>
              </>
            )}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configure {domainName}</DialogTitle>
          <DialogDescription>
            {SETUP_STEPS[currentStep].description}
          </DialogDescription>
        </DialogHeader>

        {renderStep()}

        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          <Button onClick={handleNext}>
            {currentStep === SETUP_STEPS.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 