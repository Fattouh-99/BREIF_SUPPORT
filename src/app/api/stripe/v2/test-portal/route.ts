import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

// GET - Test customer portal configuration (development only)
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true, stripeId: true, email: true }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Collect environment and request info
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const userAgent = request.headers.get('user-agent')

    const envInfo = {
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'NOT_SET',
      NODE_ENV: process.env.NODE_ENV,
      STRIPE_SECRET: process.env.STRIPE_SECRET ? 'SET' : 'NOT_SET',
      NEXT_PUBLIC_STRIPE_PUBLISH_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISH_KEY ? 'SET' : 'NOT_SET',
    }

    const requestInfo = {
      origin,
      host,
      protocol,
      userAgent: userAgent?.substring(0, 100) + '...' || 'unknown',
      timestamp: new Date().toISOString()
    }

    const userInfo = {
      hasStripeId: !!dbUser.stripeId,
      stripeId: dbUser.stripeId || 'NOT_SET',
      email: dbUser.email
    }

    // Construct what the return URL would be
    let baseUrl: string
    if (origin) {
      baseUrl = origin
    } else if (host) {
      baseUrl = `${protocol}://${host}`
    } else if (process.env.NEXT_PUBLIC_APP_URL) {
      baseUrl = process.env.NEXT_PUBLIC_APP_URL
    } else {
      baseUrl = 'http://localhost:3000'
    }

    const returnUrl = `${baseUrl.replace(/\/$/, '')}/billing`

    return NextResponse.json({
      success: true,
      data: {
        environment: envInfo,
        request: requestInfo,
        user: userInfo,
        calculatedReturnUrl: returnUrl,
        recommendations: [
          !dbUser.stripeId && 'User needs to subscribe to a plan first to get a Stripe customer ID',
          !process.env.NEXT_PUBLIC_APP_URL && 'Set NEXT_PUBLIC_APP_URL in your .env.local file',
          !origin && !host && 'Request missing origin and host headers',
        ].filter(Boolean)
      }
    })
  } catch (error) {
    console.error('Error in portal test:', error)
    return NextResponse.json(
      { 
        error: 'Test failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 