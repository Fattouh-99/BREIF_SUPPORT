'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart4, 
  Timer, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Tag, 
  Plus
} from 'lucide-react'

// Simple sentiment analysis function
function analyzeSentiment(text: string): { score: number; label: string } {
  // List of positive and negative words for basic sentiment analysis
  const positiveWords = [
    'good', 'great', 'excellent', 'amazing', 'awesome', 'fantastic',
    'wonderful', 'happy', 'pleased', 'satisfied', 'thank', 'thanks',
    'appreciate', 'grateful', 'helpful', 'perfect', 'love', 'like'
  ]
  const negativeWords = [
    'bad', 'terrible', 'awful', 'horrible', 'disappointing', 'frustrated',
    'annoyed', 'angry', 'upset', 'problem', 'issue', 'error', 'wrong',
    'broken', 'failure', 'failed', 'poor', 'waste', 'useless', 'confused'
  ]

  // Lowercase for case-insensitive matching
  const lowercaseText = text.toLowerCase()
  
  // Count positive and negative words
  let positiveCount = 0
  let negativeCount = 0
  
  positiveWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'g')
    const matches = lowercaseText.match(regex)
    if (matches) positiveCount += matches.length
  })
  
  negativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'g')
    const matches = lowercaseText.match(regex)
    if (matches) negativeCount += matches.length
  })
  
  // Calculate sentiment score from -1 to 1
  const totalMatches = positiveCount + negativeCount
  let score = 0
  
  if (totalMatches > 0) {
    score = (positiveCount - negativeCount) / totalMatches
  }
  
  // Get sentiment label
  let label = 'Neutral'
  if (score > 0.5) label = 'Very Positive'
  else if (score > 0.1) label = 'Positive'
  else if (score < -0.5) label = 'Very Negative'
  else if (score < -0.1) label = 'Negative'
  
  return { score, label }
}

// Automatic topic detection for tagging
function detectTopics(text: string): string[] {
  const topicKeywords: Record<string, string[]> = {
    'Billing': ['price', 'cost', 'payment', 'bill', 'invoice', 'charge', 'refund', 'subscription'],
    'Technical': ['error', 'bug', 'issue', 'problem', 'broken', 'doesn\'t work', 'fix', 'crash'],
    'Account': ['login', 'password', 'account', 'profile', 'sign in', 'register', 'sign up'],
    'Feature': ['feature', 'add', 'missing', 'include', 'suggestion', 'improvement'],
    'Urgent': ['urgent', 'immediately', 'emergency', 'asap', 'critical', 'crucial'],
    'Positive': ['thanks', 'thank you', 'great', 'awesome', 'appreciate', 'helpful'],
    'Negative': ['disappointed', 'frustrated', 'angry', 'upset', 'terrible', 'waste']
  }
  
  const lowercaseText = text.toLowerCase()
  const detectedTopics: string[] = []
  
  // Check for each topic's keywords
  Object.entries(topicKeywords).forEach(([topic, keywords]) => {
    for (const keyword of keywords) {
      if (lowercaseText.includes(keyword)) {
        detectedTopics.push(topic)
        break
      }
    }
  })
  
  return detectedTopics
}

