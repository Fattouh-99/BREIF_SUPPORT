'use client'

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useToast } from '@/components/ui/use-toast'
import { PlusCircle, Pencil, Trash2, MoreHorizontal, Eye, Check, X, AlertCircle, Users } from 'lucide-react'
import { format } from 'date-fns'

// Form schema for job creation and editing
const jobSchema = z.object({
  title: z.string().min(1, "Title is required"),
  department: z.string().min(1, "Department is required"),
  location: z.string().min(1, "Location is required"),
  locationType: z.string().min(1, "Location type is required"),
  type: z.string().min(1, "Job type is required"),
  description: z.string().min(1, "Description is required"),
  responsibilities: z.string().min(1, "Responsibilities are required"),
  requirements: z.string().min(1, "Requirements are required"),
  benefits: z.string().min(1, "Benefits are required"),
  isActive: z.boolean().default(true),
})

interface Job {
  id: string
  title: string
  department: string
  location: string
  locationType: string
  type: string
  description: string
  responsibilities: string[]
  requirements: string[]
  benefits: string[]
  isActive: boolean
  postedDate: string
  updatedAt: string
}

export default function JobsManagementPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const { toast } = useToast()
  
  const form = useForm<z.infer<typeof jobSchema>>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      department: "",
      location: "",
      locationType: "remote",
      type: "full-time",
      description: "",
      responsibilities: "",
      requirements: "",
      benefits: "",
      isActive: true,
    }
  })
  
  // Fetch jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/careers/jobs')
        if (!response.ok) {
          throw new Error('Failed to fetch jobs')
        }
        
        const data = await response.json()
        setJobs(data.jobs || [])
      } catch (error) {
        console.error('Error fetching jobs:', error)
        toast({
          title: 'Error',
          description: 'Failed to load jobs',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchJobs()
  }, [toast])
  
  // Open edit dialog with job data
  const openEditDialog = (job: Job) => {
    setSelectedJob(job)
    // Responsibilities, requirements, and benefits are stored as arrays in the database
    // but we need them as strings with line breaks for the form
    form.reset({
      title: job.title,
      department: job.department,
      location: job.location,
      locationType: job.locationType,
      type: job.type,
      description: job.description,
      responsibilities: job.responsibilities.join('\n'),
      requirements: job.requirements.join('\n'),
      benefits: job.benefits.join('\n'),
      isActive: job.isActive,
    })
    setIsEditDialogOpen(true)
  }
  
  // Open delete confirmation dialog
  const openDeleteDialog = (job: Job) => {
    setSelectedJob(job)
    setIsDeleteDialogOpen(true)
  }
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy')
  }
  
  // Handler for creating a new job
  const handleCreateJob = async (values: z.infer<typeof jobSchema>) => {
    try {
      // Convert multiline strings to arrays
      const jobData = {
        ...values,
        responsibilities: values.responsibilities.split('\n').filter(line => line.trim() !== ''),
        requirements: values.requirements.split('\n').filter(line => line.trim() !== ''),
        benefits: values.benefits.split('\n').filter(line => line.trim() !== ''),
      }
      
      const response = await fetch('/api/careers/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create job')
      }
      
      const data = await response.json()
      
      // Add the new job to the jobs list
      setJobs([data.job, ...jobs])
      
      // Close the dialog and show success message
      setIsCreateDialogOpen(false)
      form.reset()
      
      toast({
        title: 'Success',
        description: 'Job listing created successfully',
      })
    } catch (error) {
      console.error('Error creating job:', error)
      toast({
        title: 'Error',
        description: 'Failed to create job listing',
        variant: 'destructive',
      })
    }
  }
  
  // Handler for updating a job
  const handleUpdateJob = async (values: z.infer<typeof jobSchema>) => {
    if (!selectedJob) return
    
    try {
      // Convert multiline strings to arrays
      const jobData = {
        ...values,
        responsibilities: values.responsibilities.split('\n').filter(line => line.trim() !== ''),
        requirements: values.requirements.split('\n').filter(line => line.trim() !== ''),
        benefits: values.benefits.split('\n').filter(line => line.trim() !== ''),
      }
      
      const response = await fetch(`/api/careers/jobs/${selectedJob.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update job')
      }
      
      const data = await response.json()
      
      // Update the job in the jobs list
      setJobs(jobs.map(job => job.id === selectedJob.id ? data.job : job))
      
      // Close the dialog and show success message
      setIsEditDialogOpen(false)
      
      toast({
        title: 'Success',
        description: 'Job listing updated successfully',
      })
    } catch (error) {
      console.error('Error updating job:', error)
      toast({
        title: 'Error',
        description: 'Failed to update job listing',
        variant: 'destructive',
      })
    }
  }
  
  // Handler for deleting a job
  const handleDeleteJob = async () => {
    if (!selectedJob) return
    
    try {
      const response = await fetch(`/api/careers/jobs/${selectedJob.id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete job')
      }
      
      // Remove the job from the jobs list
      setJobs(jobs.filter(job => job.id !== selectedJob.id))
      
      // Close the dialog and show success message
      setIsDeleteDialogOpen(false)
      
      toast({
        title: 'Success',
        description: 'Job listing deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting job:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete job listing',
        variant: 'destructive',
      })
    }
  }
  
  // Toggle job active status
  const toggleJobStatus = async (job: Job) => {
    try {
      const newStatus = !job.isActive;
      
      const response = await fetch(`/api/careers/jobs/${job.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...job,
          isActive: newStatus,
          responsibilities: job.responsibilities,
          requirements: job.requirements,
          benefits: job.benefits,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${newStatus ? 'activate' : 'close'} job position`);
      }
      
      const { job: updatedJob } = await response.json();
      
      // Update the job in the jobs list
      setJobs(jobs.map(j => j.id === job.id ? updatedJob : j));
      
      toast({
        title: 'Success',
        description: `Job position ${newStatus ? 'activated' : 'closed'} successfully`,
      });
    } catch (error) {
      console.error('Error toggling job status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update job status',
        variant: 'destructive',
      });
    }
  };
  
  // Navigate to applications page filtered for this job
  const viewJobApplicants = (job: Job) => {
    // Navigate to the applications page with job filter in query params
    window.location.href = `/admin/applications?jobId=${job.id}`;
  };
  
  // Open create dialog with fresh form
  const openCreateDialog = () => {
    form.reset({
      title: "",
      department: "",
      location: "",
      locationType: "remote",
      type: "full-time",
      description: "",
      responsibilities: "",
      requirements: "",
      benefits: "",
      isActive: true,
    })
    setIsCreateDialogOpen(true)
  }
  
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Job Listings</h1>
        <Button onClick={openCreateDialog} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Create Job
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Job Listings</CardTitle>
          <CardDescription>
            View, create, edit, and delete job listings for your careers page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-12 bg-gray-200 rounded-md mb-4"></div>
                </div>
              ))}
            </div>
          ) : jobs.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map(job => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">
                        {job.title}
                        <div className="text-sm text-muted-foreground">
                          Posted {formatDate(job.postedDate)}
                        </div>
                      </TableCell>
                      <TableCell>{job.department}</TableCell>
                      <TableCell>
                        <div>{job.location}</div>
                        <Badge className={`mt-1 
                          ${job.locationType === 'remote' ? 'bg-blue-100 text-blue-800' : 
                          job.locationType === 'office' ? 'bg-purple-100 text-purple-800' : 
                          'bg-green-100 text-green-800'}`}
                        >
                          {job.locationType}
                        </Badge>
                      </TableCell>
                      <TableCell>{job.type}</TableCell>
                      <TableCell>
                        {job.isActive ? (
                          <Badge className="bg-green-100 text-green-800 flex items-center gap-1 w-fit">
                            <Check className="h-3 w-3" /> Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="flex items-center gap-1 w-fit">
                            <X className="h-3 w-3" /> Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => window.open(`/careers/${job.id}`, '_blank')}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Job
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(job)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => viewJobApplicants(job)}>
                              <Users className="h-4 w-4 mr-2" />
                              View Applicants
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleJobStatus(job)}>
                              {job.isActive ? (
                                <>
                                  <X className="h-4 w-4 mr-2" />
                                  Close Position
                                </>
                              ) : (
                                <>
                                  <Check className="h-4 w-4 mr-2" />
                                  Activate Position
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => openDeleteDialog(job)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <h3 className="font-semibold text-xl mb-2">No job listings found</h3>
              <p className="text-muted-foreground mb-6">Create your first job listing to get started.</p>
              <Button onClick={openCreateDialog}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Job
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Create Job Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Job Listing</DialogTitle>
            <DialogDescription>
              Add a new job listing to your careers page.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateJob)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title*</FormLabel>
                      <FormControl>
                        <Input placeholder="Frontend Developer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department*</FormLabel>
                      <FormControl>
                        <Input placeholder="Engineering" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location*</FormLabel>
                      <FormControl>
                        <Input placeholder="San Francisco, CA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="locationType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location Type*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="remote">Remote</SelectItem>
                            <SelectItem value="office">Office</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Type*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="full-time">Full-time</SelectItem>
                            <SelectItem value="part-time">Part-time</SelectItem>
                            <SelectItem value="contract">Contract</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description*</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the job role and responsibilities"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="responsibilities"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-1">
                      <FormLabel>Responsibilities*</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="One responsibility per line"
                          className="min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Enter each responsibility on a new line.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-1">
                      <FormLabel>Requirements*</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="One requirement per line"
                          className="min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Enter each requirement on a new line.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="benefits"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-1">
                      <FormLabel>Benefits*</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="One benefit per line"
                          className="min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Enter each benefit on a new line.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        If checked, this job will be visible on the careers page.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Job</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Job Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Job Listing</DialogTitle>
            <DialogDescription>
              Update details for this job listing.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateJob)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title*</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department*</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location*</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="locationType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location Type*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="remote">Remote</SelectItem>
                            <SelectItem value="office">Office</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Type*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="full-time">Full-time</SelectItem>
                            <SelectItem value="part-time">Part-time</SelectItem>
                            <SelectItem value="contract">Contract</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description*</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="responsibilities"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-1">
                      <FormLabel>Responsibilities*</FormLabel>
                      <FormControl>
                        <Textarea
                          className="min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Enter each responsibility on a new line.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-1">
                      <FormLabel>Requirements*</FormLabel>
                      <FormControl>
                        <Textarea
                          className="min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Enter each requirement on a new line.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="benefits"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-1">
                      <FormLabel>Benefits*</FormLabel>
                      <FormControl>
                        <Textarea
                          className="min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Enter each benefit on a new line.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        If checked, this job will be visible on the careers page.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Job</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Delete Job Listing
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this job listing? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedJob && (
            <div className="border rounded-md p-4 bg-gray-50 mb-4">
              <h4 className="font-semibold">{selectedJob.title}</h4>
              <p className="text-sm text-muted-foreground">{selectedJob.department} • {selectedJob.location}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteJob}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 