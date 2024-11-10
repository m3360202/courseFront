'use client'

// React Imports
import { useState } from 'react'
import type { SyntheticEvent, ReactElement } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import Typography from '@mui/material/Typography'

// Component Imports
import CustomTabList from '@core/components/mui/TabList'

const Settings = ({ tabContentList }: { tabContentList: { [key: string]: ReactElement } }) => {
  // States
  const [activeTab, setActiveTab] = useState('info')

  const handleChange = (event: SyntheticEvent, value: string) => {
    setActiveTab(value)
  }

  return (
    <TabContext value={activeTab}>
      <Grid container spacing={6}>
        <Grid item xs={12} md={4}>
          <Typography variant='h5' className='mbe-4'>
            Settings
          </Typography>
          <CustomTabList orientation='vertical' onChange={handleChange} className='is-full' pill='true'>
            <Tab
              label='Banners'
              icon={<i className='ri-store-2-line' />}
              iconPosition='start'
              value='info'
              className='flex-row justify-start !min-is-full'
            />
            <Tab
              label='Buttons'
              icon={<i className='ri-bank-card-line' />}
              iconPosition='start'
              value='actions'
              className='flex-row justify-start !min-is-full'
            />
            <Tab
              label='Course List'
              icon={<i className='ri-shopping-cart-line' />}
              iconPosition='start'
              value='course'
              className='flex-row justify-start !min-is-full'
            />
            <Tab
              label='Instructor List'
              icon={<i className='ri-car-line' />}
              iconPosition='start'
              value='teacher'
              className='flex-row justify-start !min-is-full'
            />
            <Tab
              label='About Us'
              icon={<i className='ri-map-pin-2-line' />}
              iconPosition='start'
              value='desc'
              className='flex-row justify-start !min-is-full'
            />
          </CustomTabList>
        </Grid>
        <Grid item xs={12} md={8}>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <TabPanel value={activeTab} className='p-0'>
                {tabContentList[activeTab]}
              </TabPanel>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </TabContext>
  )
}

export default Settings
