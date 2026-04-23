'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Brain, LineChart, Users, Shield, Zap, Globe, Check } from 'lucide-react';
import { RevealOnScroll } from '@/components/motion/parallax-scroll';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const features = [
  {
    icon: Brain,
    title: 'Smart AI Learning',
    description: 'Our AI continuously learns from every interaction to deliver increasingly accurate and helpful responses.',
    color: 'bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400',
    benefits: ['Learns from customer interactions', 'Adapts to your business language', 'Improves over time']
  },
  {
    icon: LineChart,
    title: 'Insight Analytics',
    description: 'Transform customer questions into actionable business insights with powerful visualization tools.',
    color: 'bg-violet-500/10 text-violet-500 dark:bg-violet-500/20 dark:text-violet-400',
    benefits: ['Identify common customer issues', 'Track resolution rates', 'Discover improvement areas']
  },
  {
    icon: Users,
    title: 'Human-like Responses',
    description: 'Engage customers with warm, personalized conversations that build trust and boost satisfaction.',
    color: 'bg-pink-500/10 text-pink-500 dark:bg-pink-500/20 dark:text-pink-400',
    benefits: ['Natural conversation flow', 'Contextual understanding', 'Personality matching']
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-grade encryption and compliance-ready systems keep your customer data completely secure.',
    color: 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400',
    benefits: ['GDPR & CCPA compliant', 'End-to-end encryption', 'Role-based access']
  },
  {
    icon: Zap,
    title: '5-Minute Integration',
    description: 'Connect with your existing tools in minutes—no coding required for most popular platforms.',
    color: 'bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 dark:text-amber-400',
    benefits: ['Copy-paste installation', '40+ platform integrations', 'API available']
  },
  {
    icon: Globe,
    title: 'Global Language Support',
    description: 'Communicate with customers in 30+ languages with automatic translation and localization.',
    color: 'bg-cyan-500/10 text-cyan-500 dark:bg-cyan-500/20 dark:text-cyan-400',
    benefits: ['30+ languages supported', 'Automatic detection', 'Cultural awareness']
  },
];

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  benefits: string[];
  delay: number;
}

function FeatureCard({ icon: Icon, title, description, color, benefits, delay }: FeatureCardProps) {
  return (
    <RevealOnScroll 
      delay={delay} 
      className="flex flex-col h-full"
    >
      <motion.div 
        whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
        className="h-full p-4 sm:p-6 rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm hover:border-primary/20 transition-all duration-300"
      >
        <div className={cn("p-2 sm:p-3 rounded-lg w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-3 sm:mb-4", color)}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold mb-1.5 sm:mb-2">{title}</h3>
        <p className="text-sm sm:text-base text-foreground/70 mb-3 sm:mb-4">{description}</p>
        
        {/* Feature Benefits */}
        <ul className="mt-auto space-y-1.5 sm:space-y-2">
          {benefits.map((benefit, idx) => (
            <li key={idx} className="flex items-start">
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary mt-0.5 mr-1.5 sm:mr-2 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-foreground/80">{benefit}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </RevealOnScroll>
  );
}

export function FeaturesSection() {
  return (
    <div className="container px-4 mx-auto relative">
      {/* Background decoration */}
      <div className="absolute -top-40 -right-20 w-64 h-64 bg-primary/5 rounded-full filter blur-3xl" />
      <div className="absolute -bottom-40 -left-20 w-64 h-64 bg-secondary/5 rounded-full filter blur-3xl" />
      
      {/* Decorative element - hexagon pattern */}
      <div className="absolute hidden lg:block right-0 top-20 w-40 h-40 opacity-20">
        <Image
          src="/images/decorative/hexagon-pattern.svg"
          alt=""
          width={200}
          height={200}
          className="object-contain"
        />
      </div>
      
      {/* Decorative element - rings */}
      <div className="absolute hidden sm:block left-10 bottom-40 w-20 h-20 opacity-40 animate-spin-slow">
        <Image
          src="/images/decorative/rings.svg"
          alt=""
          width={80}
          height={80}
          className="object-contain"
        />
      </div>
      
      <div className="text-center mb-10 sm:mb-16 relative">
        <RevealOnScroll>
          <div className="inline-flex items-center px-3 py-1 sm:px-4 sm:py-1.5 mb-3 sm:mb-4 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium">
            <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" /> Powerful AI Tools
          </div>
        </RevealOnScroll>
        
        <RevealOnScroll delay={0.1}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            AI Support That Feels Human
          </h2>
        </RevealOnScroll>
        
        <RevealOnScroll delay={0.2}>
          <p className="text-base sm:text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto px-1">
            Help your customers 24/7 with AI that understands questions, provides accurate answers, and 
            continuously improves with every interaction.
          </p>
        </RevealOnScroll>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            color={feature.color}
            benefits={feature.benefits}
            delay={0.1 * index}
          />
        ))}
      </div>
      
      {/* Feature Showcase Image */}
      <RevealOnScroll delay={0.4} className="mt-12 sm:mt-16 md:mt-20">
        <div className="relative w-full overflow-hidden">
          <div className="aspect-[16/9] relative rounded-xl sm:rounded-2xl overflow-hidden border border-primary/10 shadow-lg sm:shadow-xl">
            <Image
              src="/images/Intelligent_Conversations.png"
              alt="AI Platform Features"
              fill
              className="object-contain"
              quality={95}
              loading="lazy"
            />
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-tr from-background/90 via-background/40 to-transparent" />
            
            {/* Feature callouts - hidden on smallest screens */}
            <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 max-w-[250px] sm:max-w-md">
              <div className="p-3 sm:p-4 bg-background/80 backdrop-blur-md rounded-lg sm:rounded-xl border border-primary/20 shadow-md sm:shadow-lg">
                <h3 className="text-base sm:text-xl font-semibold mb-1 sm:mb-2 text-primary">Why customers love our AI</h3>
                <p className="text-xs sm:text-sm text-foreground/80">
                  "The AI responses are so natural, our customers can't tell if they're talking to a bot or one of our agents."
                </p>
                <div className="mt-2 sm:mt-3 flex items-center">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-300 mr-2 overflow-hidden">
                    <Image 
                      src="/images/avatar-1.jpg" 
                      alt="Customer" 
                      width={32} 
                      height={32}
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Add small decorative element to the top right of the showcase */}
            <div className="absolute top-4 right-4 w-12 h-12 opacity-60 animate-float">
              <Image
                src="/images/decorative/square-dots.svg"
                alt=""
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </RevealOnScroll>
    </div>
  );
} 