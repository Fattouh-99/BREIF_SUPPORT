import { onAiChatBotAssistant, onGetCurrentChatBot } from '@/actions/bot/index'
import { postToParent, loadChatFromStorage, saveChatToStorage, clearChatStorage, isStoredChatUsable } from '@/lib/utils'
import { pusherClient } from '@/lib/pusher'
import { onRealTimeChat } from '@/actions/conversation'
import {
  ChatBotMessageProps,
  ChatBotMessageSchema,
} from '@/schemas/conversation.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import { UploadClient } from '@uploadcare/upload-client'
import { generateUUID } from '@/lib/uuid'

import { useForm } from 'react-hook-form'

const upload = new UploadClient({
  publicKey: process.env.NEXT_PUBLIC_UPLOAD_CARE_PUBLIC_KEY as string,
})

type CurrentBot = {
  name: string;
  chatBot: {
    id: string;
    icon: string | null;
    welcomeMessage: string | null;
    background: string | null;
    iconColor: string | null;
    iconStyle: string | null;
    textColor: string | null;
    themeColor: string | null;
    helpDeskColor: string | null;
    titleColor: string | null;
    homeTitle: string | null;
    homeLayout: string | null;
    helpdesk: boolean;
    chatbotEnabled?: boolean;
    inquiryMode?: boolean;
    productsEnabled?: boolean;
    customLinksEnabled?: boolean;
    popularTopicsEnabled?: boolean;
    popularTopics?: string | null;
    customLinks?: {
      id: string;
      title: string;
      description: string | null;
      url: string;
      createdAt: string | Date;
    }[];
    // Keep old fields for backward compatibility
    customLinkTitle: string | null;
    customLinkDescription: string | null;
    customLinkUrl: string | null;
    // Feedback Configuration
    feedbackEnabled?: boolean;
    feedbackQuestion?: string;
    feedbackYesText?: string;
    feedbackNoText?: string;
    feedbackFollowUp?: string;
  } | null;
  filterQuestions: {
    id: string;
    question: string;
    answered: string | null;
  }[];
  User: {
    role: string;
  } | null;
  helpdesk: {
    id: string;
    title: string;
    question: string;
    answer: string;
    content?: string | null;
    articleType: string;
    category?: string | null;
    tags: string[];
    isPublished: boolean;
    isPinned: boolean;
    viewCount: number;
    createdAt: Date;
    updatedAt: Date;
    domainId: string | null;
  }[];
  products?: {
    id: string;
    name: string;
    price: number;
    image: string;
    description?: string | null;
    productType?: string | null;
    hasDiscount: boolean;
    discountedPrice?: number | null;
    active: boolean;
  }[];
};

export interface ChatMessage {
  id?: string;
  role: 'assistant' | 'user';
  content: string;
  link?: string;
  createdAt?: string | Date;
  teamMemberId?: string;
  teamMemberName?: string;
  products?: any[];
}

export interface CurrentBotMode {
  live: boolean;
  chatroom: string;
  mode: boolean;
  supportAgent?: {
    name: string;
    email: string;
  }
}

type BotResponse = {
  message: {
    role: string;
    content: string;
  };
  conversation: any[];
}

type RealTimeData = {
  chatroom?: string;
  mode?: boolean;
  supportAgent?: {
    name: string;
    role?: string;
  }
}

type AiChatResponse = {
  response: { role: string; content: string }
  live?: boolean
  chatRoom?: string
  supportAgent?: { name: string; role?: string }
}

const syncLiveChatMessages = async (
  chatRoomId: string,
  setChats: Dispatch<SetStateAction<ChatMessage[]>>
) => {
  try {
    const response = await fetch(
      `/api/conversations/status?chatRoomId=${encodeURIComponent(chatRoomId)}&includeMessages=true`
    )
    if (!response.ok) return

    const data = await response.json()
    if (!Array.isArray(data.messages) || data.messages.length === 0) return

    setChats((prev) => {
      const merged = [...prev]

      for (const msg of data.messages) {
        const exists = merged.some(
          (existing) =>
            existing.id === msg.id ||
            (existing.content === msg.message && existing.role === msg.role)
        )

        if (!exists) {
          merged.push({
            id: msg.id,
            role: msg.role,
            content: msg.message,
            createdAt: new Date(msg.createdAt),
          })
        }
      }

      return merged.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return timeA - timeB
      })
    })
  } catch (error) {
    console.error('[CUSTOMER DEBUG] Failed to sync live chat messages:', error)
  }
}

// Helper function to parse greeting messages
const parseGreetingMessages = (welcomeMessage: string | null): string[] => {
  if (!welcomeMessage) {
    return ['Hello! How can I help you today?'];
  }
  
  try {
    // Try to parse as JSON array
    const parsed = JSON.parse(welcomeMessage);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.filter(msg => typeof msg === 'string' && msg.trim().length > 0);
    }
  } catch (e) {
    // Not JSON, treat as single message
  }
  
  // Return as single message if not valid JSON array
  return [welcomeMessage];
};

