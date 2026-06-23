'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { MessageCircle, X, Minus, MessageSquare, Send, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { SUPPORT_EMAIL } from '@/constants/support'
import { motion } from 'framer-motion'

interface FeedbackBotProps {
  position?: 'bottom-right' | 'bottom-left'
  accentColor?: string
}

interface Message {
  type: 'user' | 'bot'
  content: string
  timestamp: Date
}

interface Tab {
  id: string
  label: string
  icon: React.ReactNode
}

// Enhanced conversation state tracking
interface ConversationState {
  userIntent: string | null
  currentSection: string | null
  pagesVisited: string[] | null
  technicalLevel: string | null
  currentStep: string
  hasAskedQuestion: boolean
  questionsAsked: string[]
  userProfile: {
    needsAssessment: boolean
    interestsIdentified: string[]
    featuresExplained: string[]
  }
  conversationHistory: string[]
  lastTopic: string | null
  awaitingResponseTo: string | null // Track what question we're waiting for a response to
  planRecommendation: {
    currentQuestion: string
    monthlyConversations: string | null
    teamSize: string | null
    needsCustomization: boolean | null
    needsKnowledgeBase: boolean | null
    needsHumanHandoff: boolean | null
    budget: string | null
  }
}

// Comprehensive website knowledge base
const websiteKnowledge = {
  // Add website purpose information
  purpose: {
    mainDescription: 'This website offers AI-powered customer support chatbot solutions for businesses of all sizes. Our platform helps companies automate customer service, increase sales, and improve user experience through intelligent AI assistants.',
    keyBenefits: [
      'Reduce support costs with 24/7 automated customer service',
      'Increase sales by instantly answering customer questions',
      'Improve customer satisfaction with fast, accurate responses',
      'Free up your team to focus on complex issues'
    ],
    mainFeatures: [
      'AI Chatbots customized for your business',
      'Live chat handoff to human agents when needed',
      'Knowledge base integration',
      'Analytics dashboard to track performance',
      'Seamless integration with popular platforms'
    ],
    idealFor: 'E-commerce stores, SaaS companies, service businesses, and any organization wanting to improve customer support efficiency'
  },
  
  // Add embedding information
  embedding: {
    description: 'You can easily add our chatbot to any website with just a few lines of code.',
    methods: [
      {
        name: 'JavaScript Snippet',
        description: 'Add our chatbot with a simple JavaScript snippet that you can place before the closing </body> tag of your website.',
        code: '<script src="https://cdn.briefsupport.com/widget.js" data-api-key="YOUR_API_KEY"></script>',
        benefits: ['Easiest installation method', 'Automatic updates', 'No technical knowledge required']
      },
      {
        name: 'React Component',
        description: 'If your website uses React, you can import our component directly into your codebase.',
        code: 'import { BriefSupportChat } from "@briefsupport/react";\n\n// Then in your component\n<BriefSupportChat apiKey="YOUR_API_KEY" />',
        benefits: ['Full customization options', 'Better performance', 'TypeScript support']
      },
      {
        name: 'WordPress Plugin',
        description: 'For WordPress websites, install our plugin from the WordPress plugin directory.',
        steps: [
          'Go to your WordPress admin dashboard',
          'Navigate to Plugins > Add New',
          'Search for "Brief Support Chat"',
          'Click "Install Now" and then "Activate"',
          'Go to Settings > Brief Support and enter your API key'
        ],
        benefits: ['No coding required', 'Easy configuration through WordPress admin', 'Works with any WordPress theme']
      }
    ],
    customization: {
      appearance: ['Change colors', 'Modify position', 'Custom icons', 'Change bot name'],
      behavior: ['Set welcome message', 'Configure auto-prompts', 'Define business hours', 'Set up page-specific messages'],
      advanced: ['Custom CSS', 'Event hooks', 'Multilingual support', 'Conditional display rules']
    },
    apiKey: 'You can get your API key from your Brief Support dashboard under Settings > API Keys.',
    support: `Our integration team is available to help with any custom integration needs at ${SUPPORT_EMAIL}`
  },
  
  navigation: {
    'home': {
      path: '/',
      description: 'Our landing page with an overview of all services',
      keyFeatures: ['Service overview', 'Testimonials', 'Quick access menu'],
      commonQuestions: ['How to get started', 'What services do you offer', 'Pricing information']
    },
    'features': {
      path: '/features',
      description: 'Detailed breakdown of all our platform features',
      keyFeatures: ['AI capabilities', 'Integration options', 'Customization tools'],
      commonQuestions: ['What can your platform do', 'How customizable is it', 'Technical requirements']
    },
    'pricing': {
      path: '/pricing',
      description: 'Transparent pricing for all our service tiers',
      keyFeatures: ['Free tier', 'Business plans', 'Enterprise options'],
      commonQuestions: ['How much does it cost', 'Do you offer a free trial', 'Enterprise pricing']
    },
    'blog': {
      path: '/blog',
      description: 'Latest articles, tutorials and industry insights',
      keyFeatures: ['Tutorials', 'Case studies', 'Industry news'],
      commonQuestions: ['Latest articles', 'How-to guides', 'Best practices']
    },
    'support': {
      path: '/support',
      description: 'Get help with any aspect of our platform',
      keyFeatures: ['Knowledge base', 'FAQ section', 'Contact forms'],
      commonQuestions: ['How do I contact support', 'Common issues', 'Account problems']
    },
    'conversation': {
      path: '/conversation',
      description: 'For logged-in users to manage live chats and customer conversations',
      keyFeatures: ['Live conversations', 'Chat history', 'Team collaboration'],
      commonQuestions: ['How to reply to customers', 'Live support setup', 'Conversation management']
    }
  },
  
  features: {
    'ai-chatbot': {
      name: 'AI-Powered Chatbot',
      description: 'Advanced AI assistant that can handle customer inquiries 24/7',
      benefits: ['Instant responses', 'Multilingual support', 'Learning capabilities', 'Natural conversations'],
      howToAccess: 'Go to Dashboard > Add-ons > AI Chatbot to enable this feature'
    },
    'live-chat': {
      name: 'Live Chat Handoff',
      description: 'Seamless transition from AI to human agents when needed',
      benefits: ['Human expertise', 'Complex issue resolution', 'Personal touch', 'Escalation handling'],
      howToAccess: 'Navigate to Dashboard > Support Settings > Live Chat to configure'
    },
    'knowledge-base': {
      name: 'Smart Knowledge Base',
      description: 'Integrated FAQ and documentation system',
      benefits: ['Self-service options', 'Instant answers', 'Reduced support load', 'Easy management'],
      howToAccess: 'Visit the Support page and click on "Knowledge Base" in the top navigation'
    },
    'analytics': {
      name: 'Advanced Analytics',
      description: 'Detailed insights into customer interactions and chat performance',
      benefits: ['Performance tracking', 'Customer insights', 'ROI measurement', 'Optimization data'],
      howToAccess: 'Log in to your Dashboard and select Analytics from the main menu'
    },
    'integrations': {
      name: 'Platform Integrations',
      description: 'Connect with your existing tools and workflows',
      benefits: ['Shopify integration', 'CRM sync', 'Email automation', 'API access'],
      howToAccess: 'Go to Dashboard > Settings > Integrations to set up connections'
    }
  },
  
  commonIssues: {
    'login': {
      problem: 'Unable to log in to account',
      solutions: [
        'Clear browser cookies and cache',
        'Reset your password using the "Forgot Password" link',
        'Ensure you\'re using the correct email address',
        'Try an incognito/private browsing window'
      ],
      supportLink: '/support/account-access'
    },
    'billing': {
      problem: 'Questions about billing or subscription',
      solutions: [
        'View your current plan at Dashboard > Billing',
        'Update payment methods in Account Settings',
        'Download invoices from the Billing History section',
        'Contact billing@ourwebsite.com for specific questions'
      ],
      supportLink: '/support/billing'
    },
    'performance': {
      problem: 'Website or features running slowly',
      solutions: [
        'Check your internet connection',
        'Clear browser cache and cookies',
        'Try a different browser',
        'Disable browser extensions that might interfere'
      ],
      supportLink: '/support/troubleshooting'
    },
    'feature-request': {
      problem: 'Requesting a new feature',
      solutions: [
        'Submit feature requests at Dashboard > Feedback',
        'Join our community forum to discuss ideas',
        'Check our product roadmap to see upcoming features',
        'Upvote existing requests to help prioritize development'
      ],
      supportLink: '/feedback'
    }
  },

  // Add brand/company information
  brand: {
    name: 'Brief Support',
    tagline: 'AI-powered customer support that grows your business',
    story: 'Founded in 2021 by a team of AI and customer experience experts, Brief Support was born from a simple idea: make customer support accessible, intelligent, and human. We believe every business deserves enterprise-level support tools, regardless of size.',
    mission: 'To democratize exceptional customer support through accessible AI technology that feels human, builds relationships, and drives growth.',
    values: [
      {
        title: 'Human-Centered AI',
        description: 'We create technology that enhances human connections rather than replacing them',
      },
      {
        title: 'Accessibility',
        description: 'Great support tools should be available to businesses of all sizes',
      },
      {
        title: 'Continuous Learning',
        description: 'Our systems and team constantly improve from every interaction',
      },
      {
        title: 'Transparency',
        description: 'We\'re honest about what AI can and can\'t do, with clear communication at every step',
      },
    ],
    team: [
      {
        name: 'Sarah Chen',
        title: 'CEO & Co-founder',
        background: 'Former Head of AI at Enterprise Support Solutions',
      },
      {
        name: 'Marcus Rodriguez',
        title: 'CTO & Co-founder',
        background: 'Machine Learning Engineer with 15+ years experience',
      },
      {
        name: 'Aisha Johnson',
        title: 'Chief Customer Officer',
        background: 'Customer experience expert from leading tech companies',
      },
    ],
    awards: [
      '2023 AI Innovation Award',
      '2022 Best SaaS for Small Business',
      'Featured in TechCrunch, Forbes, and Entrepreneur',
    ],
    socialImpact: 'Through our "Support for All" initiative, we provide free AI tools to non-profits and educational institutions, helping over 500 organizations worldwide.',
  },

  // Intent patterns for better understanding
  intentPatterns: {
    navigation: ['find', 'where is', 'how do I get to', 'looking for', 'can\'t find', 'navigate', 'go to', 'access', 'where can I find'],
    features: ['what can', 'how does', 'capabilities', 'functionality', 'what do', 'can it', 'does it', 'feature', 'tool'],
    troubleshooting: ['not working', 'issue', 'problem', 'error', 'trouble', 'help', 'fix', 'broken', 'can\'t', 'unable to'],
    account: ['login', 'password', 'account', 'profile', 'settings', 'sign up', 'register', 'forgot', 'reset'],
    pricing: ['price', 'prices', 'pricing', 'cost', 'costs', 'how much', 'plans', 'subscription', 'fee', 'budget', 'expensive', 'cheap', 'affordable', 'payment', 'pay', 'monthly', 'annual', 'billing'],
    contact: ['speak', 'human', 'contact', 'email', 'phone', 'call', 'support', 'help desk', 'representative', 'agent'],
    brand: ['brand', 'company', 'about you', 'who are you', 'story', 'mission', 'values', 'team', 'history', 'background', 'founded', 'founder'],
    website: ['website about', 'site about', 'what is this', 'purpose of this', 'what does this', 'what do you do', 'what do you offer', 'what is your product', 'service', 'what does your company do'],
    embedding: ['embed', 'embedding', 'install', 'installation', 'integrate', 'integration', 'add to my website', 'add to my site', 'put on my website', 'add chatbot', 'add chat', 'implement', 'script', 'code', 'snippet', 'wordpress', 'plugin', 'react', 'javascript']
  }
}

