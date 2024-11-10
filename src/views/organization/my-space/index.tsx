'use client'

// React Imports
import { useEffect, useState } from 'react'
import type { ReactElement, SyntheticEvent } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'

// Component Imports
import Header from './component/Header'
import CustomTabList from '@core/components/mui/TabList'
import { useOrganizationManager, useOrganizationStudent, useOrganizationTeacher } from '@/hooks/useOrganization'

const MySpace = ({ tabContentList }: { tabContentList: { [key: string]: ReactElement } }) => {
  // States
  const [activeTab, setActiveTab] = useState<string>()

  //Hooks
  const isManager = useOrganizationManager()
  const isTeacher = useOrganizationTeacher()
  const isStudent = useOrganizationStudent()

  useEffect(() => {
    if (isManager) setActiveTab('courses')
    else if (isTeacher) setActiveTab('myAvailability')
    else if (isStudent) setActiveTab('joinedCourse')
  }, [isManager, isTeacher, isStudent])

  useEffect(() => {
    //setBackUrl([getLocalizedUrl(`/organization/${organizationId}/main`, locale as Locale)])

    return () => {
      //setBackUrl(null)
    }
  }, [])

  const handleChange = (event: SyntheticEvent, value: string) => {
    setActiveTab(value)
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Header />
      </Grid>
      {activeTab === undefined ? null : (
        <Grid item xs={12} className='flex flex-col gap-6'>
          <TabContext value={activeTab}>
            <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
              {isManager && (
                <Tab
                  label={
                    <div className='flex items-center gap-1.5'>
                      <i className='ri-stack-line'></i>
                      Courses
                    </div>
                  }
                  value='courses'
                />
              )}
              {isManager && (
                <Tab
                  label={
                    <div className='flex items-center gap-1.5'>
                      <i className='ri-group-line'></i>
                      Instructors
                    </div>
                  }
                  value='instructors'
                />
              )}
              {isManager && (
                <Tab
                  label={
                    <div className='flex items-center gap-1.5'>
                      <i className='ri-group-line'></i>
                      Students
                    </div>
                  }
                  value='students'
                />
              )}
              {isTeacher && (
                <Tab
                  label={
                    <div className='flex items-center gap-1.5'>
                      <i className='ri-time-line'></i>
                      Timetable
                    </div>
                  }
                  value='myAvailability'
                />
              )}
              {/* {isTeacher && (
                <Tab
                  label={
                    <div className='flex items-center gap-1.5'>
                      <i className='ri-presentation-line'></i>
                      My Expertise
                    </div>
                  }
                  value='myExpertise'
                />
              )} */}
              {isTeacher && (
                <Tab
                  label={
                    <div className='flex items-center gap-1.5'>
                      <i className='ri-pass-valid-line'></i>
                      Assigned Course
                    </div>
                  }
                  value='assignedCourse'
                />
              )}
              {isStudent && (
                <Tab
                  label={
                    <div className='flex items-center gap-1.5'>
                      <i className='ri-pass-pending-line'></i>
                      Joined Course
                    </div>
                  }
                  value='joinedCourse'
                />
              )}
              {isStudent && (
                <Tab
                  label={
                    <div className='flex items-center gap-1.5'>
                      <i className='ri-money-dollar-circle-line'></i>
                      Payment
                    </div>
                  }
                  value='payment'
                />
              )}
              {isStudent && (
                <Tab
                  label={
                    <div className='flex items-center gap-1.5'>
                      <i className='ri-user-settings-line'></i>
                      Signature
                    </div>
                  }
                  value='signature'
                />
              )}
              {isStudent && (
                <Tab
                  label={
                    <div className='flex items-center gap-1.5'>
                      <i className='ri-user-follow-line'></i>
                      Attendance
                    </div>
                  }
                  value='attendance'
                />
              )}
              {(isStudent || isTeacher) && (
                <Tab
                  label={
                    <div className='flex items-center gap-1.5'>
                      <i className='ri-history-line'></i>
                      History
                    </div>
                  }
                  value='history'
                />
              )}
            </CustomTabList>

            <TabPanel value={activeTab} className='p-0'>
              {tabContentList[activeTab]}
            </TabPanel>
          </TabContext>
        </Grid>
      )}
    </Grid>
  )
}

export default MySpace
