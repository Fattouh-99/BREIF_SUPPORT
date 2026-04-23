import { BotIconType } from '@/icons/bot-icons'

export type ChatBot = {
  id: string
  icon: string | null
  welcomeMessage: string | null
  background: string | null
  textColor: string | null
  iconColor: string | null
  iconStyle: BotIconType | null
  helpdesk: boolean
}

export type FilterQuestion = {
  id: string
  question: string
  answered: string | null
  domainId: string | null
}

export type Domain = {
  id: string
  name: string
  icon: string
  userId: string | null
  chatBot: ChatBot | null
  filterQuestions: FilterQuestion[]
} 