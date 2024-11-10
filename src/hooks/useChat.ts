import { useContext } from 'react'

import type { ChatContextInterface } from '@/contexts/ChatProvider/ChatContext'
import ChatContext from '@/contexts/ChatProvider/ChatContext'

export const useChat = (): ChatContextInterface => {
  const context = useContext(ChatContext)

  if (!context) {
    throw new Error('content must be used within a SettingsProvider')
  }

  return context
}
