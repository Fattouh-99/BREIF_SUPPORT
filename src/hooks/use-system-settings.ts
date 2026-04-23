'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface SystemSettings {
  canAccess: boolean
  registrationEnabled: boolean
  loginEnabled: boolean
  maintenanceMode: boolean
  maintenanceMessage: string | null
  forceLogoutAllUsers: boolean
  lastForceLogoutAt: string | null
}

export function useSystemSettings() {
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/system-settings', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store'
        })

        if (!response.ok) {
          throw new Error('Failed to fetch system settings')
        }

        const data = await response.json()
        if (data.success && data.data) {
          setSettings(data.data)
        } else {
          throw new Error('Invalid system settings response')
        }
      } catch (err) {
        console.error('Error fetching system settings:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  // Function to redirect if access is not allowed
  const enforceAccessControl = (type: 'login' | 'registration') => {
    if (!settings) return

    if (type === 'login' && !settings.loginEnabled) {
      router.push('/auth/login-disabled')
      return false
    }

    if (type === 'registration' && !settings.registrationEnabled) {
      router.push('/auth/registration-disabled')
      return false
    }

    if (settings.maintenanceMode) {
      router.push('/maintenance')
      return false
    }

    return true
  }

  return {
    settings,
    loading,
    error,
    enforceAccessControl
  }
} 