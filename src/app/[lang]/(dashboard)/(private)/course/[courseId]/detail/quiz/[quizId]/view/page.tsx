import ViewQuiz from '@/views/course/detail/quiz/view'

const ViewQuizApp = ({ params }: { params: { quizId: string } }) => <ViewQuiz quizId={params.quizId} />

export default ViewQuizApp
