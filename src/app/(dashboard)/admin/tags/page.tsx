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
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { client } from '@/lib/prisma'

const tagSchema = z.object({
  name: z.string().min(1, 'Name is required'),
})

export default function AdminTagsPage() {
  const [tags, setTags] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTag, setSelectedTag] = useState<any | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  
  const form = useForm<z.infer<typeof tagSchema>>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: ''
    }
  })

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tagsData = await client.tag.findMany({
          orderBy: {
            name: 'asc'
          }
        })
        setTags(tagsData)
      } catch (error) {
        console.error('Error fetching tags:', error)
        toast({
          title: 'Error',
          description: 'Failed to load tags',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTags()
  }, [toast])

  const onSubmit = async (values: z.infer<typeof tagSchema>) => {
    try {
      if (selectedTag) {
        // Update existing tag
        const updatedTag = await client.tag.update({
          where: { id: selectedTag.id },
          data: {
            name: values.name,
            slug: values.name.toLowerCase().replace(/\s+/g, '-')
          }
        })

        setTags(tags.map(tag => 
          tag.id === updatedTag.id ? updatedTag : tag
        ))

        toast({
          title: 'Success',
          description: 'Tag updated successfully'
        })
      } else {
        // Create new tag
        const newTag = await client.tag.create({
          data: {
            name: values.name,
            slug: values.name.toLowerCase().replace(/\s+/g, '-')
          }
        })

        setTags([...tags, newTag])
        toast({
          title: 'Success',
          description: 'Tag created successfully'
        })
      }

      setIsDialogOpen(false)
      form.reset()
      setSelectedTag(null)
    } catch (error) {
      console.error('Error saving tag:', error)
      toast({
        title: 'Error',
        description: 'Failed to save tag',
        variant: 'destructive'
      })
    }
  }

  const handleDelete = async (tagId: string) => {
    if (!confirm('Are you sure you want to delete this tag?')) return

    try {
      await client.tag.delete({
        where: { id: tagId }
      })

      setTags(tags.filter(tag => tag.id !== tagId))
      toast({
        title: 'Success',
        description: 'Tag deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting tag:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete tag',
        variant: 'destructive'
      })
    }
  }

  const openEditDialog = (tag: any) => {
    setSelectedTag(tag)
    form.reset({
      name: tag.name
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
          <h1 className="text-3xl font-bold">Tags</h1>
          <p className="text-muted-foreground">Manage your blog tags</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setSelectedTag(null)
              form.reset()
            }}>
              <Plus className="w-4 h-4 mr-2" />
              New Tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedTag ? 'Edit Tag' : 'Create New Tag'}
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

                <DialogFooter>
                  <Button type="submit">
                    {selectedTag ? 'Update Tag' : 'Create Tag'}
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
                <TableHead>Slug</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tags.map(tag => (
                <TableRow key={tag.id}>
                  <TableCell>{tag.name}</TableCell>
                  <TableCell>{tag.slug}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(tag)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(tag.id)}
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