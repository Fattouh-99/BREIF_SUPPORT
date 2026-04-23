import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { MessageSquare, MessageCircle, HelpCircle, LayoutGrid, User } from 'lucide-react';

type ThemePreviewProps = {
  themeColor?: string;
  textColor?: string;
  titleColor?: string;
  helpDeskColor?: string;
  background?: string;
  iconColor?: string;
  bubbleBackground?: string;
};

export default function ThemePreview({
  themeColor = '#6366F1',
  textColor = '#4B5563',
  titleColor = '#1F2937',
  helpDeskColor = '#F3F4F6',
  background = '#FFFFFF',
  iconColor = '#6366F1',
  bubbleBackground = '#F9FAFB'
}: ThemePreviewProps) {
  // Set default values for null/undefined
  const theme = background || '#FFFFFF';
  const primaryColor = themeColor || '#6366F1';
  const text = textColor || '#4B5563';
  const heading = titleColor || '#1F2937';
  const knowledgeBase = helpDeskColor || '#F3F4F6';
  const botColor = iconColor || '#6366F1';
  const botBubble = bubbleBackground || '#F9FAFB';

  const [activeTab, setActiveTab] = useState('chat');

  return (
    <Card className="overflow-hidden border shadow-md">
      <CardContent className="p-0">
        <div className="flex flex-col rounded-md overflow-hidden" style={{ maxWidth: '340px', margin: '0 auto' }}>
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
            <div className="flex items-center gap-1">
              <button className="text-gray-500 p-1.5 rounded-full hover:bg-gray-100">
                <Minus className="w-3 h-3" />
              </button>
              <button className="text-gray-500 p-1.5 rounded-full hover:bg-gray-100">
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="px-3 py-2 border-b border-gray-100" style={{ background: theme }}>
            <div className="flex justify-between items-center bg-gray-50 rounded-full p-1">
              {[
                { id: 'home', icon: <LayoutGrid className="w-3 h-3" />, label: 'Home' },
                { id: 'chat', icon: <MessageCircle className="w-3 h-3" />, label: 'Chat' },
                { id: 'help', icon: <HelpCircle className="w-3 h-3" />, label: 'Help' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full transition-all text-xs ${
                    activeTab === tab.id
                      ? 'bg-white shadow-sm text-gray-800'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  style={
                    activeTab === tab.id
                      ? { color: heading }
                      : { color: text }
                  }
                >
                  <div
                    style={{
                      color: activeTab === tab.id ? primaryColor : '#4B5563'
                    }}
                  >
                    {tab.icon}
                  </div>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content area */}
          <div className="h-[220px] overflow-hidden" style={{ background: theme }}>
            {activeTab === 'home' && (
              <div className="p-4">
                <div
                  className="rounded-lg p-3 mb-3"
                  style={{ background: `${primaryColor}10` }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="p-1.5 rounded-full"
                      style={{ background: primaryColor, color: 'white' }}
                    >
                      <MessageCircle className="w-3 h-3" />
                    </div>
                    <h4 
                      className="text-xs font-medium" 
                      style={{ color: heading }}
                    >
                      Start a Conversation
                    </h4>
                  </div>
                  <p 
                    className="text-[10px] ml-7"
                    style={{ color: text }}
                  >
                    Chat with our AI assistant
                  </p>
                </div>
                
                <div
                  className="rounded-lg p-3"
                  style={{ background: knowledgeBase }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="p-1.5 rounded-full"
                      style={{ background: primaryColor, color: 'white' }}
                    >
                      <HelpCircle className="w-3 h-3" />
                    </div>
                    <h4 
                      className="text-xs font-medium" 
                      style={{ color: heading }}
                    >
                      Browse Help Topics
                    </h4>
                  </div>
                  <p 
                    className="text-[10px] ml-7"
                    style={{ color: text }}
                  >
                    Find answers in our knowledge base
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="flex flex-col h-full">
                <div className="flex-1 p-4">
                  {/* Bot message example */}
                  <div className="flex mb-3">
                    <div 
                      className="w-6 h-6 rounded-full mr-2 flex-shrink-0 flex items-center justify-center"
                      style={{ background: 'white', border: `1px solid ${theme === '#FFFFFF' ? '#E5E7EB' : theme}` }}
                    >
                      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                        <defs>
                          <radialGradient id="chatBotGradient" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
                            <stop offset="0%" stopColor="#ffffff" />
                            <stop offset="70%" stopColor={botColor} stopOpacity="0.9" />
                          </radialGradient>
                        </defs>
                        <path d="M50,10 C55,30 70,45 90,50 C70,55 55,70 50,90 C45,70 30,55 10,50 C30,45 45,30 50,10 Z" 
                          fill="url(#chatBotGradient)" 
                        />
                      </svg>
                    </div>
                    <div 
                      className="max-w-[70%] rounded-lg p-2 border"
                      style={{ 
                        background: botBubble,
                        borderColor: `${primaryColor}20`,
                        color: text
                      }}
                    >
                      <p className="text-[10px]">
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
                      <p className="text-[10px]">
                        I need help with my account
                      </p>
                    </div>
                    <div className="ml-2 w-6 h-6 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center">
                      <User className="w-3 h-3 text-gray-500" />
                    </div>
                  </div>
                </div>
                
                {/* Input area */}
                <div className="p-3 border-t" style={{ borderColor: `${primaryColor}20` }}>
                  <div 
                    className="flex items-center gap-2 p-2 rounded-lg"
                    style={{ border: '1px solid #E5E7EB' }}
                  >
                    <div className="flex-1 text-[10px] text-gray-400">Type your message...</div>
                    <button 
                      className="p-1 rounded-md"
                      style={{ background: primaryColor }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'help' && (
              <div className="p-4" style={{ background: knowledgeBase }}>
                <h4 
                  className="text-xs font-medium mb-2" 
                  style={{ color: heading }}
                >
                  Knowledge Base
                </h4>
                
                <div 
                  className="rounded-lg p-2 mb-2 bg-white"
                  style={{ borderLeft: `2px solid ${primaryColor}` }}
                >
                  <h5 
                    className="text-[10px] font-medium" 
                    style={{ color: heading }}
                  >
                    How do I reset my password?
                  </h5>
                  <div 
                    className="h-1 w-8 mt-1 rounded"
                    style={{ background: `${primaryColor}40` }}
                  ></div>
                </div>
                
                <div 
                  className="rounded-lg p-2 mb-2 bg-white"
                  style={{ borderLeft: `2px solid ${primaryColor}` }}
                >
                  <h5 
                    className="text-[10px] font-medium" 
                    style={{ color: heading }}
                  >
                    Subscription and billing
                  </h5>
                  <div 
                    className="h-1 w-8 mt-1 rounded"
                    style={{ background: `${primaryColor}40` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div 
            className="text-center py-2 px-3 border-t text-[8px]"
            style={{ 
              background: theme,
              borderColor: `${primaryColor}10`,
              color: text
            }}
          >
            Powered by <span style={{ color: primaryColor }}>BriefSupport</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const Minus = ({ className }: { className?: string }) => (
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
    className={className}
  >
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const X = ({ className }: { className?: string }) => (
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
    className={className}
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
); 