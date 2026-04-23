import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/config'

export const runtime = 'nodejs'

// GET - Check if customer portal is configured
export async function GET(request: NextRequest) {
  try {
    // Try to list portal configurations to see if any exist
    const configurations = await stripe.billingPortal.configurations.list({
      limit: 1
    })

    const isConfigured = configurations.data.length > 0

    return NextResponse.json({
      success: true,
      data: {
        isConfigured,
        message: isConfigured 
          ? 'Customer portal is properly configured' 
          : 'Customer portal configuration is missing',
        setupUrl: 'https://dashboard.stripe.com/test/settings/billing/portal'
      }
    })
  } catch (error) {
    console.error('Error checking portal configuration:', error)
    return NextResponse.json(
      { 
        error: 'Failed to check portal configuration',
        setupUrl: 'https://dashboard.stripe.com/test/settings/billing/portal'
      },
      { status: 500 }
    )
  }
} 