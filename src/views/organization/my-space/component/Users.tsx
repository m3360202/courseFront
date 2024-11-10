'use client'

import UserAvatar from '@/components/user-avatar'
import { useOrganization } from '@/hooks/useOrganization'
import { PlatformUser, UserType } from '@/types/organization'
import { UserTable } from '@/types/user/UserTable'
import { Card, CardContent, CardHeader, Divider, Typography } from '@mui/material'
import { useState } from 'react'

const Users = ({ userType }: { userType: UserType }) => {
  //Hooks
  const { organization } = useOrganization()

  //States
  const [data] = useState<PlatformUser[] | undefined>(organization?.platformUsers?.filter(c => c.userType === userType))

  return (
    <Card className='bs-full'>
      <CardHeader title={`${userType === UserType.Teacher ? 'Instructors' : 'Students'} (${data?.length || 0})`} />
      <Divider />
      <div className='flex justify-between plb-4 pli-5 '>
        <Typography variant='overline'>Name</Typography>
      </div>
      <Divider />
      <CardContent className='flex flex-col gap-4 p-0'>
        {data?.slice(0, 5).map(user => (
          <div
            key={user._id}
            className={`p-4  hover:bg-actionHover`}
            onClick={() => {
              //push(getLocalizedUrl(`/course/${user._id}/detail`, locale as Locale))
            }}
          >
            <UserAvatar
              userImg={(user.userId as UserTable)?.userImg}
              name={(user.userId as UserTable)?.nickName || (user.userId as UserTable)?.username}
              email={(user.userId as UserTable)?.email}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default Users
