import Section from '@/components/section-label'
import React, { useState } from 'react'
import { Control, FieldErrors, FieldValues, UseFormRegister, useForm, useWatch, UseFormSetValue } from 'react-hook-form'
import FormGenerator from '../form-generator'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card'
import { Paintbrush, Send, Sparkles, ExternalLink, ArrowRight, Minus, X, Plus, GripVertical } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Bubble from '@/components/chatbot/bubble'
import { onUpdateTheme } from '@/actions/settings'
import { useToast } from '@/components/ui/use-toast'
import { BOT_TABS_MENU } from '@/constants/menu'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { Responding } from '@/components/chatbot/responding'
import Accordion from '@/components/accordian'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  THEME_CATEGORIES, 
  getAllPresets, 
  getPresetsByCategory, 
  getContrastTextColor 
} from '@/components/chatbot/theme-helpers'
import { Badge } from '@/components/ui/badge'
import { CheckCircle } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import CustomLinksManager from './custom-links-manager'
import PopularTopicsManager from './popular-topics-manager'

type GreetingMessageProps = {
  message: string
  register: UseFormRegister<FieldValues>
  errors: FieldErrors<FieldValues>
  control: Control<FieldValues>
  setValue: UseFormSetValue<FieldValues>
  defaultBackground?: string
  defaultTextColor?: string
  defaultThemeColor?: string
  defaultHelpDeskColor?: string
  defaultTitleColor?: string
  defaultBubbleBackground?: string
  defaultHomeTitle?: string
  domainId: string
  default?: string
  customLink?: {
    title: string
    description: string
    url: string
  }
  initialCustomLinks?: Array<{
    id: string
    title: string
    description: string | null
    url: string
    createdAt: string
  }>
  initialPopularTopics?: string
  helpDeskQuestions?: Array<{
    id: string
    question: string
    answer: string
  }>
}

