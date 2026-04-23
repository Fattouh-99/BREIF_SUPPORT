'use client'

import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { ReactNode } from 'react'

interface ParallaxFeaturesProps {
  children: ReactNode
}

export function ParallaxFeatures({ children }: ParallaxFeaturesProps) {
  const { scrollY } = useScroll()
  const springConfig = { stiffness: 100, damping: 30, bounce: 0 }

  // Background parallax effects
  const y1 = useSpring(
    useTransform(scrollY, [0, 1000], [-200, 200]),
    springConfig
  )
  const y2 = useSpring(
    useTransform(scrollY, [0, 1000], [200, -200]),
    springConfig
  )
  const scale = useTransform(
    scrollY,
    [0, 500],
    [1, 1.1]
  )
  const opacity = useTransform(
    scrollY,
    [0, 200, 400, 600],
    [0.5, 0.8, 0.6, 0.9]
  )

  return (
    <div className="relative py-40 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-primary-50/30 to-white" />
      <motion.div 
        style={{ y: y1, scale }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.1),transparent_50%)]"
      />
      <motion.div 
        style={{ y: y2, opacity }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(99,102,241,0.05),transparent_50%)]"
      />
      
      {/* Floating orbs */}
      <motion.div
        style={{ y: useSpring(useTransform(scrollY, [0, 500], [-50, 50]), springConfig) }}
        className="absolute top-20 right-20 w-96 h-96 bg-primary-100/30 rounded-full mix-blend-multiply filter blur-3xl"
      />
      <motion.div
        style={{ y: useSpring(useTransform(scrollY, [0, 500], [50, -50]), springConfig) }}
        className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-100/30 rounded-full mix-blend-multiply filter blur-3xl"
      />
      
      {/* Section dividers */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-white to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-white to-transparent" />
      
      <div className="container px-4 mx-auto relative">
        <motion.div 
          style={{ 
            y: useSpring(useTransform(scrollY, [0, 1000], [0, -50]), springConfig)
          }}
          className="relative z-10"
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
} 