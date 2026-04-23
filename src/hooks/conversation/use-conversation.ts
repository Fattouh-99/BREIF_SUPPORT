'use client'
import {
  onGetChatMessages,
  onGetDomainChatRooms,
  onOwnerSendMessage,
  onRealTimeChat,
  onViewUnReadMessages,
  onGetChatRoomStatus,
  onGetSharedChatRooms,
  notifyTypingStatus,
  onPauseConversation,
  onToggleRealtime,
  sendTypingStatus,
} from '@/actions/conversation'
import { useChatContext } from '@/context/user-chat-context'
import { getMonthName } from '@/lib/utils'
import { pusherClient } from '@/lib/pusher'
import { pusherServer } from '@/lib/pusher'
import {
  ChatBotMessageSchema,
  ConversationSearchSchema,
} from '@/schemas/conversation.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useToast } from '@/components/ui/use-toast'
import { ChatMetadata } from '@/components/conversations/chat-sidebar'
import { Role } from '@prisma/client'
import crypto from 'crypto'
import { WebSocketManager } from '@/lib/websocket-manager'
import React from 'react'
import { generateUUID } from '@/lib/uuid'

type ChatMessage = {
  id: string
  message: string
  role: Role | null
  createdAt: Date
  seen: boolean
  teamMemberId?: string
  teamMemberName?: string
  isNote?: boolean
  noteType?: string
}

type MessageMetadata = {
  message: string
  role: Role | 'user' | 'assistant'  // Allow both Role enum and string literals
  createdAt: string
}

type ChatRoom = {
  id: string
  createdAt: Date
  updatedAt: Date
  live: boolean
  mailed: boolean
  shared: boolean
  customerId?: string | null
  message: ChatMessage[]
}

type Customer = {
  id: string
  email: string | null
  domainId: string | null
  chatRoom: ChatRoom[]
}

// Function to convert ChatMessage to MessageMetadata
const convertToMetadataFormat = (messages: ChatMessage[]): MessageMetadata[] => {
  return messages.map(msg => ({
    message: msg.message,
    role: msg.role || 'user', // Default to 'user' if role is null
    createdAt: msg.createdAt.toISOString()
  }))
}

// Function to extract metadata from messages
const extractMetadataFromMessages = (messages: ChatMessage[]): ChatMetadata => {
  const metadata: ChatMetadata = {
    keyTopics: [],
    enquiryType: undefined,
    mainIssue: undefined,
    customerIntent: undefined,
    customerEmail: undefined,
    status: 'new',
    conversationSummary: {
      briefOverview: undefined,
      keyPoints: [],
      userNeeds: [],
      actionItems: [],
      nextSteps: []
    },
    insights: {
      overview: 'Initial customer contact established',
      customerSentiment: 'Neutral',
      avgResponseTime: 'N/A',
      conversationDuration: 'N/A',
      messageCount: messages.length, // Set initial message count
      currentTags: []
    }
  }

  if (!messages || messages.length === 0) return metadata;
  
  // Set first interaction time from the first message
  metadata.firstInteractionTime = new Date(messages[0].createdAt);
  
  // Message content analysis
  const topics = new Set<string>();
  const keyPoints: string[] = [];
  const userNeeds: string[] = [];
  const responseTimes: number[] = [];
  let lastUserMessageTime: Date | null = null;
  let lastAgentMessageTime: Date | null = null;
  
  // Analysis flags
  let hasRequestedSupport = false;
  let hasProvidedEmail = false;
  let positiveWords = 0;
  let negativeWords = 0;
  
  // Calculate message count and response times
  metadata.insights.messageCount = messages.length;

  // Analyze each message for insights
  messages.forEach((msg, index) => {
    const content = msg.message.toLowerCase();
    
    // Email detection
    const emailMatch = msg.message.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
    if (emailMatch && !metadata.customerEmail) {
      metadata.customerEmail = emailMatch[0];
      hasProvidedEmail = true;
      topics.add('Email Collection');
      keyPoints.push(`Contact Information: ${emailMatch[0]}`);
      metadata.insights.currentTags.push('Email Collected');
    }

    // Support request detection
    if (content.includes('connect me to real time support')) {
      hasRequestedSupport = true;
      metadata.mainIssue = "Live support request";
      metadata.enquiryType = 'technical_support';
      topics.add('Live Support Request');
      keyPoints.push("Support Request: Customer requested live assistance");
      metadata.insights.currentTags.push('Support Requested');
    }
    
    // Live mode detection
    if (content.includes('live support mode has been enabled')) {
      topics.add('Live Support Activated');
      keyPoints.push("Status Update: Live support mode activated");
      metadata.insights.currentTags.push('Live Support Active');
    }

    // Calculate response times and sentiment
    if (msg.role === 'user') {
      if (lastUserMessageTime) {
        // Calculate time between user messages
        const timeBetweenMessages = new Date(msg.createdAt).getTime() - lastUserMessageTime.getTime();
        if (timeBetweenMessages > 0) {
          responseTimes.push(timeBetweenMessages);
        }
      }
      lastUserMessageTime = new Date(msg.createdAt);
      
      // Simple sentiment analysis
      if (content.match(/\b(good|great|excellent|happy|thanks|thank you|awesome)\b/gi)) {
        positiveWords++;
      }
      if (content.match(/\b(bad|poor|terrible|unhappy|angry|frustrated|not working)\b/gi)) {
        negativeWords++;
      }
    } else if (msg.role === 'assistant' && lastUserMessageTime) {
      lastAgentMessageTime = new Date(msg.createdAt);
      const responseTime = lastAgentMessageTime.getTime() - lastUserMessageTime.getTime();
      if (responseTime > 0) {
        responseTimes.push(responseTime);
      }
    }
    
    // Collect meaningful user messages for user needs
    if (msg.role === 'user' && 
        !msg.message.match(/^[^@]+@[^@]+\.[^@]+$/) && 
        !content.match(/^(hi|hello|hey)$/i) &&
        content !== 'connect me to real time support') {
      userNeeds.push(msg.message);
    }
  });

  // Calculate average response time
  if (responseTimes.length > 0) {
    const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    metadata.insights.avgResponseTime = formatDuration(avgTime);
  }

  // Calculate conversation duration
  if (messages.length >= 2) {
    const duration = new Date(messages[messages.length - 1].createdAt).getTime() - 
                    new Date(messages[0].createdAt).getTime();
    metadata.insights.conversationDuration = formatDuration(duration);
  }

  // Determine sentiment
  if (positiveWords > negativeWords) {
    metadata.insights.customerSentiment = 'Positive';
  } else if (negativeWords > positiveWords) {
    metadata.insights.customerSentiment = 'Negative';
  } else {
    metadata.insights.customerSentiment = 'Neutral';
  }

  // Update overview based on conversation state
  if (messages.length === 1) {
    metadata.insights.overview = 'Initial contact established';
  } else if (hasRequestedSupport && hasProvidedEmail) {
    metadata.insights.overview = 'Customer requested live support with contact info';
  } else if (hasRequestedSupport) {
    metadata.insights.overview = 'Customer requested live support';
  } else if (messages.length > 5) {
    metadata.insights.overview = 'Ongoing conversation';
  }

  // Determine conversation status
  metadata.status = messages.length <= 1 ? 'new' : 'in_progress';
  
  // Set the conversation summary
  metadata.conversationSummary = {
    briefOverview: metadata.insights.overview,
    keyPoints: keyPoints,
    userNeeds: userNeeds.filter(need => need.length > 0),
    actionItems: [],
    nextSteps: ['Provide live support assistance', 'Address customer inquiry']
  };
  
  // Set topics from our set
  metadata.keyTopics = Array.from(topics);

  // Log the metadata being returned for debugging
  console.log('[extractMetadataFromMessages] Generated metadata:', {
    messageCount: metadata.insights.messageCount,
    duration: metadata.insights.conversationDuration,
    avgResponseTime: metadata.insights.avgResponseTime,
    sentiment: metadata.insights.customerSentiment,
    tags: metadata.insights.currentTags
  });

  return metadata;
}

