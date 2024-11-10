import React, { useState } from 'react'
import { useEffect } from 'react'
import { getChatName, getChatPhoto, timeSince } from '../../utils/logics'
import NoContacts from './ui/NoContacts'
import { Avatar, Button, Grid, Menu } from '@mui/material'
import { fetchAllChats, removeChat } from '@/api/chat/chat'
import { error, success } from '@/utils/toasts'
import { useChat } from '@/hooks/useChat'
import { useUser } from '@/hooks/useGlobal'
import { UserTable } from '@/types/user/UserTable'

const aDay = 24 * 60 * 60 * 1000
function Contacts() {
  const { chats, activeChat, activeUser, setChats, setActiveChat } = useChat()
  const [mouseMove, setMouseMove] = useState<any>()
  const [chatId, setChatId] = useState<any>()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const currentUser = useUser()
  const rowOptionsOpen = Boolean(anchorEl)
  const handleRowOptionsClick = (event: any, id: any) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
    setChatId(id)
  }
  const handleRowOptionsClose = (e?: any) => {
    setAnchorEl(null)
    setChatId(null)
    e?.stopPropagation()
  }

  const fetchChats = async () => {
    if (currentUser) {
      const data = await fetchAllChats(currentUser)
      setChats(data)
    }
  }
  useEffect(() => {
    fetchChats()
  }, [currentUser])

  const removeContact = async () => {
    try {
      await removeChat(currentUser as UserTable, { chatId })
      await fetchChats()
      success('Contact deleted!')
    } catch {
      error('Delete error')
    } finally {
      handleRowOptionsClose()
    }
  }

  return (
    <>
      <div className='flex flex-col -space-y-1 overflow-y-auto scrollbar-hide h-[87vh] pb-10'>
        {chats?.length > 0 ? (
          chats?.map((e: any) => {
            return (
              <div
                onClick={() => {
                  setActiveChat(e)
                }}
                onMouseMove={() => {
                  setMouseMove({ chatId: e._id })
                }}
                onMouseOut={() => {
                  setMouseMove(null)
                }}
                key={e._id}
                className={`flex items-center justify-between sm:gap-x-1 md:gap-x-1 mt-5 ${
                  //@ts-ignore
                  activeChat?._id === e._id ? 'bg-[#fafafa]' : 'bg-[#fff]'
                } cursor-pointer  py-4 px-2`}
              >
                <div className='flex items-center gap-x-3 sm:gap-x-1 md:gap-x-3'>
                  {/* <img
                    className='w-12 h-12  sm:w-12 sm:h-12 rounded-[30px] shadow-lg object-cover'
                    src={getChatPhoto(e, activeUser)}
                    alt=''
                  /> */}
                  <Avatar src={getChatPhoto(e, activeUser)} />
                  <div>
                    <h5 className='text-[13.6px] sm:text-[16px] text-[#2b2e33] font-bold'>
                      {getChatName(e, activeUser)}
                    </h5>
                    <p className='text-[13.6px] sm:text-[13.5px] font-medium text-[#56585c] '>
                      {' '}
                      {e.latestMessage?.message.length > 30
                        ? e.latestMessage?.message.slice(0, 30) + '...'
                        : e.latestMessage?.message}
                    </p>
                  </div>
                </div>
                {mouseMove?.chatId === e._id ? (
                  <div
                    onClick={ee => {
                      handleRowOptionsClick(ee, e._id)
                    }}
                    style={{ color: 'red' }}
                  >
                    Delete
                  </div>
                ) : (
                  <div className='flex flex-col items-end gap-y-[8px]'>
                    <p className='text-[12.4px] sm:text-[12px]  font-normal text-[#b0b2b3] tracking-wide'>
                      {timeSince(new Date(Date.parse(e.updatedAt) - aDay))}
                    </p>
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <NoContacts />
        )}
      </div>
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 35, horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        open={rowOptionsOpen}
        onClose={handleRowOptionsClose}
      >
        <Grid container spacing={2} width={240}>
          <Grid item xs={12} textAlign={'center'}>
            <Button onClick={handleRowOptionsClose}>Cancel</Button> <Button onClick={removeContact}>OK</Button>
          </Grid>
        </Grid>
      </Menu>
    </>
  )
}

export default Contacts
