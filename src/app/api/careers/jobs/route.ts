import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

// GET all jobs with optional filtering
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const active = url.searchParams.get('active')
    const department = url.searchParams.get('department')
    const locationType = url.searchParams.get('locationType')
    const type = url.searchParams.get('type')
    
    // Build filters
    const filters: any = {}
    
    if (active === 'true') {
      filters.isActive = true
    } else if (active === 'false') {
      filters.isActive = false
    }
    
    if (department) {
      filters.department = department
    }
    
    if (locationType) {
      filters.locationType = locationType
    }
    
    if (type) {
      filters.type = type
    }
    
    // Get jobs from database
    const jobs = await prisma.job.findMany({
      where: filters,
      orderBy: {
        postedDate: 'desc'
      }
    })
    
    return NextResponse.json({ jobs })
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}

// POST to create a new job
export async function POST(req: NextRequest) {
  try {
    // Check user authentication and permissions using Clerk instead of Next Auth
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
    
    // Create job in database
    const job = await prisma.job.create({
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
        createdById: dbUser.id,
      }
    })
    
    return NextResponse.json({ job })
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    )
  }
} 