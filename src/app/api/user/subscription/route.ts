import { clerkClient } from '@clerk/nextjs'
import { getAuth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

// Explicitly set the runtime to nodejs
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // Get the authenticated user
    const { userId } = getAuth(req)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }
    
    // Parse the request body
    const body = await req.json()
    const { planType, subscriptionStart } = body
    
    if (!planType) {
      return NextResponse.json(
        { error: 'Plan type is required' }, 
        { status: 400 }
      )
    }
    
    // Update user metadata to include subscription information
    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        hasActiveSubscription: true,
        subscriptionPlan: planType,
        subscriptionStart: subscriptionStart || new Date().toISOString()
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Subscription updated successfully'
    })
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription' }, 
      { status: 500 }
    )
  }
} 