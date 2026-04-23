import { Diamond, MessageSquare, LayoutGrid, Grid3X3, Layers, Zap, Search, ExternalLink, ChevronRight, Home, Mail, HelpCircle } from 'lucide-react'
import React from 'react'
import Image from 'next/image'

type PopularTopic = {
  id: string
  title: string
  linkType: 'helpdesk_general' | 'helpdesk_specific' | 'external_url'
  linkTarget?: string
}

export type HomeLayoutStyle = 'classic' | 'modern' | 'compact' | 'helpdesk'

type Props = {
  onStartChat: () => void
  onOpenHelpDesk: () => void
  onOpenSpecificHelpDeskQuestion?: (questionId: string) => void
  onViewProducts?: () => void
  hasProducts?: boolean
  themeColor?: string
  textColor?: string
  titleColor?: string
  homeTitle?: string
  domainIcon?: string | null
  customLinks?: {
    id: string
    title: string
    description?: string
    url: string
  }[]
  customLinksEnabled?: boolean
  popularTopicsEnabled?: boolean
  popularTopics?: PopularTopic[]
  homeLayout?: HomeLayoutStyle
}

const HomeTab = ({
  onStartChat,
  onOpenHelpDesk,
  onOpenSpecificHelpDeskQuestion,
  onViewProducts,
  hasProducts,
  themeColor = '#6366f1',
  textColor = '#374151',
  titleColor = '#1F2937',
  homeTitle = 'Welcome to Support',
  domainIcon,
  customLinks = [],
  customLinksEnabled = false,
  popularTopicsEnabled = true,
  popularTopics = [],
  homeLayout = 'classic'
}: Props) => {
  console.log("HomeTab props:", { 
    customLinks, 
    customLinksEnabled,
    popularTopics,
    popularTopicsEnabled,
    homeLayout,
    homeLayoutType: typeof homeLayout
  });
  
  // Add helper function to handle popular topic clicks
  const handlePopularTopicClick = (topic: PopularTopic) => {
    switch (topic.linkType) {
      case 'helpdesk_general':
        onOpenHelpDesk()
        break
      case 'helpdesk_specific':
        if (topic.linkTarget && onOpenSpecificHelpDeskQuestion) {
          onOpenSpecificHelpDeskQuestion(topic.linkTarget)
        } else {
          onOpenHelpDesk()
        }
        break
      case 'external_url':
        if (topic.linkTarget) {
          window.open(topic.linkTarget, '_blank', 'noopener,noreferrer')
        }
        break
      default:
        onOpenHelpDesk()
    }
  }

  // Collect all action items
  const actionItems = [
    ...(hasProducts && onViewProducts ? [{
      id: 'products',
      title: 'Products',
      description: 'Browse our products and services',
      icon: <LayoutGrid className="w-4 h-4" />,
      action: onViewProducts,
      type: 'button' as const
    }] : []),
    ...(customLinksEnabled && customLinks ? customLinks
      .filter(link => link.title && link.url)
      .map(link => ({
        id: link.id,
        title: link.title,
        description: link.description || 'Visit our website for more information',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>,
        action: () => window.open(link.url, '_blank', 'noopener,noreferrer'),
        type: 'link' as const,
        url: link.url
      })) : [])
  ]

  // Render different layouts based on homeLayout prop
  switch (homeLayout) {
    case 'modern':
      return (
        <div 
          className="h-full flex flex-col overflow-y-auto bg-white"
          style={{ 
            background: `linear-gradient(135deg, ${themeColor}08, ${themeColor}02)`
          }}
        >
          {/* Modern Header - seamless design */}
          <div className="p-6">
            <div className="mb-8">
              <h1 
                className="text-2xl font-bold mb-2"
                style={{ color: titleColor }}
              >
                {homeTitle}
              </h1>
            </div>

            {/* Modern Grid Layout - connected cards */}
            {actionItems.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {actionItems.slice(0, 4).map((item, index) => (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    style={{ 
                      background: index === 0 ? themeColor : 'white',
                      border: index === 0 ? 'none' : `1px solid ${themeColor}20`,
                      color: index === 0 ? 'white' : titleColor
                    }}
                  >
                    <div className="flex flex-col items-center text-center gap-3">
                      <div 
                        className="p-3 rounded-xl"
                        style={{ 
                          background: index === 0 ? 'rgba(255,255,255,0.2)' : `${themeColor}15`
                        }}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                        <p 
                          className="text-xs opacity-80 leading-tight"
                          style={{ 
                            color: index === 0 ? 'rgba(255,255,255,0.9)' : textColor 
                          }}
                        >
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Overflow items in a connected list */}
            {actionItems.length > 4 && (
              <div className="mt-6">
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                  {actionItems.slice(4).map((item, index) => (
                    <button
                      key={item.id}
                      onClick={item.action}
                      className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div 
                        className="p-2 rounded-lg"
                        style={{ background: `${themeColor}15` }}
                      >
                        {item.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="font-medium text-sm" style={{ color: titleColor }}>{item.title}</h4>
                        <p className="text-xs" style={{ color: textColor }}>{item.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modern Popular Topics */}
          {popularTopicsEnabled && popularTopics && popularTopics.length > 0 && (
            <div className="px-6 pb-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2" style={{ color: titleColor }}>
                  Popular Topics
                </h3>
                <p className="text-sm opacity-70" style={{ color: textColor }}>
                  Quick access to frequently asked questions
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {popularTopics.map((topic, index) => (
                  <button 
                    key={topic.id || index}
                    onClick={() => handlePopularTopicClick(topic)}
                    className="group flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] text-left"
                    style={{ 
                      background: `linear-gradient(135deg, ${themeColor}08, ${themeColor}03)`,
                      border: `1px solid ${themeColor}20`,
                    }}
                  >
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ 
                        background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`,
                        color: 'white'
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                        <path d="M12 17h.01"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-base mb-1" style={{ color: titleColor }}>
                        {topic.title}
                      </h4>
                      <p className="text-sm opacity-70" style={{ color: textColor }}>
                        Get instant answers
                      </p>
                    </div>
                    <div 
                      className="opacity-40 group-hover:opacity-70 transition-opacity"
                      style={{ color: themeColor }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Modern Footer - removed CTA since chat is available in navbar */}
          <div className="mt-auto p-6">
            <div 
              className="rounded-2xl p-4 text-center" 
              style={{
                background: 'white',
                border: `1px solid ${themeColor}20`
              }}
            >
              <p className="text-sm" style={{ color: textColor }}>
                Use the navigation above to get started
              </p>
            </div>
          </div>
        </div>
      )

    case 'compact':
      return (
        <div 
          className="h-full flex flex-col overflow-y-auto bg-white"
        >
          {/* Compact Header */}
          <div className="px-6 py-6 border-b border-gray-100">
            <h1 
              className="text-xl font-bold"
              style={{ color: titleColor }}
            >
              {homeTitle}
            </h1>
          </div>

          {/* Compact Action List - connected design */}
          <div className="flex-1 p-6">
            {actionItems.length > 0 && (
              <div className="bg-gray-50 rounded-2xl overflow-hidden">
                {actionItems.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className="w-full flex items-center gap-4 p-5 hover:bg-white transition-all duration-200 group border-b border-gray-200 last:border-b-0 bg-white first:rounded-t-2xl last:rounded-b-2xl"
                  >
                    <div 
                      className="p-3 rounded-xl flex-shrink-0"
                      style={{ 
                        background: index === 0 ? `${themeColor}20` : `${themeColor}10`,
                        color: themeColor
                      }}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-medium text-base" style={{ color: titleColor }}>{item.title}</h3>
                      <p className="text-sm opacity-70" style={{ color: textColor }}>{item.description}</p>
                    </div>
                    <div className="opacity-30 group-hover:opacity-60 transition-opacity">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Compact Popular Topics */}
            {popularTopicsEnabled && popularTopics && popularTopics.length > 0 && (
              <div className="mt-8">
                <div className="mb-4">
                  <h3 className="text-base font-semibold mb-1" style={{ color: titleColor }}>
                    Popular Topics
                  </h3>
                  <p className="text-xs opacity-70" style={{ color: textColor }}>
                    Quick help topics
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {popularTopics.slice(0, 4).map((topic, index) => (
                    <button 
                      key={topic.id || index}
                      onClick={() => handlePopularTopicClick(topic)}
                      className="group flex items-center gap-3 p-3 rounded-lg transition-all duration-300 text-left hover:shadow-md hover:scale-[1.01]"
                      style={{ 
                        background: `linear-gradient(135deg, ${themeColor}06, ${themeColor}02)`,
                        border: `1px solid ${themeColor}15`
                      }}
                    >
                      <div 
                        className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                        style={{ 
                          background: themeColor,
                          color: 'white'
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm" style={{ color: titleColor }}>
                          {topic.title}
                        </h4>
                      </div>
                      <div 
                        className="opacity-30 group-hover:opacity-60 transition-opacity"
                        style={{ color: themeColor }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 18l6-6-6-6"/>
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Compact Footer */}
          <div className="p-6 border-t border-gray-100">
            <button
              onClick={onStartChat}
              className="w-full py-4 rounded-xl font-medium text-base transition-all duration-200 hover:shadow-lg"
              style={{ 
                background: themeColor,
                color: 'white'
              }}
            >
              Start New Conversation
            </button>
          </div>
        </div>
      )

    case 'helpdesk':
      return (
        <div className="h-full flex flex-col overflow-y-auto bg-white">
          {/* Header with gradient background - seamless design */}
          <div 
            className="px-6 py-8 text-white relative"
            style={{
              background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`
            }}
          >
            <h1 className="text-2xl font-semibold mb-6">
              {homeTitle || 'Hi, how can we help?'}
            </h1>
            
            {/* Search Input - integrated design */}
            <div className="relative">
              <input
                type="text"
                placeholder="Ask a question"
                className="w-full px-5 py-4 rounded-2xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 shadow-lg border-0 text-base"
                onClick={() => onStartChat()}
                readOnly
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Search className="w-4 h-4 text-gray-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Content Area - seamless connection */}
          <div className="flex-1 bg-white -mt-4 rounded-t-3xl relative z-10">
            {/* Action Items - connected design */}
            <div className="pt-6 px-6">
              {actionItems.length > 0 && (
                <div className="space-y-0 bg-gray-50 rounded-2xl overflow-hidden">
                  {actionItems.slice(0, 6).map((item, index) => (
                    <button
                      key={item.id}
                      onClick={item.action}
                      className="w-full flex items-center justify-between p-5 hover:bg-white transition-all duration-200 group border-b border-gray-200 last:border-b-0 bg-white first:rounded-t-2xl last:rounded-b-2xl"
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
                          style={{ 
                            backgroundColor: `${themeColor}15`,
                            color: themeColor 
                          }}
                        >
                          {item.icon}
                        </div>
                        <span 
                          className="font-medium text-left text-base"
                          style={{ color: titleColor }}
                        >
                          {item.title}
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Popular Topics - integrated section */}
            {popularTopicsEnabled && popularTopics && popularTopics.length > 0 && (
              <div className="px-6 py-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2" style={{ color: titleColor }}>
                    Popular Topics
                  </h3>
                  <p className="text-sm opacity-70" style={{ color: textColor }}>
                    Browse frequently asked questions
                  </p>
                </div>
                <div className="space-y-3">
                  {popularTopics.slice(0, 4).map((topic, index) => (
                    <button 
                      key={topic.id || index}
                      onClick={() => handlePopularTopicClick(topic)}
                      className="group w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 text-left hover:shadow-lg hover:scale-[1.01]"
                      style={{ 
                        background: `linear-gradient(135deg, ${themeColor}08, ${themeColor}03)`,
                        border: `1px solid ${themeColor}20`
                      }}
                    >
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ 
                          background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`,
                          color: 'white'
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 11H5a2 2 0 0 0-2 2v3c0 1.1.9 2 2 2h2l3 3V8l-3 3z"/>
                          <path d="M22 4H12a2 2 0 0 0-2 2v5h10l4-4V6a2 2 0 0 0-2-2z"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-base mb-1" style={{ color: titleColor }}>
                          {topic.title}
                        </h4>
                        <p className="text-sm opacity-70" style={{ color: textColor }}>
                          Tap to view detailed information
                        </p>
                      </div>
                      <div 
                        className="opacity-40 group-hover:opacity-70 transition-opacity"
                        style={{ color: themeColor }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 18l6-6-6-6"/>
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      )

    case 'classic':
      return (
        <div 
          className="h-full flex flex-col overflow-y-auto bg-white"
        >
          {/* Classic Header - clean and connected */}
          <div 
            className="px-6 py-8 text-center border-b border-gray-100"
            style={{ 
              background: `linear-gradient(135deg, ${themeColor}05, ${themeColor}02)`
            }}
          >
            <h1 
              className="text-2xl font-bold mb-2"
              style={{ color: titleColor }}
            >
              {homeTitle}
            </h1>
            <p className="text-sm opacity-70" style={{ color: textColor }}>
              How can we assist you today?
            </p>
          </div>

          {/* Classic Action Grid - connected cards */}
          <div className="flex-1 p-6">
            {actionItems.length > 0 && (
              <div className="grid grid-cols-1 gap-4">
                {actionItems.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className="group flex items-center gap-4 p-5 rounded-2xl transition-all duration-200 hover:shadow-lg hover:scale-[1.02] text-left"
                    style={{ 
                      background: index === 0 ? `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)` : 'white',
                      border: index === 0 ? 'none' : `1px solid ${themeColor}20`,
                      color: index === 0 ? 'white' : titleColor
                    }}
                  >
                    <div 
                      className="p-4 rounded-xl flex-shrink-0"
                      style={{ 
                        background: index === 0 ? 'rgba(255,255,255,0.2)' : `${themeColor}15`,
                        color: index === 0 ? 'white' : themeColor
                      }}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base mb-1">{item.title}</h3>
                      <p 
                        className="text-sm opacity-80"
                        style={{ 
                          color: index === 0 ? 'rgba(255,255,255,0.9)' : textColor 
                        }}
                      >
                        {item.description}
                      </p>
                    </div>
                    <div 
                      className="opacity-50 group-hover:opacity-80 transition-opacity"
                      style={{ 
                        color: index === 0 ? 'rgba(255,255,255,0.7)' : themeColor 
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Classic Popular Topics */}
            {popularTopicsEnabled && popularTopics && popularTopics.length > 0 && (
              <div className="mt-8">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2" style={{ color: titleColor }}>
                    Popular Topics
                  </h3>
                  <p className="text-sm opacity-70" style={{ color: textColor }}>
                    Explore commonly asked questions
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {popularTopics.map((topic, index) => (
                    <button 
                      key={topic.id || index}
                      onClick={() => handlePopularTopicClick(topic)}
                      className="group flex items-center gap-4 p-5 rounded-2xl transition-all duration-300 text-left hover:shadow-lg hover:scale-[1.02]"
                      style={{ 
                        background: index === 0 ? `linear-gradient(135deg, ${themeColor}15, ${themeColor}08)` : 'white',
                        border: `1px solid ${themeColor}20`
                      }}
                    >
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ 
                          background: index === 0 ? themeColor : `${themeColor}15`,
                          color: index === 0 ? 'white' : themeColor
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                          <path d="M13 8H7"/>
                          <path d="M17 12H7"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-base mb-1" style={{ color: titleColor }}>
                          {topic.title}
                        </h4>
                        <p className="text-sm opacity-70" style={{ color: textColor }}>
                          Click to get detailed answers
                        </p>
                      </div>
                      <div 
                        className="opacity-40 group-hover:opacity-70 transition-opacity"
                        style={{ color: themeColor }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 18l6-6-6-6"/>
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Classic Footer CTA */}
          <div className="p-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-sm mb-4" style={{ color: textColor }}>
                Need immediate assistance?
              </p>
              <button
                onClick={onStartChat}
                className="px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 hover:shadow-lg hover:scale-105"
                style={{ 
                  background: themeColor,
                  color: 'white'
                }}
              >
                Start Live Chat
              </button>
            </div>
          </div>
        </div>
      )

    default: // 'classic'
      return (
        <div 
          className="h-full flex flex-col overflow-y-auto"
          style={{ 
            background: `linear-gradient(to bottom, #ffffff, #ffffff95)`
          }}
        >
          {/* Header section with gradient background */}
          <div className="px-6 pt-8 pb-6 text-center">
            <h1 
              className="text-xl font-semibold mb-2"
              style={{ color: titleColor }}
            >
              {homeTitle}
            </h1>
          </div>
          
          {/* Main options with color accents */}
          <div className="px-6 py-4">
            <div className="grid gap-3">
              {actionItems.map((item) => (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="hover:translate-y-[-2px] transition-all duration-300 shadow-sm group"
                  style={{ 
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}
                >
                  <div className="flex items-start">
                    <div 
                      className="w-2 self-stretch opacity-40 group-hover:opacity-100 transition-opacity"
                      style={{ background: themeColor }}
                    ></div>
                    <div className="flex-1 p-4 bg-white group-hover:bg-opacity-10 group-hover:bg-indigo-50 transition-colors">
                      <div className="flex items-center gap-3 mb-1">
                        <div 
                          className="p-2 rounded-full"
                          style={{ 
                            color: '#ffffff',
                            background: themeColor
                          }}
                        >
                          {item.icon}
                        </div>
                        <h3 
                          className="font-medium"
                          style={{ color: titleColor }}
                        >
                          {item.title}
                        </h3>
                      </div>
                      <p 
                        className="text-sm ml-9"
                        style={{ color: textColor }}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Popular Topics section - only show if enabled and has topics */}
          {popularTopicsEnabled && popularTopics && popularTopics.length > 0 && (
            <div className="px-6 pt-2 pb-4">
              <h3 
                className="text-xs uppercase font-medium mb-3"
                style={{ color: `${titleColor}99` }}
              >
                Popular Topics
              </h3>
              
              <div className="flex flex-wrap gap-2">
                {popularTopics.map((topic, index) => (
                  <button 
                    key={topic.id || index}
                    onClick={() => handlePopularTopicClick(topic)}
                    className="transition-all duration-200 font-medium"
                    style={{ 
                      background: `${themeColor}15`,
                      color: themeColor,
                      border: `1px solid ${themeColor}30`,
                      borderRadius: '20px',
                      padding: '8px 16px',
                      fontSize: '12px'
                    }}
                  >
                    {topic.title}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Footer CTA */}
          <div className="mt-auto p-5">
            <div 
              className="rounded-xl p-4 shadow-sm" 
              style={{
                background: `linear-gradient(to right, ${themeColor}90, ${themeColor})`,
              }}
            >
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <h4 className="font-medium text-white mb-1">Need immediate help?</h4>
                  <p className="text-xs text-white opacity-80">Our AI chatbot is ready to assist you</p>
                </div>
                <button
                  onClick={onStartChat}
                  className="px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                  style={{ 
                    background: 'white',
                    color: themeColor,
                  }}
                >
                  Start Chat
                </button>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p 
                className="text-[10px]"
                style={{ color: `${textColor}80` }}
              >
                Powered by <a href="/" target="_blank" style={{ color: themeColor }}>Brief Support</a>
              </p>
            </div>
          </div>
        </div>
      )
  }
}

export default HomeTab 