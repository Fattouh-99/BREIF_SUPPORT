'use client'
import React, { useEffect, useState, useRef } from 'react'
import { FieldValues, UseFormRegister } from 'react-hook-form'
import { Input } from '../ui/input'
import { Search, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useConversation } from '@/hooks/conversation/use-conversation'

type Props = {
  register: UseFormRegister<FieldValues>
  domains?:
    | {
        name: string
        id: string
        icon: string
        teamId?: string | null
        userId?: string | null
      }[]
    | undefined
  onDomainChange?: (domain: string) => void
  onSearchChange?: (term: string) => void
}

const ConversationSearch = ({ register, domains, onDomainChange, onSearchChange }: Props) => {
  const [searchTerm, setSearchTerm] = useState('')
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)
  const sessionId = useRef(`search-${Math.random().toString(36).slice(2, 10)}`)
  
  // Get functions from conversation hook
  const { setSearchActive, preventRefresh } = useConversation()

  console.log(`[ConversationSearch] Initializing with ID: ${sessionId.current}`);

  // Set isMounted to false on unmount to prevent state updates
  useEffect(() => {
    return () => {
      console.log(`[ConversationSearch] Unmounting with ID: ${sessionId.current}`);
      isMountedRef.current = false
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
      
      // Make sure search is marked as inactive on unmount
      setSearchActive(false)
      
      // Allow refreshes again
      if (preventRefresh) {
        preventRefresh(false)
      }
    }
  }, [setSearchActive, preventRefresh])

  // If onDomainChange is provided, call it with 'all' to show all conversations by default
  // But only do this once on mount
  useEffect(() => {
    if (onDomainChange && isMountedRef.current) {
      onDomainChange('all');
      console.log(`[ConversationSearch:${sessionId.current}] Set domain to 'all'`);
    }
  }, [onDomainChange]);

  // Handle search term changes with debounce
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    // Mark search as active to prevent refreshes
    setSearchActive(true)
    
    // Prevent refreshes during searching
    if (preventRefresh && term.length > 0) {
      preventRefresh(true)
    }
    
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    // Debounce search to avoid excessive API calls
    searchTimeoutRef.current = setTimeout(() => {
      // Only notify parent if the component is still mounted
      if (isMountedRef.current) {
        console.log(`[ConversationSearch:${sessionId.current}] Searching for: "${term}"`);
        
        if (onSearchChange) {
          onSearchChange(term);
        }
        
        // Re-enable refreshes AFTER the search is complete
        setTimeout(() => {
          if (isMountedRef.current) {
            setSearchActive(false)
            if (preventRefresh) {
              preventRefresh(false)
            }
          }
        }, 500);
      }
      searchTimeoutRef.current = null
    }, 600); // Wait 600ms after typing stops before searching
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search conversations..."
          className="pl-10 bg-background"
          value={searchTerm}
          onChange={handleSearchInputChange}
        />
      </div>
    </div>
  )
}

export default ConversationSearch
