import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's billing info with chat usage
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: {
        subscription: true
      }
    })

    if (!dbUser?.subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
    }

    const subscription = dbUser.subscription as any
    const planKey = (subscription.plan || 'STANDARD').toUpperCase()
    const requestLimit = planKey === 'PRO' ? 1000 : 100

    return NextResponse.json({
      plan: subscription.plan,
      requestsUsed: subscription.chatRequests ?? 0,
      requestLimit,
      requestsRemaining: requestLimit - (subscription.chatRequests ?? 0),
      lastReset: subscription.lastChatReset,
      isAtLimit: (subscription.chatRequests ?? 0) >= requestLimit
    })
  } catch (error) {
    console.error('Error fetching chat usage:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat usage' },
      { status: 500 }
    )
  }
} 