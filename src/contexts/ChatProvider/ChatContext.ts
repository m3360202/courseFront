'use client'

import { createContext } from 'react'

export interface ChatContextInterface {
  chats: any
  activeChat: any
  notifications: any
  activeUser: any
  showProfile: any
  showNotifications: any

  setChats: (chats: any) => void
  setActiveChat: (activeChat: any) => void
  setNotifications: (notifications: any) => void
  setActiveUser: (activeUser: any) => void
  setShowProfile: (showProfile: any) => void
  setShowNotifications: (showNotifications: any) => void
}

const ChatContext = createContext<ChatContextInterface | null>(null)

export default ChatContext
