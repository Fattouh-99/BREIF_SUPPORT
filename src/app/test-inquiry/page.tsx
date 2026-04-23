'use client'

import React, { useState } from 'react'

const TestInquiryPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      alert('Please fill in all required fields')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/inquiries/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
          domainId: 'test-domain-id'
        }),
      })

      if (response.ok) {
        setIsSubmitted(true)
        console.log('Form submitted successfully!')
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Failed to send your message. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error)
      alert('Failed to send your message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          maxWidth: '500px'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            margin: '0 auto 20px',
            borderRadius: '50%',
            backgroundColor: '#e8f5e8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg style={{ width: '30px', height: '30px', color: '#4caf50' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 style={{ color: '#1F2937', marginBottom: '10px' }}>
            Message Sent Successfully!
          </h3>
          <p style={{ color: '#4B5563' }}>
            Thank you for contacting us. We'll get back to you as soon as possible.
          </p>
          <button 
            onClick={() => {
              setIsSubmitted(false)
              setFormData({ name: '', email: '', message: '' })
            }}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Send Another Message
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        maxWidth: '600px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ color: '#1F2937', marginBottom: '8px' }}>
            Test Inquiry Form - Full Height
          </h2>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>
            This form stretches to full height to test the layout. Fill it out to test functionality.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#374151',
              marginBottom: '4px'
            }}>
              Full Name <span style={{ color: 'red' }}>*</span>
            </label>
            <input 
              type="text"
              placeholder="Enter your full name" 
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none'
              }}
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>
          
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#374151',
              marginBottom: '4px'
            }}>
              Email Address <span style={{ color: 'red' }}>*</span>
            </label>
            <input 
              type="email"
              placeholder="Enter your email address" 
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none'
              }}
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#374151',
              marginBottom: '4px'
            }}>
              Your Message <span style={{ color: 'red' }}>*</span>
            </label>
            <textarea
              placeholder="Please describe your inquiry or question..."
              style={{
                flex: 1,
                width: '100%',
                padding: '12px',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                resize: 'none',
                minHeight: '120px'
              }}
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.5 : 1
            }}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
        
        <div style={{ 
          marginTop: '16px', 
          paddingTop: '16px', 
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '12px', color: '#6B7280' }}>
            Powered by <span style={{ color: '#6366f1' }}>Brief Support Test</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default TestInquiryPage 