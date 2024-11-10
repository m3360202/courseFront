import { DocumentType } from '@/types/document'
import AssignmentList from '@/views/course/detail/assignment'

const AssignmentApp = ({ params }: { params: { organizationId: string } }) => {
  //Props
  const { organizationId } = params

  return <AssignmentList organizationId={organizationId} documentType={DocumentType.Organization} />
}

export default AssignmentApp
