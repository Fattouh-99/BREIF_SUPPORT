'use client'

import { useEffect } from 'react'
import { getChatbotBaseUrl } from '@/lib/chatbot-base-url'

interface ChatbotEmbedProps {
  botId: string
  baseUrl?: string
}

/**
 * Drop-in React embed component for customer websites.
 * Mount once in your app root (e.g. layout or App.tsx).
 */
export function ChatbotEmbed({
  botId,
  baseUrl = getChatbotBaseUrl(),
}: ChatbotEmbedProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if ((window as Window & { chatbotInitialized?: boolean }).chatbotInitialized) return
    ;(window as Window & { chatbotInitialized?: boolean }).chatbotInitialized = true

    const CHATBOT_DOMAIN_ID = botId
    const CHATBOT_BASE_URL = baseUrl.replace(/\/$/, '')

    const iframe = document.createElement('iframe')
    iframe.src = `${CHATBOT_BASE_URL}/chatbot`
    iframe.id = 'chatbot-iframe'
    iframe.title = 'Brief Support Chat'
    iframe.setAttribute('allow', 'clipboard-write')
    iframe.style.cssText = [
      'position: fixed',
      'bottom: 20px',
      'right: 20px',
      'width: 80px',
      'height: 80px',
      'border: none',
      'border-radius: 50%',
      'z-index: 999998',
      'background: transparent',
      'pointer-events: none',
      'opacity: 0',
      'transition: width 0.3s ease, height 0.3s ease, opacity 0.3s ease, border-radius 0.3s ease',
    ].join(';')

    const isAllowedOrigin = (origin: string) => {
      if (!origin) return false
      try {
        const eventHost = new URL(origin).hostname.replace(/^www\./, '')
        const baseHost = new URL(CHATBOT_BASE_URL).hostname.replace(/^www\./, '')
        if (eventHost === baseHost) return true
        if (eventHost === 'localhost' || eventHost === '127.0.0.1') return true
        return false
      } catch {
        return false
      }
    }

    const sendBotId = () => {
      if (!iframe.contentWindow) return
      try {
        iframe.contentWindow.postMessage(CHATBOT_DOMAIN_ID, '*')
      } catch {
        console.warn('Could not send bot ID to chatbot iframe')
      }
    }

    const applyIframeSize = (width: number, height: number, isOpen: boolean) => {
      iframe.style.opacity = '1'
      iframe.style.pointerEvents = 'auto'

      const isMobile = window.innerWidth < 768

      if (isMobile && isOpen) {
        iframe.style.top = '0'
        iframe.style.left = '0'
        iframe.style.bottom = '0'
        iframe.style.right = '0'
        iframe.style.width = '100%'
        iframe.style.height = '100%'
        iframe.style.borderRadius = '0'
        return
      }

      iframe.style.top = 'auto'
      iframe.style.left = 'auto'
      iframe.style.bottom = '20px'
      iframe.style.right = '20px'
      iframe.style.width = `${width}px`
      iframe.style.height = `${height}px`
      iframe.style.borderRadius = isOpen ? '12px' : '50%'
    }

    const handleMessage = (e: MessageEvent) => {
      if (!isAllowedOrigin(e.origin)) return

      if (e.data === 'GET_BOT_ID') {
        sendBotId()
        return
      }

      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data
        if (data?.width && data?.height) {
          applyIframeSize(data.width, data.height, !!data.open)
        }
      } catch {
        // Ignore non-JSON messages
      }
    }

    window.addEventListener('message', handleMessage)

    iframe.onload = () => {
      sendBotId()
      setTimeout(sendBotId, 250)
      setTimeout(sendBotId, 1000)
    }

    document.body.appendChild(iframe)

    return () => {
      window.removeEventListener('message', handleMessage)
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe)
      ;(window as Window & { chatbotInitialized?: boolean }).chatbotInitialized = false
    }
  }, [botId, baseUrl])

  return null
}

export default ChatbotEmbed
