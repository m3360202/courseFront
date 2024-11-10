import { useUser } from '@/hooks/useGlobal'
import { useOrganization } from '@/hooks/useOrganization'
import { ArrangeType } from '@/types/course'
import CourseList from '@/views/course/list'

const CourseListView = () => {
  const { organizationId } = useOrganization()
  const user = useUser()

  return (
    <CourseList
      organizationId={organizationId}
      userId={user?._id}
      arrangeType={ArrangeType.instructorUserCourse}
      hiddenActions
    />
  )
}

export default CourseListView
