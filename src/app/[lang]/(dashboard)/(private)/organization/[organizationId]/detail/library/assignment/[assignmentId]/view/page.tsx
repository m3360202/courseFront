import FormLayout from '@/components/layout/FormLayout'
import { DocumentType } from '@/types/document'
import AssignmentView from '@/views/course/detail/assignment/view'

const AssignmentViewApp = ({ params }: { params: { assignmentId: string; organizationId: string } }) => {
  //Props
  const { assignmentId, organizationId } = params

  return (
    <FormLayout>
      <AssignmentView
        assignmentId={assignmentId}
        documentType={DocumentType.Organization}
        organizationId={organizationId}
      />
    </FormLayout>
  )
}

export default AssignmentViewApp
