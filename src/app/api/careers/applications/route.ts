import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // Parse form data from request
    const formData = await req.formData()
    
    // Get form fields
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const linkedin = formData.get('linkedin') as string
    const coverLetter = formData.get('coverLetter') as string
    const jobId = formData.get('jobId') as string
    const resumeUrl = formData.get('resume') as string // This is now the UUID from client-side upload
    
    // Validate required fields
    if (!firstName || !lastName || !email || !jobId || !resumeUrl) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Create application in database
    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        firstName,
        lastName,
        email,
        phone,
        linkedin,
        coverLetter,
        resumeUrl,
        status: 'new',
      },
    })
    
    // Return success response
    return NextResponse.json({
      success: true,
      id: application.id
    })
  } catch (error) {
    console.error('Error processing application:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process application' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    // Check user authentication and permissions
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Check if user has admin role
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id }
    })
    
    if (!dbUser || !['ADMIN', 'SUPER_ADMIN'].includes(dbUser.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      )
    }
    
    // Get query parameters for filtering
    const url = new URL(req.url)
    const status = url.searchParams.get('status')
    const jobId = url.searchParams.get('jobId')
    
    // Build query filters
    const filters: any = {}
    
    if (status) {
      filters.status = status
    }
    
    if (jobId) {
      filters.jobId = jobId
    }
    
    // Get applications from database with filtering
    const applications = await prisma.jobApplication.findMany({
      where: filters,
      include: {
        job: {
          select: {
            title: true,
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    })
    
    // Transform data to match the expected format in the UI
    const formattedApplications = applications.map((app: any) => ({
      id: app.id,
      jobId: app.jobId,
      jobTitle: app.job.title,
      firstName: app.firstName,
      lastName: app.lastName,
      email: app.email,
      phone: app.phone || '',
      linkedin: app.linkedin || '',
      resumeUrl: app.resumeUrl,
      coverLetter: app.coverLetter || '',
      status: app.status,
      submittedAt: app.submittedAt.toISOString(),
    }))
    
    return NextResponse.json({
      applications: formattedApplications
    })
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
} 