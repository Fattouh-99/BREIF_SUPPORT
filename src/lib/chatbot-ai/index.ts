import { findBestMatch } from '@/lib/utils'

export type ChatTurn = { role: 'assistant' | 'user'; content: string }

export type BotPersonalityConfig = {
  personality: string
  tone: string
  businessDescription: string
  industry: string
  responseStyle: string
  handoffPreference: string
  shippingEnabled: boolean
  shippingTime: string
  shippingRegions: string[]
  freeShippingThreshold: number | null
  productsEnabled: boolean
}

export type KnowledgeArticle = {
  title: string
  question: string
  answer: string
}

export type KnowledgeProduct = {
  name: string
  price: number
  discountedPrice?: number | null
  hasDiscount?: boolean
  description?: string | null
  productType?: string | null
}

export type KnowledgeContext = {
  faq: KnowledgeArticle[]
  helpdesk: KnowledgeArticle[]
  products: KnowledgeProduct[]
  bookings: { name: string; price: number }[]
}

const NOISE_PATTERNS = [
  /live support mode has been enabled/i,
  /LIVE_SUPPORT_INITIATED/i,
  /monthly usage limit/i,
  /error sending message/i,
  /temporarily unavailable/i,
  /openai connection/i,
  /sorry, there was an error loading/i,
]

export function prepareChatHistory(
  chat: ChatTurn[],
  currentMessage: string,
  maxTurns = 24
): ChatTurn[] {
  const trimmedMessage = currentMessage.trim()

  const filtered = chat
    .filter((turn) => turn.content?.trim())
    .filter((turn) => !NOISE_PATTERNS.some((pattern) => pattern.test(turn.content)))
    .map((turn) => ({
      role: turn.role,
      content: turn.content.trim(),
    }))

  const last = filtered[filtered.length - 1]
  if (last?.role === 'user' && last.content === trimmedMessage) {
    filtered.pop()
  }

  return filtered.slice(-maxTurns)
}

export function buildKnowledgeContext(input: {
  filterQuestions: { question: string; answered: string | null }[]
  helpdesk: {
    title: string
    question: string
    answer: string
    content?: string | null
  }[]
  products: KnowledgeProduct[]
  bookings: { name: string; price: number }[]
}): KnowledgeContext {
  const faq = input.filterQuestions
    .filter((item) => item.answered?.trim())
    .map((item) => ({
      title: item.question,
      question: item.question,
      answer: item.answered!.trim(),
    }))

  const helpdesk = input.helpdesk
    .map((item) => ({
      title: item.title,
      question: item.question || item.title,
      answer: (item.answer || item.content || '').trim(),
    }))
    .filter((item) => item.answer.length > 0)

  return {
    faq,
    helpdesk,
    products: input.products,
    bookings: input.bookings,
  }
}

function formatKnowledgeSection(knowledge: KnowledgeContext): string {
  const sections: string[] = []

  if (knowledge.faq.length > 0) {
    sections.push(
      '### FAQ\n' +
        knowledge.faq
          .slice(0, 15)
          .map((item) => `Q: ${item.question}\nA: ${item.answer}`)
          .join('\n\n')
    )
  }

  if (knowledge.helpdesk.length > 0) {
    sections.push(
      '### Help articles\n' +
        knowledge.helpdesk
          .slice(0, 15)
          .map((item) => `[${item.title}] ${item.answer}`)
          .join('\n\n')
    )
  }

  if (knowledge.products.length > 0) {
    sections.push(
      '### Products\n' +
        knowledge.products
          .map((product) => {
            const price =
              product.hasDiscount && product.discountedPrice != null
                ? `$${product.discountedPrice} (was $${product.price})`
                : `$${product.price}`
            const details = [product.name, price]
            if (product.productType) details.push(`Type: ${product.productType}`)
            if (product.description) details.push(product.description)
            return details.join(' — ')
          })
          .join('\n')
    )
  }

  if (knowledge.bookings.length > 0) {
    sections.push(
      '### Services / bookings\n' +
        knowledge.bookings.map((b) => `${b.name} — $${b.price}`).join('\n')
    )
  }

  return sections.length > 0
    ? sections.join('\n\n')
    : 'No structured knowledge articles are configured yet. Answer from general business context only and avoid guessing specific policies or prices.'
}

