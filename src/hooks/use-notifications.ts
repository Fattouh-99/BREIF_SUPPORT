'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { pusherClient } from '@/lib/pusher'

export type Notification = {
  id: string
  type: string
  message: string
  read: boolean
  createdAt: string
  updatedAt: string
  domainId: string
  userId: string
  data?: any // Optional field for additional notification data
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const router = useRouter()
  const { userId: clerkUserId } = useAuth()
  const [dbUserId, setDbUserId] = useState<string | null>(null)

  // Cleanup old notifications
  useEffect(() => {    
    const cleanupOldNotifications = async () => {
      try {
        const response = await fetch('/api/notifications/cleanup', {
          method: 'DELETE',
        })
        if (response.ok) {
          const data = await response.json()
          console.log('Cleaned up old notifications:', data.message)
        }
      } catch (error) {
        console.error('Failed to cleanup old notifications:', error)
      }
    }

    // Run cleanup once when component mounts
    cleanupOldNotifications()
    
    // Set up an interval for future cleanups (every 24 hours)
    const cleanupInterval = setInterval(cleanupOldNotifications, 24 * 60 * 60 * 1000)

    return () => clearInterval(cleanupInterval)
  }, [])

  // First get the database user ID
  useEffect(() => {
    const getDbUserId = async () => {
      if (!clerkUserId) return
      try {
        const response = await fetch('/api/user/me')
        if (response.ok) {
          const data = await response.json()
          setDbUserId(data.id)
        }
      } catch (error) {
        console.error('Failed to get database user ID:', error)
      }
    }

    getDbUserId()
  }, [clerkUserId])

  useEffect(() => {
    if (!dbUserId || !pusherClient) return

    const channelName = `user-${dbUserId}`

    // Subscribe to user's notification channel
    const client = pusherClient!;
    const channel = client.subscribe(channelName)
    
    // Handle connection state
    client.connection.bind('connected', () => {
      setIsConnected(true)
    })

    client.connection.bind('disconnected', () => {
      setIsConnected(false)
    })

    // Handle new notifications
    channel.bind('notification', (notification: Notification) => {
      setNotifications(prev => {
        // Check if notification already exists to prevent duplicates
        const exists = prev.some(n => n.id === notification.id)
        if (exists) return prev
        return [notification, ...prev]
      })
    })

    // Handle connection errors
    client.connection.bind('error', (error: any) => {
      console.error('Pusher connection error:', error)
      setIsConnected(false)
    })

    return () => {
      channel.unbind_all()
      client.unsubscribe(channelName)
      client.connection.unbind_all()
    }
  }, [dbUserId])

  // Fetch notifications only once when dbUserId changes
  useEffect(() => {
    let isMounted = true;
    
    const fetchNotifications = async () => {
      if (!dbUserId) return;
      
      try {
        const response = await fetch('/api/notifications')
        if (!response.ok) {
          throw new Error('Failed to fetch notifications')
        }
        
        if (isMounted) {
          const data = await response.json()
          setNotifications(data)
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
      }
    }

    fetchNotifications()
    
    return () => {
      isMounted = false;
    }
  }, [dbUserId])

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ read: true }),
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === id ? { ...notification, read: true } : notification
          )
        )
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification => ({ ...notification, read: true }))
        )
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  return {
    notifications,
    setNotifications,
    markAsRead,
    markAllAsRead,
    isConnected,
  }
} 