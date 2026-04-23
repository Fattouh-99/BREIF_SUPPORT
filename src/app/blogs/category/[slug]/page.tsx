import { onGetPostsByCategory, onGetCategories, onGetTags } from '@/actions/landing'
import { BlogSection } from '@/components/blog-section'
import { notFound } from 'next/navigation'

type Props = {
  params: {
    slug: string
  }
}

type Category = {
  id: string
  name: string
  slug: string
  description?: string | null
}

export default async function CategoryPage({ params }: Props) {
  const [posts, categories, tags] = await Promise.all([
    onGetPostsByCategory(params.slug),
    onGetCategories(),
    onGetTags()
  ])

  const category = categories.find((c: Category) => c.slug === params.slug)
  if (!category) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-primary-900 mb-4">{category.name}</h1>
        {category.description && (
          <p className="text-xl text-primary-600 max-w-2xl mx-auto">
            {category.description}
          </p>
        )}
      </div>
      
      <BlogSection />
    </div>
  )
} 