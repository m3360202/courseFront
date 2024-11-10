import React from 'react'
// import ScrollableFeed from 'react-scrollable-feed'
import { isSameSender, isSameSenderMargin, isSameUser, isLastMessage } from '@/utils/logics'
import { Avatar, Typography } from '@mui/material'
import { BASE_URL } from '@/types'
import { getInitialColor } from '@/utils/getInitials'
import { useChat } from '@/hooks/useChat'
import PerfectScrollbar from 'react-perfect-scrollbar'

function MessageHistory({ messages }: { messages: any }) {
  const { activeUser } = useChat()

  return (
    <>
      {/* <ScrollableFeed className='scrollbar-hide'> */}
      <PerfectScrollbar className='overflow-y-auto'>
        {messages &&
          messages.map((m: any, i: any) => (
            <div className='flex items-center gap-x-[6px]' key={m._id}>
              {(isSameSender(messages, m, i, activeUser.id) || isLastMessage(messages, i, activeUser.id)) && (
                <div
                  style={{ display: 'flex', flexDirection: 'column' }}
                  title={m.sender.nickName || m.sender?.userName}
                >
                  <Avatar
                    alt={m.sender?.username}
                    sx={{ mt: 11, mr: 1, background: getInitialColor(m.sender?.username) }}
                    src={BASE_URL + m.sender?.userImg}
                  />
                  <Typography noWrap maxWidth={50}>
                    {m.sender?.nickName || m.sender?.userName}
                  </Typography>
                </div>
              )}
              <span
                className='tracking-wider text-[15px]  font-medium'
                style={{
                  backgroundColor: `${m.sender?._id === activeUser.id ? '#268d61' : '#f0f0f0'}`,
                  marginLeft: isSameSenderMargin(messages, m, i, activeUser.id),
                  marginTop: isSameUser(messages, m, i) ? 3 : 10,
                  borderRadius: `${m.sender?._id === activeUser.id ? '10px 10px 0px 10px' : '10px 10px 10px 0'}`,
                  padding: '10px 18px',
                  maxWidth: '460px',
                  color: `${m.sender?._id === activeUser.id ? '#ffff' : '#848587'}`
                }}
              >
                {m.message}
              </span>
            </div>
          ))}
      </PerfectScrollbar>
      {/* </ScrollableFeed> */}
    </>
  )
}

export default MessageHistory
