'use client'
import React, { Suspense, useState, useEffect, memo, useRef } from 'react'
import { Button } from '../ui/button'
import { Menu, X, MessageSquare, RefreshCw, Loader2, Radio } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { motion, AnimatePresence } from 'framer-motion'
import ClientOnly from '@/components/client-only'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useHotkeys } from 'react-hotkeys-hook'
import { useConversation } from './conversation-context'
import { toast } from '@/components/ui/use-toast'
// Import the hooks for direct access to chat functions
import { useConversation as useConversationHook } from '@/hooks/conversation/use-conversation'
import { ChevronRight, ChevronLeft } from 'lucide-react'

// Generate unique session ID to prevent duplicate events and renders
const generateSessionId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Lazy load components for better initial loading performance
const ConversationMenu = dynamic(() => import('.'), {
  loading: () => <ConversationMenuSkeleton />,
  ssr: false // Disable SSR for this component
});

const Messenger = dynamic(() => import('./messenger'), {
  loading: () => <MessengerSkeleton />,
  ssr: false
});

const InfoBar = dynamic(() => import('../infobar'), {
  ssr: true,
  loading: () => <div className="h-12 w-full animate-pulse rounded-md bg-muted/50"></div>
});

// Loading components
const ConversationMenuSkeleton = memo(() => (
  <div className="h-full p-4 space-y-4 bg-background/50 backdrop-blur-sm rounded-lg">
    <div className="h-10 w-full animate-pulse rounded-lg bg-muted/50"></div>
    <div className="h-12 w-full animate-pulse rounded-lg bg-muted/50"></div>
    <div className="space-y-3 mt-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2 rounded-md">
          <div className="h-10 w-10 rounded-full animate-pulse bg-muted/50"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 w-3/4 animate-pulse bg-muted/50"></div>
            <div className="h-3 w-1/2 animate-pulse bg-muted/50"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
));

