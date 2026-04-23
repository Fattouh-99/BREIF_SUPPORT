'use client';

import { useChatWindow } from "@/hooks/conversation/use-conversation"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { Role } from "@prisma/client"
import ChatSidebar, { ChatMetadata } from "./chat-sidebar"
import { 
  Bold, 
  Italic, 
  Link as LinkIcon, 
  List, 
  ListOrdered,
  PaperclipIcon,
  Sparkles,
  Tag as TagIcon,
  FileText,
  CircleUser
} from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from 'framer-motion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'

type ChatMessage = {
  id: string
  message: string
  role: Role | null
  createdAt: Date
  seen: boolean
  teamMemberName?: string
}

type ChatAgentTypingProps = {
  typingAgent: {
    name: string
    role?: string
  }
}

// Simple component to show typing indicator
const ChatAgentTyping = ({ typingAgent }: ChatAgentTypingProps) => {
  return (
    <div className="flex items-center text-gray-500 space-x-2">
      <span className="font-medium">{typingAgent.name}</span>
      <span>is typing...</span>
    </div>
  )
}

// Basic message component
const ChatMessage = ({ 
  content, 
  timestamp, 
  isUser,
  teamMember
}: { 
  content: string
  timestamp: Date
  isUser: boolean
  teamMember?: string
}) => {
  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      <div className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl px-4 py-2 rounded-lg 
        ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
        {teamMember && <div className="text-xs font-medium mb-1">{teamMember}</div>}
        <div className="text-sm">{content}</div>
      </div>
      <span className="text-xs text-gray-500 mt-1">
        {timestamp.toLocaleTimeString()}
      </span>
    </div>
  )
}

// Simplified messenger component for this example
const Messenger = ({ 
  onHandleSentMessage, 
  handleInputChange, 
  realtime, 
  isPaused 
}: { 
  onHandleSentMessage: (data: { message: string }) => Promise<void>
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  realtime: boolean
  isPaused: boolean
}) => {
  const [inputValue, setInputValue] = useState("")
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return
    
    onHandleSentMessage({ message: inputValue.trim() })
    setInputValue("")
  }
  
  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value)
          handleInputChange(e)
        }}
        disabled={!realtime || isPaused}
        placeholder={isPaused ? "Chat is paused..." : "Type your message..."}
        className="flex-1 px-3 py-2 border rounded-md"
      />
      <Button type="submit" disabled={!realtime || isPaused || !inputValue.trim()}>
        Send
      </Button>
    </form>
  )
}

type ChatWindowProps = {
  className?: string
}

