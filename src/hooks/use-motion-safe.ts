'use client'

import { useReducedMotion } from './use-reduced-motion'

export function useMotionSafe(props: any, options = { removeHover: true }) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    const safeProps = { ...props }
    delete safeProps.animate
    delete safeProps.initial
    delete safeProps.exit
    delete safeProps.transition
    delete safeProps.variants

    if (options.removeHover) {
      delete safeProps.whileHover
      delete safeProps.whileTap
      delete safeProps.whileFocus
      delete safeProps.whileDrag
    }

    return safeProps
  }

  return props
} 