export function buildSystemPrompt(
  businessName: string,
  config: BotPersonalityConfig,
  knowledge: KnowledgeContext
): string {
  const shippingBlock = config.shippingEnabled
    ? [
        'Shipping is available.',
        config.shippingTime ? `Typical delivery: ${config.shippingTime}.` : '',
        config.shippingRegions?.length
          ? `Regions: ${config.shippingRegions.join(', ')}.`
          : '',
        config.freeShippingThreshold
          ? `Free shipping from $${config.freeShippingThreshold}.`
          : '',
      ]
        .filter(Boolean)
        .join(' ')
    : 'Shipping is not offered through this chatbot configuration.'

  return `You are the customer support assistant for ${businessName}.

## Identity
- Personality: ${config.personality}
- Tone: ${config.tone}
- Style: ${config.responseStyle}
- Industry: ${config.industry}
- About the business: ${config.businessDescription}

## How to respond
1. Understand the customer's enquiry first. If intent is unclear, ask one focused follow-up question.
2. Answer directly in plain, professional language. Keep replies concise unless the customer asks for detail.
3. Use ONLY facts from the knowledge base below. Never invent prices, policies, features, or availability.
4. If the answer is not in the knowledge base, say you do not have that information and offer helpful next steps.
5. Do not use markdown headings, code blocks, or long bullet lists unless listing products the customer asked for.
6. Do not mention being an AI unless the customer asks.
7. Stay on topic and maintain conversation context.

## Handoff to a human (${config.handoffPreference} threshold)
- Offer live support when: the customer explicitly asks for a person/agent, the issue is account-specific, or you cannot answer after checking the knowledge base.
- Before handoff, you need the customer's email unless they already provided it in the conversation.
- When initiating handoff, put LIVE_SUPPORT_REQUESTED on the first line by itself, then write a brief professional handoff message. This tag is internal and will be removed before the customer sees it.
- Do NOT use LIVE_SUPPORT_REQUESTED for general questions you can answer from the knowledge base.

## Products
${config.productsEnabled ? 'Products are enabled. Mention specific products only when relevant to the customer\'s question or when they ask about products/pricing.' : 'Product sales are disabled. Focus on support and general enquiries.'}

## Shipping
${shippingBlock}

## Knowledge base
${formatKnowledgeSection(knowledge)}`
}

export function tryQuickAnswer(
  message: string,
  knowledge: KnowledgeContext
): string | null {
  const pool = [...knowledge.faq, ...knowledge.helpdesk].filter(
    (item) => item.answer.length > 0
  )

  if (pool.length === 0) return null

  const normalized = message.toLowerCase().trim()

  for (const item of pool) {
    const question = item.question.toLowerCase().trim()
    const title = item.title.toLowerCase().trim()

    if (
      normalized === question ||
      normalized === title ||
      (normalized.length >= 8 &&
        (question.includes(normalized) || normalized.includes(question)))
    ) {
      return item.answer
    }
  }

  const match = findBestMatch(
    message,
    pool.map((item) => ({ question: item.question, answer: item.answer }))
  )

  if (!match?.answer) return null

  return match.answer
}

export function isExplicitProductCatalogRequest(message: string): boolean {
  return (
    /\b(show|list|see|view|browse)\s+(me\s+)?(your\s+)?(products?|catalog|items?|inventory)\b/i.test(
      message
    ) ||
    /\bwhat\s+(products?|items?)\s+do\s+you\s+(sell|offer|have|carry)\b/i.test(message) ||
    /\b(product|price)\s+(list|catalog)\b/i.test(message) ||
    /\bdo\s+you\s+sell\b/i.test(message)
  )
}

export function isExplicitLiveSupportRequest(message: string): boolean {
  return (
    /\b(speak|talk)\s+(to|with)\s+(a\s+)?(human|person|agent|someone|representative|real\s+person)\b/i.test(
      message
    ) ||
    /\b(live\s+support|human\s+support|real\s+person)\b/i.test(message) ||
    /\b(connect|transfer)\s+me\s+(to|with)\s+(support|an?\s+agent|a\s+person)\b/i.test(message) ||
    /\b(i\s+need\s+(to\s+speak\s+to|an?\s+agent|a\s+human))\b/i.test(message) ||
    /\bescalate\b/i.test(message)
  )
}

export function shouldInitiateLiveSupport(
  message: string,
  assistantContent: string | null | undefined,
  chat: ChatTurn[],
  customerEmail?: string
): boolean {
  if (assistantContent?.includes('LIVE_SUPPORT_REQUESTED')) {
    return true
  }

  if (isExplicitLiveSupportRequest(message)) {
    return true
  }

  const isFollowUpEmailResponse =
    !!customerEmail &&
    chat.length >= 2 &&
    chat[chat.length - 2]?.role === 'assistant' &&
    chat[chat.length - 2]?.content?.includes("I'll need your email address")

  return isFollowUpEmailResponse
}

export function sanitizeAssistantResponse(content: string): string {
  return content
    .replace(/^LIVE_SUPPORT_REQUESTED\s*\n?/i, '')
    .replace(/^LIVE_SUPPORT_INITIATED\s*\n?/i, '')
    .replace(/\nLIVE_SUPPORT_REQUESTED\s*\n?/gi, '\n')
    .trim()
}

export function getCompletionOptions() {
  const model = process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini'
  const isReasoningModel = /^gpt-5|^o[134]/.test(model)

  if (isReasoningModel) {
    return {
      max_tokens: 900,
    }
  }

  return {
    temperature: 0.5,
    max_tokens: 900,
    presence_penalty: 0.1,
    frequency_penalty: 0.1,
  }
}
