'use client'

import { useState } from 'react'

import ChatContext from './ChatContext'

interface Props {
  children?: React.ReactNode
}

export default function ChatProvider(props: Props) {
  //state
  const { children } = props
  const [chats, setChats] = useState<any>()
  const [activeChat, setActiveChat] = useState<any>()
  const [notifications, setNotifications] = useState<any>()
  const [activeUser, setActiveUser] = useState<any>()
  const [showProfile, setShowProfile] = useState<any>()
  const [showNotifications, setShowNotifications] = useState<any>()

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChat,
        notifications,
        activeUser,
        showProfile,
        showNotifications,
        setChats,
        setActiveChat,
        setNotifications,
        setActiveUser,
        setShowProfile,
        setShowNotifications
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}
