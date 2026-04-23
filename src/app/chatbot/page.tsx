'use client'

import dynamic from 'next/dynamic'

const ChatBot = dynamic(() => import('@/components/chatbot'), { ssr: false })

export default function ChatbotPage() {
  return <ChatBot isPublic={true} />
}