// Message bubble component with improved styling
const MessageBubble = ({ message, accentColor }: { message: Message; accentColor: string }) => {
  const isBot = message.type === 'bot'
  
  return (
    <div className={cn(
      "flex items-start gap-3 group relative py-2",
      !isBot && "flex-row-reverse"
    )}>
      {/* Avatar */}
      {isBot ? (
        <Avatar className="w-9 h-9 border border-gray-50 shadow-sm">
          <div className="w-full h-full flex items-center justify-center bg-white">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-4/5 h-4/5">
              <defs>
                <radialGradient id="messageBubbleStarGradient" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="70%" stopColor={accentColor} stopOpacity="0.9" />
                </radialGradient>
              </defs>
              <path d="M50,10 C55,30 70,45 90,50 C70,55 55,70 50,90 C45,70 30,55 10,50 C30,45 45,30 50,10 Z" 
                fill="url(#messageBubbleStarGradient)" 
              />
            </svg>
          </div>
          <AvatarFallback style={{ background: '#f5f5f5' }}>
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-4/5 h-4/5">
              <defs>
                <radialGradient id="messageBubbleStarGradientFallback" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="70%" stopColor={accentColor} stopOpacity="0.9" />
                </radialGradient>
              </defs>
              <path d="M50,10 C55,30 70,45 90,50 C70,55 55,70 50,90 C45,70 30,55 10,50 C30,45 45,30 50,10 Z" 
                fill="url(#messageBubbleStarGradientFallback)" 
              />
            </svg>
          </AvatarFallback>
        </Avatar>
      ) : (
        <Avatar className="w-9 h-9 border border-gray-50 shadow-sm">
          <AvatarImage
            src="https://avataaars.io/?avatarStyle=Circle&topType=ShortHairDreads&accessoriesType=Blank&hairColor=Black&facialHairType=Blank&clotheType=Hoodie&clotheColor=Gray02&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light"
            alt="User"
          />
          <AvatarFallback>
            <User className="w-5 h-5 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message bubble */}
      <motion.div
        initial={{ scale: 0.98, opacity: 0, y: 5 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn(
          "flex flex-col gap-1 max-w-[85%]",
          isBot ? "items-start" : "items-end"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm shadow-md",
            isBot 
              ? "bg-white text-gray-800 border border-gray-100 rounded-tl-sm" 
              : "text-white rounded-tr-sm"
          )}
          style={isBot ? 
            { 
              backgroundColor: 'white', 
              color: '#374151', 
              borderColor: `${accentColor}15`,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            } : { 
              backgroundColor: accentColor,
              boxShadow: `0 2px 8px ${accentColor}25`
            }
          }
        >
          <div className="whitespace-pre-line break-words hyphens-auto" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
            {message.content}
          </div>
        </div>
        
        {/* Timestamp */}
        <div className="text-[10px] text-gray-500 opacity-70 pt-1 px-1">
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true
          })}
        </div>
      </motion.div>
    </div>
  )
}

// Typing indicator component
const TypingIndicator = ({ accentColor = '#4285f4' }) => (
  <div className="flex items-start gap-3 py-2">
    <Avatar className="w-9 h-9 border border-gray-50 shadow-sm">
      <div className="w-full h-full flex items-center justify-center bg-white">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-4/5 h-4/5">
          <defs>
            <radialGradient id="typingStarGradient" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="70%" stopColor={accentColor} stopOpacity="0.9" />
            </radialGradient>
          </defs>
          <path d="M50,10 C55,30 70,45 90,50 C70,55 55,70 50,90 C45,70 30,55 10,50 C30,45 45,30 50,10 Z" 
            fill="url(#typingStarGradient)" 
          />
        </svg>
      </div>
      <AvatarFallback style={{ background: '#f5f5f5' }}>
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-4/5 h-4/5">
          <defs>
            <radialGradient id="typingStarGradientFallback" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="70%" stopColor={accentColor} stopOpacity="0.9" />
            </radialGradient>
          </defs>
          <path d="M50,10 C55,30 70,45 90,50 C70,55 55,70 50,90 C45,70 30,55 10,50 C30,45 45,30 50,10 Z" 
            fill="url(#typingStarGradientFallback)" 
          />
        </svg>
      </AvatarFallback>
    </Avatar>
    
    <motion.div
      initial={{ scale: 0.98, opacity: 0, y: 5 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex flex-col gap-1 max-w-[85%]"
    >
      <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 rounded-tl-sm">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: accentColor }}></div>
          <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: accentColor, animationDelay: '0.2s' }}></div>
          <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: accentColor, animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </motion.div>
  </div>
)

// Add a new interface for suggested questions
interface SuggestedQuestion {
  text: string
  icon?: React.ReactNode
}