interface Message {
  id: string;
  text: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ConversationInsightsProps {
  messages: Message[];
  onAddTag: (tag: string) => void;
  existingTags?: string[];
}

const badgeColors: Record<string, string> = {
  'Billing': 'bg-blue-100 text-blue-800',
  'Technical': 'bg-purple-100 text-purple-800',
  'Account': 'bg-yellow-100 text-yellow-800',
  'Feature': 'bg-green-100 text-green-800',
  'Urgent': 'bg-red-100 text-red-800',
  'Positive': 'bg-emerald-100 text-emerald-800',
  'Negative': 'bg-rose-100 text-rose-800',
}

export default function ConversationInsights({
  messages,
  onAddTag,
  existingTags = []
}: ConversationInsightsProps) {
  const [sentiment, setSentiment] = useState({ score: 0, label: 'Neutral' })
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')
  const [responseTime, setResponseTime] = useState(0)
  
  // Calculate conversation metrics when messages change
  useEffect(() => {
    if (messages.length === 0) return
    
    // Analyze all user messages for sentiment
    const userMessages = messages.filter(m => m.role === 'user')
    if (userMessages.length > 0) {
      const lastUserMessage = userMessages[userMessages.length - 1]
      const sentimentResult = analyzeSentiment(lastUserMessage.text)
      setSentiment(sentimentResult)
      
      // Detect topics for tagging
      const detectedTopics = detectTopics(lastUserMessage.text)
        .filter(topic => !existingTags.includes(topic)) // Filter out existing tags
      setSuggestedTags(detectedTopics)
    }
    
    // Calculate response time
    let totalResponseTime = 0
    let responseCount = 0
    
    for (let i = 1; i < messages.length; i++) {
      const currentMsg = messages[i]
      const prevMsg = messages[i - 1]
      
      // If current is assistant reply to user message
      if (currentMsg.role === 'assistant' && prevMsg.role === 'user') {
        const responseTimeSeconds = 
          (currentMsg.timestamp.getTime() - prevMsg.timestamp.getTime()) / 1000
        totalResponseTime += responseTimeSeconds
        responseCount++
      }
    }
    
    const avgResponseTime = responseCount > 0 
      ? Math.round(totalResponseTime / responseCount) 
      : 0
    
    setResponseTime(avgResponseTime)
  }, [messages, existingTags])
  
  const handleAddTag = (tag: string) => {
    if (tag && !existingTags.includes(tag)) {
      onAddTag(tag)
      // Remove from suggested tags
      setSuggestedTags(prev => prev.filter(t => t !== tag))
    }
  }
  
  const handleAddCustomTag = () => {
    if (customTag && !existingTags.includes(customTag)) {
      onAddTag(customTag)
      setCustomTag('')
    }
  }
  
  // Get sentiment color
  const getSentimentColor = () => {
    const { score } = sentiment
    if (score > 0.5) return 'text-green-600'
    if (score > 0.1) return 'text-green-400'
    if (score < -0.5) return 'text-red-600'
    if (score < -0.1) return 'text-red-400'
    return 'text-gray-600'
  }
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <BarChart4 className="w-4 h-4 mr-2" />
          Conversation Insights
        </CardTitle>
        <CardDescription>
          Real-time analysis of the conversation
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <Tabs defaultValue="overview">
          <TabsList className="w-full">
            <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
            <TabsTrigger value="tags" className="flex-1">Tags</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4 mt-2">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <div className="text-sm font-medium">Customer Sentiment</div>
                <div className={`text-sm font-semibold ${getSentimentColor()}`}>
                  {sentiment.label}
                </div>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b">
                <div className="text-sm font-medium flex items-center">
                  <Timer className="w-4 h-4 mr-1" />
                  Avg. Response Time
                </div>
                <div className="text-sm font-semibold">
                  {responseTime > 0 ? `${responseTime} seconds` : 'N/A'}
                </div>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b">
                <div className="text-sm font-medium flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Conversation Duration
                </div>
                <div className="text-sm font-semibold">
                  {messages.length > 0 
                    ? `${Math.round((new Date().getTime() - messages[0].timestamp.getTime()) / 60000)} min` 
                    : 'N/A'}
                </div>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b">
                <div className="text-sm font-medium flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Message Count
                </div>
                <div className="text-sm font-semibold">{messages.length}</div>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <div className="text-sm font-medium">Current Tags</div>
                <div className="flex flex-wrap gap-1 justify-end">
                  {existingTags.length > 0 ? (
                    existingTags.map(tag => (
                      <Badge key={tag} className={badgeColors[tag] || 'bg-gray-100 text-gray-800'}>
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">No tags yet</span>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="tags" className="mt-2">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <Tag className="w-4 h-4 mr-1" />
                  Suggested Tags
                </h4>
                {suggestedTags.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {suggestedTags.map(tag => (
                      <Badge 
                        key={tag} 
                        className={`${badgeColors[tag] || 'bg-gray-100 text-gray-800'} cursor-pointer`}
                        onClick={() => handleAddTag(tag)}
                      >
                        {tag} <Plus className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No suggestions available</p>
                )}
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Add Custom Tag</h4>
                <div className="flex">
                  <input
                    type="text"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    className="flex-1 rounded-l-md px-3 py-1 text-sm border border-input bg-background"
                    placeholder="Enter tag name"
                  />
                  <Button 
                    size="sm" 
                    className="rounded-l-none" 
                    onClick={handleAddCustomTag}
                    disabled={!customTag || existingTags.includes(customTag)}
                  >
                    Add
                  </Button>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Current Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {existingTags.length > 0 ? (
                    existingTags.map(tag => (
                      <Badge key={tag} className={badgeColors[tag] || 'bg-gray-100 text-gray-800'}>
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No tags added yet</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 