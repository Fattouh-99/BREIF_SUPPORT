import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { ScrollArea } from '../ui/scroll-area'
import { Separator } from '../ui/separator'
import { cn } from '@/lib/utils'
import { Mail, Phone, Clock, AlertCircle, Tag, MessageSquare, User, FileText, BrainCircuit, ListChecks, Sparkles, ChevronRight, ChevronLeft, LineChart, SmileIcon, FrownIcon, MehIcon, ArrowRight, Hash, User2 } from 'lucide-react'

export type ChatMetadata = {
  // Customer Information
  customerEmail?: string
  customerName?: string
  customerPhone?: string
  firstInteractionTime?: Date

  // Support Context
  enquiryType?: 'technical_support' | 'product_inquiry' | 'billing' | 'feature_request' | 'complaint' | 'general'
  priority?: 'low' | 'medium' | 'high'
  status?: 'new' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed'
  category?: string
  subCategory?: string

  // Issue Details
  mainIssue?: string
  issueDescription?: string
  reproducibilitySteps?: string[]
  errorMessages?: string[]
  
  // Product Context
  productName?: string
  productVersion?: string
  productCategory?: string
  
  // Technical Context
  browserInfo?: string
  deviceInfo?: string
  operatingSystem?: string

  // Interaction History
  previousTickets?: number
  lastInteraction?: Date
  totalInteractions?: number
  
  // AI Analysis
  suggestedActions?: string[]
  keyTopics: string[]
  customerIntent?: string
  
  // Resolution
  proposedSolution?: string
  additionalNotes?: string[]

  // Conversation Summary
  conversationSummary: {
    briefOverview?: string
    keyPoints: string[]
    userNeeds: string[]
    actionItems: string[]
    nextSteps: string[]
  }

  insights: {
    overview: string
    customerSentiment: 'Positive' | 'Negative' | 'Neutral'
    avgResponseTime: string
    conversationDuration: string
    messageCount: number
    currentTags: string[]
  }
}

interface ChatSidebarProps {
  metadata: ChatMetadata
  className?: string
  onToggle: () => void
  isOpen: boolean
}

