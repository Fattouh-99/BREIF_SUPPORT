'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { onUpdateChatbotMode, onUpdateProductsEnabled, onUpdateFeatureToggles, onUpdateHomeLayout, onUpdateTheme } from '@/actions/settings'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2, Link, Hash, Package, Layers, Grid3X3, LayoutGrid as LayoutGridIcon, Monitor } from 'lucide-react'
import { HomeLayoutStyle } from '@/components/chatbot/home'

interface ChatbotSettingsProps {
  id: string
  chatBot: {
    chatbotEnabled?: boolean
    inquiryMode?: boolean
    productsEnabled?: boolean
    customLinksEnabled?: boolean
    popularTopicsEnabled?: boolean
    popularTopics?: string
    homeLayout?: string
    feedbackEnabled?: boolean
    feedbackQuestion?: string
    feedbackYesText?: string
    feedbackNoText?: string
    feedbackFollowUp?: string
    customLinks?: Array<{
      id: string
      title: string
      description: string | null
      url: string
      createdAt: string
    }>
  }
}

const ChatbotSettings = ({ id, chatBot }: ChatbotSettingsProps) => {
  const [isLoading, setIsLoading] = useState(false)
  // Initialize state from database values
  // When chatbotEnabled is false or undefined, default to false (Interactive Chatbot)
  // When chatbotEnabled is true, it means Enquiry Form mode
  const [chatbotEnabled, setChatbotEnabled] = useState(chatBot?.chatbotEnabled ?? false)
  const [inquiryMode, setInquiryMode] = useState(chatBot?.inquiryMode ?? false)
  const [productsEnabled, setProductsEnabled] = useState(chatBot?.productsEnabled ?? true)
  const [customLinksEnabled, setCustomLinksEnabled] = useState(chatBot?.customLinksEnabled ?? false)
  const [popularTopicsEnabled, setPopularTopicsEnabled] = useState(chatBot?.popularTopicsEnabled ?? true)
  const [homeLayout, setHomeLayout] = useState<HomeLayoutStyle>((chatBot?.homeLayout as HomeLayoutStyle) ?? 'classic')
  
  // Feedback configuration state
  const [feedbackEnabled, setFeedbackEnabled] = useState(chatBot?.feedbackEnabled ?? true)
  const [feedbackQuestion, setFeedbackQuestion] = useState(chatBot?.feedbackQuestion ?? 'Was this helpful?')
  const [feedbackYesText, setFeedbackYesText] = useState(chatBot?.feedbackYesText ?? '👍 Yes')
  const [feedbackNoText, setFeedbackNoText] = useState(chatBot?.feedbackNoText ?? '👎 No')
  const [feedbackFollowUp, setFeedbackFollowUp] = useState(chatBot?.feedbackFollowUp ?? 'Still need help? Start a conversation')
  const router = useRouter()
  console.log(homeLayout)


  // Track if settings have changed
  const hasChanges = 
    chatbotEnabled !== (chatBot?.chatbotEnabled ?? false) ||
    inquiryMode !== (chatBot?.inquiryMode ?? false) ||
    productsEnabled !== (chatBot?.productsEnabled ?? true) ||
    customLinksEnabled !== (chatBot?.customLinksEnabled ?? false) ||
    popularTopicsEnabled !== (chatBot?.popularTopicsEnabled ?? true) ||
    homeLayout !== ((chatBot?.homeLayout as HomeLayoutStyle) ?? 'classic') ||
    feedbackEnabled !== (chatBot?.feedbackEnabled ?? true) ||
    feedbackQuestion !== (chatBot?.feedbackQuestion ?? 'Was this helpful?') ||
    feedbackYesText !== (chatBot?.feedbackYesText ?? '👍 Yes') ||
    feedbackNoText !== (chatBot?.feedbackNoText ?? '👎 No') ||
    feedbackFollowUp !== (chatBot?.feedbackFollowUp ?? 'Still need help? Start a conversation')

  const handleSaveSettings = async () => {
    setIsLoading(true)
    
    // Track what we're updating for better success messages
    const currentChatbotMode = chatbotEnabled ? 'inquiry mode' : 'interactive mode'
    const currentProductsStatus = productsEnabled ? 'enabled' : 'disabled'
    
    try {
      // Update chatbot mode first
      const modeResult = await onUpdateChatbotMode(id, chatbotEnabled, inquiryMode)
      
      if (modeResult?.status !== 200) {
        toast.error(`Failed to update chatbot to ${currentChatbotMode}: ${modeResult?.message || 'Unknown error'}`)
        return
      }

      // Show specific success for mode change
      toast.success(`✅ Chatbot mode updated to ${currentChatbotMode}`)

      // Update products enabled setting
      const productsResult = await onUpdateProductsEnabled(id, productsEnabled)
      
      if (productsResult?.status !== 200) {
        toast.error(`Failed to update products feature: ${productsResult?.message || 'Unknown error'}`)
        return
      }

      // Show specific success for products feature
      toast.success(`✅ Products feature ${currentProductsStatus}`)

      // Update feature toggles
      const featuresResult = await onUpdateFeatureToggles(id, {
        customLinksEnabled,
        popularTopicsEnabled
      })
      
      if (featuresResult?.status !== 200) {
        toast.error(`Failed to update feature toggles: ${featuresResult?.message || 'Unknown error'}`)
        return
      }

      // Update home layout
      const layoutResult = await onUpdateHomeLayout(id, homeLayout)
      
      if (layoutResult?.status !== 200) {
        toast.error(`Failed to update home layout: ${layoutResult?.message || 'Unknown error'}`)
        return
      }

      // Update feedback configuration
      const feedbackResult = await onUpdateTheme(
        id,
        undefined, // background
        undefined, // textColor
        undefined, // iconColor
        undefined, // iconStyle
        undefined, // themeColor
        undefined, // helpDeskColor
        undefined, // titleColor
        undefined, // paymentEnabled
        undefined, // customLinkTitle
        undefined, // customLinkDescription
        undefined, // customLinkUrl
        undefined, // bubbleBackground
        undefined, // homeTitle
        feedbackEnabled,
        feedbackQuestion,
        feedbackYesText,
        feedbackNoText,
        feedbackFollowUp
      )
      
      if (feedbackResult?.status !== 200) {
        toast.error(`Failed to update feedback configuration: ${feedbackResult?.message || 'Unknown error'}`)
        return
      }

      // Overall success message
      toast.success('🎉 All settings saved successfully!')
      
      // Send refresh message to any open chatbot iframes
      const chatbotIframes = document.querySelectorAll('iframe[src*="chatbot"]')
      chatbotIframes.forEach((iframe) => {
        try {
          (iframe as HTMLIFrameElement).contentWindow?.postMessage('REFRESH_CHATBOT', '*')
        } catch (error) {
          console.log('Could not send refresh message to iframe:', error)
        }
      })
      
      // Show a final confirmation toast and refresh the page to load updated data
      setTimeout(() => {
        toast.success('✨ Settings applied! Refreshing to update the preview...', {
          duration: 2000,
        })
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }, 1000)
    } catch (error) {
      console.error('Error updating chatbot settings:', error)
      toast.error('❌ An unexpected error occurred while updating settings. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleModeChange = (value: string) => {
    if (value === 'interactive') {
      setChatbotEnabled(false)
      setInquiryMode(false)
    } else if (value === 'inquiry') {
      setChatbotEnabled(true)
      setInquiryMode(true)
    }
  }

  // Determine current mode based on chatbotEnabled
  const currentMode = chatbotEnabled ? 'inquiry' : 'interactive'

  // Layout options with descriptions
  const layoutOptions = [
    {
      value: 'classic' as HomeLayoutStyle,
      title: 'Classic',
      description: 'Traditional vertical list layout with accent colors',
      icon: <LayoutGridIcon className="w-5 h-5" />
    },
    {
      value: 'modern' as HomeLayoutStyle,
      title: 'Modern',
      description: 'Card-based grid layout with highlighted primary action',
      icon: <Grid3X3 className="w-5 h-5" />
    },
    {
      value: 'compact' as HomeLayoutStyle,
      title: 'Compact',
      description: 'Space-efficient design with minimal padding',
      icon: <Layers className="w-5 h-5" />
    },
    {
      value: 'helpdesk' as HomeLayoutStyle,
      title: 'Help Desk',
      description: 'Professional support interface with dark header and navigation',
      icon: <Monitor className="w-5 h-5" />
    }
  ]

  return (
    <div className="space-y-6">
      {/* Chatbot Mode */}
      <Card>
        <CardHeader>
          <CardTitle>Chatbot Mode</CardTitle>
          <CardDescription>
            Configure how your chatbot interacts with visitors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label className="text-base font-medium">
                {currentMode === 'interactive' ? 'Interactive Chatbot' : 'Enquiry Form'}
              </Label>
              <p className="text-sm text-muted-foreground">
                {currentMode === 'interactive' 
                  ? 'Visitors can chat with an AI assistant'
                  : 'Visitors fill out a contact form'
                }
              </p>
            </div>
            <Switch 
              checked={chatbotEnabled}
              onCheckedChange={(checked) => {
                setChatbotEnabled(checked)
                setInquiryMode(checked)
                // Show immediate feedback
                toast.info(`Chatbot mode set to ${checked ? 'inquiry form' : 'interactive chat'}. Remember to save your changes.`)
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Home Page Layout */}
      <Card>
        <CardHeader>
          <CardTitle>Home Page Layout</CardTitle>
          <CardDescription>
            Choose how your chatbot's home page is displayed to visitors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={homeLayout} 
            onValueChange={(value: HomeLayoutStyle) => {
              setHomeLayout(value)
              toast.info(`Home layout set to ${value}. Remember to save your changes.`)
            }}
            className="space-y-4"
          >
            {layoutOptions.map((option) => (
              <div key={option.value} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors dark:border-gray-700">
                <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {option.icon}
                    <Label htmlFor={option.value} className="text-base font-medium cursor-pointer">
                      {option.title}
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {option.description}
                  </p>
                  
                  {/* Visual Preview */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-600">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Preview:</div>
                    <div className="bg-white dark:bg-gray-900 rounded border dark:border-gray-700 p-2 text-xs">
                      {option.value === 'classic' && (
                        <div className="space-y-1.5">
                          <div className="text-center text-gray-600 dark:text-gray-300 mb-2">Welcome to Support</div>
                          <div className="flex items-center gap-2 p-1.5 border-l-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="dark:text-gray-200">Chat with Us</span>
                          </div>
                          <div className="flex items-center gap-2 p-1.5 border-l-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="dark:text-gray-200">Knowledge Base</span>
                          </div>
                          <div className="flex items-center gap-2 p-1.5 border-l-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="dark:text-gray-200">Test Link</span>
                          </div>
                        </div>
                      )}
                      
                      {option.value === 'modern' && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-4 h-4 bg-blue-500 rounded"></div>
                            <span className="text-gray-600 dark:text-gray-300">Welcome to Support</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            <div className="p-2 bg-blue-500 text-white rounded text-center">Chat</div>
                            <div className="p-2 border dark:border-gray-600 rounded text-center dark:text-gray-200">Help</div>
                            <div className="p-2 border dark:border-gray-600 rounded text-center dark:text-gray-200">Products</div>
                            <div className="p-2 border dark:border-gray-600 rounded text-center dark:text-gray-200">Link</div>
                          </div>
                        </div>
                      )}
                      
                      {option.value === 'compact' && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 p-1 border-b dark:border-gray-600 text-gray-600 dark:text-gray-300">
                            <div className="w-2 h-2 bg-blue-500 rounded"></div>
                            <span>Welcome to Support</span>
                          </div>
                          <div className="flex items-center justify-between p-1 hover:bg-gray-50 dark:hover:bg-gray-800">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded"></div>
                              <span className="dark:text-gray-200">Chat with Us</span>
                            </div>
                            <div className="text-gray-400">›</div>
                          </div>
                          <div className="flex items-center justify-between p-1 hover:bg-gray-50 dark:hover:bg-gray-800">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-gray-400 rounded"></div>
                              <span className="dark:text-gray-200">Knowledge Base</span>
                            </div>
                            <div className="text-gray-400">›</div>
                          </div>
                          <div className="flex items-center justify-between p-1 hover:bg-gray-50 dark:hover:bg-gray-800">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-gray-400 rounded"></div>
                              <span className="dark:text-gray-200">Test Link</span>
                            </div>
                            <div className="text-gray-400">›</div>
                          </div>
                        </div>
                      )}
                      
                      {option.value === 'helpdesk' && (
                        <div className="space-y-0 overflow-hidden">
                          {/* Dark Header */}
                          <div className="bg-gray-800 text-white p-2 rounded-t">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-3 h-3 bg-white/20 rounded"></div>
                              <span className="text-xs font-bold">SUPPORT</span>
                            </div>
                            <div className="text-xs mb-2">Hi, how can we help?</div>
                            <div className="bg-white/10 rounded px-2 py-1 text-xs text-gray-300">
                              Ask a question
                            </div>
                          </div>
                          
                          {/* Content Area */}
                          <div className="bg-white border-x dark:border-gray-600 p-1 space-y-1">
                            <div className="flex items-center justify-between text-xs border-b dark:border-gray-200 pb-1">
                              <span className="dark:text-gray-700">Status Page</span>
                              <span className="text-gray-400">›</span>
                            </div>
                            <div className="flex items-center justify-between text-xs border-b dark:border-gray-200 pb-1">
                              <span className="dark:text-gray-700">Search Help</span>
                              <span className="text-gray-400">›</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="dark:text-gray-700">Dashboard</span>
                              <span className="text-gray-400">›</span>
                            </div>
                          </div>
                          
                          {/* Bottom Nav */}
                          <div className="bg-white border dark:border-gray-600 rounded-b p-1">
                            <div className="flex justify-around text-xs">
                              <span className="text-blue-500">Home</span>
                              <span className="text-gray-400">Messages</span>
                              <span className="text-gray-400">Help</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Feature Toggles */}
      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
          <CardDescription>
            Enable or disable specific chatbot features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label className="text-base font-medium flex items-center gap-2">
                <Package className="w-4 h-4" />
                Products Feature
              </Label>
              <p className="text-sm text-muted-foreground">
                Show products tab and allow product recommendations in chat
              </p>
            </div>
            <Switch 
              checked={productsEnabled}
              onCheckedChange={(checked) => {
                setProductsEnabled(checked)
                // Show immediate feedback
                toast.info(`Products feature ${checked ? 'enabled' : 'disabled'}. Remember to save your changes.`)
              }}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label className="text-base font-medium flex items-center gap-2">
                <Link className="w-4 h-4" />
                Custom Links
              </Label>
              <p className="text-sm text-muted-foreground">
                Show custom links on the chatbot home page
              </p>
            </div>
            <Switch 
              checked={customLinksEnabled}
              onCheckedChange={(checked) => {
                setCustomLinksEnabled(checked)
                toast.info(`Custom links ${checked ? 'enabled' : 'disabled'}. Remember to save your changes.`)
              }}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label className="text-base font-medium flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Popular Topics
              </Label>
              <p className="text-sm text-muted-foreground">
                Show popular topic buttons on the chatbot home page
              </p>
            </div>
            <Switch 
              checked={popularTopicsEnabled}
              onCheckedChange={(checked) => {
                setPopularTopicsEnabled(checked)
                toast.info(`Popular topics ${checked ? 'enabled' : 'disabled'}. Remember to save your changes.`)
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Feedback Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback Configuration</CardTitle>
          <CardDescription>
            Customize the "Was this helpful?" feedback section in help desk articles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label className="text-base font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Enable Feedback Buttons
              </Label>
              <p className="text-sm text-muted-foreground">
                Show feedback buttons at the bottom of help desk articles
              </p>
            </div>
            <Switch 
              checked={feedbackEnabled}
              onCheckedChange={(checked) => {
                setFeedbackEnabled(checked)
                toast.info(`Feedback buttons ${checked ? 'enabled' : 'disabled'}. Remember to save your changes.`)
              }}
            />
          </div>

          {feedbackEnabled && (
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
              <div className="space-y-2">
                <Label htmlFor="feedbackQuestion">Feedback Question</Label>
                <Input
                  id="feedbackQuestion"
                  value={feedbackQuestion}
                  onChange={(e) => setFeedbackQuestion(e.target.value)}
                  placeholder="Was this helpful?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="feedbackYesText">Yes Button Text</Label>
                  <Input
                    id="feedbackYesText"
                    value={feedbackYesText}
                    onChange={(e) => setFeedbackYesText(e.target.value)}
                    placeholder="👍 Yes"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feedbackNoText">No Button Text</Label>
                  <Input
                    id="feedbackNoText"
                    value={feedbackNoText}
                    onChange={(e) => setFeedbackNoText(e.target.value)}
                    placeholder="👎 No"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedbackFollowUp">Follow-up Text</Label>
                <Textarea
                  id="feedbackFollowUp"
                  value={feedbackFollowUp}
                  onChange={(e) => setFeedbackFollowUp(e.target.value)}
                  placeholder="Still need help? Start a conversation"
                  rows={2}
                />
              </div>

              {/* Preview */}
              <div className="mt-4 p-4 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg">
                <h4 className="text-sm font-medium mb-3 text-gray-900 dark:text-gray-100">Preview:</h4>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{feedbackQuestion}</p>
                  <div className="flex justify-center gap-3 mb-3">
                    <button 
                      className="px-4 py-2 text-xs rounded-full border border-blue-200 dark:border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800"
                      disabled
                    >
                      {feedbackYesText}
                    </button>
                    <button 
                      className="px-4 py-2 text-xs rounded-full border border-blue-200 dark:border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800"
                      disabled
                    >
                      {feedbackNoText}
                    </button>
                  </div>
                  <button 
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    disabled
                  >
                    {feedbackFollowUp}
                  </button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Changes */}
      {hasChanges && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg p-3 mb-4">
          <p className="text-amber-800 dark:text-amber-200 text-sm flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-500 dark:bg-amber-400 rounded-full animate-pulse"></span>
            You have unsaved changes. Click "Save Changes" to apply them.
          </p>
        </div>
      )}

      <Button 
        onClick={handleSaveSettings} 
        disabled={isLoading || !hasChanges}
        className={`w-full ${hasChanges ? 'bg-primary hover:bg-primary/90' : 'bg-gray-300'}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving Settings...
          </>
        ) : hasChanges ? (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Save Changes
          </>
        ) : (
          'No Changes'
        )}
      </Button>

    </div>
  )
}

export default ChatbotSettings 