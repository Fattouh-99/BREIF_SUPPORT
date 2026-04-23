'use client'
import { useConversation, useChatWindow } from '@/hooks/conversation/use-conversation'
import React, { useEffect, useState, useRef, useCallback, memo } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs'
import ConversationSearch from './search'
import { Loader } from '../loader'
import ChatCard from './chat-card'
import { CardDescription } from '../ui/card'
import { useChatContext } from '@/context/user-chat-context'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { onGetChatMessages } from '@/actions/conversation'
import { Separator } from '../ui/separator'
import { Calendar, Users, MessageSquare, AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import { pusherClient } from '@/lib/pusher'
import { onGetTeamMembers } from '@/actions/team'
import ChatSidebar, { ChatMetadata } from './chat-sidebar'
import { Button } from '../ui/button'

type Props = {
  domains?: {
    name: string
    id: string
    icon: string
    teamId?: string | null
    userId?: string | null
  }[] | undefined
}

const ConversationMenu = ({ domains }: Props) => {
  const { register, allChatRooms, unreadChats, liveChats, sharedChats, loading, onGetActiveChatMessages, refreshChats, handleDomainChange } = useConversation()
  const [isTeamMember, setIsTeamMember] = useState(false)
  const [assignedAgents, setAssignedAgents] = useState<Record<string, { id: string; name: string }>>({})
  const [currentUser, setCurrentUser] = useState<{ id: string; fullname: string } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const searchAppliedRef = useRef(false)
  const [showNotificationBanner, setShowNotificationBanner] = useState(false)
  const { toast } = useToast()
  const chatContext = useChatContext()
  const {
    chatMetadata,
    setChats,
  } = useChatWindow()
  const [currentMetadata, setCurrentMetadata] = useState<ChatMetadata | null>(null)
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  // Create a manual refresh function for the refresh button
  const forceRefreshChats = async () => {
    setIsManualRefreshing(true);
    try {
      await refreshChats(true);
      toast({
        title: "Refreshed",
        description: "Conversation list has been refreshed",
        duration: 2000
      });
    } catch (error) {
      console.error("Error refreshing chats:", error);
      toast({
        title: "Refresh failed",
        description: "Could not refresh conversations",
        variant: "destructive",
        duration: 2000
      });
    } finally {
      setIsManualRefreshing(false);
    }
  };

  // Get current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/user/me?includeTeam=true');
        const data = await response.json();
        if (response.ok) {
          setCurrentUser({
            id: data.id,
            fullname: data.fullname || data.email
          });
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
    
    fetchCurrentUser();
  }, []);

  // Load conversations once on mount with debounced loading
  useEffect(() => {
    // Debounce initial load to prevent blocking navigation
    const timer = setTimeout(() => {
      refreshChats(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, [refreshChats]);
  
  // Listen for chat room changes via Pusher
  useEffect(() => {
    if (!currentUser || !pusherClient) return;
    
    const userChannel = pusherClient.subscribe(`user-${currentUser.id}`);
    const globalChannel = pusherClient.subscribe('chat-global');
    
    // Handler for agent assignments
    const handleAgentAssignment = (data: {
      chatRoomId: string;
      agentId: string;
      agentName: string;
      timestamp: string;
    }) => {
      setAssignedAgents(prev => ({
        ...prev,
        [data.chatRoomId]: {
          id: data.agentId,
          name: data.agentName
        }
      }));
      
      // Refresh when an agent is assigned
      refreshChats(true);
    };
    
    // Handler for new conversations
    const handleNewConversation = (data: {
      chatRoomId: string;
      customerEmail: string;
      message: string;
      domainId: string;
      timestamp: string;
    }) => {
      toast({
        title: "New Live Support Request",
        description: `${data.customerEmail} is requesting live support`,
        variant: "default",
        duration: 8000,
        action: (
          <button
            onClick={() => onGetActiveChatMessages(data.chatRoomId)}
            className="bg-primary text-white px-3 py-1.5 rounded-md text-xs font-medium"
          >
            View
          </button>
        )
      });
      
      // Refresh the chat list when a new conversation comes in
      refreshChats(true);
    };
    
    // Handler for customer messages
    const handleCustomerMessage = (data: {
      chatRoomId: string;
      customerEmail?: string;
      message: string;
      timestamp: string;
    }) => {
      const activeChatRoom = chatContext.chatRoom;
      
      if (activeChatRoom === data.chatRoomId) {
        // If we're already viewing this conversation, don't refresh all chats
        // Just get the active messages - the real-time update will handle it
      } else {
        // Refresh chats only if we're not already viewing this conversation
        refreshChats(true);
        
        if (data.customerEmail) {
          toast({
            title: "New Message",
            description: `${data.customerEmail} sent a new message`,
            variant: "default",
            duration: 5000,
            action: (
              <button
                onClick={() => {
                  chatContext.setChatRoom(data.chatRoomId);
                  onGetActiveChatMessages(data.chatRoomId);
                }}
                className="bg-primary text-white px-3 py-1.5 rounded-md text-xs font-medium"
              >
                View
              </button>
            )
          });
        }
      }
    };
    
    // Listen for real-time updates to the chat list
    const handleChatListUpdate = () => {
      console.log('[Pusher] Chat list update event received, refreshing list');
      refreshChats(true);
    };
    
    userChannel.bind('agent-assignment', handleAgentAssignment);
    globalChannel.bind('new-conversation', handleNewConversation);
    globalChannel.bind('customer-message', handleCustomerMessage);
    globalChannel.bind('chat-list-update', handleChatListUpdate);
    
    return () => {
      userChannel.unbind('agent-assignment', handleAgentAssignment);
      globalChannel.unbind('new-conversation', handleNewConversation);
      globalChannel.unbind('customer-message', handleCustomerMessage);
      globalChannel.unbind('chat-list-update', handleChatListUpdate);
      
      if (pusherClient) {
        pusherClient.unsubscribe(`user-${currentUser.id}`);
        pusherClient.unsubscribe('chat-global');
      }
    };
  }, [currentUser, onGetActiveChatMessages, refreshChats, toast, chatContext]);

  useEffect(() => {
    const checkTeamMembership = async () => {
      const result = await onGetTeamMembers()
      setIsTeamMember(!!result.team)
    }
    checkTeamMembership()
  }, [])

  // Set up automatic message refresh for the active chat when receiving customer messages
  useEffect(() => {
    const activeChat = chatContext.chatRoom;
    if (!activeChat || typeof activeChat !== 'string' || !pusherClient) return;
    
    const chatChannel = pusherClient.subscribe(activeChat);
    
    // Handle new messages immediately without debounce
    const handleNewMessage = () => {
      onGetActiveChatMessages(activeChat);
    };
    
    chatChannel.bind('chat-message', handleNewMessage);
    chatChannel.bind('realtime-mode', handleNewMessage);
    
    return () => {
      chatChannel.unbind('chat-message', handleNewMessage);
      chatChannel.unbind('realtime-mode', handleNewMessage);
      if (pusherClient) {
        pusherClient.unsubscribe(activeChat);
      }
    };
  }, [chatContext.chatRoom, onGetActiveChatMessages]);

  // Update metadata when chatMetadata changes
  useEffect(() => {
    if (chatMetadata) {
      setCurrentMetadata(chatMetadata);
    }
  }, [chatMetadata]);

  // Handle search term change without triggering refreshes
  const handleSearchChange = (term: string) => {
    // Only update if the term actually changed
    if (term !== searchTerm) {
      setSearchTerm(term);
      searchAppliedRef.current = true;
      
      // Optional: Set a flag to indicate active searching
      // This could be used to show a "Searching..." indicator
      if (term.length > 0) {
        setIsSearching(true);
      } else {
        setIsSearching(false);
      }
    }
  }
  
  // Filter chats based on search term
  const filterChatsBySearchTerm = (chats: typeof allChatRooms) => {
    if (!searchTerm) return chats;
    
    return chats.filter(room => 
      (room.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (room.chatRoom?.[0]?.message?.some(msg => 
        msg.message.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    );
  };

  // Logging for debugging
  useEffect(() => {
    console.log('[DEBUG] ConversationMenu state:', {
      allChatRoomsCount: allChatRooms.length,
      unreadChatsCount: unreadChats.length,
      liveChatsCount: liveChats.length,
      sharedChatsCount: sharedChats.length,
      loading
    });
  }, [allChatRooms, unreadChats, liveChats, sharedChats, loading]);

  const renderChatList = (chats: typeof allChatRooms, emptyMessage: string) => {
    console.log('[DEBUG] Rendering chat list with', chats.length, 'chats');
    
    // Always show the empty state if loading or no chats
    if (loading) {
      return (
        <div className="h-full flex items-center justify-center text-center p-4">
          <div>
            <Loader2 className="h-8 w-8 mx-auto text-muted-foreground/80 animate-spin mb-4" />
            <CardDescription className="font-medium text-sm">Loading conversations...</CardDescription>
          </div>
        </div>
      );
    }
    
    if (!chats || chats.length === 0) {
      return (
        <div className="h-full flex items-center justify-center text-center p-4">
          <div>
            <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/80 mb-4" />
            <CardDescription className="font-medium text-sm">{emptyMessage}</CardDescription>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3 p-2">
        {chats.map((room) => {
          // Skip invalid entries
          if (!room.chatRoom || room.chatRoom.length === 0) {
            console.log('[DEBUG] Skipping room without chatRoom:', room.id);
            return null;
          }

          const chatRoom = room.chatRoom[0];
          
          // Sort messages by date (newest first) to get the last message
          let lastMessage = null;
          if (chatRoom.message && chatRoom.message.length > 0) {
            const sortedMessages = [...chatRoom.message].sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            lastMessage = sortedMessages[0];
            console.log('[DEBUG] Last message for', room.email, ':', lastMessage?.message?.substring(0, 20));
          }

          return (
            <ChatCard
              seen={lastMessage?.seen}
              id={chatRoom.id}
              onChat={() => onGetActiveChatMessages(chatRoom.id)}
              createdAt={lastMessage?.createdAt}
              key={chatRoom.id}
              title={room.email || 'Unknown'}
              description={lastMessage?.message}
              onDelete={() => refreshChats(true)}
              assignedAgent={assignedAgents[chatRoom.id]}
              isCurrentUserAssigned={currentUser?.id === assignedAgents[chatRoom.id]?.id}
              isLive={chatRoom.live}
            />
          )
        })
        .filter(Boolean)}
      </div>
    )
  }

  // Check for notification alerts
  useEffect(() => {
    // Check if we have a notification but no matching conversations in the list
    const hasNotificationAlert = document.querySelector(".notification-content");
    if (hasNotificationAlert && !loading) {
      const notificationText = hasNotificationAlert.textContent || "";
      // Look for specific text in notifications
      if (notificationText.includes("Live support requested") && unreadChats.length === 0) {
        setShowNotificationBanner(true);
      }
    } else {
      setShowNotificationBanner(false);
    }
  }, [unreadChats.length, loading]);

  // Add function to directly view the live chat
  const viewLiveChat = () => {
    // The chat room ID comes from your debug logs
    const chatRoomId = "bab245e1-9ae8-4529-976c-32a8cfa9e0bd";
    onGetActiveChatMessages(chatRoomId);
    toast({
      title: "Loading conversation",
      description: "Accessing the live chat directly",
      duration: 3000
    });
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-lg shadow-sm">
      {/* Direct Access Button */}

      {/* Notification Banner */}
      {showNotificationBanner && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-3 py-2 flex items-center justify-between">
          <div className="text-sm">
            <span className="font-medium text-yellow-600 dark:text-yellow-400">New conversation alert!</span>
            <p className="text-xs mt-0.5 text-yellow-700/80 dark:text-yellow-300/80">
              There's a new conversation that isn't showing in the list.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={forceRefreshChats}
            disabled={isManualRefreshing}
            className="bg-yellow-500/20 border-yellow-500/30 hover:bg-yellow-500/30 text-yellow-700 dark:text-yellow-300 h-8"
          >
            {isManualRefreshing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
            )}
            Refresh
          </Button>
        </div>
      )}
      
      <div className="flex-none w-full p-3">
          <ConversationSearch 
            register={register} 
            onSearchChange={handleSearchChange}
          />
      </div>

      <Tabs defaultValue="all" className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="px-2 py-2 border-b">
          <TabsList className="w-full">
            <TabsTrigger className="flex-1 relative group" value="unread">
              Unread
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5 absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" 
                onClick={(e) => {
                  e.stopPropagation(); // Prevent tab switching when clicking refresh
                  forceRefreshChats();
                }}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </TabsTrigger>
            <TabsTrigger className="flex-1 relative group" value="live">
              Live
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5 absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" 
                onClick={(e) => {
                  e.stopPropagation(); // Prevent tab switching when clicking refresh
                  forceRefreshChats();
                }}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </TabsTrigger>
            <TabsTrigger className="flex-1 relative group" value="all">
              All
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5 absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" 
                onClick={(e) => { 
                  e.stopPropagation(); // Prevent tab switching when clicking refresh
                  forceRefreshChats();
                }}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </TabsTrigger>
            <TabsTrigger className="flex-1 relative group" value="shared">
              Shared
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5 absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" 
                onClick={(e) => {
                  e.stopPropagation(); // Prevent tab switching when clicking refresh
                  forceRefreshChats();
                }}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto">
          <TabsContent className="m-0 h-full" value="unread">
            {renderChatList(unreadChats, 'No unread conversations')}
          </TabsContent>
          
          <TabsContent className="m-0 h-full" value="live">
            {renderChatList(liveChats, 'No live conversations')}
          </TabsContent>
          
          <TabsContent className="m-0 h-full" value="all">
            {renderChatList(allChatRooms, 'No conversations')}
          </TabsContent>
          
          <TabsContent className="m-0 h-full" value="shared">
            {renderChatList(sharedChats, 'No shared conversations')}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

export default ConversationMenu