export default function WebsiteFeedbackBot({ 
  position = 'bottom-right',
  accentColor = '#4f46e5' 
}: FeedbackBotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [message, setMessage] = useState('')
  const [conversation, setConversation] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const [showBubble, setShowBubble] = useState(false)
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [shuffledMessages, setShuffledMessages] = useState<string[]>([])
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>([])
  const [conversationState, setConversationState] = useState<ConversationState>({
    userIntent: null,
    currentSection: null,
    pagesVisited: [],
    technicalLevel: null,
    currentStep: 'greeting',
    hasAskedQuestion: false,
    questionsAsked: [],
    userProfile: {
      needsAssessment: false,
      interestsIdentified: [],
      featuresExplained: []
    },
    conversationHistory: [],
    lastTopic: null,
    awaitingResponseTo: null,
    planRecommendation: {
      currentQuestion: 'none',
      monthlyConversations: null,
      teamSize: null,
      needsCustomization: null,
      needsKnowledgeBase: null,
      needsHumanHandoff: null,
      budget: null
    }
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Rotating bubble messages
  const bubbleMessages = [
    "👋 Hey there!",
    "💬 Need help?",
    "🤔 Got questions?",
    "✨ Let's chat!",
    "💡 I'm here to help!",
    "🚀 Want to know more?",
    "🎯 Ready to start?",
    "😊 How can I assist?",
    "🔥 Let's get started!",
    "💫 Ask me anything!",
    "🌟 Need guidance?",
    "🎊 Hi! Let's talk!",
    "🤝 I'm your assistant!",
    "⚡ Quick question?",
    "🎨 Looking for help?"
  ]

  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array: string[]) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Define tabs with icons similar to the attachment
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
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M12 17h.01" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      )
    },
  ]

  // Define greeting message that will be shown when the bot is first opened
  const greetingMessage = {
    type: 'bot' as const,
    content: `Hi there! 👋 I'm your website assistant.

I can help you navigate our site, explain features, troubleshoot issues, or answer any questions you might have.

What would you like help with today?`,
    timestamp: new Date()
  }

  // Advanced intent detection system
  const detectIntent = (input: string): string[] => {
    const lower = input.toLowerCase()
    const detectedIntents: string[] = []

    // Check against all intent patterns
    Object.entries(websiteKnowledge.intentPatterns).forEach(([intent, patterns]) => {
      if (patterns.some(pattern => lower.includes(pattern))) {
        detectedIntents.push(intent)
      }
    })

    // Specific handling for pricing questions
    if (
      (lower.includes('price') || lower.includes('pricing') || lower.includes('cost')) ||
      (lower.includes('how') && lower.includes('much')) ||
      (lower.match(/what.*(?:price|cost|plan|payment)/i)) ||
      (lower.match(/(?:prices|costs).*(?:website|service|product)/i))
    ) {
      if (!detectedIntents.includes('pricing')) {
        detectedIntents.push('pricing')
      }
    }

    // Check for "what is this website about" type questions
    if (lower.includes('what') && (lower.includes('website') || lower.includes('site'))) {
      detectedIntents.push('website_purpose')
    }

    // Check for specific page/section mentions
    Object.keys(websiteKnowledge.navigation).forEach(page => {
      if (lower.includes(page)) {
        detectedIntents.push(`navigate_to_${page}`)
      }
    })

    // Check for feature inquiries
    Object.keys(websiteKnowledge.features).forEach(feature => {
      if (lower.includes(feature.replace('-', ' '))) {
        detectedIntents.push(`feature_${feature}`)
      }
    })

    // Check for common issues
    Object.keys(websiteKnowledge.commonIssues).forEach(issue => {
      if (lower.includes(issue)) {
        detectedIntents.push(`issue_${issue}`)
      }
    })

    return detectedIntents
  }

  // Enhanced conversation analyzer with better context understanding
  const analyzeUserInput = (input: string, state: ConversationState) => {
    const lower = input.toLowerCase()
    const intents = detectIntent(input)
    
    // Update conversation state based on input
    const newState = { ...state }
    
    // Add to conversation history
    newState.conversationHistory.push(lower)
    
    // Check if we're waiting for a response to a specific question
    if (newState.awaitingResponseTo === 'pricing_plan_selection' && 
        (lower.includes('yes') || lower.match(/^yes$/) || lower === 'y' || 
         lower.includes('help') || lower.includes('please') || 
         lower.includes('choose') || lower.includes('select'))) {
      newState.currentStep = 'pricing_plan_recommendation'
      newState.lastTopic = 'pricing'
      newState.awaitingResponseTo = 'monthly_conversations'
      newState.planRecommendation.currentQuestion = 'monthly_conversations'
      return newState
    }
    
    // Handle plan recommendation responses
    if (newState.currentStep === 'pricing_plan_recommendation') {
      switch (newState.planRecommendation.currentQuestion) {
        case 'monthly_conversations':
          // Store the answer about monthly conversations
          newState.planRecommendation.monthlyConversations = input
          // Move to next question
          newState.planRecommendation.currentQuestion = 'team_size'
          newState.awaitingResponseTo = 'team_size'
          return newState
          
        case 'team_size':
          // Store the answer about team size
          newState.planRecommendation.teamSize = input
          // Move to next question
          newState.planRecommendation.currentQuestion = 'customization'
          newState.awaitingResponseTo = 'customization'
          return newState
          
        case 'customization':
          // Store the answer about customization
          newState.planRecommendation.needsCustomization = 
            lower.includes('yes') || lower.includes('need') || lower.includes('important')
          // Move to next question
          newState.planRecommendation.currentQuestion = 'knowledge_base'
          newState.awaitingResponseTo = 'knowledge_base'
          return newState
          
        case 'knowledge_base':
          // Store the answer about knowledge base
          newState.planRecommendation.needsKnowledgeBase = 
            lower.includes('yes') || lower.includes('need') || lower.includes('important')
          // Move to next question
          newState.planRecommendation.currentQuestion = 'human_handoff'
          newState.awaitingResponseTo = 'human_handoff'
          return newState
          
        case 'human_handoff':
          // Store the answer about human handoff
          newState.planRecommendation.needsHumanHandoff = 
            lower.includes('yes') || lower.includes('need') || lower.includes('important')
          // Move to next question
          newState.planRecommendation.currentQuestion = 'budget'
          newState.awaitingResponseTo = 'budget'
          return newState
          
        case 'budget':
          // Store the answer about budget
          newState.planRecommendation.budget = input
          // Move to recommendation
          newState.planRecommendation.currentQuestion = 'provide_recommendation'
          newState.awaitingResponseTo = null
          // Make sure we stay in the pricing_plan_recommendation step
          newState.currentStep = 'pricing_plan_recommendation'
          // Keep the topic as pricing
          newState.lastTopic = 'pricing'
          return newState
      }
    }
    
    // Prioritize certain intents
    // Handle pricing questions with high priority
    if (intents.includes('pricing') || 
        lower.includes('price') || 
        lower.includes('cost') || 
        lower.match(/how much/i) ||
        lower.match(/what are.*(?:prices|costs|plans)/i)) {
      newState.currentStep = 'pricing_info'
      newState.lastTopic = 'pricing'
      newState.awaitingResponseTo = 'pricing_plan_selection'
      // Reset plan recommendation state
      newState.planRecommendation = {
        currentQuestion: 'none',
        monthlyConversations: null,
        teamSize: null,
        needsCustomization: null,
        needsKnowledgeBase: null,
        needsHumanHandoff: null,
        budget: null
      }
      return newState
    }
    
    // Website purpose question
    if (intents.includes('website') || intents.includes('website_purpose')) {
      newState.currentStep = 'website_purpose'
      newState.lastTopic = 'website'
    }
    
    // Navigation intent detection
    if (intents.includes('navigation')) {
      newState.currentStep = 'navigation_help'
      newState.lastTopic = 'navigation'
      
      // Detect specific page references
      Object.keys(websiteKnowledge.navigation).forEach(page => {
        if (lower.includes(page)) {
          newState.currentSection = page
        }
      })
    }
    
    // Feature exploration detection
    if (intents.includes('features')) {
      newState.currentStep = 'feature_explanation'
      newState.lastTopic = 'features'
      
      // Record specific features mentioned
      Object.keys(websiteKnowledge.features).forEach(feature => {
        const featureName = feature.replace('-', ' ')
        if (lower.includes(featureName)) {
          if (!newState.userProfile.interestsIdentified.includes(feature)) {
            newState.userProfile.interestsIdentified.push(feature)
          }
        }
      })
    }
    
    // Brand information request
    if (intents.includes('brand')) {
      newState.currentStep = 'brand_info'
      newState.lastTopic = 'brand'
    }
    
    // Troubleshooting detection
    if (intents.includes('troubleshooting')) {
      newState.currentStep = 'troubleshooting'
      newState.lastTopic = 'issues'
      
      // Identify specific issues
      Object.keys(websiteKnowledge.commonIssues).forEach(issue => {
        if (lower.includes(issue)) {
          newState.userIntent = `fix_${issue}`
        }
      })
    }
    
    // Account related queries
    if (intents.includes('account')) {
      newState.currentStep = 'account_help'
      newState.lastTopic = 'account'
    }
    
    // Contact requests
    if (intents.includes('contact')) {
      newState.currentStep = 'contact_info'
      newState.lastTopic = 'contact'
    }
    
    // Remember what we've discussed
    if (!newState.questionsAsked.includes(lower)) {
      newState.questionsAsked.push(lower)
    }
    
    return newState
  }

  // Intelligent response generation with much better context awareness
  const generateResponse = (input: string, state: ConversationState): string => {
    const lower = input.toLowerCase()
    const intents = detectIntent(input)
    
    // Handle simple greetings
    if (lower.match(/^(hi|hello|hey|good morning|good afternoon|good evening)!?$/)) {
      return `Hello! 👋 I'm here to help you navigate our website and answer any questions. Would you like to learn about our features, find specific information, or get help with an issue?`
    }
    
    // IMPORTANT: Moved this section down and made it more specific to avoid catching 'yes' responses meant for other flows
    if (lower.match(/^(thanks|thank you|okay|ok|sure|no problem)!?$/) && 
        state.awaitingResponseTo !== 'pricing_plan_selection') {
      if (state.lastTopic) {
        return `You're welcome! 😊 Is there anything else you'd like to know about ${state.lastTopic === 'navigation' ? 'navigating our site' : 
                                                                               state.lastTopic === 'features' ? 'our features' : 
                                                                               state.lastTopic === 'issues' ? 'troubleshooting' : 
                                                                               state.lastTopic === 'account' ? 'account management' : 
                                                                               state.lastTopic === 'pricing' ? 'our pricing' : 
                                                                               state.lastTopic === 'brand' ? 'our company' : 
                                                                               'our website'}?`
      }
      return `You're welcome! 😊 What else can I help you with?`
    }

    // Website purpose explanation
    if (intents.includes('website') || intents.includes('website_purpose') || 
        lower.includes('what is this website') || lower.includes('what is this site about')) {
      const purpose = websiteKnowledge.purpose
      
      return `✨ BRIEF SUPPORT IS AN AI CHATBOT PLATFORM FOR BUSINESSES ✨

${purpose.mainDescription}

MAIN FEATURES:
• ${purpose.mainFeatures[0]}
• ${purpose.mainFeatures[1]}
• ${purpose.mainFeatures[3]}

BENEFITS:
• ${purpose.keyBenefits[0]}
• ${purpose.keyBenefits[1]}

Perfect for: ${purpose.idealFor.split(',')[0]}, ${purpose.idealFor.split(',')[1]} and more.

Would you like to learn about our pricing or specific features?`
    }

    // Brand information
    if (intents.includes('brand') || lower.includes('about your brand') || lower.includes('about your company')) {
      const brand = websiteKnowledge.brand
      
      return `✨ WELCOME TO ${brand.name.toUpperCase()} ✨

"${brand.tagline}"

OUR STORY:
${brand.story.split('. ')[0]}. ${brand.story.split('. ')[1]}

OUR MISSION:
${brand.mission}

CORE VALUES:
• Human-Centered AI - ${brand.values[0].description}
• Accessibility - ${brand.values[1].description}

LEADERSHIP:
• ${brand.team[0].name}, ${brand.team[0].title}
• ${brand.team[1].name}, ${brand.team[1].title}

RECOGNITION:
${brand.awards[0]}
${brand.awards[1]}

Want to know more about our products or pricing?`
    }

    // Navigation assistance
    if (intents.includes('navigation') || intents.some(i => i.startsWith('navigate_to_'))) {
      // If specific page is mentioned
      for (const [page, details] of Object.entries(websiteKnowledge.navigation)) {
        if (lower.includes(page) || intents.includes(`navigate_to_${page}`)) {
          const pageDetails = details as {
            path: string;
            description: string;
            keyFeatures: string[];
            commonQuestions: string[];
          }
          
          return `Our ${page} section includes:

${pageDetails.description}

Key features:
${pageDetails.keyFeatures.map(f => `• ${f}`).join('\n')}

Would you like me to help you with anything specific about our ${page}?`
        }
      }
      
      // General navigation help
      return `I can help you navigate our website! Here are the main sections:

🏠 HOME - Overview of our services
✨ FEATURES - See what we offer
💰 PRICING - Our pricing plans
📚 BLOG - Articles and tutorials
🔧 SUPPORT - Get help with our products
👤 DASHBOARD - For logged-in users

Which section would you like to know more about?`
    }

    // Feature explanation
    if (intents.includes('features') || intents.some(i => i.startsWith('feature_'))) {
      // If specific feature is mentioned
      for (const [feature, details] of Object.entries(websiteKnowledge.features)) {
        if (lower.includes(feature.replace('-', ' ')) || intents.includes(`feature_${feature}`)) {
          const featureDetails = details as {
            name: string;
            description: string;
            benefits: string[];
            howToAccess: string;
          }
          
          // Add to explained features
          if (!state.userProfile.featuresExplained.includes(feature)) {
            const newState = {...state}
            newState.userProfile.featuresExplained.push(feature)
            setConversationState(newState)
          }
          
          return `${featureDetails.name.toUpperCase()}

${featureDetails.description}

KEY BENEFITS:
${featureDetails.benefits.map(b => `• ${b}`).join('\n')}

HOW TO ACCESS:
${featureDetails.howToAccess}

Is there anything specific about this feature you'd like to know?`
        }
      }
      
      // General features overview
      return `Here are the main features our platform offers:

🤖 AI-POWERED CHATBOT - Advanced assistant for customer inquiries
💬 LIVE CHAT HANDOFF - Seamless transition to human agents  
📚 SMART KNOWLEDGE BASE - Integrated FAQ and documentation
📊 ADVANCED ANALYTICS - Insights into customer interactions
🔗 PLATFORM INTEGRATIONS - Connect with your existing tools

Which feature would you like to learn more about?`
    }

    // Troubleshooting help
    if (intents.includes('troubleshooting') || intents.some(i => i.startsWith('issue_'))) {
      // If specific issue is mentioned
      for (const [issue, details] of Object.entries(websiteKnowledge.commonIssues)) {
        if (lower.includes(issue) || intents.includes(`issue_${issue}`)) {
          const issueDetails = details as {
            problem: string;
            solutions: string[];
            supportLink: string;
          }
          
          return `I see you're having an issue with ${issue}. Here are some solutions:

${issueDetails.solutions.map((s, i) => `${i+1}. ${s}`).join('\n')}

If these don't work, our support team is ready to help. Would you like me to connect you with them?`
        }
      }
      
      // General troubleshooting
      return `I'm sorry to hear you're having issues. Here are some common problems I can help with:

🔑 LOGIN ISSUES - Help accessing your account
💳 BILLING QUESTIONS - Subscription and payment help
⚡ PERFORMANCE PROBLEMS - If the site is running slowly
💡 FEATURE REQUESTS - How to suggest new features

What specific issue are you experiencing?`
    }

    // Account help
    if (intents.includes('account')) {
      if (lower.includes('login') || lower.includes('sign in')) {
        return `To log in to your account:

1. Click the "Log In" button in the top right corner of any page
2. Enter your email address and password
3. Click "Sign In"

If you've forgotten your password, click the "Forgot Password" link on the login page.

If you're still having trouble, our support team is available to help via live chat or email.`
      }
      
      if (lower.includes('sign up') || lower.includes('register')) {
        return `To create a new account:

1. Click the "Sign Up" button in the top right corner
2. Enter your email address
3. Create a password
4. Fill in your profile information
5. Click "Create Account"

You'll receive a confirmation email to verify your address.

We offer a free plan to get started, no credit card required!`
      }
      
      return `I can help with your account! Here are common account-related topics:

👤 PROFILE SETTINGS - Update your information in Dashboard > Profile
🔐 PASSWORD RESET - Use the "Forgot Password" link on the login page
📧 EMAIL PREFERENCES - Manage notifications in Dashboard > Settings > Notifications
💳 BILLING INFORMATION - Update payment methods in Dashboard > Billing

What specific account help do you need?`
    }

    // Pricing information
    if (intents.includes('pricing') || state.currentStep === 'pricing_info') {
      // Set awaiting response for follow-up
      setConversationState(prevState => ({
        ...prevState,
        awaitingResponseTo: 'pricing_plan_selection'
      }))
      
      return `Our pricing is designed to fit businesses of all sizes:

✨ FREE PLAN - $0/month
• AI chatbot with basic features
• Up to 100 conversations/month
• Standard response templates
• Community support

🚀 STARTER PLAN - $29/month
• AI chatbot with advanced features
• Up to 1,000 conversations/month
• Custom branding and templates
• Email & chat support
• Knowledge base integration

💼 BUSINESS PLAN - $89/month
• Everything in Starter plus:
• Up to 10,000 conversations/month
• Advanced analytics dashboard
• Priority support
• Full customization options
• API access

🏢 ENTERPRISE - Custom pricing
• Unlimited conversations
• Custom AI training
• Dedicated account manager
• Advanced security features
• Custom integrations
• SLA guarantees

💼 PRO PLAN - £15/month
• Everything in Standard plus:
• Up to 10,000 conversations/month
• Advanced analytics dashboard
• Priority support
• Full customization options
• API access

All plans come with a 14-day free trial, no credit card required!

Would you like me to help you choose the right plan for your business?`
    }

    // Plan recommendation - now with step-by-step questions
    if (state.currentStep === 'pricing_plan_recommendation') {
      // Reset the state if we're just starting
      if (state.awaitingResponseTo === 'pricing_plan_selection' && 
          (lower.includes('yes') || lower.match(/^yes$/) || lower === 'y' || 
           lower.includes('help') || lower.includes('please') || 
           lower.includes('choose') || lower.includes('select'))) {
        
        setConversationState(prevState => ({
          ...prevState,
          awaitingResponseTo: 'monthly_conversations',
          planRecommendation: {
            ...prevState.planRecommendation,
            currentQuestion: 'monthly_conversations'
          }
        }))
        
        return `I'd be happy to help you choose the right plan! Let's go through a few questions one at a time.

First, approximately how many customer conversations do you handle each month?`
      }
      
      // Handle each question in sequence
      switch (state.planRecommendation.currentQuestion) {
        case 'monthly_conversations':
          return `Great! Now, how many team members will need access to the platform?`
          
        case 'team_size':
          return `Thanks! Do you need advanced customization options for your chatbot? (Yes/No)`
          
        case 'customization':
          return `Is knowledge base integration important for your business? (Yes/No)`
          
        case 'knowledge_base':
          return `Do you require the ability to hand off conversations to human agents? (Yes/No)`
          
        case 'human_handoff':
          return `Last question: What's your monthly budget for customer support tools?`
          
        case 'provide_recommendation':
          // Analyze answers and provide a recommendation
          let recommendedPlan = 'Free'
          const planData = state.planRecommendation
          
          // Simple logic for plan recommendation based on needs
          const conversationCount = parseInt(planData.monthlyConversations || '0')
          const teamCount = parseInt(planData.teamSize || '0')
          const budget = parseInt(planData.budget?.replace(/\D+/g, '') || '0')
          
          // Human handoff is a key feature that pushes toward Standard plan
          if (planData.needsHumanHandoff) {
            recommendedPlan = 'Standard'
          }
          
          if (conversationCount > 10000 || teamCount > 20 || 
              (planData.needsCustomization && planData.needsKnowledgeBase && planData.needsHumanHandoff)) {
            recommendedPlan = 'Enterprise'
          } else if (conversationCount > 1000 || teamCount > 5 || 
                    (planData.needsCustomization && planData.needsKnowledgeBase)) {
            recommendedPlan = 'Business'
          } else if (conversationCount > 100 || planData.needsKnowledgeBase || planData.needsHumanHandoff) {
            recommendedPlan = 'Standard'
          }
          
          // Budget consideration might override other recommendations
          if (budget < 20 && recommendedPlan !== 'Free') {
            return `Based on your needs, I would recommend our Standard Plan, but I noticed your budget is $${budget}, which is below our Standard Plan price of $29/month.

You might want to start with our Free Plan and upgrade later as your needs grow:

✨ FREE PLAN - $0/month
• AI chatbot with basic features
• Up to 100 conversations/month
• Standard response templates
• Community support

However, since you need human handoff capabilities, you may want to consider our Standard Plan which is free and includes this feature.

Would you like more information about either of these plans or would you like to try the Free Plan with our 14-day trial of premium features?`
          }
          
          if (budget >= 20 && budget < 75 && recommendedPlan === 'Business') {
            recommendedPlan = 'Standard'
            return `Based on your needs, I would recommend our Business Plan, but since your budget is $${budget}, our Standard Plan which is free might be a better fit:

🚀 STANDARD PLAN - Free
• AI chatbot with basic features
• Up to 1,000 conversations/month
• Basic branding
• Email support
• Basic knowledge base integration
• Human handoff capabilities

This plan should accommodate your team of ${planData.teamSize} members and provide the human handoff feature you requested.

Would you like to try this plan with our 14-day free trial?`
          }
          
          return `Based on your needs, I recommend our ${recommendedPlan} Plan.

${recommendedPlan === 'Free' ? '✨ FREE PLAN - $0/month\n• AI chatbot with basic features\n• Up to 100 conversations/month\n• Standard response templates\n• Community support' : 
    recommendedPlan === 'Standard' ? '🚀 STANDARD PLAN - Free\n• AI chatbot with basic features\n• Up to 1,000 conversations/month\n• Basic branding\n• Email support\n• Basic knowledge base integration\n• Human handoff capabilities' :
    recommendedPlan === 'Business' ? '💼 PRO PLAN - £15/month\n• Everything in Standard plus:\n• Up to 10,000 conversations/month\n• Advanced analytics dashboard\n• Priority support\n• Full customization options\n• API access' :
    '🏢 ENTERPRISE - Custom pricing\n• Unlimited conversations\n• Custom AI training\n• Dedicated account manager\n• Advanced security features\n• Custom integrations\n• SLA guarantees'}

This plan should accommodate your needs for ${planData.monthlyConversations} monthly conversations and ${planData.teamSize} team members, while providing the human handoff feature you require.

Would you like more information about this plan or would you like to try it with our 14-day free trial?`
      }
    }

    // Contact information
    if (intents.includes('contact')) {
      return `Here's how you can reach our team:

📧 EMAIL SUPPORT
• General inquiries: ${SUPPORT_EMAIL}
• Technical support: ${SUPPORT_EMAIL}
• Billing questions: ${SUPPORT_EMAIL}

💬 LIVE CHAT
• Available Monday-Friday, 9am-5pm EST
• Click the chat icon in the bottom right of any page

📞 PHONE SUPPORT (Business & Enterprise plans)
• Call (555) 123-4567
• Available Monday-Friday, 9am-5pm EST

🌐 HELP CENTER
• Browse our knowledge base for instant answers to common questions

Is there something specific you'd like help with?`
    }

    // General website overview if nothing specific is detected - MAKE SURE THIS DOESN'T OVERRIDE SPECIFIC FLOWS
    if (intents.length === 0 && state.currentStep !== 'pricing_plan_recommendation') {
      return `I'm here to help you get the most out of our website! Here's what I can do:

🧭 NAVIGATION ASSISTANCE - Help you find what you're looking for
🔍 FEATURE EXPLANATION - Show you how our tools work
🛠️ TROUBLESHOOTING - Solve common issues
📋 ACCOUNT HELP - Assist with login, registration, or settings
💰 PRICING INFO - Explain our plans and pricing
📞 CONTACT DETAILS - Connect you with our team

Just let me know what you need help with!`
    }

    // Smart fallback that encourages engagement
    const fallbackResponses = [
      `I want to make sure I understand your question correctly. Are you looking for:

🧭 WEBSITE NAVIGATION - Finding your way around
🔍 FEATURE INFORMATION - Learning what we offer
🛠️ TECHNICAL HELP - Fixing an issue
📋 ACCOUNT ASSISTANCE - Login or settings help
💰 PRICING DETAILS - Understanding our plans

Could you clarify what you're looking for?`,

      `I'd like to help you better! Could you tell me more specifically what you're looking for? I can help with:

- Finding specific pages or information
- Explaining how our features work
- Troubleshooting common issues
- Account and billing questions
- Connecting you with our support team

What would be most helpful right now?`,

      `I'm not quite sure what you're asking. I can help you with:

- Navigating our website
- Understanding our features
- Solving technical problems
- Managing your account
- Learning about our pricing

Could you please rephrase your question?`
    ]

    // Embedding information
    if (intents.includes('embedding') || 
        lower.match(/how (?:do|can) I (?:embed|add|install|integrate|implement|put)/i) ||
        lower.includes('embed') || lower.includes('add to my website') || 
        lower.includes('add the chatbot') || lower.includes('integrate the chatbot')) {
      
      const embedding = websiteKnowledge.embedding
      
      return `✨ ADDING OUR CHATBOT TO YOUR WEBSITE ✨

${embedding.description}

THREE EASY WAYS TO EMBED:

1️⃣ JAVASCRIPT SNIPPET (Recommended for most websites)
${embedding.methods[0].code}
• ${embedding.methods[0].benefits[0]}
• ${embedding.methods[0].benefits[1]}

2️⃣ REACT COMPONENT (For React websites)
${embedding.methods[1].code}
• ${embedding.methods[1].benefits[0]}

3️⃣ WORDPRESS PLUGIN (For WordPress sites)
• Install our plugin from the WordPress plugin directory
• Configure in your WordPress admin

CUSTOMIZATION OPTIONS:
• Change colors and position
• Set welcome messages
• Page-specific behavior
• Multi-language support

API KEY:
${embedding.apiKey}

Need help with installation? Our integration team is ready to assist at ${embedding.support}

Would you like more details on a specific installation method?`
    }

    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
  }

  // Simulate bot typing
  const simulateTyping = useCallback((response: string, delay = 500) => {
    setIsTyping(true)
    
    // More natural typing delay based on response length
    const baseDelay = 600
    const perCharDelay = 8
    const maxDelay = 2000
    const typingDelay = Math.min(baseDelay + (response.length * perCharDelay), maxDelay)
    
    setTimeout(() => {
      setIsTyping(false)
      setConversation(prev => [...prev, {
        type: 'bot',
        content: response,
        timestamp: new Date()
      }])
    }, typingDelay)
  }, [])

  // Generate suggested questions based on conversation state
  const generateSuggestedQuestions = useCallback((state: ConversationState): SuggestedQuestion[] => {
    // Default suggestions for new conversations
    if (conversation.length <= 1) {
      return [
        { text: "What features do you offer?", icon: "✨" },
        { text: "How much does it cost?", icon: "💰" },
        { text: "How do I get started?", icon: "🚀" },
        { text: "How can I embed the chatbot?", icon: "🔌" }
      ]
    }

    // Context-aware suggestions based on the last topic
    switch (state.lastTopic) {
      case 'pricing':
        return [
          { text: "Tell me about the free plan", icon: "🆓" },
          { text: "What's included in the Business plan?", icon: "💼" },
          { text: "Do you offer a free trial?", icon: "🔄" },
          { text: "Help me choose a plan", icon: "🤔" }
        ]
      case 'features':
        return [
          { text: "How does the AI chatbot work?", icon: "🤖" },
          { text: "What is knowledge base integration?", icon: "📚" },
          { text: "Tell me about analytics", icon: "📊" },
          { text: "How do I customize the chatbot?", icon: "🎨" }
        ]
      case 'website':
      case 'navigation':
        return [
          { text: "Where is the pricing page?", icon: "💰" },
          { text: "How do I find support?", icon: "🔧" },
          { text: "Where is the dashboard?", icon: "👤" },
          { text: "How do I contact you?", icon: "📞" }
        ]
      case 'brand':
        return [
          { text: "Who are your customers?", icon: "👥" },
          { text: "When was the company founded?", icon: "🏢" },
          { text: "What makes you different?", icon: "🌟" },
          { text: "Who is on your team?", icon: "👩‍💼" }
        ]
      case 'account':
        return [
          { text: "How do I reset my password?", icon: "🔑" },
          { text: "How do I update billing info?", icon: "💳" },
          { text: "Can I change my plan?", icon: "🔄" },
          { text: "How do I cancel my account?", icon: "❌" }
        ]
      case 'issues':
        return [
          { text: "I can't log in", icon: "🔒" },
          { text: "The site is loading slowly", icon: "⏱️" },
          { text: "How do I contact support?", icon: "🆘" },
          { text: "I found a bug", icon: "🐛" }
        ]
      default:
        // General questions if we don't have a specific context
        return [
          { text: "What features do you offer?", icon: "✨" },
          { text: "How much does it cost?", icon: "💰" },
          { text: "How do I embed the chatbot?", icon: "🔌" },
          { text: "Can I talk to a human?", icon: "👤" }
        ]
    }
  }, [conversation.length])

  // Update suggested questions when conversation state changes
  useEffect(() => {
    const newSuggestions = generateSuggestedQuestions(conversationState)
    setSuggestedQuestions(newSuggestions)
  }, [conversationState, generateSuggestedQuestions])

  // Handle sending messages - uses real AI with local fallback
  const handleSendMessage = useCallback(async (e?: React.FormEvent, suggestedText?: string) => {
    if (e) e.preventDefault()
    
    const messageToSend = suggestedText || message
    
    if (!messageToSend.trim()) return
    
    setConversation(prev => [...prev, {
      type: 'user',
      content: messageToSend,
      timestamp: new Date()
    }])
    
    const newState = analyzeUserInput(messageToSend, conversationState)
    newState.hasAskedQuestion = true
    newState.questionsAsked.push(messageToSend.toLowerCase())
    setConversationState(newState)
    setMessage('')
    setIsTyping(true)

    const history = [...conversation, {
      type: 'user' as const,
      content: messageToSend,
      timestamp: new Date(),
    }].map((msg) => ({
      role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.content,
    }))

    let response = ''

    try {
      const apiResponse = await fetch('/api/landing-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })

      if (apiResponse.ok) {
        const data = await apiResponse.json()
        response = data.response?.trim() || ''
      }
    } catch (error) {
      console.error('[WebsiteFeedbackBot] AI request failed:', error)
    }

    if (!response) {
      response = generateResponse(messageToSend, newState)
    }

    setIsTyping(false)
    setConversation(prev => [...prev, {
      type: 'bot',
      content: response,
      timestamp: new Date()
    }])
  }, [message, conversationState, conversation, generateResponse])

  // Handle suggestion click
  const handleSuggestionClick = useCallback((text: string) => {
    handleSendMessage(undefined, text)
  }, [handleSendMessage])

  // Open the bot
  const handleOpenBot = useCallback(() => {
    if (conversation.length === 0) {
      setConversation([greetingMessage])
    }
    
    setIsOpen(true)
    setIsMinimized(false)
    setShowBubble(false)
  }, [conversation.length, greetingMessage])

  const handleOpenChatTab = useCallback(() => {
    if (conversation.length === 0) {
      setConversation([greetingMessage])
    }
    setActiveTab('chat')
  }, [conversation.length, greetingMessage])

  // Close the bot
  const handleCloseBot = useCallback(() => {
    setIsOpen(false)
  }, [])

  // Toggle minimize state
  const handleToggleMinimize = useCallback(() => {
    setIsMinimized(prev => !prev)
  }, [])

  // Scroll to bottom of messages when conversation updates
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [conversation, isTyping])

  // Listen for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key to close
      if (e.key === 'Escape' && isOpen) {
        handleCloseBot()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleCloseBot, isOpen])

  // Show bubble after delay when component mounts
  useEffect(() => {
    if (!isOpen) {
      // Shuffle messages when showing bubble
      setShuffledMessages(shuffleArray(bubbleMessages))
      setCurrentMessageIndex(0)
      
      const timer = setTimeout(() => {
        setShowBubble(true)
      }, 2000) // Show after 2 seconds

      return () => clearTimeout(timer)
    } else {
      setShowBubble(false)
    }
  }, [isOpen])

  // Rotate bubble messages and auto-hide
  useEffect(() => {
    if (showBubble && !isOpen && shuffledMessages.length > 0) {
      const interval = setInterval(() => {
        setCurrentMessageIndex((prev) => {
          const nextIndex = (prev + 1) % shuffledMessages.length
          // If we've gone through all messages, shuffle again for next cycle
          if (nextIndex === 0) {
            setShuffledMessages(shuffleArray(bubbleMessages))
          }
          return nextIndex
        })
      }, 90000) // Change message every 1.5 minutes (90 seconds)

      // Auto-hide after showing all messages once (much longer now)
      const autoHideTimer = setTimeout(() => {
        setShowBubble(false)
      }, shuffledMessages.length * 90000 + 5000) // Show all messages + 5 seconds

      return () => {
        clearInterval(interval)
        clearTimeout(autoHideTimer)
      }
    }
  }, [showBubble, isOpen, shuffledMessages.length])

  // Render Home Tab content similar to the attachment
  const renderHomeTab = () => (
    <div 
      className="h-full flex flex-col overflow-y-auto"
      style={{ 
        background: `linear-gradient(to bottom, #ffffff, #ffffff95)`
      }}
    >
      {/* Header section with gradient background */}
      <div className="px-6 pt-8 pb-6 text-center">
        <div 
          className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
          style={{
            background: '#f3f4ff'
          }}
        >
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-2/3 h-2/3">
            <defs>
              <radialGradient id="starGradient" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="70%" stopColor="#4285f4" stopOpacity="0.9" />
              </radialGradient>
            </defs>
            <path d="M50,10 C55,30 70,45 90,50 C70,55 55,70 50,90 C45,70 30,55 10,50 C30,45 45,30 50,10 Z" 
              fill="url(#starGradient)" 
            />
          </svg>
        </div>
        <h1 className="text-xl font-semibold mb-2 text-gray-900">
          Website Assistant
        </h1>
        <p className="text-sm max-w-sm mx-auto text-gray-600">
          How can I help you navigate our website today?
        </p>
      </div>
      
      {/* Main options with color accents */}
      <div className="px-6 py-4">
        <div className="grid gap-3">
          <button
            onClick={handleOpenChatTab}
            className="hover:translate-y-[-2px] transition-all duration-300 shadow-sm group"
            style={{ 
              borderRadius: '12px',
              overflow: 'hidden'
            }}
          >
            <div className="flex items-start">
              <div 
                className="w-2 self-stretch opacity-40 group-hover:opacity-100 transition-opacity"
                style={{ background: accentColor }}
              ></div>
              <div className="flex-1 p-4 bg-white group-hover:bg-opacity-10 group-hover:bg-indigo-50 transition-colors">
                <div className="flex items-center gap-3 mb-1">
                  <div 
                    className="p-2 rounded-full transition-colors"
                    style={{ 
                      color: '#ffffff',
                      background: accentColor
                    }}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <h3 className="font-medium text-gray-900">
                    Ask a Question
                  </h3>
                </div>
                <p className="text-sm ml-9 text-gray-600">
                  Get help finding what you need on our site
                </p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('helpdesk')}
            className="hover:translate-y-[-2px] transition-all duration-300 shadow-sm group"
            style={{ 
              borderRadius: '12px',
              overflow: 'hidden'
            }}
          >
            <div className="flex items-start">
              <div 
                className="w-2 self-stretch opacity-40 group-hover:opacity-100 transition-opacity"
                style={{ background: accentColor }}
              ></div>
              <div className="flex-1 p-4 bg-white group-hover:bg-opacity-10 group-hover:bg-indigo-50 transition-colors">
                <div className="flex items-center gap-3 mb-1">
                  <div 
                    className="p-2 rounded-full"
                    style={{ 
                      color: '#ffffff',
                      background: accentColor
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><path d="M12 17h.01"></path></svg>
                  </div>
                  <h3 className="font-medium text-gray-900">
                    Browse Help Topics
                  </h3>
                </div>
                <p className="text-sm ml-9 text-gray-600">
                  Find answers to common questions
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
      
      {/* Quick links section */}
      <div className="px-6 pt-2 pb-4">
        <h3 className="text-xs uppercase font-medium mb-3 text-gray-500">
          Quick Navigation
        </h3>
        
        <div className="flex flex-wrap gap-2">
          {Object.keys(websiteKnowledge.navigation).slice(0, 4).map((page, index) => (
            <button 
              key={index}
              onClick={() => {
                const content = `How do I find the ${page} page?`
                setActiveTab('chat')
                handleSendMessage(undefined, content)
              }}
              className="transition-all duration-200 font-medium"
              style={{ 
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                background: `${accentColor}20`,
                color: accentColor,
                border: `1px solid ${accentColor}50`,
              }}
            >
              {page.charAt(0).toUpperCase() + page.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Common issues section */}
      <div className="px-6 pt-2 pb-4">
        <h3 className="text-xs uppercase font-medium mb-3 text-gray-500">
          Common Issues
        </h3>
        
        <div className="flex flex-wrap gap-2">
          {Object.keys(websiteKnowledge.commonIssues).slice(0, 3).map((issue, index) => (
            <button 
              key={index}
              onClick={() => {
                const content = `I'm having trouble with ${issue}`
                setActiveTab('chat')
                handleSendMessage(undefined, content)
              }}
              className="transition-all duration-200 font-medium"
              style={{ 
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                background: `${accentColor}10`,
                color: accentColor,
                border: `1px solid ${accentColor}30`,
              }}
            >
              {issue.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </button>
          ))}
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-auto p-5">
        <div 
          className="rounded-xl p-4 shadow-sm" 
          style={{
            background: `linear-gradient(to right, ${accentColor}90, ${accentColor})`,
          }}
        >
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <h4 className="font-medium text-white mb-1">Need immediate help?</h4>
              <p className="text-xs text-white opacity-80">I can guide you through any part of our website</p>
            </div>
            <button
              onClick={handleOpenChatTab}
              className="px-4 py-2 rounded-lg font-medium text-sm transition-colors"
              style={{ 
                background: 'white',
                color: accentColor,
              }}
            >
              Start Chat
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-[10px] text-gray-400">
            Powered by <a href="/" target="_blank" style={{ color: accentColor }}>Website Assistant</a>
          </p>
        </div>
      </div>
    </div>
  )

  // Render Helpdesk Tab content
  const renderHelpdeskTab = () => (
    <div className="h-full overflow-y-auto bg-white">
      <div className="sticky top-0 z-10 bg-white pt-5 px-5 pb-3 border-b border-gray-100">
        <h1 className="text-lg font-medium text-gray-900">Help Center</h1>
      </div>

      <div className="px-5 py-3">
        <h2 className="text-sm font-medium text-gray-900 mb-3">Navigation & Features</h2>
        {[
          {
            question: 'How do I navigate the website?',
            answer: 'Our main navigation menu is at the top of every page. You can find links to Home, Features, Pricing, Blog, Support, and Dashboard (if logged in). For mobile users, tap the menu icon in the top right corner.'
          },
          {
            question: 'Where can I find pricing information?',
            answer: 'You can find our pricing plans at /pricing. We offer Free, Standard, Business, and Enterprise plans to fit businesses of all sizes.'
          },
          {
            question: 'How do I access my account dashboard?',
            answer: 'Click on the "Dashboard" link in the top navigation after logging in. If you\'re not logged in yet, you\'ll be prompted to do so first.'
          }
        ].map((item, index) => (
          <details key={index} className="py-3 border-b border-gray-100 group">
            <summary className="cursor-pointer text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors">
              {item.question}
            </summary>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              {item.answer}
            </p>
          </details>
        ))}
        
        <h2 className="text-sm font-medium text-gray-900 mt-5 mb-3">Account & Settings</h2>
        {[
          {
            question: 'How do I create an account?',
            answer: 'Click the "Sign Up" button in the top right corner of any page. Enter your email, create a password, and fill in your profile information. You\'ll receive a confirmation email to verify your address.'
          },
          {
            question: 'I forgot my password. How do I reset it?',
            answer: 'On the login page, click the "Forgot Password" link. Enter your email address, and we\'ll send you instructions to reset your password. Check your spam folder if you don\'t see the email.'
          },
          {
            question: 'How do I update my billing information?',
            answer: 'Log in to your account, go to Dashboard > Billing, and click "Update Payment Method". You can add or edit your payment details there.'
          }
        ].map((item, index) => (
          <details key={index} className="py-3 border-b border-gray-100 group">
            <summary className="cursor-pointer text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors">
              {item.question}
            </summary>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              {item.answer}
            </p>
          </details>
        ))}
        
        <h2 className="text-sm font-medium text-gray-900 mt-5 mb-3">Troubleshooting</h2>
        {[
          {
            question: 'The website is loading slowly. What can I do?',
            answer: 'Try clearing your browser cache and cookies, check your internet connection, or try a different browser. If the issue persists, please contact our support team.'
          },
          {
            question: 'I\'m having trouble logging in',
            answer: 'Make sure you\'re using the correct email address and password. Try the "Forgot Password" link to reset your password. Clear your browser cookies or try an incognito/private browsing window.'
          },
          {
            question: 'How do I contact support?',
            answer: 'You can reach our support team by email at support@ourwebsite.com, through live chat (available Monday-Friday, 9am-5pm EST), or by phone at (555) 123-4567 if you\'re on a Business or Enterprise plan.'
          }
        ].map((item, index) => (
          <details key={index} className="py-3 border-b border-gray-100 last:border-0 group">
            <summary className="cursor-pointer text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors">
              {item.question}
            </summary>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
      
      <div className="px-5 py-4 mt-auto text-center bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-500 mb-1">Can't find what you're looking for?</p>
        <button 
          onClick={() => setActiveTab('chat')}
          className="text-xs font-medium hover:underline"
          style={{ color: accentColor }}
        >
          Ask me directly in chat
        </button>
      </div>
    </div>
  )

  return (
    <div ref={containerRef} className="fixed z-50" 
      style={{ 
        [position === 'bottom-right' ? 'right' : 'left']: '20px',
        bottom: '20px'
      }}
    >
      {/* Floating chat bubble - shown before opening bot */}
      {showBubble && !isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.8 }}
          onClick={handleOpenBot}
          className={cn(
            "absolute mb-3 px-4 py-2.5 rounded-full shadow-lg text-sm cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-105",
            position === 'bottom-right' ? 'right-2 bottom-full' : 'left-2 bottom-full'
          )}
          style={{ 
            background: 'white',
            border: '1px solid rgba(0,0,0,0.08)',
            maxWidth: '160px',
            whiteSpace: 'nowrap'
          }}
        >
          <motion.div 
            key={currentMessageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-gray-700 font-medium text-center"
          >
            {shuffledMessages[currentMessageIndex] || bubbleMessages[0]}
          </motion.div>
          
          {/* Bubble tail - positioned better */}
          <div 
            className={cn(
              "absolute w-2 h-2 rotate-45",
              position === 'bottom-right' 
                ? 'bottom-[-4px] right-6' 
                : 'bottom-[-4px] left-6'
            )}
            style={{ 
              background: 'white',
              border: '1px solid rgba(0,0,0,0.08)',
              borderTop: 'none',
              borderLeft: 'none'
            }}
          />
          
          {/* Remove close button for cleaner look */}
        </motion.div>
      )}

      {/* Bot toggle button - shown when bot is closed */}
      {!isOpen && (
        <motion.div
          animate={showBubble ? {
            scale: [1, 1.02, 1],
            boxShadow: [
              "0 10px 25px rgba(0,0,0,0.15)",
              `0 12px 30px ${accentColor}40`,
              "0 10px 25px rgba(0,0,0,0.15)"
            ]
          } : {}}
          transition={{
            duration: 3,
            repeat: showBubble ? Infinity : 0,
            ease: "easeInOut"
          }}
          className="rounded-full"
        >
          <Button 
            onClick={handleOpenBot}
            className="rounded-full w-14 h-14 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
            style={{ backgroundColor: accentColor }}
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
        </motion.div>
      )}
      
      {/* Bot window - shown when bot is open */}
      {isOpen && (
        <div className={cn(
          "bg-white overflow-hidden transition-all duration-300 ease-in-out",
          isMinimized ? "w-72 h-14 rounded-lg" : "w-[450px] max-w-full h-[670px]",
          "fixed sm:relative",
          "sm:rounded-xl sm:border sm:border-gray-200 sm:shadow-xl",
          isMinimized 
            ? "bottom-auto right-auto rounded-lg shadow-lg border border-gray-200" 
            : "sm:bottom-auto sm:right-auto top-0 left-0 right-0 bottom-0 sm:top-auto sm:left-auto sm:right-auto sm:bottom-auto"
        )}
        style={{ 
          boxShadow: isMinimized ? "0 5px 15px rgba(0,0,0,0.1)" : (typeof window !== 'undefined' && window.innerWidth < 640 ? "none" : `0 10px 25px ${accentColor}15`),
          maxHeight: isMinimized ? "3.5rem" : (typeof window !== 'undefined' && window.innerWidth < 640 ? "100vh" : "670px"),
          zIndex: 9999
        }}>
          {/* Bot header */}
          <div 
            className={cn(
              "flex justify-between items-center border-b bg-white sticky top-0 z-10",
              isMinimized ? "px-4 py-2 border-transparent" : "px-4 py-3 sm:px-6 border-gray-100"
            )}
          >
            <div className="flex gap-3 items-center">
              <div 
                className={cn(
                  "rounded-full flex items-center justify-center bg-white border border-gray-100 shadow-sm",
                  isMinimized ? "w-8 h-8" : "w-10 h-10"
                )}
              >
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-4/5 h-4/5">
                  <defs>
                    <radialGradient id="headerStarGradient" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="70%" stopColor={accentColor} stopOpacity="0.9" />
                    </radialGradient>
                  </defs>
                  <path d="M50,10 C55,30 70,45 90,50 C70,55 55,70 50,90 C45,70 30,55 10,50 C30,45 45,30 50,10 Z" 
                    fill="url(#headerStarGradient)" 
                  />
                </svg>
              </div>
              <div>
                <h3 className={cn(
                  "font-bold text-gray-900",
                  isMinimized ? "text-base" : "text-xl"
                )}>BriefSupport</h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleMinimize}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <Minus className="w-4 h-4" />
              </button>
              {!isMinimized && (
                <button 
                  onClick={handleCloseBot}
                  className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          {!isMinimized && (
            <div className="px-3 py-2 border-b border-gray-100 sticky top-[60px] bg-white z-10">
              <div className="flex justify-between items-center bg-gray-50 rounded-full p-1.5 shadow-sm">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 py-2 rounded-full transition-all duration-200 flex-1 justify-center",
                      activeTab === tab.id
                        ? "bg-white shadow-md text-gray-800" 
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-100/50",
                      "sm:px-5",
                      "px-3"
                    )}
                    style={activeTab === tab.id ? {
                      boxShadow: "0 2px 4px rgba(0,0,0,0.08)"
                    } : {}}
                  >
                    <div 
                      className="transition-colors duration-200"
                      style={{
                        color: activeTab === tab.id ? accentColor : '#4B5563'
                      }}
                    >
                      {tab.icon}
                    </div>
                    <span className="font-medium text-xs">
                      {tab.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Tab Content */}
          {!isMinimized && (
            <div className="flex-1 overflow-hidden h-[calc(100%-110px)]">
              {activeTab === 'home' && (
                <div className="h-full overflow-auto">
                  {renderHomeTab()}
                </div>
              )}

              {activeTab === 'chat' && (
                <>
                  <div className="h-[calc(100vh-220px)] sm:h-[440px] overflow-y-auto overflow-x-hidden p-4 sm:p-5 bg-gray-50/30">
                    {conversation.map((msg, index) => (
                      <MessageBubble 
                        key={index} 
                        message={msg} 
                        accentColor={accentColor}
                      />
                    ))}
                    
                    {/* Typing indicator */}
                    {isTyping && <TypingIndicator accentColor={accentColor} />}
                    
                    <div ref={messagesEndRef} />
                  </div>
                  
                  {/* Input bar with suggested questions */}
                  <div className="p-3 sm:p-4 border-t border-gray-100 bg-white sticky bottom-0">
                    {/* Suggested questions */}
                    {suggestedQuestions.length > 0 && !isTyping && (
                      <div className="mb-3 flex flex-wrap gap-2 max-w-full overflow-x-auto pb-2">
                        {suggestedQuestions.map((question, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick(question.text)}
                            className="transition-all duration-200 font-medium flex items-center gap-1.5 truncate max-w-[200px] shrink-0"
                            style={{ 
                              padding: '6px 12px',
                              borderRadius: '20px',
                              fontSize: '0.75rem',
                              background: `${accentColor}15`,
                              color: accentColor,
                              border: `1px solid ${accentColor}30`,
                            }}
                          >
                            {question.icon && <span className="text-xs">{question.icon}</span>}
                            <span className="truncate">{question.text}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                      <Input
                        placeholder="Type your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="flex-1 focus-visible:ring-1 focus-visible:ring-gray-200 bg-white rounded-lg shadow-sm border-gray-100 text-gray-900 placeholder-gray-500"
                      />
                      <Button 
                        type="submit"
                        style={{ backgroundColor: accentColor }}
                        className="text-white transition-all rounded-full w-10 h-10 min-w-10 p-0 flex items-center justify-center"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>
                    <div className="flex justify-center items-center mt-2">
                      <p className="text-[10px] text-gray-400">
                        Powered by <a href="/" target="_blank" style={{ color: accentColor }}>Brief Support</a>
                      </p>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'helpdesk' && (
                <div className="h-full overflow-auto">
                  {renderHelpdeskTab()}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
} 