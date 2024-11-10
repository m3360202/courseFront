'use client'

import { useGlobal } from '@/hooks/useGlobal'
import { useOrganizationManager } from '@/hooks/useOrganization'
import CourseList from '@views/course/list'
import { useEffect } from 'react'

const CourseListApp = ({ params }: { params: { organizationId: string; lang: string } }) => {
  //Props
  const { organizationId } = params
  //Hooks
  const { setBackUrl, setTitle } = useGlobal()
  const isManager = useOrganizationManager()

  useEffect(() => {
    //setBackUrl([getLocalizedUrl(`/organization/${organizationId}/main`, lang as Locale, true)])
    setTitle('Course Management')

    return () => {
      setBackUrl(null)
      setTitle('')
    }
  }, [])

  // Vars
  return <CourseList organizationId={organizationId} isManager={isManager} />
}

export default CourseListApp
