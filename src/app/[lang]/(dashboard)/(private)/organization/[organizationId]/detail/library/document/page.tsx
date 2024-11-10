import { DocumentType } from '@/types/document'
import Document from '@/views/course/detail/document'

const DocumentApp = ({ params }: { params: { organizationId: string } }) => {
  //Props
  const { organizationId } = params

  return <Document documentType={DocumentType.Organization} organizationId={organizationId} />
}

export default DocumentApp
