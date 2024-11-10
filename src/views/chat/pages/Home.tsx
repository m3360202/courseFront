import React, { useState } from 'react'
import { useEffect } from 'react'
import { searchUsers } from '@/api//chat/auth'
import Chat from './Chat'
import Profile from '../Profile'
import { acessCreate, fetchAllChats } from '@/api/chat/chat'

import { getSender } from '@/utils/logics'
import Group from '../Group'
import Contacts from '../Contacts'
import Search from '../group/Search'
import { Card } from '@mui/material'
import { useUser } from '@/hooks/useGlobal'
import { useChat } from '@/hooks/useChat'
import { UserTable } from '@/types/user/UserTable'
import delay from '@/utils/delay'

function ChatHome() {
  const {
    notifications,
    activeUser,
    showProfile,
    showNotifications,
    setChats,
    setActiveChat,
    setActiveUser,
    setShowNotifications,
    setNotifications
  } = useChat()
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState('')
  const currentUser = useUser()

  const handleSearch = async (e: any) => {
    setSearch(e.target.value)
  }
  const handleClick = async (e: any) => {
    await acessCreate(currentUser as UserTable, { userId: e._id })
    delay(async () => {
      const data = await fetchAllChats(currentUser as UserTable)
      setChats(data)
    }, 500)

    setSearch('')
  }
  useEffect(() => {
    const searchChange = async () => {
      if (currentUser) {
        setIsLoading(true)
        const userId = currentUser?._id ?? ''
        const data = (await searchUsers(currentUser, search, userId)) as any
        setSearchResults(data)
        setIsLoading(false)
      }
    }
    searchChange()
  }, [search, currentUser])

  useEffect(() => {
    if (currentUser) {
      const user = {
        id: currentUser?._id,
        email: currentUser?.email,
        profilePic: currentUser?.userImg,
        bio: currentUser?.bio,
        name: currentUser?.nickName || currentUser?.username
      }
      setActiveUser(user)
    }
  }, [currentUser])

  return (
    <Card>
      <div className='bg-[#282C35!] scrollbar-hide z-10 h-[100vh]  lg:w-[100%] lg:mx-auto overflow-y-hidden shadow-2xl'>
        <div className='flex'>
          {!showProfile ? (
            <div className='md:flex md:flex-col min-w-[360px] h-[100vh] md:h-[98.6vh] bg-[#ffff] relative'>
              <div className='h-[61px] px-4'>
                <div className='flex'>
                  <a className='flex items-center relative  -top-4 block h-[90px]' href='/'>
                    <h3 className='text-[20px] text-[#1f2228] font-body font-extrabold tracking-wider'>Messages</h3>
                  </a>
                </div>
                <div className='absolute top-4 right-5 flex items-center gap-x-3'>
                  <button onClick={() => setShowNotifications(!showNotifications)}>
                    <i className='ri-notification-badge-line'></i>
                    {/* <NotificationBadge
                      count={notifications.length}
                      effect={Effect.SCALE}
                      style={{ width: '15px', height: '15px', fontSize: '9px', padding: '4px 2px 2px 2px' }}
                    /> */}
                    {showNotifications ? (
                      // <RiNotificationBadgeFill style={{ width: '25px', height: '25px', color: '#319268' }} />
                      <></>
                    ) : (
                      // <BiNotification style={{ color: '#319268', width: '25px', height: '25px' }} />
                      <></>
                    )}
                  </button>
                  <div
                    className={`${
                      showNotifications
                        ? 'overflow-y-scroll scrollbar-hide tracking-wide absolute top-10 -left-32 z-10 w-[240px] bg-[#fafafa] px-4 py-2 shadow-2xl'
                        : 'hidden'
                    }`}
                  >
                    <div className='text-[13px]'>{!notifications?.length && 'No new messages'}</div>
                    {notifications?.map((e: any, index: number) => {
                      return (
                        <div
                          onClick={() => {
                            setActiveChat(e.chatId)
                            setNotifications(notifications?.filter((data: any) => data !== e))
                          }}
                          key={index}
                          className='text-[12.5px] text-black px-2 cursor-pointer'
                        >
                          {e.chatId.isGroup
                            ? `New Message in ${e.chatId.chatName}`
                            : `New Message from ${getSender(activeUser, e.chatId.users)}`}
                        </div>
                      )
                    })}
                  </div>
                  {/* <button onClick={() => dispatch(setShowProfile(true))} className='flex items-center gap-x-1 relative'>
                    <img className='w-[28px] h-[28px] rounded-[25px]' src={activeUser?.profilePic} alt='' />
                    <IoIosArrowDown style={{ color: '#616c76', height: '14px', width: '14px' }} />
                  </button> */}
                </div>
              </div>

              <div>
                <div className='-mt-6 relative pt-6 px-4'>
                  <form onSubmit={e => e.preventDefault()}>
                    <input
                      onChange={handleSearch}
                      className='w-[99.5%] bg-[#f6f6f6] text-[#111b21] tracking-wider pl-9 py-[8px] rounded-[9px] outline-0'
                      type='text'
                      name='search'
                      placeholder='Search'
                    />
                  </form>

                  <div className='absolute top-[28px] left-[27px]'>
                    {/* <BsSearch style={{ color: '#c4c4c5' }} /> */}
                    <i className='ri-search-line w-5 h-5' style={{ color: '#c4c4c5' }}></i>
                  </div>
                  <Group />

                  <div
                    style={{ display: search ? '' : 'none' }}
                    className='h-[100vh] absolute z-10 w-[100%] left-[0px] top-[70px] bg-[#fff] flex flex-col gap-y-3 pt-3 px-4'
                  >
                    <Search
                      searchResults={searchResults}
                      isLoading={isLoading}
                      handleClick={handleClick}
                      search={search}
                    />
                  </div>
                </div>

                <Contacts />
              </div>
            </div>
          ) : (
            <Profile className='min-w-[100%] sm:min-w-[360px] h-[100vh] bg-[#fafafa] shodow-xl relative' />
          )}
          <Chat className='chat-page relative lg:w-[100%] h-[100vh] bg-[#fafafa]' />
        </div>
      </div>
    </Card>
  )
}

export default ChatHome
