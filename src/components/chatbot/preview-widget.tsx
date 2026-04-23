'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Avatar, AvatarFallback } from '../ui/avatar'
import Image from 'next/image'
import { BOT_TABS_MENU } from '@/constants/menu'
import { cn } from '@/lib/utils'
import { X, Minus, Eye, ArrowLeft, Expand } from 'lucide-react'
import HomeTab, { HomeLayoutStyle } from './home'
import { BotIcons, BotIconType } from '@/icons/bot-icons'
import Accordion from '../accordian'
import { UsageStatus } from './usage-status'

type ChatBotConfig = {
  id?: string
  welcomeMessage?: string
  icon?: string
  textColor?: string
  background?: string
  themeColor?: string
  helpDeskColor?: string
  titleColor?: string
  homeTitle?: string
  iconColor?: string
  iconStyle?: string
  inquiryMode?: boolean
  productsEnabled?: boolean
  customLinksEnabled?: boolean
  popularTopicsEnabled?: boolean
  popularTopics?: string
  homeLayout?: HomeLayoutStyle
  feedbackEnabled?: boolean
  feedbackQuestion?: string
  feedbackYesText?: string
  feedbackNoText?: string
  feedbackFollowUp?: string
}

type Props = {
  domainName: string
  chatBot?: ChatBotConfig
  products?: any[]
  helpdesk?: any[]
  customLinks?: {
    id: string
    title: string
    description?: string
    url: string
  }[]
  domainIcon?: string | null
  domainId?: string
}

