import EnrollmentView from '@/views/course/detail/enrollment'

const EnrollmentDetailApp = async ({ params }: { params: { courseId: string; organizationId: string } }) => {
  //Props
  const { courseId } = params

  return <EnrollmentView courseId={courseId} />
}

export default EnrollmentDetailApp
