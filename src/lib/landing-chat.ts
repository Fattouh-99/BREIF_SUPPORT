export type LandingChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

const LANDING_SYSTEM_PROMPT = `You are the Brief Support website assistant on the marketing landing page.

About Brief Support:
- AI-powered customer support chatbot platform for businesses
- Helps companies automate support, capture leads, and hand off to live agents
- Ideal for e-commerce, SaaS, and service businesses

Plans (high level):
- Free: basic AI chatbot, limited monthly conversations
- Standard: more conversations, branding, email support, knowledge base
- Pro/Business: higher limits, analytics, priority support, API access
- Enterprise: custom pricing

Key features:
- Embeddable AI chatbot for any website
- Live agent handoff
- Helpdesk / knowledge base
- Conversation inbox for teams
- Customizable widget appearance

Guidelines:
1. Answer clearly and professionally in 2-4 short paragraphs unless listing plans.
2. Help visitors understand the product, pricing, getting started, and embedding the chatbot.
3. Do not invent specific prices beyond the plan tiers above unless the user asks; then explain they can see full pricing on the site or sign up free.
4. For account-specific or billing issues, suggest signing in or contacting support.
5. Do not mention internal system codes or that you are running on a specific AI model.
6. If unsure, say so and offer to help with features, pricing, or getting started.
7. Encourage signup at /auth/sign-up for a free trial when relevant.`

function getOpenAIModel() {
  return process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini'
}

function usesMaxCompletionTokens(model: string) {
  return /^gpt-5|^o[134]/.test(model)
}

export async function createLandingChatCompletion(messages: LandingChatMessage[]) {
  const apiKey = process.env.OPEN_AI_KEY?.trim()
  if (!apiKey) {
    throw new Error('OPEN_AI_KEY is not configured')
  }

  const model = getOpenAIModel()
  const body: Record<string, unknown> = {
    model,
    messages: [{ role: 'system', content: LANDING_SYSTEM_PROMPT }, ...messages],
  }

  if (usesMaxCompletionTokens(model)) {
    body.max_completion_tokens = 700
  } else {
    body.max_tokens = 700
    body.temperature = 0.5
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data?.error?.message || 'OpenAI API request failed')
  }

  return data.choices?.[0]?.message?.content?.trim() || ''
}
