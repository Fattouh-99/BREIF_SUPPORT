'use client'
import { useChatWindow } from '@/hooks/conversation/use-conversation'
import React, { useState, useEffect, useCallback, useRef, useMemo, memo, RefObject } from 'react'
import { Loader } from '../loader'
import Bubble from '../chatbot/bubble'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { 
  Send, 
  ChevronLeft, 
  ChevronRight, 
  Radio, 
  Bot, 
  Headphones, 
  Share2, 
  UserPlus2, 
  Check, 
  Play, 
  Pause, 
  CheckCircle2, 
  X, 
  MessageSquare, 
  Loader2, 
  ClipboardEdit, 
  Command, 
  Clock, 
  Bold, 
  Italic, 
  Link as LinkIcon, 
  List, 
  ListOrdered, 
  Image as ImageIcon, 
  Paperclip, 
  Smile, 
  FileText, 
  LightbulbIcon, 
  Sparkles 
} from 'lucide-react'
import { onToggleRealtime, notifyTypingStatus, onPauseConversation, notifyRealTimeMode, onGetChatRoomStatus } from '@/actions/conversation'
import { onGetTeamMembers } from '@/actions/team'
import { onTransferConversation } from '@/actions/team/transfer'
import { CardDescription } from '../ui/card'
import { cn } from '@/lib/utils'
import ChatSidebar, { ChatMetadata } from './chat-sidebar'
import { ScrollArea } from '../ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { pusherClient } from '@/lib/pusher'
import { toast } from "@/components/ui/use-toast"
import { useRouter } from 'next/navigation'
import { useConversation } from './conversation-context'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import { AnimatePresence, motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Badge } from '@/components/ui/badge'

// Create memo'd components for better performance
const MemoizedBubble = memo(Bubble);

// Modify the QuickResponse interface to include all needed properties
interface QuickResponse {
  key: string;
  label: string;
  text: string;
  shortcut?: string;
  id?: string; // Keep id for backward compatibility
}

type TeamMember = {
  id: string
  fullname: string
  email: string
  role: string
  image: string | null
  type?: string
}

type ChatMessage = {
  id: string;
  message: string;
  role: 'user' | 'assistant' | null;
  createdAt: Date;
  seen: boolean;
  teamMemberId?: string;
  teamMemberName?: string;
  isNote?: boolean;
  noteType?: 'transfer' | 'internal';
}

// Update the Messenger component's props interface to add the new props
interface MessengerProps {
  // Add these new props
  inputRef?: RefObject<HTMLTextAreaElement>;
  onInputChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  showQuickResponses?: boolean;
  filteredResponses?: QuickResponse[];
  selectedResponseIndex?: number;
  insertQuickResponse?: (response: QuickResponse) => void;
  setShowQuickResponses?: (show: boolean) => void;
  // Keep any existing props
  // ...
}

// Define canned response categories and templates
interface CannedResponse {
  id: string;
  category: string;
  title: string;
  content: string;
}

// Helper function to create a channel subscription
const createChannelSubscription = (
  channelName: string, 
  eventName: string, 
  callback: (data: any) => void
) => {
  console.log(`[Messenger] Subscribing to ${channelName} for event ${eventName}`);
  
  // Use pusherClient directly since we're mimicking Pusher's API
  if (!pusherClient) {
    console.warn("Pusher client is not initialized");
    return () => {}; // Return no-op unsubscribe
  }
  
  try {
    const channel = pusherClient.subscribe(channelName);
    channel.bind(eventName, callback);
    
    // Return unsubscribe function
    return () => {
      try {
        channel.unbind(eventName, callback);
      } catch (error) {
        console.error(`Error unbinding from ${eventName} on ${channelName}:`, error);
      }
    };
  } catch (error) {
    console.error(`Error subscribing to ${channelName}:`, error);
    return () => {}; // Return no-op unsubscribe
  }
};

const CANNED_RESPONSES: CannedResponse[] = [
  // Greeting category
  { id: 'g1', category: 'Greeting', title: 'Welcome', content: 'Hello! Thank you for reaching out to our support team. How can I assist you today?' },
  { id: 'g2', category: 'Greeting', title: 'Introduction', content: 'Hi there! My name is [Your Name] and I\'ll be helping you today. What brings you to our support?' },
  
  // Billing category
  { id: 'b1', category: 'Billing', title: 'Payment Issue', content: 'I understand you\'re having an issue with your payment. Let me look into this for you right away.' },
  { id: 'b2', category: 'Billing', title: 'Refund Policy', content: 'According to our refund policy, we offer full refunds within 30 days of purchase. Would you like me to process this for you?' },
  { id: 'b3', category: 'Billing', title: 'Subscription Info', content: 'Your current subscription plan is [Plan Name]. This includes [features] and is billed [frequency] at [amount].' },
  
  // Technical category
  { id: 't1', category: 'Technical', title: 'Troubleshooting', content: 'Let\'s troubleshoot this issue step by step. First, could you please try clearing your browser cache and cookies?' },
  { id: 't2', category: 'Technical', title: 'Bug Report', content: 'Thank you for reporting this bug. I\'ve logged this in our system and our development team will investigate. For now, let me suggest a workaround.' },
  
  // Closing category
  { id: 'c1', category: 'Closing', title: 'Resolution', content: 'I\'m glad we were able to resolve your issue. Is there anything else I can help you with today?' },
  { id: 'c2', category: 'Closing', title: 'Follow-up', content: 'I\'ll follow up with you in 24-48 hours to make sure everything is working properly. Feel free to reach out if you have any other questions!' },
];

