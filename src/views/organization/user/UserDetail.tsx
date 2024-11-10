'use client'

import { ReactElement, SyntheticEvent, useEffect, useState } from 'react'
import { Card, Grid, Tab } from '@mui/material'
import { useOrganization } from '@/hooks/useOrganization'
import { OrganizationUser, UserType } from '@/types/organization'
import { getOrganizationUser } from '@/api/organization/user/getOrganizationUser'
import { useGlobal, useUser } from '@/hooks/useGlobal'
import { useParams } from 'next/navigation'
import Header from './component/Header'
import { TabContext, TabPanel } from '@mui/lab'
import CustomTabList from '@/@core/components/mui/TabList'
import dynamic from 'next/dynamic'
import { Locale } from '@/configs/i18n'
import { getLocalizedUrl } from '@/utils/i18n'
import { ArrangeType } from '@/types/course'
import { renderSchedule } from '../my-space/util'
import { UserTable } from '@/types/user/UserTable'

const InfoTab = dynamic(() => import('@views/organization/user/component/Info'))
const CoursesTab = dynamic(() => import('@views/course/list'))
const HistoryTab = dynamic(() => import('@/views/account/History'))
const GuardianTab = dynamic(() => import('@/views/account/Guardian'))
const PaymentTab = dynamic(() => import('@/views/account/PaymentList'))
const AttendanceTab = dynamic(() => import('./component/Attendance'))
const SurveysTab = dynamic(() => import('./component/Surveys'))
const SignedTab = dynamic(() => import('./component/SignedFiles'))

// Vars
const tabContentList = (
  user: UserTable | null,
  orgUser: OrganizationUser | undefined
): { [key: string]: ReactElement } => ({
  info: <InfoTab orgUser={orgUser} />,
  courses: (
    <CoursesTab
      userId={orgUser?.user?._id}
      organizationId={orgUser?.instructorId}
      arrangeType={ArrangeType.instructorUserCourse}
    />
  ),
  schedule: <Card>{renderSchedule(orgUser?.schedule, user)}</Card>,
  statistics: <HistoryTab userId={orgUser?.user?._id} organizationId={orgUser?.instructorId} />,
  parentAccount: <GuardianTab isParent isViewMode />,
  payment: <PaymentTab userId={orgUser?.user?._id} />,
  attendance: <AttendanceTab userId={orgUser?.user?._id as string} />,
  survey: <SurveysTab userId={orgUser?.user?._id as string} />,
  signature: <SignedTab userId={orgUser?.user?._id as string} />
})

const UserDetail = () => {
  //States
  const [data, setData] = useState<OrganizationUser>()
  const [activeTab, setActiveTab] = useState<string>('info')

  //Hooks
  const user = useUser()
  const { organizationId } = useOrganization()
  const { userId, lang } = useParams()
  const { setBackUrl, setTitle } = useGlobal()

  useEffect(() => {
    setBackUrl([
      getLocalizedUrl(`/organization/${organizationId}/detail/user/${data?.userType?.toLowerCase()}`, lang as Locale)
    ])
    setTitle('User Detail')

    return () => {
      setBackUrl([getLocalizedUrl(`/organization/${organizationId}/main`, lang as Locale)])
      setTitle('Personnel Management')
    }
  }, [data])

  useEffect(() => {
    const loadUser = async () => {
      if (user && organizationId && userId) {
        const { data: result } = await getOrganizationUser(user, organizationId, userId as string)
        result.userType = (result?.userType === UserType.PlatformAdmin
          ? 'Manager'
          : result?.userType === UserType.Student
            ? 'Student'
            : 'Instructor') as unknown as UserType
        setData(result)
      }
    }
    loadUser()
  }, [user, organizationId, userId])

  const handleChange = (event: SyntheticEvent, value: string) => {
    setActiveTab(value)
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Header orgUser={data} />
      </Grid>
      {activeTab === undefined ? null : (
        <Grid item xs={12} className='flex flex-col gap-6'>
          <TabContext value={activeTab}>
            <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
              <Tab label='Information' icon={<i className='ri-file-list-line' />} iconPosition='start' value='info' />
              <Tab
                label='Courses'
                icon={<i className='ri-graduation-cap-line' />}
                iconPosition='start'
                value='courses'
              />
              {(data?.userType as string) === 'Instructor' && (
                <Tab label='TimeTable' icon={<i className='ri-time-line' />} iconPosition='start' value='schedule' />
              )}
              <Tab
                label='Statistics'
                icon={<i className='ri-history-line' />}
                iconPosition='start'
                value='statistics'
              />
              {(data?.userType as string) === 'Student' && (
                <Tab
                  label='Parent Account'
                  icon={<i className='ri-user-line' />}
                  iconPosition='start'
                  value='parentAccount'
                />
              )}
              <Tab
                label='Enrollment Survey'
                icon={<i className='ri-survey-line' />}
                iconPosition='start'
                value='survey'
              />
              <Tab
                label='Payment'
                icon={<i className='ri-money-dollar-circle-line' />}
                iconPosition='start'
                value='payment'
              />
              <Tab
                label='Attendance'
                icon={<i className='ri-user-follow-line' />}
                iconPosition='start'
                value='attendance'
              />
              <Tab
                label='Signature'
                icon={<i className='ri-user-settings-line' />}
                iconPosition='start'
                value='signature'
              />
            </CustomTabList>

            <TabPanel value={activeTab} className='p-0'>
              {tabContentList(user, data)[activeTab]}
            </TabPanel>
          </TabContext>
        </Grid>
      )}
    </Grid>
  )
}

export default UserDetail
