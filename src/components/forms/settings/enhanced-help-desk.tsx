'use client'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import DOMPurify from 'dompurify'
import { HelpDeskQuestionsProps, HelpDeskQuestionsSchema } from '@/schemas/settings.schema'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus, X, Edit3, Eye, Trash2, Pin, PinOff, Calendar, BarChart3 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { onCreateHelpDeskQuestion, onGetAllHelpDeskQuestions } from '@/actions/settings'
import { Loader } from '@/components/loader'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type Props = {
  id: string
}

type HelpDeskArticle = {
  id: string
  title: string
  question: string
  answer: string
  content?: string
  articleType: string
  category?: string
  tags: string[]
  isPublished: boolean
  isPinned: boolean
  viewCount: number
  createdAt: Date
  updatedAt: Date
}

const EnhancedHelpDesk = ({ id }: Props) => {
  const { toast } = useToast()
  const [loading, setLoading] = useState<boolean>(false)
  const [articles, setArticles] = useState<HelpDeskArticle[]>([])
  const [editingArticle, setEditingArticle] = useState<HelpDeskArticle | null>(null)
  const [newTag, setNewTag] = useState('')
  const [activeTab, setActiveTab] = useState('create')

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<HelpDeskQuestionsProps>({
    resolver: zodResolver(HelpDeskQuestionsSchema),
    defaultValues: {
      articleType: 'faq',
      tags: [],
      isPublished: true,
      isPinned: false,
    },
  })

  const watchedValues = watch()

  const onSubmit = async (values: HelpDeskQuestionsProps) => {
    try {
      setLoading(true)
      const result = await onCreateHelpDeskQuestion(id, values)
      
      if (result && result.status === 200) {
        setArticles(result.questions || [])
        toast({
          title: 'Success',
          description: result.message,
        })
        reset()
        setNewTag('')
        setActiveTab('articles')
      } else {
        toast({
          title: 'Error',
          description: result?.message || 'Failed to create article',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !watchedValues.tags.includes(newTag.trim())) {
      const updatedTags = [...watchedValues.tags, newTag.trim()]
      setValue('tags', updatedTags)
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = watchedValues.tags.filter(tag => tag !== tagToRemove)
    setValue('tags', updatedTags)
  }

  const handleDeleteArticle = async (articleId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/settings/help-desk/${articleId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setArticles(prev => prev.filter(article => article.id !== articleId))
        toast({
          title: 'Success',
          description: 'Article deleted successfully',
        })
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete article',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const loadArticles = async () => {
    try {
      setLoading(true)
      const result = await onGetAllHelpDeskQuestions(id)
      if (result && result.questions) {
        setArticles(result.questions)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load articles',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadArticles()
  }, [id])

  const getArticleTypeColor = (type: string) => {
    switch (type) {
      case 'faq': return 'bg-blue-100 text-blue-800'
      case 'article': return 'bg-green-100 text-green-800'
      case 'guide': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Create Article</TabsTrigger>
          <TabsTrigger value="articles">Manage Articles ({articles.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Help Article</CardTitle>
              <CardDescription>
                Create comprehensive help articles with rich formatting and customization options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Article Type and Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="articleType">Article Type</Label>
                    <Select
                      value={watchedValues.articleType}
                      onValueChange={(value) => setValue('articleType', value as 'faq' | 'article' | 'guide')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select article type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="faq">FAQ</SelectItem>
                        <SelectItem value="article">Article</SelectItem>
                        <SelectItem value="guide">Guide</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category (Optional)</Label>
                    <Input
                      {...register('category')}
                      placeholder="e.g., Billing, Technical, General"
                    />
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Article Title</Label>
                  <Input
                    {...register('title')}
                    placeholder="Enter a descriptive title for your article"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">{errors.title.message}</p>
                  )}
                </div>

                {/* Question */}
                <div className="space-y-2">
                  <Label htmlFor="question">Question or Topic</Label>
                  <Input
                    {...register('question')}
                    placeholder="What question does this article answer?"
                    className={errors.question ? 'border-red-500' : ''}
                  />
                  {errors.question && (
                    <p className="text-sm text-red-500">{errors.question.message}</p>
                  )}
                </div>

                {/* Answer */}
                <div className="space-y-2">
                  <Label htmlFor="answer">Short Answer</Label>
                  <Textarea
                    {...register('answer')}
                    placeholder="Provide a concise answer or summary"
                    rows={3}
                    className={errors.answer ? 'border-red-500' : ''}
                  />
                  {errors.answer && (
                    <p className="text-sm text-red-500">{errors.answer.message}</p>
                  )}
                </div>

                {/* Rich Content */}
                <div className="space-y-2">
                  <Label htmlFor="content">Detailed Content (Optional)</Label>
                  <Textarea
                    {...register('content')}
                    placeholder="Add detailed explanations, steps, or additional information here. You can use HTML for formatting."
                    rows={8}
                    className="font-mono"
                  />
                  <p className="text-xs text-gray-500">
                    Tip: You can use HTML tags for rich formatting (e.g., &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;code&gt;)
                  </p>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      />
                      <Button type="button" onClick={handleAddTag} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {watchedValues.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {watchedValues.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-transparent"
                              onClick={() => handleRemoveTag(tag)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Publishing Options */}
                <div className="space-y-4">
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={watchedValues.isPublished}
                        onCheckedChange={(checked) => setValue('isPublished', checked)}
                      />
                      <Label htmlFor="isPublished">Publish immediately</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={watchedValues.isPinned}
                        onCheckedChange={(checked) => setValue('isPinned', checked)}
                      />
                      <Label htmlFor="isPinned">Pin to top</Label>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Article'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="articles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Help Articles</CardTitle>
              <CardDescription>
                Manage your existing help articles and FAQs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Loader loading={loading}>
                {articles.length > 0 ? (
                  <div className="space-y-4">
                    {articles.map((article) => (
                      <div
                        key={article.id}
                        className="border rounded-lg p-4 space-y-3 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{article.title}</h3>
                              {article.isPinned && (
                                <Pin className="w-4 h-4 text-amber-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Badge className={getArticleTypeColor(article.articleType)}>
                                {article.articleType.toUpperCase()}
                              </Badge>
                              {article.category && (
                                <Badge variant="outline">{article.category}</Badge>
                              )}
                              <div className="flex items-center gap-1">
                                <BarChart3 className="w-3 h-3" />
                                <span>{article.viewCount} views</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                                                         <p className="text-gray-600 font-medium">{article.question}</p>
                             <p className="text-gray-700 leading-relaxed">{article.answer}</p>
                             {article.content && (
                               <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                 <h4 className="text-sm font-medium text-gray-900 mb-2">Detailed Content:</h4>
                                 <div 
                                   className="prose prose-sm max-w-none text-gray-700 [&>p]:mb-2 [&>ol]:ml-4 [&>ul]:ml-4 [&>li]:mb-1 [&>strong]:font-semibold [&>em]:italic"
                                   dangerouslySetInnerHTML={{ 
                                     __html: typeof window !== 'undefined' 
                                       ? DOMPurify.sanitize(article.content) 
                                       : article.content 
                                   }}
                                 />
                               </div>
                             )}
                            {article.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {article.tags.map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Article</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this article? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteArticle(article.id)}
                                    className="bg-red-600 text-white hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No articles created yet.</p>
                    <Button
                      onClick={() => setActiveTab('create')}
                      className="mt-4"
                    >
                      Create Your First Article
                    </Button>
                  </div>
                )}
              </Loader>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default EnhancedHelpDesk 