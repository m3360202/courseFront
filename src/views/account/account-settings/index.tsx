'use client'

// React Imports
import { useState } from 'react'
import type { SyntheticEvent} from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'

// Component Imports
import CustomTabList from '@core/components/mui/TabList'

// Next Imports
import dynamic from 'next/dynamic'

// Hooks Imports
import { useUser } from '@/hooks/useGlobal'

// Types Imports
import { DocumentType } from '@/types/document'

const AccountTab = dynamic(() => import('@views/account/account-settings/account'))
const SecurityTab = dynamic(() => import('@views/account/security'))
const HistoryTab = dynamic(() => import('@views/account/History'))
const DocumentsTab = dynamic(() => import('@views/course/detail/document'))
const GuardianTab = dynamic(() => import('@views/account/Guardian'))
const PaymentTab = dynamic(() => import('@views/account/PaymentList'))

const AccountSettings = () => {
  //Hooks
  const user = useUser()

  // States
  const [activeTab, setActiveTab] = useState('account')
  const userId = user?._id ?? ''

  const handleChange = (event: SyntheticEvent, value: string) => {
    setActiveTab(value)
  }

  return (
    <TabContext value={activeTab}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
            <Tab label='Account' icon={<i className='ri-group-line' />} iconPosition='start' value='account' />
            <Tab label='Security' icon={<i className='ri-lock-unlock-line' />} iconPosition='start' value='security' />
            <Tab label='History' icon={<i className='ri-history-line' />} iconPosition='start' value='history' />
            <Tab
              label='Documents'
              icon={<i className='ri-folder-line' />}
              iconPosition='start'
              value='documents'
            />
            <Tab
              label='Guardian'
              icon={<i className='ri-user-line' />}
              iconPosition='start'
              value='guardian'
            />
            <Tab label='Payment' icon={<i className='ri-money-dollar-circle-line' />} iconPosition='start' value='payment' />
          </CustomTabList>
        </Grid>
        <Grid item xs={12}>
          <TabPanel value='account' className='p-0'>
            <AccountTab />
          </TabPanel>
          <TabPanel value='security' className='p-0'>
            <SecurityTab />
          </TabPanel>
          <TabPanel value='history' className='p-0'>
            <HistoryTab />
          </TabPanel>
          <TabPanel value='documents' className='p-0'>
            <DocumentsTab userId={userId} documentType={DocumentType.Person} />
          </TabPanel>
          <TabPanel value='guardian' className='p-0'>
          <GuardianTab />
          </TabPanel>
          <TabPanel value='payment' className='p-0'>
          <PaymentTab />
          </TabPanel>
        </Grid>
      </Grid>
    </TabContext>
  )
}

export default AccountSettings
