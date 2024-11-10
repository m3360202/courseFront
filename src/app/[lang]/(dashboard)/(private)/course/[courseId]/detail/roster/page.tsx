'use client'

import { getOrganization } from '@/api/organization/getOrganization'
import { useCourse } from '@/hooks/useCourse'
import { useUser } from '@/hooks/useGlobal'
import { Organization } from '@/types/organization'
// import { useEditCourseRole } from '@/hooks/useCourse'
import RosterList from '@/views/course/detail/roster'
import { useEffect, useState } from 'react'
// import { useParams, useRouter } from 'next/navigation'

const RoseterApp = () => {
  //States
  const [organization, setOrganization] = useState<Organization>()

  //Hooks
  const { course } = useCourse()
  const user = useUser()

  useEffect(() => {
    const loadOrganization = async () => {
      if (course && user && course.instructorId) {
        const { data } = await getOrganization(user, course.instructorId)
        setOrganization(data)
      }
    }
    loadOrganization()
  }, [course, user])

  return <RosterList organization={organization} />
}

export default RoseterApp
