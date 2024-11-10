import FormLayout from '@/components/layout/FormLayout'
import { DocumentType } from '@/types/document'
import QuizView from '@/views/course/detail/quiz/view'

const QuizViewApp = ({ params }: { params: { quizId: string; organizationId: string } }) => {
  //Props
  const { quizId, organizationId } = params

  return (
    <FormLayout>
      <QuizView quizId={quizId} documentType={DocumentType.Organization} organizationId={organizationId} />
    </FormLayout>
  )
}

export default QuizViewApp
