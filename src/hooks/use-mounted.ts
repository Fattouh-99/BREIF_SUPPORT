'use client'

import { useEffect, useState } from 'react'

/**
 * Custom hook to detect if component has mounted on client side
 * Prevents hydration mismatches by ensuring server/client render consistency
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted
} 