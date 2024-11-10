import SaveAssignment from '@/views/course/detail/assignment/component/SaveAssignment'

const EditAssignmentApp = ({ params }: { params: { assignmentId: string } }) => (
  <SaveAssignment assignmentId={params.assignmentId} />
)

export default EditAssignmentApp
