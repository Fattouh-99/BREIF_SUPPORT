import React from 'react'
import Bubble from './bubble'
import { Responding } from './responding'

type Props = {
  messages: {
    role: 'assistant' | 'user'
    content: string
    link?: string
    createdAt?: string | Date
    teamMemberId?: string
    teamMemberName?: string
  }[]
  isTyping: boolean
  agent?: {
    name: string
    role?: string
  }
  containerRef: React.RefObject<HTMLDivElement>
  theme?: string
  textColor?: string
  themeColor?: string
  bubbleBackground?: string
  productsEnabled?: boolean
}

const RealTimeMode = ({ 
  messages = [], 
  isTyping, 
  agent, 
  containerRef,
  theme,
  textColor,
  themeColor,
  bubbleBackground,
  productsEnabled = true
}: Props) => {
  return (
    <div className="flex flex-col h-full">
      <div 
        className="flex-1 flex flex-col gap-4 overflow-y-auto px-4 pb-4"
        ref={containerRef}
        style={{ background: theme || '#ffffff' }}
      >
        {(messages || []).map((message, index) => (
          <Bubble
            key={index}
            message={{
              ...message,
              teamMemberId: message.teamMemberId || (message.role === 'assistant' && agent ? agent.name : undefined),
              teamMemberName: message.teamMemberName || (message.role === 'assistant' && agent ? agent.name : undefined),
            }}
            themeColor={themeColor}
            textColor={textColor}
            bubbleBackground={bubbleBackground}
            typingAgent={agent}
            productsEnabled={productsEnabled}
          />
        ))}
        {isTyping && (
          <div className="self-start flex items-end gap-3">
            <Responding />
          </div>
        )}
      </div>
    </div>
  )
}

export default RealTimeMode
