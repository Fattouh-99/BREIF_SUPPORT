'use client'

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserRole } from '@prisma/client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from '@/components/ui/use-toast'
import { 
  getAllUsers, 
  updateUserRole, 
  checkAdminAccess, 
  getAllCustomerFeedback,
  getAllNewsletterSubscribers
} from '@/actions/admin'
import { 
  Loader2, 
  Settings, 
  ShieldAlert, 
  Users, 
  Briefcase, 
  Clock, 
  Database, 
  FileText, 
  Home, 
  FolderOpen, 
  Tag, 
  ClipboardList,
  BarChart,
  MessageSquare,
  Mail
} from 'lucide-react'
import { SystemSettings } from '@/components/admin/system-settings'
import { UserAnalytics } from '@/components/admin/user-analytics'
import MaintenanceControls from '@/components/admin/maintenance-controls'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Form schema for updating user roles
const updateUserSchema = z.object({
  userId: z.string(),
  role: z.nativeEnum(UserRole)
})

type AdminCardProps = {
  title: string
  description: string
  href: string
  icon: React.ReactNode
}

const AdminCard = ({ title, description, href, icon }: AdminCardProps) => (
  <Link href={href} className="block transition hover:-translate-y-1">
    <Card className="h-full border-2 hover:border-primary-300 hover:shadow-md transition">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  </Link>
)

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([])
  const [feedback, setFeedback] = useState<any[]>([])
  const [subscribers, setSubscribers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  
  const form = useForm<z.infer<typeof updateUserSchema>>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      userId: '',
      role: UserRole.MEMBER
    }
  })

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Use the server action instead of direct currentUser() call
        const result = await checkAdminAccess()
        
        if (!result.authorized) {
          toast({
            title: 'Unauthorized',
            description: result.error || 'You do not have permission to access the admin dashboard',
            variant: 'destructive'
          })
          router.push('/conversation')
          return
        }
        
        // Set users from the result
        setUsers(result.users || [])
        
        // Fetch customer feedback
        try {
          const feedbackData = await getAllCustomerFeedback()
          setFeedback(feedbackData || [])
        } catch (error) {
          console.error('Failed to fetch customer feedback:', error)
        }
        
        // Fetch newsletter subscribers
        try {
          const subscribersData = await getAllNewsletterSubscribers()
          setSubscribers(subscribersData || [])
        } catch (error) {
          console.error('Failed to fetch newsletter subscribers:', error)
        }
      } catch (error) {
        console.error('Failed to check access or fetch users:', error)
        toast({
          title: 'Error',
          description: 'Failed to load admin dashboard',
          variant: 'destructive'
        })
        router.push('/conversation')
      } finally {
        setLoading(false)
      }
    }
    
    checkAccess()
  }, [router, toast])

  const openEditDialog = (user: any) => {
    setSelectedUser(user)
    form.reset({
      userId: user.id,
      role: user.role
    })
    setIsDialogOpen(true)
  }

  const onSubmit = async (values: z.infer<typeof updateUserSchema>) => {
    try {
      await updateUserRole(values.userId, values.role)
      
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === values.userId ? { ...user, role: values.role } : user
        )
      )
      
      toast({
        title: 'Success',
        description: `User role updated to ${values.role}`,
      })
      
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Failed to update user role:', error)
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive'
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <Tabs defaultValue="analytics">
        <TabsList>
          <TabsTrigger value="analytics" className="flex items-center gap-1">
            <BarChart className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            System Settings
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            Customer Feedback
          </TabsTrigger>
          <TabsTrigger value="newsletter" className="flex items-center gap-1">
            <Mail className="h-4 w-4" />
            Newsletter
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="analytics" className="space-y-6 pt-4">
          <UserAnalytics />
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6 pt-4">
          <MaintenanceControls />
          <SystemSettings />
        </TabsContent>
        
        <TabsContent value="users" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-500" />
                <CardTitle>User Management</CardTitle>
              </div>
              <CardDescription>
                Manage user roles and permissions across the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>{user.fullname}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'SUPER_ADMIN' ? 'destructive' : 'outline'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(user)}>
                          Edit Role
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="feedback" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-indigo-500" />
                <CardTitle>Customer Feedback</CardTitle>
              </div>
              <CardDescription>
                View and manage customer feedback and feature requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Feature Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedback.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                        No feedback submissions yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    feedback.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.email}</TableCell>
                        <TableCell>{item.featureType}</TableCell>
                        <TableCell className="max-w-[300px] truncate">{item.description}</TableCell>
                        <TableCell>
                          <Badge variant={
                            item.status === 'NEW' ? 'default' :
                            item.status === 'REVIEWED' ? 'secondary' :
                            item.status === 'IMPLEMENTED' ? 'secondary' : 'outline'
                          }>
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="newsletter" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-indigo-500" />
                <CardTitle>Newsletter Subscribers</CardTitle>
              </div>
              <CardDescription>
                Manage newsletter subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Subscribed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                        No newsletter subscribers yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    subscribers.map((subscriber) => (
                      <TableRow key={subscriber.id}>
                        <TableCell>{subscriber.email}</TableCell>
                        <TableCell>
                          <Badge variant={subscriber.status === 'ACTIVE' ? 'default' : 'outline'}>
                            {subscriber.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(subscriber.subscribedAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <p><strong>User:</strong> {selectedUser.fullname}</p>
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                </div>
                
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SUPER_ADMIN">
                            Super Admin
                          </SelectItem>
                          <SelectItem value="ADMIN">
                            Admin
                          </SelectItem>
                          <SelectItem value="OWNER">
                            Owner
                          </SelectItem>
                          <SelectItem value="MEMBER">
                            Member
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose the appropriate role for this user.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit">Save Changes</Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 