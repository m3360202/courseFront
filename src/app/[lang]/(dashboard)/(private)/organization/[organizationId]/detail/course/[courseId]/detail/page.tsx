import { getNextSession } from '@/api/course/getNextSession'
import { UserTable } from '@/types/user/UserTable'
import CourseView from '@/views/course/detail'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/libs/auth'

const CourseDetailApp = async ({ params }: { params: { courseId: string; organizationId: string } }) => {
  //Props
  const { courseId, organizationId } = params
  const session = await getServerSession(authOptions)
  const { data } = await getNextSession(session?.user as UserTable, courseId)

  return <CourseView courseId={courseId} nextSessionId={data?._id} isOrginazation={organizationId !== undefined} />
}

export default CourseDetailApp
