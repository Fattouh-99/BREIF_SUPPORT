import { ChatBotMessageProps } from '@/schemas/conversation.schema'
import React, { forwardRef, useState } from 'react'
import { UseFormRegister } from 'react-hook-form'
import { Avatar, AvatarFallback } from '../ui/avatar'
import Image from 'next/image'
import RealTimeMode from './real-time'
import { BOT_TABS_MENU } from '@/constants/menu'
import { Separator } from '../ui/separator'
import Bubble from './bubble'
import { Responding } from './responding'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Send, X, Minus, ArrowLeft, Expand } from 'lucide-react'
import Accordion from '../accordian'
import { BotIconType } from '@/icons/bot-icons'
import { clearChatStorage } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { onToggleRealtime } from '@/actions/conversation'
import { pusherClient } from '@/lib/pusher'
import ProductCard from './product-card'
import ProductPreview from './product-preview'
import HomeTab, { HomeLayoutStyle } from './home'
import InquiryForm from './inquiry-form'
import '../../styles/chatbot-animations.css'

type Props = {
  errors: any
  register: UseFormRegister<ChatBotMessageProps>
  chats: { 
    role: 'assistant' | 'user'
    content: string
    link?: string
    createdAt?: string | Date
    id?: string
  }[]
  onChat: (e: React.FormEvent<HTMLFormElement> | any) => void
  onResponding: boolean
  domainName: string
  theme?: string | null
  textColor?: string | null
  themeColor?: string | null
  helpDeskColor?: string | null
  titleColor?: string | null
  homeTitle?: string | null
  bubbleBackground?: string | null
  help?: boolean
  iconColor?: string | null
  iconStyle: BotIconType
  onClose: () => void
  onMinimize: () => void
  onExpand?: (isExpanded: boolean) => void
  inquiryMode?: boolean
  productsEnabled?: boolean
  customLinksEnabled?: boolean
  popularTopicsEnabled?: boolean
  popularTopics?: string
  homeLayout?: HomeLayoutStyle
  realtimeMode:
    | {
        chatroom: string
        mode: boolean
        supportAgent?: {
          name: string;
          role?: string;
        }
      }
    | undefined
  helpdesk: {
    id: string
    question: string
    answer: string
    content?: string | null
    domainId: string | null
  }[]
  chatBot?: {
    feedbackEnabled?: boolean
    feedbackQuestion?: string
    feedbackYesText?: string
    feedbackNoText?: string
    feedbackFollowUp?: string
  }
  setChat: React.Dispatch<
    React.SetStateAction<
      {
        role: 'user' | 'assistant'
        content: string
        link?: string | undefined
        createdAt?: string | Date
      }[]
    >
  >
  filterQuestions?: { id: string; question: string }[]
  products?: {
    id: string
    name: string
    price: number
    image: string
    description?: string | null
    productType?: string | null
    hasDiscount: boolean
    discountedPrice?: number | null
    active: boolean
    productUrl?: string | null
  }[]
  customLinks?: {
    id: string
    title: string
    description?: string
    url: string
  }[]
  buttonPosition?: { x: number; y: number }
  domainId?: string
  domainIcon?: string | null
  windowAnimationState?: 'closed' | 'opening' | 'open' | 'closing'
}

