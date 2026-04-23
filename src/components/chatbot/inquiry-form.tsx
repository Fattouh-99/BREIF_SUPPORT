import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface InquiryFormProps {
  themeColor?: string
  titleColor?: string
  domainName: string
  domainId: string
  onSubmissionSuccess?: () => void
}

interface FormData {
  name: string
  email: string
  message: string
}

const InquiryForm = ({ 
  themeColor, 
  titleColor, 
  domainName, 
  domainId,
  onSubmissionSuccess 
}: InquiryFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)

    try {
      // Use test API endpoint if domainId is a test ID
      const isTestMode = domainId === 'test-domain-id' || domainId.includes('test')
      const apiEndpoint = isTestMode ? '/api/inquiries/test' : '/api/inquiries'
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
          domainId: domainId
        }),
      })

      if (response.ok) {
        setIsSubmitted(true)
        toast.success('Your message has been sent successfully!')
        onSubmissionSuccess?.()
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Failed to send your message. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error)
      toast.error('Failed to send your message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="h-full flex items-center justify-center p-4 bg-white">
        <div className="text-center">
          <div className="mb-4">
            <div 
              className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: `${themeColor || '#6366f1'}15` }}
            >
              <svg 
                className="w-8 h-8" 
                style={{ color: themeColor || '#6366f1' }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2" style={{ color: titleColor || '#1F2937' }}>
              Message Sent Successfully!
            </h3>
            <p className="text-sm text-gray-600">
              Thank you for contacting us. We'll get back to you as soon as possible.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col p-4 bg-white">
      <div className="mb-4">
        <h2 className="text-lg font-medium mb-2" style={{ color: titleColor || '#1F2937' }}>
          Send us a message
        </h2>
        <p className="text-sm text-gray-500">
          Fill out the form below and we'll get back to you as soon as possible.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <Input 
            type="text"
            placeholder="Enter your full name" 
            className="w-full p-3 bg-white rounded-lg shadow-sm border-gray-200 focus:border-gray-300 focus:ring-2 focus:ring-gray-200"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <Input 
            type="email"
            placeholder="Enter your email address" 
            className="w-full p-3 bg-white rounded-lg shadow-sm border-gray-200 focus:border-gray-300 focus:ring-2 focus:ring-gray-200"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
          />
        </div>
        
        <div className="flex-1 flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Message <span className="text-red-500">*</span>
          </label>
          <Textarea
            placeholder="Please describe your inquiry or question..."
            className="flex-1 w-full p-3 bg-white rounded-lg shadow-sm border border-gray-200 focus:border-gray-300 focus:ring-2 focus:ring-gray-200 resize-none"
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            required
          />
        </div>
        
        <Button
          type="submit"
          disabled={isSubmitting}
          style={{ backgroundColor: themeColor || '#6366f1' }}
          className="w-full text-white py-3 font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </Button>
      </form>
      
      <div className="mt-4 pt-4 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-500">
          Powered by <span style={{ color: themeColor || '#6366f1' }}>Brief Support</span>
        </p>
      </div>
    </div>
  )
}

export default InquiryForm 