import { Bot, Star, User, Zap, MessageCircle, Sparkles } from 'lucide-react'

/**
 * Mapping of bot types to their respective icons
 */
export const botIconMapping = {
  default: Bot,
  assistant: Bot,
  ai: Sparkles,
  support: MessageCircle,
  chat: MessageCircle,
  user: User,
  star: Star,
  premium: Zap
}

export type BotIconType = keyof typeof botIconMapping

/**
 * Get the icon component for a specific bot type
 * @param type The type of bot icon to retrieve
 * @returns The icon component
 */
export function getBotIcon(type: string = 'default') {
  const iconType = (type as BotIconType) in botIconMapping 
    ? (type as BotIconType) 
    : 'default'
  
  return botIconMapping[iconType]
} 