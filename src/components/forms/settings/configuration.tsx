'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Loader } from '@/components/loader'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  // Personality Settings
  personality: z.string().min(1, 'Please select a personality'),
  tone: z.string().min(1, 'Please select a tone'),
  businessDescription: z.string().min(10, 'Business description must be at least 10 characters'),
  industry: z.string().min(1, 'Please select an industry'),
  responseStyle: z.string().min(1, 'Please select a response style'),
  handoffPreference: z.string().min(1, 'Please select a handoff preference'),

  // Shipping Settings
  shippingEnabled: z.boolean(),
  shippingTime: z.string().optional(),
  shippingRegions: z.array(z.string()),
  shippingCosts: z.record(z.string(), z.number()).optional(),
  freeShippingThreshold: z.number().nullable(),
})

type Props = {
  id: string
}

export default function Configuration({ id }: Props) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      personality: 'professional',
      tone: 'friendly',
      businessDescription: 'We strive to provide excellent service to our customers',
      industry: 'retail',
      responseStyle: 'conversational',
      handoffPreference: 'moderate',
      shippingEnabled: false,
      shippingTime: '3-5 business days',
      shippingRegions: ['domestic'],
      shippingCosts: {},
      freeShippingThreshold: null,
    },
  })

  // Load existing configuration
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch(`/api/domains/${id}/config`)
        if (response.ok) {
          const data = await response.json()
          if (data.chatBot) {
            form.reset({
              personality: data.chatBot.personality || 'professional',
              tone: data.chatBot.tone || 'friendly',
              businessDescription: data.chatBot.businessDescription || 'We strive to provide excellent service to our customers',
              industry: data.chatBot.industry || 'retail',
              responseStyle: data.chatBot.responseStyle || 'conversational',
              handoffPreference: data.chatBot.handoffPreference || 'moderate',
              shippingEnabled: data.chatBot.shippingEnabled || false,
              shippingTime: data.chatBot.shippingTime || '3-5 business days',
              shippingRegions: data.chatBot.shippingRegions || ['domestic'],
              shippingCosts: data.chatBot.shippingCosts || {},
              freeShippingThreshold: data.chatBot.freeShippingThreshold || null,
            })
          }
        }
      } catch (error) {
        console.error('Error loading configuration:', error)
      }
    }

    loadConfig()
  }, [id, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/domains/${id}/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Bot configuration saved successfully',
        })
      } else {
        throw new Error('Failed to save configuration')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save bot configuration',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const selectClass = "w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-medium">Personality Settings</h3>
              
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="personality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Personality Type</FormLabel>
                      <FormControl>
                        <select
                          className={selectClass}
                          {...field}
                        >
                          <option value="">Select personality type</option>
                          <option value="professional">Professional & Formal</option>
                          <option value="friendly">Friendly & Casual</option>
                          <option value="humorous">Humorous & Playful</option>
                          <option value="empathetic">Empathetic & Understanding</option>
                        </select>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Communication Tone</FormLabel>
                      <FormControl>
                        <select
                          className={selectClass}
                          {...field}
                        >
                          <option value="">Select tone</option>
                          <option value="formal">Formal</option>
                          <option value="friendly">Friendly</option>
                          <option value="casual">Casual</option>
                          <option value="enthusiastic">Enthusiastic</option>
                        </select>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your business and what you offer..."
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <FormControl>
                        <select
                          className={selectClass}
                          {...field}
                        >
                          <option value="">Select industry</option>
                          <option value="retail">Retail</option>
                          <option value="technology">Technology</option>
                          <option value="healthcare">Healthcare</option>
                          <option value="education">Education</option>
                          <option value="finance">Finance</option>
                          <option value="other">Other</option>
                        </select>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="responseStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Response Style</FormLabel>
                      <FormControl>
                        <select
                          className={selectClass}
                          {...field}
                        >
                          <option value="">Select response style</option>
                          <option value="concise">Concise & Direct</option>
                          <option value="detailed">Detailed & Thorough</option>
                          <option value="conversational">Conversational</option>
                        </select>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="handoffPreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Human Handoff Preference</FormLabel>
                      <FormControl>
                        <select
                          className={selectClass}
                          {...field}
                        >
                          <option value="">Select handoff preference</option>
                          <option value="quick">Quick Handoff (After 2-3 Messages)</option>
                          <option value="moderate">Moderate (After Basic Troubleshooting)</option>
                          <option value="extensive">Extensive Bot Handling</option>
                        </select>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-medium">Shipping Settings</h3>
              
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="shippingEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Shipping</FormLabel>
                        <FormDescription>
                          Allow the bot to handle shipping-related inquiries
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch('shippingEnabled') && (
                  <>
                    <FormField
                      control={form.control}
                      name="shippingTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Shipping Time</FormLabel>
                          <FormControl>
                            <select
                              className={selectClass}
                              {...field}
                            >
                              <option value="">Select shipping time</option>
                              <option value="1-2">1-2 Business Days</option>
                              <option value="3-5">3-5 Business Days</option>
                              <option value="5-7">5-7 Business Days</option>
                              <option value="7-14">7-14 Business Days</option>
                            </select>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="freeShippingThreshold"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Free Shipping Threshold</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter amount for free shipping"
                              value={field.value?.toString() || ''}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormDescription>
                            Leave empty if you don't offer free shipping
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full sm:w-[180px] h-[45px] sm:h-[50px] border border-indigo-500 disabled:opacity-50"
            >
              <Loader loading={loading}>Save Changes</Loader>
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 