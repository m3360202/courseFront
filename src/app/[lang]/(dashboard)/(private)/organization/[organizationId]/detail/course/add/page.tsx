import SaveCourse from '@/views/course/component/SaveCourse'

const AddCourseApp = ({ params }: { params: { organizationId: string } }) => (
  <SaveCourse organizationId={params.organizationId} />
)

export default AddCourseApp
