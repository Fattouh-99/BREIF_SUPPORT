'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Brain, Zap, CheckCircle, ArrowRight, Clock, Users } from 'lucide-react';
import Image from 'next/image';
import { RevealOnScroll } from '@/components/motion/parallax-scroll';
import { cn } from '@/lib/utils';

const steps = [
  {
    number: '01',
    title: 'Customer Asks Question',
    description: 'A visitor types their question in your chat widget',
    icon: MessageSquare,
    image: '/images/process/step-1-question.svg',
    color: 'bg-blue-500/10 text-blue-600 border-blue-200',
    stat: '< 1 sec',
    statLabel: 'Response Time'
  },
  {
    number: '02', 
    title: 'AI Understands Context',
    description: 'Our AI analyzes the question and your business knowledge',
    icon: Brain,
    image: '/images/process/step-2-analysis.svg', 
    color: 'bg-purple-500/10 text-purple-600 border-purple-200',
    stat: '95%',
    statLabel: 'Accuracy Rate'
  },
  {
    number: '03',
    title: 'Instant Smart Response',
    description: 'Customer receives a helpful, personalized answer immediately',
    icon: Zap,
    image: '/images/process/step-3-response.svg',
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200', 
    stat: '24/7',
    statLabel: 'Availability'
  },
  {
    number: '04',
    title: 'Happy Customer',
    description: 'Problem solved instantly, leading to higher satisfaction',
    icon: CheckCircle,
    image: '/images/process/step-4-success.svg',
    color: 'bg-amber-500/10 text-amber-600 border-amber-200',
    stat: '87%',
    statLabel: 'Satisfaction'
  }
];

interface StepCardProps {
  step: typeof steps[0];
  index: number;
  isLast: boolean;
}

function StepCard({ step, index, isLast }: StepCardProps) {
  return (
    <div className="relative">
      <RevealOnScroll delay={0.1 * index} className="flex flex-col items-center text-center">
        {/* Step Number & Image */}
        <div className="relative mb-6">
          {/* Background circle */}
          <div className={cn(
            "w-20 h-20 md:w-24 md:h-24 rounded-full border-2 flex items-center justify-center relative z-10 bg-background",
            step.color
          )}>
            <step.icon className="w-8 h-8 md:w-10 md:h-10" />
          </div>
          
          {/* Step number badge */}
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
            {step.number}
          </div>
          
          {/* Process illustration */}
          {/* <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-16 h-16 opacity-60">
            <Image
              src={step.image}
              alt={`Step ${step.number} illustration`}
              width={64}
              height={64}
              className="object-contain"
            />
          </div> */}
        </div>
        
        {/* Content */}
        <div className="space-y-3 mt-8">
          <h3 className="text-xl md:text-2xl font-bold">{step.title}</h3>
          <p className="text-foreground/70 max-w-xs">{step.description}</p>
          
          {/* Stat */}
          <div className="pt-4">
            <div className="text-2xl font-bold text-primary">{step.stat}</div>
            <div className="text-sm text-foreground/60">{step.statLabel}</div>
          </div>
        </div>
      </RevealOnScroll>
      
      {/* Arrow connector */}
      {!isLast && (
        <div className="hidden lg:block absolute top-10 left-[calc(100%+1rem)] w-16 h-4">
          <ArrowRight className="w-8 h-8 text-primary/40 mx-auto" />
        </div>
      )}
    </div>
  );
}

export function HowItWorksSection() {
  return (
    <div className="container px-4 mx-auto relative">
      {/* Background decorations */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-primary/5 rounded-full filter blur-2xl" />
      <div className="absolute bottom-20 left-10 w-40 h-40 bg-secondary/5 rounded-full filter blur-3xl" />
      
      {/* Decorative elements */}
      <div className="absolute top-12 left-12 w-16 h-16 opacity-30 hidden md:block animate-float">
        <Image
          src="/images/decorative/hexagon-pattern.svg"
          alt=""
          width={64}
          height={64}
          className="object-contain"
        />
      </div>
      
      <div className="absolute bottom-16 right-16 w-20 h-20 opacity-40 hidden md:block animate-float-slow">
        <Image
          src="/images/decorative/square-dots.svg"
          alt=""
          width={80}
          height={80}
          className="object-contain"
        />
      </div>
      
      {/* Header */}
      <div className="text-center mb-16 md:mb-20">
        <RevealOnScroll>
          <div className="inline-flex items-center px-4 py-2 mb-4 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Clock className="w-4 h-4 mr-2" /> Works in Under 3 Seconds
          </div>
        </RevealOnScroll>
        
        <RevealOnScroll delay={0.1}>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            How It Works
          </h2>
        </RevealOnScroll>
        
        <RevealOnScroll delay={0.2}>
          <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto">
            See how our AI transforms customer support from hours of waiting to instant satisfaction
          </p>
        </RevealOnScroll>
      </div>
      
      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 relative">
        {steps.map((step, index) => (
          <StepCard 
            key={index}
            step={step}
            index={index}
            isLast={index === steps.length - 1}
          />
        ))}
      </div>
      
      {/* Bottom CTA with visual */}
      <RevealOnScroll delay={0.5} className="mt-16 md:mt-20">
        <div className="relative bg-gradient-to-r from-primary/10 to-purple-600/10 rounded-2xl p-8 md:p-12 text-center border border-primary/20">
          <div className="relative z-10">
            <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Join 5,000+ Businesses Already Using AI Support
            </h3>
            <p className="text-foreground/70 mb-6 max-w-2xl mx-auto">
              Start transforming your customer experience today with our intelligent AI assistant
            </p>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </motion.button>
          </div>
          
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <Image
              src="/images/decorative/grid-pattern.svg"
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