// Helper function to create welcome messages with staggered timestamps
const createWelcomeMessages = (messages: string[]): ChatMessage[] => {
  return messages.map((msg, index) => ({
    id: generateUUID(),
    role: 'assistant' as const,
    content: msg,
    createdAt: new Date(Date.now() + index * 1000), // Stagger by 1 second each
  }));
};

interface UseChatBotOptions {
  isPublic?: boolean;
}

// Function to notify the agent dashboard about real-time mode
export const notifyRealTimeMode = async (chatId: string, customerEmail: string, message: string, domainId: string) => {
  try {
    console.log('Sending real-time mode notification for chat:', chatId);
    
    // Attempt to update the agent dashboard
    const response = await fetch('/api/notify/real-time', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatRoomId: chatId,
        customerEmail,
        message,
        domainId,
        // Add a unique session identifier to prevent session mix-ups
        sessionId: localStorage.getItem('chatSession') || generateUUID(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to notify about real-time mode:', errorData);
      
      // Set up retry mechanism
      console.log('Setting up retry mechanism for notification');
      let retryCount = 0;
      const maxRetries = 3;
      const retryInterval = setInterval(async () => {
        if (retryCount < maxRetries) {
          console.log(`Retry attempt ${retryCount + 1}/${maxRetries} for real-time notification`);
          
          try {
            const retryResponse = await fetch('/api/notify/real-time', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                chatRoomId: chatId,
                customerEmail,
                message,
                domainId,
                // Include session ID in retries as well
                sessionId: localStorage.getItem('chatSession') || generateUUID(),
              }),
            });
            
            if (retryResponse.ok) {
              console.log('Retry successful!');
              clearInterval(retryInterval);
            } else {
              console.error('Retry failed:', await retryResponse.json());
            }
          } catch (retryError) {
            console.error('Error during retry:', retryError);
          }
          
          retryCount++;
        } else {
          console.log('Maximum retry attempts reached');
          clearInterval(retryInterval);
        }
      }, 3000); // Retry every 3 seconds
      
      return false;
    }

    console.log('Real-time mode notification sent successfully');
    return true;
  } catch (error) {
    console.error('Error notifying about real-time mode:', error);
    return false;
  }
};