const GreetingsMessage = ({
  message,
  register,
  errors,
  control,
  setValue,
  defaultBackground = '#ffffff',
  defaultTextColor = '#374151',
  defaultThemeColor = '#f3f4f6',
  defaultHelpDeskColor = '#f3f4f6',
  defaultTitleColor = '#1F2937',
  defaultBubbleBackground = '#ffffff',
  defaultHomeTitle,
  domainId,
  initialCustomLinks = [],
  initialPopularTopics,
  helpDeskQuestions = [],
}: GreetingMessageProps) => {
  const params = useParams();
  const { toast } = useToast();
  const domain = typeof params.domain === 'string' ? params.domain : '';
  const formattedDomain = domain.split('.com')[0].charAt(0).toUpperCase() + domain.split('.com')[0].slice(1);

  // Add state for preview component
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('home');
  const previewRef = React.useRef(null);
  const domainName = domain || 'example.com';
  const [themeColor, setThemeColor] = useState(defaultThemeColor);
  const [textColor, setTextColor] = useState(defaultTextColor);
  const [background, setBackground] = useState(defaultBackground);
  const [titleColor, setTitleColor] = useState(defaultTitleColor);
  const [helpDeskColor, setHelpDeskColor] = useState(defaultHelpDeskColor);
  const [bubbleBackground, setBubbleBackground] = useState(defaultBubbleBackground);

  // State for home title
  const [homeTitle, setHomeTitle] = useState(defaultHomeTitle || 'Welcome to Support');

  // State for multiple greeting messages
  const [greetingMessages, setGreetingMessages] = useState<string[]>(() => {
    // Parse the existing message - could be JSON array or single string
    try {
      const parsed = JSON.parse(message || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      // Not JSON, treat as single message
    }
    return message ? [message] : ['Hey there, have a question? Text us here'];
  });

  // Mock data for preview
  const mockHelpdesk = [
    {
      id: '1',
      question: 'How can I reset my password?',
      answer: 'You can reset your password by clicking on the "Forgot Password" link on the login page.',
      domainId: null
    },
    {
      id: '2',
      question: 'How do I create a new account?',
      answer: 'You can register a new account by clicking on the "Sign Up" button on the homepage.',
      domainId: null
    },
    {
      id: '3',
      question: 'What payment methods do you accept?',
      answer: 'We accept credit cards, PayPal, and bank transfers for all transactions.',
      domainId: null
    }
  ];

  // Preview event handlers (no-op for preview)
  const handleChat = (e: React.FormEvent) => {
    e.preventDefault();
  };

  // Generate timestamp dynamically for each instance
  const greetingTimestamp = React.useMemo(() => new Date().toISOString(), []);

  // Watch for changes in the welcome message and form values
  const welcomeMessage = useWatch({
    control,
    name: 'welcomeMessage',
    defaultValue: message
  });

  const customLinkTitle = useWatch({
    control,
    name: 'customLinkTitle'
  });

  const customLinkDescription = useWatch({
    control,
    name: 'customLinkDescription'
  });

  const customLinkUrl = useWatch({
    control,
    name: 'customLinkUrl'
  });

  // Update form value when greeting messages change
  React.useEffect(() => {
    const messagesJson = JSON.stringify(greetingMessages);
    setValue('welcomeMessage', messagesJson, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
  }, [greetingMessages, setValue]);

  // Initialize form values
  React.useEffect(() => {
    setValue('background', defaultBackground);
    setValue('textColor', defaultTextColor);
    setValue('themeColor', defaultThemeColor);
    setValue('helpDeskColor', defaultHelpDeskColor);
    setValue('titleColor', defaultTitleColor);
    setValue('bubbleBackground', defaultBubbleBackground);
    setValue('homeTitle', homeTitle);
  }, [defaultBackground, defaultTextColor, defaultThemeColor, defaultHelpDeskColor, defaultTitleColor, defaultBubbleBackground, homeTitle, setValue]);

  // Handle color changes with persistence
  const handleColorChange = (type: string, value: string) => {
    switch (type) {
      case 'themeColor':
        setThemeColor(value);
        break;
      case 'textColor':
        setTextColor(value);
        break;
      case 'background':
        setBackground(value);
        break;
      case 'titleColor':
        setTitleColor(value);
        break;
      case 'helpDeskColor':
        setHelpDeskColor(value);
        break;
      case 'bubbleBackground':
        setBubbleBackground(value);
        break;
    }
    
    // Update form value as well
    setValue(type, value, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
    
    setHasUnsavedChanges(true);
  };

  // Handle home title changes
  const handleHomeContentChange = (type: 'homeTitle', value: string) => {
    setHomeTitle(value);
    
    setValue(type, value, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
    
    setHasUnsavedChanges(true);
  };

  // Functions to handle multiple greeting messages
  const addGreetingMessage = () => {
    setGreetingMessages([...greetingMessages, 'Enter your message here...']);
  };

  const removeGreetingMessage = (index: number) => {
    if (greetingMessages.length > 1) {
      const newMessages = greetingMessages.filter((_, i) => i !== index);
      setGreetingMessages(newMessages);
    }
  };

  const updateGreetingMessage = (index: number, value: string) => {
    const newMessages = [...greetingMessages];
    newMessages[index] = value;
    setGreetingMessages(newMessages);
  };

  const moveMessage = (index: number, direction: 'up' | 'down') => {
    const newMessages = [...greetingMessages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newMessages.length) {
      [newMessages[index], newMessages[targetIndex]] = [newMessages[targetIndex], newMessages[index]];
      setGreetingMessages(newMessages);
    }
  };

  // Add new function to handle custom link changes
  const customLinkDebounceTimeout = React.useRef<NodeJS.Timeout | null>(null);

  const handleCustomLinkChange = async () => {
    console.log("Attempting to save custom link:", {
      title: customLinkTitle,
      description: customLinkDescription,
      url: customLinkUrl
    });
    
    try {
      // Don't use debounce for button click
      const result = await onUpdateTheme(
        domainId,
        background,
        textColor,
        undefined, // iconColor
        undefined, // iconStyle
        themeColor,
        helpDeskColor,
        titleColor,
        undefined, // paymentEnabled
        undefined, // customLinkTitle
        undefined, // customLinkDescription
        undefined, // customLinkUrl
        undefined, // bubbleBackground
        homeTitle
      );

      console.log("Custom link save result:", result);

      if (result?.status === 200) {
        toast({
          title: "Custom link updated",
          description: "Your changes have been saved.",
          duration: 2000
        });
      } else {
        toast({
          title: "Error",
          description: result?.message || "Failed to save custom link changes. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating custom link:', error);
      toast({
        title: "Error",
        description: "Failed to save custom link changes. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Replace the handlePresetChange function with this more flexible version
  const handlePresetChange = (presetId: string) => {
    // Find the preset by ID from all presets
    const presets = getAllPresets();
    const preset = presets.find(p => p.id === presetId);
    
    if (!preset) {
      console.error(`Preset with ID ${presetId} not found`);
      return;
    }

    // Extract colors from the preset
    const values = preset.colors;
    
    // Update local state variables for immediate preview
    setBackground(values.background);
    setTextColor(values.textColor);
    setThemeColor(values.themeColor);
    setHelpDeskColor(values.helpDeskColor);
    setTitleColor(values.titleColor);
    
    // Update form values
    Object.entries(values).forEach(([key, value]) => {
      setValue(key, value, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });
    });

    // Mark as having unsaved changes
    setHasUnsavedChanges(true);
    setSelectedPresetId(presetId);
    
    // Show toast indicating preset applied but needs saving
    toast({
      title: `Preset "${preset.name}" selected`,
      description: "Click 'Save Changes' to apply these settings.",
      duration: 3000
    });
  };

  // Add this state to track the selected preset
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  // Create preview messages from all greeting messages
  const previewMessages = React.useMemo(() => 
    greetingMessages.map((msg, index) => ({
      role: 'assistant' as const,
      content: msg,
      link: '',
      createdAt: new Date(Date.now() + index * 1000).toISOString(), // Stagger timestamps
      products: []
    })), [greetingMessages]);

  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleSaveTheme = async () => {
    setSaving(true);
    try {
      const result = await onUpdateTheme(
        domainId,
        background,
        textColor,
        undefined, // iconColor
        undefined, // iconStyle
        themeColor,
        helpDeskColor,
        titleColor,
        undefined, // paymentEnabled
        undefined, // customLinkTitle
        undefined, // customLinkDescription
        undefined, // customLinkUrl
        undefined, // bubbleBackground
        homeTitle
      );
      
      if (result?.status === 200) {
        toast({
          title: 'Theme updated',
          description: 'Your bot theme has been updated.',
          variant: 'default',
        });
        setHasUnsavedChanges(false);
      } else {
        toast({
          title: 'Error updating theme',
          description: result?.message || 'There was an error updating your bot theme.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Theme update error:', error);
      toast({
        title: 'Error updating theme',
        description: 'There was an error updating your bot theme.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Section
          label="Home page welcome"
          message="Customize the title that appear on your chatbot's home page"
        />
        
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Home Page Title</Label>
              <Input
                value={homeTitle}
                onChange={(e) => handleHomeContentChange('homeTitle', e.target.value)}
                placeholder="Welcome to Support"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                The main title shown on your chatbot's home page
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Section
          label="Greeting messages"
          message="Customize your welcome messages (shown sequentially when users open the chat)"
        />
        
        <div className="space-y-4">
          {greetingMessages.map((msg, index) => (
            <div key={index} className="flex gap-2 items-start">
              {/* Message ordering controls */}
              <div className="flex flex-col gap-1 mt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => moveMessage(index, 'up')}
                  disabled={index === 0}
                >
                  <ArrowRight className="h-3 w-3 rotate-[-90deg]" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => moveMessage(index, 'down')}
                  disabled={index === greetingMessages.length - 1}
                >
                  <ArrowRight className="h-3 w-3 rotate-90" />
                </Button>
              </div>

              {/* Message input */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Label className="text-sm font-medium">Message {index + 1}</Label>
                  <Badge variant="outline" className="text-xs">
                    {index === 0 ? 'First' : index === greetingMessages.length - 1 ? 'Last' : `Order ${index + 1}`}
                  </Badge>
                </div>
                <Textarea
                  value={msg}
                  onChange={(e) => updateGreetingMessage(index, e.target.value)}
                  placeholder="Enter your greeting message..."
                  className="min-h-[80px] resize-none"
                />
              </div>

              {/* Remove button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 mt-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => removeGreetingMessage(index)}
                disabled={greetingMessages.length === 1}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {/* Add message button */}
          <Button
            type="button"
            variant="outline"
            onClick={addGreetingMessage}
            className="w-full mt-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Message
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Section
          icon={<Paintbrush className="w-5 h-5" />}
          label="Theme Customization"
          message="Customize your chatbot's appearance"
        />
        
        <Card className="w-full">
          <CardContent className="pt-6">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-3 mb-6">
                  {[
                    { label: 'Background', color: background, onChange: (v: string) => handleColorChange('background', v) },
                    { label: 'Text', color: textColor, onChange: (v: string) => handleColorChange('textColor', v) },
                    { label: 'Theme', color: themeColor, onChange: (v: string) => handleColorChange('themeColor', v) },
                    { label: 'Help Desk', color: helpDeskColor, onChange: (v: string) => handleColorChange('helpDeskColor', v) },
                    { label: 'Title', color: titleColor, onChange: (v: string) => handleColorChange('titleColor', v) }
                  ].map((item, index) => (
                    <div key={index} className="group relative">
                      <button 
                        type="button"
                        className="relative w-10 h-10 rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:ring-2 hover:ring-offset-2 hover:ring-gray-200 transition-all focus:outline-none"
                        onClick={() => document.getElementById(`color-${index}`)?.click()}
                        title={item.label}
                      >
                        <div 
                          className="absolute inset-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <Input
                          type="color"
                          id={`color-${index}`}
                          value={item.color}
                          onChange={(e) => item.onChange(e.target.value)}
                          className="sr-only"
                        />
                      </button>
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        <span className="text-xs text-gray-600">{item.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Color Presets */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-700">Theme Presets</h4>
                  </div>
                  
                  <Tabs defaultValue="general" className="w-full">
                    <TabsList className="mb-3 w-full overflow-x-auto flex-nowrap">
                      {Object.entries(THEME_CATEGORIES).map(([key, label]) => (
                        <TabsTrigger 
                          key={key} 
                          value={key} 
                          className="text-xs flex-shrink-0 truncate px-2 py-1.5"
                        >
                          {label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    
                    {Object.keys(THEME_CATEGORIES).map((category) => (
                      <TabsContent key={category} value={category} className="mt-0">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {getPresetsByCategory(category).map((preset) => {
                            // Theme gradient for the preview swatch
                            const gradientStyle = {
                              background: `linear-gradient(to right, ${preset.colors.themeColor}, ${preset.colors.helpDeskColor})`
                            };
                            
                            // Get contrast-friendly text color
                            const textColor = getContrastTextColor(preset.colors.themeColor);
                            
                            return (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => handlePresetChange(preset.id)}
                                className={`relative flex flex-col h-full text-left p-2 rounded-md border transition-all ${
                                  selectedPresetId === preset.id
                                    ? 'border-primary bg-primary/5 shadow-sm'
                                    : 'border-border hover:border-primary/50'
                                }`}
                              >
                                {selectedPresetId === preset.id && (
                                  <div className="absolute top-1 right-1">
                                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                                  </div>
                                )}
                                
                                <div 
                                  className="w-full h-6 rounded mb-2 overflow-hidden" 
                                  style={gradientStyle}
                                >
                                  <div className="h-full flex items-center justify-center">
                                    <span 
                                      className="text-[10px] font-bold"
                                      style={{ color: textColor }}
                                    >
                                      Aa
                                    </span>
                                  </div>
                                </div>
                                
                                <h5 className="text-xs font-medium truncate pr-5">{preset.name}</h5>
                                <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5 min-h-[1.6rem]">
                                  {preset.description}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
                
                {/* Save Theme Button */}
                <div className="flex justify-between items-center pt-4 border-t">
                  {hasUnsavedChanges && (
                    <div className="flex items-center text-amber-600 text-sm">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                      You have unsaved changes
                    </div>
                  )}
                  <div className={hasUnsavedChanges ? '' : 'ml-auto'}>
                    <Button 
                      type="button"
                      onClick={handleSaveTheme}
                      disabled={saving || !hasUnsavedChanges}
                      className="min-w-[120px]"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Custom Links Section */}
              <div className="mt-8">
                <CustomLinksManager 
                  domainId={domainId}
                  initialCustomLinks={initialCustomLinks}
                />
              </div>

              {/* Popular Topics Section */}
              <div className="mt-8">
                <PopularTopicsManager 
                  domainId={domainId}
                  initialTopics={(() => {
                    if (!initialPopularTopics) return []
                    try {
                      return JSON.parse(initialPopularTopics)
                    } catch {
                      return []
                    }
                  })()}
                  helpDeskQuestions={helpDeskQuestions}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default GreetingsMessage
