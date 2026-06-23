'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Check, Mail } from 'lucide-react'
import { LandingNavbar } from '@/components/navbar/landing-navbar';
import Footer from '@/components/footer'
import Link from 'next/link'
import { SUPPORT_EMAIL } from '@/constants/support'

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
    loading: false,
    success: false,
    error: '',
    rateLimitRemaining: null as number | null
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Set loading state
    setFormState({...formState, loading: true, error: ''})
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formState.name,
          email: formState.email,
          company: formState.company,
          phone: formState.phone,
          message: formState.message
        })
      })

      const data = await response.json()

      // Extract rate limit info from headers
      const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining')

      if (!response.ok) {
        // Handle rate limiting specifically
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After')
          const retryTime = retryAfter ? Math.ceil(parseInt(retryAfter) / 60) : 60
          throw new Error(`Too many requests. Please wait ${retryTime} minutes before sending another message.`)
        }
        throw new Error(data.error || 'Failed to send message')
      }
      
      // On success, show success message
      setFormState({
        ...formState, 
        loading: false, 
        success: true,
        name: '',
        email: '',
        company: '',
        phone: '',
        message: '',
        rateLimitRemaining: rateLimitRemaining ? parseInt(rateLimitRemaining) : null
      })
    } catch (error) {
      setFormState({
        ...formState, 
        loading: false, 
        error: error instanceof Error ? error.message : 'There was an error sending your message. Please try again.'
      })
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormState({...formState, [name]: value})
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-background via-background to-background/80 overflow-hidden pt-16">

      <LandingNavbar />
      
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Contact Our Sales Team
            </h1>
            <p className="text-xl max-w-3xl mx-auto">
              Have questions about Brief Support? Our team is here to help you find the right solution for your business.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="col-span-1 md:col-span-1">
              <div className="border p-8 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold mb-6">Get in Touch</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <Mail className="w-5 h-5 mt-1 mr-3" />
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <p>{SUPPORT_EMAIL}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t">
                  <h3 className="font-medium mb-4">Looking for pricing?</h3>
                  <Link href="/#pricing" className="font-medium">
                    View our pricing plans →
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="col-span-1 md:col-span-2">
              {formState.success ? (
                <div className="p-8 rounded-xl shadow-sm flex flex-col items-center justify-center text-center h-full">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
                  <p className="text-lg mb-6">
                    Thank you for contacting us. One of our sales representatives will get back to you within 24 hours.
                  </p>
                  <Button onClick={() => setFormState({...formState, success: false})}>
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <div className="p-8 border rounded-xl shadow-sm">
                  <h2 className="text-xl font-semibold mb-6">Send Us a Message</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input 
                          id="name" 
                          name="name" 
                          placeholder="John Smith" 
                          required 
                          value={formState.name}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email" 
                          name="email" 
                          type="email" 
                          placeholder="your@email.com" 
                          required 
                          value={formState.email}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="company">Company Name</Label>
                        <Input 
                          id="company" 
                          name="company" 
                          placeholder="Your Company" 
                          required 
                          value={formState.company}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="phone">Phone Number (Optional)</Label>
                        <Input 
                          id="phone" 
                          name="phone" 
                          placeholder="+1 (555) 123-4567" 
                          value={formState.phone}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="message">Your Message</Label>
                      <Textarea 
                        id="message" 
                        name="message" 
                        placeholder="Tell us about your business needs and how we can help you..." 
                        rows={5}
                        required 
                        value={formState.message}
                        onChange={handleChange}
                      />
                    </div>
                    
                    {formState.error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {formState.error}
                      </div>
                    )}

                    {formState.rateLimitRemaining !== null && formState.rateLimitRemaining <= 2 && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
                        <strong>Rate limit notice:</strong> You have {formState.rateLimitRemaining} message{formState.rateLimitRemaining !== 1 ? 's' : ''} remaining this hour.
                      </div>
                    )}
                    
                    <Button 
                      type="submit" 
                      className="w-full py-6 text-lg"
                      disabled={formState.loading}
                    >
                      {formState.loading ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
} 