// Quick reply buttons for common phrases
const QUICK_REPLIES = [
  { id: 'qr1', text: 'I\'ll look into this right away' },
  { id: 'qr2', text: 'Thanks for your patience' },
  { id: 'qr3', text: 'Could you provide more details?' },
  { id: 'qr4', text: 'Let me check with our team' },
  { id: 'qr5', text: 'Is there anything else I can help with?' },
];

// AI-suggested responses (would normally come from an API)
const AI_SUGGESTIONS = [
  { id: 'ai1', text: 'Based on the conversation, it seems like you\'re having trouble with our login system. Have you tried resetting your password?' },
  { id: 'ai2', text: 'I notice you mentioned billing issues. Would you like me to review your recent transactions?' },
  { id: 'ai3', text: 'It appears you\'re trying to integrate our API. Would you like me to send you our developer documentation?' },
];

// AI-suggested responses (would normally come from an API)
const AI_SUGGESTIONS_2 = [
  { id: 'ai4', text: 'Based on the conversation, it seems like you\'re having trouble with our login system. Have you tried resetting your password?' },
  { id: 'ai5', text: 'I notice you mentioned billing issues. Would you like me to review your recent transactions?' },
  { id: 'ai6', text: 'It appears you\'re trying to integrate our API. Would you like me to send you our developer documentation?' },
];

