'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MessageSquareMore, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RevealOnScroll } from '@/components/motion/parallax-scroll';

interface AnimatedTextProps {
  text: string;
  className?: string;
  wordClassName?: string;
}

// Optimized AnimatedText with reduced animation complexity
const AnimatedText = ({ text, className, wordClassName }: AnimatedTextProps) => {
  // State to track if this is mobile to simplify animations
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Check if we're on mobile to reduce animation complexity
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Split text into words
  const words = text.split(' ');

  // Simplified container animation
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: isMobile ? 0 : 0.12,
        delayChildren: isMobile ? 0 : 0.04,
        duration: isMobile ? 0.5 : undefined
      },
    },
  };

  // Simplified child animation
  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: isMobile ? 'tween' : 'spring',
        damping: 12,
        stiffness: 100,
        duration: isMobile ? 0.3 : undefined
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: isMobile ? 'tween' : 'spring',
        damping: 12,
        stiffness: 100,
        duration: isMobile ? 0.3 : undefined
      },
    },
  };

  // Simplified pulsate animation or disable completely on mobile
  const subtlePulsate = isMobile ? child : {
    visible: {
      opacity: 1,
      y: 0,
      scale: [1, 1.02, 1],
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
        scale: {
          repeat: 2, // Reduced repeat times
          repeatType: "reverse",
          duration: 2,
          ease: "easeInOut"
        }
      },
    },
    hidden: child.hidden
  };

  // If on mobile, render a simpler version without complex animations
  if (isMobile) {
    return (
      <div className={className}>
        {words.map((word, index) => (
          <span
            className={`${wordClassName} inline-block mr-[0.25em] ${index === 1 || index === 2 ? 'text-indigo-600 font-bold' : ''}`}
            key={index}
          >
            {word}
          </span>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, index) => (
        <motion.span
          variants={index === 1 || index === 2 ? subtlePulsate : child}
          className={`${wordClassName} inline-block mr-[0.25em] ${index === 1 || index === 2 ? 'text-indigo-600 font-bold' : ''}`}
          key={index}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

export function HeroSection() {
  return (
    <div className="container relative px-4 mx-auto flex flex-col justify-center min-h-[90vh] md:min-h-screen pt-16 md:pt-24 lg:pt-32">
      {/* Animated Background Elements - Simplified for performance */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 -left-20 w-72 h-72 bg-primary/10 rounded-full filter blur-3xl" />
        <div className="absolute bottom-10 -right-20 w-72 h-72 bg-secondary/10 rounded-full filter blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-full filter blur-3xl opacity-60" />
      </div>
      
      {/* Decorative floating elements - load later for mobile */}
      <div className="absolute hidden md:block top-32 left-12 w-20 h-20 opacity-80">
        <Image
          src="/images/decorative/dots-pattern.svg"
          alt=""
          width={80}
          height={80}
          className="object-contain"
          loading="lazy"
        />
      </div>
      
      <div className="absolute hidden md:block bottom-40 right-16 w-24 h-24 opacity-60 animate-float">
        <Image
          src="/images/decorative/rings.svg"
          alt=""
          width={96}
          height={96}
          className="object-contain"
          loading="lazy"
        />
      </div>
      
      <div className="absolute hidden sm:block top-1/3 right-8 w-16 h-16 opacity-60 animate-float-slow">
        <Image
          src="/images/decorative/square-dots.svg"
          alt=""
          width={64}
          height={64}
          className="object-contain"
          loading="lazy"
        />
      </div>
      
      <div className="relative z-10 flex flex-col items-center text-center gap-4 md:gap-6 max-w-5xl mx-auto">
        <RevealOnScroll>
          <div className="inline-flex items-center px-3 py-1 md:px-4 md:py-1.5 rounded-full border border-indigo-200/30 bg-indigo-50/30 dark:bg-indigo-900/10 backdrop-blur-sm text-xs md:text-sm font-medium text-indigo-600 dark:text-indigo-300 mb-4 md:mb-6">
            <Zap className="w-3 h-3 md:w-4 md:h-4 mr-1.5" /> Say goodbye to customer wait times
          </div>
        </RevealOnScroll>
        
        <RevealOnScroll delay={0.1}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] md:leading-tight">
            <AnimatedText 
              text="Instant Answers. Happy Customers." 
              className="inline-block"
              wordClassName="inline-block"
            />
          </h1>
        </RevealOnScroll>
        
        <RevealOnScroll delay={0.2}>
          <p className="text-lg sm:text-xl md:text-2xl text-foreground/80 max-w-2xl mt-3 md:mt-4 leading-relaxed px-1">
            Our AI responds to customer questions in seconds—not hours—with remarkable accuracy and a human touch.
          </p>
        </RevealOnScroll>
        
        <RevealOnScroll delay={0.3}>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-6 md:mt-8 w-full sm:w-auto">
            <Button asChild size="lg" className="rounded-full px-6 md:px-8 py-5 md:py-6 text-sm md:text-base font-medium shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all">
              <Link href="/auth/sign-up">
                Try for Free
                <ArrowRight className="ml-2 h-3.5 w-3.5 md:h-4 md:w-4" />
              </Link>
            </Button>
            {/* <Button asChild variant="outline" size="lg" className="rounded-full px-6 md:px-8 py-5 md:py-6 text-sm md:text-base hover:bg-background/50 hover:text-indigo-600 transition-all">
              <Link href="#how-it-works" className="flex items-center">
                <MessageSquareMore className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                Watch Demo
              </Link>
            </Button> */}
          </div>
        </RevealOnScroll>
        
        <RevealOnScroll delay={0.4}>
          <div className="relative mt-10 md:mt-16 w-full max-w-4xl rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl shadow-indigo-900/10 overflow-hidden group">
            {/* Dashboard Mockup - Optimized for mobile */}
            <div className="relative h-[240px] sm:h-[300px] md:h-[450px] lg:h-[600px] w-full">
              <Image
                src="/images/bot-ui.png"
                alt="AI Customer Support Dashboard"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1000px"
                className="object-cover object-top"
                priority={true}
                quality={80}
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </div>
            
            {/* Hover Animation Overlay - desktop only */}
            <div className="absolute bottom-4 md:bottom-6 left-0 right-0 mx-auto text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block">
              <span className="px-3 py-1.5 md:px-4 md:py-2 bg-indigo-600/90 text-white rounded-full text-xs md:text-sm font-medium">Interactive Demo</span>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </div>
  );
} 