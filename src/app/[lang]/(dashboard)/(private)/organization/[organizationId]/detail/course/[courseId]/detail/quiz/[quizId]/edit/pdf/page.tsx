import SavePDFQuiz from '@/views/course/detail/quiz/component/SavePDFQuiz'

const EditQuizApp = ({ params }: { params: { quizId: string } }) => <SavePDFQuiz quizId={params.quizId} />

export default EditQuizApp