export const BotWindow = forwardRef<HTMLDivElement, Props>(
  (
    {
      errors,
      register,
      chats,
      onChat,
      onResponding,
      domainName,
      helpdesk,
      chatBot,
      realtimeMode,
      setChat,
      textColor,
      theme,
      themeColor,
      helpDeskColor,
      titleColor,
      homeTitle,
      iconColor,
      bubbleBackground,
      onClose,
      onMinimize,
      onExpand,
      inquiryMode = false,
      productsEnabled = true,
      customLinksEnabled = false,
      popularTopicsEnabled = true,
      popularTopics,
      homeLayout,
      products = [],
      customLinks,
      buttonPosition,
      domainId,
      domainIcon,
      windowAnimationState
    },
    ref
  ) => {
    // Parse popular topics from JSON string
    const parsePopularTopics = (topicsString?: string) => {
      if (!topicsString) return []
      try {
        return JSON.parse(topicsString)
      } catch {
        return []
      }
    }

    const parsedPopularTopics = React.useMemo(() => parsePopularTopics(popularTopics), [popularTopics]);

    const [activeTab, setActiveTab] = useState<string>('home')
    const [isMinimized, setIsMinimized] = useState(false)
    const [showCloseDialog, setShowCloseDialog] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedProduct, setSelectedProduct] = useState<any>(null)
    const [showProductPreview, setShowProductPreview] = useState(false)
    const [isExiting, setIsExiting] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const [typingAgent, setTypingAgent] = useState<{ name: string; role?: string } | null>(null)
    const [isChatActive, setIsChatActive] = useState(false)
    const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
    const [channel, setChannel] = useState<any>(null)
    const [isExpanded, setIsExpanded] = useState(false)
    const [selectedFaq, setSelectedFaq] = useState<{
      id: string
      question: string
      answer: string
      content?: string | null
      domainId: string | null
    } | null>(null)
    const [feedbackState, setFeedbackState] = useState<{[key: string]: 'yes' | 'no' | null}>({})
    const [feedbackSubmitted, setFeedbackSubmitted] = useState<{[key: string]: boolean}>({})
    const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)


    
    // Calculate transform origin once on mount or when buttonPosition changes
    const transformOrigin = React.useMemo(() => {
      if (!buttonPosition) return 'bottom right';
      
      // Get viewport dimensions once - move window check to effect
      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
      const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
      
      // Calculate percentages - constrain to reasonable values to avoid edge cases
      const originX = Math.min(Math.max((buttonPosition.x / viewportWidth) * 100, 10), 90);
      const originY = Math.min(Math.max((buttonPosition.y / viewportHeight) * 100, 10), 90);
      
      return `${originX}% ${originY}%`;
    }, [buttonPosition]);

    // Animation is now handled by parent component

    // Filter out any maintenance mode announcements that might have slipped through
    const filteredChats = React.useMemo(() => {
      return chats.filter(msg => {
        // Filter out maintenance-related system messages
        return !(
          msg.role === 'assistant' && 
          (msg.content.includes('Maintenance Mode:') || 
           msg.content.includes('maintenance mode') ||
           msg.content.includes('site is under developing'))
        );
      });
    }, [chats]);

    // Function to ensure agent names are properly displayed in messages
    const formatMessagesWithAgentInfo = (messages: {
      role: 'assistant' | 'user';
      content: string;
      link?: string;
      createdAt?: string | Date;
      teamMemberId?: string;
      teamMemberName?: string;
    }[]) => {
      if (!realtimeMode?.mode) {
        console.log('[AGENT DEBUG] No realtime mode available:', realtimeMode);
        return messages;
      }
      
      // Find the system message announcing real-time mode
      const realTimeModeIndex = messages.findIndex(msg => 
        msg.content.includes('Live support mode has been enabled')
      );
      
      // Format the system message if found
      if (realTimeModeIndex !== -1 && realtimeMode?.mode) {
        return messages.map((msg, index) => {
          if (msg.role === 'assistant' && index >= realTimeModeIndex) {
            return {
              ...msg,
              teamMemberId: msg.teamMemberId || (realtimeMode.supportAgent ? realtimeMode.supportAgent.name : 'Support'),
              teamMemberName: msg.teamMemberName || (realtimeMode.supportAgent ? realtimeMode.supportAgent.name : 'Support')
            };
          }
          return msg;
        });
      }
      
      return messages;
    };

    // Get chat session ID for consistency tracking
    const getChatSessionId = (): string => {
      let sessionId = localStorage.getItem('chatSession');
      if (!sessionId) {
        sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('chatSession', sessionId);
      }
      return sessionId;
    };

    // Handler for global channel events
    const handleGlobalUpdate = (data: any) => {
      // Skip if not in real-time mode or data has no chat room ID
      if (!data || !data.chatRoomId) return;
      
      // If we're already in a real-time chat, don't switch contexts
      if (realtimeMode?.chatroom && realtimeMode.chatroom !== data.chatRoomId) {
        console.log('[AGENT DEBUG] Ignoring event for different chat room:', data.chatRoomId);
        return;
      }

      // Verify session ID if provided
      const currentSessionId = getChatSessionId();
      if (data.sessionId && currentSessionId !== data.sessionId) {
        console.log('[AGENT DEBUG] Session ID mismatch, ignoring event:', {
          current: currentSessionId,
          received: data.sessionId
        });
        return;
      }
      
      console.log('[AGENT DEBUG] Received global update:', data);
      
      // Update chat state if it matches our room or we're not yet in a room
      if (realtimeMode?.chatroom === data.chatRoomId || !realtimeMode?.chatroom) {
        // Subscribe to the specific chat room for more updates
        subscribe(data.chatRoomId);
      }
    };

    const subscribe = async (chatroomId: string) => {
      const sessionId = getChatSessionId();
      
      // Unsubscribe from any existing channel
      if (channel) {
        channel.unbind_all();
        channel.unsubscribe();
      }
      
      // Subscribe to the new chat room's messages
      const newChannel = pusherClient?.subscribe(chatroomId);
      
      // Bind to message events
      newChannel?.bind('chat-message', (data: any) => {
        if (data && data.chat && data.sessionId === sessionId) {
          handleCustomerMessage(data);
        }
      });
      
      // Bind to typing status events
      newChannel?.bind('typing-status', (data: any) => {
        if (data && data.sessionId === sessionId) {
          setIsTyping(data.isTyping || false);
          setTypingAgent(data.agent || null);
        }
      });
      
      setChannel(newChannel);
      
      // Also subscribe to mode channel for status updates
      const modeChannel = pusherClient?.subscribe(`${chatroomId}-mode`);
      
      // Bind to mode change events
      modeChannel?.bind('mode-change', (data: any) => {
        if (data && data.sessionId === sessionId) {
          console.log('[AGENT DEBUG] Received mode change:', data);
          if (typeof data.live === 'boolean') {
            onRealtimeModeChange(chatroomId, data.live, data.supportAgent);
          }
        }
      });
    };

    // Function to safely handle real-time mode changes with session verification
    const onRealtimeModeChange = (chatRoomId: string, mode: boolean, agent?: any) => {
      // First, validate the session
      const sessionId = getChatSessionId();
      

      
      // Update chat history storage with the new realtime mode information
      const currentMessages = [...chats];
      localStorage.setItem('chat', JSON.stringify({
        messages: currentMessages,
        chatRoom: chatRoomId,
        isRealtime: mode,
        supportAgent: agent
      }));
    };

    // Listen for customer messages
    const handleCustomerMessage = (data: any) => {
      if (!realtimeMode?.mode || !realtimeMode.chatroom) return;
      
      // Match chatroom
      const isSameRoom = data?.chatroomId === realtimeMode.chatroom;
      if (!isSameRoom) return;
      
      // Update typing status
      if (data?.type === 'typing') {
        setIsTyping(data.typing);
        setTypingAgent(data.user);
      }
    };
    
    // If pusherClient and realtimeMode are available, subscribe to presence channel
    React.useEffect(() => {
      if (!realtimeMode?.mode || !realtimeMode.chatroom || !pusherClient) return;
      
      // Subscribe to presence channel
      const channel = pusherClient.subscribe(`presence-chatroom-${realtimeMode.chatroom}`);
      
      // Listen for typing events
      channel.bind('client-typing', handleCustomerMessage);
      
      return () => {
        if (pusherClient) {
          channel.unbind('client-typing', handleCustomerMessage);
          pusherClient.unsubscribe(`presence-chatroom-${realtimeMode.chatroom}`);
        }
      };
    }, [realtimeMode, pusherClient]);

    const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!realtimeMode?.mode || !realtimeMode.chatroom) return;

      // Clear existing timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      // Send typing status
      await notifyTypingStatus(realtimeMode.chatroom, true, {
        name: 'Customer',
        role: 'user'
      });

      // Set new timeout to clear typing status
      const timeout = setTimeout(async () => {
        await notifyTypingStatus(realtimeMode.chatroom, false, {
          name: 'Customer',
          role: 'user'
        });
      }, 2000);

      setTypingTimeout(timeout);
    };

    const handleClose = () => {
      setShowCloseDialog(true)
    }

    const handleMinimize = () => {
      setIsMinimized(!isMinimized)
      onMinimize()
    }

    const handleStartChat = () => {
      setActiveTab('chat')
      setIsChatActive(true)
    }

    const handleBackToHome = () => {
      setActiveTab('home')
      setIsChatActive(false)
    }

    const handleExpand = () => {
      const newExpandedState = !isExpanded
      setIsExpanded(newExpandedState)
      onExpand?.(newExpandedState)
    }

    const handleFaqClick = (faq: {
      id: string
      question: string
      answer: string
      content?: string | null
      domainId: string | null
    }) => {
      setSelectedFaq(faq)
      setIsExpanded(true) // Auto-expand when viewing FAQ detail
      onExpand?.(true)
    }

    const handleBackFromFaq = () => {
      setSelectedFaq(null)
      setIsExpanded(false) // Return to normal size
      onExpand?.(false)
    }

    const handleFeedback = async (helpDeskId: string, isHelpful: boolean) => {
      try {
        // Optimistically update UI
        setFeedbackState(prev => ({ ...prev, [helpDeskId]: isHelpful ? 'yes' : 'no' }))
        setFeedbackSubmitted(prev => ({ ...prev, [helpDeskId]: true }))

        // Submit feedback to API
        const response = await fetch('/api/feedback/helpdesk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            helpDeskId,
            domainId: domainId || '', // Use the domain ID from props
            isHelpful,
            sessionId,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to submit feedback')
        }

        // Optional: Show success message or animation
        console.log('Feedback submitted successfully')
      } catch (error) {
        console.error('Error submitting feedback:', error)
        // Revert optimistic update on error
        setFeedbackState(prev => ({ ...prev, [helpDeskId]: null }))
        setFeedbackSubmitted(prev => ({ ...prev, [helpDeskId]: false }))
      }
    }

    const handleTabClick = (tabLabel: string) => {
      if (tabLabel === 'chat') {
        handleStartChat()
      } else {
        setActiveTab(tabLabel)
        setIsChatActive(false)
      }
    }

    const confirmClose = async () => {
      // First hide the dialog
      setShowCloseDialog(false);
      
      // Then start exit animation
      setIsExiting(true);
      
      // Wait for exit animation to complete
      await new Promise(resolve => setTimeout(resolve, 350));
      
      // If in realtime mode, disable it
      if (realtimeMode?.mode && realtimeMode.chatroom) {
        await onToggleRealtime(
          realtimeMode.chatroom, 
          false,
          { name: "Sefrid Kapllani", role: 'support' }
        );
      }

      // Reset chat state
      const greetingMessage = chats[0]
      if (greetingMessage && greetingMessage.role === 'assistant') {
        setChat([greetingMessage])
        localStorage.setItem('chat', JSON.stringify({
          messages: [greetingMessage],
          chatRoom: null,
          isRealtime: false
        }))
      } else {
        clearChatStorage()
        setChat([])
      }
      
      onClose();
    }

    // Function to send typing status
    const notifyTypingStatus = async (chatroomId: string, isTyping: boolean, user: any) => {
      if (!chatroomId || !channel) return;
      if (!pusherClient) return;
      
      try {
        await channel.trigger('client-typing', {
          typing: isTyping,
          user
        });
      } catch (error) {
        console.error('Error triggering typing event:', error);
      }
    };

    // Listen for typing status and new messages in realtime mode
    React.useEffect(() => {
      if (!realtimeMode?.chatroom || !realtimeMode.mode || !pusherClient) return;

      console.log('[REALTIME] Setting up message listeners for chat room:', realtimeMode.chatroom);
      
      // Subscribe to chatroom channel
      const chatChannel = pusherClient.subscribe(realtimeMode.chatroom);
      setChannel(chatChannel);
      
      // Handle typing status updates
      const handleTypingStatus = (data: { 
        isTyping: boolean; 
        agent?: { name: string; role?: string } 
      }) => {
        console.log('[REALTIME] Typing status changed:', data.isTyping);
        setIsTyping(data.isTyping);
        setTypingAgent(data.agent || null);
      };
      
      // Handle new messages in realtime
      const handleChatMessage = (data: { 
        chat: {
          id: string;
          message: string;
          role: string;
          createdAt: string;
          teamMemberId?: string;
          teamMemberName?: string;
        }
      }) => {
        console.log('[REALTIME] New chat message received:', {
          id: data.chat.id,
          role: data.chat.role,
          message: data.chat.message.substring(0, 30) + (data.chat.message.length > 30 ? '...' : '')
        });
        
        // Convert the server message format to our client format
        const newMessage = {
          role: data.chat.role === 'user' ? 'user' as const : 'assistant' as const,
          content: data.chat.message,
          createdAt: new Date(data.chat.createdAt),
          // Only include id for duplicate checking, will be removed before adding to state
          _tempId: data.chat.id
        };
        
        // Add the message to the chat (avoiding duplicates)
        setChat(prevChats => {
          // Check if we already have this message
          const isDuplicate = prevChats.some(msg => 
            (msg.content === newMessage.content && 
             msg.role === newMessage.role &&
             msg.createdAt && newMessage.createdAt && 
             Math.abs(new Date(msg.createdAt).getTime() - new Date(newMessage.createdAt).getTime()) < 5000)
          );
          
          if (isDuplicate) {
            console.log('[REALTIME] Skipping duplicate message');
            return prevChats;
          }
          
          // Create a clean message without the temporary ID
          const cleanMessage = {
            role: newMessage.role,
            content: newMessage.content,
            createdAt: newMessage.createdAt
          };
          
          console.log('[REALTIME] Adding new message to chat');
          return [...prevChats, cleanMessage];
        });
        
        // Clear typing indicator when message is received
        setIsTyping(false);
      };
      
      // Register event handlers
      chatChannel.bind('typing-status', handleTypingStatus);
      chatChannel.bind('chat-message', handleChatMessage);
      chatChannel.bind('realtime-mode', handleChatMessage);
      
      // Debug subscription status
      chatChannel.bind('subscription_succeeded', () => {
        console.log('[REALTIME] Successfully subscribed to chat channel:', realtimeMode.chatroom);
      });
      
      chatChannel.bind('subscription_error', (err: any) => {
        console.error('[REALTIME ERROR] Failed to subscribe to chat channel:', err);
      });
      
      return () => {
        console.log('[REALTIME] Cleaning up Pusher subscriptions');
        chatChannel.unbind('typing-status', handleTypingStatus);
        chatChannel.unbind('chat-message', handleChatMessage);
        chatChannel.unbind('realtime-mode', handleChatMessage);
        chatChannel.unbind('subscription_succeeded');
        chatChannel.unbind('subscription_error');
        
        try {
          pusherClient?.unsubscribe(realtimeMode.chatroom);
        } catch (error) {
          console.error('[REALTIME ERROR] Error unsubscribing from channel:', error);
        }
      };
    }, [realtimeMode?.chatroom, realtimeMode?.mode, setChat]);

    // Handle real-time mode changes
    React.useEffect(() => {
      if (!realtimeMode?.chatroom || !pusherClient) return;
      
      // Set up channel for real-time mode status changes
      const modeChannel = pusherClient.subscribe(`${realtimeMode.chatroom}-mode`);
      
      const handleModeChange = (data: { 
        live: boolean; 
        supportAgent?: {
          name: string;
          role?: string;
        } 
      }) => {
        console.log('[REALTIME] Mode change detected:', data.live);
        
        // If real-time mode is enabled, add system message
        if (data.live && !realtimeMode.mode) {
          setChat(prevChats => {
            // Check if we already have the system message
            const hasSystemMessage = prevChats.some(msg => 
              msg.content.includes('Live support mode has been enabled')
            );
            
            if (!hasSystemMessage) {
              console.log('[REALTIME] Adding system message for live mode');
              return [...prevChats, {
                role: 'assistant' as const,
                content: 'Live support mode has been enabled.',
                createdAt: new Date(),
              }];
            }
            
            return prevChats;
          });
        }
      };
      
      modeChannel.bind('mode-change', handleModeChange);
      
      return () => {
        modeChannel.unbind('mode-change', handleModeChange);
        try {
          pusherClient?.unsubscribe(`${realtimeMode.chatroom}-mode`);
        } catch (error) {
          console.error('[REALTIME ERROR] Error unsubscribing from mode channel:', error);
        }
      };
    }, [realtimeMode?.chatroom, realtimeMode?.mode, setChat]);

    // Helper function to render navigation based on layout style
    const renderNavigation = () => {
      const filteredTabs = BOT_TABS_MENU.filter(tab => productsEnabled || tab.label !== 'products');
      
      switch (homeLayout) {
        case 'modern':
          return (
            <div className="px-6 py-5 bg-gradient-to-b from-white to-gray-50/50 border-b border-gray-200/60">
              <div className="grid grid-cols-3 gap-4">
                {filteredTabs.map((tab, index) => (
                  <button
                    key={index}
                    onClick={() => handleTabClick(tab.label)}
                    className={cn(
                      "flex flex-col items-center gap-3 py-5 px-3 rounded-2xl transition-all duration-300 relative overflow-hidden group",
                      "focus:outline-none focus:ring-2 focus:ring-opacity-50",
                      activeTab === tab.label
                        ? "text-white transform scale-105 shadow-xl"
                        : "text-gray-600 hover:text-gray-800 bg-white hover:bg-white hover:shadow-lg border border-gray-200/50 hover:border-gray-300/60"
                    )}
                    style={activeTab === tab.label ? {
                      background: `linear-gradient(145deg, ${themeColor || '#6366f1'}, ${themeColor ? themeColor + 'cc' : '#4f46e5'})`,
                      boxShadow: `0 10px 30px ${themeColor || '#6366f1'}25, 0 4px 15px ${themeColor || '#6366f1'}15`
                    } : {}}
                  >
                    <div 
                      className={cn(
                        "transition-all duration-300 p-3 rounded-xl relative",
                        activeTab === tab.label 
                          ? "bg-white/25 backdrop-blur-sm shadow-lg ring-1 ring-white/30" 
                          : "bg-gray-50 group-hover:bg-gray-100 group-hover:shadow-md"
                      )}
                    >
                      <div 
                        className="transition-all duration-300"
                        style={{
                          color: activeTab === tab.label ? '#ffffff' : (themeColor || '#6366f1'),
                          filter: activeTab === tab.label ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' : 'none'
                        }}
                      >
                        {tab.icon}
                      </div>
                    </div>

                    {activeTab === tab.label && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none rounded-2xl"></div>
                        <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50 blur-sm"></div>
                      </>
                    )}
                    {/* Hover effect for inactive tabs */}
                    {activeTab !== tab.label && (
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div 
                          className="absolute inset-0 rounded-2xl opacity-5"
                          style={{ background: themeColor || '#6366f1' }}
                        ></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );

        case 'compact':
          return (
            <div className="border-b border-gray-200/60 bg-gradient-to-b from-white to-gray-50/30">
              <div className="flex">
                {filteredTabs.map((tab, index) => (
                  <button
                    key={index}
                    onClick={() => handleTabClick(tab.label)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-4 px-2 transition-all duration-300 relative group",
                      "focus:outline-none focus:ring-2 focus:ring-opacity-50",
                      activeTab === tab.label
                        ? "text-gray-900 font-semibold bg-white/60"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50/50"
                    )}
                    style={activeTab === tab.label ? {
                      color: themeColor || '#6366f1'
                    } : {}}
                  >
                    <div 
                      className="transition-all duration-300 p-1.5 rounded-lg"
                      style={{
                        backgroundColor: activeTab === tab.label ? `${themeColor || '#6366f1'}15` : 'transparent'
                      }}
                    >
                      {tab.icon}
                    </div>

                    {activeTab === tab.label && (
                      <div 
                        className="absolute bottom-0 left-0 right-0 h-1 transition-all duration-300 rounded-t-lg shadow-sm"
                        style={{ 
                          background: `linear-gradient(90deg, transparent, ${themeColor || '#6366f1'}, transparent)`,
                          boxShadow: `0 -2px 8px ${themeColor || '#6366f1'}25`
                        }}
                      ></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );

        case 'helpdesk':
          return (
            <div className="bg-white border-t border-gray-200">
              <div className="flex justify-around">
                {filteredTabs.map((tab, index) => (
                  <button
                    key={index}
                    onClick={() => handleTabClick(tab.label)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 py-2.5 px-4 transition-all duration-200 relative group w-full",
                      activeTab === tab.label
                        ? "text-gray-900"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    <div 
                      className={cn(
                        "transition-all duration-200 p-1.5 rounded-lg",
                        activeTab === tab.label 
                          ? "bg-primary/10" 
                          : "bg-transparent group-hover:bg-gray-100"
                      )}
                      style={activeTab === tab.label ? { backgroundColor: `${themeColor || '#6366f1'}15` } : {}}
                    >
                      {tab.icon}
                    </div>

                    {activeTab === tab.label && (
                      <div 
                        className="absolute top-0 left-0 right-0 h-0.5"
                        style={{ background: themeColor || '#6366f1' }}
                      ></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );

        default: // 'classic'
          return (
            <div className="px-4 py-4 border-b border-gray-200/60 bg-gradient-to-b from-white to-gray-50/30">
              <div className="flex justify-between items-center bg-gray-100/80 rounded-full p-1.5 max-sm:overflow-x-auto max-sm:gap-1 shadow-sm border border-gray-200/40">
                {filteredTabs.map((tab, index) => (
                  <button
                    key={index}
                    onClick={() => handleTabClick(tab.label)}
                    className={cn(
                      "flex items-center gap-2 py-2.5 px-5 rounded-full transition-all duration-300 relative group",
                      "focus:outline-none focus:ring-2 focus:ring-opacity-50",
                      activeTab === tab.label
                        ? "bg-white shadow-lg text-gray-800 transform scale-105"
                        : "text-gray-600 hover:text-gray-800 hover:bg-white/70 hover:shadow-md"
                    )}
                    style={activeTab === tab.label ? {
                      boxShadow: `0 4px 12px rgba(0,0,0,0.12), 0 0 0 1px ${themeColor || '#6366f1'}15`
                    } : {}}
                  >
                    <div 
                      className="transition-all duration-300 p-1 rounded-lg"
                      style={{
                        color: activeTab === tab.label ? (themeColor || '#6366f1') : '#6B7280',
                        backgroundColor: activeTab === tab.label ? `${themeColor || '#6366f1'}10` : 'transparent'
                      }}
                    >
                      {tab.icon}
                    </div>

                    {activeTab === tab.label && (
                      <div 
                        className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full transition-all duration-300"
                        style={{ background: themeColor || '#6366f1' }}
                      ></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
      }
    };

    return (
      <>
        <div
          className={cn(
            "fixed inset-0 bg-black/30 z-50 flex items-center justify-center transition-opacity duration-200",
            showCloseDialog ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setShowCloseDialog(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden transform transition-all duration-200"
            style={{
              borderColor: `${themeColor || '#6366f1'}20`,
              transform: showCloseDialog ? 'scale(1)' : 'scale(0.95)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h3 
                className="text-lg font-semibold mb-2"
                style={{ color: titleColor || '#1F2937' }}
              >
                Close Chat Window?
              </h3>
              <p 
                className="text-sm mb-6"
                style={{ color: textColor || '#4B5563' }}
              >
                This will end your conversation and clear the chat history. Are you sure?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCloseDialog(false)}
                  className="px-4 py-2 text-sm font-medium rounded-md border transition-colors"
                  style={{
                    borderColor: `${themeColor || '#6366f1'}20`,
                    color: themeColor || '#6366f1'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmClose}
                  className="px-4 py-2 text-sm font-medium rounded-md text-white transition-colors"
                  style={{
                    backgroundColor: themeColor || '#6366f1',
                  }}
                >
                  Close Chat
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <ProductPreview 
          isOpen={showProductPreview}
          onClose={() => setShowProductPreview(false)}
          product={selectedProduct}
        />
        
        <div className={cn(
          "flex flex-col bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden chatbot-shadow-strong",
          "transition-all duration-300 ease-in-out transform chatbot-element",
          isMinimized ? 
            "h-[48px] w-[250px] minimized" : 
            isExpanded ?
              "h-[80vh] w-[60vw] max-w-[800px] max-h-[900px] max-sm:h-full max-sm:w-full max-sm:rounded-none" :
              "h-[670px] w-[450px] max-sm:h-full max-sm:w-full max-sm:rounded-none",
          windowAnimationState === 'opening' ? "chatbot-content-fade-in" : "",
          windowAnimationState === 'open' ? "opacity-100 scale-100 translate-y-0" : "",
          windowAnimationState === 'closing' ? "opacity-0 scale-95 translate-y-4" : "",
          isExiting ? "opacity-0 scale-95 translate-y-4" : ""
        )}
        data-expanded={isExpanded ? 'true' : 'false'}
        data-minimized={isMinimized ? 'true' : 'false'}
        style={{
          transformOrigin,
          willChange: 'transform, opacity',
          transitionProperty: 'transform, opacity',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
        }}>
          <div 
            className={cn(
              "flex justify-between items-center px-6 border-b transition-all duration-300 bg-white",
              isMinimized ? "py-1 border-transparent" : "p-2 border-gray-100"
            )}
          >
            <div className="flex gap-3 items-center">
              <div
                className={cn(
                  "transition-all duration-300 flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center",
                  isMinimized ? "w-8 h-8" : "w-16 h-16 max-sm:w-12 max-sm:h-12"
                )}
                style={{
                  background: domainIcon ? 'transparent' : '#f3f4ff'
                }}
              >
                {domainIcon ? (
                  <Image
                    src={`https://ucarecdn.com/${domainIcon}/`}
                    alt="Company Logo"
                    width={isMinimized ? 32 : 64}
                    height={isMinimized ? 32 : 64}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-4/5 h-4/5">
                    <defs>
                      <radialGradient id="starGradientHeader" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="70%" stopColor="#4285f4" stopOpacity="0.9" />
                      </radialGradient>
                    </defs>
                    <path d="M50,10 C55,30 70,45 90,50 C70,55 55,70 50,90 C45,70 30,55 10,50 C30,45 45,30 50,10 Z" 
                      fill="url(#starGradientHeader)" 
                    />
                  </svg>
                )}
              </div>
              <div className="flex items-start flex-col justify-center">
                <h3 className={cn(
                  "font-bold leading-none transition-all duration-300",
                  isMinimized ? "text-base" : "text-xl max-sm:text-lg"
                )}
                style={{ color: titleColor || '#1F2937' }}>
                  {domainName.split('.com')[0].charAt(0).toUpperCase() + domainName.split('.com')[0].slice(1)}
                </h3>
                {realtimeMode?.mode && (
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600 font-medium">Live Support Active</span>
                    {isTyping && typingAgent && typingAgent.role === 'support' && (
                      <span className="text-sm text-indigo-600">{typingAgent.name} is typing...</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExpand}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                <Expand className={cn("w-4 h-4 transition-transform duration-200", isExpanded && "rotate-180")} />
              </button>
              <button
                onClick={handleMinimize}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <Minus className="w-4 h-4" />
              </button>
              {!isMinimized && (
                <>
                  {selectedFaq ? (
                    <button 
                      onClick={handleBackFromFaq}
                      className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
                      title="Back to Knowledge Base"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  ) : isChatActive ? (
                    <button 
                      onClick={handleBackToHome}
                      className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
                      title="Back to Home"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  ) : (
                    <button 
                      onClick={handleClose}
                      className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Chat Navigation Tabs - Hide when in inquiry mode, FAQ detail view, and for helpdesk layout move to bottom */}
          {!inquiryMode && !isChatActive && !selectedFaq && homeLayout !== 'helpdesk' && renderNavigation()}

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {inquiryMode ? (
              <div className={cn(
                isExpanded ? "h-[calc(80vh-145px)]" : "h-[525px]", 
                "max-sm:h-[calc(100vh-145px)]"
              )}>
                <InquiryForm
                  themeColor={themeColor || undefined}
                  titleColor={titleColor || undefined}
                  domainName={domainName}
                  domainId={domainId || ''}
                />
              </div>
            ) : (
              <>
                {activeTab === 'home' && (
                  <div className={cn(
                    isExpanded ? "h-[calc(80vh-145px)]" : "h-[525px]", 
                    "max-sm:h-[calc(100vh-145px)] overflow-hidden"
                  )}>
                    <HomeTab 
                      themeColor={themeColor || undefined}
                      textColor={textColor || undefined}
                      titleColor={titleColor || undefined}
                      domainIcon={domainIcon}
                      onStartChat={handleStartChat}
                      onOpenHelpDesk={() => setActiveTab('helpdesk')}
                      onOpenSpecificHelpDeskQuestion={(questionId) => {
                        setActiveTab('helpdesk')
                        // Find the specific FAQ by ID and open it directly
                        const specificFaq = helpdesk.find(faq => faq.id === questionId)
                        if (specificFaq) {
                          handleFaqClick(specificFaq)
                        }
                      }}
                      onViewProducts={() => setActiveTab('products')}
                      hasProducts={productsEnabled && products.length > 0}
                      customLinks={customLinks}
                      customLinksEnabled={customLinksEnabled}
                      popularTopicsEnabled={popularTopicsEnabled}
                      popularTopics={parsedPopularTopics}
                      homeTitle={homeTitle || undefined}
                      homeLayout={homeLayout as HomeLayoutStyle}
                    />
                  </div>
                )}

                {activeTab === 'chat' && (
                  <>
                    <Separator orientation="horizontal" className="bg-gray-100" />
                    <div className="flex flex-col h-full">
                      {realtimeMode?.mode ? (
                    <div className={cn(
                      isExpanded ? "h-[calc(80vh-200px)]" : "h-[440px]", 
                      "max-sm:h-[calc(100vh-200px)] flex flex-col"
                    )}>
                      <RealTimeMode
                        messages={formatMessagesWithAgentInfo(filteredChats)}
                        isTyping={isTyping && typingAgent?.role === 'support'}
                        agent={realtimeMode.supportAgent}
                        containerRef={ref as React.RefObject<HTMLDivElement>}
                        theme={theme || undefined}
                        textColor={textColor || undefined}
                        themeColor={themeColor || undefined}
                        bubbleBackground={bubbleBackground || undefined}
                        productsEnabled={productsEnabled}
                      />
                      <form
                        onSubmit={onChat}
                        className="flex px-4 py-3 flex-col"
                        style={{ background: theme || '#ffffff' }}
                      >
                        <div className="flex justify-between items-center gap-2">
                          <Input
                            {...register('content')}
                            placeholder="Type your message..."
                            className="focus-visible:ring-1 focus-visible:ring-gray-200 flex-1 p-2 bg-white rounded-lg shadow-sm border-gray-100"
                            onChange={handleInputChange}
                          />
                          <Button
                            type="submit"
                            style={{ color: themeColor || '#6366f1' }}
                            className="text-white transition-all"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </form>
                    </div>
                  ) : inquiryMode ? (
                    <InquiryForm
                      themeColor={themeColor || undefined}
                      titleColor={titleColor || undefined}
                      domainName={domainName}
                      domainId={domainId || ''}
                    />
                  ) : (
                    <>
                      <div
                        ref={ref}
                        className={cn(
                          isExpanded ? "h-[calc(80vh-200px)]" : "h-[440px]", 
                          "max-sm:h-[calc(100vh-200px)] overflow-y-auto overflow-x-hidden p-5 flex flex-col"
                        )}
                        style={{ background: theme || '#ffffff' }}
                      >
                        <div className="flex justify-center items-center">
                          <p className="text-[10px]" style={{ color: `${textColor || '#6b7280'}80` }}>
                            Powered by <span style={{ color: themeColor || '#6366f1' }}>Brief Support</span>
                          </p>
                        </div>
                        {filteredChats.map((chat, index) => {
                          // Detect if this is part of a consecutive bot message group
                          const isBot = chat.role === 'assistant';
                          const prevChat = index > 0 ? filteredChats[index - 1] : null;
                          const nextChat = index < filteredChats.length - 1 ? filteredChats[index + 1] : null;
                          
                          const isPrevBot = prevChat?.role === 'assistant';
                          const isNextBot = nextChat?.role === 'assistant';
                          
                          // For bot messages, determine grouping
                          const isFirstInGroup = isBot && !isPrevBot;
                          const isLastInGroup = isBot && !isNextBot;
                          const showAvatar = !isBot || isFirstInGroup; // Show avatar only for first bot message in group or user messages
                          const showTimestamp = !isBot || isLastInGroup; // Show timestamp only for last bot message in group or user messages
                          
                          return (
                            <div 
                              key={index} 
                              className={cn(
                                isBot && !isFirstInGroup ? "mt-1" : "mt-3"
                              )}
                            >
                              <Bubble
                                message={chat}
                                themeColor={themeColor || undefined}
                                textColor={textColor || undefined}
                                bubbleBackground={bubbleBackground || undefined}
                                productsEnabled={productsEnabled}
                                showAvatar={showAvatar}
                                showTimestamp={showTimestamp}
                                isFirstInGroup={isFirstInGroup}
                                isLastInGroup={isLastInGroup}
                              />
                            </div>
                          );
                        })}
                        {onResponding && <Responding />}
                      </div>
                      <form
                        onSubmit={onChat}
                        className="flex px-4 py-3 flex-col"
                        style={{ background: theme || '#ffffff' }}
                      >
                        <div className="flex justify-between items-center gap-2">
                          <Input
                            {...register('content')}
                            placeholder="Type your message..."
                            className="focus-visible:ring-1 focus-visible:ring-gray-200 flex-1 p-2 bg-white rounded-lg shadow-sm border-gray-100"
                          />
                          <Button
                            type="submit"
                            style={{ color: themeColor || '#6366f1' }}
                            className="text-white transition-all"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </form>
                    </>
                  )}
                </div>
              </>
            )}

            {activeTab === 'helpdesk' && (
              <>
                {selectedFaq ? (
                  /* FAQ Detail View */
                  <div className={cn(
                    isExpanded ? "h-[calc(80vh-145px)]" : "h-[525px]", 
                    "max-sm:h-[calc(100vh-145px)] flex flex-col bg-white"
                  )}>
                    {/* FAQ Detail Header */}
                    <div className="sticky top-0 z-10 bg-white pt-6 px-6 pb-4 border-b border-gray-100 flex-shrink-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ background: `${themeColor || '#6366f1'}15` }}
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            style={{ color: themeColor || '#6366f1' }}
                          >
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                            <path d="M12 17h.01"/>
                          </svg>
                        </div>
                        <h1 className="text-lg font-medium" style={{ color: titleColor || '#1F2937' }}>FAQ Details</h1>
                      </div>
                    </div>

                    {/* FAQ Detail Content */}
                    <div className="flex-1 overflow-y-auto">
                      <div className="px-6 py-6">
                        {/* Question */}
                        <div className="mb-6">
                          <h2 
                            className="text-xl font-semibold mb-3 leading-tight"
                            style={{ color: titleColor || '#1F2937' }}
                          >
                            {selectedFaq.question}
                          </h2>
                        </div>

                        {/* Answer */}
                        <div className="prose prose-sm max-w-none">
                          <div 
                            className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-4"
                            dangerouslySetInnerHTML={{ __html: selectedFaq.answer }}
                          />
                          
                          {/* Detailed Content */}
                          {selectedFaq.content && (
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <h4 className="text-sm font-semibold text-gray-900 mb-3">Detailed Information:</h4>
                              <div 
                                className="prose prose-sm max-w-none text-gray-700 [&>p]:mb-2 [&>ol]:ml-4 [&>ul]:ml-4 [&>li]:mb-1 [&>strong]:font-semibold [&>em]:italic"
                                dangerouslySetInnerHTML={{ 
                                  __html: typeof window !== 'undefined' 
                                    ? selectedFaq.content 
                                    : selectedFaq.content 
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* FAQ Detail Footer */}
                    {chatBot?.feedbackEnabled !== false && (
                    <div className="px-6 py-4 text-center bg-gray-50 border-t border-gray-100 flex-shrink-0">
                        <p className="text-xs text-gray-500 mb-2">
                          {chatBot?.feedbackQuestion || 'Was this helpful?'}
                        </p>
                      <div className="flex justify-center gap-3 mb-3">
                        <button 
                            onClick={() => handleFeedback(selectedFaq.id, true)}
                            disabled={feedbackSubmitted[selectedFaq.id]}
                            className="px-4 py-2 text-xs rounded-full border transition-colors hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                          style={{ 
                              borderColor: feedbackState[selectedFaq.id] === 'yes' ? themeColor || '#6366f1' : `${themeColor || '#6366f1'}30`,
                              color: feedbackState[selectedFaq.id] === 'yes' ? 'white' : themeColor || '#6366f1',
                              backgroundColor: feedbackState[selectedFaq.id] === 'yes' ? themeColor || '#6366f1' : 'transparent'
                          }}
                        >
                            {chatBot?.feedbackYesText || '👍 Yes'}
                        </button>
                        <button 
                            onClick={() => handleFeedback(selectedFaq.id, false)}
                            disabled={feedbackSubmitted[selectedFaq.id]}
                            className="px-4 py-2 text-xs rounded-full border transition-colors hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                          style={{ 
                              borderColor: feedbackState[selectedFaq.id] === 'no' ? '#ef4444' : `${themeColor || '#6366f1'}30`,
                              color: feedbackState[selectedFaq.id] === 'no' ? 'white' : themeColor || '#6366f1',
                              backgroundColor: feedbackState[selectedFaq.id] === 'no' ? '#ef4444' : 'transparent'
                          }}
                        >
                            {chatBot?.feedbackNoText || '👎 No'}
                        </button>
                      </div>
                        {feedbackSubmitted[selectedFaq.id] && (
                          <div className="text-xs text-green-600 mb-2 flex items-center justify-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Thank you for your feedback!
                          </div>
                        )}
                      <button 
                        onClick={handleStartChat}
                        className="text-xs font-medium hover:underline transition-colors"
                        style={{ color: themeColor || '#6366f1' }}
                      >
                          {chatBot?.feedbackFollowUp || 'Still need help? Start a conversation'}
                      </button>
                    </div>
                    )}
                  </div>
                ) : (
                  /* FAQ List View */
                  <div className={cn(
                    isExpanded ? "h-[calc(80vh-145px)]" : "h-[525px]", 
                    "max-sm:h-[calc(100vh-145px)] flex flex-col bg-white"
                  )}>
                {/* Minimal header */}
                    <div className="sticky top-0 z-10 bg-white pt-5 px-5 pb-3 border-b border-gray-100 flex-shrink-0">
                  <h1 className="text-lg font-medium" style={{ color: titleColor || '#1F2937' }}>Knowledge Base</h1>
                </div>

                    {/* Scrollable FAQ list */}
                    <div className="flex-1 overflow-y-auto">
                <div className="px-5 py-3">
                        {helpdesk.length > 0 ? (
                          helpdesk.map((desk, index) => (
                    <div
                      key={desk.id}
                      className="py-3 border-b border-gray-100 last:border-0"
                    >
                                                                    <button
                                        onClick={() => handleFaqClick(desk)}
                                        className="w-full text-left p-4 rounded-lg hover:bg-gray-50 transition-colors group"
                                      >
                                        <div className="flex items-center justify-between gap-3">
                                          <div className="flex-1">
                                            <h3 
                                              className="font-medium text-base group-hover:text-gray-900 transition-colors"
                                              style={{ color: titleColor || '#1F2937' }}
                                            >
                                              {desk.question}
                                            </h3>
                    </div>
                                          <div className="flex-shrink-0">
                                            <svg 
                                              xmlns="http://www.w3.org/2000/svg" 
                                              width="16" 
                                              height="16" 
                                              viewBox="0 0 24 24" 
                                              fill="none" 
                                              stroke="currentColor" 
                                              strokeWidth="2" 
                                              strokeLinecap="round" 
                                              strokeLinejoin="round"
                                              className="text-gray-400 group-hover:text-gray-600 transition-colors"
                                            >
                                              <path d="m9 18 6-6-6-6"/>
                                            </svg>
                                          </div>
                                        </div>
                                      </button>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div 
                              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                              style={{ background: `${themeColor || '#6366f1'}15` }}
                            >
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="24" 
                                height="24" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                                style={{ color: themeColor || '#6366f1' }}
                              >
                                <circle cx="12" cy="12" r="10"/>
                                <path d="m9 12 2 2 4-4"/>
                              </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-700 mb-2">No FAQ items yet</h3>
                            <p className="text-gray-500 text-sm">
                              Knowledge base items will appear here once they're added.
                            </p>
                          </div>
                        )}
                      </div>
                </div>
                
                    {/* Fixed footer with support info */}
                    <div className="px-5 py-4 text-center bg-gray-50 border-t border-gray-100 flex-shrink-0">
                  <p className="text-xs text-gray-500 mb-1">Can't find what you're looking for?</p>
                  <button 
                    onClick={handleStartChat}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    style={{ color: themeColor || '#6366f1' }}
                  >
                    Start a conversation with our support team
                  </button>
                </div>
              </div>
                )}
              </>
            )}
            
            {activeTab === 'products' && productsEnabled && products.length > 0 && (
              <div className={cn(
                isExpanded ? "h-[calc(80vh-145px)]" : "h-[525px]", 
                "max-sm:h-[calc(100vh-145px)] overflow-y-auto bg-white"
              )}>
                {/* Products header */}
                <div className="sticky top-0 z-10 bg-white pt-5 px-5 pb-3 border-b border-gray-100">
                  <h1 className="text-lg font-medium" style={{ color: titleColor || '#1F2937' }}>Our Products</h1>
                  <p className="text-sm text-gray-500 mb-3">Browse our collection of products</p>
                  
                  {/* Search bar */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 pr-8 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                      style={{
                        borderColor: `${themeColor || '#6366f1'}20`,
                      }}
                    />
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="#4B5563" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </div>
                </div>

                {/* Product grid */}
                <div className="p-4 grid grid-cols-2 gap-4">
                  {products
                    .filter(product => product && product.active && product.name && product.price !== undefined)
                    .filter(product => 
                      !searchQuery || 
                      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                      (product.productType && product.productType.toLowerCase().includes(searchQuery.toLowerCase()))
                    )
                    .map((product) => (
                      <div
                        key={product.id}
                        className="cursor-pointer"
                        onClick={() => {
                          if (product) {
                            console.log('Selected product from grid:', product);
                            console.log('Product URL from grid:', product.productUrl);
                            setSelectedProduct(product);
                            setShowProductPreview(true);
                          }
                        }}
                      >
                        <ProductCard product={product} />
                      </div>
                    ))}
                </div>
                
                {/* Empty search results state */}
                {searchQuery && !products.filter(product => 
                  product && product.active && product.name && product.price !== undefined &&
                  (product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (product.productType && product.productType.toLowerCase().includes(searchQuery.toLowerCase())))
                ).length && (
                  <div className="flex flex-col items-center justify-center h-64">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                      style={{ background: `${themeColor || '#6366f1'}15` }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: themeColor || '#6366f1' }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </div>
                    <p className="text-gray-500 text-center">No products found matching "{searchQuery}"</p>
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="mt-2 text-sm font-medium underline"
                      style={{ color: themeColor || '#6366f1' }}
                    >
                      Clear search
                    </button>
                  </div>
                )}
                
                {/* Empty state for no products */}
                {(!products.length || !products.filter(product => 
                  product && product.active && product.name && product.price !== undefined
                ).length) && !searchQuery && (
                  <div className="flex flex-col items-center justify-center h-64">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                      style={{ background: `${themeColor || '#6366f1'}15` }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: themeColor || '#6366f1' }}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                    </div>
                    <p className="text-gray-500 text-center">No products available at the moment</p>
                  </div>
                )}
                
                {/* Footer with contact info */}
                <div className="px-5 py-4 mt-auto text-center bg-gray-50 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Have questions about our products?</p>
                  <button 
                    onClick={handleStartChat}
                    className="text-xs font-medium text-blue-600 hover:text-blue-800"
                    style={{ color: themeColor || '#6366f1' }}
                  >
                    Chat with our product specialists
                  </button>
                </div>
              </div>
            )}
              </>
            )}
          </div>

          {/* Bottom Navigation for Helpdesk Layout */}
          {!inquiryMode && !isChatActive && !selectedFaq && homeLayout === 'helpdesk' && renderNavigation()}
        </div>
      </>
    )
  }
)

BotWindow.displayName = 'BotWindow'

export default BotWindow
