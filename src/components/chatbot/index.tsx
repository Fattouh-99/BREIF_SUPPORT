'use client'
import { useChatBot } from '@/hooks/chatbot/use-chatbot'
import React, { useMemo, useCallback, useState, useEffect } from 'react'
import { BotWindow } from './window'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { BotIcons, BotIconType } from '@/icons/bot-icons'
import { HomeLayoutStyle } from './home'
import '../../styles/chatbot-animations.css'

interface Props {
  isPublic?: boolean;
}

const AiChatBot = ({ isPublic = false }: Props) => {
  // Always override isPublic to true when in chatbot context
  // This ensures the chatbot can be used even during maintenance mode
  const effectiveIsPublic = true;
  
  const {
    onOpenChatBot,
    botOpened,
    onChats,
    register,
    onStartChatting,
    onAiTyping,
    messageWindowRef,
    currentBot,
    currentBotId,
    onRealTime, 
    setOnChats,
    errors,
    resetChatState,
    handleMinimize,
  } = useChatBot({ isPublic: effectiveIsPublic })
  
  const [isButtonAnimating, setIsButtonAnimating] = useState(false)
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 })
  const [isMounted, setIsMounted] = useState(false)
  const [isWindowAnimating, setIsWindowAnimating] = useState(false)
  const [windowAnimationState, setWindowAnimationState] = useState<'closed' | 'opening' | 'open' | 'closing'>('closed')
  const [isWindowExpanded, setIsWindowExpanded] = useState(false)
  
  // Register this component as a chatbot iframe to bypass maintenance restrictions
  useEffect(() => {
    // Identify as a chatbot in localStorage to help with detection
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('is_chatbot_frame', 'true');
      
      // Set data attribute on html element for easier CSS targeting
      document.documentElement.setAttribute('data-chatbot-frame', 'true');
      
      // Force light theme for chatbot iframe - remove dark class if present
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      
      // Override theme provider by setting localStorage to light theme
      window.localStorage.setItem('theme', 'light');
      
      // Prevent theme changes by overriding the theme change handler
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = function(key, value) {
        if (key === 'theme' && value === 'dark') {
          return; // Block dark theme setting
        }
        return originalSetItem.call(this, key, value);
      };
      
      // Detect Safari and add specific attribute
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      if (isSafari) {
        document.documentElement.setAttribute('data-safari', 'true');
      }
      
      // Set mounted with slight delay to ensure the DOM is fully painted
      // This prevents the Safari flash issue
      setTimeout(() => {
        setIsMounted(true);
      }, 100);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('is_chatbot_frame');
        document.documentElement.removeAttribute('data-chatbot-frame');
        document.documentElement.removeAttribute('data-safari');
        // Don't restore dark theme on cleanup as this component is unmounting
      }
    };
  }, []);

  // Handle smooth transitions for window opening/closing
  useEffect(() => {
    if (botOpened && (windowAnimationState === 'closed' || windowAnimationState === 'closing')) {
      setIsWindowAnimating(true);
      setWindowAnimationState('opening');
      
      // Trigger opening animation
      const openingTimer = setTimeout(() => {
        setWindowAnimationState('open');
        setIsWindowAnimating(false);
      }, 350); // Match CSS transition duration
      
      return () => clearTimeout(openingTimer);
    } else if (!botOpened && (windowAnimationState === 'open' || windowAnimationState === 'opening')) {
      setIsWindowAnimating(true);
      setWindowAnimationState('closing');
      
      // Trigger closing animation
      const closingTimer = setTimeout(() => {
        setWindowAnimationState('closed');
        setIsWindowAnimating(false);
      }, 350); // Match CSS transition duration
      
      return () => clearTimeout(closingTimer);
    }
  }, [botOpened, windowAnimationState]);

  const getValidIconStyle = useCallback((style: string | null | undefined): BotIconType => {
    return (style && Object.keys(BotIcons).includes(style)) 
      ? style as BotIconType 
      : 'Default';
  }, []);

  const renderBotIcon = useCallback(() => {
    const iconStyle = getValidIconStyle(currentBot?.chatBot?.iconStyle);
    const IconComponent = BotIcons[iconStyle];
    return <IconComponent className="w-8 h-8" color="white" />;
  }, [currentBot?.chatBot?.iconStyle, getValidIconStyle]);

  const handleClose = useCallback(() => {
    if (isWindowAnimating) return; // Prevent multiple clicks during animation
    onOpenChatBot();
  }, [onOpenChatBot, isWindowAnimating]);

  const handleWindowExpand = useCallback((expanded: boolean) => {
    setIsWindowExpanded(expanded);
  }, []);

  const handleButtonClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (isButtonAnimating || isWindowAnimating) return; // Prevent multiple clicks during animation
    
    if (!botOpened) {
      const buttonRect = e.currentTarget.getBoundingClientRect();
      setButtonPosition({
        x: buttonRect.left + buttonRect.width / 2,
        y: buttonRect.top + buttonRect.height / 2
      });
    }
    
    setIsButtonAnimating(true);
    
    // Smooth button animation
      setTimeout(() => {
        onOpenChatBot();
      setTimeout(() => setIsButtonAnimating(false), 300);
    }, 150);
  }, [botOpened, onOpenChatBot, isButtonAnimating, isWindowAnimating]);

  // Check for incorrect welcome message
  React.useEffect(() => {
    if (onChats.length > 0 && 
        onChats[0].role === 'assistant' && 
        onChats[0].content.includes('email address') && 
        onChats[0].content.includes('live support')) {
      resetChatState();
    }
  }, [onChats, resetChatState]);

  const botWindowProps = useMemo(() => {
    return {
      errors,
      setChat: setOnChats,
      realtimeMode: onRealTime && onRealTime.chatroom && onRealTime.mode !== undefined ? {
        chatroom: onRealTime.chatroom,
        mode: onRealTime.mode,
        supportAgent: onRealTime.supportAgent
      } : undefined,
      helpdesk: currentBot?.helpdesk || [],
      domainName: currentBot?.name || '',
      help: currentBot?.chatBot?.helpdesk,
      theme: currentBot?.chatBot?.background,
      textColor: currentBot?.chatBot?.textColor,
      themeColor: currentBot?.chatBot?.themeColor,
      helpDeskColor: currentBot?.chatBot?.helpDeskColor,
      titleColor: currentBot?.chatBot?.titleColor,
      homeTitle: currentBot?.chatBot?.homeTitle,
      homeLayout: (currentBot?.chatBot?.homeLayout as HomeLayoutStyle) || 'classic',
      iconColor: currentBot?.chatBot?.iconColor,
      iconStyle: getValidIconStyle(currentBot?.chatBot?.iconStyle),
      chats: onChats,
      register,
      onChat: onStartChatting,
      onResponding: onAiTyping,
      filterQuestions: currentBot?.filterQuestions || [],
      onClose: handleClose,
      onMinimize: handleMinimize,
      onExpand: handleWindowExpand,
      products: currentBot?.products || [],
      productsEnabled: currentBot?.chatBot?.productsEnabled,
      customLinks: currentBot?.chatBot?.customLinks?.map(link => ({
        id: link.id,
        title: link.title,
        description: link.description || undefined,
        url: link.url
      })) || [],
      customLinksEnabled: currentBot?.chatBot?.customLinksEnabled || false,
      popularTopicsEnabled: currentBot?.chatBot?.popularTopicsEnabled || true,
      popularTopics: currentBot?.chatBot?.popularTopics || undefined,
      buttonPosition,
      inquiryMode: currentBot?.chatBot?.chatbotEnabled,
      domainId: currentBotId || undefined,
      domainIcon: currentBot?.chatBot?.icon,
      chatBot: {
        feedbackEnabled: currentBot?.chatBot?.feedbackEnabled,
        feedbackQuestion: currentBot?.chatBot?.feedbackQuestion,
        feedbackYesText: currentBot?.chatBot?.feedbackYesText,
        feedbackNoText: currentBot?.chatBot?.feedbackNoText,
        feedbackFollowUp: currentBot?.chatBot?.feedbackFollowUp,
      },
      windowAnimationState,
    };
  }, [
    errors, setOnChats, onRealTime, currentBot, getValidIconStyle,
    onChats, register, onStartChatting, onAiTyping, handleClose, handleMinimize,
    buttonPosition, currentBot?.chatBot?.chatbotEnabled, currentBot?.chatBot?.productsEnabled, 
    currentBot?.chatBot?.customLinksEnabled, currentBot?.chatBot?.popularTopicsEnabled, 
    currentBot?.chatBot?.homeLayout, currentBotId, windowAnimationState
  ]);

  const buttonStyles = useMemo(() => ({
    backgroundColor: currentBot?.chatBot?.iconColor || '#6366F1',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden' as const,
    margin: '10px',
    pointerEvents: 'auto' as const,
  }), [currentBot?.chatBot?.iconColor]);

  const windowContainerStyles = useMemo(() => ({
    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden' as const,
    willChange: 'transform, opacity',
    overflow: isWindowExpanded ? 'visible' : 'hidden',
    pointerEvents: 'auto' as const,
  }), [isWindowExpanded]);

  if (!currentBot || !isMounted) return null;

  // Check if bot has error message (domain deleted/deactivated)
  const isBotUnavailable = onChats.length === 1 && 
    onChats[0].role === 'assistant' && 
    onChats[0].content.includes('no longer available');

  // Determine if window should be visible
  const shouldShowWindow = windowAnimationState !== 'closed';

  return (
    <div className="h-screen w-screen flex flex-col justify-end items-end gap-4">
      {shouldShowWindow && (
        <div 
          className={cn(
            "max-sm:h-[100%] max-sm:w-[100%] max-sm:fixed max-sm:left-0 max-sm:top-0 max-sm:right-0 max-sm:bottom-0 max-sm:z-50 rounded-2xl",
            // Dynamically size the wrapper so the inner chatbot isn't clipped
            isWindowExpanded
              ? "h-[80vh] w-[60vw] max-w-[800px] max-h-[900px]"
              : "h-[670px] w-[450px]",
            messageWindowRef.current?.classList.contains('minimized') ? "minimized-container" : "",
            // Animation classes based on state
            windowAnimationState === 'opening' && "chatbot-entering",
            windowAnimationState === 'open' && "opacity-100 scale-100 translate-y-0",
            windowAnimationState === 'closing' && "chatbot-exiting"
          )}
          data-expanded={isWindowExpanded ? 'true' : 'false'}
          style={{
            ...windowContainerStyles,
            boxShadow: "0 20px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)"
          }}
        >
          {isBotUnavailable ? (
            <div className="bg-white dark:bg-slate-800 h-full w-full flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 mb-4 text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Chatbot Unavailable</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {onChats[0].content}
              </p>
              <button 
                onClick={handleClose}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <BotWindow
              {...botWindowProps}
              ref={messageWindowRef}
            />
          )}
        </div>
      )}
      {!botOpened && !isBotUnavailable && (
        <button
          onClick={handleButtonClick}
          className={cn(
            "chatbot-button rounded-full p-4 transition-all duration-300 ease-out",
            isButtonAnimating ? "chatbot-button-animate scale-95 chatbot-shadow-strong" : "hover:scale-105 chatbot-shadow-medium active:scale-95",
            isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
          style={{
            ...buttonStyles,
            boxShadow: isButtonAnimating 
              ? "0 8px 25px rgba(0,0,0,0.15)" 
              : "0 4px 20px rgba(0,0,0,0.1)"
          }}
          aria-label="Open chat support"
          disabled={isButtonAnimating || isWindowAnimating}
        >
          <div className={cn(
            "relative transition-all duration-300 ease-out chatbot-element",
            isButtonAnimating ? "scale-90 rotate-6" : ""
          )}>
            {currentBot.chatBot?.icon ? (
              <Image
                src={`https://ucarecdn.com/${currentBot.chatBot.icon}/`}
                alt="Support chat bot"
                width={60}
                height={60}
                className="transition-transform duration-300 ease-out"
                loading="lazy"
              />
            ) : (
              renderBotIcon()
            )}
          </div>
        </button>
      )}
    </div>
  )
}

export default React.memo(AiChatBot)
