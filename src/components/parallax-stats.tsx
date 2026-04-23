'use client'

import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { ReactNode } from 'react'

interface ParallaxStatsProps {
  children: ReactNode
}

export function ParallaxStats({ children }: ParallaxStatsProps) {
  const { scrollY } = useScroll()
  const springConfig = { stiffness: 100, damping: 30, bounce: 0 }

  // Background parallax effects
  const y1 = useSpring(
    useTransform(scrollY, [500, 1500], [-150, 0]),
    springConfig
  )
  const y2 = useSpring(
    useTransform(scrollY, [500, 1500], [150, -150]),
    springConfig
  )

  const scale = useTransform(
    scrollY,
    [500, 1000],
    [1, 1.1]
  )
  const opacity = useTransform(
    scrollY,
    [500, 700, 900, 1100],
    [0.7, 0.9, 0.8, 1]
  )

  return (
    <div className="relative py-32 overflow-hidden">
      {/* Main background with parallax */}
      <motion.div 
        style={{ y: y1, scale }}
        className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900"
      />
      
      {/* Glowing orbs */}
      <motion.div 
        style={{ y: y2, opacity }}
        className="absolute inset-0"
      >
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
      </motion.div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
      
      {/* Content container */}
      <div className="container px-4 mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Proven <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-200 to-white">Results</span>
          </h2>
          <p className="text-xl text-primary-200 max-w-2xl mx-auto">
            Join thousands of businesses that trust Brief Support for their customer interactions
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
          {[
            { number: "99.9%", label: "Uptime Guaranteed", prefix: "", icon: "⚡️" },
            { number: "24/7", label: "Customer Support", prefix: "", icon: "🌍" },
            { number: "50%", label: "Conversion Boost", prefix: "+", icon: "📈" },
            { number: "10×", label: "ROI Average", prefix: "", icon: "💰" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-b from-primary-400/20 to-transparent rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-primary-900/50 backdrop-blur-sm rounded-2xl p-8 border border-primary-700/50 group-hover:border-primary-600/50 transition-all duration-300">
                <div className="text-3xl mb-4">{stat.icon}</div>
                <div className="text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-br from-white to-primary-200 bg-clip-text text-transparent">
                  {stat.prefix}{stat.number}
                </div>
                <div className="text-lg font-medium text-primary-200/90">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
} 