import React, { useState, useMemo, memo } from 'react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { User, ChevronRight, ImageIcon, Bot, Check } from 'lucide-react'
import Image from 'next/image'
import ProductPreview from './product-preview'
import { motion } from 'framer-motion'
import parse from 'html-react-parser'
import { sanitizeHtml, sanitizeUrl } from '@/lib/sanitize'
import { useTheme } from 'next-themes'
import { format, formatDistance } from 'date-fns'
import { extractURLs, formatTimeFromDate } from '@/lib/chat'
import { botIconMapping } from '@/lib/icons'

// Simple message formatter that converts links, code blocks, etc.
const MessageFormatter = ({ content }: { content: string }) => {
  const formattedContent = useMemo(() => {
    if (!content) return <p>Empty message</p>;

    // Replace URLs with clickable links
    const withLinks = content.replace(
      /(https?:\/\/[^\s]+)/g, 
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>'
    );

    // Format code blocks (basic markdown-like formatting)
    const withCodeBlocks = withLinks.replace(
      /```([^`]+)```/g,
      '<pre class="bg-muted/80 p-2 rounded-md text-sm overflow-auto my-2">$1</pre>'
    );

    // Format inline code
    const withInlineCode = withCodeBlocks.replace(
      /`([^`]+)`/g,
      '<code class="bg-muted/50 px-1 py-0.5 rounded-sm text-xs font-mono">$1</code>'
    );

    return parse(withInlineCode);
  }, [content]);

  return <div className="whitespace-pre-wrap break-words">{formattedContent}</div>;
};

// Simple note formatter
const NoteFormatter = ({ content }: { content: string }) => {
  return <p className="whitespace-pre-wrap break-words">{content}</p>;
};

// Message content parser with memoization for performance
const MessageContent = memo(({ content, isNote }: { content: string, isNote?: boolean }) => {
  // Simple message for notes
  if (isNote) {
    return <NoteFormatter content={content} />;
  }
  
  // Use our custom formatter for other messages
  return <MessageFormatter content={content} />;
});

MessageContent.displayName = 'MessageContent';

type ProductType = {
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
}

type MessageType = {
  role: 'user' | 'assistant'
  content: string
  products?: ProductType[]
  link?: string
  teamMemberId?: string
  teamMemberName?: string
  createdAt?: string | Date
  id?: string
  isNote?: boolean
  noteType?: 'transfer' | 'internal'
}

type Props = {
  message: MessageType
  themeColor?: string
  textColor?: string
  bubbleBackground?: string
  allowDarkMode?: boolean
  typingAgent?: {
    name: string
    role?: string
  } | null
  isTyping?: boolean
  productsEnabled?: boolean
  showAvatar?: boolean
  showTimestamp?: boolean
  isFirstInGroup?: boolean
  isLastInGroup?: boolean
}

