'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, GripVertical, Hash, ExternalLink, HelpCircle } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { onUpdatePopularTopics } from '@/actions/settings'

interface PopularTopic {
  id: string
  title: string
  linkType: 'helpdesk_general' | 'helpdesk_specific' | 'external_url'
  linkTarget?: string
}

interface PopularTopicsManagerProps {
  domainId: string
  initialTopics?: PopularTopic[]
  onTopicsChange?: (topics: PopularTopic[]) => void
  helpDeskQuestions?: Array<{
    id: string
    question: string
    answer: string
  }>
}

const PopularTopicsManager = ({ 
  domainId, 
  initialTopics = [], 
  onTopicsChange,
  helpDeskQuestions = []
}: PopularTopicsManagerProps) => {
  const [topics, setTopics] = useState<PopularTopic[]>(initialTopics)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Generate unique ID for new topics
  const generateId = () => {
    return 'topic_' + Math.random().toString(36).substr(2, 9)
  }

  // Add new topic
  const addTopic = () => {
    const newTopic: PopularTopic = {
      id: generateId(),
      title: '',
      linkType: 'helpdesk_general' // Default link type
    }
    const updatedTopics = [...topics, newTopic]
    setTopics(updatedTopics)
    onTopicsChange?.(updatedTopics)
  }

  // Remove topic
  const removeTopic = (id: string) => {
    const updatedTopics = topics.filter(topic => topic.id !== id)
    setTopics(updatedTopics)
    onTopicsChange?.(updatedTopics)
  }

  // Update topic
  const updateTopic = (id: string, field: keyof PopularTopic, value: string) => {
    const updatedTopics = topics.map(topic =>
      topic.id === id ? { ...topic, [field]: value } : topic
    )
    setTopics(updatedTopics)
    onTopicsChange?.(updatedTopics)
  }

  // Save topics to backend
  const saveTopics = async () => {
    setIsSaving(true)
    try {
      // Validate and filter topics
      const validTopics = topics.filter(topic => {
        if (!topic.title.trim()) return false
        
        // Additional validation based on link type
        if (topic.linkType === 'external_url') {
          if (!topic.linkTarget?.trim()) return false
          // Basic URL validation
          try {
            new URL(topic.linkTarget)
          } catch {
            return false
          }
        }
        
        if (topic.linkType === 'helpdesk_specific') {
          if (!topic.linkTarget?.trim()) return false
        }
        
        return true
      })

      // Check if we filtered out any invalid topics
      const invalidTopics = topics.length - validTopics.length
      if (invalidTopics > 0) {
        toast({
          title: 'Validation Error',
          description: `${invalidTopics} topic(s) removed due to missing or invalid information. Please check:
          - All topics have titles
          - External URLs are valid
          - Help desk topics have articles selected`,
          variant: 'destructive'
        })
        return
      }
      
      console.log('Saving popular topics:', {
        domainId,
        validTopics,
        originalTopics: topics
      })
      
      const result = await onUpdatePopularTopics(domainId, validTopics)
      
      console.log('Save result:', result)
      
      if (result?.status === 200) {
        toast({
          title: 'Success',
          description: 'Popular topics updated successfully'
        })
        setTopics(validTopics) // Update state with only valid topics
        onTopicsChange?.(validTopics)
      } else {
        console.error('Save failed with result:', result)
        throw new Error(result?.message || 'Failed to update popular topics')
      }
    } catch (error) {
      console.error('Error saving popular topics:', error)
      toast({
        title: 'Error',
        description: 'Failed to save popular topics. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Check if there are unsaved changes
  const hasChanges = JSON.stringify(topics) !== JSON.stringify(initialTopics)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="w-5 h-5" />
          Popular Topics
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Add popular topics that will appear as quick access buttons on your chatbot's home page. 
          These help users quickly navigate to common support areas.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {topics.map((topic, index) => (
          <div key={topic.id} className="flex items-start gap-3 p-4 border rounded-lg">
            <div className="flex-shrink-0 mt-6">
              <GripVertical className="w-4 h-4 text-gray-400" />
            </div>
            
            <div className="flex-1 space-y-3">
              <div>
                <Label htmlFor={`topic-title-${topic.id}`} className="text-sm font-medium">
                  Topic Name
                </Label>
                <Input
                  id={`topic-title-${topic.id}`}
                  placeholder="e.g., Getting Started, Account, Billing"
                  value={topic.title}
                  onChange={(e) => updateTopic(topic.id, 'title', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Link Type</Label>
                <Select
                  value={topic.linkType}
                  onValueChange={(value: 'helpdesk_general' | 'helpdesk_specific' | 'external_url') => 
                    updateTopic(topic.id, 'linkType', value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose link type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="helpdesk_general">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" />
                        General Help Desk
                      </div>
                    </SelectItem>
                    <SelectItem value="helpdesk_specific">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" />
                        Specific Help Article
                      </div>
                    </SelectItem>
                    <SelectItem value="external_url">
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4" />
                        External Link
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Conditional input based on link type */}
              {topic.linkType === 'helpdesk_specific' && (
                <div>
                  <Label className="text-sm font-medium">Help Article</Label>
                  <Select
                    value={topic.linkTarget || ''}
                    onValueChange={(value) => updateTopic(topic.id, 'linkTarget', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a help article" />
                    </SelectTrigger>
                    <SelectContent>
                      {helpDeskQuestions.map((question) => (
                        <SelectItem key={question.id} value={question.id}>
                          <div className="truncate max-w-[300px]">
                            {question.question}
                          </div>
                        </SelectItem>
                      ))}
                      {helpDeskQuestions.length === 0 && (
                        <div className="p-2 text-sm text-gray-500">
                          No help articles available. Create some in the Help Desk section first.
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {topic.linkType === 'external_url' && (
                <div>
                  <Label htmlFor={`topic-url-${topic.id}`} className="text-sm font-medium">
                    External URL
                  </Label>
                  <Input
                    id={`topic-url-${topic.id}`}
                    placeholder="https://example.com"
                    value={topic.linkTarget || ''}
                    onChange={(e) => updateTopic(topic.id, 'linkTarget', e.target.value)}
                    className="mt-1"
                    type="url"
                  />
                </div>
              )}
              
              <div className="text-xs text-gray-500">
                {topic.linkType === 'helpdesk_general' && 'Clicking this topic will open the general help desk'}
                {topic.linkType === 'helpdesk_specific' && 'Clicking this topic will expand the selected help article'}
                {topic.linkType === 'external_url' && 'Clicking this topic will open the external link in a new tab'}
              </div>
            </div>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeTopic(topic.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-6"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}

        {topics.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Hash className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No popular topics added yet</p>
            <p className="text-xs">Add topics to help users navigate quickly</p>
          </div>
        )}

        <div className="flex justify-between items-center pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={addTopic}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Topic
          </Button>

          {hasChanges && (
            <Button
              onClick={saveTopics}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              {isSaving ? 'Saving...' : 'Save Topics'}
            </Button>
          )}
        </div>

        {topics.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="text-sm">
                <p className="font-medium text-blue-800">Preview</p>
                <p className="text-blue-700">
                  These topics will appear as clickable buttons on your chatbot's home page.
                  Users can click them to quickly access related help articles.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default PopularTopicsManager 