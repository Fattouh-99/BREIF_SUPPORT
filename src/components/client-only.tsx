'use client'

import { useEffect, useState } from 'react'

type ClientOnlyProps = {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Component that only renders its children on the client
 * to avoid hydration mismatches
 */
export default function ClientOnly({ 
  children, 
  fallback = null 
}: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return fallback
  }

  return <>{children}</>
} 