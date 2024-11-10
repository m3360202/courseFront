'use client'

import Box from '@mui/material/Box'
import LinkTab from '@/@core/components/mui/LinkTab'
import CustomTabList from '@/@core/components/mui/TabList'
import { useCourse } from '@/hooks/useCourse'
import { Orientation, TabItem } from '@/types'
import TabContext from '@mui/lab/TabContext'
import { Grid, Typography } from '@mui/material'
import { SyntheticEvent, useEffect, useState } from 'react'
import UserAvatar from '../user-avatar'
import Tooltip from '@mui/material/Tooltip'

interface Props {
  title: string
  userImg: string | undefined
  name: string | undefined
  orientation: Orientation
  items: TabItem[]
  targetHref?: string
}


const CustomTabs = ({ title, userImg, name, orientation, items, targetHref }: Props) => {
  //Hooks

  // States
  const [activeTab, setActiveTab] = useState(0)

  //Hooks
  const { loading } = useCourse()

  useEffect(() => {
    setActiveTab(items.findIndex(c => c.href === targetHref))
  }, [targetHref])

  const handleChange = (event: SyntheticEvent, value: number) => {
    setActiveTab(value)
  }

  return (
    <TabContext value={activeTab}>
      <Grid container spacing={6} pt={0} sx={{ width: '100%' }}>
        <Grid item xs={12}>
          <Box className='flex items-center mb-2'>
            <UserAvatar userImg={userImg} name={name} hiddenName />
            <Box className='w-full flex items-left flex-col justify-start ml-4 '>
              <Tooltip title={title}>
                <Typography
                  variant='h5'
                  className='truncate-text'
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '80%',
                  }}
                >
                  {loading ? 'Skeleton loading...' : title}
                </Typography>

              </Tooltip>
              <Typography className='text-sm'>{name}</Typography>
            </Box>
          </Box>
          <CustomTabList orientation={orientation} onChange={handleChange} className='is-full' pill='true'>
            {items.map(
              tab =>
                //   <Tab
                //     label='Store Details'
                //     icon={<i className='ri-store-2-line' />}
                //     iconPosition='start'
                //     value='store-details'
                //     className='flex-row justify-start !min-is-full'
                //   />
                !tab.hidden && <LinkTab key={tab.label} label={tab.label} href={tab.href} icon={tab.icon} />
            )}
          </CustomTabList>
        </Grid>
        {/* <Grid item xs={12} md={8}>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <TabPanel value={activeTab} className='p-0'>

              </TabPanel>
            </Grid>
          </Grid>
        </Grid> */}
      </Grid>
    </TabContext>
  )
}

export default CustomTabs
