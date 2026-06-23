'use client'
import { useToast } from '@/components/ui/use-toast'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'
import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useChatContext } from './user-chat-context'
import { onGetChatRoomStatus, onToggleRealtime } from '@/actions/conversation'
import { useClerk } from '@clerk/nextjs'
import { useLogout } from '@/hooks/use-logout'

const useSideBar = () => {
  const [expand, setExpand] = useState<boolean | undefined>(undefined)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [realtime, setRealtime] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const { logout, isLoggingOut } = useLogout()
  const statusFetchedRef = useRef<{[key: string]: boolean}>({})
  const isMountedRef = useRef(true)

  const { chatRoom } = useChatContext()

  // Memoized callback for activating realtime
  const onActivateRealtime = useCallback(async (e: any) => {
    if (!isMountedRef.current) return;
    
    try {
      // Determine the requested state
      const targetState = e.target.ariaChecked == 'true' ? false : true;
      
      // If we're already in the desired state, don't make unnecessary API calls
      if (targetState === realtime) {
        return;
      }
      
      // Always provide a supportAgent object to avoid auth issues
      const supportAgent = {
        name: 'Support Agent',
        role: 'support'
      };
      
      console.log('[AGENT DEBUG] Toggling realtime with supportAgent:', supportAgent);
      
      const success = await onToggleRealtime(
        chatRoom!,
        targetState,
        supportAgent
      );
      
      if (success && isMountedRef.current) {
        setRealtime(targetState);
        toast({
          title: 'Success',
          description: targetState ? 'Live support enabled' : 'Live support disabled',
        });
      }
    } catch (error) {
      console.log(error);
      if (isMountedRef.current) {
        toast({
          title: 'Error',
          description: 'Failed to toggle live support',
          variant: 'destructive',
        });
      }
    }
  }, [chatRoom, realtime, toast]);

  // Memoized callback for getting current mode
  const onGetCurrentMode = useCallback(async () => {
    if (!chatRoom || !isMountedRef.current) return;
    
    setLoading(true);
    try {
      const status = await onGetChatRoomStatus(chatRoom);
      if (isMountedRef.current) {
        setRealtime(status || false);
      }
    } catch (error) {
      console.error('Error getting chat room status:', error);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [chatRoom]);

  // Effect for fetching chat room status with proper cleanup
  useEffect(() => {
    if (!chatRoom || !isMountedRef.current) return;
    
    // Check if we've already fetched the status for this chatRoom
    if (statusFetchedRef.current[chatRoom]) return;
    
    // Mark this chatRoom as having its status fetched
    statusFetchedRef.current[chatRoom] = true;
    
    onGetCurrentMode();
    
    // Clean up when chatRoom changes
    return () => {
      if (chatRoom && statusFetchedRef.current) {
        delete statusFetchedRef.current[chatRoom];
      }
    };
  }, [chatRoom, onGetCurrentMode]);

  // Track component mount status
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Memoize page calculation with improved logic for nested routes
  const page = useMemo(() => {
    if (!pathname) return '';
    // Handle conversation routes specifically
    if (pathname.startsWith('/conversation')) return 'conversation';
    // For other routes, get the last segment
    const segments = pathname.split('/').filter(Boolean);
    return segments.length > 0 ? segments[segments.length - 1] : '';
  }, [pathname]);
  
  // Use the enhanced logout method that handles both client and server sessions
  const onSignOut = useCallback(() => {
    if (isMountedRef.current) {
      logout();
    }
  }, [logout]);

  // Memoized expand toggle
  const onExpand = useCallback(() => {
    if (isMountedRef.current) {
      setExpand((prev) => !prev);
    }
  }, []);

  // Memoize return object to prevent unnecessary re-renders
  return useMemo(() => ({
    expand,
    onExpand,
    page,
    onSignOut,
    realtime,
    onActivateRealtime,
    chatRoom,
    loading,
    isLoggingOut,
  }), [
    expand,
    onExpand,
    page,
    onSignOut,
    realtime,
    onActivateRealtime,
    chatRoom,
    loading,
    isLoggingOut,
  ]);
}

export default useSideBar
