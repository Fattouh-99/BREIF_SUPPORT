const LOCAL_CHATBOT_URL = 'http://localhost:3000'

export function getChatbotBaseUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '')

  if (process.env.NODE_ENV === 'development') {
    return configuredUrl?.includes('localhost') || configuredUrl?.includes('127.0.0.1')
      ? configuredUrl
      : LOCAL_CHATBOT_URL
  }

  return configuredUrl || 'https://www.briefsupport.com'
}

export function isLocalChatbotUrl(baseUrl: string): boolean {
  try {
    const hostname = new URL(baseUrl).hostname
    return hostname === 'localhost' || hostname === '127.0.0.1'
  } catch {
    return baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')
  }
}
