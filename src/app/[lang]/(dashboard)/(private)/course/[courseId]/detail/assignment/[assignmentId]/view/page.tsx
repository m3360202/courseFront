import ViewAssignment from '@/views/course/detail/assignment/view'

const AssignmentView = ({ params }: { params: { assignmentId: string } }) => (
  <ViewAssignment assignmentId={params.assignmentId} />
)

export default AssignmentView
