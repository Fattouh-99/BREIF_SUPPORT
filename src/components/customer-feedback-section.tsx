"use client";

import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { ArrowRight, Send, ThumbsUp, Lightbulb, MessageSquare, Heart, CheckCircle } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { submitCustomerFeedback } from '@/actions/admin';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// Define the form schema
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  featureType: z.string().min(1, { message: 'Please select a feature type' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
});

const perks = [
  {
    icon: Lightbulb,
    title: "Shape Our Roadmap",
    description: "Your ideas directly influence which features we build next",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  },
  {
    icon: CheckCircle,
    title: "Early Access",
    description: "Get first access to features you suggest that we implement",
    color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  },
  {
    icon: Heart,
    title: "Customized Experience",
    description: "Help us create the exact tools you need for your business",
    color: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  },
];

export function CustomerFeedbackSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      featureType: '',
      description: '',
    },
  });

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    try {
      // Call server action to submit feedback to admin dashboard
      const result = await submitCustomerFeedback(values);
      
      setIsSubmitting(false);
      
      if (result.success) {
        // Show success toast and animation
        setIsSuccess(true);
        
        toast({
          title: "Thanks for your suggestion!",
          description: "Your feedback helps us build a better product for everyone.",
          variant: "default",
        });
        
        // Reset the form
        form.reset();
        
        // Reset success state after animation completes
        setTimeout(() => {
          setIsSuccess(false);
        }, 3000);
      } else {
        throw new Error(result.error || 'Something went wrong');
      }
    } catch (error) {
      setIsSubmitting(false);
      toast({
        title: "Submission failed",
        description: "There was a problem submitting your feedback. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="container px-4 md:px-6 relative">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full blur-3xl opacity-50 -z-10" />
      
      {/* Decorative curved line */}
      <div className="absolute top-10 right-10 w-40 h-24 opacity-30 hidden md:block">
        <Image
          src="/images/decorative/curved-line.svg"
          alt=""
          width={160}
          height={96}
          className="object-contain"
        />
      </div>
      
      {/* Dots pattern decoration */}
      <div className="absolute bottom-10 left-10 w-20 h-20 opacity-30 hidden md:block">
        <Image
          src="/images/decorative/dots-pattern.svg"
          alt=""
          width={80}
          height={80}
          className="object-contain"
        />
      </div>
      
      <div className="flex flex-col items-center space-y-3 sm:space-y-4 text-center mb-8 sm:mb-12">
        <Badge variant="outline" className="px-3 py-1 sm:px-4 sm:py-1.5 border-primary/20 bg-primary/5">
          <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5 text-primary" /> 
          We Value Your Input
        </Badge>
        
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
          Help Us Build Your Dream AI Assistant
        </h2>
        
        <p className="max-w-[800px] text-base sm:text-lg md:text-xl text-muted-foreground px-1">
          What features would make our AI solution even better for your business?
          Your suggestions drive our product development.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-16">
        {perks.map((perk, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
            whileHover={{ y: -5 }}
            className="rounded-lg sm:rounded-xl p-4 sm:p-6 border border-border/40 shadow-sm bg-background/50 backdrop-blur-sm"
          >
            <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-3 sm:mb-4", perk.color)}>
              <perk.icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-1.5 sm:mb-2">{perk.title}</h3>
            <p className="text-sm sm:text-base text-foreground/70">{perk.description}</p>
          </motion.div>
        ))}
      </div>

      <div className="mx-auto max-w-5xl">
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 relative">
          {/* Connect the grid with a decorative element */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 hidden md:block">
            <div className="w-full h-full bg-secondary/10 rounded-full animate-pulse"></div>
          </div>
          
          <div className="relative order-2 md:order-1">
            <Card className="p-4 sm:p-6 bg-background/60 backdrop-blur-sm border border-primary/10 shadow-lg sm:shadow-xl">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
                  <div className="space-y-4 sm:space-y-5">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base text-foreground/80 font-medium">Your Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Jane Smith" className="py-4 sm:py-5 px-3 sm:px-4 text-sm sm:text-base" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs sm:text-sm" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base text-foreground/80 font-medium">Work Email</FormLabel>
                          <FormControl>
                            <Input placeholder="jane@company.com" className="py-4 sm:py-5 px-3 sm:px-4 text-sm sm:text-base" {...field} />
                          </FormControl>
                          <FormMessage className="text-xs sm:text-sm" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="featureType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base text-foreground/80 font-medium">Request Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="py-4 sm:py-5 px-3 sm:px-4 text-sm sm:text-base">
                                <SelectValue placeholder="Select request type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="new_feature">New Feature</SelectItem>
                              <SelectItem value="enhancement">Enhancement to Existing Feature</SelectItem>
                              <SelectItem value="integration">New Integration</SelectItem>
                              <SelectItem value="usability">Usability Improvement</SelectItem>
                              <SelectItem value="other">Other Suggestion</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs sm:text-sm" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base text-foreground/80 font-medium">
                            Tell us about your idea
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="I'd love if your AI could..."
                              className="resize-none min-h-[100px] sm:min-h-[140px] py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-xs sm:text-sm text-foreground/60">
                            Be specific about how this would help your workflow.
                          </FormDescription>
                          <FormMessage className="text-xs sm:text-sm" />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full py-4 sm:py-6 text-sm sm:text-base shadow-lg transition-all font-medium"
                    disabled={isSubmitting || isSuccess}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : isSuccess ? (
                      <span className="flex items-center">
                        <CheckCircle className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Suggestion Received!
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Send className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" /> Submit Suggestion
                      </span>
                    )}
                  </Button>
                </form>
              </Form>
            </Card>
            
            {/* Floating elements */}
            <div className="hidden md:block absolute -top-8 -left-8 w-16 h-16 bg-primary/10 rounded-full blur-xl" />
            <div className="hidden md:block absolute -bottom-8 -right-8 w-16 h-16 bg-secondary/10 rounded-full blur-xl" />
          </div>
          
          <div className="relative flex flex-col justify-center order-1 md:order-2">
            <div className="mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Recent Suggestions We've Implemented</h3>
              <p className="text-sm sm:text-base text-foreground/70 mb-4 sm:mb-6">
                We've already shipped these features that our customers requested:
              </p>
              
              <div className="space-y-3 sm:space-y-5">
                {[
                  {
                    title: "Multi-language Support",
                    description: "AI assistant now responds in 30+ languages",
                    implemented: "2 weeks ago",
                    requester: "Maria S."
                  },
                  {
                    title: "Data Export Options",
                    description: "Export conversation history in multiple formats",
                    implemented: "Last month",
                    requester: "Thomas K."
                  },
                  {
                    title: "Custom Welcome Messages",
                    description: "Personalize how your AI greets website visitors",
                    implemented: "2 months ago",
                    requester: "Alex P."
                  }
                ].map((item, i) => (
                  <div key={i} className="p-3 sm:p-4 rounded-lg border border-border/40 bg-background/30 backdrop-blur-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm sm:text-base font-medium">{item.title}</h4>
                        <p className="text-xs sm:text-sm text-foreground/70 mt-0.5 sm:mt-1">{item.description}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] sm:text-xs py-0.5 bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400">
                        Shipped
                      </Badge>
                    </div>
                    <div className="flex items-center mt-2 sm:mt-3 text-[10px] sm:text-xs text-foreground/60">
                      <span>{item.implemented}</span>
                      <span className="mx-1.5 sm:mx-2">•</span>
                      <span>Suggested by {item.requester}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 