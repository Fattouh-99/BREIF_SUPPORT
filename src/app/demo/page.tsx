'use client'

import { useState, useEffect, useRef } from 'react'
import { LandingNavbar } from '@/components/navbar/landing-navbar'
import { Check, X, ArrowRight, ChevronRight, MessageSquare, Bot, BarChart, Users, Lightbulb, Rocket, Shield, LifeBuoy, Play, MousePointer, Minus, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Define the tour steps
const tourSteps = [
  {
    id: 'customer-tour-icon',
    title: 'Customer Experience',
    description: 'See how customers interact with Brief Support on your website',
    duration: 'Interactive',
    target: '.chat-widget-button',
    tooltipPosition: 'right',
    instructions: 'The chat icon allows customers to start a conversation with your AI assistant.'
  },
  {
    id: 'home-tab',
    title: 'Home Tab',
    description: 'Explore the home tab',
    duration: 'Interactive',
    target: '.chat-tab-button[data-tab="home"]',
    tooltipPosition: 'bottom',
    instructions: 'The home tab provides an overview of support options and popular topics.',
    action: 'openHomeTab'
  },
  {
    id: 'chat-tab',
    title: 'Chat Tab',
    description: 'Try the AI chat',
    duration: 'Interactive',
    target: '.chat-tab-button[data-tab="chat"]',
    tooltipPosition: 'bottom',
    instructions: 'Click here to start a conversation with our AI assistant.',
    action: 'openChatTab'
  },
  {
    id: 'helpdesk-tab',
    title: 'Helpdesk Tab',
    description: 'Access the helpdesk',
    duration: 'Interactive',
    target: '.chat-tab-button[data-tab="helpdesk"]',
    tooltipPosition: 'bottom',
    instructions: 'The helpdesk tab provides access to human support and advanced issue resolution.',
    action: 'openHelpdeskTab'
  },
  {
    id: 'customer-tour-send',
    title: 'Send a Message',
    description: 'Try sending a message to the AI assistant',
    duration: 'Interactive',
    target: '.chat-send-button',
    tooltipPosition: 'left',
    instructions: 'Click the send button to ask the assistant about the iPhone 16 Pro.',
    autoFillMessage: 'Tell me about the iPhone 16 Pro'
  },
  {
    id: 'agent-tour',
    title: 'Dashboard Overview',
    description: 'Explore how you can monitor conversations and leads',
    duration: '2 mins',
    target: '.dashboard-panel',
    tooltipPosition: 'bottom',
    instructions: 'This is your agent dashboard where you can monitor live conversations'
  },
  {
    id: 'admin-tour',
    title: 'Admin Controls',
    description: 'See how to customize your AI assistant',
    duration: '1 min',
    target: '.admin-controls',
    tooltipPosition: 'left',
    instructions: 'Access admin controls to customize your AI assistant behavior and responses'
  },
  {
    id: 'analytics-tour',
    title: 'Analytics & Reporting',
    description: 'Discover insights from customer interactions',
    duration: '2 mins',
    target: '.analytics-panel',
    tooltipPosition: 'top',
    instructions: 'View analytics to gain insights about customer interactions and behavior'
  }
]

interface Message {
  text: string;
  sender: 'user' | 'bot';
  options?: string[];
}

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

// Define chat widget component with expanding chat functionality
function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [typing, setTyping] = useState(false)
  const [showInitialGreeting, setShowInitialGreeting] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const [showChatGuide, setShowChatGuide] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [currentTourStep, setCurrentTourStep] = useState(0);
  const [currentTabTourStep, setCurrentTabTourStep] = useState(0);
  const [showTabTour, setShowTabTour] = useState(false);
  const [autoAdvanceTimeout, setAutoAdvanceTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // The tabs we'll tour through
  const tabTourIds = ['home', 'chat', 'helpdesk'];

  const tabs: Tab[] = [
    { 
      id: 'home', 
      label: 'home', 
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 2h3v3H2zM7 2h3v3H7zM2 7h3v3H2zM7 7h3v3H7z" fill="currentColor"/>
        </svg>
      )
    },
    { 
      id: 'chat', 
      label: 'chat',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.5 21.5l4.5-.838A9.955 9.955 0 0012 22z" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      )
    },
    { 
      id: 'helpdesk', 
      label: 'helpdesk',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      )
    },
  ]

  const popularTopics = [
    'Getting Started',
    'Account',
    'Billing',
    'Security'
  ]
  
  // Initial greeting when opening chat
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTyping(true)
      const timer = setTimeout(() => {
        setMessages([
          { 
            text: "👋 Hello! I'm your Apple Store assistant. How can I help you today?", 
            sender: 'bot',
            options: [
              "Tell me about the iPhone 16 Pro",
              "Do you offer Apple Care?",
              "What's your trade-in policy?"
            ]
          }
        ])
        setTyping(false)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isOpen, messages.length])
  
  // Check if we should autofill the input based on tour step
  useEffect(() => {
    // Get the current tour step
    const currentTourStep = document.querySelector('.custom-pulse')?.parentElement?.querySelector('.absolute.bg-black\\/60');
    const sendButtonHighlighted = currentTourStep && currentTourStep.getAttribute('style')?.includes('chat-send-button');
    
    if (sendButtonHighlighted && isOpen) {
      // Find the current tour step with autoFillMessage
      const autoFillStep = tourSteps.find(step => step.id === 'customer-tour-send');
      if (autoFillStep && autoFillStep.autoFillMessage) {
        setInputValue(autoFillStep.autoFillMessage);
      }
    }
  }, [isOpen, tourSteps]); // Add tourSteps to the dependency array
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])
  
  // Handle send message
  const handleSendMessage = (text?: string) => {
    const messageText = text || inputValue;
    if (!messageText.trim()) return
    
    // Add user message
    setMessages([...messages, { text: messageText, sender: 'user' }])
    setInputValue('')
    setTyping(true)
    
    // Simulate bot response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: "I'll help you with that. What specific information would you like?", 
        sender: 'bot',
        options: ['Product Info', 'Pricing', 'Support']
      }])
      setTyping(false)
    }, 1000)
  }
  
  // Show the chat icon with a delayed notification
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInitialGreeting(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])
  
  // Handle tour next step
  const handleNextStep = () => {
    const nextStep = currentTourStep + 1;
    setCurrentTourStep(nextStep);
    
    // If next step is the tab tour intro step
    if (tourSteps[nextStep]?.id === 'home-tab') {
      setActiveTab('home');
      setShowTabTour(true);
      setCurrentTabTourStep(0);
    }
  };
  
  // Effect to manage the automatic tab switching for the tab tour
  useEffect(() => {
    // Clear any existing timeout when the step changes
    if (autoAdvanceTimeout) {
      clearTimeout(autoAdvanceTimeout);
      setAutoAdvanceTimeout(null);
    }
    
    // Only proceed if we're in the tab tour
    if (showTabTour && isOpen) {
      // Set the active tab based on the current tour step
      setActiveTab(tabTourIds[currentTabTourStep]);
      
      // Set a timeout to automatically advance to the next tab after 4 seconds
      // Only advance if not on the last tab
      if (currentTabTourStep < tabTourIds.length - 1) {
        const timeout = setTimeout(() => {
          setCurrentTabTourStep(prev => prev + 1);
        }, 4000);
        
        setAutoAdvanceTimeout(timeout);
      } else if (currentTabTourStep === tabTourIds.length - 1) {
        // If we're on the last tab, wait 4 seconds then proceed to the next main tour step
        const timeout = setTimeout(() => {
          setShowTabTour(false);
          setCurrentTourStep(prev => prev + 3); // Skip to the send message step
          setActiveTab('chat'); // Make sure we're on the chat tab for sending a message
        }, 4000);
        
        setAutoAdvanceTimeout(timeout);
      }
    }
    
    return () => {
      if (autoAdvanceTimeout) {
        clearTimeout(autoAdvanceTimeout);
      }
    };
  }, [currentTabTourStep, showTabTour, isOpen]);

  return (
    <div className="relative">
      {/* Chat button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#1d1d1f] text-white rounded-full p-4 shadow-lg relative chat-widget-button"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageSquare className="w-6 h-6" />
        )}
        
        {!isOpen && showInitialGreeting && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white"
          />
        )}
      </motion.button>
      
      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-16 right-0 w-[400px] h-[600px] bg-white rounded-xl shadow-xl flex flex-col overflow-hidden border border-gray-100"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-5 h-5 text-indigo-500">
                      <path d="M50,10 C55,30 70,45 90,50 C70,55 55,70 50,90 C45,70 30,55 10,50 C30,45 45,30 50,10 Z" fill="currentColor" />
                    </svg>
                  </div>
                  <span className="text-xl font-semibold text-gray-900">BriefSupport</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Minus className="w-4 h-4 text-gray-500" />
                  </button>
                  <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="px-4 py-2 border-b border-gray-100 relative">
                <div className="flex items-center bg-gray-50 rounded-full p-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      data-tab={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                      }}
                      className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all relative chat-tab-button ${
                        activeTab === tab.id 
                          ? 'bg-white text-gray-900 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <span className="text-current">{tab.icon}</span>
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Tab Tour Guide Box */}
                {showTabTour && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10"
                  >
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white p-6 rounded-xl shadow-lg w-[320px]">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                          {activeTab === 'home' && (
                            <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M2 2h3v3H2zM7 2h3v3H7zM2 7h3v3H2zM7 7h3v3H7z" fill="white"/>
                            </svg>
                          )}
                          {activeTab === 'chat' && (
                            <MessageSquare className="w-6 h-6 text-white" />
                          )}
                          {activeTab === 'helpdesk' && (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="white" strokeWidth="1.5"/>
                            </svg>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold">
                          {activeTab === 'home' && "Home Tab"}
                          {activeTab === 'chat' && "Chat Tab"}
                          {activeTab === 'helpdesk' && "Helpdesk Tab"}
                        </h3>
                      </div>
                      <p className="text-white/90 mb-6">
                        {activeTab === 'home' && "Access an overview of support options and popular topics."}
                        {activeTab === 'chat' && "Start a conversation with our AI assistant."}
                        {activeTab === 'helpdesk' && "Get help from our support team and access advanced issue resolution."}
                      </p>
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => {
                            setShowTabTour(false);
                            setCurrentTourStep(prev => prev + 3); // Skip to the send message step
                            setActiveTab('chat'); // Set active tab to chat for sending a message
                          }}
                          className="text-sm text-white/70 hover:text-white"
                        >
                          Skip tour
                        </button>
                        <div className="flex gap-1">
                          {tabTourIds.map((id, idx) => (
                            <div 
                              key={id} 
                              className={`w-2 h-2 rounded-full ${currentTabTourStep === idx ? 'bg-white' : 'bg-white/30'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Initial tour guide box (not part of tab tour) */}
                {currentTourStep === 1 && activeTab === 'home' && !showTabTour && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10"
                  >
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white p-6 rounded-xl shadow-lg w-[320px]">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                          <MessageSquare className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold">Interface Overview</h3>
                      </div>
                      <p className="text-white/90 mb-6">Let's explore each tab to understand how customers can interact with your assistant.</p>
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => {
                            setCurrentTourStep(currentTourStep + 3); // Skip to the send message step
                            setActiveTab('chat'); // Set active tab to chat for sending a message
                          }}
                          className="text-sm text-white/70 hover:text-white"
                        >
                          Skip tour
                        </button>
                        <button
                          onClick={handleNextStep}
                          className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-white/90"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto">
                {activeTab === 'home' && (
                  <div className="p-6">
                    <div className="flex flex-col items-center text-center mb-8">
                      <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                        <div className="w-8 h-8 text-indigo-500">
                          <svg viewBox="0 0 100 100">
                            <path d="M50,10 C55,30 70,45 90,50 C70,55 55,70 50,90 C45,70 30,55 10,50 C30,45 45,30 50,10 Z" fill="currentColor" />
                          </svg>
                        </div>
                      </div>
                      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to Support</h1>
                      <p className="text-gray-600">How can we help you today?</p>
                    </div>

                    {/* Chat with Us Section */}
                    <div className="mb-6">
                      <div className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-indigo-600" />
                          </div>
                          <h2 className="text-lg font-semibold text-gray-900">Chat with Us</h2>
                        </div>
                        <p className="text-gray-600 text-sm">Get immediate help from our support team</p>
                      </div>
                    </div>

                    {/* Knowledge Base Section */}
                    <div className="mb-8">
                      <div className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <Lightbulb className="w-5 h-5 text-indigo-600" />
                          </div>
                          <h2 className="text-lg font-semibold text-gray-900">Knowledge Base</h2>
                        </div>
                        <p className="text-gray-600 text-sm">Browse articles and find answers quickly</p>
                      </div>
                    </div>

                    {/* Popular Topics */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-3">POPULAR TOPICS</h3>
                      <div className="flex flex-wrap gap-2">
                        {popularTopics.map((topic) => (
                          <button
                            key={topic}
                            className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-full text-sm transition-colors"
                          >
                            {topic}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'chat' && (
                  <div className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] p-3 rounded-lg ${
                            message.sender === 'user' 
                              ? 'bg-indigo-500 text-white rounded-br-none' 
                              : 'bg-gray-50 rounded-bl-none'
                          }`}>
                            <p>{message.text}</p>
                            {message.options && (
                              <div className="mt-2 space-y-2">
                                {message.options.map((option, i) => (
                                  <button
                                    key={i}
                                    onClick={() => handleSendMessage(option)}
                                    className="block w-full text-left text-sm py-1.5 px-3 rounded bg-white/10 hover:bg-white/20 transition-colors"
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
                
                {activeTab === 'helpdesk' && (
                  <div className="p-6">
                    <div className="flex flex-col items-center text-center mb-8">
                      <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                        <LifeBuoy className="w-8 h-8 text-indigo-500" />
                      </div>
                      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Help Desk</h1>
                      <p className="text-gray-600">Get direct support from our team</p>
                    </div>

                    {/* Support Options */}
                    <div className="space-y-4 mb-8">
                      <div className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-green-600" />
                          </div>
                          <h2 className="text-lg font-semibold text-gray-900">Live Support</h2>
                        </div>
                        <p className="text-gray-600 text-sm">Connect with a support agent right now</p>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <h2 className="text-lg font-semibold text-gray-900">Email Support</h2>
                        </div>
                        <p className="text-gray-600 text-sm">Send us a detailed message</p>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                          <h2 className="text-lg font-semibold text-gray-900">Create Ticket</h2>
                        </div>
                        <p className="text-gray-600 text-sm">Submit a support ticket for complex issues</p>
                      </div>
                    </div>

                    {/* Support Hours */}
                    <div className="bg-blue-50 rounded-xl p-4">
                      <h3 className="font-medium text-blue-700 mb-2">Support Hours</h3>
                      <p className="text-sm text-gray-700">Monday - Friday: 9am - 8pm EST</p>
                      <p className="text-sm text-gray-700">Saturday: 10am - 6pm EST</p>
                      <p className="text-sm text-gray-700">Sunday: Closed</p>
                    </div>
                  </div>
                )}
              </div>

              {activeTab === 'chat' && (
                <div className="p-4 border-t border-gray-100">
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSendMessage()
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      placeholder="Type your message..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      className="p-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-colors chat-send-button"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// Update the Spotlight component to make the highlighted area more visible
function Spotlight({ selector }: { selector: string }) {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [demoContainerRect, setDemoContainerRect] = useState({ top: 0, left: 0, width: 0, height: 0, right: 0, bottom: 0 });
  const [currentTarget, setCurrentTarget] = useState(selector);
  
  useEffect(() => {
    setCurrentTarget(selector);
  }, [selector]);
  
  useEffect(() => {
    const updatePosition = () => {
      // Find the demo container (the fake website container)
      const demoContainer = document.querySelector('.rounded-xl.shadow-lg.overflow-hidden.border.border-gray-200');
      
      if (demoContainer) {
        const containerRect = demoContainer.getBoundingClientRect();
        setDemoContainerRect({
          top: containerRect.top,
          left: containerRect.left,
          width: containerRect.width,
          height: containerRect.height,
          right: containerRect.right,
          bottom: containerRect.bottom
        });
      }
      
      const element = document.querySelector(currentTarget);
      if (element) {
        const rect = element.getBoundingClientRect();
        setPosition({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
      } else {
        // Default position if element not found
        setPosition({
          top: window.innerHeight / 2 - 100,
          left: window.innerWidth / 2 - 100,
          width: 200,
          height: 200
        });
      }
    };
    
    updatePosition();
    window.addEventListener('resize', updatePosition);
    
    // Add an interval to continuously check for the element
    // This helps when elements appear dynamically
    const checkInterval = setInterval(updatePosition, 500);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      clearInterval(checkInterval);
    };
  }, [currentTarget]);
  
  // This approach uses a clip-path to "cut out" the highlighted area from the dark overlay
  // This makes the highlighted content fully visible while the rest is dimmed
  // Adjust padding to be asymmetric - more on right and bottom
  const paddingTop = 5;
  const paddingLeft = 5;
  const paddingRight = selector.includes('chat-send-button') ? 15 : 12;
  const paddingBottom = selector.includes('chat-send-button') ? 15 : 12;
  
  // Only show if we have valid dimensions for both container and target
  if (demoContainerRect.width === 0 || position.width === 0) {
    return null;
  }
  
  return (
    <div className="fixed z-40 pointer-events-none" style={{
      top: `${demoContainerRect.top}px`,
      left: `${demoContainerRect.left}px`,
      width: `${demoContainerRect.width}px`,
      height: `${demoContainerRect.height}px`,
    }}>
      {/* Dark overlay with "cut out" for the highlight area - Only over the demo container */}
      <div 
        className="absolute inset-0 bg-black/60 pointer-events-auto" 
        style={{
          clipPath: `polygon(
            0% 0%, 100% 0%, 100% 100%, 0% 100%,
            0% 0%,
            ${position.left - demoContainerRect.left - paddingLeft}px ${position.top - demoContainerRect.top - paddingTop}px, 
            ${position.left - demoContainerRect.left - paddingLeft}px ${position.top - demoContainerRect.top + position.height + paddingBottom}px,
            ${position.left - demoContainerRect.left + position.width + paddingRight}px ${position.top - demoContainerRect.top + position.height + paddingBottom}px,
            ${position.left - demoContainerRect.left + position.width + paddingRight}px ${position.top - demoContainerRect.top - paddingTop}px,
            ${position.left - demoContainerRect.left - paddingLeft}px ${position.top - demoContainerRect.top - paddingTop}px
          )`
        }}
      />
      
      {/* Highlighted area glow effect */}
      <div 
        className="absolute custom-pulse pointer-events-none"
        style={{
          top: `${position.top - demoContainerRect.top - paddingTop}px`,
          left: `${position.left - demoContainerRect.left - paddingLeft}px`,
          width: `${position.width + paddingLeft + paddingRight}px`,
          height: `${position.height + paddingTop + paddingBottom}px`,
          borderRadius: '4px',
          border: '2px solid #3b82f6',
          boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.3), 0 0 10px rgba(59, 130, 246, 0.5)',
          backgroundColor: 'transparent',
        }}
      />
    </div>
  );
}

// This defines a custom pulse animation for stronger effect with increased opacity
const pulseStyles = `
@keyframes custom-pulse {
  0% {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3), 0 0 10px rgba(59, 130, 246, 0.5);
  }
  50% {
    border-color: #93c5fd;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5), 0 0 15px rgba(59, 130, 246, 0.8);
  }
  100% {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3), 0 0 10px rgba(59, 130, 246, 0.5);
  }
}

.custom-pulse {
  animation: custom-pulse 1.5s infinite;
}
`;

export default function DemoPage() {
  const [isTourOpen, setIsTourOpen] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [demoContent, setDemoContent] = useState('customer-tour')
  const [activeStep, setActiveStep] = useState(0)
  const [isTourStarted, setIsTourStarted] = useState(false)
  const [showTourGuide, setShowTourGuide] = useState(false);
  const [isScrollLocked, setIsScrollLocked] = useState(false);
  const [tourTargetUpdated, setTourTargetUpdated] = useState(false);

  // Handle scrolling functionality - lock the page when tour starts
  useEffect(() => {
    if (isScrollLocked) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isScrollLocked]);
  
  // Smooth scroll to bottom helper function
  const smoothScrollToBottom = (callback?: () => void) => {
    const chatButton = document.querySelector('.chat-widget-button');
    if (chatButton) {
      const rect = chatButton.getBoundingClientRect();
      const targetY = rect.top + window.scrollY - (window.innerHeight / 2);
      
      const duration = 1000; // ms
      const startY = window.scrollY;
      const distance = targetY - startY;
      const startTime = performance.now();
      
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      
      const scroll = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = easeOutCubic(progress);
        
        window.scrollTo(0, startY + distance * easeProgress);
        
        if (progress < 1) {
          requestAnimationFrame(scroll);
        } else if (callback) {
          callback();
        }
      };
      
      requestAnimationFrame(scroll);
    } else if (callback) {
      callback();
    }
  };

  // Function to force update of tour target
  const updateTourTarget = () => {
    setTourTargetUpdated(prev => !prev);
  };

  // Handle tour step completion
  const completeStep = (index: number) => {
    if (!completedSteps.includes(index)) {
      setCompletedSteps([...completedSteps, index])
    }
  }

  // Handle advancing to next step
  const goToNextStep = () => {
    completeStep(currentStep)
    
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
      setActiveStep(currentStep + 1)
      
      // Set content based on the tour step category
      const nextStep = tourSteps[currentStep + 1];
      if (nextStep.id.startsWith('agent-tour')) {
        setDemoContent('agent-tour');
      } else if (nextStep.id.startsWith('admin-tour')) {
        setDemoContent('admin-tour');
      } else if (nextStep.id.startsWith('analytics-tour')) {
        setDemoContent('analytics-tour');
      } else {
        setDemoContent('customer-tour');
      }
    } else {
      finishTour()
    }
  }

  const finishTour = () => {
    setShowTourGuide(false)
    setIsScrollLocked(false)
    // Optionally show a completion message or take other actions
  }

  // Handle selecting a specific step
  const selectStep = (index: number) => {
    setCurrentStep(index)
    
    // Set content based on the tour step category
    const step = tourSteps[index];
    if (step.id.startsWith('agent-tour')) {
      setDemoContent('agent-tour');
    } else if (step.id.startsWith('admin-tour')) {
      setDemoContent('admin-tour');
    } else if (step.id.startsWith('analytics-tour')) {
      setDemoContent('analytics-tour');
    } else {
      setDemoContent('customer-tour');
    }
  }

  // TourTooltip component with access to smoothScrollToBottom function
  function TourTooltip({ 
    step, 
    onNext, 
    onClose,
    updateSpotlightTarget,
    currentStepIndex
  }: { 
    step: typeof tourSteps[number], 
    onNext: () => void, 
    onClose: () => void,
    updateSpotlightTarget?: () => void,
    currentStepIndex: number 
  }) {
    type Position = 'top' | 'right' | 'bottom' | 'left';
    const position = (step.tooltipPosition as Position) || 'bottom';
    const [hasScrolled, setHasScrolled] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 'auto', right: 'auto', bottom: 'auto', left: 'auto', transform: '' });
    
    // Position the tooltip based on the target element and specified position
    useEffect(() => {
      // Get the highlighted element
      const targetElement = document.querySelector(step.target);
      console.log('Tour step:', step.id, 'Target found:', !!targetElement);
      
      // For the first step, use a reliable fixed position
      if (step.id === 'customer-tour-icon') {
        setTooltipPosition({
          top: 'auto',
          right: 'auto',
          bottom: '100px',
          left: '50%',
          transform: 'translateX(-50%)'
        });
        return;
      }
      
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const tooltipWidth = 400; // Approximate width of tooltip
        const tooltipHeight = 150; // Approximate height of tooltip
        const spacing = 20; // Space between target and tooltip
        
        // Set different positions based on which step we're on
        switch (step.id) {
          case 'customer-tour-chat':
            // Position to the left of the chat window
            setTooltipPosition({
              top: `${rect.top + rect.height / 2 - tooltipHeight / 2}px`,
              right: `${window.innerWidth - rect.left + spacing}px`,
              bottom: 'auto',
              left: 'auto',
              transform: ''
            });
            break;
            
          case 'customer-tour-send':
            // Position above the send button
            setTooltipPosition({
              top: 'auto',
              right: 'auto',
              bottom: `${window.innerHeight - rect.top + spacing}px`,
              left: `${rect.left - tooltipWidth / 2}px`,
              transform: ''
            });
            break;
            
          default:
            // Default positioning based on specified position
            if (position === 'top') {
              setTooltipPosition({
                top: 'auto',
                right: 'auto',
                bottom: `${window.innerHeight - rect.top + spacing}px`,
                left: `${rect.left + rect.width / 2}px`,
                transform: 'translateX(-50%)'
              });
            } else if (position === 'right') {
              setTooltipPosition({
                top: `${rect.top + rect.height / 2}px`,
                right: 'auto',
                bottom: 'auto',
                left: `${rect.right + spacing}px`,
                transform: 'translateY(-50%)'
              });
            } else if (position === 'left') {
              setTooltipPosition({
                top: `${rect.top + rect.height / 2}px`,
                right: `${window.innerWidth - rect.left + spacing}px`,
                bottom: 'auto',
                left: 'auto',
                transform: 'translateY(-50%)'
              });
            } else {
              // Bottom position
              setTooltipPosition({
                top: `${rect.bottom + spacing}px`,
                right: 'auto',
                bottom: 'auto',
                left: `${rect.left + rect.width / 2}px`,
                transform: 'translateX(-50%)'
              });
            }
        }
      } else {
        // If target element not found, position the tooltip in the center bottom
        setTooltipPosition({
          top: 'auto',
          right: 'auto',
          bottom: '100px',
          left: '50%',
          transform: 'translateX(-50%)'
        });
      }
    }, [step, position]);
    
    // Handle next click with automated scrolling if needed
    const handleNext = () => {
      if (step.id === 'customer-tour-icon' && !hasScrolled) {
        // First step - scroll to widget
        smoothScrollToBottom(() => {
          setHasScrolled(true);
        });
        return;
      } 
      
      if (step.id === 'customer-tour-icon' && hasScrolled) {
        // After scrolling to widget, open chat when clicking next
        const chatButton = document.querySelector('.chat-widget-button');
        if (chatButton && chatButton instanceof HTMLElement) {
          chatButton.click(); // Programmatically click the chat button
          
          // Allow time for animation to complete
          setTimeout(() => {
            onNext(); // Advance to next step
          }, 300);
        }
        return;
      }
      
      if (step.id === 'customer-tour-send') {
        // Send message step - click the send button
        const sendButton = document.querySelector('.chat-send-button');
        if (sendButton && sendButton instanceof HTMLElement) {
          sendButton.click(); // Programmatically click the send button
          
          // Allow time for animation to complete
          setTimeout(() => {
            onNext(); // Advance to next step
          }, 1000);
        }
        return;
      }
      
      // For all other steps, just proceed to next
      onNext();
    };
    
    // Button text changes based on step
    const getButtonText = () => {
      if (step.id === 'customer-tour-icon' && !hasScrolled) {
        return "Scroll to widget";
      }
      
      if (step.id === 'customer-tour-icon' && hasScrolled) {
        return "Open chat";
      }
      
      if (step.id === 'customer-tour-send') {
        return "Send message";
      }
      
      return "Next";
    };
    
    return (
      <div className="fixed z-50" style={{
        top: tooltipPosition.top,
        right: tooltipPosition.right,
        bottom: tooltipPosition.bottom,
        left: tooltipPosition.left,
        transform: tooltipPosition.transform,
      }}>
        <div className="bg-primary-600 text-white p-4 rounded-lg shadow-xl max-w-md">
          <h4 className="font-bold text-lg mb-2">{step.title}</h4>
          <p className="mb-3">
            {step.instructions}
          </p>
          <div className="flex justify-between items-center">
            <button 
              onClick={onClose}
              className="text-sm underline hover:text-white/80"
            >
              Skip tour
            </button>
            <button 
              onClick={handleNext}
              className="bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-white/90"
            >
              {getButtonText()}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Add the custom styles */}
      
      <LandingNavbar />
      
      {/* Welcome Banner */}
      {!isTourStarted && (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
        >
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
              <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-primary-500 opacity-20"></div>
              <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary-500 opacity-20"></div>
              <div className="absolute top-1/4 right-1/4 w-10 h-10 rounded-full bg-primary-200"></div>
              <div className="absolute bottom-1/3 left-1/3 w-6 h-6 rounded-full bg-primary-300"></div>
            </div>
            
            <div className="relative z-10 p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="w-full md:w-1/2"
                >
                  <div className="relative">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: "spring", bounce: 0.5 }}
                      className="absolute -top-12 -right-0 bg-primary-600 text-white rounded-full px-4 py-2 text-sm font-medium shadow-lg"
                    >
                      Interactive Demo
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="relative shadow-2xl rounded-xl overflow-hidden border-8 border-gray-100"
                    >
                      <Image
                        src="/icons/Icon-Only-Color.svg"
                        alt="Brief Support Demo Preview"
                        width={400}
                        height={200}
                        className="w-full h-auto"
                        onError={(e) => {
                          // Fallback if image doesn't exist
                          const target = e.target as HTMLImageElement;
                          target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='300' viewBox='0 0 500 300'%3E%3Crect width='500' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='24' text-anchor='middle' fill='%236b7280'%3EBrief Support Demo%3C/text%3E%3C/svg%3E";
                        }}
                      />
                      
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end"
                      >
                        <div className="p-4 text-white">
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <span className="text-sm">Live Demo</span>
                            </div>
                            <h3 className="text-xl font-semibold">Brief Support AI Assistant</h3>
                          </motion.div>
                        </div>
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="w-full md:w-1/2 text-center md:text-left"
                >
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Welcome to the 
                    <span className="text-primary-600"> Brief Support </span>
                    Interactive Tour
                  </h2>
                  
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg text-gray-700 mb-8"
                  >
                    Experience how Brief Support transforms customer interactions through our interactive demo. See our AI assistant in action from different perspectives.
                  </motion.p>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-4 mb-8"
                  >
                    {tourSteps.map((step, index) => (
                      <div key={step.id} className="flex items-start gap-3">
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full bg-primary-100 text-primary-600 mt-0.5`}>
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{step.title}</h3>
                          <p className="text-gray-600 text-sm">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setIsTourStarted(true);
                        setIsTourOpen(true);
                        setActiveStep(0);
                        setShowTourGuide(true);
                        setIsScrollLocked(true); // Lock scrolling when tour starts
                      }}
                      className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:bg-primary-700 transition-colors"
                    >
                      <Play className="w-5 h-5" />
                      Start the Tour
                    </motion.button>
                    
                    <Link 
                      href="/dashboard" 
                      className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium shadow-md hover:bg-gray-200 transition-colors"
                    >
                      Return to Dashboard
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {/* Tour Guide Overlay */}
      {isTourStarted && showTourGuide && activeStep < tourSteps.length && (
        <>
          <Spotlight selector={tourSteps[activeStep].target} key={`spotlight-${activeStep}-${tourTargetUpdated}`} />
          <TourTooltip 
            step={tourSteps[activeStep]} 
            onNext={goToNextStep} 
            onClose={finishTour}
            updateSpotlightTarget={updateTourTarget}
            currentStepIndex={activeStep}
          />
        </>
      )}
      
      {/* Tour Navigation */}
      {isTourStarted && isTourOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-16 inset-x-0 mx-auto w-max z-50 bg-white rounded-3xl shadow-2xl px-6 py-4"
        >
          <div className="flex items-center gap-6 relative">
            {/* Show tour steps in navigation, merging the first two steps visually */}
            {tourSteps.filter((_, index) => index === 0 || index > 1).map((step, displayIndex) => {
              // Adjust indices for display - the first two steps appear as one in the nav
              const actualIndex = displayIndex === 0 ? 0 : displayIndex + 1;
              const isMergedStep = displayIndex === 0;
              
              return (
                <motion.button
                  key={step.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    selectStep(actualIndex);
                  }}
                  className={`relative flex items-center justify-center px-5 py-2 rounded-full transition-all ${
                    (activeStep === actualIndex || (isMergedStep && activeStep === 1))
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        (activeStep === actualIndex || (isMergedStep && activeStep === 1))
                          ? "bg-white text-primary-600"
                          : completedSteps.includes(actualIndex) || (isMergedStep && completedSteps.includes(1))
                          ? "bg-primary-100 text-primary-600"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {completedSteps.includes(actualIndex) || (isMergedStep && completedSteps.includes(1)) ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <span>{displayIndex + 1}</span>
                      )}
                    </div>
                    
                    <span className="font-medium text-sm">
                      {isMergedStep ? "Customer Experience" : step.title}
                    </span>
                  </div>
                </motion.button>
              );
            })}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsTourOpen(false)}
              className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
              aria-label="Close tour"
            >
              <X className="w-3 h-3" />
            </motion.button>
          </div>
        </motion.div>
      )}
      
      {/* Tour Toggle Button */}
      {isTourStarted && !isTourOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsTourOpen(true)}
          className="fixed top-8 right-8 z-50 flex items-center gap-2 bg-primary-600 text-white px-5 py-3 rounded-full shadow-lg"
        >
          <LifeBuoy className="w-5 h-5" />
          <span>Tour Guide</span>
          
          {completedSteps.length > 0 && completedSteps.length < tourSteps.length && (
            <span className="inline-flex items-center justify-center w-6 h-6 bg-white text-primary-600 text-xs font-medium rounded-full">
              {completedSteps.length}/{tourSteps.length}
            </span>
          )}
        </motion.button>
      )}
      
      {/* Demo Content Area */}
      <div className="container mx-auto py-8 px-4 relative">
        {/* Customer Tour Content */}
        {demoContent === 'customer-tour' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 relative">
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center">
                <div className="flex-1 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                    <div className="w-6 h-6 rounded-full bg-primary-600"></div>
                  </div>
                  <h3 className="font-medium">Apple</h3>
                </div>
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>
              
              {/* Apple-like Navigation Bar */}
              <nav className="bg-[#1d1d1f] py-3">
                <div className="max-w-screen-lg mx-auto px-4">
                  <div className="flex justify-center items-center space-x-8">
                    <div className="flex items-center justify-center">
                      <svg className="w-4 h-4 fill-current text-white opacity-80" viewBox="0 0 17 48">
                        <path d="M8.8 27.1c-2.3 0-4.1 1.9-4.1 4.2s1.8 4.2 4.1 4.2 4.1-1.9 4.1-4.2c0-2.3-1.8-4.2-4.1-4.2zm7.4-7.1c-.9 0-1.7.6-2.2 1.6-.4.9-.5 1.8-.3 2.9.4 2.3 2.2 3.6 4.5 3.3.7-.1 1.3-.3 2-.6-.5 1.5-1.8 2.7-3.7 3.1-1.1.2-2.1 0-3.1-.6-.3-.2-.5-.2-.7.1-.2.4-.5.8-.7 1.2-.2.3-.1.5.2.7 1 .8 2.2 1.1 3.6 1.1 3.1-.1 5.5-2.1 6.2-5.1.3-1.4.2-2.7-.4-4-.9-1.8-2.3-2.7-4.4-2.7h-1zm-14.1.1c-2.7.1-4.4 3-3.7 6.1.5 2.2 2.3 3.4 4.7 3.4.5 0 1-.1 1.5-.3-.6 1.9-2.5 3.3-4.8 2.8-.3-.1-.5-.1-.8.1s-.5.4-.8.6c-.2.2-.3.4 0 .7 1.8 1.3 3.7 1.5 5.6.6 2.1-.9 3.2-2.7 3.5-4.9.4-2.7-.5-5.4-3.1-6.5-.7-.3-1.4-.4-2.1-.3V20h.1z" />
                      </svg>
                    </div>
                    <div className="text-[12px] text-white opacity-80">Store</div>
                    <div className="text-[12px] text-white opacity-80">Mac</div>
                    <div className="text-[12px] text-white opacity-80">iPad</div>
                    <div className="text-[12px] text-white opacity-80">iPhone</div>
                    <div className="text-[12px] text-white opacity-80">Watch</div>
                    <div className="text-[12px] text-white opacity-80">Vision</div>
                    <div className="text-[12px] text-white opacity-80">AirPods</div>
                    <div className="text-[12px] text-white opacity-80">TV & Home</div>
                    <div className="text-[12px] text-white opacity-80">Entertainment</div>
                    <div className="text-[12px] text-white opacity-80">Accessories</div>
                    <div className="text-[12px] text-white opacity-80">Support</div>
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </nav>
              
              {/* Apple payment banner */}
              <div className="bg-[#f5f5f7] py-3 text-center">
                <div className="max-w-screen-lg mx-auto px-4">
                  <p className="text-[12px] text-gray-600">
                    Pay monthly at 0% APR. Plus, trade in to lower your monthly payments. 
                    <span className="text-blue-500 ml-1">Learn more &gt;</span>
                  </p>
                </div>
              </div>
              
              {/* Main content area */}
              <div className="p-8">
                <div className="max-w-screen-lg mx-auto">
                  <div className="text-left mb-16">
                    <h1 className="text-[48px] font-semibold text-[#1d1d1f] leading-tight">Store.</h1>
                    <h2 className="text-[48px] font-semibold text-[#6e6e73] leading-tight">The best way to buy the products you love.</h2>
                  </div>
                  
                  {/* Product categories */}
                  <div className="grid grid-cols-7 gap-4 mb-16">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex flex-col items-center"
                    >
                      <div className="bg-[#f5f5f7] w-full rounded-2xl aspect-square p-4 mb-3 flex items-center justify-center overflow-hidden">
                        <Image
                          src="/images/categories/mac.png"
                          alt="Mac"
                          width={150}
                          height={150}
                          className="w-auto h-auto object-contain"
                        />
                      </div>
                      <span className="text-sm font-medium">Mac</span>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex flex-col items-center"
                    >
                      <div className="bg-[#f5f5f7] w-full rounded-2xl aspect-square p-4 mb-3 flex items-center justify-center overflow-hidden">
                        <Image
                          src="/images/categories/iphone.png"
                          alt="iPhone"
                          width={150}
                          height={150}
                          className="w-auto h-auto object-contain"
                        />
                      </div>
                      <span className="text-sm font-medium">iPhone</span>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex flex-col items-center"
                    >
                      <div className="bg-[#f5f5f7] w-full rounded-2xl aspect-square p-4 mb-3 flex items-center justify-center overflow-hidden">
                        <Image
                          src="/images/categories/ipad.png"
                          alt="iPad"
                          width={150}
                          height={150}
                          className="w-auto h-auto object-contain"
                        />
                      </div>
                      <span className="text-sm font-medium">iPad</span>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex flex-col items-center"
                    >
                      <div className="bg-[#f5f5f7] w-full rounded-2xl aspect-square p-4 mb-3 flex items-center justify-center overflow-hidden">
                        <Image
                          src="/images/categories/watch.png"
                          alt="Apple Watch"
                          width={150}
                          height={150}
                          className="w-auto h-auto object-contain"
                        />
                      </div>
                      <span className="text-sm font-medium">Watch</span>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex flex-col items-center"
                    >
                      <div className="bg-[#f5f5f7] w-full rounded-2xl aspect-square p-4 mb-3 flex items-center justify-center overflow-hidden">
                        <Image
                          src="/images/categories/airpods.png"
                          alt="AirPods"
                          width={150}
                          height={150}
                          className="w-auto h-auto object-contain"
                        />
                      </div>
                      <span className="text-sm font-medium">AirPods</span>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="flex flex-col items-center"
                    >
                      <div className="bg-[#f5f5f7] w-full rounded-2xl aspect-square p-4 mb-3 flex items-center justify-center overflow-hidden">
                        <Image
                          src="/images/categories/tv.png"
                          alt="TV & Home"
                          width={150}
                          height={150}
                          className="w-auto h-auto object-contain"
                        />
                      </div>
                      <span className="text-sm font-medium">TV & Home</span>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="flex flex-col items-center"
                    >
                      <div className="bg-[#f5f5f7] w-full rounded-2xl aspect-square p-4 mb-3 flex items-center justify-center overflow-hidden">
                        <Image
                          src="/images/categories/vision.png"
                          alt="Vision"
                          width={150}
                          height={150}
                          className="w-auto h-auto object-contain"
                        />
                      </div>
                      <span className="text-sm font-medium">Vision</span>
                    </motion.div>
                  </div>
                  
                  {/* Latest products section */}
                  <div className="mb-10">
                    <div className="flex items-baseline mb-6">
                      <h2 className="text-2xl font-bold text-gray-800 mr-2">The latest.</h2>
                      <span className="text-gray-500">Take a look at what's new right now.</span>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4">
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-black rounded-2xl p-6 overflow-hidden flex flex-col h-[420px]"
                      >
                        <h3 className="text-xl font-semibold mb-2 text-white">iPhone 16 Pro</h3>
                        <div className="text-sm text-blue-400 mb-2">Apple Intelligence<sup>2</sup></div>
                        <div className="text-sm text-white mb-6">From £41.62/mo. or From £999 **</div>
                        <div className="flex-grow flex items-end justify-center mt-auto">
                          <Image
                            src="https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-7inch-black-titanium?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1691540229625"
                            alt="iPhone 16 Pro"
                            width={300}
                            height={300}
                            className="w-full h-auto"
                          />
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-[#f5f5f7] rounded-2xl p-6 overflow-hidden flex flex-col h-[420px]"
                      >
                        <h3 className="text-xl font-semibold mb-2">MacBook Air</h3>
                        <div className="text-sm text-blue-600 mb-2">Apple Intelligence<sup>2</sup></div>
                        <div className="text-sm mb-6">From £999</div>
                        <div className="flex-grow flex items-end justify-center mt-auto">
                          <Image
                            src="https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/macbook-air-m2-midnight-select-20220606?wid=904&hei=840&fmt=jpeg&qlt=95&.v=1653084303665"
                            alt="MacBook Air"
                            width={300}
                            height={300}
                            className="w-full h-auto"
                          />
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-[#f5f5f7] rounded-2xl p-6 overflow-hidden flex flex-col h-[420px]"
                      >
                        <h3 className="text-xl font-semibold mb-2">iPad Air</h3>
                        <div className="text-sm text-blue-600 mb-2">Apple Intelligence<sup>2</sup></div>
                        <div className="text-sm mb-6">From £599</div>
                        <div className="flex-grow flex items-end justify-center mt-auto">
                          <Image
                            src="https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/ipad-air-select-wifi-blue-202403?wid=940&hei=1112&fmt=p-jpg&qlt=95&.v=1707533619766"
                            alt="iPad Air"
                            width={300}
                            height={300}
                            className="w-full h-auto mt-auto"
                          />
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-[#f5f5f7] rounded-2xl p-6 overflow-hidden flex flex-col h-[420px]"
                      >
                        <h3 className="text-xl font-semibold mb-2">Apple Watch Series 10</h3>
                        <div className="text-sm mb-2">Thinstant classic.</div>
                        <div className="text-sm mb-6">From £399</div>
                        <div className="flex-grow flex items-end justify-center mt-auto">
                          <Image
                            src="https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/watch-card-40-s9-202309_GEO_GB?wid=400&hei=500&fmt=p-jpg&qlt=95&.v=1693922116539"
                            alt="Apple Watch Series 10"
                            width={300}
                            height={300}
                            className="w-full h-auto"
                          />
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Keep the Button for next demo */}
              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <Button 
                  onClick={goToNextStep}
                  className="mt-4"
                >
                  Next Demo <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
              
              {/* Chat widget inside the Apple store demo */}
              <div className="absolute bottom-8 right-8 z-20">
                <ChatWidget />
              </div>
            </div>
          </div>
        )}
        
        {/* Dashboard Tour Content */}
        {demoContent === 'agent-tour' && (
          <div className="max-w-6xl mx-auto dashboard-panel">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Agent Dashboard</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-medium text-blue-700 mb-2">Active Conversations</h3>
                  <div className="text-3xl font-bold">24</div>
                  <p className="text-sm text-gray-600 mt-1">+12% from yesterday</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-medium text-green-700 mb-2">Resolved Issues</h3>
                  <div className="text-3xl font-bold">128</div>
                  <p className="text-sm text-gray-600 mt-1">+8% from yesterday</p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-medium text-purple-700 mb-2">Average Response Time</h3>
                  <div className="text-3xl font-bold">1.4m</div>
                  <p className="text-sm text-gray-600 mt-1">-10% from yesterday</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-medium text-gray-800 mb-4">Recent Conversations</h3>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center justify-between border-b border-gray-200 pb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">Customer #{i}</div>
                          <div className="text-sm text-gray-600">Product inquiry • 10 min ago</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Active</span>
                        <button className="text-blue-600 hover:text-blue-800">View</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Admin Tour Content */}
        {demoContent === 'admin-tour' && (
          <div className="max-w-6xl mx-auto admin-controls">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Admin Controls</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="border border-gray-200 rounded-lg p-5">
                  <h3 className="font-medium text-lg mb-4">AI Assistant Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        AI Name
                      </label>
                      <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        defaultValue="Brief Support Assistant"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Greeting Message
                      </label>
                      <textarea 
                        className="w-full border border-gray-300 rounded-md px-3 py-2 h-20"
                        defaultValue="👋 Hello! I'm your Brief Support assistant. How can I help you today?"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <input type="checkbox" id="activate-ai" className="mr-2" defaultChecked />
                      <label htmlFor="activate-ai" className="text-sm text-gray-700">
                        Enable AI Assistant
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-5">
                  <h3 className="font-medium text-lg mb-4">Knowledge Base</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <span>Product-Catalog.pdf</span>
                      </div>
                      <button className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                    </div>
                    
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded bg-green-100 flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <span>FAQ.docx</span>
                      </div>
                      <button className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                    </div>
                    
                    <button className="w-full py-2 bg-blue-50 text-blue-600 rounded-md border border-blue-200 hover:bg-blue-100 transition-colors">
                      + Add Document
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button className="px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Analytics Tour Content */}
        {demoContent === 'analytics-tour' && (
          <div className="max-w-6xl mx-auto analytics-panel">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Analytics Dashboard</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-medium text-blue-700 mb-2">Total Conversations</h3>
                  <div className="text-3xl font-bold">1,234</div>
                  <p className="text-sm text-gray-600 mt-1">+18% from last month</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-medium text-green-700 mb-2">Resolved Issues</h3>
                  <div className="text-3xl font-bold">987</div>
                  <p className="text-sm text-gray-600 mt-1">+12% from last month</p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-medium text-purple-700 mb-2">Avg. Response Time</h3>
                  <div className="text-3xl font-bold">2.3s</div>
                  <p className="text-sm text-gray-600 mt-1">-15% from last month</p>
                </div>
                
                <div className="bg-amber-50 rounded-lg p-4">
                  <h3 className="font-medium text-amber-700 mb-2">Customer Satisfaction</h3>
                  <div className="text-3xl font-bold">92%</div>
                  <p className="text-sm text-gray-600 mt-1">+5% from last month</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="border border-gray-200 rounded-lg p-5">
                  <h3 className="font-medium text-lg mb-4">Conversation Trends</h3>
                  <div className="h-64 flex items-end space-x-2">
                    {[40, 60, 30, 70, 50, 90, 80].map((height, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div 
                          className={`w-full rounded-t-sm ${i === 6 ? 'bg-primary-600' : 'bg-primary-200'}`} 
                          style={{ height: `${height}%` }}
                        ></div>
                        <div className="text-xs text-gray-500 mt-1">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-5">
                  <h3 className="font-medium text-lg mb-4">Top 5 Customer Inquiries</h3>
                  
                  <div className="space-y-4">
                    {[
                      { name: 'Product pricing questions', percentage: 28 },
                      { name: 'Availability inquiries', percentage: 22 },
                      { name: 'Technical support', percentage: 17 },
                      { name: 'Shipping information', percentage: 15 },
                      { name: 'Return policy', percentage: 12 }
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">{item.name}</span>
                          <span className="text-sm font-medium">{item.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        )}
        
        {/* Tour Completed Call-to-Action */}
        {completedSteps.length === tourSteps.length && !isTourOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-16 max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-r from-primary-800 to-primary-600 rounded-2xl overflow-hidden shadow-2xl">
              <div className="relative p-8 sm:p-12">
                {/* Background decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                  <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-primary-500 opacity-20"></div>
                  <div className="absolute top-20 right-10 w-32 h-32 rounded-full bg-primary-400 opacity-20"></div>
                  <div className="absolute bottom-10 left-32 w-40 h-40 rounded-full bg-primary-500 opacity-10"></div>
                </div>
                
                {/* Content */}
                <div className="relative z-10 text-center">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.8, bounce: 0.5 }}
                    className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8"
                  >
                    <motion.div
                      animate={{ 
                        rotate: [0, 360],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ duration: 1.5, delay: 0.2 }}
                    >
                      <Check className="w-10 h-10 text-primary-600" />
                    </motion.div>
                  </motion.div>
                  
                  <motion.h2 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-4xl sm:text-5xl font-bold text-white mb-4"
                  >
                    Tour Completed!
                  </motion.h2>
                  
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto"
                  >
                    You've experienced how Brief Support can transform your customer interactions. 
                    Ready to see it in action on your own website?
                  </motion.p>
                  
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link 
                        href="/auth/sign-up?plan=business"
                        className="inline-flex items-center justify-center bg-white text-primary-700 px-8 py-4 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all group"
                      >
                        Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link 
                        href="/contact"
                        className="inline-flex items-center justify-center bg-transparent text-white border-2 border-white/70 px-8 py-4 text-lg font-medium rounded-full transition-all hover:bg-white/10"
                      >
                        Schedule a Demo
                      </Link>
                    </motion.div>
                  </motion.div>
                </div>
                
                <div className="mt-12 text-center">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="inline-flex items-center gap-4 p-5 bg-primary-700/50 backdrop-blur-sm rounded-xl"
                  >
                    <div className="flex -space-x-2">
                      {[
                        { bg: "bg-blue-500" },
                        { bg: "bg-green-500" },
                        { bg: "bg-yellow-500" },
                      ].map((item, i) => (
                        <div key={i} className={`w-10 h-10 rounded-full ${item.bg} border-2 border-primary-700 flex items-center justify-center text-white font-bold`}>
                          {String.fromCharCode(65 + i)}
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-left">
                      <p className="text-primary-100 font-medium">Join 2,500+ businesses</p>
                      <div className="flex mt-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <motion.div 
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.9 + (i * 0.1) }}
                          >
                            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                            </svg>
                          </motion.div>
                        ))}
                        <span className="ml-1 text-primary-100 text-sm">4.9/5 rating</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Add CSS classes to the demo sections */}
      <div className="dashboard-panel">
        {/* Dashboard content */}
      </div>
      
      <div className="admin-controls">
        {/* Admin content */}
      </div>
      
      <div className="analytics-panel">
        {/* Analytics content */}
      </div>
    </main>
  )
} 