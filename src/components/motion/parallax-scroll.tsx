'use client';

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ParallaxProps {
  children: React.ReactNode;
  baseVelocity?: number;
  direction?: 'up' | 'down';
  className?: string;
  offset?: number;
}

export function ParallaxScroll({
  children,
  baseVelocity = 0.05,
  direction = 'up',
  className,
  offset = 100,
}: ParallaxProps) {
  const { scrollY } = useScroll();
  const y = useTransform(
    scrollY,
    [0, offset * 10],
    [0, direction === 'up' ? -offset : offset]
  );

  return (
    <motion.div
      style={{ y }}
      className={cn('will-change-transform', className)}
    >
      {children}
    </motion.div>
  );
}

interface ParallaxBackgroundProps {
  className?: string;
}

export function ParallaxBackground({ className }: ParallaxBackgroundProps) {
  // Only initialize on client-side to avoid hydration issues
  const [isMounted, setIsMounted] = useState(false);
  // Track if the device is mobile or not
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    
    // Check if device is mobile for simpler animation
    if (typeof window !== 'undefined') {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);
  
  if (!isMounted) return null;
  
  if (isMobile) {
    // Simpler static background for mobile
    return (
      <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
        <div className="absolute top-0 -left-20 w-72 h-72 bg-primary/20 rounded-full filter blur-3xl opacity-50" />
        <div className="absolute bottom-0 -right-20 w-72 h-72 bg-secondary/20 rounded-full filter blur-3xl opacity-50" />
      </div>
    );
  }
  
  // Full animation for desktop
  return <AnimatedParallaxBackground className={className} />;
}

// Separate component for the animated version
function AnimatedParallaxBackground({ className }: ParallaxBackgroundProps) {
  const { scrollY } = useScroll();
  
  // Reduce transform calculation complexity
  const y1 = useTransform(scrollY, [0, 1000], [0, 200], { clamp: true });
  const y2 = useTransform(scrollY, [0, 1000], [0, -200], { clamp: true });
  
  // Simplify by removing opacity transforms which cause more repaints
  
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      <motion.div
        style={{ y: y1 }}
        className="absolute top-0 -left-20 w-72 h-72 bg-primary/20 rounded-full filter blur-3xl will-change-transform"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute bottom-0 -right-20 w-72 h-72 bg-secondary/20 rounded-full filter blur-3xl will-change-transform"
      />
    </div>
  );
}

interface RevealOnScrollProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  className?: string;
  duration?: number;
  once?: boolean;
  distance?: number;
}

export function RevealOnScroll({
  children,
  direction = 'up',
  delay = 0,
  className,
  duration = 0.5,
  once = true,
  distance = 20,
}: RevealOnScrollProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Skip animation on mobile to improve performance
  if (!isMounted) return <div className={className}>{children}</div>;
  
  // Only apply animations on devices that can handle it well
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  if (isMobile) {
    return <div className={className}>{children}</div>;
  }
  
  let initial = {};
  
  switch (direction) {
    case 'up':
      initial = { opacity: 0, y: distance };
      break;
    case 'down':
      initial = { opacity: 0, y: -distance };
      break;
    case 'left':
      initial = { opacity: 0, x: distance };
      break;
    case 'right':
      initial = { opacity: 0, x: -distance };
      break;
  }

  return (
    <motion.div
      initial={initial}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once }}
      transition={{
        duration,
        delay,
        ease: [0.21, 0.45, 0.09, 1.0],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
} 