const ChatbotPreviewWidget = ({ 
  domainName, 
  chatBot, 
  products = [], 
  helpdesk = [],
  customLinks = [],
  domainIcon,
  domainId
}: Props) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const [isChatActive, setIsChatActive] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedFaq, setSelectedFaq] = useState<any>(null)
  const [feedbackState, setFeedbackState] = useState<{[key: string]: 'yes' | 'no' | null}>({})
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<{[key: string]: boolean}>({})
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  console.log("selectedFaq", selectedFaq)
  // Parse popular topics from JSON string
  const parsePopularTopics = (topicsString?: string) => {
    if (!topicsString) return []
    try {
      return JSON.parse(topicsString)
    } catch {
      return []
    }
  }
  console.log("chatBot", chatBot)
  // Memoize styling values with defaults to ensure reactivity
  const stylingConfig = useMemo(() => ({
    themeColor: chatBot?.themeColor || '#6366f1',
    textColor: chatBot?.textColor || '#1F2937',
    titleColor: chatBot?.titleColor || '#1F2937',
    iconColor: chatBot?.iconColor || '#6366F1',
    theme: chatBot?.background || '#ffffff',
    productsEnabled: chatBot?.productsEnabled ?? true,
    customLinksEnabled: chatBot?.customLinksEnabled ?? false,
    popularTopicsEnabled: chatBot?.popularTopicsEnabled ?? true,
    popularTopics: parsePopularTopics(chatBot?.popularTopics),
    iconStyle: (chatBot?.iconStyle as BotIconType) || 'Default',
    inquiryMode: chatBot?.inquiryMode || false,
    homeLayout: (chatBot?.homeLayout as any) || 'classic'
  }), [chatBot])



  // Extract values from config
  const { 
    themeColor, 
    textColor, 
    titleColor, 
    iconColor, 
    theme, 
    productsEnabled, 
    customLinksEnabled,
    popularTopicsEnabled,
    popularTopics,
    iconStyle, 
    inquiryMode,
    homeLayout
  } = stylingConfig

  // Format domain name for display
  const displayName = domainName.split('.com')[0].charAt(0).toUpperCase() + domainName.split('.com')[0].slice(1)

  // Get the selected icon component (memoized for performance)
  const SelectedIcon = useMemo(() => BotIcons[iconStyle], [iconStyle])

  const filteredTabs = useMemo(() => 
    BOT_TABS_MENU.filter(tab => productsEnabled || tab.label !== 'products'), 
    [productsEnabled]
  )

  // Reset active tab if products tab is no longer available
  useEffect(() => {
    if (activeTab === 'products' && !productsEnabled) {
      setActiveTab('home')
    }
  }, [activeTab, productsEnabled])

  // Helper function to render navigation based on layout style
  const renderNavigation = () => {
    switch (homeLayout) {
      case 'modern':
        return (
          <div className="px-6 py-4 border-b border-gray-100/50">
            <div className="grid grid-cols-3 gap-3">
              {filteredTabs.map((tab, index) => (
                <button
                  key={index}
                  onClick={() => handleTabClick(tab.label)}
                  className={cn(
                    "flex flex-col items-center gap-2 py-4 px-2 rounded-2xl transition-all duration-300 relative overflow-hidden group",
                    activeTab === tab.label
                      ? "text-white transform scale-105"
                      : "text-gray-600 hover:text-gray-800 bg-white/50 hover:bg-white border border-gray-200/30"
                  )}
                  style={activeTab === tab.label ? {
                    background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`,
                    boxShadow: `0 8px 25px ${themeColor}30`
                  } : {}}
                >
                  <div 
                    className={cn(
                      "transition-all duration-300 p-2 rounded-xl",
                      activeTab === tab.label 
                        ? "bg-white/20 backdrop-blur-sm" 
                        : "bg-gray-100 group-hover:bg-gray-200"
                    )}
                  >
                    <div 
                      className="transition-colors duration-200"
                      style={{
                        color: activeTab === tab.label ? 'white' : themeColor
                      }}
                    >
                      {tab.icon}
                    </div>
                  </div>

                  {activeTab === tab.label && (
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 'compact':
        return (
          <div className="border-b border-gray-200">
            <div className="flex">
              {filteredTabs.map((tab, index) => (
                <button
                  key={index}
                  onClick={() => handleTabClick(tab.label)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 px-2 transition-all duration-200 relative",
                    activeTab === tab.label
                      ? "text-gray-900 font-medium"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                  style={activeTab === tab.label ? {
                    color: themeColor
                  } : {}}
                >
                  <div className="transition-colors duration-200">
                    {tab.icon}
                  </div>

                  {activeTab === tab.label && (
                    <div 
                      className="absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-200"
                      style={{ background: themeColor }}
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
                    style={activeTab === tab.label ? { backgroundColor: `${themeColor}15` } : {}}
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
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex justify-between items-center bg-gray-50 rounded-full p-1.5 shadow-sm">
              {filteredTabs.map((tab, index) => (
                <button
                  key={index}
                  onClick={() => handleTabClick(tab.label)}
                  className={cn(
                    "flex items-center gap-2 py-2 px-4 rounded-full transition-all duration-200",
                    activeTab === tab.label
                      ? "bg-white shadow-md text-gray-800"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-100/50"
                  )}
                >
                  <div 
                    className="transition-colors duration-200"
                    style={{
                      color: activeTab === tab.label ? themeColor : '#4B5563'
                    }}
                  >
                    {tab.icon}
                  </div>

                </button>
              ))}
            </div>
          </div>
        );
    }
  };

  const handleStartChat = () => {
    setActiveTab('chat')
    setIsChatActive(true)
  }

  const handleBackToHome = () => {
    setActiveTab('home')
    setIsChatActive(false)
  }

  const handleTabClick = (tabLabel: string) => {
    if (tabLabel === 'chat') {
      handleStartChat()
    } else {
      setActiveTab(tabLabel)
      setIsChatActive(false)
    }
  }

  const handleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  const handleFaqClick = (faq: any) => {
    setSelectedFaq(faq)
    setIsExpanded(true) // Auto-expand when viewing FAQ detail
  }

  const handleBackFromFaq = () => {
    setSelectedFaq(null)
    setIsExpanded(false) // Return to normal size
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

  return (
    <div 
      key={`preview-${JSON.stringify({...stylingConfig, homeLayout})}`}
      className="fixed bottom-6 right-6 z-50"
    >
      {/* Preview indicator badge */}
      <div className="absolute -top-8 -left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
        <Eye className="w-3 h-3" />
        Preview
      </div>

      {/* Chatbot Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
          style={{ backgroundColor: iconColor }}
        >
            <SelectedIcon color="white" />
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div className={cn(
          "flex flex-col bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden transition-all duration-300",
          isMinimized ? 
            "h-[48px] w-[250px]" : 
            isExpanded ?
              "h-[80vh] w-[60vw] max-w-[800px] max-h-[900px]" :
              "h-[600px] w-[400px]"
        )}>
          {/* Header */}
          <div className={cn(
            "flex justify-between items-center px-6 border-b transition-all duration-300 bg-white",
            isMinimized ? "py-1 border-transparent" : "p-2 border-gray-100"
          )}>
            <div className="flex gap-3 items-center">
              <div className={cn(
                "transition-all duration-300 flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center",
                isMinimized ? "w-8 h-8" : "w-12 h-12"
              )}
              style={{ 
                backgroundColor: domainIcon ? 'transparent' : iconColor
              }}>
                {domainIcon ? (
                  <Image
                    src={`https://ucarecdn.com/${domainIcon}/`}
                    alt="Company Logo"
                    width={isMinimized ? 32 : 48}
                    height={isMinimized ? 32 : 48}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <SelectedIcon 
                    className={cn(
                      isMinimized ? "w-4 h-4" : "w-6 h-6"
                    )} 
                    color="white"
                  />
                )}
              </div>
              <div className="flex items-start flex-col justify-center">
                <h3 className={cn(
                  "font-bold leading-none transition-all duration-300",
                  isMinimized ? "text-base" : "text-lg"
                )}
                style={{ color: titleColor }}>
                  {displayName}
                </h3>
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
                onClick={() => setIsMinimized(!isMinimized)}
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
                      onClick={() => setIsOpen(false)}
                      className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {!isMinimized && (
            <>
              {!inquiryMode && !isChatActive && !selectedFaq && homeLayout !== 'helpdesk' && renderNavigation()}

              {/* Content Area */}
              <div className="flex-1 overflow-hidden">
                {/* Usage Status Alert */}
                <div className="px-4 pt-3">
                  <UsageStatus compact={true} className="mb-2" />
                </div>
                
                {inquiryMode ? (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: titleColor }}>Contact Form Mode</h3>
                    <p className="text-sm text-gray-600">
                      Visitors will see a contact form instead of the chat interface.
                    </p>
                  </div>
                ) : (
                  <>
                    {activeTab === 'home' && (
                      <div className="h-full">
                        <HomeTab 
                          themeColor={themeColor}
                          textColor={textColor}
                          titleColor={titleColor}
                          homeTitle={chatBot?.homeTitle || 'Welcome to Support'}
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
                          popularTopics={popularTopics}
                          homeLayout={homeLayout}
                        />
                      </div>
                    )}

                    {activeTab === 'chat' && (
                      <div className="h-full flex flex-col">
                        {/* Chat Messages Area */}
                        <div 
                          className="flex-1 overflow-y-auto p-6"
                          style={{ background: theme || '#ffffff' }}
                        >
                          {/* Powered by text */}
                          <div className="flex justify-center items-center">
                            <p className="text-[10px]" style={{ color: `${textColor || '#6b7280'}80` }}>
                              Powered by <span style={{ color: themeColor || '#6366f1' }}>Brief Support</span>
                            </p>
                          </div>
                          {/* Welcome Messages */}
                        {(() => {
                          // Parse greeting messages - could be JSON array or single string
                          const parseGreetingMessages = (welcomeMessage: string | undefined | null): string[] => {
                            if (!welcomeMessage) {
                              return ['Hey there, have a question? Text us here'];
                            }
                            
                            try {
                              const parsed = JSON.parse(welcomeMessage);
                              if (Array.isArray(parsed) && parsed.length > 0) {
                                return parsed.filter(msg => typeof msg === 'string' && msg.trim().length > 0);
                              }
                            } catch (e) {
                              // Not JSON, treat as single message
                            }
                            
                            return [welcomeMessage];
                          };

                          const greetingMessages = parseGreetingMessages(chatBot?.welcomeMessage);
                          
                          return greetingMessages.map((message, index) => {
                            const isFirstMessage = index === 0;
                            const isLastMessage = index === greetingMessages.length - 1;
                            const isMiddleMessage = !isFirstMessage && !isLastMessage;
                            const showIcon = isFirstMessage;
                            const showTime = greetingMessages.length === 1 || isLastMessage;
                            
                            return (
                              <div key={index} className={`flex items-start gap-3 ${index > 0 ? 'mt-1' : 'mt-3'}`}>
                                {/* Bot Avatar - only show on first message */}
                                <div className="flex-shrink-0 mt-1">
                                  {showIcon ? (
                                    <div className="w-6 h-6 flex items-center justify-center overflow-hidden rounded-full">
                                      {domainIcon ? (
                                        <Image
                                          src={`https://ucarecdn.com/${domainIcon}/`}
                                          alt="Company Logo"
                                          width={24}
                                          height={24}
                                          className="w-full h-full object-cover rounded-full"
                                        />
                                      ) : (
                                        <svg width="16" height="16" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                          <defs>
                                            <radialGradient id={`starGradientPreview-${index}`} cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
                                              <stop offset="0%" stopColor="#ffffff" />
                                              <stop offset="70%" stopColor="#6366f1" stopOpacity="0.9" />
                                            </radialGradient>
                                          </defs>
                                          <path d="M50,10 C55,30 70,45 90,50 C70,55 55,70 50,90 C45,70 30,55 10,50 C30,45 45,30 50,10 Z" 
                                            fill={`url(#starGradientPreview-${index})`} 
                                          />
                                        </svg>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="w-6 h-6"></div>
                                  )}
                                </div>
                                
                                {/* Message Bubble */}
                                <div className="max-w-[85%]">
                                  <div 
                                    className={`px-4 py-3 rounded-2xl ${
                                      isFirstMessage ? 'rounded-bl-md' : 
                                      isMiddleMessage ? 'rounded-l-md' :
                                      isLastMessage ? 'rounded-tl-md' : 
                                      'rounded-md'
                                    }`}
                                    style={{ 
                                      backgroundColor: '#f1f5f9',
                                      color: textColor || '#374151'
                                    }}
                                  >
                                    <p className="text-sm whitespace-pre-wrap">{message}</p>
                                  </div>
                                  {/* Show timing indicator only on last message for multiple messages */}
                                  {showTime && greetingMessages.length > 1 && (
                                    <div className="text-xs text-gray-400 mt-1 pl-1">
                                      {index === 0 ? 'Immediately' : `After ${index} second${index > 1 ? 's' : ''}`}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          });
                        })()}
                        </div>

                        {/* Chat Input Area (Disabled) */}
                        <div 
                          className="border-t border-gray-200 p-4"
                          style={{ background: theme || '#ffffff' }}
                        >
                          <div className="flex gap-3 items-center">
                            <div className="flex-1 relative">
                              <input
                                type="text"
                                placeholder="Type your message..."
                                disabled
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed text-sm focus:outline-none"
                              />
                            </div>
                            <button
                              disabled
                              className="p-3 rounded-xl text-white cursor-not-allowed"
                              style={{ backgroundColor: themeColor || '#6366f1' }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m22 2-7 20-4-9-9-4Z"/>
                                <path d="M22 2 11 13"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'helpdesk' && (
                      <>
                        {selectedFaq ? (
                          /* FAQ Detail View */
                          <div className="h-full flex flex-col bg-white">
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
                          <div className="h-full flex flex-col bg-white">
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
                                      key={desk.id || index}
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

                    {activeTab === 'products' && productsEnabled && (
                      <div className="h-full flex items-center justify-center bg-gray-50">
                        <div className="text-center p-6">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${themeColor}15` }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={themeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                              <path d="M3 6h18"/>
                              <path d="M16 10a4 4 0 0 1-8 0"/>
                            </svg>
                          </div>
                          <h3 className="font-semibold mb-2" style={{ color: titleColor }}>Products</h3>
                          <p className="text-sm text-gray-600">Product catalog ({products.length} items)</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Bottom Navigation for Helpdesk Layout */}
              {!inquiryMode && !isChatActive && !selectedFaq && homeLayout === 'helpdesk' && renderNavigation()}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default ChatbotPreviewWidget 