const ChatSidebar = ({ metadata, className, onToggle, isOpen }: ChatSidebarProps) => {
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
      case 'low':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
      case 'waiting_customer':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
      case 'resolved':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const formatDate = (date?: Date) => {
    if (!date) return '';
    return new Date(date).toLocaleString();
  }

  return (
    <Card className={cn("w-[300px] h-full border-l", className)}>
      <CardHeader className="px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Chat Information</CardTitle>
        </div>
      </CardHeader>
      <ScrollArea className="h-[calc(100%-57px)]">
        <CardContent className="p-4 space-y-6">
          {/* Conversation Summary Section - Place it at the top */}
          {metadata.conversationSummary && (
            <>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  AI Summary
                </h3>
                
                {metadata.conversationSummary.briefOverview && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
                      {metadata.conversationSummary.briefOverview}
                    </p>
                  </div>
                )}

                {metadata.conversationSummary.keyPoints && metadata.conversationSummary.keyPoints.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-white">Key Points</h4>
                    <ul className="space-y-1">
                      {metadata.conversationSummary.keyPoints.map((point, index) => (
                        <li key={index} className="text-sm text-white flex items-start gap-2">
                          <span className="text-indigo-500 mt-1">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {metadata.conversationSummary.userNeeds && metadata.conversationSummary.userNeeds.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">User Needs</h4>
                    <ul className="space-y-1">
                      {metadata.conversationSummary.userNeeds.map((need, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-indigo-500 mt-1">•</span>
                          <span>{need}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {metadata.conversationSummary.actionItems && metadata.conversationSummary.actionItems.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Action Items</h4>
                    <ul className="space-y-1">
                      {metadata.conversationSummary.actionItems.map((item, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <ListChecks className="w-4 h-4 text-indigo-500 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {metadata.conversationSummary.nextSteps && metadata.conversationSummary.nextSteps.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-white">Next Steps</h4>
                    <ul className="space-y-1">
                      {metadata.conversationSummary.nextSteps.map((step, index) => (
                        <li key={index} className="text-sm text-white flex items-start gap-2">
                          <span className="text-indigo-500 mt-1">→</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <Separator />
            </>
          )}

          {/* Status and Priority Section */}
          <div className="flex flex-col gap-2">
            {metadata.status && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</span>
                <Badge variant="secondary" className={cn("capitalize", getStatusColor(metadata.status))}>
                  {metadata.status.replace('_', ' ')}
                </Badge>
              </div>
            )}
            {metadata.priority && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority</span>
                <Badge variant="secondary" className={cn("capitalize", getPriorityColor(metadata.priority))}>
                  {metadata.priority}
                </Badge>
              </div>
            )}
          </div>

          <Separator />

          {/* Customer Information Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <User className="w-4 h-4" />
              Customer Information
            </h3>
            {metadata.customerName && (
              <div className="space-y-1">
                <p className="text-sm text-white">{metadata.customerName}</p>
              </div>
            )}
            {metadata.customerEmail && (
              <div className="flex items-center gap-2 text-sm text-white">
                <Mail className="w-4 h-4" />
                <a href={`mailto:${metadata.customerEmail}`} className="hover:text-indigo-600">
                  {metadata.customerEmail}
                </a>
              </div>
            )}
            {metadata.customerPhone && (
              <div className="flex items-center gap-2 text-sm text-white">
                <Phone className="w-4 h-4" />
                <span>{metadata.customerPhone}</span>
              </div>
            )}
            {metadata.firstInteractionTime && (
              <div className="flex items-center gap-2 text-sm text-white">
                <Clock className="w-4 h-4" />
                <span>First Contact: {formatDate(metadata.firstInteractionTime)}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Issue Details Section */}
          {(metadata.mainIssue || metadata.issueDescription) && (
            <>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Issue Details
                </h3>
                {metadata.mainIssue && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-white">Main Issue</h4>
                    <p className="text-sm text-white">{metadata.mainIssue}</p>
                  </div>
                )}
                {metadata.issueDescription && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-white">Description</h4>
                    <p className="text-sm text-white">{metadata.issueDescription}</p>
                  </div>
                )}
              </div>
              <Separator />
            </>
          )}

          {/* Product Context */}
          {(metadata.productName || metadata.productVersion || metadata.productCategory) && (
            <>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Product Information
                </h3>
                {metadata.productName && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-gray-700">Product</h4>
                    <p className="text-sm text-gray-600">{metadata.productName}</p>
                  </div>
                )}
                {metadata.productVersion && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-gray-700">Version</h4>
                    <p className="text-sm text-gray-600">{metadata.productVersion}</p>
                  </div>
                )}
                {metadata.productCategory && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-gray-700">Category</h4>
                    <p className="text-sm text-gray-600">{metadata.productCategory}</p>
                  </div>
                )}
              </div>
              <Separator />
            </>
          )}

          {/* AI Analysis */}
          {( metadata.customerIntent || metadata.keyTopics) && (
            <>
              <div className="space-y-3">
                {metadata.customerIntent && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-gray-700">Intent</h4>
                    <p className="text-sm text-gray-600">{metadata.customerIntent}</p>
                  </div>
                )}
                {metadata.keyTopics && metadata.keyTopics.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-white">Key Topics</h4>
                    <div className="flex flex-wrap gap-1">
                      {metadata.keyTopics.map((topic, index) => (
                        <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Additional Notes */}
          {metadata.additionalNotes && metadata.additionalNotes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Additional Notes
              </h3>
              <div className="space-y-2">
                {metadata.additionalNotes.map((note, index) => (
                  <div key={index} className="text-sm text-gray-600 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                    {note}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conversation Insights */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              Conversation Insights
            </h4>
            
            <div className="space-y-3">
              {/* Overview */}
              <div className="p-3 bg-background/50 rounded-lg border border-border/50">
                <h5 className="text-sm font-medium mb-1">Overview</h5>
                <p className="text-sm text-muted-foreground">
                  {metadata.insights.overview || 'Initial contact established'}
                </p>
              </div>

              {/* Customer Sentiment */}
              <div className="p-3 bg-background/50 rounded-lg border border-border/50">
                <h5 className="text-sm font-medium mb-1">Customer Sentiment</h5>
                <div className={cn(
                  "text-sm font-medium inline-flex items-center gap-1.5 px-2 py-1 rounded-full",
                  metadata.insights.customerSentiment === 'Positive' && "bg-green-100 text-green-700",
                  metadata.insights.customerSentiment === 'Negative' && "bg-red-100 text-red-700",
                  metadata.insights.customerSentiment === 'Neutral' && "bg-gray-100 text-gray-700"
                )}>
                  {metadata.insights.customerSentiment === 'Positive' && <SmileIcon className="h-3.5 w-3.5" />}
                  {metadata.insights.customerSentiment === 'Negative' && <FrownIcon className="h-3.5 w-3.5" />}
                  {metadata.insights.customerSentiment === 'Neutral' && <MehIcon className="h-3.5 w-3.5" />}
                  {metadata.insights.customerSentiment}
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2">
                {/* Response Time */}
                <div className="p-3 bg-background/50 rounded-lg border border-border/50">
                  <h5 className="text-xs font-medium text-muted-foreground mb-1">Avg. Response Time</h5>
                  <p className="text-sm font-medium">{metadata.insights.avgResponseTime}</p>
                </div>

                {/* Duration */}
                <div className="p-3 bg-background/50 rounded-lg border border-border/50">
                  <h5 className="text-xs font-medium text-muted-foreground mb-1">Duration</h5>
                  <p className="text-sm font-medium">{metadata.insights.conversationDuration}</p>
                </div>

                {/* Message Count */}
                <div className="p-3 bg-background/50 rounded-lg border border-border/50">
                  <h5 className="text-xs font-medium text-muted-foreground mb-1">Messages</h5>
                  <p className="text-sm font-medium">{metadata.insights.messageCount}</p>
                </div>

                {/* Tags */}
                <div className="p-3 bg-background/50 rounded-lg border border-border/50">
                  <h5 className="text-xs font-medium text-muted-foreground mb-1">Current Tags</h5>
                  <div className="flex flex-wrap gap-1">
                    {metadata.insights.currentTags.map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  )
}

export default ChatSidebar 