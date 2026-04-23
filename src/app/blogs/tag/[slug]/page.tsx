import { onGetPostsByTag, onGetCategories, onGetTags } from '@/actions/landing'
import { BlogSection } from '@/components/blog-section'
import { notFound } from 'next/navigation'

type Props = {
  params: {
    slug: string
  }
}

type Tag = {
  id: string
  name: string
  slug: string
}

export default async function TagPage({ params }: Props) {
  const [posts, categories, tags] = await Promise.all([
    onGetPostsByTag(params.slug),
    onGetCategories(),
    onGetTags()
  ])

  const tag = tags.find((t: Tag) => t.slug === params.slug)
  if (!tag) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-primary-900 mb-4">Posts tagged "{tag.name}"</h1>
      </div>
      
      <BlogSection />
    </div>
  )
} 