// Helper function to format duration in a human-readable format
const formatDuration = (ms: number): string => {
  if (ms < 1000) return 'Less than 1s';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

// Fix the debounce function to include proper cancel method
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): { (...args: Parameters<T>): void; cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;
  
  const debounced = function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  } as { (...args: Parameters<T>): void; cancel: () => void };
  
  debounced.cancel = function() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  
  return debounced;
}

export const useConversation = () => {
  const { register, handleSubmit } = useForm()
  const [loading, setLoading] = useState(false)
  const [selectedDomain, setSelectedDomain] = useState('all')
  const [allChatRooms, setAllChatRooms] = useState<Customer[]>([])
  const [unreadChats, setUnreadChats] = useState<Customer[]>([])
  const [liveChats, setLiveChats] = useState<Customer[]>([])
  const [sharedChats, setSharedChats] = useState<Customer[]>([])
  const { toast } = useToast()
  const { setLoading: loadMessages, setChats, setChatRoom, setRealtime } = useChatContext()
  const [chatMetadata, setChatMetadata] = useState<ChatMetadata>({
    keyTopics: [],
    status: 'new',
    mainIssue: '',
    customerIntent: '',
    conversationSummary: {
      briefOverview: '',
      keyPoints: [],
      userNeeds: [],
      actionItems: [],
      nextSteps: []
    },
    insights: {
      overview: 'Initial contact established',
      customerSentiment: 'Neutral',
      avgResponseTime: 'N/A',
      conversationDuration: 'N/A',
      messageCount: 0,
      currentTags: []
    }
  })
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isSearching = useRef(false);
  const preventRefreshRef = useRef(false);

  // We prioritize real-time updates via Pusher instead of polling
  const preferRealTimeMode = true;

  const sortChats = (customers: any[]) => {
    console.log('[DEBUG] sortChats called with', customers.length, 'customers');
    
    const unread: Customer[] = []
    const live: Customer[] = []
    
    customers.forEach(customer => {
      console.log(`[DEBUG] Processing customer: ${customer.id} (${customer.email || 'no email'})`);
      
      if (customer.chatRoom && customer.chatRoom.length > 0) {
        const chatRoom = customer.chatRoom[0]
        console.log(`[DEBUG] Chat room ${chatRoom.id}: live=${chatRoom.live}, mailed=${chatRoom.mailed}, messages=${chatRoom.message?.length || 0}`);

        if (chatRoom.live) {
          console.log(`[DEBUG] Adding to live chats: ${customer.email}`);
          live.push(customer as Customer)
        }

        if (chatRoom.message && chatRoom.message.length > 0) {
          // Check if the latest message (first in array) is unseen
          const latestMessage = chatRoom.message.sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0];
          
          console.log(`[DEBUG] Latest message seen status: ${latestMessage.seen}`);
          if (!latestMessage.seen) {
            console.log(`[DEBUG] Adding to unread chats: ${customer.email}`);
            unread.push(customer as Customer)
          }
        }
      }
    })

    console.log(`[DEBUG] Sorted chats - Total: ${customers.length}, Unread: ${unread.length}, Live: ${live.length}`);
    
    // Ensure we're setting all states with proper array types
    setAllChatRooms([...customers] as Customer[])
    setUnreadChats([...unread] as Customer[])
    setLiveChats([...live] as Customer[])
  }

  const onGetActiveChatMessages = async (id: string) => {
    try {
      // Only keep essential logging
      loadMessages(true);
      console.log(`[useConversation] Loading complete message history for chat room ${id}`);
      
      // Try the new API endpoint that includes ALL messages, including bot messages
      try {
        const response = await fetch(`/api/conversations/${id}/messages?include_bot=true`, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
            // Set active chat room ID
            setChatRoom(id);
            
            console.log(`[useConversation] Loaded ${data.messages.length} messages from API`);
            
            // Log some messages for debugging
            if (data.messages.length > 0) {
              console.log(`[useConversation] First message: ${data.messages[0].role} | ${data.messages[0].message.substring(0, 50)}`);
              console.log(`[useConversation] Last message: ${data.messages[data.messages.length-1].role} | ${data.messages[data.messages.length-1].message.substring(0, 50)}`);
            }
            
            // Process messages to ensure proper format
            const formattedMessages = data.messages.map((msg: any) => ({
              id: msg.id,
              message: msg.message,
              role: msg.role || 'assistant', // Default to assistant if role is missing
              createdAt: new Date(msg.createdAt),
              seen: msg.seen,
              // Include any additional fields that exist
              ...(msg.teamMemberId ? { teamMemberId: msg.teamMemberId } : {}),
              ...(msg.teamMemberName ? { teamMemberName: msg.teamMemberName } : {})
            }));
            
            // Sort messages chronologically
            const sortedMessages = formattedMessages.sort(
              (a: {createdAt: Date}, b: {createdAt: Date}) => 
                a.createdAt.getTime() - b.createdAt.getTime()
            );
            
            // Store the entire conversation history
            setChats(sortedMessages);
            
            // Extract metadata from the complete conversation history
            const updatedMetadata = extractMetadataFromMessages(sortedMessages);
            
            // Ensure customer email is set in metadata
            if (!updatedMetadata.customerEmail && data.customerEmail) {
              updatedMetadata.customerEmail = data.customerEmail;
            }
            
            setChatMetadata(updatedMetadata);
            loadMessages(false);
            
            // Get and update live/realtime status
            if (data.live !== undefined) {
              setRealtime(data.live);
            } else {
              // Fall back to server action if live status wasn't included
              const status = await onGetChatRoomStatus(id);
              if (status !== undefined) {
                setRealtime(status);
              }
            }
            
            return;
          }
        }
      } catch (apiError) {
        console.error('[useConversation] Error using new API endpoint, falling back to legacy method:', apiError);
      }
    
      // If the new API fails, fall back to the legacy method
      console.log('[useConversation] Falling back to legacy message loading...');
      const messages = await onGetChatMessages(id);
      
      if (messages && messages[0]?.message) {
        setChatRoom(id);
        
        // Sort messages by creation time to ensure proper order
        const sortedMessages = messages[0].message.sort((a: any, b: any) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        
        // Format all messages, including bot messages and system notifications
        const formattedMessages = sortedMessages.map((msg: any) => {
          // Ensure role is properly set
          let role = msg.role as 'assistant' | 'user' | null;
          if (!role) {
            // If no role is set, determine from message content
            if (msg.message.includes('Live support mode has been enabled')) {
              role = 'assistant';
            } else if (msg.message.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i)) {
              role = 'user';
            } else {
              // Default to assistant for bot messages
              role = 'assistant';
            }
          }

          return {
            id: msg.id,
            message: msg.message,
            role: role,
            createdAt: msg.createdAt,
            seen: msg.seen,
            // Use optional chaining to safely handle missing fields
            ...(msg.teamMemberId ? { teamMemberId: msg.teamMemberId } : {}),
            ...(msg.teamMemberName ? { teamMemberName: msg.teamMemberName } : {})
          };
        });
        
        // Get live support status
        const status = await onGetChatRoomStatus(id);
        
        // Add any missing system messages if needed
        const hasLiveSupportMessage = formattedMessages.some(
          msg => msg.message.includes('Live support mode has been enabled')
        );
        
        if (!hasLiveSupportMessage && status) {
          // Save the system message to the database
          const systemMessage = await onOwnerSendMessage(
            id,
            'Live support mode has been enabled.',
            'assistant'
          );

          if (systemMessage && systemMessage.message[0]) {
            formattedMessages.push({
              id: systemMessage.message[0].id,
              message: systemMessage.message[0].message,
              role: 'assistant', // Explicitly set as 'assistant'
              createdAt: new Date(systemMessage.message[0].createdAt),
              seen: systemMessage.message[0].seen,
              ...(systemMessage.message[0].teamMemberId ? { teamMemberId: systemMessage.message[0].teamMemberId } : {}),
              ...(systemMessage.message[0].teamMemberName ? { teamMemberName: systemMessage.message[0].teamMemberName } : {})
            });
          }
        }

        // Sort again to ensure proper order after adding system messages
        const finalMessages = formattedMessages.sort((a: any, b: any) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        // Store the entire conversation history
        setChats(finalMessages);

        // Extract metadata from the complete conversation history
        const updatedMetadata = extractMetadataFromMessages(finalMessages);
        
        // Ensure customer email is set in metadata
        if (!updatedMetadata.customerEmail) {
          const emailMessage = finalMessages.find(msg => 
            msg.message.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i)
          );
          if (emailMessage) {
            const emailMatch = emailMessage.message.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
            if (emailMatch) {
              updatedMetadata.customerEmail = emailMatch[0];
            }
          }
        }

        setChatMetadata(updatedMetadata);
        loadMessages(false);

        // Update live status in the UI and local state
        if (status !== undefined) {
          setRealtime(status);
          // Update the live status in the local state
          setAllChatRooms(prev => {
            const updated = prev.map(customer => ({
              ...customer,
              chatRoom: customer.chatRoom.map(room => 
                room.id === id ? { ...room, live: status } : room
              )
            }));
            sortChats(updated); // Re-sort chats when live status changes
            return updated;
          });
        }
      } else {
        loadMessages(false);
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
      loadMessages(false);
    }
  };

  // Direct refresh function without debounce - called only when needed
  const refreshChats = useCallback(async (isManualRefresh = false) => {
    // Skip if currently searching
    if (isSearching.current && !isManualRefresh) {
      console.log('[DEBUG] Refresh blocked due to active search');
      return;
    }
    
    // Skip if explicitly prevented
    if (preventRefreshRef.current && !isManualRefresh) {
      console.log('[DEBUG] Refresh explicitly prevented');
      return;
    }
    
    try {
      console.log('[DEBUG] Starting conversation refresh...');
      setIsRefreshing(true);
      setLoading(true);
      
      // Always fetch ALL chat rooms
      console.log('[DEBUG] Fetching all chat rooms...');
      const allRooms = await onGetDomainChatRooms('all');
      console.log('[DEBUG] All rooms API response:', allRooms?.success ? 'Success' : 'Failed', 
        'Customer count:', allRooms?.customer?.length || 0);
      
      // Always fetch shared chats
      console.log('[DEBUG] Fetching shared chat rooms...');
      const sharedRooms = await onGetSharedChatRooms();
      console.log('[DEBUG] Shared rooms API response:', sharedRooms?.success ? 'Success' : 'Failed', 
        'Shared room count:', sharedRooms?.customer?.length || 0);
      
      if (sharedRooms?.success && sharedRooms.customer) {
        // Add domainId as null for shared chats
        const sharedCustomers = sharedRooms.customer.map(c => ({
          ...c,
          domainId: null
        }));
        console.log('[DEBUG] Setting shared chats:', sharedCustomers.length);
        setSharedChats([...sharedCustomers] as Customer[]);
      } else {
        console.log('[DEBUG] No shared chats found or API failed');
        setSharedChats([]);
      }

      // Process all rooms regardless of domain
      if (allRooms?.success && allRooms.customer && allRooms.customer.length > 0) {
        // Get all chat customers
        const allCustomers = allRooms.customer;
        console.log('[DEBUG] Processing all customers:', allCustomers.length);
        
        // Filter live chats for the live tab
        const liveCustomers = allCustomers.filter(c => 
          c.chatRoom && c.chatRoom.length > 0 && c.chatRoom[0].live
        );
        console.log('[DEBUG] Found live customers:', liveCustomers.length);
        
        // Include all chats (live and non-live) plus shared chats
        let allChats = [
          ...allCustomers,
          ...(sharedRooms?.success && sharedRooms.customer ? sharedRooms.customer : [])
        ];
        console.log('[DEBUG] Combined chat count before deduplication:', allChats.length);
        
        // Remove duplicates by chatRoom id
        const uniqueChats = allChats.reduce((acc, current) => {
          // Skip entries without chatRoom
          if (!current.chatRoom || current.chatRoom.length === 0) {
            console.log('[DEBUG] Skipping customer without chat room:', current.id);
            return acc;
          }
          
          const x = acc.find(item => 
            item.chatRoom && 
            item.chatRoom.length > 0 && 
            current.chatRoom[0].id === item.chatRoom[0].id
          );
          
          if (!x) {
            return [...acc, current as Customer];
          } else {
            console.log('[DEBUG] Found duplicate chat room:', current.chatRoom[0].id);
            return acc;
          }
        }, [] as Customer[]);
        
        console.log('[DEBUG] Unique chat count after deduplication:', uniqueChats.length);
        
        // Make sure to sort and display all chats
        sortChats(uniqueChats);
      } else {
        // Reset states if no data
        console.log('[DEBUG] No chat rooms found or API failed, resetting states');
        console.log('[DEBUG] API success:', allRooms?.success, 'Customer count:', allRooms?.customer?.length || 0);
        setAllChatRooms([]);
        setUnreadChats([]);
        setLiveChats([]);
      }
    } catch (error) {
      console.error('[DEBUG] Error in refreshChats:', error);
      
      // Try to get more detailed error information
      if (error instanceof Error) {
        console.error('[DEBUG] Error message:', error.message);
        console.error('[DEBUG] Error stack:', error.stack);
      }
      
      // Notify the user
      toast({
        title: "Error refreshing conversations",
        description: "There was an error loading your conversations. Please try again.",
        variant: "destructive"
      });
    } finally {
      console.log('[DEBUG] Refresh completed');
      setIsRefreshing(false);
      setLoading(false);
    }
  }, []);
  
  // Direct fetch function that bypasses all prevention logic
  const directFetchChats = useCallback(async () => {
    console.log('[DEBUG] Direct fetch chats called - bypassing all prevention logic');
    try {
      setLoading(true);
      
      // Directly fetch chat rooms without any conditions or debounce
      console.log('[DEBUG] Directly fetching all chat rooms...');
      const allRooms = await onGetDomainChatRooms('all');
      console.log('[DEBUG] Direct fetch result:', allRooms?.success ? 'Success' : 'Failed', 
        'Customer count:', allRooms?.customer?.length || 0);
      
      if (allRooms?.success && allRooms.customer && allRooms.customer.length > 0) {
        // Force setter with a fresh array
        const customers = [...allRooms.customer];
        console.log('[DEBUG] Setting all chat rooms directly with', customers.length, 'customers');
        setAllChatRooms(customers as Customer[]);
        
        // Extract live and unread chats
        const liveCustomers = customers.filter(c => 
          c.chatRoom && c.chatRoom.length > 0 && c.chatRoom[0].live
        );
        setLiveChats([...liveCustomers] as Customer[]);
        
        // Extract unread chats by checking latest message
        const unreadCustomers = customers.filter(c => {
          if (!c.chatRoom || c.chatRoom.length === 0 || !c.chatRoom[0].message || c.chatRoom[0].message.length === 0) {
            return false;
          }
          
          // Sort messages by newest first
          const sortedMessages = [...c.chatRoom[0].message].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          
          // Check if latest message is unread
          return !sortedMessages[0].seen;
        });
        setUnreadChats([...unreadCustomers] as Customer[]);
        
        return {
          success: true,
          allChats: customers,
          liveChats: liveCustomers,
          unreadChats: unreadCustomers
        };
      } else {
        console.log('[DEBUG] No chat rooms found in direct fetch');
        // Reset states
        setAllChatRooms([]);
        setUnreadChats([]);
        setLiveChats([]);
        return { 
          success: false, 
          allChats: [], 
          liveChats: [], 
          unreadChats: [] 
        };
      }
    } catch (error) {
      console.error('[DEBUG] Error in directFetchChats:', error);
      return { 
        success: false, 
        error, 
        allChats: [], 
        liveChats: [], 
        unreadChats: [] 
      };
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Add a function to temporarily prevent refreshes (for search, etc.)
  const preventRefresh = useCallback((prevent: boolean) => {
    console.log('[DEBUG] preventRefresh set to:', prevent);
    preventRefreshRef.current = prevent;
  }, []);
  
  // Mark when a search begins/ends to prevent refreshes during search
  const setSearchActive = useCallback((active: boolean) => {
    isSearching.current = active;
  }, []);

  const handleDomainChange = (domain: string) => {
    // Always set to 'all' regardless of the domain passed
    setSelectedDomain('all')
  }

  // Listen for real-time updates through Pusher with improved error handling
  useEffect(() => {
    if (!pusherClient) return;
    
    console.log('[DEBUG] Setting up Pusher listeners for real-time updates');
    
    let globalChannel: any = null;
    
    try {
      // Subscribe to global chat channel for real-time updates
      globalChannel = pusherClient.subscribe('chat-global');
      
      const handleChatListUpdate = () => {
        console.log('[DEBUG] Received chat-list-update event, refreshing');
        refreshChats(true);
      };
      
      const handleNewConversation = (data: any) => {
        console.log('[DEBUG] Received new-conversation event:', data);
        refreshChats(true);
      };
      
      const handleCustomerMessage = (data: any) => {
        console.log('[DEBUG] Received customer-message event:', data);
        refreshChats(true);
      };
      
      globalChannel.bind('chat-list-update', handleChatListUpdate);
      globalChannel.bind('new-conversation', handleNewConversation);
      globalChannel.bind('customer-message', handleCustomerMessage);
      globalChannel.bind('share-status-changed', handleChatListUpdate);
      
      // Delayed initial fetch to avoid blocking navigation
      setTimeout(() => {
        refreshChats(true);
      }, 100);
      
    } catch (error) {
      console.error('[DEBUG] Error setting up Pusher listeners:', error);
    }
    
    return () => {
      try {
        if (globalChannel) {
          globalChannel.unbind('chat-list-update');
          globalChannel.unbind('new-conversation');
          globalChannel.unbind('customer-message');
          globalChannel.unbind('share-status-changed');
          
          if (pusherClient) {
            pusherClient.unsubscribe('chat-global');
          }
        }
      } catch (error) {
        console.error('[DEBUG] Error cleaning up Pusher listeners:', error);
      }
    };
  }, [refreshChats, pusherClient]);

  return {
    register,
    allChatRooms,
    unreadChats,
    liveChats,
    sharedChats,
    loading,
    onGetActiveChatMessages,
    refreshChats,
    directFetchChats,
    handleDomainChange,
    setSearchActive,
    isRefreshing,
    preventRefresh,
  }
}

export const useChatTime = (createdAt: Date, roomId: string) => {
  const { chatRoom } = useChatContext()
  const [messageSentAt, setMessageSentAt] = useState<string>()
  const [urgent, setUrgent] = useState<boolean>(false)

  const onSetMessageRecievedDate = useCallback(() => {
    const dt = new Date(createdAt)
    const current = new Date()
    const currentDate = current.getDate()
    const hr = dt.getHours()
    const min = dt.getMinutes()
    const date = dt.getDate()
    const month = dt.getMonth()
    const difference = currentDate - date

    if (difference <= 0) {
      setMessageSentAt(`${hr}:${min}${hr > 12 ? 'PM' : 'AM'}`)
      if (current.getHours() - dt.getHours() < 2) {
        setUrgent(true)
      }
    } else {
      setMessageSentAt(`${date} ${getMonthName(month)}`)
    }
  }, [createdAt])

  const onSeenChat = useCallback(async () => {
    if (chatRoom == roomId && urgent) {
      await onViewUnReadMessages(roomId)
      setUrgent(false)
    }
  }, [chatRoom, roomId, urgent])

  useEffect(() => {
    onSeenChat()
  }, [chatRoom, onSeenChat])

  useEffect(() => {
    onSetMessageRecievedDate()
  }, [onSetMessageRecievedDate])

  return { messageSentAt, urgent, onSeenChat }
}

export const useChatWindow = () => {
  const { chats, loading, setChats, chatRoom, realtime, setRealtime } = useChatContext()
  const messageWindowRef = useRef<HTMLDivElement | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [typingAgent, setTypingAgent] = useState<{name: string; role?: string} | null>(null)
  const [chatMetadata, setChatMetadata] = useState<ChatMetadata>({
    keyTopics: [],
    status: 'new',
    conversationSummary: {
      keyPoints: [],
      userNeeds: [],
      actionItems: [],
      nextSteps: []
    },
    insights: {
      overview: 'Initial contact established',
      customerSentiment: 'Neutral',
      avgResponseTime: 'N/A',
      conversationDuration: 'N/A',
      messageCount: 0,
      currentTags: []
    }
  })
  const [hasTeamAccess, setHasTeamAccess] = useState(false)
  const [activeTeamMembers, setActiveTeamMembers] = useState<{id: string, name: string, lastActive: Date}[]>([])
  const [isProcessingMessage, setIsProcessingMessage] = useState(false)
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState<number>(0)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()
  const { register, handleSubmit, reset, formState } = useForm({
    resolver: zodResolver(ChatBotMessageSchema),
    mode: 'onChange',
  })

  // Update metadata whenever messages change
  useEffect(() => {
    if (chats && chats.length > 0) {
      const updatedMetadata = extractMetadataFromMessages(chats);
      setChatMetadata(updatedMetadata);
      
      // Log metadata updates for debugging
      console.log('[useChatWindow] Updated metadata:', {
        messageCount: updatedMetadata.insights.messageCount,
        duration: updatedMetadata.insights.conversationDuration,
        sentiment: updatedMetadata.insights.customerSentiment,
        tags: updatedMetadata.insights.currentTags?.length
      });
    } else {
      // Even if no messages, ensure we have a valid metadata object with correct message count
      setChatMetadata(prev => ({
        ...prev,
        insights: {
          ...prev.insights,
          messageCount: 0,
          currentTags: []
        }
      }));
    }
  }, [chats]);

  // Auto-scroll to bottom when new messages arrive
  const onScrollToBottom = useCallback(() => {
    if (!messageWindowRef.current) return;
    
    // Use requestAnimationFrame for smoother scrolling and better performance
    requestAnimationFrame(() => {
      if (messageWindowRef.current) {
        messageWindowRef.current.scroll({
          top: messageWindowRef.current.scrollHeight,
          left: 0,
          behavior: 'smooth',
        });
      }
    });
  }, [messageWindowRef]);

  // Sanitize message content to prevent XSS and other injection attacks
  const sanitizeMessage = useCallback((message: string): string => {
    // Basic sanitization - remove script tags and other dangerous content
    return message
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .trim();
  }, []);

  // Check if current user has team access to the conversation
  useEffect(() => {
    const checkTeamAccess = async () => {
      if (!chatRoom) return;
      
      try {
        const response = await fetch(`/api/conversations/${chatRoom}/team-access`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setHasTeamAccess(data.hasAccess);
        }
      } catch (error) {
        console.error('Error checking team access:', error);
        setHasTeamAccess(false);
      }
    };
    
    checkTeamAccess();
  }, [chatRoom]);

  // Load initial messages and chat room status - optimized with debounce
  useEffect(() => {
    const loadInitialState = async () => {
      if (!chatRoom) return;
      
      try {
        console.log(`[useChatWindow] Loading complete conversation history for ${chatRoom}`);
        
        // Try to get complete message history including bot messages from the new endpoint
        try {
          // First try the new endpoint that includes bot messages
          const response = await fetch(`/api/conversations/${chatRoom}/messages?include_bot=true`, {
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
              // Log success message and count
              console.log(`[useChatWindow] Successfully loaded ${data.messages.length} messages from API endpoint`);
              
              // Log the first and last message for debugging
              if (data.messages.length > 0) {
                console.log(`[useChatWindow] First message: ${data.messages[0].role} | ${data.messages[0].message.substring(0, 50)}`);
                console.log(`[useChatWindow] Last message: ${data.messages[data.messages.length-1].role} | ${data.messages[data.messages.length-1].message.substring(0, 50)}`);
              }
              
              // Format messages for display - ensuring all fields are handled correctly
              const formattedMessages = data.messages.map((msg: any) => ({
                id: msg.id,
                message: msg.message,
                role: msg.role || 'assistant',
                createdAt: new Date(msg.createdAt),
                seen: msg.seen,
                // Include additional fields only if they exist
                ...(msg.teamMemberId ? { teamMemberId: msg.teamMemberId } : {}),
                ...(msg.teamMemberName ? { teamMemberName: msg.teamMemberName } : {})
              }));
              
              // Sort messages chronologically to ensure proper order
              const sortedMessages = formattedMessages.sort(
                (a: {createdAt: Date}, b: {createdAt: Date}) => 
                  a.createdAt.getTime() - b.createdAt.getTime()
              );
              
              console.log(`[useChatWindow] Processed ${sortedMessages.length} messages for rendering`);
              
              // Update UI with ALL messages
              setChats(sortedMessages);
              
              // Update the latest message timestamp for optimistic updates
              if (sortedMessages.length > 0) {
                setLastMessageTimestamp(sortedMessages[sortedMessages.length - 1].createdAt.getTime());
              }
              
              // Extract metadata from the conversation
              const metadata = extractMetadataFromMessages(sortedMessages);
              setChatMetadata(metadata);
              
              // Scroll to bottom after messages load
              setTimeout(onScrollToBottom, 100);
              
              // Set realtime mode from API response
              if (data.live !== undefined) {
                setRealtime(data.live);
              } else {
                // Fall back to checking status if not included in response
                const status = await onGetChatRoomStatus(chatRoom);
                if (status !== undefined) {
                  setRealtime(status);
                }
              }
              
              // Successfully loaded data, return early
              return;
            }
          }
        } catch (apiError) {
          console.error('[useChatWindow] Error loading from API endpoint, falling back to legacy method:', apiError);
        }
        
        // Fallback: Load messages using the legacy method if the new API fails
        console.log('[useChatWindow] Falling back to legacy message loading method');
        const messages = await onGetChatMessages(chatRoom);
        
        // Safe type assertion to access messages
        const chatRoomData = messages?.[0] as any;
        const messageArray = chatRoomData?.message as any[] || [];
        
        console.log(`[useChatWindow] Fetched chat messages for room ${chatRoom}`, { 
          success: !!messages,
          messageCount: messageArray.length || 0 
        });
        
        if (messageArray && messageArray.length > 0) {
          // Process ALL messages to ensure nothing is missed
          console.log(`[useChatWindow] Raw messages count: ${messageArray.length}`);
          
          const formattedMessages = messageArray.map((msg: any) => {
            // Create a message object with only properties that exist
            const formattedMsg: ChatMessage = {
              id: msg.id,
              message: msg.message,
              role: msg.role as Role,
              createdAt: new Date(msg.createdAt),
              seen: msg.seen
            };
            
            return formattedMsg;
          });
          
          // Sort messages chronologically to ensure proper order
          const sortedMessages = formattedMessages.sort((a: any, b: any) => 
            a.createdAt.getTime() - b.createdAt.getTime()
          );
          
          console.log(`[useChatWindow] Processed ${sortedMessages.length} messages for rendering`);
          
          if (sortedMessages.length > 0) {
            console.log(`[useChatWindow] First message: "${sortedMessages[0].message.substring(0, 30)}..."`);
            console.log(`[useChatWindow] Last message: "${sortedMessages[sortedMessages.length-1].message.substring(0, 30)}..."`);
          }
          
          // Update UI with ALL messages
          setChats(sortedMessages);
          
          // Update the latest message timestamp for optimistic updates
          if (sortedMessages.length > 0) {
            setLastMessageTimestamp(sortedMessages[sortedMessages.length - 1].createdAt.getTime());
          }
          
          // Extract metadata from the conversation
          const metadata = extractMetadataFromMessages(sortedMessages);
          setChatMetadata(metadata);
          
          // Scroll to bottom after messages load
          setTimeout(onScrollToBottom, 100);
        } else {
          console.warn(`[useChatWindow] No messages found for chat room ${chatRoom}`);
        }

        // Check if room is in real-time mode
        const status = await onGetChatRoomStatus(chatRoom);
        if (status !== undefined) {
          setRealtime(status);
        }
      } catch (error) {
        console.error('[useChatWindow] Error loading initial state:', error);
      }
    };
    
    // Add debounce to prevent multiple rapid calls
    const debouncedLoad = debounce(loadInitialState, 300);
    debouncedLoad();
    
    return () => {
      debouncedLoad.cancel();
    };
  }, [chatRoom, setChats, setRealtime, onScrollToBottom]);

  // Listen for real-time message updates
  useEffect(() => {
    if (!chatRoom || !pusherClient) return;
    
    // Subscribe to the chat channel
    const chatChannel = pusherClient.subscribe(chatRoom);
    
    const handleNewMessage = (data: { 
      chat: {
        id: string;
        message: string;
        role: Role;
        createdAt: Date;
        seen: boolean;
        teamMemberId?: string;
        teamMemberName?: string;
        isNote?: boolean;
        noteType?: string;
      }
    }) => {
      // Create a fully formatted message with proper date
      const messageWithDate = {
        ...data.chat,
        createdAt: new Date(data.chat.createdAt)
      };
      
      console.log(`[useChatWindow] Received real-time message: "${messageWithDate.message.substring(0, 30)}..."`);
      
      // Check if message is already in the chat (prevent duplicates)
      setChats(prev => {
        // Check if we already have this message (by ID)
        const messageExists = prev.some(msg => msg.id === messageWithDate.id);
        
        if (messageExists) {
          console.log("[useChatWindow] Message already exists, not adding duplicate:", messageWithDate.id);
          return prev;
        }
        
        console.log("[useChatWindow] Adding new message:", messageWithDate.id, messageWithDate.message);
        
        // Update the last message timestamp for duplicate prevention
        setLastMessageTimestamp(messageWithDate.createdAt.getTime());
        
        // Add the new message and ensure correct chronological order
        const newChats = [...prev, messageWithDate].sort((a, b) => 
          a.createdAt.getTime() - b.createdAt.getTime()
        );
        
        // Scroll to bottom with new messages
        setTimeout(onScrollToBottom, 100);
        
        return newChats;
      });
      
      // Reset typing indicator when new message arrives
      setIsTyping(false);
      setTypingAgent(null);
    };
    
    // Listen for both channels to ensure we get all messages
    chatChannel.bind('realtime-mode', handleNewMessage);
    chatChannel.bind('chat-message', handleNewMessage);
    
    return () => {
      chatChannel.unbind('realtime-mode', handleNewMessage);
      chatChannel.unbind('chat-message', handleNewMessage);
      if (pusherClient) {
        pusherClient.unsubscribe(chatRoom);
      }
    };
  }, [chatRoom, pusherClient, setChats, lastMessageTimestamp, onScrollToBottom]);

  // Track active team members with optimized subscription
  useEffect(() => {
    if (!chatRoom || !pusherClient) return;
    
    const presenceChannel = pusherClient.subscribe(`${chatRoom}-presence`);
    
    const handleMemberActivity = (data: { 
      memberId: string;
      memberName: string;
      timestamp: Date;
    }) => {
      setActiveTeamMembers(prev => {
        // Remove the member if already in the list to avoid duplicates
        const filtered = prev.filter(m => m.id !== data.memberId);
        
        // Add the member with the new timestamp
        return [...filtered, {
          id: data.memberId,
          name: data.memberName,
          lastActive: new Date(data.timestamp)
        }];
      });
    };
    
    presenceChannel.bind('team-member-active', handleMemberActivity);
    
    // Optimized cleanup of inactive members (every 60 seconds)
    const cleanupInterval = setInterval(() => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      setActiveTeamMembers(prev => 
        prev.filter(member => member.lastActive > fiveMinutesAgo)
      );
    }, 60 * 1000);
    
    return () => {
      presenceChannel.unbind('team-member-active', handleMemberActivity);
      if (pusherClient) {
        pusherClient.unsubscribe(`${chatRoom}-presence`);
      }
      clearInterval(cleanupInterval);
    };
  }, [chatRoom]);

  // Listen for realtime mode changes with error handling
  useEffect(() => {
    if (!chatRoom || !pusherClient) return;
    
    let retryCount = 0;
    const MAX_RETRIES = 3;
    
    const subscribeToModeChanges = () => {
      try {
        if (!pusherClient) return; // Add null check
        
        const modeChannel = pusherClient.subscribe(`${chatRoom}-mode`);
        
        const handleModeChange = (data: { 
          live: boolean;
          supportAgent?: {
            name: string;
            role?: string;
          }
        }) => {
          setRealtime(data.live);
          
          if (!data.live) {
            // When live mode is disabled, refresh messages from server
            if (chatRoom) {
              onGetChatMessages(chatRoom).then(messages => {
                // Safe type assertion to access messages
                const chatRoomData = messages?.[0] as any;
                const messageArray = chatRoomData?.message as any[] || [];
                
                if (messageArray && messageArray.length > 0) {
                  const formattedMessages = messageArray.map((msg: any) => {
                    // Create a base message object with standard properties
                    const formattedMsg: ChatMessage = {
                      id: msg.id,
                      message: msg.message,
                      role: msg.role as Role,
                      createdAt: new Date(msg.createdAt),
                      seen: msg.seen
                    };
                    
                    return formattedMsg;
                  });
                  
                  // Sort messages chronologically and set state
                  const sortedMessages = formattedMessages.sort((a: any, b: any) => 
                    a.createdAt.getTime() - b.createdAt.getTime()
                  );
                  
                  setChats(sortedMessages);
                }
              }).catch(error => {
                console.error('[useChatWindow] Error refreshing messages after mode change:', error);
              });
            }
          }
        };
        
        modeChannel.bind('mode-change', handleModeChange);
        
        return () => {
          try {
            modeChannel.unbind('mode-change', handleModeChange);
            if (pusherClient) {
              pusherClient.unsubscribe(`${chatRoom}-mode`);
            }
          } catch (cleanupError) {
            console.error('[useChatWindow] Error during cleanup:', cleanupError);
          }
        };
      } catch (error) {
        console.error('[useChatWindow] Error in subscribeToModeChanges:', error);
        
        // Add retry logic
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`[useChatWindow] Retrying subscription (${retryCount}/${MAX_RETRIES})...`);
          setTimeout(subscribeToModeChanges, 1000);
        }
        
        return () => {}; // Empty cleanup function for error case
      }
    };
    
    const cleanup = subscribeToModeChanges();
    return cleanup;
  }, [chatRoom, pusherClient, setChats, setRealtime]);

  // Enhanced message handling with security and performance optimization
  const onHandleSentMessage = async (messageData: { message: string }) => {
    console.log('[useChatWindow] Starting message handling...', {
      hasContent: !!messageData?.message?.trim(),
      isProcessing: isProcessingMessage,
      chatRoomId: chatRoom
    });

    const content = messageData?.message?.trim();
    
    if (!content || isProcessingMessage || !chatRoom) {
      console.log('[useChatWindow] Message handling blocked:', {
        hasContent: !!content,
        isProcessing: isProcessingMessage,
        hasChatRoom: !!chatRoom
      });
      return;
    }
    
    try {
      console.log('[useChatWindow] Setting processing state...');
      setIsProcessingMessage(true);
      
      // Sanitize the message content to prevent XSS attacks
      const sanitizedContent = sanitizeMessage(content);
      console.log('[useChatWindow] Message sanitized:', sanitizedContent);
      
      // Generate a temporary ID for optimistic UI updates
      const tempId = generateUUID();
      console.log('[useChatWindow] Generated temp ID:', tempId);
      
      // Create optimistic message for immediate UI feedback
      const optimisticMessage = {
        id: tempId,
        message: sanitizedContent,
        role: 'assistant' as Role,
        createdAt: new Date(),
        seen: true
      };
      
      console.log('[useChatWindow] Adding optimistic message:', optimisticMessage);
      
      // Add optimistic message to UI immediately
      setChats(prev => {
        const newChats = [...prev, optimisticMessage];
        console.log('[useChatWindow] Updated chat state with optimistic message. Total messages:', newChats.length);
        return newChats;
      });
      
      // Scroll to bottom after adding optimistic message
      setTimeout(onScrollToBottom, 50);
      
      console.log('[useChatWindow] Sending message to server via onOwnerSendMessage...');
      
      // Send actual message to server
      const message = await onOwnerSendMessage(
        chatRoom,
        sanitizedContent,
        'assistant'
      );

      console.log('[useChatWindow] Server response from onOwnerSendMessage:', message);

      if (message) {
        console.log('[useChatWindow] Processing successful server response...');
        
        // Replace the optimistic message with the real one
        setChats(prev => {
          const withoutTemp = prev.filter(msg => msg.id !== tempId);
          console.log('[useChatWindow] Removed temporary message. Messages remaining:', withoutTemp.length);
          
          const serverMessage = {
            ...message.message[0],
            createdAt: new Date(message.message[0].createdAt)
          };
          
          console.log('[useChatWindow] Adding server message:', serverMessage);
          
          const updatedChats = [...withoutTemp, serverMessage].sort((a, b) => 
            a.createdAt.getTime() - b.createdAt.getTime()
          );
          
          console.log('[useChatWindow] Final chat state updated. Total messages:', updatedChats.length);
          return updatedChats;
        });

        // Store the server-generated ID to prevent duplicate messages
        setLastMessageTimestamp(new Date(message.message[0].createdAt).getTime());
        console.log('[useChatWindow] Updated last message timestamp');

        // Notify that a team member is active
        if (hasTeamAccess && pusherClient) {
          try {
            console.log('[useChatWindow] Updating team activity...');
            await fetch(`/api/conversations/${chatRoom}/team-activity`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              }
            });
            console.log('[useChatWindow] Team activity updated successfully');
          } catch (activityError) {
            console.error('[useChatWindow] Error updating team activity:', activityError);
          }
        }
      } else {
        console.error('[useChatWindow] No response from server for message:', sanitizedContent);
      }
    } catch (error) {
      console.error('[useChatWindow] Error in message handling:', error);
      toast({
        title: "Error sending message",
        description: "Your message couldn't be sent. Please try again.",
        variant: "destructive",
      });
      
      // Remove the optimistic message on error
      const tempId = generateUUID(); // Declare tempId in catch block scope
      setChats(prev => {
        console.log('[useChatWindow] Removing failed optimistic message');
        return prev.filter(msg => msg.id !== tempId);
      });
    } finally {
      console.log('[useChatWindow] Message handling completed');
      setIsProcessingMessage(false);
    }
  };

  // Fix the handleInputChange function to use proper debounce with cancel
  const handleInputChange = useCallback(
    debounce((e: React.ChangeEvent<HTMLInputElement>) => {
      if (!chatRoom) return;
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      sendTypingStatus(chatRoom, true);
      
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingStatus(chatRoom, false);
      }, 3000);
    }, 500),
    [chatRoom]
  );
  
  // Improved typing indicator listener with WebSocket reconnection logic
  useEffect(() => {
    if (!chatRoom) return;
    
    let retryCount = 0;
    const MAX_RETRIES = 3;
    
    const subscribeToTypingStatus = () => {
      try {
        if (!pusherClient) {
          console.warn('Pusher client not available for typing status subscription');
          return () => {};
        }
        
        const chatChannel = pusherClient.subscribe(chatRoom);
        
        const handleTypingStatus = (data: { 
          isTyping: boolean; 
          agent?: { 
            name: string; 
            role?: string; 
          };
          timestamp: Date;
        }) => {
          setIsTyping(data.isTyping);
          setTypingAgent(data.agent || null);
        };
        
        chatChannel.bind('typing-status', handleTypingStatus);
        
        // Listen for connection state changes
        if (pusherClient) {
          pusherClient.connection.bind('state_change', (states: { current: string }) => {
            if (states.current === 'connected') {
              // Re-subscribe to channel on reconnection
              chatChannel.bind('typing-status', handleTypingStatus);
            }
          });
        }
        
        return () => {
          chatChannel.unbind('typing-status', handleTypingStatus);
          if (pusherClient) {
            pusherClient.connection.unbind('state_change');
          }
        };
      } catch (error) {
        console.error('Error subscribing to typing status:', error);
        
        // Implement retry logic with exponential backoff
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          const delay = Math.pow(2, retryCount) * 1000;
          setTimeout(subscribeToTypingStatus, delay);
        }
        
        return () => {}; // Empty cleanup for error case
      }
    };
    
    const cleanup = subscribeToTypingStatus();
    return () => {
      cleanup();
      // Cleanup any pending debounced functions
      handleInputChange.cancel();
    };
  }, [chatRoom, handleInputChange]);

  return {
    messageWindowRef,
    register,
    onHandleSentMessage,
    handleInputChange,
    chats,
    loading,
    chatRoom,
    realtime,
    isTyping,
    typingAgent,
    chatMetadata,
    setChats,
    isProcessingMessage,
    onScrollToBottom
  }
}

