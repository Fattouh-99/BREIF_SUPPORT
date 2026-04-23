'use client';

import React, { useState } from 'react';
import { Check, HelpCircle, Sparkles, Shield, Zap, CircleCheck } from 'lucide-react';
import Image from 'next/image';
import { RevealOnScroll } from '@/components/motion/parallax-scroll';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

const plans = [
  {
    name: 'Standard',
    description: 'Perfect for getting started with basic support features.',
    priceMonthly: 0,
    priceAnnually: 0,
    savings: '',
    tagline: 'Get started free',
    features: [
      'Up to 100 chatbot requests/month',
      '1 custom knowledge source',
      'Basic analytics',
      'Email support',
      'Chat widget customization',
      'Multiple language support',
    ],
    limitedFeatures: [
      'Priority support',
      'CRM integration',
      'Advanced analytics',
      'Dedicated support manager',
      'Custom AI model training',
    ],
    popular: false,
    ctaText: 'Get started free',
    ctaVariant: 'outline' as const,
    icon: CircleCheck,
  },
  {
    name: 'Pro',
    description: 'Ideal for growing businesses with higher support volume.',
    priceMonthly: 12,
    priceAnnually: 10,
    savings: '20%',
    tagline: 'Most popular choice',
    features: [
      'Everything in Standard, plus:',
      'Up to 1,000 chatbot requests/month',
      '5 custom knowledge sources',
      'Advanced analytics & reporting',
      'Priority email support (24h)',
      'Chat widget customization',
      'Multiple language support',
      'CRM integration',
    ],
    limitedFeatures: [
      'Dedicated support manager',
      'Custom AI model training',
    ],
    popular: true,
    ctaText: 'Start 14-day free trial',
    ctaVariant: 'default' as const,
    icon: Sparkles,
  }
];

interface FeatureWithTooltipProps {
  feature: string;
  included?: boolean;
}

const FeatureWithTooltip = ({ feature, included = true }: FeatureWithTooltipProps) => {
  // Only add tooltips to specific features that need explanation
  const tooltipContent = {
    'AI chat widget for your website': 'Add our AI assistant to your website with a simple copy-paste code snippet',
    'Custom knowledge sources': 'Upload documents, link to webpages, or connect to your existing knowledge base',
    'Advanced analytics & reporting': 'Get detailed insights on customer questions, AI performance, and satisfaction scores',
    'Custom AI model training': 'Get a model specifically fine-tuned for your business domain and terminology',
    'Multiple language support': 'AI assistant can communicate with your customers in 30+ languages',
    'Enterprise-grade security': 'SOC 2, GDPR, and HIPAA compliant with data encryption at rest and in transit',
    'SLA guarantees': 'Guaranteed uptime and performance metrics with financial penalties if we fail to deliver',
  }[feature];

  const className = cn(
    "flex items-center group",
    !included && "text-foreground/50"
  );

  const content = (
    <>
      {included ? (
        <Check className="w-5 h-5 mr-2 text-primary flex-shrink-0" />
      ) : (
        <div className="w-5 h-5 mr-2 border border-foreground/20 rounded-full flex-shrink-0" />
      )}
      <span>{feature}</span>
    </>
  );

  if (tooltipContent && included) {
    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger className={className}>
            {content}
            <HelpCircle className="w-4 h-4 ml-1.5 text-foreground/30 group-hover:text-foreground/70 transition-colors flex-shrink-0" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{tooltipContent}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={className}>
      {content}
    </div>
  );
};

