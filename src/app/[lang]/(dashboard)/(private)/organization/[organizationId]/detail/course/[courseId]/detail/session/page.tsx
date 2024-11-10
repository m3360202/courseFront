'use client'

import { useOrganizationManager } from '@/hooks/useOrganization'
import CourseSession from '@/views/course/detail/session'

const CourseSessionApp = () => {
  const isManager = useOrganizationManager()

  return <CourseSession isManager={isManager} />
}

export default CourseSessionApp
