'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, Plus, Edit2, X, Check } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { onCreateCustomLink, onUpdateCustomLink, onDeleteCustomLink, onGetCustomLinks } from '@/actions/settings'

type CustomLink = {
  id: string
  title: string
  description?: string | null
  url: string
  createdAt: string | Date
}

type Props = {
  domainId: string
  initialCustomLinks?: CustomLink[]
  onCustomLinksChange?: (customLinks: CustomLink[]) => void
}

const CustomLinksManager = ({ domainId, initialCustomLinks = [], onCustomLinksChange }: Props) => {
  const { toast } = useToast()
  const [customLinks, setCustomLinks] = useState<CustomLink[]>(initialCustomLinks)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Form state for new/edit custom link
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
  })

  useEffect(() => {
    setCustomLinks(initialCustomLinks)
  }, [initialCustomLinks])

  useEffect(() => {
    onCustomLinksChange?.(customLinks)
  }, [customLinks, onCustomLinksChange])



  const resetForm = () => {
    setFormData({ title: '', description: '', url: '' })
    setEditingId(null)
    setShowAddForm(false)
  }

  const handleAddCustomLink = async () => {
    if (!formData.title.trim() || !formData.url.trim()) {
      toast({
        title: "Error",
        description: "Title and URL are required",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const result = await onCreateCustomLink(
        domainId,
        formData.title.trim(),
        formData.description.trim() || undefined,
        formData.url.trim()
      )

      if (result?.status === 200 && result.data) {
        setCustomLinks(prev => [...prev, result.data])
        toast({
          title: "Success",
          description: "Custom link added successfully"
        })
        resetForm()
      } else {
        toast({
          title: "Error",
          description: result?.message || "Failed to add custom link",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error adding custom link:', error)
      toast({
        title: "Error",
        description: "Failed to add custom link",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateCustomLink = async () => {
    if (!editingId || !formData.title.trim() || !formData.url.trim()) {
      toast({
        title: "Error",
        description: "Title and URL are required",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const result = await onUpdateCustomLink(
        editingId,
        formData.title.trim(),
        formData.description.trim() || undefined,
        formData.url.trim()
      )

      if (result?.status === 200 && result.data) {
        setCustomLinks(prev => 
          prev.map(link => 
            link.id === editingId 
              ? { ...link, ...result.data }
              : link
          )
        )
        toast({
          title: "Success",
          description: "Custom link updated successfully"
        })
        resetForm()
      } else {
        toast({
          title: "Error",
          description: result?.message || "Failed to update custom link",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating custom link:', error)
      toast({
        title: "Error",
        description: "Failed to update custom link",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCustomLink = async (customLinkId: string) => {
    setLoading(true)
    try {
      const result = await onDeleteCustomLink(customLinkId)

      if (result?.status === 200) {
        setCustomLinks(prev => prev.filter(link => link.id !== customLinkId))
        toast({
          title: "Success",
          description: "Custom link deleted successfully"
        })
      } else {
        toast({
          title: "Error",
          description: result?.message || "Failed to delete custom link",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting custom link:', error)
      toast({
        title: "Error",
        description: "Failed to delete custom link",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (customLink: CustomLink) => {
    setFormData({
      title: customLink.title,
      description: customLink.description || '',
      url: customLink.url,
    })
    setEditingId(customLink.id)
    setShowAddForm(false)
  }

  const startAdd = () => {
    resetForm()
    setShowAddForm(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-gray-700">Custom Links</h4>
          <p className="text-xs text-gray-500">Add custom links to your chatbot home page</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={startAdd}
          disabled={loading || showAddForm || editingId !== null}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Link
        </Button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingId) && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="font-medium text-sm">
                {editingId ? 'Edit Custom Link' : 'Add New Custom Link'}
              </h5>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetForm}
                className="h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div>
              <Label htmlFor="title" className="text-xs">Link Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Visit our FAQ"
                className="mt-1"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-xs">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="e.g., Check out our frequently asked questions"
                className="mt-1"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="url" className="text-xs">URL *</Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://your-website.com/faq"
                className="mt-1"
                type="url"
                disabled={loading}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                size="sm"
                onClick={editingId ? handleUpdateCustomLink : handleAddCustomLink}
                disabled={loading || !formData.title.trim() || !formData.url.trim()}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                ) : (
                  <Check className="w-3 h-3" />
                )}
                {editingId ? 'Update' : 'Add'} Link
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetForm}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Custom Links */}
      {customLinks.length > 0 && (
        <div className="space-y-2">
          {customLinks.map((customLink) => (
            <Card key={customLink.id} className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-sm truncate">{customLink.title}</h5>
                      <a 
                        href={customLink.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 text-xs"
                      >
                        ↗
                      </a>
                    </div>
                    {customLink.description && (
                      <p className="text-xs text-gray-600 mb-1">{customLink.description}</p>
                    )}
                    <p className="text-xs text-gray-400 truncate">{customLink.url}</p>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(customLink)}
                      disabled={loading || showAddForm || editingId !== null}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCustomLink(customLink.id)}
                      disabled={loading || customLinks.length === 0}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {customLinks.length === 0 && !showAddForm && (
        <Card className="border-dashed border-gray-300">
          <CardContent className="p-8 text-center">
            <div className="text-gray-400 mb-2">
              <svg className="mx-auto w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 mb-3">No custom links added yet</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={startAdd}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Your First Link
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default CustomLinksManager 