const planNameMap: { [key: string]: string } = {
  'Standard': 'STANDARD',
  'Pro': 'PRO'
}

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="container px-4 mx-auto relative">
      {/* Background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-b from-primary/5 to-transparent rounded-full opacity-50 blur-3xl" />
      
      {/* Decorative elements */}
      <div className="absolute hidden md:block top-20 left-10 w-16 h-16 opacity-40 animate-float-slow">
        <Image
          src="/images/decorative/dots-pattern.svg"
          alt=""
          width={64}
          height={64}
          className="object-contain"
        />
      </div>
      
      <div className="absolute hidden md:block bottom-20 right-10 w-32 h-32 opacity-30">
        <Image
          src="/images/decorative/hexagon-pattern.svg"
          alt=""
          width={128}
          height={128}
          className="object-contain"
        />
      </div>
      
      <div className="text-center mb-10 sm:mb-16 relative">
        <RevealOnScroll>
          <Badge variant="outline" className="mb-3 sm:mb-4 px-3 py-1 sm:px-4 sm:py-1.5 border-primary/20 bg-primary/5">
            Transparent Pricing
          </Badge>
        </RevealOnScroll>
        
        <RevealOnScroll delay={0.1}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Choose the Perfect Plan for Your Business
          </h2>
        </RevealOnScroll>
        
        <RevealOnScroll delay={0.2}>
          <p className="text-base sm:text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto px-1">
            All plans include core features like AI chat, analytics, and continuous updates.
            Start your 14-day free trial today, no credit card required.
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={0.3} className="mt-6 sm:mt-8 flex items-center justify-center gap-3 sm:gap-4">
          <span className={cn("text-sm sm:text-base font-medium", !isAnnual ? "text-foreground" : "text-foreground/70")}>
            Monthly
          </span>
          
          <div className="relative">
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-primary"
              aria-label="Toggle annual billing"
            />
            {isAnnual && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -top-6 sm:-top-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
              >
                <span className="bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-300 text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md font-medium">
                  Save 20% 🎉
                </span>
                <div className="w-0 h-0 border-l-3 border-r-3 border-t-3 sm:border-l-4 sm:border-r-4 sm:border-t-4 border-t-green-100 dark:border-t-green-900/60 border-l-transparent border-r-transparent absolute left-1/2 -translate-x-1/2"></div>
              </motion.div>
            )}
          </div>
          
          <span className={cn("text-sm sm:text-base font-medium", isAnnual ? "text-foreground" : "text-foreground/70")}>
            Annual
          </span>
        </RevealOnScroll>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 relative z-10">
        {plans.map((plan, index) => {
          const PlanIcon = plan.icon;
          
          return (
            <RevealOnScroll 
              key={plan.name} 
              delay={0.1 * (index + 1)}
              className="h-full"
            >
              <motion.div 
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="h-full"
              >
                <Card 
                  className={cn(
                    "border border-border/40 backdrop-blur-sm relative overflow-hidden h-full flex flex-col",
                    plan.popular && "border-primary/50 shadow-lg shadow-primary/10 dark:shadow-primary/5"
                  )}
                >
                  
                  <CardHeader className="p-4 sm:p-6 pb-0">
                    <div className="flex items-center mb-2">
                      <div className="mr-2 p-1 sm:p-1.5 rounded-full bg-primary/10">
                        <PlanIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                      </div>
                      <span className="text-xs sm:text-sm text-primary/80">{plan.tagline}</span>
                    </div>
                    
                    <h3 className="text-xl sm:text-2xl font-bold">{plan.name}</h3>
                    <p className="text-sm sm:text-base text-foreground/70 mt-1 sm:mt-2 mb-3 sm:mb-4">{plan.description}</p>
                    
                    <div className="mb-4 sm:mb-6">
                      <div className="flex items-baseline">
                        <span className="text-xs sm:text-sm font-normal text-foreground/60 mr-1">$</span>
                        <span className="text-3xl sm:text-4xl font-bold">
                          {isAnnual ? plan.priceAnnually : plan.priceMonthly}
                        </span>
                        <span className="text-sm sm:text-base text-foreground/70 ml-1.5">/month</span>
                      </div>
                      {isAnnual && (
                        <div className="flex flex-wrap items-center mt-1 sm:mt-1.5 text-xs sm:text-sm">
                          <p className="text-foreground/70">
                            Billed annually (${plan.priceAnnually * 12}/year)
                          </p>
                          <Badge variant="outline" className="ml-1.5 sm:ml-2 text-[10px] sm:text-xs bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:border-green-800/30 dark:text-green-400">
                            Save {plan.savings}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 px-4 sm:px-6 py-0">
                    <div className="space-y-2 sm:space-y-3">
                      {plan.features.map((feature) => (
                        <FeatureWithTooltip key={feature} feature={feature} />
                      ))}
                      
                      {plan.limitedFeatures.length > 0 && (
                        <>
                          <div className="h-px bg-border/40 my-3 sm:my-4" />
                          <p className="text-xs sm:text-sm text-foreground/60 mb-1.5 sm:mb-2">Not included:</p>
                          {plan.limitedFeatures.map((feature) => (
                            <FeatureWithTooltip key={feature} feature={feature} included={false} />
                          ))}
                        </>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="mt-auto pt-4 p-4 sm:p-6">
                    <Button 
                      variant={plan.ctaVariant} 
                      className={cn(
                        "w-full rounded-full py-4 sm:py-6 text-sm sm:text-base",
                        plan.popular ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : ""
                      )}
                      onClick={() => {
                        // Map pricing section plan names to our internal plan names
                        const planId = planNameMap[plan.name] || plan.name.toUpperCase();
                        window.location.href = `/auth/sign-up?plan=${planId}`;
                      }}
                    >
                      {plan.ctaText}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </RevealOnScroll>
          );
        })}
      </div>

      <RevealOnScroll delay={0.6} className="mt-12 sm:mt-16 text-center">
        <div className="bg-muted/30 backdrop-blur-sm border border-border/40 rounded-lg sm:rounded-xl p-4 sm:p-6 max-w-3xl mx-auto relative">
          {/* Decorative small element */}
          <div className="absolute -top-6 -left-6 w-12 h-12 opacity-50">
            <Image
              src="/images/decorative/rings.svg"
              alt=""
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          
          <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">100% Risk-Free Guarantee</h3>
          <p className="text-sm sm:text-base text-foreground/70 mb-3 sm:mb-4">
            Try any plan for 14 days with full access to all features. Cancel anytime.
            No credit card required to start your trial.
          </p>
          
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 mt-3 sm:mt-4">
            <div className="flex items-center gap-2">
              <Image src="/images/visa.svg" alt="Visa" width={28} height={20} className="w-7 sm:w-9" />
              <Image src="/images/mastercard.svg" alt="Mastercard" width={28} height={20} className="w-7 sm:w-9" />
              <Image src="/images/amex.svg" alt="American Express" width={28} height={20} className="w-7 sm:w-9" />
            </div>
            <div className="h-4 w-px bg-border/40 hidden sm:block" />
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              <span className="text-xs sm:text-sm">Secure payment</span>
            </div>
            <div className="h-4 w-px bg-border/40 hidden sm:block" />
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              <span className="text-xs sm:text-sm">Instant access</span>
            </div>
          </div>
        </div>
      </RevealOnScroll>
    </div>
  );
} 