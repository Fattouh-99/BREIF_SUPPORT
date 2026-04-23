import { NextResponse } from 'next/server'
import { PLANS, formatPrice } from '@/lib/stripe/config'

export const runtime = 'nodejs'

// GET - Get all available plans
export async function GET() {
  try {
    // Transform plans for frontend consumption
    const transformedPlans = Object.entries(PLANS).map(([key, plan]) => ({
      id: key,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      priceFormatted: formatPrice(plan.price),
      interval: plan.interval,
      features: plan.features,
      credits: plan.credits,
      maxDomains: plan.maxDomains,
      maxContacts: plan.maxContacts,
      maxEmailsPerMonth: plan.maxEmailsPerMonth,
      isFree: plan.price === 0,
      isPopular: key === 'PRO', // Mark Pro as popular
      priceId: plan.priceId
    }))

    return NextResponse.json({
      success: true,
      data: {
        plans: transformedPlans
      }
    })
  } catch (error) {
    console.error('Error getting plans:', error)
    return NextResponse.json(
      { error: 'Failed to get plans' },
      { status: 500 }
    )
  }
} 