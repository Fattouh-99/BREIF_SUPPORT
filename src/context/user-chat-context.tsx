'use client'

import React, { 
  useState, 
  createContext, 
  useContext, 
  useRef, 
  useCallback, 
  useMemo 
} from 'react'

type ChatInitialValuesProps = {
  chatRoom: string | undefined
  setChatRoom: React.Dispatch<React.SetStateAction<string | undefined>>
  chats: {
    message: string
    id: string
    role: 'assistant' | 'user' | null
    createdAt: Date
    seen: boolean
  }[]
  setChats: React.Dispatch<
    React.SetStateAction<
      {
        message: string
        id: string
        role: 'assistant' | 'user' | null
        createdAt: Date
        seen: boolean
      }[]
    >
  >
  loading: boolean
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
  realtime: boolean
  setRealtime: React.Dispatch<React.SetStateAction<boolean>>
}

const ChatInitialValues: ChatInitialValuesProps = {
  chatRoom: undefined,
  setChatRoom: () => undefined,
  chats: [],
  setChats: () => undefined,
  loading: false,
  setLoading: () => undefined,
  realtime: false,
  setRealtime: () => undefined,
}

const chatContext = createContext(ChatInitialValues)
const { Provider } = chatContext

export const ChatProvider = React.memo(({ children }: { children: React.ReactNode }) => {
  const [chats, setChats] = useState(ChatInitialValues.chats)
  const [loading, setLoading] = useState(ChatInitialValues.loading)
  const [chatRoom, setChatRoom] = useState(ChatInitialValues.chatRoom)
  const [realtime, setRealtime] = useState(ChatInitialValues.realtime)

  // Memoize setters to prevent unnecessary re-renders
  const memoizedSetChats = useCallback(setChats, [])
  const memoizedSetLoading = useCallback(setLoading, [])
  const memoizedSetChatRoom = useCallback(setChatRoom, [])
  const memoizedSetRealtime = useCallback(setRealtime, [])

  // Memoize the context value to prevent unnecessary re-renders
  const values = useMemo(() => ({
    chats,
    setChats: memoizedSetChats,
    loading,
    setLoading: memoizedSetLoading,
    chatRoom,
    setChatRoom: memoizedSetChatRoom,
    realtime,
    setRealtime: memoizedSetRealtime,
  }), [
    chats,
    loading,
    chatRoom,
    realtime,
    memoizedSetChats,
    memoizedSetLoading,
    memoizedSetChatRoom,
    memoizedSetRealtime
  ])

  return <Provider value={values}>{children}</Provider>
})

ChatProvider.displayName = 'ChatProvider'

export const useChatContext = () => {
  const state = useContext(chatContext)
  if (!state) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return state
}
