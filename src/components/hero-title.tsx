'use client'

import { motion } from 'framer-motion'

export function HeroTitle() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold text-center">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-primary-800 to-primary-600">
          Brief Support
        </span>
      </h1>
    </motion.div>
  )
} 