const MessengerSkeleton = memo(() => (
  <div className="flex-1 flex flex-col h-full bg-background rounded-lg shadow-sm">
    <div className="p-4 border-b bg-muted/30">
      <div className="flex justify-between items-center">
        <div className="h-8 w-24 rounded-full animate-pulse bg-muted/50"></div>
        <div className="h-9 w-32 rounded-lg animate-pulse bg-muted/50"></div>
      </div>
    </div>
    <div className="flex-1 p-6 overflow-hidden">
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 items-start max-w-[70%]`}>
              {i % 2 !== 0 && <div className="h-8 w-8 rounded-full flex-shrink-0 animate-pulse bg-muted/50"></div>}
              <div>
                <div className="h-24 w-full rounded-xl animate-pulse bg-muted/50"></div>
                <div className="h-3 w-16 mt-2 animate-pulse bg-muted/50"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
));

type Domain = {
  name: string
  id: string
  icon: string
  teamId?: string | null
  userId?: string | null
}

type Props = {
  domains?: Domain[] | null | undefined
}

// Main component memoized for better rendering performance
const ConversationClient = memo(({ domains = [] }: Props) => {
  // Track component mount/unmount to prevent side effects after unmount
  const isMountedRef = useRef(true);
  const sessionId = useRef(generateSessionId());
  
  // Log for debugging
  console.log(`[ConversationClient] Initializing with session ID: ${sessionId.current}`);
  
  // Ensure domains is always an array, never undefined or null
  const safeDomains = domains || []
  
  // Add loading state to prevent interactions before fully initialized
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Get shared state from context
  const {
    isExpanded,
    setIsExpanded,
    inputRef,
    handleInputChange,
    showQuickResponses,
    filteredResponses,
    selectedResponseIndex,
    insertQuickResponse,
    updateLastActive,
    preventRefresh
  } = useConversation()
  
  // Get conversation functions from the hook
  const { onGetActiveChatMessages, refreshChats, allChatRooms } = useConversationHook();
  
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  const router = useRouter()
  
  // Optimized initialization without blocking delays
  useEffect(() => {
    const initializeClient = async () => {
      console.log(`[ConversationClient] Initializing client, session: ${sessionId.current}`);
      
      // Set prevent refresh to false when mounting
      if (preventRefresh) {
        preventRefresh(false);
      }
      
      // Mark as initialized immediately to prevent blocking
      setIsInitialized(true);
      
      // Perform initial refresh without blocking UI
      try {
        await refreshChats();
        console.log('[ConversationClient] Initial refresh completed');
      } catch (error) {
        console.error('[ConversationClient] Error during initial refresh:', error);
        // Don't block UI even if refresh fails
      }
    };
    
    initializeClient();
    
    // Cleanup function for component unmount
    return () => {
      console.log(`[ConversationClient] Cleaning up session: ${sessionId.current}`);
      isMountedRef.current = false;
      
      // Prevent refreshes when component is unmounting
      if (preventRefresh) {
        preventRefresh(true);
      }
    };
  }, [refreshChats, preventRefresh]);
  
  // Optimize resize listener with debounce and combine multiple effects
  useEffect(() => {
    // Skip if not initialized
    if (!isInitialized) return
    
    // Check for mobile view
    const checkMobile = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView)
      if (isMobileView && isExpanded) {
        setIsExpanded(false)
      }
    }
    
    // Initial check
    checkMobile()
    
    // Debounced resize handler for better performance
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkMobile, 100);
    };
    
    window.addEventListener('resize', handleResize)
    
    // Cleanup all listeners
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimeout);
    }
  }, [isExpanded, setIsExpanded, isInitialized]);

  // Set up keyboard shortcuts using useHotkeys
  useHotkeys('alt+l', () => {
    if (!isInitialized || !isMountedRef.current) return
    if (inputRef.current) {
      inputRef.current.focus()
      updateLastActive()
    }
  }, { enableOnFormTags: true }, [inputRef, updateLastActive, isInitialized])
  
  useHotkeys('alt+p', () => {
    if (!isInitialized || !isMountedRef.current) return
    router.push('/conversations/previous')
    updateLastActive()
  }, {}, [router, updateLastActive, isInitialized])
  
  useHotkeys('alt+n', () => {
    if (!isInitialized || !isMountedRef.current) return
    router.push('/conversations/new')
    updateLastActive()
  }, {}, [router, updateLastActive, isInitialized])

  // Memoize sidebar toggle component for better performance
  const SidebarToggle = memo(() => (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "flex h-full items-center justify-center rounded-full p-2 transition-colors",
                "hover:bg-accent/80 focus:outline-none focus:ring-2 focus:ring-primary/50",
                " md:rounded",
                "absolute right-0 ml-3 top-4 md:static md:right-auto md:top-auto",
                isExpanded ? "bg-accent/50" : "bg-background"
            )}
            aria-label={isExpanded ? "Hide sidebar" : "Show sidebar"}
          >
            {isExpanded ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" align="center">
          {isExpanded ? "Hide conversation menu (Alt+S)" : "Show conversation menu (Alt+S)"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ));

  // Add a direct conversation access component
  const DirectConversationAccess = () => {
    const [notificationChatRoom, setNotificationChatRoom] = useState<string | null>(null);
    const [notificationEmail, setNotificationEmail] = useState<string | null>(null);
    const [showAccessButton, setShowAccessButton] = useState(false);
    
    // Get the conversation functions from the hook directly
    const { onGetActiveChatMessages, refreshChats, allChatRooms } = useConversationHook();

    // Check if there's a notification for a chat
    useEffect(() => {
      // Look for notification elements in the DOM
      const checkForNotifications = () => {
        // Check for notification elements that contain "Live support requested"
        const notificationElements = document.querySelectorAll('.notification-content');
        
        // Convert NodeList to Array for safer iteration
        Array.from(notificationElements).forEach(element => {
          const text = element.textContent;
          if (text && text.includes('Live support requested by')) {
            // Extract email from notification
            const emailMatch = text.match(/Live support requested by ([\w.-]+@[\w.-]+\.\w+)/);
            if (emailMatch && emailMatch[1]) {
              setNotificationEmail(emailMatch[1]);
              setShowAccessButton(true);
              
              // Find chat room ID from URL if available
              const urlParams = new URLSearchParams(window.location.search);
              const roomId = urlParams.get('room');
              if (roomId) {
                setNotificationChatRoom(roomId);
              }
            }
          }
        });
      };
      
      // Run once on mount and then periodically
      checkForNotifications();
      const interval = setInterval(checkForNotifications, 30000);
      
      return () => clearInterval(interval);
    }, []);

    // Function to force a refresh and try to view the conversation
    const handleViewNotificationChat = async () => {
      try {
        // First refresh all chats
        await refreshChats();
        
        // If we have a chat room ID, try to access it directly
        if (notificationChatRoom) {
          onGetActiveChatMessages(notificationChatRoom);
        } else if (notificationEmail) {
          // Find the chat room by email
          const matchingChat = allChatRooms.find((room: any) => 
            room.email === notificationEmail
          );
          
          if (matchingChat && matchingChat.chatRoom && matchingChat.chatRoom.length > 0) {
            onGetActiveChatMessages(matchingChat.chatRoom[0].id);
          } else {
            toast({
              title: "Chat not found",
              description: "Try refreshing the conversation list",
              variant: "destructive"
            });
          }
        }
      } catch (error) {
        console.error("Error accessing notification chat:", error);
      }
    };

    if (!showAccessButton) return null;

    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          size="lg"
          className="shadow-lg bg-primary font-medium text-primary-foreground flex items-center gap-2"
          onClick={handleViewNotificationChat}
        >
          <MessageSquare className="h-4 w-4" />
          View New Conversation
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
            {notificationEmail}
          </span>
        </Button>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col">         
      <div className="flex flex-col h-screen">      
        <div className="mx-2 mt-2 mb-1">
          <InfoBar />
        </div>

        {/* Main content */}
        <ClientOnly>
          <div className="flex-1 flex relative h-full min-h-0 mx-auto w-full p-2 pb-3 overflow-hidden">
            {/* Mobile overlay */}
            <AnimatePresence>
              {menuOpen && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
                  onClick={() => setMenuOpen(false)}
                />
              )}
            </AnimatePresence>

            {/* Conversation menu */}
            <div 
              className={cn(
                // Base styles
                "rounded-lg bg-card z-20 shadow-sm",
                // Width and positioning
                "fixed md:relative",
                // Z-index and transitions
                "z-50 transition-all duration-300 ease-in-out",
                // Mobile positioning
                "top-[100px] md:top-0 left-0 h-[calc(100vh-100px)] md:h-full",
                // Mobile and desktop visibility
                menuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
                // Desktop collapse/expand
                isExpanded 
                  ? "md:w-[320px] md:min-w-[320px] border-r" 
                  : "md:w-0 md:min-w-0 md:border-r-0 md:opacity-0 md:overflow-hidden"
              )}
            >
              <div className={cn(
                "w-[330px] h-full overflow-hidden rounded-lg",
                "transition-all duration-300",
                !isExpanded && "md:opacity-0"
              )}>
                <Suspense fallback={<ConversationMenuSkeleton />}>
                  <ConversationMenu domains={safeDomains} />
                </Suspense>
              </div>
            </div>

            {/* Toggle Button for Desktop */}
            <div className="hidden md:block">
              <SidebarToggle />
            </div>

            {/* Mobile toggle button */}
            {isMobile && (
              <Button
                size="icon"
                variant="outline"
                className="fixed bottom-4 right-4 z-50 rounded-full h-12 w-12 shadow-lg bg-primary text-primary-foreground border-0"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
              </Button>
            )}

            {/* Chat area */}
            <div className={cn(
              "flex-1 min-w-0 overflow-hidden rounded-lg bg-card",
              "transition-all duration-300 ease-in-out",
            )}>
              <Suspense fallback={<MessengerSkeleton />}>
                <Messenger />
              </Suspense>
            </div>
          </div>
          
          {/* Add the direct access component */}
          <DirectConversationAccess />
        </ClientOnly>
      </div>
    </div>
  )
});

ConversationClient.displayName = 'ConversationClient';

export default ConversationClient; 