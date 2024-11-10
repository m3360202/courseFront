import SaveCourse from '@/views/course/component/SaveCourse'

const EditCourseApp = ({ params }: { params: { courseId: string; organizationId?: string } }) => (
  <SaveCourse courseId={params.courseId} organizationId={params.organizationId} />
)

export default EditCourseApp
