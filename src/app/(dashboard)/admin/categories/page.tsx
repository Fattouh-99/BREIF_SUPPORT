'use client'

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { client } from '@/lib/prisma'

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
})

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  
  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: ''
    }
  })

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await client.category.findMany({
          orderBy: {
            name: 'asc'
          }
        })
        setCategories(categoriesData)
      } catch (error) {
        console.error('Error fetching categories:', error)
        toast({
          title: 'Error',
          description: 'Failed to load categories',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [toast])

  const onSubmit = async (values: z.infer<typeof categorySchema>) => {
    try {
      if (selectedCategory) {
        // Update existing category
        const updatedCategory = await client.category.update({
          where: { id: selectedCategory.id },
          data: {
            name: values.name,
            description: values.description,
            slug: values.name.toLowerCase().replace(/\s+/g, '-')
          }
        })

        setCategories(categories.map(category => 
          category.id === updatedCategory.id ? updatedCategory : category
        ))

        toast({
          title: 'Success',
          description: 'Category updated successfully'
        })
      } else {
        // Create new category
        const newCategory = await client.category.create({
          data: {
            name: values.name,
            description: values.description,
            slug: values.name.toLowerCase().replace(/\s+/g, '-')
          }
        })

        setCategories([...categories, newCategory])
        toast({
          title: 'Success',
          description: 'Category created successfully'
        })
      }

      setIsDialogOpen(false)
      form.reset()
      setSelectedCategory(null)
    } catch (error) {
      console.error('Error saving category:', error)
      toast({
        title: 'Error',
        description: 'Failed to save category',
        variant: 'destructive'
      })
    }
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      await client.category.delete({
        where: { id: categoryId }
      })

      setCategories(categories.filter(category => category.id !== categoryId))
      toast({
        title: 'Success',
        description: 'Category deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting category:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete category',
        variant: 'destructive'
      })
    }
  }

  const openEditDialog = (category: any) => {
    setSelectedCategory(category)
    form.reset({
      name: category.name,
      description: category.description || ''
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
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">Manage your blog categories</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setSelectedCategory(null)
              form.reset()
            }}>
              <Plus className="w-4 h-4 mr-2" />
              New Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedCategory ? 'Edit Category' : 'Create New Category'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit">
                    {selectedCategory ? 'Update Category' : 'Create Category'}
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
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map(category => (
                <TableRow key={category.id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.description || '-'}</TableCell>
                  <TableCell>{category.slug}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(category)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
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