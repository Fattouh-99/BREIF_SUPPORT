'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Link2, Zap, CheckCircle, ArrowRight, Plug, Globe, Database } from 'lucide-react';
import Image from 'next/image';
import { RevealOnScroll } from '@/components/motion/parallax-scroll';
import { cn } from '@/lib/utils';

const platforms = [
  {
    name: 'Shopify',
    category: 'E-commerce',
    logo: '/images/platforms/shopify.svg',
    description: 'Product recommendations, order tracking, inventory status',
    features: ['Order Status', 'Product Search', 'Cart Recovery'],
    color: 'bg-green-500/10 border-green-200 text-green-700',
    setupTime: '5 min'
  },
  {
    name: 'WordPress',
    category: 'CMS',
    logo: '/images/platforms/wordpress.svg',
    description: 'Blog support, content questions, lead generation',
    features: ['Content Help', 'Lead Capture', 'FAQ Automation'],
    color: 'bg-blue-500/10 border-blue-200 text-blue-700',
    setupTime: '3 min'
  },
  {
    name: 'HubSpot',
    category: 'CRM',
    logo: '/images/platforms/hubspot.svg',
    description: 'Contact management, lead scoring, sales handoff',
    features: ['Lead Scoring', 'Contact Sync', 'Sales Handoff'],
    color: 'bg-orange-500/10 border-orange-200 text-orange-700',
    setupTime: '8 min'
  },
  {
    name: 'Slack',
    category: 'Communication',
    logo: '/images/platforms/slack.svg',
    description: 'Team notifications, internal alerts, collaboration',
    features: ['Team Alerts', 'Escalations', 'Internal Chat'],
    color: 'bg-purple-500/10 border-purple-200 text-purple-700',
    setupTime: '2 min'
  },
  {
    name: 'Stripe',
    category: 'Payments',
    logo: '/images/platforms/stripe.svg',
    description: 'Payment support, billing questions, subscription help',
    features: ['Payment Status', 'Billing Help', 'Refund Process'],
    color: 'bg-indigo-500/10 border-indigo-200 text-indigo-700',
    setupTime: '6 min'
  },
  {
    name: 'Zendesk',
    category: 'Support',
    logo: '/images/platforms/zendesk.svg',
    description: 'Ticket creation, support escalation, knowledge sync',
    features: ['Auto Tickets', 'Escalation', 'Knowledge Sync'],
    color: 'bg-teal-500/10 border-teal-200 text-teal-700',
    setupTime: '10 min'
  }
];

const industryUseCases = [
  {
    industry: 'E-commerce',
    icon: '🛍️',
    platforms: ['Shopify', 'WooCommerce', 'BigCommerce', 'Magento'],
    useCases: ['Product recommendations', 'Order tracking', 'Return process', 'Size guides'],
    image: '/images/industries/ecommerce-visual.svg'
  },
  {
    industry: 'SaaS',
    icon: '💻',
    platforms: ['HubSpot', 'Salesforce', 'Intercom', 'Zapier'],
    useCases: ['Feature explanations', 'Billing support', 'User onboarding', 'API help'],
    image: '/images/industries/saas-visual.svg'
  },
  {
    industry: 'Healthcare',
    icon: '🏥',
    platforms: ['Epic', 'Cerner', 'Calendly', 'Twilio'],
    useCases: ['Appointment booking', 'Insurance questions', 'Prescription help', 'HIPAA compliance'],
    image: '/images/industries/healthcare-visual.svg'
  }
];

interface PlatformCardProps {
  platform: typeof platforms[0];
  index: number;
}

