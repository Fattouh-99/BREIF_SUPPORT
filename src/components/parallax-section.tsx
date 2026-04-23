'use client'

import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { ReactNode, useEffect, useState } from 'react'

interface ParallaxProps {
  children: ReactNode
  offset?: number
  className?: string
  direction?: 'up' | 'down'
  delay?: number
}

export function ParallaxSection({ 
  children, 
  offset = 50, 
  className = '',
  direction = 'up',
  delay = 0 
}: ParallaxProps) {
  const { scrollY } = useScroll()
  
  // More performant spring config with less bounciness
  const springConfig = { stiffness: 50, damping: 20, bounce: 0 }
  
  const y = useSpring(
    useTransform(
      scrollY, 
      [0, 1000], 
      [0, direction === 'up' ? -offset : offset]
    ),
    springConfig
  )

  return (
    <motion.div
      style={{ y }}
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        duration: 0.5,
        delay: delay,
        ease: "easeOut",
      }}
      className={`will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  )
}

// Optimized background with fewer animated elements
export function ParallaxBackground() {
  // Only initialize on client-side to avoid hydration issues
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  if (!isMounted) return null
  
  return <LazyParallaxBackground />
}

// Separate component to ensure it only renders on client
function LazyParallaxBackground() {
  const { scrollY } = useScroll()
  
  // Simplify spring config for better performance
  const springConfig = { stiffness: 30, damping: 20 }
  
  // Reduce the number of elements we're animating
  const y1 = useSpring(
    useTransform(scrollY, [0, 1000], [0, 200]),
    springConfig
  )
  
  const y2 = useSpring(
    useTransform(scrollY, [0, 1000], [0, -150]),
    springConfig
  )

  return (
    <>
      {/* Main background gradient - static, no animation needed */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1),transparent_50%)]" />
      
      {/* Reduce to just two key elements that move */}
      <motion.div 
        style={{ y: y1 }}
        className="absolute top-20 right-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 will-change-transform"
      />
      <motion.div 
        style={{ y: y2 }}
        className="absolute bottom-20 left-20 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 will-change-transform"
      />
    </>
  )
}

export function ParallaxContent() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 1000], [0, -80])
  
  return {
    y
  }
} 