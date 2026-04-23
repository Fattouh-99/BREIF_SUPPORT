import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { CheckoutService } from '@/lib/stripe/checkout'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

// POST - Create customer portal session
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true, stripeId: true }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!dbUser.stripeId) {
      return NextResponse.json(
        { error: 'No billing account found. Please subscribe to a plan first.' },
        { status: 400 }
      )
    }

    // Construct return URL more reliably
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    
    // Determine the base URL more reliably
    let baseUrl: string
    if (origin) {
      baseUrl = origin
    } else if (host) {
      baseUrl = `${protocol}://${host}`
    } else if (process.env.NEXT_PUBLIC_APP_URL) {
      baseUrl = process.env.NEXT_PUBLIC_APP_URL
    } else {
      // Fallback for local development
      baseUrl = 'http://localhost:3000'
    }

    // Ensure no trailing slash and construct return URL
    baseUrl = baseUrl.replace(/\/$/, '')
    const returnUrl = `${baseUrl}/billing`

    console.log('Customer portal return URL:', returnUrl)
    console.log('Customer Stripe ID:', dbUser.stripeId)

    const portalSession = await CheckoutService.createCustomerPortalSession(
      dbUser.id,
      returnUrl
    )

    return NextResponse.json({
      success: true,
      data: {
        portalUrl: portalSession.sessionUrl
      }
    })
  } catch (error) {
    console.error('Error creating customer portal session:', error)
    
    let errorMessage = 'Failed to create portal session'
    let statusCode = 500
    
    if (error instanceof Error) {
      if (error.message.includes('Customer portal is not configured')) {
        errorMessage = 'Customer portal is not configured. Please set up your customer portal configuration in your Stripe dashboard.'
        statusCode = 400
      } else if (error.message.includes('No billing account found')) {
        errorMessage = 'No billing account found. Please subscribe to a plan first.'
        statusCode = 400
      } else {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    )
  }
} 