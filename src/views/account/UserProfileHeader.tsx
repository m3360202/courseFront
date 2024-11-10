// React Hooks Imports
import { useEffect, useState } from 'react'

// Nextjs Hooks Imports
import { useParams } from 'next/navigation'

// MUI Hooks Imports
import { useUser, useTeacher, useStudent } from '@/hooks/useGlobal'

// MUI Imports
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// Third-party Imports
import UserAvatar from '@/components/user-avatar'
import CustomChip from '@/components/chip'
import Contact from '@/components/buttons/Contact'

// Api Imports
import { getUserProfile } from '@/api/user/profile/getProfile'

// Types Imports
import { UserTable } from '@/types/user/UserTable'

const UserProfileHeader = () => {
  const user = useUser()
  const params = useParams()
  const userId = params.userId
  const isStudent = useStudent()
  const isTeacher = useTeacher()

  const [userProfile, setUserProfile] = useState<UserTable>()

  const GetRoleChip = () => {
    let label = ''
    if (isStudent) {
      label = 'student'
    }
    if (isTeacher) {
      label = 'tutor'
    }

    return (
      <CustomChip
        skin='light'
        size='small'
        label={label}
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
    )
  }

  const loadProfile = async () => {
    const result: any = await getUserProfile(user as UserTable, userId as string)
    setUserProfile(result.profile)
  }

  useEffect(() => {
    loadProfile()
  }, [userId])

  return (
    <Card>
      <CardMedia image={`/images/pages/profile-banner.png`} className='bs-[250px]' />
      <CardContent className='flex gap-6 justify-center flex-col items-center md:items-end md:flex-row !pt-0 md:justify-start'>
        <div className='flex rounded-bs-md mbs-[-45px] border-[5px] border-backgroundPaper bg-backgroundPaper'>
          <UserAvatar userImg={userProfile?.userImg} name={userProfile?.username} hiddenName={true} size={140} square />
        </div>
        <div className='flex is-full flex-wrap justify-center flex-col items-center sm:flex-row sm:justify-between sm:items-end gap-5'>
          <div className='flex flex-col items-center sm:items-start gap-2'>
            <Typography variant='h4'>{userProfile?.nickName || userProfile?.username}</Typography>
            <div className='flex flex-wrap gap-6 justify-center sm:justify-normal'>
              <div className='flex items-center gap-2'>
                <GetRoleChip />
              </div>
            </div>
          </div>
          <Contact contactUserId={userProfile?._id as string} />
        </div>
      </CardContent>
    </Card>
  )
}

export default UserProfileHeader
