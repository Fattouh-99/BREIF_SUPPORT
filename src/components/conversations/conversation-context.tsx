'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode, useRef, useEffect, useMemo } from 'react'
import { toast } from 'sonner'

// Define the interface for quick responses
export interface QuickResponse {
  key: string;
  label: string;
  text: string;
}

// Default quick responses
export const DEFAULT_QUICK_RESPONSES: QuickResponse[] = [
  { key: 'greeting', label: 'Greeting', text: 'Hello! How can I assist you today?' },
  { key: 'thanks', label: 'Thank You', text: 'Thank you for your patience. I appreciate your understanding.' },
  { key: 'closing', label: 'Closing', text: 'Is there anything else I can help you with today?' },
  { key: 'transfer', label: 'Transfer', text: "I'll need to transfer you to a specialist who can better assist with this question." },
  { key: 'wait', label: 'Wait', text: "I'll need a moment to look into this for you. Please give me a minute." },
]

// Define the context interface
interface ConversationContextType {
  // Quick responses
  quickResponses: QuickResponse[];
  showQuickResponses: boolean;
  setShowQuickResponses: (show: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedResponseIndex: number;
  setSelectedResponseIndex: (index: number) => void;
  filteredResponses: QuickResponse[];
  insertQuickResponse: (response: QuickResponse) => void;
  
  // Input references
  inputRef: React.RefObject<HTMLTextAreaElement>;
  
  // Activity tracking
  lastActive: Date;
  updateLastActive: () => void;
  
  // Sidebar state
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  
  // Handle input change
  handleInputChange: (value: string) => void;
  
  // Prevent refresh functionality
  preventRefresh?: (prevent: boolean) => void;
}

// Create the context with a default value
const ConversationContext = createContext<ConversationContextType | null>(null)

// Define the provider component
export function ConversationContextProvider({ children }: { children: ReactNode }) {
  // State for quick responses
  const [quickResponses] = useState<QuickResponse[]>(DEFAULT_QUICK_RESPONSES)
  const [showQuickResponses, setShowQuickResponses] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedResponseIndex, setSelectedResponseIndex] = useState(0)
  
  // Input reference
  const inputRef = useRef<HTMLTextAreaElement>(null)
  
  // Activity tracking with debouncing
  const [lastActive, setLastActive] = useState(new Date())
  const lastActiveRef = useRef(new Date())
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const activityIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const updateLastActive = useCallback(() => {
    // Update the ref immediately so other code can reference it
    lastActiveRef.current = new Date()
    
    // Debounce the state update to prevent rapid re-renders
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      // Only update state if there's a significant difference (>1s)
      if (new Date().getTime() - lastActive.getTime() > 1000) {
        setLastActive(lastActiveRef.current)
      }
      updateTimeoutRef.current = null
    }, 1000)
  }, [lastActive])
  
  // Prevent refresh functionality
  const preventRefreshRef = useRef(false)
  const preventRefresh = useCallback((prevent: boolean) => {
    preventRefreshRef.current = prevent;
  }, [])
  
  // Comprehensive cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up all timeouts and intervals
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
        updateTimeoutRef.current = null
      }
      if (activityIntervalRef.current) {
        clearInterval(activityIntervalRef.current)
        activityIntervalRef.current = null
      }
    }
  }, [])
  
  // Sidebar state
  const [isExpanded, setIsExpanded] = useState(true)
  
  // Filter responses based on search query
  const filteredResponses = useMemo(() => {
    if (!searchQuery.trim()) return quickResponses
    return quickResponses.filter(response =>
      response.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      response.key.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [quickResponses, searchQuery])
  
  // Insert quick response function
  const insertQuickResponse = useCallback((response: QuickResponse) => {
    if (inputRef.current) {
      const currentValue = inputRef.current.value
      const newValue = currentValue ? `${currentValue}\n\n${response.text}` : response.text
      inputRef.current.value = newValue
      inputRef.current.focus()
      
      // Trigger input event for form handling
      const event = new Event('input', { bubbles: true })
      inputRef.current.dispatchEvent(event)
    }
    setShowQuickResponses(false)
    setSearchQuery('')
    updateLastActive()
  }, [updateLastActive])
  
  // Handle input change
  const handleInputChange = useCallback((value: string) => {
    updateLastActive()
  }, [updateLastActive])
  
  // Set up inactivity notification with proper cleanup
  useEffect(() => {
    activityIntervalRef.current = setInterval(() => {
      const now = new Date()
      const timeSinceActive = now.getTime() - lastActiveRef.current.getTime()
      
      // If inactive for more than 3 minutes, show notification
      if (timeSinceActive > 3 * 60 * 1000) {
        toast.info('Conversation has been inactive for 3 minutes')
        // Update ref after notification to prevent repeated notifications
        lastActiveRef.current = new Date()
      }
    }, 180000) // Check every 3 minutes
    
    return () => {
      if (activityIntervalRef.current) {
        clearInterval(activityIntervalRef.current)
        activityIntervalRef.current = null
      }
    }
  }, []) // No dependency on lastActive to prevent re-renders
  
  // Memoize context value to prevent unnecessary re-renders
  const contextValue: ConversationContextType = useMemo(() => ({
    quickResponses,
    showQuickResponses,
    setShowQuickResponses,
    searchQuery,
    setSearchQuery,
    selectedResponseIndex,
    setSelectedResponseIndex,
    filteredResponses,
    insertQuickResponse,
    inputRef,
    lastActive,
    updateLastActive,
    isExpanded,
    setIsExpanded,
    handleInputChange,
    preventRefresh,
  }), [
    quickResponses,
    showQuickResponses,
    searchQuery,
    selectedResponseIndex,
    filteredResponses,
    insertQuickResponse,
    lastActive,
    updateLastActive,
    isExpanded,
    handleInputChange,
    preventRefresh
  ])
  
  return (
    <ConversationContext.Provider value={contextValue}>
      {children}
    </ConversationContext.Provider>
  )
}

// Custom hook to use the conversation context
export function useConversation() {
  const context = useContext(ConversationContext)
  
  if (!context) {
    throw new Error('useConversation must be used within a ConversationContextProvider')
  }
  
  return context
} 