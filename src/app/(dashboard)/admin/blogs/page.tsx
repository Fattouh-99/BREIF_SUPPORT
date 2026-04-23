'use client'

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { client } from '@/lib/prisma'
import { BlogPost, Category, Tag } from '@prisma/client'

const blogPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().optional(),
  image: z.string().min(1, 'Image URL is required'),
  categoryId: z.string().optional(),
  published: z.boolean().default(false),
  tags: z.array(z.string()).default([])
})

type BlogPostWithRelations = BlogPost & {
  category?: Category | null
  tags: Tag[]
}

export default function AdminBlogsPage() {
  const [posts, setPosts] = useState<BlogPostWithRelations[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState<BlogPostWithRelations | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  
  const form = useForm<z.infer<typeof blogPostSchema>>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: '',
      content: '',
      excerpt: '',
      image: '',
      categoryId: '',
      published: false,
      tags: []
    }
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsData, categoriesData, tagsData] = await Promise.all([
          client.blogPost.findMany({
            include: {
              category: true,
              tags: true
            },
            orderBy: {
              createdAt: 'desc'
            }
          }),
          client.category.findMany(),
          client.tag.findMany()
        ])
        
        setPosts(postsData)
        setCategories(categoriesData)
        setTags(tagsData)
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load blog data',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const onSubmit = async (values: z.infer<typeof blogPostSchema>) => {
    try {
      if (selectedPost) {
        // Update existing post
        const updatedPost = await client.blogPost.update({
          where: { id: selectedPost.id },
          data: {
            title: values.title,
            content: values.content,
            excerpt: values.excerpt,
            image: values.image,
            categoryId: values.categoryId || null,
            published: values.published,
            tags: {
              set: values.tags.map(tagId => ({ id: tagId }))
            }
          },
          include: {
            category: true,
            tags: true
          }
        })

        setPosts(posts.map(post => 
          post.id === updatedPost.id ? updatedPost : post
        ))

        toast({
          title: 'Success',
          description: 'Blog post updated successfully'
        })
      } else {
        // Create new post
        const newPost = await client.blogPost.create({
          data: {
            title: values.title,
            content: values.content,
            excerpt: values.excerpt,
            image: values.image,
            categoryId: values.categoryId || null,
            published: values.published,
            slug: values.title.toLowerCase().replace(/\s+/g, '-'),
            tags: {
              connect: values.tags.map(tagId => ({ id: tagId }))
            }
          },
          include: {
            category: true,
            tags: true
          }
        })

        setPosts([newPost, ...posts])
        toast({
          title: 'Success',
          description: 'Blog post created successfully'
        })
      }

      setIsDialogOpen(false)
      form.reset()
      setSelectedPost(null)
    } catch (error) {
      console.error('Error saving blog post:', error)
      toast({
        title: 'Error',
        description: 'Failed to save blog post',
        variant: 'destructive'
      })
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      await client.blogPost.delete({
        where: { id: postId }
      })

      setPosts(posts.filter(post => post.id !== postId))
      toast({
        title: 'Success',
        description: 'Blog post deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting blog post:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete blog post',
        variant: 'destructive'
      })
    }
  }

  const openEditDialog = (post: BlogPostWithRelations) => {
    setSelectedPost(post)
    form.reset({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || '',
      image: post.image,
      categoryId: post.categoryId || '',
      published: post.published,
      tags: post.tags.map(tag => tag.id)
    })
    setIsDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Blog Posts</h1>
          <p className="text-muted-foreground">Manage your blog posts</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setSelectedPost(null)
              form.reset()
            }}>
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {selectedPost ? 'Edit Post' : 'Create New Post'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excerpt</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="min-h-[200px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">No Category</SelectItem>
                          {categories.map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="published"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Published</FormLabel>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit">
                    {selectedPost ? 'Update Post' : 'Create Post'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map(post => (
                <TableRow key={post.id}>
                  <TableCell>{post.title}</TableCell>
                  <TableCell>
                    {post.category?.name || 'No Category'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={post.published ? 'default' : 'secondary'}>
                      {post.published ? 'Published' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(post)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 