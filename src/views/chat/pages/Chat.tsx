import React, { useState } from 'react'
import Model from '../Model'
import { fetchMessages, sendMessage } from '@/api/chat/messages'
import { useEffect } from 'react'
import MessageHistory from '../MessageHistory'
import io from 'socket.io-client'
import Loading from '../ui/Loading'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { getChatName } from '@/utils/logics'
import Typing from '../ui/Typing'
import { BASE_URL } from '@/types'
import { Avatar } from '@mui/material'
import { getInitialColor } from '@/utils/getInitials'
import { useChat } from '@/hooks/useChat'
import { useUser } from '@/hooks/useGlobal'
import { UserTable } from '@/types/user/UserTable'
import { fetchAllChats } from '@/api/chat/chat'

const ENDPOINT = process.env.NEXT_PUBLIC_WS_SERVER_URL as string
let socket: any, selectedChatCompare: any

function Chat(props: any) {
  const { activeChat, notifications, activeUser, setChats, setNotifications } = useChat()
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<any>([])
  const [socketConnected, setSocketConnected] = useState(false)
  const [typing, setTyping] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const currentUser = useUser()

  const keyDownFunction = async (e: any) => {
    if ((e.key === 'Enter' || e.type === 'click') && message) {
      setMessage('')
      socket.emit('stop typing', activeChat._id)
      const data = await sendMessage(currentUser as UserTable, { chatId: activeChat._id, message })
      socket.emit('new message', data)
      setMessages([...messages, data])
      const chats = await fetchAllChats(currentUser as UserTable)
      setChats(chats)
    }
  }

  useEffect(() => {
    socket = io(ENDPOINT)
    socket.on('typing', () => setIsTyping(true))
    socket.on('stop typing', () => setIsTyping(false))
  }, [])

  useEffect(() => {
    socket.emit('setup', activeUser)
    socket.on('connected', () => {
      setSocketConnected(true)
    })
  }, [messages, activeUser])
  useEffect(() => {
    const fetchMessagesFunc = async () => {
      if (activeChat && currentUser) {
        setLoading(true)
        const data = await fetchMessages(currentUser, activeChat._id)
        setMessages(data)
        socket.emit('join room', activeChat._id)
        setLoading(false)
      }
    }
    fetchMessagesFunc()
    selectedChatCompare = activeChat
  }, [activeChat, currentUser])

  useEffect(() => {
    socket.on('message recieved', async (newMessageRecieved: any) => {
      if ((!selectedChatCompare || selectedChatCompare._id) !== newMessageRecieved.chatId._id) {
        if (!notifications.includes(newMessageRecieved)) {
          setNotifications([newMessageRecieved, ...notifications])
        }
      } else {
        setMessages([...messages, newMessageRecieved])
      }
      const chats = await fetchAllChats(currentUser as UserTable)
      setChats(chats)
    })
  })

  if (loading) {
    return (
      <div className={props.className}>
        <Loading />
      </div>
    )
  }

  return (
    <>
      {activeChat ? (
        <div className={props.className}>
          <div className='flex justify-between items-center px-5 bg-[#ffff] w-[100%]'>
            <div className='flex items-center gap-x-[10px]'>
              <div className='flex flex-col items-start justify-center'>
                <h5 className='text-[17px] text-[#2b2e33] font-bold tracking-wide'>
                  {getChatName(activeChat, activeUser)}
                </h5>
                {/* <p className='text-[11px] text-[#aabac8]'>Last seen 5 min ago</p> */}
              </div>
            </div>
            <div>
              <Model />
            </div>
          </div>
          <div className='scrollbar-hide w-[100%] h-[70vh] md:h-[66vh] lg:h-[69vh] flex flex-col overflow-y-auto p-4'>
            <MessageHistory messages={messages} />
            <div className='ml-7 -mb-10'>{isTyping ? <Typing width='100' height='100' /> : ''}</div>
          </div>
          <div className='absolute left-[31%] bottom-[8%]'>
            {showPicker && <Picker data={data} onEmojiSelect={(e: any) => setMessage(message + e.native)} />}
            <div className='border-[1px] border-[#aabac8] px-6 py-3 w-[360px] sm:w-[400px] md:w-[350px] h-[50px] lg:w-[400px] rounded-t-[10px]'>
              <form onKeyDown={e => keyDownFunction(e)} onSubmit={e => e.preventDefault()}>
                <input
                  onChange={e => {
                    setMessage(e.target.value)
                    if (!socketConnected) return
                    if (!typing) {
                      setTyping(true)
                      socket.emit('typing', activeChat._id)
                    }
                    const lastTime = new Date().getTime()
                    const time = 3000
                    setTimeout(() => {
                      const timeNow = new Date().getTime()
                      const timeDiff = timeNow - lastTime
                      if (timeDiff >= time && typing) {
                        socket.emit('stop typing', activeChat._id)
                        setTyping(false)
                      }
                    }, time)
                  }}
                  className='focus:outline-0 w-[100%] bg-[#f8f9fa]'
                  type='text'
                  name='message'
                  placeholder='Enter message'
                  value={message}
                />
              </form>
            </div>

            <div className='border-x-[1px] border-b-[1px] bg-[#f8f9fa] border-[#aabac8] px-6 py-3 w-[360px] sm:w-[400px] md:w-[350px] lg:w-[400px] rounded-b-[10px] h-[50px]'>
              {/* {
                  isTyping ? <div>Loading</div> : ""
                } */}
              <div className='flex justify-between items-start'>
                <div className='cursor-pointer' onClick={() => setShowPicker(!showPicker)}>
                  {showPicker ? (
                    <i className='ri-emotion-happy-line  text-[#ffb02e]' />
                  ) : (
                    <i className='ri-emotion-happy-line ' />
                  )}
                </div>
                <button
                  onClick={e => keyDownFunction(e)}
                  className='bg-[#f8f9fa] border-[2px] border-[#d4d4d4] text-[14px] px-2 py-[3px] text-[#9e9e9e] font-medium rounded-[7px] -mt-1 cursor-pointer'
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={props.className}>
          <div className='relative'>
            <div className='absolute top-[40vh] left-[44%] flex flex-col items-center justify-center gap-y-3'>
              {/* <img
                className='w-[50px] h-[50px] rounded-[25px]'
                alt='User profile'
                src={BASE_URL + activeUser.profilePic}
              /> */}
              <Avatar
                alt={activeUser?.name}
                src={BASE_URL + activeUser?.profilePic}
                sx={{ background: getInitialColor(activeUser?.name) }}
              />
              <h3 className='text-[#111b21] text-[20px] font-medium tracking-wider'>
                Welcome <span className='text-[#166e48] text-[19px] font-bold'> {activeUser?.name}</span>
              </h3>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Chat
