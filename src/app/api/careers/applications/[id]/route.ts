import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

// GET a specific application
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const applicationId = params.id
    
    // Fetch application from database
    const application = await prisma.jobApplication.findUnique({
      where: {
        id: applicationId,
      },
      include: {
        job: {
          select: {
            title: true,
          }
        }
      }
    })
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }
    
    // Format the application for response
    const formattedApplication = {
      id: application.id,
      jobId: application.jobId,
      jobTitle: application.job.title,
      firstName: application.firstName,
      lastName: application.lastName,
      email: application.email,
      phone: application.phone || '',
      linkedin: application.linkedin || '',
      resumeUrl: application.resumeUrl,
      coverLetter: application.coverLetter || '',
      status: application.status,
      submittedAt: application.submittedAt.toISOString(),
    }
    
    return NextResponse.json({ application: formattedApplication })
  } catch (error) {
    console.error('Error fetching application:', error)
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    )
  }
}

// PUT to update an application status
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const applicationId = params.id
    const updateData = await req.json()
    
    // Make sure the application exists
    const existingApplication = await prisma.jobApplication.findUnique({
      where: {
        id: applicationId,
      }
    })
    
    if (!existingApplication) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }
    
    // Update the application
    const updatedApplication = await prisma.jobApplication.update({
      where: {
        id: applicationId,
      },
      data: {
        status: updateData.status,
        notes: updateData.notes,
        reviewedAt: new Date(),
      }
    })
    
    return NextResponse.json({ 
      success: true,
      application: updatedApplication 
    })
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    )
  }
}

// DELETE method for removing an application
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const applicationId = params.id
    
    // Make sure the application exists
    const existingApplication = await prisma.jobApplication.findUnique({
      where: {
        id: applicationId,
      }
    })
    
    if (!existingApplication) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }
    
    // Delete the application
    await prisma.jobApplication.delete({
      where: {
        id: applicationId,
      }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting application:', error)
    return NextResponse.json(
      { error: 'Failed to delete application' },
      { status: 500 }
    )
  }
} 