function PlatformCard({ platform, index }: PlatformCardProps) {
  return (
    <RevealOnScroll delay={0.1 * index}>
      <motion.div 
        whileHover={{ y: -5, scale: 1.02 }}
        className="relative p-6 rounded-xl bg-background/60 backdrop-blur-sm border border-border/40 shadow-lg hover:shadow-xl transition-all duration-300 group"
      >
        {/* Platform Logo & Info */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-white border border-border/30 flex items-center justify-center shadow-sm">
              <Image
                src={platform.logo}
                alt={`${platform.name} logo`}
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{platform.name}</h3>
              <p className="text-sm text-foreground/60">{platform.category}</p>
            </div>
          </div>
          
          {/* Setup Time Badge */}
          <div className={cn("px-2 py-1 rounded-full text-xs font-medium", platform.color)}>
            {platform.setupTime} setup
          </div>
        </div>
        
        {/* Description */}
        <p className="text-sm text-foreground/70 mb-4">{platform.description}</p>
        
        {/* Features */}
        <div className="space-y-2 mb-4">
          {platform.features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
        
        {/* Connection Line */}
        <div className="absolute -right-4 top-1/2 w-8 h-0.5 bg-gradient-to-r from-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block" />
      </motion.div>
    </RevealOnScroll>
  );
}

interface IndustryUseCaseProps {
  useCase: typeof industryUseCases[0];
  index: number;
}

function IndustryUseCaseCard({ useCase, index }: IndustryUseCaseProps) {
  return (
    <RevealOnScroll delay={0.2 + 0.1 * index}>
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="p-6 rounded-xl bg-background/40 backdrop-blur-sm border border-border/30 shadow-md hover:shadow-lg transition-all"
      >
        <div className="flex items-start gap-4 mb-4">
          <div className="text-2xl">{useCase.icon}</div>
          <div>
            <h3 className="font-semibold text-lg mb-2">{useCase.industry}</h3>
            <div className="flex flex-wrap gap-1 mb-3">
              {useCase.platforms.map((platform, idx) => (
                <span key={idx} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  {platform}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          {useCase.useCases.map((use, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
              <span className="text-sm text-foreground/70">{use}</span>
            </div>
          ))}
        </div>
        
        {/* Industry Visual */}
        <div className="mt-4 h-16 flex items-center justify-center opacity-60">
          <Image
            src={useCase.image}
            alt={`${useCase.industry} illustration`}
            width={80}
            height={64}
            className="object-contain"
          />
        </div>
      </motion.div>
    </RevealOnScroll>
  );
}

export function IntegrationShowcaseSection() {
  return (
    <div className="container px-4 mx-auto relative">
      {/* Background decorations */}
      <div className="absolute top-20 right-10 w-40 h-40 bg-primary/5 rounded-full filter blur-3xl" />
      <div className="absolute bottom-20 left-10 w-32 h-32 bg-secondary/5 rounded-full filter blur-2xl" />
      
      {/* Decorative connection lines */}
      <div className="absolute top-1/3 left-1/4 w-32 h-0.5 bg-gradient-to-r from-primary/20 to-transparent hidden lg:block" />
      <div className="absolute bottom-1/3 right-1/4 w-24 h-0.5 bg-gradient-to-l from-secondary/20 to-transparent hidden lg:block" />
      
      {/* Header */}
      <div className="text-center mb-16 md:mb-20">
        <RevealOnScroll>
          <div className="inline-flex items-center px-4 py-2 mb-4 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Plug className="w-4 h-4 mr-2" /> 50+ Integrations
          </div>
        </RevealOnScroll>
        
        <RevealOnScroll delay={0.1}>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Connect Everything You Use
          </h2>
        </RevealOnScroll>
        
        <RevealOnScroll delay={0.2}>
          <p className="text-lg md:text-xl text-foreground/70 max-w-3xl mx-auto">
            Seamlessly integrate with your existing tools and platforms. Our AI assistant works where your customers are, with your data, in your workflow.
          </p>
        </RevealOnScroll>
      </div>
      
      {/* Platform Integrations Grid */}
      <div className="mb-16 md:mb-20">
        <RevealOnScroll delay={0.3}>
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Popular Platform Integrations
          </h3>
        </RevealOnScroll>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {platforms.map((platform, index) => (
            <PlatformCard key={index} platform={platform} index={index} />
          ))}
        </div>
      </div>
      
      {/* Industry Use Cases */}
      <div className="mb-16 md:mb-20">
        <RevealOnScroll delay={0.4}>
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Industry-Specific Solutions
          </h3>
        </RevealOnScroll>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {industryUseCases.map((useCase, index) => (
            <IndustryUseCaseCard key={index} useCase={useCase} index={index} />
          ))}
        </div>
      </div>
      
      {/* Integration Process Visual */}
      <RevealOnScroll delay={0.5}>
        <div className="relative bg-gradient-to-r from-primary/10 to-purple-600/10 rounded-2xl p-8 md:p-12 text-center border border-primary/20">
          <div className="relative z-10">
            <div className="flex justify-center items-center gap-8 mb-8">
              {/* Your Business */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-background border-2 border-primary/30 flex items-center justify-center">
                  <Globe className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm font-medium">Your Business</p>
              </div>
              
              {/* Connection */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-primary/40" />
                <Zap className="w-6 h-6 text-primary" />
                <div className="w-8 h-0.5 bg-primary/40" />
              </div>
              
              {/* Brief Support */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Database className="w-8 h-8" />
                </div>
                <p className="text-sm font-medium">Brief Support</p>
              </div>
              
              {/* Connection */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-primary/40" />
                <Zap className="w-6 h-6 text-primary" />
                <div className="w-8 h-0.5 bg-primary/40" />
              </div>
              
              {/* Customers */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-background border-2 border-primary/30 flex items-center justify-center">
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    💬
                  </motion.div>
                </div>
                <p className="text-sm font-medium">Happy Customers</p>
              </div>
            </div>
            
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              One Integration, Endless Possibilities
            </h3>
            <p className="text-foreground/70 mb-6 max-w-2xl mx-auto">
              Connect once and let our AI work across all your platforms, providing consistent, intelligent support wherever your customers interact with you.
            </p>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
            >
              View All Integrations
              <ArrowRight className="ml-2 w-5 h-5" />
            </motion.button>
          </div>
          
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <Image
              src="/images/decorative/network-pattern.svg"
              alt=""
              fill
              className="object-cover rounded-2xl"
            />
          </div>
        </div>
      </RevealOnScroll>
    </div>
  );
} 