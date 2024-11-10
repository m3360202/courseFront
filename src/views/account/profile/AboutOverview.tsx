'use client'

// React Hooks Imports
import { useEffect, useState } from 'react'

// Nextjs Hooks Imports
import { useParams } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
import type { ProfileTeamsType, ProfileCommonType } from '@/types/pages/profileTypes'

// Hooks Imports
import { useUser } from '@/hooks/useGlobal'

// Api Imports
import { getUserProfile } from '@/api/user/profile/getProfile'

// Types Imports
import { UserTable } from '@/types/user/UserTable'

const renderList = (list: ProfileCommonType[]) => {
  return (
    list.length > 0 &&
    list.map((item, index) => {
      return (
        <div key={index} className='flex items-center gap-2'>
          <i className={classnames(item.icon, 'text-textSecondary')} />
          <div className='flex items-center flex-wrap gap-2'>
            <Typography className='font-medium'>
              {`${item.property.charAt(0).toUpperCase() + item.property.slice(1)}:`}
            </Typography>
            <Typography>{item.value.charAt(0).toUpperCase() + item.value.slice(1)}</Typography>
          </div>
        </div>
      )
    })
  )
}

const renderBio = (teams: ProfileTeamsType[]) => {
  return (
    teams.length > 0 &&
    teams.map((item, index) => {
      return (
        <div key={index} className='flex items-center flex-wrap gap-2'>
          <Typography className='font-medium'>
            {item.property.charAt(0).toUpperCase() + item.property.slice(1)}
          </Typography>
          <Typography>{item.value.charAt(0).toUpperCase() + item.value.slice(1)}</Typography>
        </div>
      )
    })
  )
}

export default function AboutOverview() {
  const user = useUser()
  const params = useParams()
  const userId = params.userId

  const [userProfile, setUserProfile] = useState<UserTable>()

  const loadProfile = async () => {
    const result: any = await getUserProfile(user as UserTable, userId as string)
    setUserProfile(result.profile)
  }

  useEffect(() => {
    loadProfile()
  }, [userId])

  const emptyTitle = 'User did not provide information'

  const dataProfile = {
    about: [
      { property: 'User Name', value: userProfile?.username ?? emptyTitle, icon: 'ri-user-3-line' },
      { property: 'Nick Name', value: userProfile?.nickName ?? emptyTitle, icon: 'ri-user-2-line' },
      { property: 'State', value: userProfile?.address?.state ?? emptyTitle, icon: 'ri-map-pin-line' },
      { property: 'City', value: userProfile?.address?.city ?? emptyTitle, icon: 'ri-building-line' }
    ],
    contacts: [
      { property: 'Phone', value: userProfile?.personal?.phone ?? emptyTitle, icon: 'ri-phone-line' },
      { property: 'Fax', value: userProfile?.personal?.fax ?? emptyTitle, icon: 'ri-mail-line' },
      { property: 'Website', value: userProfile?.website ?? emptyTitle, icon: 'ri-pages-line' }
    ],
    bio: [
      { property: 'BIo', value: userProfile?.bio ?? emptyTitle },
    ]
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardContent className='flex flex-col gap-6'>
            <div className='flex flex-col gap-4'>
              <Typography variant='caption' className='uppercase'>
                About
              </Typography>
              {dataProfile?.about && renderList(dataProfile?.about)}
            </div>
            <div className='flex flex-col gap-4'>
              <Typography variant='caption' className='uppercase'>
                Contact
              </Typography>
              {dataProfile?.contacts && renderList(dataProfile?.contacts)}
            </div>
            <div className='flex flex-col gap-4'>
              <Typography variant='caption' className='uppercase'>
                Bio
              </Typography>
              {dataProfile?.bio && renderBio(dataProfile?.bio)}
            </div>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
