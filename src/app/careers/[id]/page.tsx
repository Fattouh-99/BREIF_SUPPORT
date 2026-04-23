'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Download, UploadCloud, Briefcase, MapPin, Clock, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { UploadClient } from '@uploadcare/upload-client'
import { LandingNavbar } from '@/components/navbar/landing-navbar'
import { ParallaxBackground } from '@/components/motion/parallax-scroll'
import Footer from '@/components/footer'

// Type definition for job
interface Job {
  id: string
  title: string
  department: string
  location: string
  locationType: string
  type: string
  postedDate: string
  description: string
  responsibilities: string[]
  requirements: string[]
  benefits: string[]
  isActive: boolean
}
// FIX: Error uploading to Uploadcare: UploadError: Uploading of these file types is not allowed.

// Initialize Uploadcare client
const uploadClient = new UploadClient({
  publicKey: process.env.NEXT_PUBLIC_UPLOAD_CARE_PUBLIC_KEY as string
})

// API function to submit application
const submitApplication = async (formData: FormData): Promise<{ success: boolean, id?: string }> => {
  try {
    const response = await fetch('/api/careers/applications', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error submitting application:', error);
    return { success: false };
  }
};

export default function JobApplicationPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    linkedin: '',
    resumeFile: null as File | null,
    coverLetter: '',
  })
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [applicationId, setApplicationId] = useState<string | null>(null)

  // Fetch job data
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/careers/jobs/${params.id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            // Job not found, keep job as null
            return
          }
          throw new Error('Failed to fetch job')
        }
        
        const data = await response.json()
        // Only set the job if it's active
        if (data.job && data.job.isActive) {
          setJob(data.job)
        } else {
          // If job is inactive, treat it as not found
          setJob(null)
        }
      } catch (error) {
        console.error('Error fetching job:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchJob()
  }, [params.id])

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date)
  }

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]
      
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a PDF or Word document (DOC/DOCX)')
        e.target.value = '' // Reset input
        return
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        e.target.value = '' // Reset input
        return
      }
      
      setFormState({
        ...formState,
        resumeFile: file,
      })
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!job) return
    setIsSubmitting(true)
    
    try {
      const formData = new FormData()
      formData.append('firstName', formState.firstName)
      formData.append('lastName', formState.lastName)
      formData.append('email', formState.email)
      formData.append('phone', formState.phone || '')
      formData.append('linkedin', formState.linkedin || '')
      formData.append('coverLetter', formState.coverLetter || '')
      formData.append('jobId', job.id)
      
      if (formState.resumeFile) {
        try {
          // Upload using the Uploadcare client
          const file = await uploadClient.uploadFile(formState.resumeFile)
          
          if (!file || !file.uuid) {
            throw new Error('Failed to upload resume')
          }
          
          // Add the Uploadcare file UUID to the application form data
          formData.append('resume', file.uuid)
        } catch (uploadError: any) {
          console.error('Error uploading to Uploadcare:', uploadError)
          throw new Error(uploadError?.message || 'Failed to upload resume')
        }
      }
      
      // Submit application to the server
      const response = await fetch('/api/careers/applications', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit application')
      }
      
      const result = await response.json()
      
      if (result.success) {
        setApplicationId(result.id || null)
        setFormSubmitted(true)
      } else {
        throw new Error(result.error || 'Failed to submit application')
      }
    } catch (error) {
      console.error('Error submitting application:', error)
      alert(error instanceof Error ? error.message : 'There was an error submitting your application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="relative min-h-screen bg-gradient-to-b from-background via-background to-background/80 overflow-hidden">
        <ParallaxBackground />
        <LandingNavbar />
        <div className="container mx-auto py-32 px-4 text-center">
          <div className="animate-pulse">
            <div className="h-10 bg-muted rounded w-1/3 mx-auto mb-6"></div>
            <div className="h-6 bg-muted rounded w-1/2 mx-auto"></div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (!job) {
    return (
      <main className="relative min-h-screen bg-gradient-to-b from-background via-background to-background/80 overflow-hidden">
        <ParallaxBackground />
        <LandingNavbar />
        <div className="container mx-auto py-32 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Job not found</h1>
          <p className="mb-8 text-muted-foreground">The job posting you're looking for doesn't exist or has been removed.</p>
          <Link href="/careers">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Careers
            </Button>
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  if (formSubmitted) {
    return (
      <main className="relative min-h-screen bg-gradient-to-b from-background via-background to-background/80 overflow-hidden">
        <ParallaxBackground />
        <LandingNavbar />
        <div className="container mx-auto py-32 px-4 text-center max-w-2xl">
          <div className="bg-card p-8 rounded-xl border border-border/50">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Application Submitted!</h1>
            <p className="text-muted-foreground mb-6">
              Thank you for your interest in the {job.title} position. We've received your application 
              and will review it shortly. If your qualifications match our needs, we'll contact you for 
              next steps.
            </p>
            {applicationId && (
              <p className="text-muted-foreground mb-6">
                Your application reference number is: <span className="font-medium">{applicationId}</span>
              </p>
            )}
            <Link href="/careers">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Careers
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-background via-background to-background/80 overflow-hidden">
      <ParallaxBackground />
      <LandingNavbar />
      
      {/* Header */}
      <section className="relative pt-32 pb-10 overflow-hidden">
        <div className="container mx-auto px-4">
          <Link href="/careers" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Careers
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold">{job.title}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-4 text-muted-foreground">
            <span className="flex items-center gap-1">
              <Briefcase className="h-5 w-5" />
              {job.department}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-5 w-5" />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-5 w-5" />
              {job.type.replace('-', ' ')}
            </span>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Posted on {formatDate(job.postedDate)}
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="py-12 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Job details */}
            <div className="lg:col-span-5">
              <div className="bg-card rounded-xl shadow-sm p-8 border border-border/50 sticky top-8">
                <h2 className="text-2xl font-bold mb-6">Job Details</h2>
                
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Description</h3>
                    <p>{job.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Responsibilities</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      {job.responsibilities.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      {job.requirements.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Benefits</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      {job.benefits.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Application form */}
            <div className="lg:col-span-7">
              <div className="bg-card rounded-xl shadow-sm p-8 border border-border/50">
                <h2 className="text-2xl font-bold mb-6">Apply for this Position</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input 
                        id="firstName" 
                        value={formState.firstName}
                        onChange={(e) => setFormState({...formState, firstName: e.target.value})}
                        required
                        placeholder="Enter your first name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input 
                        id="lastName" 
                        value={formState.lastName}
                        onChange={(e) => setFormState({...formState, lastName: e.target.value})}
                        required
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input 
                        id="email" 
                        type="email"
                        value={formState.email}
                        onChange={(e) => setFormState({...formState, email: e.target.value})}
                        required
                        placeholder="Enter your email address"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input 
                        id="phone" 
                        type="tel"
                        value={formState.phone}
                        onChange={(e) => setFormState({...formState, phone: e.target.value})}
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn Profile</Label>
                    <Input 
                      id="linkedin" 
                      value={formState.linkedin}
                      onChange={(e) => setFormState({...formState, linkedin: e.target.value})}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="resume">Resume/CV *</Label>
                    <div className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center cursor-pointer hover:bg-muted/20 transition-colors" onClick={() => document.getElementById('resume')?.click()}>
                      <UploadCloud className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-1">
                        {formState.resumeFile ? formState.resumeFile.name : 'Drag and drop your resume, or click to browse'}
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        Supports PDF, DOC, DOCX up to 5MB
                      </p>
                      <input 
                        id="resume" 
                        type="file" 
                        className="hidden" 
                        accept=".pdf,.doc,.docx" 
                        onChange={handleFileChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="coverLetter">Cover Letter</Label>
                    <Textarea 
                      id="coverLetter" 
                      rows={6}
                      value={formState.coverLetter}
                      onChange={(e) => setFormState({...formState, coverLetter: e.target.value})}
                      placeholder="Tell us why you're interested in this position and why you'd be a great fit..."
                    />
                  </div>
                  
                  <Separator />
                  
                  <Button type="submit" size="lg" className="w-full md:w-auto bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
} 