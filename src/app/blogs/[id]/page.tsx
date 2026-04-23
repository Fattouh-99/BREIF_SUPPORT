import { onGetBlogPost, onIncrementViews } from '@/actions/landing'
import { CardDescription } from '@/components/ui/card'
import { getMonthName } from '@/lib/utils'
import parse from 'html-react-parser'
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { User, Tag as TagIcon, FolderOpen, Eye, Heart, MessageSquare } from 'lucide-react'
import { CommentSection } from '@/components/comment-section'

type Props = { params: { id: string } }

const PostPage = async ({ params }: Props) => {
  const post = await onGetBlogPost(params.id)
  
  if (!post) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl text-primary-900">Post not found</h1>
      </div>
    )
  }

  // Increment view count
  await onIncrementViews(params.id)

  return (
    <div className="container mx-auto px-4 py-16">
      <article className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 text-sm text-primary-600 mb-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{post.author?.fullname}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>{post.views} views</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span>{post.likes} likes</span>
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-primary-900 mb-4">{post.title}</h1>
          
          <div className="flex items-center gap-2 text-primary-600 mb-6">
            <CardDescription>
              {getMonthName(post.createdAt.getMonth())}{' '}
              {post.createdAt.getDate()} {post.createdAt.getFullYear()}
            </CardDescription>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {post.category && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <FolderOpen className="w-3 h-3" />
                {post.category.name}
              </Badge>
            )}
            {post.tags.map((tag) => (
              <Badge key={tag.id} variant="outline" className="flex items-center gap-1">
                <TagIcon className="w-3 h-3" />
                {tag.name}
              </Badge>
            ))}
          </div>

          {/* Featured Image */}
          <div className="relative w-full aspect-video mb-8 rounded-lg overflow-hidden">
            <img
              src={`${process.env.CLOUDWAYS_UPLOADS_URL}${post.image}`}
              alt={post.title}
              className="object-cover w-full h-full"
            />
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          {parse(post.content)}
        </div>

        {/* Comments Section */}
        <div className="mt-16">
          <div className="flex items-center gap-2 mb-8">
            <MessageSquare className="w-5 h-5 text-primary-600" />
            <h2 className="text-2xl font-bold text-primary-900">Comments</h2>
          </div>
          <CommentSection postId={post.id} comments={post.comments} />
        </div>
      </article>
    </div>
  )
}

export default PostPage
