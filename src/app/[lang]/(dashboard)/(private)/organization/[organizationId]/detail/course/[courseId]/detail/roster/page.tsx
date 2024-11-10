'use client'

// import { useEditCourseRole } from '@/hooks/useCourse'
import { useOrganization } from '@/hooks/useOrganization'
import RosterList from '@/views/course/detail/roster'
// import { useParams, useRouter } from 'next/navigation'

const RoseterApp = () => {
  //Hooks
  // const editCourseRole = useEditCourseRole()
  // const { replace } = useRouter()
  // const { lang: locale } = useParams()
  const { organization } = useOrganization()
  // if (!editCourseRole) replace(`/${locale}/pages/misc/401-not-authorized`)
  // else return <RosterList />
  
  return <RosterList organization={organization} />
}

export default RoseterApp
