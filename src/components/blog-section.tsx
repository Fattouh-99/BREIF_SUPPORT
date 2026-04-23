import { onGetBlogPosts, onGetCategories, onGetTags } from '@/actions/landing'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { getMonthName } from '@/lib/utils'
import parse from 'html-react-parser'
import { Badge } from '@/components/ui/badge'
import { User, Tag as TagIcon, FolderOpen } from 'lucide-react'

type Author = {
  fullname: string
  email: string
}

type Category = {
  id: string
  name: string
  slug: string
  description?: string | null
}

type Tag = {
  id: string
  name: string
  slug: string
}

type BlogPost = {
  id: string
  title: string
  content: string
  excerpt?: string | null
  image: string
  createdAt: Date
  author?: Author | null
  category?: Category | null
  tags: Tag[]
  views: number
  likes: number
}

export async function BlogSection() {
  const [posts, categories, tags] = await Promise.all([
    onGetBlogPosts(),
    onGetCategories(),
    onGetTags()
  ])

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <p className="text-slate-600 text-sm sm:text-md">It's quiet here for now. No articles available at the moment.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {posts.map((post: BlogPost) => (
            <Link href={`/blogs/${post.id}`} key={post.id}>
              <Card className="h-full hover:shadow-lg transition-all overflow-hidden">
                <div className="relative w-full aspect-video">
                  <Image
                    src={`${process.env.CLOUDWAYS_UPLOADS_URL}${post.image}`}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 sm:p-6 flex flex-col gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 text-sm text-primary-600">
                    <User className="w-4 h-4" />
                    <span>{post.author?.fullname}</span>
                  </div>
                  <CardDescription className="text-primary-600 text-sm">
                    {getMonthName(post.createdAt.getMonth())}{' '}
                    {post.createdAt.getDate()} {post.createdAt.getFullYear()}
                  </CardDescription>
                  <CardTitle className="text-slate-900 text-lg sm:text-xl">{post.title}</CardTitle>
                  {post.excerpt && (
                    <div className="text-indigo-500 text-sm sm:text-base">
                      {parse(post.excerpt.slice(0, 100))}...
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {post.category && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <FolderOpen className="w-3 h-3" />
                        {post.category.name}
                      </Badge>
                    )}
                    {post.tags.map((tag: Tag) => (
                      <Badge key={tag.id} variant="outline" className="flex items-center gap-1">
                        <TagIcon className="w-3 h-3" />
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1">
        {/* Categories */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Categories</h3>
          <div className="space-y-2">
            {categories.map((category: Category) => (
              <Link
                key={category.id}
                href={`/blogs/category/${category.slug}`}
                className="flex items-center gap-2 text-primary-600 hover:text-primary-800 transition-colors"
              >
                <FolderOpen className="w-4 h-4" />
                <span>{category.name}</span>
              </Link>
            ))}
          </div>
        </Card>

        {/* Tags */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag: Tag) => (
              <Link
                key={tag.id}
                href={`/blogs/tag/${tag.slug}`}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-100 text-primary-600 hover:bg-primary-200 transition-colors"
              >
                <TagIcon className="w-3 h-3" />
                <span>{tag.name}</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
} 