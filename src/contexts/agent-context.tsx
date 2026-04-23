'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Types for agent productivity data
export interface AgentStats {
  responseTime: number;       // Average response time in seconds
  resolvedConversations: number;
  activeConversations: number;
  customerSatisfaction: number; // 0-100 scale
  lastActive: Date;
}

export interface AgentQuickResponse {
  id: string;
  label: string;
  text: string;
  category: string;
  isCustom: boolean;
}

export interface AgentContextType {
  stats: AgentStats;
  quickResponses: AgentQuickResponse[];
  addQuickResponse: (response: Omit<AgentQuickResponse, 'id'>) => void;
  deleteQuickResponse: (id: string) => void;
  updateStat: (key: keyof AgentStats, value: any) => void;
  trackActivity: () => void;
  inactiveTime: number;
}

// Default values
const defaultStats: AgentStats = {
  responseTime: 0,
  resolvedConversations: 0,
  activeConversations: 0,
  customerSatisfaction: 0,
  lastActive: new Date(),
}

const defaultQuickResponses: AgentQuickResponse[] = [
  { id: '1', label: 'Greeting', text: 'Hello! How can I assist you today?', category: 'General', isCustom: false },
  { id: '2', label: 'Thank You', text: 'Thank you for your patience. I appreciate your understanding.', category: 'General', isCustom: false },
  { id: '3', label: 'Closing', text: 'Is there anything else I can help you with today?', category: 'General', isCustom: false },
  { id: '4', label: 'Transfer', text: "I'll need to transfer you to a specialist who can better assist with this question.", category: 'Process', isCustom: false },
  { id: '5', label: 'Wait', text: "I'll need a moment to look into this for you. Please give me a minute.", category: 'Process', isCustom: false },
  { id: '6', label: 'Follow-up', text: "I wanted to follow up on our previous conversation. Have you had a chance to try the solution we discussed?", category: 'Process', isCustom: false },
]

// Create the context
export const AgentContext = createContext<AgentContextType | undefined>(undefined)

// Provider component
export function AgentProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<AgentStats>(defaultStats)
  const [quickResponses, setQuickResponses] = useState<AgentQuickResponse[]>(() => {
    // Try to load from localStorage on client
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('agentQuickResponses')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          return Array.isArray(parsed) ? [...defaultQuickResponses, ...parsed.filter((r: AgentQuickResponse) => r.isCustom)] : defaultQuickResponses
        } catch (e) {
          console.error('Failed to parse saved quick responses', e)
        }
      }
    }
    return defaultQuickResponses
  })
  
  const [inactiveTime, setInactiveTime] = useState(0)
  
  // Track inactivity
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const seconds = Math.floor((now.getTime() - stats.lastActive.getTime()) / 1000)
      setInactiveTime(seconds)
    }, 5000) // Check every 5 seconds
    
    return () => clearInterval(interval)
  }, [stats.lastActive])
  
  // Save custom quick responses to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const customResponses = quickResponses.filter(r => r.isCustom)
      localStorage.setItem('agentQuickResponses', JSON.stringify(customResponses))
    }
  }, [quickResponses])
  
  // Functions to update state
  function addQuickResponse(response: Omit<AgentQuickResponse, 'id'>) {
    const newResponse = {
      ...response,
      id: Math.random().toString(36).substring(2, 9),
      isCustom: true
    }
    setQuickResponses(prev => [...prev, newResponse])
  }
  
  function deleteQuickResponse(id: string) {
    setQuickResponses(prev => {
      // Can only delete custom responses
      const response = prev.find(r => r.id === id)
      if (!response || !response.isCustom) return prev
      
      return prev.filter(r => r.id !== id)
    })
  }
  
  function updateStat(key: keyof AgentStats, value: any) {
    setStats(prev => ({
      ...prev,
      [key]: value
    }))
  }
  
  function trackActivity() {
    setStats(prev => ({
      ...prev,
      lastActive: new Date()
    }))
  }
  
  const contextValue: AgentContextType = {
    stats,
    quickResponses,
    addQuickResponse,
    deleteQuickResponse,
    updateStat,
    trackActivity,
    inactiveTime
  }
  
  return (
    <AgentContext.Provider value={contextValue}>
      {children}
    </AgentContext.Provider>
  )
}

// Hook for easy context use
export function useAgent() {
  const context = useContext(AgentContext)
  if (context === undefined) {
    throw new Error('useAgent must be used within an AgentProvider')
  }
  return context
} 