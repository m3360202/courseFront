'use client'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

import CustomChip from '@components/chip'

import { DetailItem } from '@/types'
import { Button, Divider, Skeleton } from '@mui/material'
import { useEffect, useState } from 'react'
// import { setReload, setSocketIO } from 'src/store/global'
// import Actions from './Actions'
import { useTeacher, useUser } from '@/hooks/useGlobal'
import { usePathname } from 'next/navigation'
import { UserTable } from '@/types/user/UserTable'
import UserAvatar from '@components/user-avatar'
import DataList from '@components/detail-list'
import CourseContext from '@/contexts/CourseProvider/CourseContext'
// import { default as socketIOClient } from 'socket.io-client'

const UserInfo = () => {
  const pathname = usePathname()
  // const { replace } = useRouter()
  let id = pathname.split('/account/')[1]
  if (id?.includes('/')) {
    id = id.slice(0, -1)
  }
  if (id === 'undefined') {
    id = ''
  }
  const [user, setUser] = useState<UserTable | null>(null)
  const currentUser = useUser()

  const teacher = useTeacher()

  useEffect(() => {
    const loadProfile = async () => {
      if (pathname === '/account/[id]') {
        // const { data } = await runAsync()
        // setUser(data || null)
      } else {
        setUser(currentUser)
      }
    }
    loadProfile()
  }, [currentUser])

  const items: DetailItem[] = [
    {
      title: 'UserName',
      value: user?.username,
      col: 1,
      hidden: !user?.username
    },
    {
      title: 'Email',
      value: user?.email,
      col: 1,
      hidden: !user?.email
    },
    {
      title: 'User ID',
      value: user?.code,
      col: 1,
      copy: true,
      hidden: !user?.code
    },
    {
      title: 'NickName',
      value: user?.nickName,
      col: 1,
      hidden: !user?.nickName
    },
    {
      title: 'State',
      value: user?.address?.state,
      col: 1,
      hidden: !user?.address?.state
    },
    {
      title: 'City',
      value: user?.address?.city,
      col: 1,
      hidden: !user?.address?.city
    },
    {
      title: 'Phone',
      value: user?.personal?.phone,
      col: 1,
      hidden: !user?.personal?.phone
    },
    {
      title: 'Fax',
      value: user?.personal?.fax,
      col: 1,
      hidden: !user?.personal?.fax
    },
    {
      title: 'Website',
      value: user?.website,
      col: 1,
      hidden: !user?.website
    },
    {
      title: 'Bio',
      value: user?.bio,
      col: 1,
      hidden: !user?.bio
    }
  ]

  // const sendMessage = async (contactUserId: string) => {
  //   await acessCreate(currentUser, { userId: contactUserId })
  //   dispatch(fetchChats())
  //   replace('/message')
  // }
  const isAccount = pathname === '/account'

  const loading = !user

  const skeletonLoading = <Skeleton width={62} height={108} />

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardContent
            sx={{
              paddingTop: 15,
              display: 'flex',
              gap: 4,
              justifyContent: isAccount ? 'space-between' : 'center',
              alignItems: 'center',
              flexDirection: isAccount ? 'row' : 'column',
              bgcolor: 'grey.50'
            }}
          >
            <Box display={'flex'} gap={2} flexDirection='column' justifyContent={'center'} alignItems={'center'}>
              {loading ? (
                skeletonLoading
              ) : (
                <>
                  <UserAvatar userImg={user?.userImg} name={user?.name} hiddenName size={50} />
                  <Typography variant='h6' fontWeight={'bold'}>
                    {user?.nickName || user?.username}
                  </Typography>
                  {teacher && (
                    <CustomChip
                      skin='light'
                      size='small'
                      label={'tutor '}
                      color={'primary'}
                      sx={{
                        height: 20,
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        borderRadius: '5px',
                        textTransform: 'capitalize',
                        '& .MuiChip-label': { mt: -0.25 }
                      }}
                    />
                  )}
                  {id && currentUser && currentUser._id !== id && (
                    <Button
                      variant='outlined'
                      onClick={async () => {
                        // await sendMessage(id as string)
                      }}
                    >
                      Message
                    </Button>
                  )}
                  {isAccount && <Box>{/*<Actions />*/}</Box>}
                </>
              )}
            </Box>
          </CardContent>
          <Divider />
          <CardContent>
            {/*@ts-ignore*/}
            <CourseContext.Provider value={{ loading }}>
              <DataList items={items} />
            </CourseContext.Provider>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default UserInfo
