'use client'

// React Imports
import { useState } from 'react'
import type { ReactElement, SyntheticEvent } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'

// Component Imports
import Header from './component/Header'
import CustomTabList from '@core/components/mui/TabList'
import { useOrganization } from '@/hooks/useOrganization'
import Courses from './component/courses'
import dynamic from 'next/dynamic'
import { useUser } from '@/hooks/useGlobal'

const CoursesTab = dynamic(() => import('@views/organization/main/component/courses'))
const TeachersTab = dynamic(() => import('@views/organization/main/component/teachers'))
const DescriptionTab = dynamic(() => import('@views/organization/main/component/description'))

// Vars
const tabContentList = (): { [key: string]: ReactElement } => ({
  desc: <DescriptionTab />,
  courses: <CoursesTab />,
  teachers: <TeachersTab />

})


const MainView = () => {
  // States
  const [activeTab, setActiveTab] = useState('desc')

  //Hooks
  const { viewAllCourse } = useOrganization()
  const user = useUser()

  const handleChange = (event: SyntheticEvent, value: string) => {
    setActiveTab(value)
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Header />
      </Grid>

      <Grid item xs={12} className='flex flex-col gap-6'>
        {activeTab === undefined || viewAllCourse ? null : (
          <TabContext value={activeTab}>
            <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
              <Tab
                label={
                  <div className='flex items-center gap-1.5'>
                    <i className='ri-file-list-line'></i>
                    About Us
                  </div>
                }
                value='desc'
              />
              <Tab
                label={
                  <div className='flex items-center gap-1.5'>
                    <i className='ri-stack-line'></i>
                    Courses
                  </div>
                }
                value='courses'
              />
              {user && <Tab
                label={
                  <div className='flex items-center gap-1.5'>
                    <i className='ri-group-line'></i>
                    Teachers
                  </div>
                }
                value='teachers'
              />}
            </CustomTabList>

            <TabPanel value={activeTab} className='p-0'>
              {tabContentList()[activeTab]}
            </TabPanel>
          </TabContext>
        )}
        {viewAllCourse && <Courses />}
      </Grid>
    </Grid>
  )
}

export default MainView