// Enhanced message input component with markdown support
const EnhancedMessageInput = ({ 
  value, 
  onChange, 
  onSend, 
  isLoading,
  isDisabled,
  placeholder,
  showSuggestions = true
}: { 
  value: string; 
  onChange: (value: string) => void; 
  onSend: () => void; 
  isLoading?: boolean;
  isDisabled?: boolean;
  placeholder?: string;
  showSuggestions?: boolean;
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Format options for markdown
  const formatOptions = [
    { icon: <Bold className="h-4 w-4" />, label: 'Bold', prefix: '**', suffix: '**' },
    { icon: <Italic className="h-4 w-4" />, label: 'Italic', prefix: '_', suffix: '_' },
    { icon: <LinkIcon className="h-4 w-4" />, label: 'Link', prefix: '[', suffix: '](url)' },
    { icon: <List className="h-4 w-4" />, label: 'Bullet List', prefix: '- ', suffix: '' },
    { icon: <ListOrdered className="h-4 w-4" />, label: 'Numbered List', prefix: '1. ', suffix: '' },
  ];
  
  // Handle format button click
  const handleFormat = (prefix: string, suffix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + prefix + selectedText + suffix + value.substring(end);
    
    onChange(newText);
    
    // After formatting, focus the textarea and set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };
  
  // Handle key commands (Enter to send, Shift+Enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim().length > 0 && !isDisabled) {
        onSend();
      }
    }
  };
  
  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };
  
  // Remove a selected file
  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };
  
  // Insert a canned response
  const insertCannedResponse = (content: string) => {
    onChange(value ? `${value}\n\n${content}` : content);
  };
  
  // Insert a quick reply
  const insertQuickReply = (text: string) => {
    onChange(value ? `${value} ${text}` : text);
  };

  return (
    <div className="border rounded-lg bg-card">
      {/* Message Format Toolbar */}
      <div className="flex items-center p-2 border-b bg-muted/20">
        <ToggleGroup.Root
          type="multiple"
          className="flex items-center space-x-1"
          aria-label="Formatting options"
        >
          {formatOptions.map((option) => (
            <TooltipProvider key={option.label} delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroup.Item
                    value={option.label}
                    aria-label={option.label}
                    onClick={() => handleFormat(option.prefix, option.suffix)}
                    className="p-2 rounded-md hover:bg-muted/50 data-[state=on]:bg-muted/70"
                  >
                    {option.icon}
                  </ToggleGroup.Item>
                </TooltipTrigger>
                <TooltipContent side="top">{option.label}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </ToggleGroup.Root>
        
        <div className="border-l mx-2 h-6" />
        
        {/* File attachment */}
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-md hover:bg-muted/50"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Attach file</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileSelect}
          multiple
        />
        
        <div className="flex-grow"></div>
        
        {/* Canned responses */}
        <DropdownMenu>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-md hover:bg-muted/50">
                    <FileText className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="top">Canned responses</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <DropdownMenuContent align="end" className="w-80">
            <Tabs defaultValue="Greeting" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="Greeting">Greeting</TabsTrigger>
                <TabsTrigger value="Billing">Billing</TabsTrigger>
                <TabsTrigger value="Technical">Technical</TabsTrigger>
                <TabsTrigger value="Closing">Closing</TabsTrigger>
              </TabsList>
              
              {['Greeting', 'Billing', 'Technical', 'Closing'].map((category) => (
                <TabsContent key={category} value={category} className="mt-2">
                  <ScrollArea className="h-60">
                    <div className="space-y-2 p-1">
                      {CANNED_RESPONSES.filter(response => response.category === category).map((response) => (
                        <button
                          key={response.id}
                          onClick={() => insertCannedResponse(response.content)}
                          className="w-full text-left p-2 rounded-md hover:bg-muted/80 transition-colors"
                        >
                          <div className="font-medium text-sm">{response.title}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2">{response.content}</div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Preview toggle */}
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={showPreview ? "secondary" : "ghost"}
                size="icon" 
                className="rounded-md hover:bg-muted/50 ml-1"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Smile className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">{showPreview ? "Hide preview" : "Show preview"}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* AI suggestions */}
        {showSuggestions && (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={showAiSuggestions ? "secondary" : "ghost"}
                  size="icon" 
                  className="rounded-md hover:bg-muted/50 ml-1"
                  onClick={() => setShowAiSuggestions(!showAiSuggestions)}
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">AI suggestions</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      {/* Quick replies */}
      <div className="p-2 flex flex-wrap gap-2 border-b bg-muted/10">
        {QUICK_REPLIES.map((reply) => (
          <Button
            key={reply.id}
            variant="outline"
            size="sm"
            onClick={() => insertQuickReply(reply.text)}
            className="h-7 rounded-full text-xs bg-background"
          >
            {reply.text}
          </Button>
        ))}
      </div>
      
      {/* File previews */}
      {files.length > 0 && (
        <div className="p-2 border-b bg-muted/10">
          <div className="text-xs font-medium mb-2 text-muted-foreground">Attachments</div>
          <div className="flex flex-wrap gap-2">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                <div className="border rounded-md p-2 bg-background flex items-center gap-2 max-w-[200px]">
                  <div className="flex-shrink-0">
                    {file.type.startsWith('image/') ? (
                      <div className="h-10 w-10 rounded bg-muted/30 flex items-center justify-center overflow-hidden">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={file.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded bg-muted/30 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate">{file.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-6 w-6 absolute -top-2 -right-2 rounded-full bg-background border opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Markdown preview */}
      {showPreview && value && (
        <div className="p-3 border-b bg-muted/5">
          <div className="text-xs font-medium mb-1 text-muted-foreground">Preview</div>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {value}
            </ReactMarkdown>
          </div>
        </div>
      )}
      
      {/* AI Suggestions */}
      <AnimatePresence>
        {showAiSuggestions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-b overflow-hidden"
          >
            <div className="p-3 bg-muted/5">
              <div className="flex items-center gap-2 mb-2">
                <LightbulbIcon className="h-4 w-4 text-yellow-500" />
                <span className="text-xs font-medium text-muted-foreground">AI-suggested responses</span>
              </div>
              <div className="space-y-2">
                {AI_SUGGESTIONS.map((suggestion) => (
                  <motion.div
                    key={suggestion.id}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <button
                      className="w-full text-left p-2 rounded-md border bg-card hover:bg-muted/10 transition-colors"
                      onClick={() => {
                        insertCannedResponse(suggestion.text);
                        setShowAiSuggestions(false);
                      }}
                    >
                      <div className="text-sm">{suggestion.text}</div>
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Message input */}
      <div className="p-3">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            // Call both handlers - the local one and the provided one
            handleTextareaChange(e);
            if (handleInputChange) handleInputChange(e);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Type your message..."}
          className={cn(
              "w-full pr-16 py-6 text-base border-primary/20 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary/30",
              "disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-muted-foreground/60",
              "bg-background/80 rounded-lg shadow-sm"
          )}
        />
        
        {/* Command shortcut indicator */}
        <div className="absolute right-14 z-10">
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-xs text-muted-foreground bg-background/80 px-1.5 py-0.5 rounded border border-border/30 flex items-center">
                  <Command className="h-3 w-3 mr-1" />
                  <span>Alt+Q</span>
          </div>
              </TooltipTrigger>
              <TooltipContent side="top" align="end">
                Focus message input
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
          <Button 
          type="submit"
          size="icon"
          disabled={!realtime || isPaused}
          className={cn(
            "absolute right-2 h-9 w-9",
            realtime && !isPaused ? "text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950" : "text-muted-foreground",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <Send className="h-5 w-5" />
          </Button>
      </div>
    </div>
  );
};

// Add the internal notes component
const InternalNotes = ({ 
  notes, 
  onAddNote 
}: { 
  notes: { id: string; text: string; author: string; createdAt: Date }[]; 
  onAddNote: (text: string) => void 
}) => {
  const [noteText, setNoteText] = useState('');
  
  const handleSubmitNote = () => {
    if (noteText.trim()) {
      onAddNote(noteText);
      setNoteText('');
    }
  };
  
  return (
    <div className="border rounded-lg bg-card h-full flex flex-col">
      <div className="p-3 border-b">
        <h3 className="font-medium">Internal Notes</h3>
        <p className="text-xs text-muted-foreground">
          Notes are only visible to support agents
        </p>
      </div>
      
      <ScrollArea className="flex-grow">
        <div className="p-3 space-y-4">
          {notes.length > 0 ? (
            notes.map((note) => (
              <div key={note.id} className="border bg-muted/10 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px]">
                      {note.author.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{note.author}</span>
                  <span className="text-xs text-muted-foreground">
                    {note.createdAt.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{note.text}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No internal notes yet</p>
              <p className="text-xs">Add a note to share with other agents</p>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="p-3 border-t mt-auto">
        <Textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Add an internal note..."
          rows={3}
          className="resize-none text-sm"
        />
        <Button 
          onClick={handleSubmitNote} 
          disabled={!noteText.trim()} 
          size="sm"
          className="mt-2 w-full"
        >
          Add Note
        </Button>
      </div>
    </div>
  );
};

const Messenger = () => {
  const {
    inputRef,
    handleInputChange,
    showQuickResponses,
    filteredResponses,
    selectedResponseIndex,
    insertQuickResponse,
    setShowQuickResponses
  } = useConversation()
  
  const {
    messageWindowRef,
    chats: initialChats,
    loading,
    chatRoom,
    onHandleSentMessage,
    register,
    realtime: initialRealtime,
    isTyping,
    typingAgent,
    chatMetadata,
    setChats: originalSetChats
  } = useChatWindow()
  
  // Mock WebSocket state since we're using Pusher directly
  const [isConnected, setIsConnected] = useState(true);
  const [lastMessage, setLastMessage] = useState<any>(null);
  
  // Mock WebSocket functions
  const sendMessage = useCallback((data: any) => {
    console.log('[Messenger] Would send WebSocket message:', data);
  }, []);
  
  const connect = useCallback(() => {
    setIsConnected(true);
  }, []);

  const disconnect = useCallback(() => {
    setIsConnected(false);
  }, []);
  
  // Create function for getting connection state
  const getConnectionState = useCallback(() => isConnected ? 'connected' : 'disconnected', [isConnected]);

  // Create local state for realtime and chats with proper types
  const [realtime, setRealtime] = useState(initialRealtime)
  const [chats, setChats] = useState<ChatMessage[]>(initialChats as ChatMessage[])

  // Sync chats state with the original setChats function
  useEffect(() => {
    originalSetChats(chats);
  }, [chats, originalSetChats]);

  // Initialize chats from initialChats
  useEffect(() => {
    if (initialChats && initialChats.length > 0) {
      console.log(`[Messenger] Received ${initialChats.length} messages from useChatWindow`);
      
      // Log the first and last message for debugging
      if (initialChats.length > 0) {
        console.log(`[Messenger] First message: "${initialChats[0].message.substring(0, 30)}..."`);
        console.log(`[Messenger] Last message: "${initialChats[initialChats.length-1].message.substring(0, 30)}..."`);
      }
      
      // Ensure we don't filter out any messages before setting to state
      setChats(initialChats as ChatMessage[]);
    } else {
      console.warn('[Messenger] No initial messages received from useChatWindow');
    }
  }, [initialChats]);

  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [transferLoading, setTransferLoading] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [isSharedViewer, setIsSharedViewer] = useState(false)
  const [unsharing, setUnsharing] = useState(false)
  const [transferNote, setTransferNote] = useState("")
  const [internalNote, setInternalNote] = useState("")
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [isSubmittingNote, setIsSubmittingNote] = useState(false)
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<{ id: string; fullname: string } | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<string>(getConnectionState())
  const [isTogglingRealtime, setIsTogglingRealtime] = useState(false)

  // State for quick responses
  const quickResponses: QuickResponse[] = [
    { key: 'greeting', id: '1', label: 'Greeting', text: 'Hello! How can I assist you today?', shortcut: '/hello' },
    { key: 'thanks', id: '2', label: 'Thank You', text: 'Thank you for reaching out to us.', shortcut: '/thanks' },
    { key: 'closing', id: '3', label: 'Closing', text: 'Please let us know if you have any other questions!', shortcut: '/bye' },
    { key: 'wait', id: '4', label: 'Please Wait', text: 'Thank you for your patience. I\'ll get back to you shortly.', shortcut: '/wait' },
  ];
  const [inputValue, setInputValue] = useState('');
  const quickResponseRef = useRef<HTMLDivElement>(null);
  const lastChatRef = useRef<HTMLDivElement>(null);

  // Performance optimization - memoize expensive computations
  const memoizedChats = useMemo(() => chats, [chats]);
  
  // Update connection status listeners
  useEffect(() => {
    // Update connection status based on isConnected state
    setConnectionStatus(isConnected ? 'connected' : 'disconnected');
  }, [isConnected]);

  // Add an effect to initialize the realtime state once on component mount
  useEffect(() => {
    if (!chatRoom) return;
    
    const initializeRealtimeState = async () => {
      try {
        const status = await onGetChatRoomStatus(chatRoom);
        if (status !== undefined) {
          // Set initial state without triggering notifications
          setRealtime(status);
        }
      } catch (error) {
        console.error('Error initializing chat room status:', error);
      }
    };
    
    initializeRealtimeState();
  }, [chatRoom]);
  
  // Function for toggling real-time mode
  const toggleRealTimeMode = async () => {
    if (!chatRoom) return;
    
    try {
      // Show loading state
      setIsTogglingRealtime(true);
      const newRealtimeState = !realtime;
      
      // When going live, fetch complete chat history including bot-customer messages
      if (newRealtimeState) {
        try {
          // Notify user that we're fetching previous messages
          toast({
            title: "Loading conversation history",
            description: "Fetching previous messages between chatbot and customer...",
            duration: 3000
          });
          
          console.log(`[Messenger] Fetching complete message history for ${chatRoom}`);
          
          // Get all messages including bot-customer exchanges - ALWAYS includes bot messages
          const response = await fetch(`/api/conversations/${chatRoom}/messages?include_bot=true`, {
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.messages && Array.isArray(data.messages)) {
              console.log(`[Messenger] Successfully loaded ${data.messages.length} messages from complete history`);
              
              // Log all messages for debugging
              data.messages.forEach((msg: any, index: number) => {
                console.log(`[Messenger] Message ${index+1}/${data.messages.length}: ${msg.role} | ${new Date(msg.createdAt).toISOString()} | ${msg.message.substring(0, 50)}${msg.message.length > 50 ? '...' : ''}`);
              });
              
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
              const sortedMessages = formattedMessages.sort((a: {createdAt: Date}, b: {createdAt: Date}) => 
                a.createdAt.getTime() - b.createdAt.getTime()
              );
              
              // Update chat messages with complete history
              setChats(sortedMessages);
              
              // Show success notification
              toast({
                title: "Conversation history loaded",
                description: `Successfully loaded ${sortedMessages.length} previous messages`,
                duration: 3000
              });
              
              // Scroll to bottom after setting messages
              setTimeout(() => {
                if (lastChatRef.current) {
                  lastChatRef.current.scrollIntoView({ behavior: 'smooth' });
                }
              }, 500);
            } else {
              console.error('[Messenger] Invalid response format:', data);
              toast({
                title: "Error",
                description: "Failed to parse message history. Data format error.",
                variant: "destructive",
                duration: 5000
              });
            }
          } else {
            console.error('[Messenger] Failed to fetch complete chat history', await response.text());
            
            toast({
              title: "Warning",
              description: "Could not load complete chat history. Some previous messages may be missing.",
              variant: "destructive",
              duration: 5000
            });
          }
        } catch (error) {
          console.error('[Messenger] Error fetching complete chat history:', error);
          // Continue with toggle even if history fetch fails
          toast({
            title: "Warning",
            description: "Error loading previous messages. You may not see the complete conversation history.",
            variant: "destructive",
            duration: 5000
          });
        }
      }
      
      // Toggle the realtime mode via server action
      await onToggleRealtime(chatRoom, newRealtimeState);
      setRealtime(newRealtimeState); // Update local state immediately
      
      // Notify all clients about the chat list update (for real-time refresh)
      try {
        await fetch('/api/conversations/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event: 'chat-list-update',
            data: {
              chatRoomId: chatRoom,
              live: newRealtimeState,
              source: 'realtime-toggle'
            }
          })
        });
        console.log('[Messenger] Sent chat-list-update event to notify other clients');
      } catch (eventError) {
        console.error('[Messenger] Failed to send chat-list-update event:', eventError);
        // Continue even if event sending fails
      }
    } catch (error) {
      console.error('Error toggling realtime mode:', error);
      toast({
        title: "Error",
        description: "Failed to toggle live support mode. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsTogglingRealtime(false);
    }
  };
  
  // Function to toggle pause status
  const togglePauseStatus = async () => {
    if (!chatRoom) return;
    
    try {
      // Let the server update the state and trigger events
      // Local state will be updated via the Pusher event
      await onPauseConversation(chatRoom, !isPaused, {
        name: 'Support Agent',
        role: 'support'
      });
      
      // Emit a chat-list-update event to ensure all clients get the update
      try {
        await fetch('/api/conversations/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event: 'chat-list-update',
            data: {
              chatRoomId: chatRoom,
              paused: !isPaused,
              source: 'pause-toggle'
            }
          })
        });
        console.log('[Messenger] Sent chat-list-update event for pause status change');
      } catch (eventError) {
        console.error('[Messenger] Failed to send chat-list-update event:', eventError);
        // Continue even if event sending fails
      }
    } catch (error) {
      console.error('Error toggling pause status:', error);
      toast({
        title: "Error",
        description: "Failed to toggle pause status. Please try again.",
        variant: "destructive",
        duration: 3000
      });
    }
  };

  // Add keyboard shortcuts for common actions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+L to toggle live support
      if (e.altKey && e.key === 'l' && !isTogglingRealtime) {
        toggleRealTimeMode();
      }
      
      // Alt+P to toggle pause
      if (e.altKey && e.key === 'p' && realtime) {
        togglePauseStatus();
      }
      
      // Alt+N to add note
      if (e.altKey && e.key === 'n') {
        setIsAddingNote(true);
      }
      
      // Alt+Q to toggle quick responses
      if (e.altKey && e.key === 'q') {
        if (setShowQuickResponses) {
          setShowQuickResponses(!showQuickResponses);
        }
      }
      
      // Escape to close quick responses
      if (e.key === 'Escape' && showQuickResponses) {
        if (setShowQuickResponses) {
          setShowQuickResponses(false);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [realtime, isTogglingRealtime, showQuickResponses, setShowQuickResponses, toggleRealTimeMode, togglePauseStatus, setIsAddingNote]);

  // Handle quick response selection
  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (!chatRoom || !realtime) return;
    
    // Check for quick response shortcuts
    if (value.startsWith('/')) {
      const matchingResponse = quickResponses.find(
        (response) => response.shortcut && value === response.shortcut
      );
      
      if (matchingResponse) {
        e.target.value = matchingResponse.text;
        setInputValue(matchingResponse.text);
        return;
      }
      
      // Show quick responses panel when typing '/'
      if (value === '/') {
        if (setShowQuickResponses) {
          setShowQuickResponses(true);
        }
        return;
      }
    } else {
      if (setShowQuickResponses) {
        setShowQuickResponses(false);
      }
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Only notify if not already typing
    if (!isTyping) {
      notifyTypingStatus(chatRoom, true, {
        name: 'Support Agent',
        role: 'support'
      }).catch(error => {
        console.error('Error sending typing status:', error);
      });
    }
    
    // Set new timeout to clear typing status
    typingTimeoutRef.current = setTimeout(() => {
      notifyTypingStatus(chatRoom, false, {
        name: 'Support Agent',
        role: 'support'
      }).catch(error => {
        console.error('Error clearing typing status:', error);
      });
      typingTimeoutRef.current = null;
    }, 2000);
  }, [chatRoom, realtime, isTyping, setShowQuickResponses]);

  // Improved message submission with better error handling
  const handleMessageSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[Messenger] Starting message submission...', {
      realtime,
      isPaused,
      hasInput: !!inputValue.trim(),
      chatRoom
    });

    if (!realtime || isPaused || !inputValue.trim() || !chatRoom) {
      console.log('[Messenger] Message submission blocked:', {
        realtime,
        isPaused,
        hasInput: !!inputValue.trim(),
        chatRoom: !!chatRoom
      });
      return;
    }
    
    // Store message before clearing input
    const messageToSend = inputValue.trim();
    console.log('[Messenger] Preparing to send message:', messageToSend);
    
    // Clear input immediately for better UX
    setInputValue('');
    if (inputRef?.current) {
      inputRef.current.value = '';
    }
    
    try {
      console.log('[Messenger] Calling onHandleSentMessage with message:', messageToSend);
      
      // Send message with the new format
      await onHandleSentMessage({ message: messageToSend });
      
      // Clear any existing typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      
      // Notify that typing has stopped
      await notifyTypingStatus(chatRoom, false, {
        name: 'Support Agent',
        role: 'support'
      });
      
    } catch (error) {
      console.error('[Messenger] Error in handleMessageSubmit:', error);
      toast({
        title: "Failed to send message",
        description: "Please try again. Your message was not sent.",
        variant: "destructive"
      });
      
      // Restore input value if send failed
      setInputValue(messageToSend);
      if (inputRef?.current) {
        inputRef.current.value = messageToSend;
      }
    }
  }, [realtime, isPaused, inputValue, onHandleSentMessage, chatRoom]);

  // Update WebSocket subscriptions
  useEffect(() => {
    if (!chatRoom) return;
    
    // Listen for pause status changes
    const unsubscribePause = createChannelSubscription(
      `${chatRoom}-mode`,
      'pause-status',
      (data: { isPaused: boolean, supportAgent?: any }) => {
        setIsPaused(data.isPaused);
        
        if (data.supportAgent) {
          // Add some UI indication about who paused/unpaused the conversation
          const action = data.isPaused ? 'paused' : 'resumed';
          toast({
            title: `Conversation ${action}`,
            description: `${data.supportAgent.name || 'Support agent'} has ${action} this conversation.`,
            duration: 3000,
          });
        }
      }
    );
    
    // Listen for mode changes (realtime on/off)
    const unsubscribeMode = createChannelSubscription(
      `${chatRoom}-mode`, 
      'mode-change', 
      (data: { live: boolean, supportAgent?: any }) => {
        if (!data.live) {
          setIsPaused(false); // Reset pause state when live support ends
        }
        
        // Update realtime state
        setRealtime(data.live);
        
        // Show toast notification for mode change
        if (data.supportAgent) {
          const action = data.live ? 'started' : 'ended';
          toast({
            title: `Live support ${action}`,
            description: `${data.supportAgent.name || 'Support agent'} has ${action} live support.`,
            duration: 3000,
          });
        }
      }
    );
    
    // Listen for agent joining notifications
    const unsubscribeAgentConnect = createChannelSubscription(
      `${chatRoom}-mode`,
      'agent-connect',
      (data: { agentInfo?: any, message?: string }) => {
        if (data.message) {
          toast({
            title: "Agent Connected",
            description: data.message,
            duration: 3000,
          });
        }
      }
    );
    
    // Listen for typing indicators
    const unsubscribeTyping = createChannelSubscription(
      chatRoom,
      'typing-status',
      (data: { isTyping: boolean, supportAgent?: any }) => {
        // We don't need to set isTyping here as it's managed by useChatWindow
        // Just show a toast notification if desired
        if (data.supportAgent && data.isTyping) {
          toast({
            title: "Agent is typing",
            description: `${data.supportAgent.name || 'Support agent'} is typing...`,
            duration: 2000,
          });
        }
      }
    );
    
    return () => {
      unsubscribePause();
      unsubscribeMode();
      unsubscribeAgentConnect();
      unsubscribeTyping();
    };
  }, [chatRoom]);

  // Fetch team members when transfer dialog opens
  useEffect(() => {
    if (showTransferDialog) {
      const fetchTeamMembers = async () => {
        const response = await onGetTeamMembers()
        if (response.success && response.members) {
          setTeamMembers(response.members)
        }
      }
      fetchTeamMembers()
    }
  }, [showTransferDialog])

  // Optimized message list renderer for better performance with many messages
  const MessageList = useMemo(() => {
    return (
      <ScrollArea className="h-full">
        <div className="px-6 py-4 space-y-6">
          {memoizedChats.map((chat) => (
            <MemoizedBubble
              key={chat.id}
              message={{
                role: chat.role!,
                content: chat.message,
                teamMemberId: chat.teamMemberId,
                teamMemberName: chat.teamMemberName,
                createdAt: chat.createdAt,
                isNote: chat.isNote,
                noteType: chat.noteType
              }}
              typingAgent={typingAgent}
              isTyping={isTyping}
            />
          ))}
          
          {/* Auto-scroll reference */}
          <div ref={lastChatRef} />
        </div>
      </ScrollArea>
    );
  }, [memoizedChats, typingAgent, isTyping]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (lastChatRef.current && memoizedChats.length > 0) {
      lastChatRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [memoizedChats.length]);

  // Use the inputRef if provided, otherwise use the local ref
  const textareaRef = inputRef || useRef<HTMLTextAreaElement>(null);

  if (!chatRoom) {
    return (
      <div className="flex-1 flex items-center justify-center h-full bg-card/50">
        <div className="text-center space-y-4 max-w-md p-6 rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm shadow-sm">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageSquare className="h-6 w-6 text-primary/70" />
          </div>
          <h3 className="text-lg font-medium text-foreground">No Conversation Selected</h3>
          <CardDescription className="text-sm max-w-sm mx-auto">
            Select a conversation from the menu to start messaging or create a new conversation.
          </CardDescription>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full overflow-hidden relative">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full mr-8">
        {/* Header with keyboard shortcut indicators */}
        <div className="px-3 sm:px-4 py-2 sm:py-3 rounded-t-lg border-b bg-card/50 backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center justify-between shrink-0 shadow-sm gap-2 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 w-full">
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn(
                    "px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2 cursor-default",
                    realtime 
                      ? "bg-primary/10 text-primary border border-primary/20" 
                      : "bg-muted text-muted-foreground border border-border/50"
                  )}>
                    {realtime ? (
                      <Headphones className="w-3 h-3 sm:w-4 sm:h-4" />
                    ) : (
                      <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                    <span>{realtime ? "Live Support" : "AI Mode"}</span>
                    <span className="text-xs opacity-60 ml-1 hidden sm:inline">
                      <Command className="w-3 h-3 inline mr-0.5" />
                      Alt+L
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="start">
                  {realtime ? "You are providing live support" : "AI is handling this conversation"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {isTyping && typingAgent && (
              <div className="text-xs sm:text-sm text-primary animate-pulse ml-1 sm:ml-2 flex items-center gap-1 sm:gap-1.5 truncate">
                <span className="relative flex h-1.5 sm:h-2 w-1.5 sm:w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 sm:h-2 w-1.5 sm:w-2 bg-primary"></span>
                </span>
                <span className="truncate">{typingAgent.name} is typing...</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-end">
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-blue-50 text-blue-600 hover:text-blue-700 h-8 px-2 sm:px-3"
                    onClick={() => setIsAddingNote(true)}
                  >
                    <span className="flex items-center gap-1">
                      <ClipboardEdit className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm">Add Note</span>
                      <span className="text-xs opacity-60 ml-1 hidden sm:inline">Alt+N</span>
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="end">
                  Add an internal note for your team
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* Pause button with shortcut */}
            {!isSharedViewer && realtime && (
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={togglePauseStatus}
                      variant={isPaused ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "transition-all duration-200 h-8 px-2 sm:px-3",
                        isPaused 
                          ? "bg-yellow-500 hover:bg-yellow-600 text-white" 
                          : "text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                      )}
                    >
                      {isPaused ? (
                        <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
                      ) : (
                        <Pause className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
                      )}
                      <span className="text-xs sm:text-sm">{isPaused ? "Resume" : "Pause"}</span>
                      <span className="text-xs opacity-60 ml-1 hidden sm:inline">Alt+P</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="center">
                    {isPaused ? "Resume conversation" : "Pause conversation"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Live support toggle button */}
            {!isSharedViewer && (
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={toggleRealTimeMode}
                      variant={realtime ? "destructive" : "default"}
                      size="sm"
                      disabled={isTogglingRealtime}
                      className={cn(
                        "transition-all duration-200 h-8 px-2 sm:px-3",
                        !realtime && "bg-primary hover:bg-primary/90"
                      )}
                    >
                      {isTogglingRealtime ? (
                        <span className="flex items-center">
                          <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1 animate-spin" />
                          <span className="text-xs sm:text-sm">Loading...</span>
                        </span>
                      ) : (
                        <>
                          <Radio className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
                          <span className="text-xs sm:text-sm">{realtime ? "End Live" : "Go Live"}</span>
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="end">
                    {realtime ? "End live support" : "Enable live support"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        {/* Messages with virtualized list for performance */}
        <div className="flex-1 overflow-hidden bg-background/50 backdrop-blur-sm">
          <Loader loading={loading}>
            {MessageList}
          </Loader>
        </div>

        {/* Input with quick responses */}
        <div className="border-t bg-card/50 backdrop-blur-sm px-4 py-3 shrink-0 relative">
          <form onSubmit={handleMessageSubmit} className="max-w-4xl mx-auto">
            <div className="relative flex items-center">
              <textarea
                ref={textareaRef}
                placeholder={
                  !realtime 
                    ? "Enable live support to send messages" 
                    : isPaused 
                      ? "Conversation is paused" 
                      : "Type your message... (Type / for quick responses)"
                }
                disabled={!realtime || isPaused}
                onChange={(e) => {
                  // Call both handlers - the local one and the provided one
                  handleTextareaChange(e);
                  if (handleInputChange) handleInputChange(e);
                }}
                className={cn(
                    "w-full pr-16 py-6 text-base border-primary/20 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary/30",
                    "disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-muted-foreground/60",
                    "bg-background/80 rounded-lg shadow-sm"
                )}
              />
              
              {/* Command shortcut indicator */}
              <div className="absolute right-14 z-10">
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-xs text-muted-foreground bg-background/80 px-1.5 py-0.5 rounded border border-border/30 flex items-center">
                        <Command className="h-3 w-3 mr-1" />
                        <span>Alt+Q</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="end">
                      Focus message input
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <Button
                type="submit"
                size="icon"
                disabled={!realtime || isPaused}
                className={cn(
                  "absolute right-2 h-9 w-9",
                  realtime && !isPaused ? "text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950" : "text-muted-foreground",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Quick responses panel */}
            {showQuickResponses && filteredResponses.length > 0 && (
              <div className="absolute bottom-full mb-2 w-full max-h-60 overflow-y-auto bg-background border border-border rounded-md shadow-md">
                <div className="p-2 border-b border-border">
                  <p className="text-xs text-muted-foreground">Quick Responses</p>
                </div>
                <ul className="p-1">
                  {filteredResponses.map((response, index) => (
                    <li
                      key={response.key}
                      className={`px-3 py-2 text-sm cursor-pointer rounded ${
                        index === selectedResponseIndex ? "bg-accent" : "hover:bg-accent/50"
                      }`}
                      onClick={() => insertQuickResponse && insertQuickResponse(response)}
                    >
                      <div className="font-medium">{response.label}</div>
                      <div className="text-xs text-muted-foreground truncate">{response.text}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {!realtime ? (
              <p className="text-center text-sm text-muted-foreground/80 mt-2">
                Live support must be enabled to send messages
              </p>
            ) : isPaused ? (
              <p className="text-center text-sm text-muted-foreground/80 mt-2">
                This conversation is currently paused
              </p>
            ) : null}
          </form>
        </div>
      </div>

      {/* Chat Sidebar */}
      <div className={cn(
        "transition-all duration-300 ease-in-out relative",
        showSidebar ? "w-[300px] opacity-100" : "w-0 opacity-0"
      )}>
        {showSidebar && chatMetadata && (
          <ChatSidebar 
            metadata={chatMetadata} 
            onToggle={() => setShowSidebar(!showSidebar)}
            isOpen={showSidebar}
          />
        )}
      </div>

      {/* Toggle Button - Always Visible */}
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className={cn(
                "flex items-center justify-center rounded-full p-2 transition-colors",
                "hover:bg-accent/80 focus:outline-none focus:ring-2 focus:ring-primary/50",
                "md:p-1.5 md:rounded",
                "absolute right-0 top-4 md:static md:right-auto md:top-auto",
                showSidebar ? "bg-accent/50" : "bg-background"
              )}
            >
              {showSidebar ? (
                <ChevronRight className="w-4 h-4 md:w-3.5 md:h-3.5" />
              ) : (
                <ChevronLeft className="w-4 h-4 md:w-3.5 md:h-3.5" />
              )}
              <span className="sr-only">{showSidebar ? "Hide sidebar" : "Show sidebar"}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent 
            side="left" 
            align="center" 
            className="bg-white text-gray-900 z-50 px-3 py-1.5 text-sm font-medium shadow-md border border-gray-100"
          >
            {showSidebar ? "Hide chat information" : "Show chat information"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

// Export memoized component to prevent unnecessary re-renders
export default memo(Messenger)