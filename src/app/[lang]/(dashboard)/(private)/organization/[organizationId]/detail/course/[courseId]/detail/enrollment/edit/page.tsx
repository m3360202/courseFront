import SaveEnrollment from '@/views/course/detail/enrollment/SaveEnrollment'

const EnrollmentEditApp = async ({ params }: { params: { courseId: string; organizationId: string } }) => {
  //Props
  const { courseId, organizationId } = params

  return <SaveEnrollment courseId={courseId} organizationId={organizationId} />
}

export default EnrollmentEditApp
