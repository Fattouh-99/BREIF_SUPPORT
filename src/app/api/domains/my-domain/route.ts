import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // First get the user's database ID
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get the user's domain (specifically looking for BriefSupport.com domain)
    const domain = await prisma.domain.findFirst({
      where: {
        userId: dbUser.id,
        name: {
          contains: 'BriefSupport.com',
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        name: true,
        icon: true
      }
    })

    if (!domain) {
      // If no BriefSupport.com domain found, get the first domain
      const firstDomain = await prisma.domain.findFirst({
        where: {
          userId: dbUser.id
        },
        select: {
          id: true,
          name: true,
          icon: true
        }
      })

      if (!firstDomain) {
        return NextResponse.json({ error: 'No domain found' }, { status: 404 })
      }

      return NextResponse.json(firstDomain)
    }

    return NextResponse.json(domain)
  } catch (error) {
    console.error('Error fetching domain:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 