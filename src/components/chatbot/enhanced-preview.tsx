import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { UsageStatus } from './usage-status';

interface EnhancedPreviewProps {
  themeColor: string;
  textColor: string;
  titleColor: string;
  helpDeskColor: string;
  background: string;
  iconColor: string;
  className?: string;
  compact?: boolean;
}

export default function EnhancedPreview({
  themeColor = '#6366F1',
  textColor = '#4B5563',
  titleColor = '#1F2937',
  helpDeskColor = '#F3F4F6',
  background = '#FFFFFF',
  iconColor = '#6366F1',
  className = '',
  compact = false
}: EnhancedPreviewProps) {
  // Set default values for null/undefined
  const theme = background || '#FFFFFF';
  const primaryColor = themeColor || '#6366F1';
  const text = textColor || '#4B5563';
  const heading = titleColor || '#1F2937';
  const knowledgeBase = helpDeskColor || '#F3F4F6';
  const botColor = iconColor || '#6366F1';

  const [activeTab, setActiveTab] = useState('home');

  // Create a more compact preview for the existing UI
  if (compact) {
    return (
      <Card className={`overflow-hidden border shadow-sm ${className}`}>
        <CardContent className="p-0">
          <div className="flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-2 border-b" style={{ background: theme }}>
              <div className="flex items-center gap-1.5">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: 'white' }}
                >
                  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                    <defs>
                      <radialGradient id="compactGradient" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="70%" stopColor={botColor} stopOpacity="0.9" />
                      </radialGradient>
                    </defs>
                    <path d="M50,10 C55,30 70,45 90,50 C70,55 55,70 50,90 C45,70 30,55 10,50 C30,45 45,30 50,10 Z" 
                      fill="url(#compactGradient)" 
                    />
                  </svg>
                </div>
                <h3 
                  className="font-bold text-sm"
                  style={{ color: heading }}
                >
                  BriefSupport
                </h3>
              </div>
            </div>

            {/* Home Tab Preview */}
            <div className="p-2" style={{ background: theme }}>
              <div className="text-center mb-2">
                <h2 style={{ color: heading }} className="text-xs font-medium">
                  Welcome to Support
                </h2>
                <p style={{ color: text }} className="text-[10px]">
                  How can we help you today?
                </p>
              </div>

              <div className="flex space-x-1 mt-1">
                {['Getting Started', 'Account'].map((topic) => (
                  <span 
                    key={topic}
                    className="text-[8px] px-1.5 py-0.5 rounded-full"
                    style={{ 
                      background: `${primaryColor}20`,
                      color: primaryColor,
                      border: `1px solid ${primaryColor}30`
                    }}
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Regular sized preview
  return (
    <Card className={`overflow-hidden border shadow-md ${className}`}>
      <CardContent className="p-0">
        <div className="flex flex-col" style={{ maxWidth: '340px', margin: '0 auto' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ background: theme }}>
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'white', border: `1px solid ${theme === '#FFFFFF' ? '#E5E7EB' : theme}` }}
              >
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                  <defs>
                    <radialGradient id="previewStarGradient" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="70%" stopColor={botColor} stopOpacity="0.9" />
                    </radialGradient>
                  </defs>
                  <path d="M50,10 C55,30 70,45 90,50 C70,55 55,70 50,90 C45,70 30,55 10,50 C30,45 45,30 50,10 Z" 
                    fill="url(#previewStarGradient)" 
                  />
                </svg>
              </div>
              <div>
                <h3 
                  className="font-bold text-base"
                  style={{ color: heading }}
                >
                  BriefSupport
                </h3>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="px-3 py-2 border-b border-gray-100" style={{ background: theme }}>
            <div className="flex justify-between items-center bg-gray-50 rounded-full p-1">
              {['home', 'chat', 'helpdesk'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1 py-1 px-3 rounded-full transition-all duration-200 ${
                    activeTab === tab ? 'bg-white shadow-sm' : ''
                  }`}
                  style={activeTab === tab ? { color: primaryColor } : {}}
                >
                  <span className="font-medium text-xs capitalize">{tab}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div style={{ height: '220px', background: activeTab === 'helpdesk' ? knowledgeBase : theme }}>
            {/* Usage Status Alert */}
            <div className="px-2 pt-2">
              <UsageStatus compact={true} className="mb-2" />
            </div>
            
            {activeTab === 'home' && (
              <div className="px-4 pb-4">
                <div className="mb-4 text-center">
                  <h2 style={{ color: heading }} className="text-base font-medium mb-1">
                    Welcome to Support
                  </h2>
                  <p style={{ color: text }} className="text-xs mb-4">
                    How can we help you today?
                  </p>
                </div>

                {/* Sample option */}
                {/* Removed Chat with Us section since it's available in navbar */}

                {/* Sample topics */}
                <div className="mt-4">
                  <span style={{ color: text }} className="text-xs font-medium mb-2 block">
                    Popular Topics:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {['Getting Started', 'Account'].map((topic) => (
                      <span 
                        key={topic}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ 
                          background: `${primaryColor}20`,
                          color: primaryColor,
                          border: `1px solid ${primaryColor}30`
                        }}
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="flex flex-col h-full">
                <div className="flex-1 p-4">
                  {/* Bot message example */}
                  <div className="flex mb-3">
                    <div 
                      className="max-w-[70%] rounded-lg p-2"
                      style={{ background: `${primaryColor}15` }}
                    >
                      <p style={{ color: text }} className="text-xs">
                        Hello! How can I help you today?
                      </p>
                    </div>
                  </div>
                  
                  {/* User message example */}
                  <div className="flex justify-end mb-3">
                    <div 
                      className="max-w-[70%] rounded-lg p-2"
                      style={{ background: primaryColor, color: 'white' }}
                    >
                      <p className="text-xs">
                        I need help with my account
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Input area */}
                <div className="p-3 border-t" style={{ borderColor: `${primaryColor}20` }}>
                  <div 
                    className="flex items-center gap-2 p-2 rounded-lg"
                    style={{ border: '1px solid #E5E7EB' }}
                  >
                    <div className="flex-1 text-xs text-gray-400">Type your message...</div>
                    <button 
                      className="p-1 rounded-md"
                      style={{ background: primaryColor }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'helpdesk' && (
              <div className="p-4">
                <h2 style={{ color: themeColor }} className="text-base font-medium mb-3">
                  Knowledge Base
                </h2>
                
                {/* Sample FAQ items */}
                <div 
                  className="p-2 rounded-lg mb-2 text-xs"
                  style={{ background: 'white', borderLeft: `2px solid ${primaryColor}` }}
                >
                  <h3 style={{ color: themeColor }} className="font-medium">
                    How do I reset my password?
                  </h3>
                </div>
                
                <div 
                  className="p-2 rounded-lg text-xs"
                  style={{ background: 'white', borderLeft: `2px solid ${primaryColor}` }}
                >
                  <h3 style={{ color: themeColor }} className="font-medium">
                    Where can I update my account details?
                  </h3>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 