const Bubble = ({ message, themeColor, textColor, bubbleBackground, allowDarkMode = true, typingAgent, isTyping, productsEnabled = true, showAvatar = true, showTimestamp = true, isFirstInGroup = false, isLastInGroup = false }: Props) => {
  const { theme: systemTheme } = useTheme()
  const isDark = allowDarkMode && (systemTheme === 'dark')
  const isBot = message.role === 'assistant'
  const isTeamMember = message.teamMemberId && message.teamMemberName
  const isHumanSupport = isBot && isTeamMember
  const isAIBot = isBot && !isTeamMember
  const isMiddleMessage = !isFirstInGroup && !isLastInGroup
  
  // Detect notes from content patterns if not explicitly set
  const isExplicitNote = message.isNote === true
  const isImplicitInternalNote = !isExplicitNote && 
    typeof message.content === 'string' && 
    (/\[\s*(?:INTERNAL|Internal)\s*NOTE(?:\s*(?:from|FROM|:)|\s)[^\]]*\]/i.test(message.content))
  
  // Set note type based on explicit or implicit detection
  const isNote = isExplicitNote || isImplicitInternalNote
  const explicitNoteType = isExplicitNote ? message.noteType : undefined
  const implicitNoteType = isImplicitInternalNote ? 'internal' : undefined
  const noteType = explicitNoteType || implicitNoteType
  
  const isTransferNote = isNote && noteType === 'transfer'
  const isInternalNote = isNote && (noteType === 'internal' || isImplicitInternalNote)
  const hasProducts = message.products && message.products.length > 0
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null)
  const [showProductPreview, setShowProductPreview] = useState(false)
  
  // Enhanced debug logging
  console.log('[BUBBLE DEBUG]', {
    content: message.content.substring(0, 50) + '...',
    isNote,
    isExplicitNote,
    isImplicitInternalNote,
    noteType,
    isInternalNote,
    isTransferNote
  });

  // Format date helper
  const formatDate = (date: string | Date) => {
    if (!date) return '';
    const d = new Date(date);
    return format(d, 'MMM d, h:mm a');
  };

  // Clean up note content by removing the prefix
  const formatNoteContent = (content: string): string => {
    if (!content) return '';
    
    // Use the same regex pattern as the detection for consistency
    return content
      .replace(/\[\s*(?:INTERNAL|Internal)\s*NOTE(?:\s*(?:from|FROM|:)|\s)[^\]]*\]/i, '')
      .trim();
  };

  // Split message into parts (before and after product listings)
  const lines = message.content.split('\n')
  const introLines = []
  const outroLines = []
  let inProduct = false

  for (const line of lines) {
    if (line.trim() === '' || line.includes('would') || line.includes('Would')) {
      inProduct = false
      outroLines.push(line)
    } else if (!inProduct) {
      introLines.push(line)
    }
  }

  // Sanitize and parse the content parts
  const sanitizeAndParse = (content: string) => {
    return parse(sanitizeHtml(content))
  }

  // Check if the message has a link
  const hasLink = message.link && message.link.trim() !== '';
  
  // Extract link details if present
  let link: { href: string; title: string; description?: string } | null = null;
  if (hasLink) {
    // Basic link
    link = {
      href: sanitizeUrl(message.link || ''),
      title: 'Visit Link',
    };
    
    // Try to parse complex link format (JSON string)
    try {
      const linkData = JSON.parse(message.link || '');
      if (linkData.href && linkData.title) {
        link = {
          href: sanitizeUrl(linkData.href),
          title: linkData.title,
          description: linkData.description,
        };
      }
    } catch (e) {
      // Not a JSON link, use the basic link format
    }
  }

  // Helper to check if message is a system notification
  const isSystemMessage = () => {
    return message.content.includes('Live support mode has been enabled') || 
           message.content.includes('The chat has ended');
  };

  // Format timestamp
  const formattedTime = useMemo(() => {
    if (!message.createdAt) return '';
    
    const date = new Date(message.createdAt);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  }, [message.createdAt]);
  
  // Common styles
  const bubbleStyles = useMemo(() => {
    if (message.isNote) {
      return "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 text-foreground";
    }
    
    return message.role === 'user'
      ? "bg-primary text-primary-foreground order-1"
      : "bg-card dark:bg-muted/30 text-card-foreground border border-border/50 order-2";
  }, [message.role, message.isNote]);
  
  // Note style variations
  const noteStyles = useMemo(() => {
    if (!message.isNote) return "";
    
    return message.noteType === 'transfer' 
      ? "border-l-4 border-l-orange-400 dark:border-l-orange-600"
      : "border-l-4 border-l-blue-400 dark:border-l-blue-600";
  }, [message.isNote, message.noteType]);
  
  // Check if this is a typing message
  const showTypingIndicator = isTyping && 
    typingAgent && 
    message.role === 'assistant' && 
    typingAgent.role === 'user';

  const getBubbleStyle = () => {
    if (isBot) {
      return {
        backgroundColor: bubbleBackground || '#F9FAFB',
        color: textColor || '#374151',
        borderColor: themeColor ? `${themeColor}20` : '#E5E7EB'
      }
    }
    return {
      backgroundColor: themeColor || '#6366F1',
      color: '#FFFFFF'
    }
  }
  
  const extractedURLs = message.content ? extractURLs(message.content) : []
  
  const processedContent = React.useMemo(() => {
    if (!message.content) return ''
    
    let content = message.content
    
    // Replace URLs with placeholders for later
    extractedURLs.forEach((url, i) => {
      content = content.replace(url, `__URL_${i}__`)
    })
    
    // Convert line breaks to <br>
    content = content.replace(/\n/g, '<br />')
    
    // Replace URL placeholders with actual links
    extractedURLs.forEach((url, i) => {
      content = content.replace(
        `__URL_${i}__`,
        `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline break-all">${url}</a>`
      )
    })
    
    return content
  }, [message.content, extractedURLs])

  return (
    <>
      <div className={cn(
        "flex items-start gap-3 group relative",
        isBot && !isFirstInGroup ? "py-1" : "py-2",
        !isBot && !isTeamMember && "flex-row-reverse",
        (isTeamMember || isHumanSupport) && "flex-row",
        isSystemMessage() && "justify-center"
      )}>
        {!isSystemMessage() && (
          <>
            {showAvatar ? (
              <>
                {isAIBot && !isTyping ? (
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <radialGradient id="starGradientBubble" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
                            <stop offset="0%" stopColor="#ffffff" />
                            <stop offset="70%" stopColor="#6366f1" stopOpacity="0.9" />
                          </radialGradient>
                        </defs>
                        <path d="M50,10 C55,30 70,45 90,50 C70,55 55,70 50,90 C45,70 30,55 10,50 C30,45 45,30 50,10 Z" 
                          fill="url(#starGradientBubble)" 
                        />
                      </svg>
                    </div>
                  </div>
                ) : isHumanSupport ? (
                  <Avatar className="w-9 h-9 border bg-primary/10 ring-2 ring-primary/10 ring-offset-1">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {message.teamMemberName?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : isTeamMember ? (
                  <Avatar className="w-9 h-9 border bg-primary/10 ring-2 ring-primary/10 ring-offset-1">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {message.teamMemberName?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar className="w-9 h-9">
                    <AvatarImage
                      src="https://avataaars.io/?avatarStyle=Circle&topType=ShortHairDreads&accessoriesType=Blank&hairColor=Black&facialHairType=Blank&clotheType=Hoodie&clotheColor=Gray02&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light"
                      alt="User"
                    />
                    <AvatarFallback>
                      <User className="w-5 h-5 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </>
            ) : (
              <div className="w-6 h-6 flex-shrink-0 mt-1"></div>
            )}
          </>
        )}

        <motion.div
          initial={{ scale: 0.98, opacity: 0, y: 5 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={cn(
            "flex flex-col gap-1 max-w-[85%]",
            isBot || isTeamMember ? "items-start" : "items-end",
            isSystemMessage() && "items-center max-w-none w-full"
          )}
        >
          {isTeamMember && (
            <span className="text-xs font-medium ml-1 text-primary flex items-center gap-1">
              {message.teamMemberName}
              <span className="px-1.5 py-0.5 rounded-full text-[10px] uppercase font-semibold bg-primary/10 text-primary">
                {isHumanSupport ? "Support" : "Team"}
              </span>
            </span>
          )}

          {isSystemMessage() ? (
            <div className="text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary/50"></span>
              {message.content}
            </div>
          ) : isTransferNote ? (
            <div 
              className="rounded-2xl px-4 py-3 text-sm break-words bg-yellow-50 text-yellow-800 border border-yellow-200 shadow-sm rounded-tl-sm dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-800/50"
            >
              <div className="flex items-center gap-2 mb-1 pb-1 border-b border-yellow-200/50 dark:border-yellow-800/30">
                <span className="text-xs font-semibold uppercase tracking-wide">Transfer Note</span>
              </div>
              <div className="whitespace-pre-wrap">
                {sanitizeAndParse(message.content)}
              </div>
              {message.createdAt && (
                <div className="mt-2 text-xs opacity-70 text-right">
                  {formatDate(message.createdAt)}
                </div>
              )}
            </div>
          ) : isInternalNote ? (
            <div 
              className="rounded-2xl px-4 py-3 text-sm break-words bg-blue-50 text-blue-800 border border-blue-200 shadow-sm rounded-tl-sm dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800/50"
            >
              <div className="flex items-center gap-2 mb-2 pb-1 border-b border-blue-200/50 dark:border-blue-800/30">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span className="text-xs font-semibold uppercase tracking-wide">Internal Note</span>
                {isTeamMember && message.teamMemberName && (
                  <span className="text-xs ml-auto opacity-80">from {message.teamMemberName}</span>
                )}
              </div>
              <div className="whitespace-pre-wrap">
                {sanitizeAndParse(formatNoteContent(message.content))}
              </div>
              {message.createdAt && (
                <div className="mt-2 text-xs opacity-70 text-right">
                  {formatDate(message.createdAt)}
                </div>
              )}
            </div>
          ) : (
            <div
              className={cn(
                "max-w-[85%] py-3 px-4 rounded-2xl break-words flex flex-col gap-1",
                isBot && isFirstInGroup && "rounded-bl-md",
                isBot && isMiddleMessage && "rounded-l-md",
                isBot && isLastInGroup && "rounded-tl-md",
                !isBot && "rounded-tr-sm"
              )}
              style={isBot ? 
                { backgroundColor: '#f1f5f9', 
                  color: textColor || '#374151' } : 
                { backgroundColor: themeColor || '#6366F1', color: '#FFFFFF' }
              }
            >
              {/* Intro text */}
              {introLines.length > 0 && (
                <div className="whitespace-pre-wrap">
                  {sanitizeAndParse(introLines.join('\n'))}
                </div>
              )}

              {/* If no intro/outro lines, show full content */}
              {!introLines.length && !outroLines.length && (
                <div className="whitespace-pre-wrap">
                  <div dangerouslySetInnerHTML={{ __html: processedContent }} />
                </div>
              )}

              {/* Render link if present */}
              {hasLink && link && (
                <a 
                  href={link.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={cn(
                    "block mt-2 p-3 rounded-md transition-colors",
                    isBot || isTeamMember 
                      ? "bg-background hover:bg-background/80 border border-border/50" 
                      : "bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground"
                  )}
                >
                  <p className="font-medium text-sm">
                    {link.title}
                  </p>
                  {link.description && (
                    <p className="text-xs mt-1 opacity-80">{link.description}</p>
                  )}
                </a>
              )}

              {/* Product boxes */}
              {hasProducts && productsEnabled && message.products && (
                <div className="space-y-2 mt-2">
                  {message.products.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => {
                        console.log("Selected product from bubble:", product);
                        console.log("Product URL from bubble:", product.productUrl);
                        setSelectedProduct(product);
                        setShowProductPreview(true);
                      }}
                      className="w-full flex items-center gap-3 p-2 rounded-lg bg-background/80 hover:bg-background transition-colors text-left border border-border/50"
                    >
                      <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted shrink-0">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{product.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold">
                            ${product.hasDiscount && product.discountedPrice
                              ? product.discountedPrice.toFixed(2)
                              : product.price.toFixed(2)}
                          </p>
                          {product.hasDiscount && product.discountedPrice && (
                            <p className="text-xs line-through opacity-70">
                              ${product.price.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* Outro text */}
              {outroLines.length > 0 && (
                <div className="whitespace-pre-wrap mt-2">
                  {sanitizeAndParse(outroLines.join('\n'))}
                </div>
              )}
            </div>
          )}
          
          {/* Show timestamp */}
          {message.createdAt && !isSystemMessage() && !isNote && showTimestamp && (
            <div className="text-[10px] text-muted-foreground opacity-70 pt-1 px-1">
              {formatDate(message.createdAt)}
            </div>
          )}
        </motion.div>
      </div>
      
      {selectedProduct && (
        <ProductPreview
          product={selectedProduct}
          isOpen={showProductPreview}
          onClose={() => setShowProductPreview(false)}
        />
      )}
    </>
  )
}

Bubble.displayName = 'Bubble'

export default Bubble