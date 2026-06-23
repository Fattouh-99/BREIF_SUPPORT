import { NextResponse } from 'next/server'
import { createLandingChatCompletion, type LandingChatMessage } from '@/lib/landing-chat'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const messages = body?.messages as LandingChatMessage[] | undefined

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 })
    }

    const sanitized = messages
      .filter((msg) => msg?.content?.trim() && (msg.role === 'user' || msg.role === 'assistant'))
      .slice(-20)
      .map((msg) => ({
        role: msg.role,
        content: msg.content.trim().slice(0, 4000),
      }))

    if (sanitized.length === 0) {
      return NextResponse.json({ error: 'No valid messages provided' }, { status: 400 })
    }

    const response = await createLandingChatCompletion(sanitized)

    return NextResponse.json({ response })
  } catch (error) {
    console.error('[landing-chat] Error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate response',
      },
      { status: 500 }
    )
  }
}
