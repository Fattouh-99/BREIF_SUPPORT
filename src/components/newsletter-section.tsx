'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, AlertCircle, ArrowRight, Star } from 'lucide-react';
import Image from 'next/image';
import { RevealOnScroll } from '@/components/motion/parallax-scroll';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { subscribeToNewsletter } from '@/actions/admin';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

type FormValues = z.infer<typeof formSchema>;

export function NewsletterSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Call server action to subscribe to newsletter
      const result = await subscribeToNewsletter(data.email);
      
      setIsSubmitting(false);
      
      if (result.success) {
        setIsSuccess(true);
        
        // Reset form
        form.reset();
        
        // Reset success message after 5 seconds
        setTimeout(() => {
          setIsSuccess(false);
        }, 5000);
      } else {
        throw new Error(result.error || 'Failed to subscribe');
      }
    } catch (error) {
      setIsSubmitting(false);
      setError('Failed to subscribe. Please try again.');
    }
  }

  return (
    <div className="container px-4 mx-auto relative">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/10 rounded-full filter blur-[100px] opacity-70" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-secondary/10 rounded-full filter blur-[100px] opacity-70" />
      
      {/* Decorative square dots */}
      <div className="absolute bottom-12 right-12 w-16 h-16 opacity-30 hidden md:block animate-float-slow">
        <Image
          src="/images/decorative/square-dots.svg"
          alt=""
          width={64}
          height={64}
          className="object-contain"
        />
      </div>
      
      <div className="relative mx-auto bg-gradient-to-b from-background/60 to-background/80 backdrop-blur-sm border border-primary/10 rounded-lg sm:rounded-2xl shadow-md sm:shadow-xl max-w-4xl overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[120px] sm:h-[200px] bg-gradient-to-br from-primary/20 via-secondary/20 to-background/0 opacity-30" />
        
        {/* Add decorative rings to the top-left corner */}
        <div className="absolute top-4 left-4 w-12 h-12 opacity-40 hidden sm:block">
          <Image
            src="/images/decorative/rings.svg"
            alt=""
            width={48}
            height={48}
            className="object-contain"
          />
        </div>
        
        <div className="relative grid md:grid-cols-5 gap-6 sm:gap-8 p-5 sm:p-8 md:p-12">
          {/* Left content area (3 columns) */}
          <div className="md:col-span-3 flex flex-col justify-center space-y-4 sm:space-y-6">
            <RevealOnScroll>
              <Badge variant="outline" className="inline-flex items-center px-3 py-1 sm:px-4 sm:py-1.5 mb-1 sm:mb-2 border-primary/20 bg-primary/5">
                <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5 text-primary" /> Exclusive Updates
              </Badge>
            </RevealOnScroll>
            
            <RevealOnScroll delay={0.1}>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                Stay Ahead with AI Insights
              </h2>
            </RevealOnScroll>
            
            <RevealOnScroll delay={0.2}>
              <p className="text-base sm:text-lg text-foreground/70">
                Join 10,000+ forward-thinking professionals receiving our monthly insights on:
              </p>
              
              <ul className="space-y-1.5 sm:space-y-2 mt-3 sm:mt-4">
                {[
                  'Latest AI customer service techniques',
                  'Actionable tips to reduce support costs',
                  'Early access to new features',
                  'Exclusive subscriber-only content'
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 mr-1.5 sm:mr-2 flex-shrink-0" />
                    <span className="text-sm sm:text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </RevealOnScroll>
            
            <RevealOnScroll delay={0.3}>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4 mt-1 sm:mt-2">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              placeholder="Enter your email"
                              className="py-5 sm:py-6 px-3 sm:px-4 rounded-md sm:rounded-lg border-border/40 bg-background shadow-sm"
                              {...field}
                              disabled={isSubmitting || isSuccess}
                              aria-label="Email address"
                            />
                          </FormControl>
                          <FormMessage className="ml-1 mt-1 text-xs sm:text-sm" />
                        </FormItem>
                      )}
                    />
                    
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        type="submit" 
                        className="rounded-md sm:rounded-lg px-5 sm:px-6 py-5 sm:py-6 w-full sm:w-auto shadow-md hover:shadow-lg transition-all text-sm sm:text-base font-medium"
                        disabled={isSubmitting || isSuccess}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Subscribing...
                          </span>
                        ) : isSuccess ? (
                          <span className="flex items-center">
                            <Check className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            Subscribed!
                          </span>
                        ) : (
                          <span className="flex items-center">
                            Subscribe <ArrowRight className="ml-1.5 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </span>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                  
                  {error && (
                    <div className="flex items-center text-red-500 mt-1 sm:mt-2 ml-1">
                      <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                      <p className="text-xs sm:text-sm">{error}</p>
                    </div>
                  )}
                </form>
              </Form>
              
              <p className="text-xs sm:text-sm text-foreground/50 mt-3 sm:mt-4">
                Your data is secure. We never share your information. Unsubscribe anytime.
              </p>
            </RevealOnScroll>
          </div>
          
          {/* Right image area (2 columns) - hidden on very small screens */}
          <div className="hidden sm:flex md:col-span-2 items-center justify-center relative order-first md:order-last">
            <RevealOnScroll delay={0.15} className="w-full h-full">
              <div className="relative h-[200px] sm:h-[260px] md:h-[340px] w-full">
                <Image
                  src="/images/iphonecorinna.png"
                  alt="AI newsletter updates on mobile"
                  fill
                  className="object-contain"
                  priority
                  quality={95}
                />
                
                {/* Floating newsletter elements */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="absolute top-8 sm:top-10 right-6 sm:right-10 bg-white dark:bg-gray-800 rounded-lg p-2 sm:p-3 shadow-lg"
                >
                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <Bell className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                    <span className="text-[10px] sm:text-xs font-medium">New AI Feature Released!</span>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="absolute bottom-8 sm:bottom-10 left-4 sm:left-6 bg-white dark:bg-gray-800 rounded-lg p-2 sm:p-3 shadow-lg max-w-[150px] sm:max-w-[180px]"
                >
                  <div className="text-[10px] sm:text-xs">
                    <p className="font-medium mb-0.5 sm:mb-1">Weekly AI Tip:</p>
                    <p className="text-foreground/70 text-[8px] sm:text-[10px]">Train your AI with real customer questions for 45% better answers</p>
                  </div>
                </motion.div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </div>
    </div>
  );
} 