export const useChatBot = ({ isPublic = false }: UseChatBotOptions = {}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChatBotMessageProps>({
    resolver: zodResolver(ChatBotMessageSchema),
  })
  const [currentBot, setCurrentBot] = useState<CurrentBot | null>(null)
  const messageWindowRef = useRef<HTMLDivElement | null>(null)
  const [botOpened, setBotOpened] = useState<boolean>(false)
  const onOpenChatBot = () => setBotOpened((prev) => !prev)
  const [loading, setLoading] = useState<boolean>(true)
  const [onChats, setOnChats] = useState<ChatMessage[]>([])
  const [onAiTyping, setOnAiTyping] = useState<boolean>(false)
  const [currentBotId, setCurrentBotId] = useState<string | null>(null)
  const [onRealTime, setOnRealTime] = useState<RealTimeData | undefined>()
  const [isTyping, setIsTyping] = useState<boolean>(false)
  const [typingAgent, setTypingAgent] = useState<{ name: string; role?: string } | null>(null)
  const [chatSession, setChatSession] = useState<string | null>(null)
  const lastChatRoomRef = useRef<string | null>(null)

  const restoreStoredChatSession = (storedChat: NonNullable<ReturnType<typeof loadChatFromStorage>>) => {
    setOnChats(storedChat.messages)

    const roomId =
      storedChat.chatRoom && storedChat.chatRoom !== 'pending'
        ? storedChat.chatRoom
        : null

    if (roomId) {
      lastChatRoomRef.current = roomId
      setOnRealTime({
        chatroom: roomId,
        mode: Boolean(storedChat.isRealtime),
        supportAgent: storedChat.supportAgent,
      })
      void syncLiveChatMessages(roomId, setOnChats)
    } else if (storedChat.isRealtime && storedChat.chatRoom) {
      setOnRealTime({
        chatroom: storedChat.chatRoom,
        mode: storedChat.isRealtime,
        supportAgent: storedChat.supportAgent,
      })
    }
  }

  // Ensure we have a persistent chat session ID
  useEffect(() => {
    // Get existing session ID or create a new one
    const existingSession = localStorage.getItem('chatSession');
    if (existingSession) {
      setChatSession(existingSession);
    } else {
      const newSessionId = generateUUID();
      localStorage.setItem('chatSession', newSessionId);
      setChatSession(newSessionId);
    }
  }, []);

  // Function to reset the chat state completely
  const resetChatState = () => {
    clearChatStorage(currentBotId);
    setOnChats([]);
    setOnRealTime(undefined);
    lastChatRoomRef.current = null
    if (currentBotId) {
      onGetDomainChatBot(currentBotId);
    }
  };

  const startNewConversation = () => {
    clearChatStorage(currentBotId)
    lastChatRoomRef.current = null
    hadLiveSessionRef.current = false
    setOnRealTime(undefined)

    const welcomeMessage = currentBot?.chatBot?.welcomeMessage || null
    const greetingMessages = createWelcomeMessages(parseGreetingMessages(welcomeMessage))
    setOnChats(greetingMessages)

    if (currentBotId) {
      try {
        saveChatToStorage('pending', greetingMessages, false, undefined, currentBotId)
      } catch (error) {
        console.warn('Could not save new conversation to storage:', error)
      }
    }
  }

  useEffect(() => {
    if (onRealTime?.chatroom) {
      lastChatRoomRef.current = onRealTime.chatroom
    }
  }, [onRealTime?.chatroom])

  // Save chat to storage whenever it changes
  useEffect(() => {
    try {
      // Always attempt to save chats if we have any messages
      if (onChats.length > 0) {
        saveChatToStorage(
          onRealTime?.chatroom || lastChatRoomRef.current || 'pending',
          onChats,
          onRealTime?.mode || false,
          onRealTime?.supportAgent,
          currentBotId
        );
      }
    } catch (error) {
      console.error('Error saving chat to storage:', error);
      // Attempt to retry save on next tick
      setTimeout(() => {
        try {
          saveChatToStorage(
            onRealTime?.chatroom || lastChatRoomRef.current || 'pending',
            onChats,
            onRealTime?.mode || false,
            onRealTime?.supportAgent,
            currentBotId
          );
        } catch (retryError) {
          console.error('Failed to save chat even after retry:', retryError);
        }
      }, 1000);
    }
  }, [onChats, onRealTime, currentBotId]);

  // Keep chat history when live mode ends (do not wipe local storage)
  const hadLiveSessionRef = useRef(false)
  useEffect(() => {
    if (onRealTime?.mode && onRealTime.chatroom) {
      hadLiveSessionRef.current = true
      return
    }

    if (hadLiveSessionRef.current && !onRealTime?.mode) {
      const roomId = lastChatRoomRef.current
      if (onChats.length > 0 && roomId && currentBotId) {
        saveChatToStorage(roomId, onChats, false, onRealTime?.supportAgent, currentBotId)
      }
      hadLiveSessionRef.current = false
    }
  }, [onRealTime?.mode, onRealTime?.chatroom, onChats, currentBotId, onRealTime?.supportAgent]);

  const onScrollToBottom = () => {
    messageWindowRef.current?.scroll({
      top: messageWindowRef.current.scrollHeight,
      left: 0,
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    onScrollToBottom()
  }, [onChats, messageWindowRef])

  // Keep track of minimized state for proper sizing
  const [isMinimized, setIsMinimized] = useState(false);

  // Track previous dimensions to prevent unnecessary updates
  const prevDimensionsRef = useRef<{width?: number | string, height?: number | string, open?: boolean}>({});
  // Track if message listener has been set up to prevent duplicate event listeners
  const messageListenerSetupRef = useRef(false);

  // Function to debounce - moved outside of effects to prevent recreation
  const debounce = useRef((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }).current;

  // Size update effect
  useEffect(() => {
    const updateSize = () => {
      let width: number;
      let height: number;
      let open: boolean;

      if (!botOpened) {
        // Collapsed bubble button
        width = 80;
        height = 80;
        open = false;
      } else if (isMinimized) {
        width = 280;
        height = 60;
        open = true;
      } else {
        width = 450;
        height = 670;
        open = true;
      }

      const prevWidth = prevDimensionsRef.current.width;
      const prevHeight = prevDimensionsRef.current.height;
      const prevOpen = prevDimensionsRef.current.open;

      if (width === prevWidth && height === prevHeight && open === prevOpen) {
        return;
      }

      prevDimensionsRef.current = { width, height, open };

      try {
        postToParent(
          JSON.stringify({
            width,
            height,
            open,
          })
        );
      } catch (error) {
        console.error('Error sending dimensions to parent:', error);
      }
    };

    const debouncedUpdateSize = debounce(updateSize, 150);

    const initialUpdateTimeout = setTimeout(() => {
      debouncedUpdateSize();
    }, 100);

    window.addEventListener('resize', debouncedUpdateSize);

    return () => {
      window.removeEventListener('resize', debouncedUpdateSize);
      clearTimeout(initialUpdateTimeout);
    };
  }, [botOpened, isMinimized, currentBotId, currentBot, debounce]);

  // Function to toggle minimized state
  const handleMinimize = () => {
    setIsMinimized(prev => !prev);
  };

  const onGetDomainChatBot = async (id: string) => {
    setCurrentBotId(id);
    const chatbot = await onGetCurrentChatBot(id);
    
    if (!chatbot) {
      // Set error state to indicate the bot is no longer available
      setOnChats([{
        role: 'assistant',
        content: 'This chatbot is no longer available. The domain may have been deleted or deactivated.',
      }]);
      setLoading(false);
      // Important: Return early to prevent further processing
      return;
    }
    
    if (chatbot) {
      console.log('Chatbot data received:', chatbot);
      // Check if we have stored messages before setting welcome message
      const storedChat = loadChatFromStorage(id);
      const hasValidStoredChat = storedChat && isStoredChatUsable(storedChat.messages);
      let welcomeMessages: ChatMessage[] | null = null;
      
      if (hasValidStoredChat) {
        console.log('Using stored chat messages');
        restoreStoredChatSession(storedChat);
      } else {
        console.log('Creating fresh welcome messages');
        const welcomeMessage = ('chatBot' in chatbot && chatbot.chatBot?.welcomeMessage) || null;
        const greetingMessages = parseGreetingMessages(welcomeMessage);
        welcomeMessages = createWelcomeMessages(greetingMessages);
        
        setOnChats(welcomeMessages);
        clearChatStorage(id);
      }
      
      setCurrentBot(chatbot as unknown as CurrentBot);
      setLoading(false);

      if (welcomeMessages) {
        try {
          saveChatToStorage('pending', welcomeMessages, false, undefined, id);
        } catch (saveError) {
          console.warn('Could not save chat to storage:', saveError);
        }
      }
    }
  };

  // Setup message listener for bot ID - only once
  useEffect(() => {
        
    const handleBotIdMessage = (e: MessageEvent) => {
      // Handle both old format (string) and new format (object with testing flag)
      let botid: string;
      let isTestMode = false;

      if (typeof e.data === 'string') {
        if (e.data === 'GET_BOT_ID' || e.data === 'REFRESH_CHATBOT') {
          return;
        }

        try {
          const parsed = JSON.parse(e.data);
          if (parsed && (parsed.width || parsed.type)) {
            return;
          }
        } catch {
          // Not JSON - continue as plain bot ID string
        }

        if (e.data.length > 10) {
          botid = e.data;
        } else {
          return;
        }
      } else if (typeof e.data === 'object' && e.data?.type === 'INIT_CHATBOT') {
        botid = e.data.domainId;
        isTestMode = e.data.testing || false;
      } else {
        return;
      }
      
      // Handle test mode
      if (isTestMode) {
        console.log('Test mode detected, setting up test chatbot');
        const testBot: CurrentBot = {
          name: 'test-domain.com',
          chatBot: {
            id: 'test-bot-id',
            icon: null,
            welcomeMessage: 'Hello! This is a test chatbot in inquiry mode. How can I help you today?',
            background: '#ffffff',
            iconColor: '#6366f1',
            iconStyle: 'Default',
            textColor: '#374151',
            themeColor: '#6366f1',
            helpDeskColor: '#6366f1',
            titleColor: '#1F2937',
            homeTitle: 'Welcome to Support',
            homeLayout: null,
            helpdesk: true,
            chatbotEnabled: true, // Enable inquiry mode for testing
            inquiryMode: true,
            customLinksEnabled: false,
            popularTopicsEnabled: true,
            popularTopics: null,
            customLinks: [],
            customLinkTitle: null,
            customLinkDescription: null,
            customLinkUrl: null,
          },
          filterQuestions: [],
          User: { role: 'user' },
          helpdesk: [
            {
              id: 'test-help-1',
              title: 'Getting Started',
              question: 'How do I get started?',
              answer: 'Welcome to our test chatbot! You can start by asking questions or filling out the inquiry form.',
              content: null,
              articleType: 'faq',
              category: null,
              tags: [],
              isPublished: true,
              isPinned: false,
              viewCount: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
              domainId: 'test-domain-id'
            },
            {
              id: 'test-help-2',
              title: 'Chatbot Features',
              question: 'What can this chatbot do?',
              answer: 'This test chatbot can handle inquiries and demonstrate the inquiry form functionality.',
              content: null,
              articleType: 'faq',
              category: null,
              tags: [],
              isPublished: true,
              isPinned: false,
              viewCount: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
              domainId: 'test-domain-id'
            }
          ],
          products: []
        };
        
        setCurrentBot(testBot);
        setCurrentBotId('test-domain-id');
        
        // Set initial welcome message
        const greetingMessages = parseGreetingMessages(testBot.chatBot?.welcomeMessage || null);
        const welcomeMessages = createWelcomeMessages(greetingMessages);
        setOnChats(welcomeMessages);
        setLoading(false);
        
        // Remove this listener after processing
        window.removeEventListener('message', handleBotIdMessage);
        return;
      }
      
      console.log('Received bot ID from parent:', botid);
      
      // Verify UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(botid)) {
        console.error('Invalid UUID format received:', botid);
        setLoading(false);
        return;
      }
      
      setCurrentBotId(botid);
      // Remove this listener after processing
      window.removeEventListener('message', handleBotIdMessage);
    };

    // Add the listener
    window.addEventListener('message', handleBotIdMessage);

    // Send request for bot ID only if we don't already have one
    if (!currentBotId && typeof window !== 'undefined') {
      postToParent('GET_BOT_ID');
    }

    // Cleanup function
    return () => {
      window.removeEventListener('message', handleBotIdMessage);
    };
  }, []); // Empty dependency array to run only once

  // Main effect to get chatbot data
  useEffect(() => {
    const getChatBot = async () => {
      setLoading(true);
      if (!currentBotId) {
        setLoading(false);
        return;
      }

      try {
        const chatbot = await onGetCurrentChatBot(currentBotId);
        console.log('Chatbot data received:', chatbot);
        
        if (chatbot) {
          // Check if we have stored messages before setting welcome message
          const storedChat = loadChatFromStorage(currentBotId);
          const hasValidStoredChat = storedChat && isStoredChatUsable(storedChat.messages);
          let welcomeMessages: ChatMessage[] | null = null;
          
          if (hasValidStoredChat) {
            console.log('Using stored chat messages');
            restoreStoredChatSession(storedChat);
          } else {
            console.log('Creating fresh welcome messages');
            const welcomeMessage = (chatbot && 'chatBot' in chatbot && chatbot.chatBot?.welcomeMessage) || null;
            const greetingMessages = parseGreetingMessages(welcomeMessage);
            welcomeMessages = createWelcomeMessages(greetingMessages);
            
            setOnChats(welcomeMessages);
            clearChatStorage(currentBotId);
          }

          setCurrentBot(chatbot as unknown as CurrentBot);
          setLoading(false);

          if (welcomeMessages) {
            try {
              saveChatToStorage('pending', welcomeMessages, false, undefined, currentBotId);
            } catch (saveError) {
              console.warn('Could not save chat to storage:', saveError);
            }
          }
        }
      } catch (error) {
        console.error('Error getting chatbot data:', error);
        clearChatStorage(currentBotId);
        setLoading(false);
      }
    };

    if (currentBotId) {
      getChatBot();
    }
  }, [currentBotId]);

  // Effect to handle real-time mode changes
  useEffect(() => {
    if (!onRealTime?.chatroom) {
      // Clear realtime state when chat room is closed/undefined
      setOnRealTime(undefined);
      return;
    }

    const channelName = `${onRealTime.chatroom}-mode`;
    console.log(`[CUSTOMER DEBUG] Setting up mode-change listener on channel: ${channelName}`);
    
    // Check if Pusher is properly initialized
    if (!pusherClient || !pusherClient.connection) {
      console.error('[CUSTOMER DEBUG] Pusher client not properly initialized!');
      return;
    }
    
    console.log(`[CUSTOMER DEBUG] Current Pusher connection state: ${pusherClient.connection.state}`);
    
    // Force reconnect if disconnected
    if (pusherClient.connection.state === 'disconnected') {
      console.log('[CUSTOMER DEBUG] Attempting to reconnect Pusher client');
      pusherClient.connect();
    }

    const handleModeChange = (data: { live: boolean, supportAgent?: any }) => {
      console.log(`[CUSTOMER DEBUG] Mode change event received:`, data);
      
      if (!data.live) {
        // When live mode is disabled, clear realtime state
        console.log('[CUSTOMER DEBUG] Live mode disabled, clearing realtime state');
        setOnRealTime(undefined);
      } else {
        console.log('[CUSTOMER DEBUG] Live mode enabled, updating realtime state with:', data);
        // Force the update by creating a new object, don't just update a property
        setOnRealTime({
          chatroom: onRealTime.chatroom,
          mode: true,
          supportAgent: data.supportAgent || { name: 'Support Agent', role: 'support' }
        });

        void syncLiveChatMessages(onRealTime.chatroom, setOnChats)
        
        // Also add a system message if not already added
        const systemMessage: ChatMessage = {
          role: 'assistant',
          content: 'Live support mode has been enabled.',
          id: `system-${Date.now()}`
        };
        
        setOnChats(prev => {
          const hasSystemMessage = prev.some(msg => 
            msg.content === 'Live support mode has been enabled.' || 
            msg.content.includes('LIVE_SUPPORT_INITIATED')
          );
          
          if (!hasSystemMessage) {
            console.log('[CUSTOMER DEBUG] Adding system message about mode enablement');
            return [...prev, systemMessage];
          }
          
          return prev;
        });
      }
    };

    // Create channel with better error handling
    let modeChannel: any;
    try {
      if (pusherClient) {
        modeChannel = pusherClient.subscribe(channelName);
        
        // Debug listeners
        modeChannel.bind('subscription_succeeded', () => {
          console.log(`[CUSTOMER DEBUG] Successfully subscribed to mode channel: ${channelName}`);
        });
        
        modeChannel.bind('subscription_error', (error: any) => {
          console.error(`[CUSTOMER DEBUG] Error subscribing to mode channel: ${channelName}`, error);
        });
        
        // Main event binding
        modeChannel.bind('mode-change', handleModeChange);
      } else {
        console.error('[CUSTOMER DEBUG] Pusher client not available for subscription');
      }
    } catch (error) {
      console.error('[CUSTOMER DEBUG] Error setting up Pusher channel:', error);
    }
    
    // Also manually check current state via API
    const checkCurrentState = async () => {
      try {
        const response = await fetch(`/api/conversations/status?chatRoomId=${onRealTime.chatroom}`);
        if (response.ok) {
          const data = await response.json();
          console.log('[CUSTOMER DEBUG] Current chat room state from API:', data);
          
          // If the API says the room is live but our local state doesn't reflect that,
          // manually trigger the mode change handler
          if (data.live && !onRealTime.mode) {
            handleModeChange({ 
              live: true, 
              supportAgent: data.supportAgent || { name: 'Support Agent', role: 'support' } 
            });
          }
        }
      } catch (error) {
        console.error('[CUSTOMER DEBUG] Error checking chat room state:', error);
      }
    };
    
    // Run the check after a short delay to avoid race conditions
    const stateCheckTimeout = setTimeout(checkCurrentState, 1000);

    return () => {
      console.log(`[CUSTOMER DEBUG] Cleaning up mode-change listener for channel: ${channelName}`);
      clearTimeout(stateCheckTimeout);
      
      if (modeChannel) {
        modeChannel.unbind('mode-change', handleModeChange);
        modeChannel.unbind('subscription_succeeded');
        modeChannel.unbind('subscription_error');
      }
      
      safeUnsubscribe(channelName);
    };
  }, [onRealTime?.chatroom]);

  // Sync server messages when live mode becomes active
  useEffect(() => {
    if (!onRealTime?.chatroom || !onRealTime.mode) return
    void syncLiveChatMessages(onRealTime.chatroom, setOnChats)
  }, [onRealTime?.chatroom, onRealTime?.mode]);

  // Effect to handle real-time messages
  useEffect(() => {
    if (!onRealTime?.chatroom || !pusherClient) return;

    // Ensure we have a valid chatroom ID format
    const chatRoomId = onRealTime.chatroom.trim();
    console.log(`[CUSTOMER DEBUG] Setting up message listeners for chatRoomId: '${chatRoomId}'`);

    const channel = pusherClient.subscribe(chatRoomId);

    // Debug log when a subscription is successful
    channel.bind('subscription_succeeded', () => {
      console.log(`[CUSTOMER DEBUG] Successfully subscribed to channel: '${chatRoomId}'`);
    });

    // Debug log when a subscription fails
    channel.bind('subscription_error', (error: any) => {
      console.error(`[CUSTOMER DEBUG] Error subscribing to channel '${chatRoomId}':`, error);
    });

    const handleMessage = (data: {
      chat: {
        id: string;
        role: 'assistant' | 'user';
        message: string;
        createdAt: string | Date;
        seen: boolean;
      };
    }) => {
      // Check if message already exists to prevent duplicates
      setOnChats((prev) => {
        // Ensure data.chat exists before accessing its properties
        if (!data || !data.chat) {
          console.warn(`[CUSTOMER DEBUG] Received malformed message data:`, data);
          return prev;
        }
        
        console.log(`[CUSTOMER DEBUG] Received message: ${data.chat.role}/${data.chat.message.substring(0, 20)}...`);

        // Convert date to consistent format for comparison
        const incomingCreatedAt = typeof data.chat.createdAt === 'string' 
          ? new Date(data.chat.createdAt) 
          : data.chat.createdAt;
        
        // First convert any existing messages that might not have IDs
        const processedPrev = prev.map(msg => ({
          ...msg,
          id: msg.id || `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        }));
        
        // More thorough duplicate check
        const messageExists = processedPrev.some(
          (msg) => 
            (msg.id === data.chat.id) || 
            (msg.content === data.chat.message && msg.role === data.chat.role)
        );
        
        if (messageExists) return prev;
        
        const newMessage = {
          id: data.chat.id,
          role: data.chat.role,
          content: data.chat.message,
          createdAt: incomingCreatedAt
        };

        // Sort by timestamp if available
        const newChats = [...processedPrev, newMessage];
        return newChats.sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeA - timeB;
        });
      });
    };

    // Listen for direct room messages
    channel.bind('realtime-mode', handleMessage);
    channel.bind('chat-message', handleMessage);
    
    return () => {
      channel.unbind('realtime-mode', handleMessage);
      channel.unbind('chat-message', handleMessage);
      if (onRealTime?.chatroom) safeUnsubscribe(onRealTime.chatroom);
    };
  }, [onRealTime?.chatroom]);

  // Listen for typing status
  useEffect(() => {
    if (!onRealTime?.chatroom || !pusherClient) return;

    const handleTypingStatus = (data: { isTyping: boolean; supportAgent?: { name: string; role?: string } }) => {
      if (data.supportAgent?.role === 'support') {
        setIsTyping(data.isTyping);
        setTypingAgent(data.supportAgent);
      }
    };

    // Subscribe to typing status events
    const channel = pusherClient.subscribe(onRealTime.chatroom);
    channel.bind('typing-status', handleTypingStatus);

    return () => {
      channel.unbind('typing-status', handleTypingStatus);
      if (onRealTime?.chatroom) safeUnsubscribe(onRealTime.chatroom);
    };
  }, [onRealTime?.chatroom]);

  const onStartChatting = handleSubmit(async (values) => {
    if (!values.content?.trim() || !currentBotId) return;
    
    reset();
    // Create message with proper UUID
    const messageId = generateUUID();
    console.log('Generated user message ID:', messageId);
    
    // Capture form data if available
    const form = document.querySelector('form');
    const formData = form ? new FormData(form) : new FormData();
    const name = formData.get('name') as string | null;
    const email = formData.get('email') as string | null;
    
    // Construct the message object
    const userMessage = {
      id: messageId,
      role: 'user' as const,
      content: values.content,
      createdAt: new Date()
    };

    const emailMatch = values.content.match(
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
    )
    if (emailMatch?.[0]) {
      localStorage.setItem('customer_email', emailMatch[0])
    }

    // Add user message locally first
    setOnChats((prev) => [...prev, userMessage]);
    const chatWithUserMessage = [...onChats, userMessage]

    try {
      if (!onRealTime?.mode) {
        setOnAiTyping(true);
        const response = await onAiChatBotAssistant(
          currentBotId,
          chatWithUserMessage,
          'user',
          values.content
        );

        if (response && typeof response === 'object' && 'response' in response) {
          const aiResponse = response as AiChatResponse
          const messageData = aiResponse.response
          const botMessage = {
            id: generateUUID(),
            role: messageData.role as 'user' | 'assistant',
            content: messageData.content,
            link: '',
            createdAt: new Date()
          };

          const updatedMessages = [...chatWithUserMessage, botMessage]
          setOnChats(updatedMessages);

          if (aiResponse.live && aiResponse.chatRoom) {
            setOnRealTime({
              chatroom: aiResponse.chatRoom,
              mode: true,
              supportAgent: aiResponse.supportAgent || {
                name: 'Support Agent',
                role: 'support',
              },
            })

            try {
              saveChatToStorage(
                aiResponse.chatRoom,
                updatedMessages,
                true,
                aiResponse.supportAgent,
                currentBotId
              )
            } catch (saveError) {
              console.warn('Could not save live chat to storage:', saveError)
            }

            lastChatRoomRef.current = aiResponse.chatRoom
            void syncLiveChatMessages(aiResponse.chatRoom, setOnChats)
          } else {
            try {
              saveChatToStorage('pending', updatedMessages, false, undefined, currentBotId);
            } catch (saveError) {
              console.warn('Could not save chat to storage:', saveError);
            }
          }
        }
      } else {
        // In real-time mode, use the server-side API endpoint instead of direct Pusher calls
        // This prevents CORS issues completely
        
        // Generate proper UUID for message
        const messageId = generateUUID();
        console.log(`Generated valid UUID for customer message:`, messageId);
        
        const response = await fetch('/api/conversations/customer-message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chatRoomId: onRealTime.chatroom,
            message: values.content,
            messageId: messageId,
            // Include email if available in local storage or state
            email: email || localStorage.getItem('customer_email') || undefined,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setOnChats((prev) => [
        ...prev,
        {
          id: generateUUID(),
          role: 'assistant',
          content: 'Error sending message. Please try again.',
          createdAt: new Date()
        }
      ]);
    } finally {
      setOnAiTyping(false);
    }
  });

  return {
    messageWindowRef,
    register,
    errors,
    onStartChatting,
    onChats,
    loading,
    onAiTyping,
    currentBot,
    currentBotId,
    botOpened,
    onOpenChatBot,
    onRealTime,
    setOnChats,
    isTyping,
    typingAgent,
    resetChatState,
    startNewConversation,
    handleMinimize
  }
}

export const useRealTime = (
  chatRoom: string,
  setChats: React.Dispatch<React.SetStateAction<ChatMessage[]>>
) => {
  const [isRealTimeMode, setIsRealTimeMode] = useState(false);
  
  console.log(`[REALTIME DEBUG] useRealTime hook initialized with chatRoom: ${chatRoom}`);
  console.log(`[REALTIME DEBUG] Initial isRealTimeMode: ${isRealTimeMode}`);

  // Listen for real-time mode changes
  useEffect(() => {
    if (!chatRoom || !pusherClient) {
      console.log(`[REALTIME DEBUG] No chatRoom provided or no pusherClient, skipping mode listener setup`);
      return;
    }

    console.log(`[REALTIME DEBUG] Setting up mode-change listener on channel: ${chatRoom}-mode`);
    
    const handleModeChange = (data: { live: boolean }) => {
      console.log(`[REALTIME DEBUG] Mode change event received:`, data);
      setIsRealTimeMode(data.live);
      console.log(`[REALTIME DEBUG] Updated isRealTimeMode to: ${data.live}`);
    };

    const modeChannel = pusherClient.subscribe(`${chatRoom}-mode`);
    modeChannel.bind('mode-change', handleModeChange);
    
    console.log(`[REALTIME DEBUG] Mode listener setup completed`);

    return () => {
      console.log(`[REALTIME DEBUG] Cleaning up mode listener for channel: ${chatRoom}-mode`);
      modeChannel.unbind('mode-change', handleModeChange);
      safeUnsubscribe(`${chatRoom}-mode`);
    };
  }, [chatRoom]);

  // Listen for messages
  useEffect(() => {
    if (!chatRoom || !pusherClient) return;

    console.log(`[CUSTOMER DEBUG] Setting up Pusher listeners for chatRoom: ${chatRoom}`);

    const handleMessage = (data: {
      chat: {
        id: string;
        role: 'assistant' | 'user';
        message: string;
        createdAt: Date;
        seen: boolean;
      };
    }) => {      
      console.log(`[CUSTOMER DEBUG] Received message data:`, data);
      
      // Ensure data.chat exists before proceeding
      if (!data || !data.chat) {
        console.warn('Received malformed message data in useRealTime:', data);
        return;
      }
      
      // Always log message content for debugging
      console.log(`[CUSTOMER DEBUG] Message content: "${data.chat.message}" (length: ${data.chat.message?.length})`);
      
      // In real-time mode, show all messages
      // When not in real-time mode, only show assistant messages
      if (isRealTimeMode || data.chat.role === 'assistant') {
        console.log(`[CUSTOMER DEBUG] Adding message to chat: ${data.chat.role}:${data.chat.message.substring(0, 20)}${data.chat.message.length > 20 ? '...' : ''}`);
        setChats((prev) => {
          console.log('[CUSTOMER DEBUG] Previous chats count:', prev.length);
          
          // Check for duplicates by content
          const isDuplicate = prev.some(msg => 
            msg.content === data.chat.message && 
            msg.role === data.chat.role
          );
          
          if (isDuplicate) {
            console.log('[CUSTOMER DEBUG] Duplicate message detected - skipping');
            return prev;
          }
          
          const newChats = [
            ...prev,
            {
              role: data.chat.role,
              content: data.chat.message,
              id: data.chat.id
            },
          ];
          console.log('[CUSTOMER DEBUG] New chats count:', newChats.length);
          return newChats;
        });
      } else {
        console.log(`[CUSTOMER DEBUG] Ignoring message due to mode/role: isRealTimeMode=${isRealTimeMode}, role=${data.chat.role}`);
      }
    };

    console.log(`[CUSTOMER DEBUG] Subscribing to channel: ${chatRoom}`);
    const channel = pusherClient.subscribe(chatRoom);
    
    channel.bind('realtime-mode', (data: any) => {
      console.log(`[CUSTOMER DEBUG] 'realtime-mode' event received:`, data);
      handleMessage(data);
    });
    
    channel.bind('chat-message', (data: any) => {
      console.log(`[CUSTOMER DEBUG] 'chat-message' event received:`, data);
      handleMessage(data);
    });

    // Debug Pusher connection state
    console.log(`[CUSTOMER DEBUG] Pusher connection state:`, pusherClient.connection.state);
    
    pusherClient.connection.bind('state_change', (states: any) => {
      console.log(`[CUSTOMER DEBUG] Pusher connection state changed: ${states.previous} -> ${states.current}`);
    });

    return () => {
      console.log(`[CUSTOMER DEBUG] Cleaning up Pusher listeners for chatRoom: ${chatRoom}`);
      channel.unbind('realtime-mode', handleMessage);
      channel.unbind('chat-message', handleMessage);
      safeUnsubscribe(chatRoom);
    };
  }, [chatRoom, setChats, isRealTimeMode]);
};

// Add a function to safely subscribe to pusher channels
const safeSubscribe = (channelName: string) => {
  if (!pusherClient) {
    console.warn("Pusher client is not initialized");
    return null;
  }
  return pusherClient.subscribe(channelName);
};

// Add a function to safely unsubscribe from pusher channels
const safeUnsubscribe = (channelName: string) => {
  if (!pusherClient) {
    console.warn("Pusher client is not initialized");
    return;
  }
  pusherClient.unsubscribe(channelName);
};
