'use client'

import ChatProvider from '@/contexts/ChatProvider/ChatProvider'
import ChatHome from '@/views/chat/pages/Home'

const ChatApp = () => (
  <ChatProvider>
    <ChatHome />
  </ChatProvider>
)

export default ChatApp
