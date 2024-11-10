import { DocumentType } from '@/types/document'
import QuizList from '@/views/course/detail/quiz'

const QuizApp = ({ params }: { params: { organizationId: string } }) => {
  //Props
  const { organizationId } = params

  return <QuizList organizationId={organizationId} documentType={DocumentType.Organization} />
}

export default QuizApp
