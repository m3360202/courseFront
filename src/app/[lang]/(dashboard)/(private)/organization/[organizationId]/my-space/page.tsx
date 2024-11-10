'use client'

import { Locale } from '@/configs/i18n'
import { useGlobal, useUser } from '@/hooks/useGlobal'
import { UserType } from '@/types/organization'
import { getLocalizedUrl } from '@/utils/i18n'
import MySpace from '@/views/organization/my-space'
import dynamic from 'next/dynamic'
import { ReactElement, useEffect } from 'react'

const CoursesTab = dynamic(() => import('@views/organization/my-space/component/Courses'))
const UsersTab = dynamic(() => import('@/views/organization/my-space/component/Users'))
const AvailabilityTab = dynamic(() => import('@/views/organization/my-space/component/Availability'))
const ExpertiseTab = dynamic(() => import('@/views/organization/my-space/component/Expertise'))
const AssignedCourseTab = dynamic(() => import('@/views/organization/my-space/component/CourseList'))
const JoinedCourseTab = dynamic(() => import('@/views/organization/my-space/component/CourseList'))
const PaymentTab = dynamic(() => import('@/views/account/PaymentList'))
const SurveysTab = dynamic(() => import('@/views/organization/user/component/Surveys'))
const SignatureTab = dynamic(() => import('@/views/organization/user/component/SignedFiles'))
const AttendanceTab = dynamic(() => import('@/views/organization/user/component/Attendance'))
const HistoryTab = dynamic(() => import('@/views/account/History'))

// Vars
const tabContentList = (userId: string, organizationId: string): { [key: string]: ReactElement } => ({
  courses: <CoursesTab />,
  instructors: <UsersTab userType={UserType.Teacher} />,
  students: <UsersTab userType={UserType.Student} />,
  myAvailability: (
    <div className='flex flex-col gap-4'>
      <AvailabilityTab /> <ExpertiseTab />
    </div>
  ),
  // myExpertise: <ExpertiseTab />,
  assignedCourse: <AssignedCourseTab />,
  joinedCourse: <JoinedCourseTab />,
  payment: <PaymentTab />,
  survey: <SurveysTab userId={userId} />,
  signature: <SignatureTab userId={userId} />,
  attendance: <AttendanceTab userId={userId} />,
  history: <HistoryTab userId={userId} organizationId={organizationId} />
})

const MySpaceApp = ({ params }: { params: { organizationId: string; lang: string } }) => {
  //Props
  const { lang, organizationId } = params
  //Hooks
  const { setBackUrl, setTitle } = useGlobal()
  const user = useUser()

  useEffect(() => {
    setBackUrl([getLocalizedUrl(`/organization/home`, lang as Locale, true)])
    setTitle('My space')

    return () => {
      setBackUrl(null)
      setTitle('')
    }
  }, [lang, organizationId])

  if (!user) return null

  return <MySpace tabContentList={tabContentList(user._id, organizationId)} />
}

export default MySpaceApp
