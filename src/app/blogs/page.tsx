import { onGetBlogPosts } from '@/actions/landing'
import { BlogSection } from '@/components/blog-section'
import Footer from '@/components/footer'
export default async function BlogsPage() {
  return (
    <>
        <main className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-primary-50">
        <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-12">
            <span className="bg-primary-100 text-primary-600 px-4 py-1.5 rounded-full text-sm font-semibold">Our Blog</span>
            <h1 className="mt-6 text-4xl sm:text-5xl font-bold text-primary-900">
                Latest <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800">Insights</span>
            </h1>
            <p className="text-xl text-primary-600 max-w-2xl mx-auto mt-6">
                Insights, updates, and stories about AI, customer service, and business growth.
            </p>
            </div>
            
            <BlogSection />
        </div>
        </main>
        <Footer />
    </>
  )
} 