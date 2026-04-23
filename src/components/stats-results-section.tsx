'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Users, MessageSquare, Target, Zap, BarChart3, PieChart } from 'lucide-react';
import Image from 'next/image';
import { RevealOnScroll } from '@/components/motion/parallax-scroll';
import { cn } from '@/lib/utils';

const stats = [
  {
    icon: Clock,
    value: '85%',
    label: 'Faster Response Time',
    description: 'Average response time reduced from 4 hours to 8 seconds',
    color: 'bg-blue-500/10 text-blue-600',
    chart: '/images/charts/response-time.svg'
  },
  {
    icon: Users,
    value: '92%',
    label: 'Customer Satisfaction',
    description: 'Customers rate AI responses as helpful and accurate',
    color: 'bg-emerald-500/10 text-emerald-600',
    chart: '/images/charts/satisfaction.svg'
  },
  {
    icon: TrendingUp,
    value: '67%',
    label: 'Cost Reduction',
    description: 'Support costs decreased while handling 3x more queries',
    color: 'bg-purple-500/10 text-purple-600',
    chart: '/images/charts/cost-savings.svg'
  },
  {
    icon: MessageSquare,
    value: '24/7',
    label: 'Always Available',
    description: 'Handle customer questions even outside business hours',
    color: 'bg-amber-500/10 text-amber-600',
    chart: '/images/charts/availability.svg'
  }
];

const businessResults = [
  {
    company: 'TechFlow Solutions',
    industry: 'SaaS',
    result: '45% fewer support tickets',
    image: '/images/customers/customer-1.svg',
    metric: '2,000+ hours saved monthly'
  },
  {
    company: 'ShopEase',
    industry: 'E-commerce',
    result: '30% increase in conversions',
    image: '/images/customers/customer-2.svg',
    metric: '$50K additional revenue/month'
  },
  {
    company: 'HealthCare Plus',
    industry: 'Healthcare',
    result: '88% patient satisfaction',
    image: '/images/customers/customer-3.svg',
    metric: '500+ appointments scheduled daily'
  }
];

interface StatCardProps {
  stat: typeof stats[0];
  index: number;
}

function StatCard({ stat, index }: StatCardProps) {
  return (
    <RevealOnScroll delay={0.1 * index}>
      <motion.div 
        whileHover={{ y: -5, scale: 1.02 }}
        className="relative p-6 md:p-8 rounded-2xl bg-background/60 backdrop-blur-sm border border-border/40 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        {/* Icon */}
        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-4", stat.color)}>
          <stat.icon className="w-6 h-6" />
        </div>
        
        {/* Value */}
        <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
          {stat.value}
        </div>
        
        {/* Label */}
        <h3 className="text-lg font-semibold mb-3">{stat.label}</h3>
        
        {/* Description */}
        <p className="text-sm text-foreground/70 mb-4">{stat.description}</p>
        
        {/* Mini Chart */}
        <div className="h-12 flex items-end justify-center opacity-60">
          <Image
            src={stat.chart}
            alt={`${stat.label} chart`}
            width={120}
            height={48}
            className="object-contain"
          />
        </div>
        
        {/* Decorative element */}
        <div className="absolute top-4 right-4 w-8 h-8 opacity-20">
          <BarChart3 className="w-full h-full" />
        </div>
      </motion.div>
    </RevealOnScroll>
  );
}

interface BusinessResultProps {
  result: typeof businessResults[0];
  index: number;
}

function BusinessResultCard({ result, index }: BusinessResultProps) {
  return (
    <RevealOnScroll delay={0.2 + 0.1 * index}>
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="p-6 rounded-xl bg-background/40 backdrop-blur-sm border border-border/30 shadow-md hover:shadow-lg transition-all"
      >
        <div className="flex items-start gap-4">
          {/* Company Logo */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
            <Image
              src={result.image}
              alt={`${result.company} logo`}
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          
          {/* Content */}
          <div className="flex-1">
            <h4 className="font-semibold text-lg mb-1">{result.company}</h4>
            <p className="text-sm text-foreground/60 mb-2">{result.industry}</p>
            <p className="text-primary font-medium mb-1">{result.result}</p>
            <p className="text-xs text-foreground/70">{result.metric}</p>
          </div>
        </div>
      </motion.div>
    </RevealOnScroll>
  );
}

export function StatsResultsSection() {
  return (
    <div className="container px-4 mx-auto relative">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-full blur-3xl opacity-60" />
      
      {/* Decorative chart elements */}
      <div className="absolute top-20 right-10 w-24 h-24 opacity-20 hidden lg:block animate-float">
        <PieChart className="w-full h-full text-primary" />
      </div>
      
      <div className="absolute bottom-20 left-10 w-20 h-20 opacity-20 hidden lg:block animate-float-slow">
        <BarChart3 className="w-full h-full text-secondary" />
      </div>
      
      {/* Header */}
      <div className="text-center mb-16 md:mb-20">
        <RevealOnScroll>
          <div className="inline-flex items-center px-4 py-2 mb-4 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Target className="w-4 h-4 mr-2" /> Proven Results
          </div>
        </RevealOnScroll>
        
        <RevealOnScroll delay={0.1}>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            The Numbers Don't Lie
          </h2>
        </RevealOnScroll>
        
        <RevealOnScroll delay={0.2}>
          <p className="text-lg md:text-xl text-foreground/70 max-w-3xl mx-auto">
            Real metrics from businesses using our AI support solution. See the transformative impact on efficiency, costs, and customer satisfaction.
          </p>
        </RevealOnScroll>
      </div>
      
      {/* Stats Grid */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-16 md:mb-20">
        {stats.map((stat, index) => (
          <StatCard key={index} stat={stat} index={index} />
        ))}
      </div> */}
      
      {/* Business Results Section */}
      <div className="relative">
        {/* <RevealOnScroll delay={0.3}>
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Real Business Impact
            </h3>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              Companies across industries are seeing measurable improvements in their customer support operations
            </p>
          </div>
        </RevealOnScroll> */}
        
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {businessResults.map((result, index) => (
            <BusinessResultCard key={index} result={result} index={index} />
          ))}
        </div> */}
      </div>
      
      {/* Visual Comparison */}
      <RevealOnScroll delay={0.5} className="mt-16 md:mt-20">
        <div className="relative bg-gradient-to-r from-background/80 to-muted/40 rounded-2xl p-8 md:p-12 border border-border/40">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Before/After Text */}
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-6">
                Before vs. After Brief Support
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-red-700 dark:text-red-400">Before: 4-hour response times</p>
                    <p className="text-sm text-foreground/70">Customers waiting, tickets piling up, team overwhelmed</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-emerald-700 dark:text-emerald-400">After: 8-second AI responses</p>
                    <p className="text-sm text-foreground/70">Instant help, happy customers, team focused on complex issues</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Visual Chart */}
            <div className="relative h-64 flex items-center justify-center">
              <Image
                src="https://ucarecdn.com/fa320bca-c122-4c5a-b0ba-2fadae4e2317/chartimage.png"
                alt="Before and after comparison chart"
                width={300}
                height={200}
                className="object-contain rounded-md shadow-lg"
              />
              
              {/* Floating metrics */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold"
              >
                +85% Efficiency
              </motion.div>
              
              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                className="absolute bottom-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold"
              >
                -67% Costs
              </motion.div>
            </div>
          </div>
        </div>
      </RevealOnScroll>
    </div>
  );
} 