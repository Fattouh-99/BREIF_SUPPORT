'use client'

import { useState } from 'react'
import { onAddComment } from '@/actions/landing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { getMonthName } from '@/lib/utils'

type Comment = {
  id: string
  content: string
  author: string
  email: string
  createdAt: Date
  approved: boolean
}

type CommentSectionProps = {
  postId: string
  comments: Comment[]
}

export function CommentSection({ postId, comments }: CommentSectionProps) {
  const [formData, setFormData] = useState({
    author: '',
    email: '',
    content: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onAddComment(postId, formData)
      setSubmitted(true)
      setFormData({ author: '', email: '', content: '' })
    } catch (error) {
      console.error('Error submitting comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Comment Form */}
      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-primary-700 mb-1">
                Name
              </label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary-700 mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-primary-700 mb-1">
              Comment
            </label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows={4}
            />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Comment'}
          </Button>
        </form>
      ) : (
        <div className="bg-primary-50 p-4 rounded-lg">
          <p className="text-primary-700">
            Thank you for your comment! It will be reviewed and posted soon.
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-primary-900">{comment.author}</div>
              <div className="text-sm text-primary-600">
                {getMonthName(comment.createdAt.getMonth())}{' '}
                {comment.createdAt.getDate()}, {comment.createdAt.getFullYear()}
              </div>
            </div>
            <div className="text-primary-700">{comment.content}</div>
          </div>
        ))}
      </div>
    </div>
  )
} 