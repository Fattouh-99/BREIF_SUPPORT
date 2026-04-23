'use client'

import dynamic from 'next/dynamic'

const ChatBot = dynamic(() => import('@/components/chatbot'), { ssr: false })

export default function ChatbotTestPage() {
  return <ChatBot isPublic={true} />
} 