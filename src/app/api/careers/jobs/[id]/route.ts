import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id
    
    // Fetch job from database
    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
      }
    })
    
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ job })
  } catch (error) {
    console.error('Error fetching job:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job' },
      { status: 500 }
    )
  }
}

// PUT method for updating a job
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id
    
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
    
    // Parse job data
    const jobData = await req.json()
    
    // Update job in database
    const job = await prisma.job.update({
      where: {
        id: jobId,
      },
      data: {
        title: jobData.title,
        department: jobData.department,
        location: jobData.location,
        locationType: jobData.locationType,
        type: jobData.type,
        description: jobData.description,
        responsibilities: jobData.responsibilities,
        requirements: jobData.requirements,
        benefits: jobData.benefits,
        isActive: jobData.isActive ?? true,
        updatedAt: new Date(),
      }
    })
    
    return NextResponse.json({ job })
  } catch (error) {
    console.error('Error updating job:', error)
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    )
  }
}

// DELETE method for removing a job
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id
    
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
    
    // Delete job from database
    await prisma.job.delete({
      where: {
        id: jobId,
      }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting job:', error)
    return NextResponse.json(
      { error: 'Failed to delete job' },
      { status: 500 }
    )
  }
} 