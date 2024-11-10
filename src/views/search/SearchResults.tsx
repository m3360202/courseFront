'use client'

import React, { useState } from 'react'
import { Box, Tab } from '@mui/material'
import SearchInput from './SearchInput'
import { useFormContext, SubmitHandler } from 'react-hook-form'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import CustomTabList from '@core/components/mui/TabList'
import CoursesList from './CoursesList'
import OrganizationsList from './OrganizationsList'
import { Organization } from '@/types/organization'
import { Course } from '@/types/course'

interface SearchResultsProps {
  courses: Course[]
  organizations: Organization[]
  onSearch: SubmitHandler<any>
}

const SearchResults: React.FC<SearchResultsProps> = ({ courses, organizations, onSearch }) => {
  const { handleSubmit } = useFormContext()

  const [activeTab, setActiveTab] = useState('courses')

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue)
  }

  return (
    <Box sx={{ height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 10 }}>
        <Box component='form' onSubmit={handleSubmit(onSearch)}>
          <SearchInput onSearch={onSearch} />
        </Box>
      </Box>

      <TabContext value={activeTab}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: 3 }}>
          <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
            <Tab icon={<i className='ri-user-3-line' />} iconPosition='start' label='Courses' value='courses' />
            <Tab
              icon={<i className='ri-organization-chart' />}
              iconPosition='start'
              label='Organizations'
              value='organizations'
            />
          </CustomTabList>
        </Box>

        <TabPanel value='courses'>
          <CoursesList courses={courses} />
        </TabPanel>

        <TabPanel value='organizations'>
          <OrganizationsList organizations={organizations} />
        </TabPanel>
      </TabContext>
    </Box>
  )
}

export default SearchResults