// Enhanced chat window component
const ChatWindow = ({ className }: ChatWindowProps) => {
  const {
    messageWindowRef,
    onHandleSentMessage,
    handleInputChange,
    chats,
    loading,
    chatRoom,
    realtime,
    isTyping,
    typingAgent,
    chatMetadata,
    onScrollToBottom
  } = useChatWindow()
  
  // Add more state for enhanced features
  const [message, setMessage] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentMetadata, setCurrentMetadata] = useState<ChatMetadata | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [currentTab, setCurrentTab] = useState<'conversation' | 'notes'>('conversation')
  const [notes, setNotes] = useState<{id: string; text: string; author: string; createdAt: Date}[]>([])
  const [conversationTags, setConversationTags] = useState<string[]>([])
  const [agentStatus, setAgentStatus] = useState<'online' | 'away' | 'busy'>('online')
  const [aiSuggestions, setAiSuggestions] = useState<{id: string; text: string}[]>([])

  // Add an isMounted ref to prevent state updates after unmount
  const isMountedRef = useRef(true);
  
  // Example tags for support conversations
  const availableTags = [
    'Billing', 'Technical', 'Feature Request', 'Bug', 'Question',
    'Urgent', 'Priority', 'Follow-up', 'Resolved'
  ]

  // Debug logging for chatMetadata
  useEffect(() => {
    if (chatMetadata) {
      console.log('[ChatWindow] Chat metadata updated:', {
        messageCount: chatMetadata.insights?.messageCount,
        duration: chatMetadata.insights?.conversationDuration,
        sentiment: chatMetadata.insights?.customerSentiment,
        tags: chatMetadata.insights?.currentTags?.length
      });
      setCurrentMetadata(chatMetadata);
      
      // If there are tags in metadata, use them
      if (chatMetadata.insights?.currentTags && chatMetadata.insights.currentTags.length > 0) {
        setConversationTags(chatMetadata.insights.currentTags);
      }
      
      // Generate mock AI suggestions based on metadata content
      generateAiSuggestions(chatMetadata);
    }
  }, [chatMetadata]);
  
  // Generate AI suggestions based on conversation content
  const generateAiSuggestions = (metadata: ChatMetadata) => {
    // In a real app, this would call an AI service
    // For this demo, we'll generate mock suggestions based on metadata
    
    const suggestions = [
      {
        id: 'ai1', 
        text: 'I understand you\'re having trouble with the login process. Have you tried resetting your password using the "Forgot Password" link?'
      },
      {
        id: 'ai2',
        text: 'Based on your account history, I can see your subscription is set to renew on the 15th. Would you like me to help you update your billing information?'
      }
    ];
    
    // Add a suggestion based on any tags present
    if (conversationTags.includes('Technical')) {
      suggestions.push({
        id: 'ai-tech',
        text: 'I recommend checking your browser extensions, as they might be interfering with our application. Could you try opening the site in incognito mode?'
      });
    }
    
    if (conversationTags.includes('Billing')) {
      suggestions.push({
        id: 'ai-billing',
        text: 'I can see there was a recent charge on your account. Let me check with our billing department to confirm the details for you.'
      });
    }
    
    setAiSuggestions(suggestions);
  };

  // Force metadata refresh when new messages arrive
  useEffect(() => {
    if (chats && chats.length > 0 && currentMetadata) {
      // Create updated metadata based on current chat messages
      const updatedMetadata: ChatMetadata = {
        ...currentMetadata,
        keyTopics: currentMetadata.keyTopics || [],
        insights: {
          overview: currentMetadata.insights?.overview || 'Ongoing conversation',
          customerSentiment: currentMetadata.insights?.customerSentiment || 'Neutral',
          avgResponseTime: currentMetadata.insights?.avgResponseTime || 'N/A',
          conversationDuration: currentMetadata.insights?.conversationDuration || 'N/A',
          messageCount: chats.length,
          currentTags: conversationTags // Use our local state for tags
        },
        conversationSummary: currentMetadata.conversationSummary || {
          keyPoints: [],
          userNeeds: [],
          actionItems: [],
          nextSteps: []
        }
      };
      
      // Only update if necessary to prevent rerenders
      if (JSON.stringify(currentMetadata) !== JSON.stringify(updatedMetadata)) {
        setCurrentMetadata(updatedMetadata);
      }
    }
  }, [chats, currentMetadata, conversationTags]);

  // Set isMounted to false on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Handle sending a message with the enhanced interface
  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    setIsSending(true);
    try {
      // Call the existing message sending function
      await onHandleSentMessage({ message: message.trim() });
      
      // Clear the message input after sending
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };
  
  // Add a tag to the conversation
  const toggleTag = (tag: string) => {
    setConversationTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };
  
  // Handle adding an internal note
  const handleAddNote = (text: string) => {
    const newNote = {
      id: `note_${Date.now()}`,
      text,
      author: 'Support Agent',
      createdAt: new Date()
    };
    
    setNotes(prev => [newNote, ...prev]);
    
    // In a real app, you would save this to your backend
    console.log('Adding internal note:', newNote);
  };
  
  // Update agent status and notify others in a real app
  const updateAgentStatus = (status: 'online' | 'away' | 'busy') => {
    setAgentStatus(status);
    // In a real app, you would notify your backend about status change
    console.log('Agent status changed to:', status);
  };
  
  // Display a badge for the current agent status
  const renderStatusBadge = () => {
    const statusColors = {
      online: 'bg-green-500',
      away: 'bg-yellow-500',
      busy: 'bg-red-500'
    };
    
    return (
      <Badge className={statusColors[agentStatus]}>
        {agentStatus.charAt(0).toUpperCase() + agentStatus.slice(1)}
      </Badge>
    );
  };
  
  // Render the enhanced chat UI
  return (
    <div className="relative flex-1 flex overflow-hidden h-full">
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Enhanced chat header with agent status and tags */}
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Chat Support</h2>
              <div className="flex items-center space-x-2">
                {renderStatusBadge()}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
                      <CircleUser className="h-4 w-4 mr-1" />
                      Set Status
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => updateAgentStatus('online')}>
                      <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                      Online
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateAgentStatus('away')}>
                      <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>
                      Away
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateAgentStatus('busy')}>
                      <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                      Busy
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* Tags section */}
            <div className="mt-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <TagIcon className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs">Tags:</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {availableTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={conversationTags.includes(tag) ? "default" : "outline"}
                    className={`cursor-pointer ${
                      conversationTags.includes(tag) ? "" : "bg-transparent hover:bg-muted/20"
                    }`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-4"
          >
            <Pencil className="h-4 w-4 mr-2" />
            {sidebarOpen ? "Hide" : "Show"} Details
          </Button>
        </div>

        {/* Message window with tabs for conversation and notes */}
        <Tabs 
          value={currentTab} 
          onValueChange={(value) => setCurrentTab(value as 'conversation' | 'notes')}
          className="flex-grow flex flex-col overflow-hidden"
        >
          <TabsList className="mx-3 mt-3 w-fit">
            <TabsTrigger value="conversation">Conversation</TabsTrigger>
            <TabsTrigger value="notes">Internal Notes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="conversation" className="flex-1 overflow-y-auto p-4 pt-0" ref={messageWindowRef}>
            <div className="space-y-4">
              {chats.map((chat, i) => (
                <ChatMessage
                  key={chat.id}
                  content={chat.message}
                  timestamp={chat.createdAt}
                  isUser={chat.role === "user" as Role}
                  teamMember={(chat as any).teamMemberName}
                />
              ))}
              
              {isTyping && typingAgent && (
                <ChatAgentTyping typingAgent={typingAgent} />
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="notes" className="flex-1 p-4 pt-0 overflow-auto">
            <div className="h-full">
              {notes.length > 0 ? (
                <ScrollArea className="h-full">
                  <div className="space-y-4 pr-4">
                    {notes.map((note) => (
                      <div key={note.id} className="border bg-muted/10 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                            {note.author.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-sm font-medium">{note.author}</span>
                          <span className="text-xs text-muted-foreground">
                            {note.createdAt.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{note.text}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <FileText className="h-12 w-12 text-muted-foreground/20 mb-2" />
                  <p className="text-muted-foreground">No internal notes yet</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Notes are only visible to support agents
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced message input for both tabs */}
        <div className="border-t p-4">
          {currentTab === 'conversation' ? (
            // Message input for conversation tab
            <div className="flex items-center space-x-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={!realtime || isSending}
                placeholder={realtime ? "Type your reply..." : "Live support unavailable"}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!realtime || isSending || !message.trim()}
              >
                {isSending ? 'Sending...' : 'Send'}
              </Button>
            </div>
          ) : (
            // Note input form for notes tab
            <div className="border rounded-lg bg-card p-3">
              <Textarea
                placeholder="Add an internal note..."
                className="resize-none min-h-[100px]"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <div className="flex justify-between mt-3">
                <p className="text-xs text-muted-foreground">
                  Internal notes are only visible to support team members
                </p>
                <Button 
                  onClick={() => {
                    if (message.trim()) {
                      handleAddNote(message);
                      setMessage('');
                    }
                  }}
                  disabled={!message.trim()}
                  size="sm"
                >
                  Add Note
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info sidebar with customer details and insights */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-l h-full bg-background overflow-hidden"
          >
            {currentMetadata && (
              <ScrollArea className="h-full pb-4">
                <div className="p-4">
                  <h3 className="font-medium text-lg mb-4">Conversation Details</h3>
                  
                  {/* Customer info section */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium mb-2">Customer Info</h4>
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium mr-2">
                          GC
                        </div>
                        <div>
                          <div className="font-medium">Guest Customer</div>
                          <div className="text-xs text-muted-foreground">guest@example.com</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Conversation insights */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium mb-2">Conversation Insights</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium">{currentMetadata.insights?.conversationDuration || "N/A"}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">Messages</span>
                        <span className="font-medium">{currentMetadata.insights?.messageCount || 0}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">Sentiment</span>
                        <span className="font-medium">{currentMetadata.insights?.customerSentiment || "Neutral"}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Response Time</span>
                        <span className="font-medium">{currentMetadata.insights?.avgResponseTime || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* AI suggestions section */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <Sparkles className="h-3.5 w-3.5 mr-1.5 text-yellow-500" />
                      AI Suggestions
                    </h4>
                    <div className="space-y-2">
                      {aiSuggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          className="w-full text-left p-2 rounded-md border bg-card hover:bg-muted/10 transition-colors text-sm"
                          onClick={() => {
                            setMessage(prev => prev ? `${prev}\n\n${suggestion.text}` : suggestion.text);
                            setCurrentTab('conversation');
                          }}
                        >
                          {suggestion.text}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Added notes summary in the sidebar */}
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <FileText className="h-3.5 w-3.5 mr-1.5" />
                      Internal Notes
                    </h4>
                    {notes.length > 0 ? (
                      <div className="space-y-2">
                        {notes.slice(0, 2).map((note) => (
                          <div key={note.id} className="p-2 bg-muted/10 rounded-md">
                            <div className="text-xs font-medium mb-1 flex items-center justify-between">
                              <span>{note.author}</span>
                              <span className="text-muted-foreground">{note.createdAt.toLocaleTimeString()}</span>
                            </div>
                            <div className="text-xs line-clamp-2">{note.text}</div>
                          </div>
                        ))}
                        {notes.length > 2 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full text-xs h-7"
                            onClick={() => setCurrentTab('notes')}
                          >
                            View all {notes.length} notes
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground p-2">
                        No internal notes added yet.
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ChatWindow 