import React from 'react'
import ChatWindowWrapper from '@/components/conversations/dynamic-chat-window'
// import ChatSidebar from '@/components/conversations/chat-sidebar'

// Force client component rendering 
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function Conversation({ params }: { params: { roomId?: string[] } }) {
  const roomId = params.roomId?.[0]
  
  console.log('[Conversation Page] Loading with roomId:', roomId);
  
  // Pass the chat room ID to the window component
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        <ChatWindowWrapper />
      </div>
    </div>
  )
} 